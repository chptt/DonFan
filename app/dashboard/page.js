'use client';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Link from 'next/link';
import { motion } from 'framer-motion';
import WalletConnectButton from '@/components/WalletConnectButton';
import DonFanLogo from '@/components/DonFanLogo';
import { getContract, CHARITY_TYPES, formatEther } from '@/lib/contract';

export default function Dashboard() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [campaign, setCampaign] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({
    totalDonations: 0,
    donorCount: 0,
    averageDonation: 0,
    progressPercentage: 0
  });

  useEffect(() => {
    if (provider && account) {
      loadDashboardData();
    }
  }, [provider, account]);

  const handleWalletConnect = (p, s, a) => {
    setProvider(p);
    setSigner(s);
    setAccount(a);
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      let tempProvider;
      
      if (provider) {
        tempProvider = provider;
      } else if (typeof window !== 'undefined' && window.ethereum) {
        tempProvider = new ethers.BrowserProvider(window.ethereum);
      } else {
        const rpcUrls = [
          'https://ethereum-sepolia.publicnode.com',
          'https://rpc.sepolia.org',
          'https://sepolia.gateway.tenderly.co'
        ];
        
        for (const rpcUrl of rpcUrls) {
          try {
            tempProvider = new ethers.JsonRpcProvider(rpcUrl);
            await tempProvider.getBlockNumber();
            break;
          } catch (err) {
            continue;
          }
        }
      }
      
      const contract = getContract(tempProvider);
      
      const campaignIds = await contract.getCampaignsByCreator(account);
      
      if (campaignIds.length === 0) {
        setLoading(false);
        return;
      }

      const tokenId = campaignIds[0];
      
      const influencer = await contract.influencers(tokenId);
      const owner = await contract.ownerOf(tokenId);
      
      const campaignData = {
        tokenId: tokenId.toString(),
        owner,
        charity: CHARITY_TYPES[influencer[0]],
        totalDonations: parseFloat(formatEther(influencer[1])),
        goalAmount: parseFloat(formatEther(influencer[2])),
        active: influencer[3],
        creator: influencer[4],
        influencerName: influencer[5] || `${owner.slice(0, 6)}...${owner.slice(-4)}`,
        profileImageUrl: influencer[6] || ''
      };
      
      setCampaign(campaignData);

      const progress = campaignData.goalAmount > 0 
        ? (campaignData.totalDonations / campaignData.goalAmount) * 100 
        : 0;

      const currentBlock = await tempProvider.getBlockNumber();
      const fromBlock = Math.max(0, currentBlock - 5000);
      
      console.log(`Querying donation events from block ${fromBlock} to ${currentBlock}`);
      console.log('Querying donation events for token:', tokenId.toString());
      
      const donationFilter = contract.filters.DonationReceived(tokenId);
      
      let donationEvents = [];
      try {
        donationEvents = await contract.queryFilter(donationFilter, fromBlock, currentBlock);
      } catch (error) {
        console.error('Error querying with block range, trying without range:', error);
        try {
          donationEvents = await contract.queryFilter(donationFilter, -5000);
        } catch (err) {
          console.error('Error querying events:', err);
        }
      }
      
      console.log('Found donation events:', donationEvents.length);
      
      const txList = await Promise.all(
        donationEvents.map(async (event) => {
          const block = await event.getBlock();
          return {
            donor: event.args.donor,
            amount: parseFloat(formatEther(event.args.amount)),
            timestamp: block.timestamp,
            txHash: event.transactionHash
          };
        })
      );

      setTransactions(txList.reverse());

      const donorCount = new Set(txList.map(tx => tx.donor)).size;
      const avgDonation = txList.length > 0 
        ? campaignData.totalDonations / txList.length 
        : 0;

      console.log('Stats:', { donorCount, avgDonation, totalDonations: campaignData.totalDonations });

      setStats({
        totalDonations: campaignData.totalDonations,
        donorCount,
        averageDonation: avgDonation,
        progressPercentage: progress
      });

    } catch (error) {
      console.error('Error loading dashboard:', error);
      console.error('Error details:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!signer || !campaign) return;

    if (campaign.totalDonations === 0) {
      alert('No funds to withdraw');
      return;
    }

    const confirmed = window.confirm(
      `Withdraw ${campaign.totalDonations.toFixed(4)} ETH from your campaign?`
    );

    if (!confirmed) return;

    try {
      const contract = getContract(provider);
      const contractWithSigner = contract.connect(signer);
      
      const tx = await contractWithSigner.withdraw(campaign.tokenId);
      await tx.wait();
      
      alert('Withdrawal successful! 🎉');
      loadDashboardData(); // Reload data
    } catch (error) {
      console.error('Withdrawal error:', error);
      alert(error.reason || 'Withdrawal failed');
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  if (!account) {
    return (
      <div className="min-h-screen relative">
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <Link href="/">
              <div className="flex items-center space-x-2 cursor-pointer group">
                <DonFanLogo size="md" className="group-hover:scale-110 transition-transform" />
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
            <div className="text-6xl mb-6">🔐</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Connect Your Wallet</h2>
            <p className="text-gray-600 mb-8">
              Please connect your wallet to access your campaign dashboard
            </p>
            <WalletConnectButton onConnect={handleWalletConnect} />
          </div>
        </main>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!campaign) {
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
              <span className="text-sm text-gray-600">{account.slice(0, 6)}...{account.slice(-4)}</span>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200 p-12">
            <div className="text-6xl mb-6">📊</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">No Campaign Found</h2>
            <p className="text-gray-600 mb-8">
              You haven't created a campaign yet. Create one to start receiving donations!
            </p>
            <Link href="/create-campaign">
              <button className="px-8 py-4 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition-all transform hover:scale-105">
                Create Your Campaign
              </button>
            </Link>
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
            <Link href={`/campaign/${campaign.tokenId}`}>
              <button className="px-4 py-2 text-emerald-600 font-medium hover:text-emerald-700 transition-colors">
                View Campaign
              </button>
            </Link>
            <span className="text-sm text-gray-600">{account.slice(0, 6)}...{account.slice(-4)}</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-2">Campaign Dashboard</h2>
          <p className="text-gray-600">Track your donations and campaign performance</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Total Raised</span>
              <span className="text-2xl">💰</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.totalDonations.toFixed(4)} ETH</div>
            <div className="text-sm text-emerald-600 mt-1">
              Goal: {campaign.goalAmount.toFixed(4)} ETH
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Progress</span>
              <span className="text-2xl">📈</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">{Math.min(stats.progressPercentage, 100).toFixed(1)}%</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(stats.progressPercentage, 100)}%` }}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Total Donors</span>
              <span className="text-2xl">👥</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.donorCount}</div>
            <div className="text-sm text-gray-500 mt-1">
              {transactions.length} donation{transactions.length !== 1 ? 's' : ''}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Avg Donation</span>
              <span className="text-2xl">📊</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {stats.averageDonation.toFixed(4)}
            </div>
            <div className="text-sm text-gray-500 mt-1">ETH per donation</div>
          </motion.div>
        </div>

        {/* Campaign Info & Withdraw */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Campaign Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Campaign ID</span>
                <span className="font-semibold text-gray-900">#{campaign.tokenId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Charity Type</span>
                <span className="font-semibold text-gray-900">{campaign.charity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status</span>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                  {campaign.active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Wallet Address</span>
                <span className="font-mono text-sm text-gray-900">{account.slice(0, 10)}...{account.slice(-8)}</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-xl border border-emerald-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Withdraw Funds</h3>
            <div className="mb-4">
              <div className="text-sm text-gray-600 mb-1">Available Balance</div>
              <div className="text-3xl font-bold text-emerald-600">
                {campaign.totalDonations.toFixed(4)} ETH
              </div>
            </div>
            <button
              onClick={handleWithdraw}
              disabled={campaign.totalDonations === 0}
              className="w-full px-6 py-3 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              Withdraw All
            </button>
            <p className="text-xs text-gray-600 mt-2 text-center">
              Funds will be sent to your wallet
            </p>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Donations</h3>
          
          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎁</div>
              <p className="text-gray-600">No donations yet</p>
              <p className="text-sm text-gray-500 mt-2">Share your campaign to start receiving donations!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Donor</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Transaction</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-mono text-sm text-gray-900">
                          {tx.donor.slice(0, 6)}...{tx.donor.slice(-4)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-emerald-600">
                          {tx.amount.toFixed(4)} ETH
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {formatDate(tx.timestamp)}
                      </td>
                      <td className="py-3 px-4">
                        <a
                          href={`https://sepolia.etherscan.io/tx/${tx.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 text-sm hover:underline"
                        >
                          View →
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
