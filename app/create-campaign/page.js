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

  // Form data
  const [formData, setFormData] = useState({
    charityType: '0',
    goalAmount: '',
    influencerName: '',
    profileImageUrl: ''
  });

  useEffect(() => {
    if (provider && account) {
      // No need to check for existing NFT anymore
    }
  }, [provider, account]);

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

    if (!formData.goalAmount || parseFloat(formData.goalAmount) <= 0) {
      alert('Please enter a valid goal amount');
      return;
    }

    if (!formData.influencerName || formData.influencerName.trim().length === 0) {
      alert('Please enter your name or influencer name');
      return;
    }

    if (formData.influencerName.length > 50) {
      alert('Name is too long (max 50 characters)');
      return;
    }

    setLoading(true);
    try {
      const contract = getContract(provider);
      const contractWithSigner = contract.connect(signer);
      
      const tx = await contractWithSigner.mintMyNFT(
        parseInt(formData.charityType),
        parseEther(formData.goalAmount),
        formData.influencerName.trim(),
        formData.profileImageUrl.trim()
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name / Influencer Name
                </label>
                <input
                  type="text"
                  name="influencerName"
                  value={formData.influencerName}
                  onChange={handleInputChange}
                  maxLength="50"
                  placeholder="Enter your name (e.g., John Doe, @username)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  This name will be displayed to donors (max 50 characters)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Picture URL (Optional)
                </label>
                <input
                  type="url"
                  name="profileImageUrl"
                  value={formData.profileImageUrl}
                  onChange={handleInputChange}
                  placeholder="https://example.com/your-photo.jpg or ipfs://..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800 mb-2">
                    💡 <strong>Recommended:</strong> Upload to IPFS for permanent, tamper-proof storage
                  </p>
                  <p className="text-xs text-blue-700">
                    Free IPFS services: <a href="https://www.pinata.cloud/" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-900">Pinata</a>, <a href="https://nft.storage/" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-900">NFT.Storage</a>, <a href="https://web3.storage/" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-900">Web3.Storage</a>
                  </p>
                </div>
                {formData.profileImageUrl && (
                  <div className="mt-3 flex items-center space-x-3">
                    <div className="text-sm text-gray-600">Preview:</div>
                    <img 
                      src={formData.profileImageUrl} 
                      alt="Preview" 
                      className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg" style={{display: 'none'}}>
                      {formData.influencerName.charAt(0).toUpperCase() || '?'}
                    </div>
                  </div>
                )}
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

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-sm">
                  💡 Tip: You can create multiple campaigns and donate to your own campaigns to kickstart them!
                </p>
              </div>

              <button
                onClick={handleCreateCampaign}
                disabled={loading || !formData.goalAmount || !formData.influencerName}
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
