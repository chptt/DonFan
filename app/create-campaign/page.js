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
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [fileInputKey, setFileInputKey] = useState(Date.now());

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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG or JPG)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    setUploadingImage(true);

    try {
      // Convert image to base64 for preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        // For now, just use the base64 as the URL (works but large)
        // In production, you'd upload to a service like Cloudinary, AWS S3, etc.
        setFormData(prev => ({
          ...prev,
          profileImageUrl: reader.result
        }));
        alert('Image loaded! Note: For best results, paste an image link from your social media or photo hosting site.');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Image upload error:', error);
      alert('Failed to load image. Please paste an image link instead.');
    } finally {
      setUploadingImage(false);
    }
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
                <label htmlFor="influencerName" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name / Influencer Name
                </label>
                <input
                  type="text"
                  id="influencerName"
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
                <label htmlFor="profileImageUrl" className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Picture (Optional)
                </label>
                
                {/* Image Link Input */}
                <div className="mb-3">
                  <input
                    type="url"
                    id="profileImageUrl"
                    name="profileImageUrl"
                    value={formData.profileImageUrl.startsWith('data:') ? '' : formData.profileImageUrl}
                    onChange={handleInputChange}
                    placeholder="Paste your image link here (from Instagram, Twitter, etc.)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Right-click your profile picture → Copy image address → Paste here
                  </p>
                </div>

                <div className="text-center text-gray-500 text-sm mb-3">OR</div>

                {/* File Upload Button */}
                <div className="mb-3">
                  <label htmlFor="fileUpload" className="cursor-pointer">
                    <div className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-emerald-500 transition-colors bg-gray-50 hover:bg-emerald-50">
                      {uploadingImage ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-600"></div>
                          <span className="text-gray-600">Loading...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-gray-600 font-medium">Click to upload PNG or JPG</span>
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      id="fileUpload"
                      key={fileInputKey}
                      accept="image/png,image/jpeg,image/jpg"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-1 text-center">
                    Max size: 5MB (Note: Image links work better)
                  </p>
                </div>

                {/* Preview */}
                {(imagePreview || formData.profileImageUrl) && (
                  <div className="flex items-center justify-center space-x-3 p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">Preview:</div>
                    <img 
                      src={imagePreview || formData.profileImageUrl} 
                      alt="Preview" 
                      crossOrigin="anonymous"
                      className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500 shadow-md"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setFormData(prev => ({ ...prev, profileImageUrl: '' }));
                        setFileInputKey(Date.now()); // Reset file input
                      }}
                      className="text-sm text-red-600 hover:text-red-700 underline"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="charityType" className="block text-sm font-medium text-gray-700 mb-3">
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
                <label htmlFor="goalAmount" className="block text-sm font-medium text-gray-700 mb-2">
                  Fundraising Goal (ETH)
                </label>
                <input
                  type="number"
                  id="goalAmount"
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

