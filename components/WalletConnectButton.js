'use client';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { SEPOLIA_CHAIN_ID } from '@/lib/contract';

export default function WalletConnectButton({ onConnect }) {
  const [account, setAccount] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    checkConnection();
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', () => window.location.reload());
    }
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  const checkConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
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
    }
  };

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      setAccount(null);
    } else {
      setAccount(accounts[0]);
      window.location.reload();
    }
  };

  const connectWallet = async () => {
    // Check if we're on mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (typeof window.ethereum === 'undefined') {
      if (isMobile) {
        // On mobile, redirect to MetaMask app with deep link
        const currentUrl = window.location.href;
        const metamaskAppDeepLink = `https://metamask.app.link/dapp/${currentUrl.replace(/^https?:\/\//, '')}`;
        window.location.href = metamaskAppDeepLink;
        return;
      } else {
        // On desktop, show install message
        alert('Please install MetaMask browser extension to use this app.\n\nVisit: https://metamask.io/download/');
        window.open('https://metamask.io/download/', '_blank');
        return;
      }
    }

    setIsConnecting(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      
      const network = await provider.getNetwork();
      if (network.chainId.toString() !== '11155111') {
        await switchToSepolia();
      }

      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setAccount(address);
      onConnect?.(provider, signer, address);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const switchToSepolia = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      });
    } catch (error) {
      if (error.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: SEPOLIA_CHAIN_ID,
            chainName: 'Sepolia Testnet',
            nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
            rpcUrls: ['https://sepolia.infura.io/v3/'],
            blockExplorerUrls: ['https://sepolia.etherscan.io']
          }]
        });
      }
    }
  };

  return (
    <button
      onClick={connectWallet}
      disabled={isConnecting || account}
      className="px-6 py-3 bg-slate-700 text-white rounded-lg font-medium hover:bg-slate-800 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 min-h-[44px]"
    >
      {isConnecting ? 'Connecting...' : account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Connect Wallet'}
    </button>
  );
}

