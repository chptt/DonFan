'use client';
import { useState } from 'react';
import Link from 'next/link';
import WalletConnectButton from '@/components/WalletConnectButton';

export default function MyContributions() {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);

  const handleWalletConnect = (p, s, a) => {
    setProvider(p);
    setAccount(a);
  };

  if (!account) {
    return (
      <div className="min-h-screen relative">
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <Link href="/">
              <div className="flex items-center space-x-2 cursor-pointer group">
                <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center group-hover:bg-emerald-700 transition-colors shadow-lg">
                  <span className="text-white font-bold text-xl">D</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                  DonFan
                </h1>
              </div>
            </Link>
            <WalletConnectButton onConnect={handleWalletConnect} />
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200 p-12">
            <div className="mb-6 flex justify-center">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Connect Your Wallet</h2>
            <p className="text-gray-600 mb-8">
              Please connect your wallet to view your donation history
            </p>
            <WalletConnectButton onConnect={handleWalletConnect} />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/">
            <div className="flex items-center space-x-2 cursor-pointer group">
              <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center group-hover:bg-emerald-700 transition-colors shadow-lg">
                <span className="text-white font-bold text-xl">D</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                DonFan
              </h1>
            </div>
          </Link>
          <div className="flex items-center space-x-4">
            <Link href="/">
              <button className="px-4 py-2 text-gray-700 font-medium hover:text-emerald-600 transition-colors">
                Home
              </button>
            </Link>
            <span className="text-sm text-gray-600">{account.slice(0, 6)}...{account.slice(-4)}</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200 p-12">
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">View Your Donations</h2>
          <p className="text-gray-600 mb-6">
            Track all your contributions and see the impact you've made on Etherscan.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 text-left">
            <h3 className="font-semibold text-gray-900 mb-3">How to View Your Donations:</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
              <li>Click the button below to open Etherscan</li>
              <li>Look for transactions to contract: <code className="bg-gray-100 px-2 py-1 rounded text-xs">0x1ccAD...bb10</code></li>
              <li>Filter by "Internal Txns" to see your donations</li>
              <li>Each donation shows the campaign ID, amount, and timestamp</li>
            </ol>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`https://sepolia.etherscan.io/address/${account}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl"
            >
              View on Etherscan →
            </a>
            <Link href="/">
              <button className="px-8 py-4 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200 transition-all">
                Browse Campaigns
              </button>
            </Link>
          </div>
          
          <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>Note:</strong> We're working on integrating The Graph for better on-chain data indexing. This will allow us to display your donation history directly on this page without relying on RPC providers.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

