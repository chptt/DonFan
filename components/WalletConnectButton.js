'use client';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { SEPOLIA_CHAIN_ID, SEPOLIA_CHAIN_ID_DECIMAL } from '@/lib/contract';

/**
 * Resolve the best EIP-1193 provider from window.ethereum.
 *
 * Some users have multiple wallet extensions installed. In that case browsers
 * expose window.ethereum.providers (an array). We prefer MetaMask; if it's not
 * present we take the first provider in the array.  When there is no array we
 * use window.ethereum directly — but only after confirming it has an `.on`
 * method, so a partial / non-standard injected object doesn't crash the page.
 *
 * Returns undefined when no usable provider is found.
 */
function resolveInjectedProvider() {
  if (typeof window === 'undefined') return undefined;

  const eth = window.ethereum;
  if (!eth) return undefined;

  // Multiple wallets case: window.ethereum.providers is an array
  if (Array.isArray(eth.providers) && eth.providers.length > 0) {
    const mm = eth.providers.find((p) => p.isMetaMask);
    return mm ?? eth.providers[0];
  }

  // Single wallet — validate it is a real EIP-1193 provider
  if (typeof eth.request === 'function') return eth;

  return undefined;
}

export default function WalletConnectButton({ onConnect }) {
  const [account, setAccount] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    checkConnection();

    const provider = resolveInjectedProvider();
    if (!provider || typeof provider.on !== 'function') return;

    provider.on('accountsChanged', handleAccountsChanged);
    provider.on('chainChanged', handleChainChanged);

    return () => {
      if (typeof provider.removeListener === 'function') {
        provider.removeListener('accountsChanged', handleAccountsChanged);
        provider.removeListener('chainChanged', handleChainChanged);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Stable handler references so removeListener can match them
  function handleChainChanged() {
    window.location.reload();
  }

  function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
      setAccount(null);
    } else {
      setAccount(accounts[0]);
      window.location.reload();
    }
  }

  const checkConnection = async () => {
    const injected = resolveInjectedProvider();
    if (!injected) return;

    try {
      const provider = new ethers.BrowserProvider(injected);
      const accounts = await provider.listAccounts();
      if (accounts.length > 0) {
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);
        onConnect?.(provider, signer, address);
      }
    } catch (error) {
      console.error('Error checking connection:', error);
    }
  };

  const connectWallet = async () => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const injected = resolveInjectedProvider();

    if (!injected) {
      if (isMobile) {
        const currentUrl = window.location.href;
        const deepLink = `https://metamask.app.link/dapp/${currentUrl.replace(/^https?:\/\//, '')}`;
        window.location.href = deepLink;
        return;
      }
      alert('Please install MetaMask browser extension to use this app.\n\nVisit: https://metamask.io/download/');
      window.open('https://metamask.io/download/', '_blank');
      return;
    }

    setIsConnecting(true);
    try {
      const provider = new ethers.BrowserProvider(injected);
      await provider.send('eth_requestAccounts', []);

      const network = await provider.getNetwork();
      if (Number(network.chainId) !== SEPOLIA_CHAIN_ID_DECIMAL) {
        await switchToSepolia(injected);
      }

      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setAccount(address);
      onConnect?.(provider, signer, address);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      if (error.code === 4001) {
        // User rejected
      } else {
        alert('Failed to connect wallet. Please try again.');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const switchToSepolia = async (injected) => {
    try {
      await injected.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        // Chain not added yet — add it
        await injected.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: SEPOLIA_CHAIN_ID,
            chainName: 'Sepolia Testnet',
            nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
            rpcUrls: ['https://rpc.sepolia.org'],
            blockExplorerUrls: ['https://sepolia.etherscan.io']
          }]
        });
      } else if (switchError.code === 4001) {
        // User declined the switch
        throw new Error(
          'Please switch to the Sepolia testnet in your wallet to use this app.'
        );
      } else {
        throw switchError;
      }
    }
  };

  return (
    <button
      onClick={connectWallet}
      disabled={isConnecting || !!account}
      className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 min-h-[44px]"
    >
      {isConnecting
        ? 'Connecting...'
        : account
          ? `${account.slice(0, 6)}...${account.slice(-4)}`
          : 'Connect Wallet'}
    </button>
  );
}
