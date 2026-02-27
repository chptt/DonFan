'use client';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import WalletConnectButton from '@/components/WalletConnectButton';
import { getContract, CHARITY_TYPES, parseEther } from '@/lib/contract';

export default function CreateCampaign() {
  const router = useRouter();
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasExistingNFT, setHasExistingNFT] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    charityType: '0',
    goalAmount: '',
    campaignName: '',
    description: ''
  });

  useEffect(() => {
    if (provider && account) {
      checkExistingNFT();
    }
  }, [provider, account]);

  const checkExistingNFT = async () => {
    try {
      const contract = getContract(provider);
      const hasMinted = await contract.hasMinted(account);
      setHasExistingNFT(hasMinted);
      
      if (hasMinted) {
        alert('You have already created a campaign with this wallet!');
      }
    } catch (error) {
      console.error('Error checking NFT:', error);
    }
  };

  const handleWalletConnect = (p, s, a) => {
    setProvider(p);
    setSigner(s);
    setAccount(a);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCreateCampaign = async () => {
    if (!signer) {
      alert('Please connect your wallet first');
      return;
    }

    if (hasExistingNFT) {
      alert('You have already created a campaign!');
      return;
    }

    if (!formData.goalAmount || parseFloat(formData.goalAmount) <= 0) {
      alert('Please enter a valid goal amount');
      return;
    }

    setLoading(true);
    try {
      const contract = getContract(provider);
      const contractWithSigner = contract.connect(signer);
      
      const tx = await contractWithSigner.mintMyNFT(
        parseInt(formData.charityType),
        parseEther(formData.goalAmount)
      );

      await tx.wait();
      
      alert('Campaign created successfully! 🎉');
      router.push('/');
    } catch (error) {
      console.error('Error creating campaign:', error);
      alert(error.reason || 'Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  const charityOptions = [
    { value: '0', label: 'Housing & Shelter', icon: '🏠', color: 'orange' },
    { value: '1', label: 'Meals & Nutrition', icon: '🍲', color: 'amber' },
    { value: '2', label: 'Medical Aid', icon: '🏥', color: 'rose' },
    { value: '3', label: 'Education', icon: '📚', color: 'blue' },
    { value: '4', label: 'Equipment', icon: '🎒', color: 'teal' },
    { value: '5', label: 'River Cleaning', icon: '🌊', color: 'cyan' }
  ];

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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Create Your Campaign</h2>
          <p className="text-lg text-gray-600">Start making a difference today</p>
        </div>

        {/* Single Form */}
        {!account ? (
          <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200 p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Connect Your Wallet</h3>
            <p className="text-gray-600 mb-6">
              Connect your wallet to create a campaign. Each wallet can only create one campaign.
            </p>
            
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">Please connect your wallet to continue</p>
              <div className="inline-block">
                <WalletConnectButton onConnect={handleWalletConnect} />
              </div>
            </div>
          </div>
        ) : hasExistingNFT ? (
          <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200 p-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-800 font-medium">
                ⚠️ This wallet has already created a campaign
              </p>
              <p className="text-red-600 text-sm mt-2">
                Please use a different wallet to create a new campaign
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200 p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Campaign Details</h3>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Campaign Name
                </label>
                <input
                  type="text"
                  name="campaignName"
                  value={formData.campaignName}
                  onChange={handleInputChange}
                  placeholder="My Charity Campaign"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Charity Type
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {charityOptions.map((option) => (
                    <div
                      key={option.value}
                      onClick={() => setFormData({ ...formData, charityType: option.value })}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:scale-105 ${
                        formData.charityType === option.value
                          ? `border-${option.color}-500 bg-${option.color}-50`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-3xl mb-2">{option.icon}</div>
                      <div className="text-sm font-medium text-gray-900">{option.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fundraising Goal (ETH)
                </label>
                <input
                  type="number"
                  name="goalAmount"
                  value={formData.goalAmount}
                  onChange={handleInputChange}
                  step="0.01"
                  placeholder="1.0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Set a realistic goal for your campaign
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Campaign Description (Optional)
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Tell people about your cause and why it matters..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-sm">
                  💡 Tip: You can donate to your own campaign to kickstart it and encourage others to contribute!
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 text-sm">
                  ⚠️ Note: Once created, you cannot create another campaign with this wallet. Make sure all details are correct.
                </p>
              </div>

              <button
                onClick={handleCreateCampaign}
                disabled={loading || !formData.goalAmount || !formData.campaignName}
                className="w-full px-6 py-4 bg-emerald-600 text-white rounded-lg font-bold text-lg hover:bg-emerald-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? 'Creating Campaign...' : 'Create Campaign 🚀'}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
