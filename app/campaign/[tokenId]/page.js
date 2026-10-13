'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import WalletConnectButton from '@/components/WalletConnectButton';
import DonationPanel from '@/components/DonationPanel';
import ProgressStats from '@/components/ProgressStats';
import HousingVisual from '@/components/CharityVisual/HousingVisual';
import MealsVisual from '@/components/CharityVisual/MealsVisual';
import MedicalVisual from '@/components/CharityVisual/MedicalVisual';
import EducationVisual from '@/components/CharityVisual/EducationVisual';
import RiverVisual from '@/components/CharityVisual/RiverVisual';
import InfluencerAvatar from '@/components/InfluencerAvatar';
import DonFanLogo from '@/components/DonFanLogo';
import { getContract, getReadOnlyProvider, CHARITY_TYPES, formatEther } from '@/lib/contract';

export default function CampaignPage() {
  const params = useParams();
  const router = useRouter();
  const tokenId = parseInt(params.tokenId);

  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    loadCampaign();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenId]); // Reads use a fixed RPC provider; wallet only needed for writes

  const loadCampaign = async () => {
    setLoadError(null);
    try {
      // Always use a read-only RPC provider so the campaign loads regardless of
      // whether the user has a wallet connected or on the right network.
      const readProvider = await getReadOnlyProvider();
      const contract = getContract(readProvider);

      const influencer = await contract.influencers(tokenId);
      const owner = await contract.ownerOf(tokenId);

      setCampaign({
        tokenId,
        owner,
        charity: CHARITY_TYPES[influencer[0]],
        totalDonations: parseFloat(formatEther(influencer[1])),
        goalAmount: parseFloat(formatEther(influencer[2])),
        active: influencer[3],
        creator: influencer[4],
        influencerName: influencer[5] || `${owner.slice(0, 6)}...${owner.slice(-4)}`,
        profileImageUrl: influencer[6] || ''
      });
    } catch (error) {
      console.error('Error loading campaign:', error);
      setLoadError(error.message ?? 'Failed to load campaign.');
    } finally {
      setLoading(false);
    }
  };

  const handleWalletConnect = (p, s, a) => {
    setProvider(p);
    setSigner(s);
  };

  const getCharityVisual = () => {
    if (!campaign) return null;
    
    const progress = campaign.goalAmount > 0 
      ? (campaign.totalDonations / campaign.goalAmount) * 100 
      : 0;

    const visualProps = { progressPercentage: progress };

    switch (campaign.charity) {
      case 'Housing':
        return <HousingVisual {...visualProps} />;
      case 'Meals':
        return <MealsVisual {...visualProps} />;
      case 'Medical':
        return <MedicalVisual {...visualProps} />;
      case 'Education':
        return <EducationVisual {...visualProps} />;
      case 'Equipment':
        return <EducationVisual {...visualProps} />;
      case 'RiverCleaning':
        return <RiverVisual {...visualProps} />;
      default:
        return <HousingVisual {...visualProps} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading campaign...</p>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-2">Campaign not found</p>
          {loadError && (
            <p className="text-sm text-red-600 mb-4 font-mono bg-red-50 p-3 rounded-lg max-w-lg">
              {loadError}
            </p>
          )}
          <Link href="/">
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg">
              Back to Home
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const progress = campaign.goalAmount > 0 
    ? (campaign.totalDonations / campaign.goalAmount) * 100 
    : 0;

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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-200/20 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl -z-10"></div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column - Campaign Info */}
          <div className="space-y-6">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              {/* Influencer Info */}
              <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-gray-200">
                <InfluencerAvatar 
                  name={campaign.influencerName} 
                  imageUrl={campaign.profileImageUrl}
                  size="lg"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {campaign.influencerName}
                  </h3>
                  <p className="text-sm text-gray-500 font-mono truncate">
                    {campaign.owner}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {campaign.charity} Campaign
                </h2>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-sm font-medium">
                  Active
                </span>
              </div>

              <ProgressStats
                totalDonations={campaign.totalDonations}
                goalAmount={campaign.goalAmount}
                charityType={campaign.charity}
              />
            </div>

            <DonationPanel
              tokenId={tokenId}
              contract={provider ? getContract(provider) : null}
              signer={signer}
              onSuccess={loadCampaign}
            />
          </div>

          {/* Right Column - Charity Visual */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Campaign Progress Visualization
            </h3>
            <div className="aspect-square hover:scale-105 transition-transform duration-300">
              {getCharityVisual()}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
