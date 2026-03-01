'use client';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Link from 'next/link';
import WalletConnectButton from '@/components/WalletConnectButton';
import InfluencerAvatar from '@/components/InfluencerAvatar';
import DonFanLogo from '@/components/DonFanLogo';
import { getContract, CHARITY_TYPES, formatEther, CONTRACT_ADDRESS } from '@/lib/contract';

export default function Home() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCampaigns();
  }, [provider]); // Reload when provider changes

  const handleWalletConnect = (p, s, a) => {
    setProvider(p);
    setSigner(s);
    setAccount(a);
  };

  const loadCampaigns = async () => {
    try {
      let tempProvider;
      
      if (provider) {
        console.log('Using connected provider');
        tempProvider = provider;
      } else if (typeof window !== 'undefined' && window.ethereum) {
        console.log('Using window.ethereum');
        tempProvider = new ethers.BrowserProvider(window.ethereum);
      } else {
        console.log('Using public RPC');
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
            console.log('Failed to connect to:', rpcUrl);
            continue;
          }
        }
        
        if (!tempProvider) {
          throw new Error('Could not connect to any RPC provider');
        }
      }
      
      const contract = getContract(tempProvider);
      
      console.log('Loading campaigns from contract:', CONTRACT_ADDRESS);
      
      const totalNFTs = await contract.getTotalNFTs();
      console.log('Total NFTs:', totalNFTs.toString());
      const campaignData = [];

      for (let i = 0; i < totalNFTs; i++) {
        try {
          const influencer = await contract.influencers(i);
          const owner = await contract.ownerOf(i);
          
          campaignData.push({
            tokenId: i,
            owner,
            charity: CHARITY_TYPES[influencer[0]],
            totalDonations: parseFloat(formatEther(influencer[1])),
            goalAmount: parseFloat(formatEther(influencer[2])),
            active: influencer[3],
            creator: influencer[4],
            influencerName: influencer[5] || `${owner.slice(0, 6)}...${owner.slice(-4)}`,
            profileImageUrl: influencer[6] || '',
            isDemo: false
          });
        } catch (error) {
          console.error(`Error loading campaign ${i}:`, error);
        }
      }

      console.log('Loaded campaigns:', campaignData);

      setCampaigns(campaignData);
    } catch (error) {
      console.error('Error loading campaigns:', error);
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
      
      // Show empty state on error
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  const getCharityBadgeColor = (charity) => {
    const colors = {
      Housing: 'bg-orange-50 text-orange-700 border border-orange-200',
      Meals: 'bg-amber-50 text-amber-700 border border-amber-200',
      Medical: 'bg-rose-50 text-rose-700 border border-rose-200',
      Education: 'bg-blue-50 text-blue-700 border border-blue-200',
      Equipment: 'bg-teal-50 text-teal-700 border border-teal-200',
      RiverCleaning: 'bg-cyan-50 text-cyan-700 border border-cyan-200'
    };
    return colors[charity] || 'bg-gray-50 text-gray-700 border border-gray-200';
  };

  return (
    <div className="min-h-screen relative">
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <DonFanLogo size="md" className="hover:scale-110 transition-transform cursor-pointer" />
            <h1 className="text-2xl font-bold text-gray-900 hover:text-slate-700 transition-colors cursor-pointer">
              DonFan
            </h1>
          </div>
          
          {/* Show different navigation based on wallet connection */}
          {account ? (
            <div className="flex items-center space-x-4">
              <Link href="/my-contributions">
                <button className="px-4 py-2 text-gray-700 font-medium hover:text-slate-700 transition-colors">
                  My Contributions
                </button>
              </Link>
              <Link href="/dashboard">
                <button className="px-4 py-2 text-gray-700 font-medium hover:text-slate-700 transition-colors">
                  Dashboard
                </button>
              </Link>
              <Link href="/create-campaign">
                <button className="px-4 py-2 bg-slate-700 text-white rounded-lg font-medium hover:bg-slate-800 transition-all transform hover:scale-105">
                  Create Campaign
                </button>
              </Link>
              <div className="px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-700 font-mono">
                {account.slice(0, 6)}...{account.slice(-4)}
              </div>
            </div>
          ) : (
            <WalletConnectButton onConnect={handleWalletConnect} />
          )}
        </div>
      </header>

      <main>
        <section className="bg-gradient-to-b from-slate-50/50 to-transparent py-16 sm:py-24 relative overflow-hidden">
          <div className="absolute top-10 left-10 w-20 h-20 bg-slate-200/30 rounded-full blur-2xl"></div>
          <div className="absolute bottom-10 right-10 w-32 h-32 bg-slate-300/30 rounded-full blur-2xl"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-block mb-6 px-4 py-2 bg-slate-100 rounded-full text-slate-700 font-medium text-sm">
                🌟 Making a Difference Together
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
                Support Causes That Matter
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Join influencers and their communities in making a real difference. Every donation is tracked transparently, so you can see exactly how your contribution helps.
              </p>
              
              {!account && (
                <div className="mb-8">
                  <WalletConnectButton onConnect={handleWalletConnect} />
                  <p className="text-sm text-gray-500 mt-3 text-center">
                    {typeof window !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) 
                      ? 'Opens in MetaMask app to connect your wallet'
                      : 'Connect your wallet to create campaigns or view your contributions'
                    }
                  </p>
                </div>
              )}
              
              <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-700">
                <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <svg className="w-5 h-5 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>100% Transparent</span>
                </div>
                <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <svg className="w-5 h-5 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Secure Donations</span>
                </div>
                <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <svg className="w-5 h-5 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Real Impact</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-block mb-4 px-4 py-2 bg-slate-100 rounded-full text-slate-700 font-medium text-sm">
                🎯 Support These Causes
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Active Campaigns</h3>
              <p className="text-lg text-gray-600">Choose a campaign and make a difference today</p>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-slate-700"></div>
                <p className="mt-4 text-gray-600">Loading campaigns...</p>
                <p className="mt-2 text-sm text-gray-500">This may take a moment on mobile</p>
              </div>
            ) : campaigns.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-6">🎯</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">No Active Campaigns Yet</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Be the first to create a campaign and start making a difference!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Link href="/create-campaign">
                    <button className="px-8 py-4 bg-slate-700 text-white rounded-lg font-bold hover:bg-slate-800 transition-all transform hover:scale-105 shadow-lg">
                      Create First Campaign 🚀
                    </button>
                  </Link>
                  <button 
                    onClick={loadCampaigns}
                    className="px-8 py-4 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200 transition-all"
                  >
                    Retry Loading
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {campaigns.map((campaign) => {
                  const progress = campaign.goalAmount > 0 
                    ? (campaign.totalDonations / campaign.goalAmount) * 100 
                    : 0;

                  return (
                    <div
                      key={campaign.tokenId}
                      className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden hover:shadow-2xl hover:border-slate-400 transition-all duration-300 transform hover:-translate-y-2"
                    >
                      <div className="p-6">
                        <div className="flex items-center space-x-3 mb-4">
                          <InfluencerAvatar 
                            name={campaign.influencerName} 
                            imageUrl={campaign.profileImageUrl}
                            size="md"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                              {campaign.influencerName}
                            </h3>
                            <p className="text-xs text-gray-500 font-mono truncate">
                              {campaign.owner.slice(0, 10)}...{campaign.owner.slice(-8)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mb-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${getCharityBadgeColor(campaign.charity)}`}>
                            {campaign.charity}
                          </span>
                          <span className="text-xs text-gray-500">
                            #{campaign.tokenId}
                          </span>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-sm group">
                            <span className="text-gray-600">Raised</span>
                            <span className="font-semibold text-gray-900 group-hover:text-slate-700 transition-colors">
                              {campaign.totalDonations.toFixed(4)} ETH
                            </span>
                          </div>
                          <div className="flex justify-between text-sm group">
                            <span className="text-gray-600">Goal</span>
                            <span className="font-semibold text-gray-900 group-hover:text-slate-700 transition-colors">
                              {campaign.goalAmount.toFixed(4)} ETH
                            </span>
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">Progress</span>
                            <span className="font-semibold text-slate-700">
                              {Math.min(progress, 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-slate-500 to-slate-700 transition-all duration-500 hover:from-slate-600 hover:to-slate-800"
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                        </div>

                        <Link href={`/campaign/${campaign.tokenId}`}>
                          <button className="w-full px-6 py-3 bg-slate-700 text-white rounded-lg font-medium hover:bg-slate-800 transition-all transform hover:scale-105 active:scale-95 min-h-[44px] shadow-lg hover:shadow-xl">
                            View & Donate →
                          </button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="group cursor-pointer">
                <div className="text-4xl font-bold text-slate-700 mb-2 group-hover:scale-110 transition-transform">
                  {campaigns.length}+
                </div>
                <div className="text-sm text-gray-600">Active Campaigns</div>
              </div>
              <div className="group cursor-pointer">
                <div className="text-4xl font-bold text-slate-700 mb-2 group-hover:scale-110 transition-transform">
                  100%
                </div>
                <div className="text-sm text-gray-600">Transparent</div>
              </div>
              <div className="group cursor-pointer">
                <div className="text-4xl font-bold text-slate-700 mb-2 group-hover:scale-110 transition-transform">
                  6
                </div>
                <div className="text-sm text-gray-600">Causes Supported</div>
              </div>
              <div className="group cursor-pointer">
                <div className="text-4xl font-bold text-slate-700 mb-2 group-hover:scale-110 transition-transform">
                  24/7
                </div>
                <div className="text-sm text-gray-600">Support</div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-3xl font-bold text-center text-gray-900 mb-4">How It Works</h3>
            <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
              Start making a difference in just three simple steps
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center group cursor-pointer transform transition-all duration-300 hover:scale-105">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-slate-500 to-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-xl transition-all transform group-hover:rotate-6">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                    <span className="text-slate-700 font-bold">1</span>
                  </div>
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-slate-700 transition-colors">Choose a Campaign</h4>
                <p className="text-gray-600">Browse campaigns from influencers supporting causes like housing, meals, medical aid, education, and environmental cleanup.</p>
              </div>
              <div className="text-center group cursor-pointer transform transition-all duration-300 hover:scale-105">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-xl transition-all transform group-hover:rotate-6">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold">2</span>
                  </div>
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">Make Your Donation</h4>
                <p className="text-gray-600">Securely donate any amount you wish. Your contribution goes directly to the cause with full transparency.</p>
              </div>
              <div className="text-center group cursor-pointer transform transition-all duration-300 hover:scale-105">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-xl transition-all transform group-hover:rotate-6">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-bold">3</span>
                  </div>
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">See Your Impact</h4>
                <p className="text-gray-600">Watch the campaign progress in real-time with visual updates. See exactly how your donation helps reach the goal.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Indicators Section */}
        <section className="py-12 bg-white/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex items-start space-x-4 p-6 rounded-xl hover:bg-slate-50 transition-colors group cursor-pointer">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                    <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Secure & Private</h4>
                  <p className="text-sm text-gray-600">Your payments are encrypted, and your data is never shared.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4 p-6 rounded-xl hover:bg-blue-50 transition-colors group cursor-pointer">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Guaranteed Updates</h4>
                  <p className="text-sm text-gray-600">Stay informed with real-time updates on campaign progress.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4 p-6 rounded-xl hover:bg-purple-50 transition-colors group cursor-pointer">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Support that Listens</h4>
                  <p className="text-sm text-gray-600">24x7 assistance for all your donation needs.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-white/80 backdrop-blur-md border-t border-gray-200 py-12 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <DonFanLogo size="sm" />
                  <span className="text-xl font-bold text-gray-900">DonFan</span>
                </div>
                <p className="text-gray-600 text-sm">
                  Connecting generous donors with influencers making a positive impact in their communities.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Causes We Support</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>🏠 Housing & Shelter</li>
                  <li>🍲 Food & Nutrition</li>
                  <li>🏥 Medical Aid</li>
                  <li>📚 Education</li>
                  <li>🌊 Environmental Cleanup</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Why DonFan?</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>✓ Transparent tracking</li>
                  <li>✓ Direct to cause</li>
                  <li>✓ Real-time updates</li>
                  <li>✓ Secure donations</li>
                </ul>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
              <p>© 2024 DonFan. Making charitable giving transparent and impactful.</p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

