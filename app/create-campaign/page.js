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
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasExistingNFT, setHasExistingNFT] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    charityType: '0',
    goalAmount: '',
    influencerName: '',
    socialHandle: '',
    socialPlatform: 'twitter',
    description: '',
    verificationCode: ''
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

  const generateVerificationCode = () => {
    const code = `DonFan-Verify-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    setFormData({ ...formData, verificationCode: code });
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

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                  step >= s ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {s}
                </div>
                {s < 3 && (
                  <div className={`w-16 h-1 mx-2 transition-all ${
                    step > s ? 'bg-emerald-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-4 space-x-20 text-sm text-gray-600">
            <span className={step >= 1 ? 'text-emerald-600 font-medium' : ''}>Connect</span>
            <span className={step >= 2 ? 'text-emerald-600 font-medium' : ''}>Verify</span>
            <span className={step >= 3 ? 'text-emerald-600 font-medium' : ''}>Create</span>
          </div>
        </div>

        {/* Step 1: Connect Wallet */}
        {step === 1 && (
          <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200 p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Step 1: Connect Your Wallet</h3>
            <p className="text-gray-600 mb-6">
              Connect your wallet to create a campaign. Each wallet can only create one campaign.
            </p>
            
            {!account ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">Please connect your wallet to continue</p>
                <div className="inline-block">
                  <WalletConnectButton onConnect={handleWalletConnect} />
                </div>
              </div>
            ) : hasExistingNFT ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <p className="text-red-800 font-medium">
                  ⚠️ This wallet has already created a campaign
                </p>
                <p className="text-red-600 text-sm mt-2">
                  Please use a different wallet to create a new campaign
                </p>
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
                <p className="text-emerald-800 font-medium mb-2">✓ Wallet Connected</p>
                <p className="text-emerald-700 text-sm font-mono">{account}</p>
                <button
                  onClick={() => setStep(2)}
                  className="mt-6 w-full px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-all transform hover:scale-105"
                >
                  Continue to Verification
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Verify Identity */}
        {step === 2 && (
          <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200 p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Step 2: Verify Your Identity</h3>
            <p className="text-gray-600 mb-6">
              Help us verify you're a real influencer by providing your social media details.
            </p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name / Brand Name
                </label>
                <input
                  type="text"
                  name="influencerName"
                  value={formData.influencerName}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Social Media Platform
                </label>
                <select
                  name="socialPlatform"
                  value={formData.socialPlatform}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="twitter">Twitter / X</option>
                  <option value="instagram">Instagram</option>
                  <option value="youtube">YouTube</option>
                  <option value="tiktok">TikTok</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Social Media Handle
                </label>
                <input
                  type="text"
                  name="socialHandle"
                  value={formData.socialHandle}
                  onChange={handleInputChange}
                  placeholder="@yourhandle"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">📝 Verification Instructions</h4>
                <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
                  <li>Click "Generate Code" below</li>
                  <li>Post the code on your social media profile or bio</li>
                  <li>Continue to create your campaign</li>
                  <li>Our team will verify within 24 hours</li>
                </ol>
              </div>

              {!formData.verificationCode ? (
                <button
                  onClick={generateVerificationCode}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all"
                >
                  Generate Verification Code
                </button>
              ) : (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <p className="text-emerald-800 font-medium mb-2">Your Verification Code:</p>
                  <p className="text-2xl font-mono font-bold text-emerald-900 mb-2">
                    {formData.verificationCode}
                  </p>
                  <p className="text-sm text-emerald-700">
                    Post this code on your {formData.socialPlatform} profile
                  </p>
                </div>
              )}

              <div className="flex space-x-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!formData.influencerName || !formData.socialHandle}
                  className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue to Campaign Details
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Campaign Details */}
        {step === 3 && (
          <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200 p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Step 3: Campaign Details</h3>
            <p className="text-gray-600 mb-6">
              Choose your cause and set your fundraising goal.
            </p>

            <div className="space-y-6">
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

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 text-sm">
                  ⚠️ Note: Once created, you cannot create another campaign with this wallet. Make sure all details are correct.
                </p>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleCreateCampaign}
                  disabled={loading || !formData.goalAmount}
                  className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {loading ? 'Creating Campaign...' : 'Create Campaign 🚀'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
