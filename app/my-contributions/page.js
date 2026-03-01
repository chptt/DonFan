'use client';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Link from 'next/link';
import { motion } from 'framer-motion';
import WalletConnectButton from '@/components/WalletConnectButton';
import InfluencerAvatar from '@/components/InfluencerAvatar';
import { getContract, CHARITY_TYPES, formatEther } from '@/lib/contract';

export default function MyContributions() {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contributions, setContributions] = useState([]);
  const [stats, setStats] = useState({
    totalDonated: 0,
    campaignsSupported: 0,
    largestDonation: 0,
    firstDonation: null
  });

  useEffect(() => {
    if (provider && account) {
      loadContributions();
    } else {
      setLoading(false);
    }
  }, [provider, account]);

  const handleWalletConnect = (p, s, a) => {
    setProvider(p);
    setAccount(a);
  };

  const loadContributions = async () => {
    setLoading(true);
    try {
      console.log('Loading contributions for account:', account);
      
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
            console.log('Connected to RPC:', rpcUrl);
            break;
          } catch (err) {
            console.log('Failed RPC:', rpcUrl);
            continue;
          }
        }
      }
      
      const contract = getContract(tempProvider);
      
      console.log('Contract address:', contract.target);
      
      const currentBlock = await tempProvider.getBlockNumber();
      const fromBlock = Math.max(0, currentBlock - 5000);
      
      console.log(`Querying events from block ${fromBlock} to ${currentBlock}`);
      
      const donationFilter = contract.filters.DonationReceived(null, account);
      
      let donationEvents = [];
      try {
        donationEvents = await contract.queryFilter(donationFilter, fromBlock, currentBlock);
      } catch (error) {
        console.error('Error querying with block range, trying without range:', error);
        try {
          donationEvents = await contract.queryFilter(donationFilter, -5000);
        } catch (err) {
          console.error('Error querying events:', err);
          setLoading(false);
          return;
        }
      }
      
      console.log('Found donation events:', donationEvents.length);
      
      if (donationEvents.length === 0) {
        console.log('No donations found for this account');
        setLoading(false);
        return;
      }

      const contributionsList = await Promise.all(
        donationEvents.map(async (event) => {
          const tokenId = event.args.tokenId;
          const amount = parseFloat(formatEther(event.args.amount));
          const block = await event.getBlock();
          
          try {
            const influencer = await contract.influencers(tokenId);
            const owner = await contract.ownerOf(tokenId);
            
            console.log(`Campaign ${tokenId} data:`, influencer);
            
            const hasNewFields = influencer.length >= 7;
            
            return {
              tokenId: tokenId.toString(),
              amount,
              timestamp: block.timestamp,
              txHash: event.transactionHash,
              charity: CHARITY_TYPES[influencer[0]],
              campaignOwner: owner,
              goalAmount: parseFloat(formatEther(influencer[2])),
              totalDonations: parseFloat(formatEther(influencer[1])),
              influencerName: hasNewFields && influencer[5] ? influencer[5] : `${owner.slice(0, 6)}...${owner.slice(-4)}`,
              profileImageUrl: hasNewFields && influencer[6] ? influencer[6] : ''
            };
          } catch (error) {
            console.error(`Error loading campaign ${tokenId}:`, error);
            return null;
          }
        })
      );

      const validContributions = contributionsList
        .filter(c => c !== null)
        .sort((a, b) => b.timestamp - a.timestamp);

      console.log('Valid contributions:', validContributions.length);
      setContributions(validContributions);

      const totalDonated = validContributions.reduce((sum, c) => sum + c.amount, 0);
      const uniqueCampaigns = new Set(validContributions.map(c => c.tokenId)).size;
      const largestDonation = validContributions.length > 0 ? Math.max(...validContributions.map(c => c.amount)) : 0;
      const firstDonation = validContributions[validContributions.length - 1];

      setStats({
        totalDonated,
        campaignsSupported: uniqueCampaigns,
        largestDonation,
        firstDonation
      });

    } catch (error) {
      console.error('Error loading contributions:', error);
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCharityIcon = (charity) => {
    const icons = {
      Housing: '🏠',
      Meals: '🍲',
      Medical: '🏥',
      Education: '📚',
      Equipment: '🎒',
      RiverCleaning: '🌊'
    };
    return icons[charity] || '💚';
  };

  const getCharityColor = (charity) => {
    const colors = {
      Housing: 'from-orange-400 to-orange-600',
      Meals: 'from-amber-400 to-amber-600',
      Medical: 'from-rose-400 to-rose-600',
      Education: 'from-blue-400 to-blue-600',
      Equipment: 'from-teal-400 to-teal-600',
      RiverCleaning: 'from-cyan-400 to-cyan-600'
    };
    return colors[charity] || 'from-emerald-400 to-emerald-600';
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
            <div className="text-6xl mb-6">🔐</div>
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          <p className="mt-4 text-gray-600">Loading your contributions...</p>
        </div>
      </div>
    );
  }

  if (contributions.length === 0) {
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
            <div className="text-6xl mb-6">💝</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">No Contributions Yet</h2>
            <p className="text-gray-600 mb-4">
              You haven't made any donations yet. Browse campaigns and start making a difference!
            </p>
            <p className="text-sm text-gray-500 mb-8">
              Note: It may take 1-2 minutes for donations to appear after transaction confirmation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/">
                <button className="px-8 py-4 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition-all transform hover:scale-105">
                  Browse Campaigns
                </button>
              </Link>
              <button
                onClick={loadContributions}
                className="px-8 py-4 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200 transition-all"
              >
                Retry Loading
              </button>
            </div>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-2">My Contributions</h2>
            <p className="text-gray-600">Track your impact across all campaigns</p>
          </div>
          <button
            onClick={loadContributions}
            disabled={loading}
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl p-6 text-white hover:shadow-xl transition-all transform hover:scale-105"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-emerald-100">Total Donated</span>
              <span className="text-3xl">💰</span>
            </div>
            <div className="text-3xl font-bold">{stats.totalDonated.toFixed(4)} ETH</div>
            <div className="text-sm text-emerald-100 mt-1">
              Across {stats.campaignsSupported} campaign{stats.campaignsSupported !== 1 ? 's' : ''}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Campaigns Supported</span>
              <span className="text-3xl">🎯</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.campaignsSupported}</div>
            <div className="text-sm text-gray-500 mt-1">
              {contributions.length} total donation{contributions.length !== 1 ? 's' : ''}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Largest Donation</span>
              <span className="text-3xl">🌟</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.largestDonation.toFixed(4)}</div>
            <div className="text-sm text-gray-500 mt-1">ETH</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">First Donation</span>
              <span className="text-3xl">📅</span>
            </div>
            <div className="text-lg font-bold text-gray-900">
              {stats.firstDonation ? formatDate(stats.firstDonation.timestamp).split(',')[0] : 'N/A'}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {stats.firstDonation ? stats.firstDonation.charity : ''}
            </div>
          </motion.div>
        </div>

        {/* Contributions List */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Donation History</h3>
          
          <div className="space-y-4">
            {contributions.map((contribution, index) => {
              const progress = contribution.goalAmount > 0 
                ? (contribution.totalDonations / contribution.goalAmount) * 100 
                : 0;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-emerald-200 transition-all group"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Left: Campaign Info */}
                    <div className="flex items-start space-x-4 flex-1">
                      <div className={`w-16 h-16 bg-gradient-to-br ${getCharityColor(contribution.charity)} rounded-xl flex items-center justify-center text-3xl flex-shrink-0 group-hover:scale-110 transition-transform`}>
                        {getCharityIcon(contribution.charity)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="text-lg font-semibold text-gray-900">
                            {contribution.charity} Campaign
                          </h4>
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                            #{contribution.tokenId}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2 mb-2">
                          <InfluencerAvatar 
                            name={contribution.influencerName} 
                            imageUrl={contribution.profileImageUrl}
                            size="sm"
                          />
                          <p className="text-sm font-medium text-gray-700">
                            {contribution.influencerName}
                          </p>
                        </div>
                        
                        <p className="text-xs text-gray-500 font-mono mb-2">
                          {contribution.campaignOwner.slice(0, 10)}...{contribution.campaignOwner.slice(-8)}
                        </p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{formatDate(contribution.timestamp)}</span>
                          <a
                            href={`https://sepolia.etherscan.io/tx/${contribution.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 hover:underline"
                          >
                            View Transaction →
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Right: Donation Amount & Progress */}
                    <div className="flex flex-col items-end space-y-2 md:w-48">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-emerald-600">
                          {contribution.amount.toFixed(4)} ETH
                        </div>
                        <div className="text-xs text-gray-500">
                          Your contribution
                        </div>
                      </div>
                      
                      <div className="w-full">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Campaign Progress</span>
                          <span>{Math.min(progress, 100).toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full bg-gradient-to-r ${getCharityColor(contribution.charity)} transition-all`}
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                      </div>

                      <Link href={`/campaign/${contribution.tokenId}`}>
                        <button className="text-sm text-emerald-600 hover:text-emerald-700 font-medium hover:underline">
                          View Campaign →
                        </button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Thank You Message */}
        <div className="mt-8 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl border border-emerald-200 p-8 text-center">
          <div className="text-5xl mb-4">🙏</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank You for Your Generosity!</h3>
          <p className="text-gray-600 mb-6">
            Your contributions are making a real difference in people's lives.
          </p>
          <Link href="/">
            <button className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-all transform hover:scale-105">
              Support More Campaigns
            </button>
          </Link>
        </div>
      </main>
    </div>
  );
}
