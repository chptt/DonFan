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
    if (typeof window.ethereum === 'undefined') {
      alert('Please install MetaMask to use this app');
      return;
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
      className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 min-h-[44px]"
    >
      {isConnecting ? 'Connecting...' : account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Connect Wallet'}
    </button>
  );
}
