'use client';
import { motion } from 'framer-motion';

export default function ProgressStats({ totalDonations, goalAmount, charityType }) {
  const progress = goalAmount > 0 ? (totalDonations / goalAmount) * 100 : 0;
  const progressCapped = Math.min(progress, 100);
  const remaining = Math.max(goalAmount - totalDonations, 0);

  const getMilestone = () => {
    if (progress >= 100) return 'Goal Achieved! 🎉';
    if (progress >= 80) return `₹${remaining.toFixed(4)} ETH to complete the goal!`;
    if (progress >= 60) return `₹${remaining.toFixed(4)} ETH to unlock final stage`;
    if (progress >= 40) return `₹${remaining.toFixed(4)} ETH to reach 60%`;
    if (progress >= 20) return `₹${remaining.toFixed(4)} ETH to reach 40%`;
    return `₹${remaining.toFixed(4)} ETH to unlock first milestone`;
  };

  const charityColors = {
    Housing: 'from-orange-400 to-orange-600',
    Meals: 'from-amber-400 to-amber-600',
    Medical: 'from-rose-400 to-rose-600',
    Education: 'from-blue-400 to-blue-600',
    Equipment: 'from-teal-400 to-teal-600',
    RiverCleaning: 'from-cyan-400 to-cyan-600'
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-600">Progress</span>
        <span className="text-2xl font-bold text-gray-900">{progressCapped.toFixed(1)}%</span>
      </div>

      <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressCapped}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={`h-full bg-gradient-to-r ${charityColors[charityType] || 'from-emerald-400 to-emerald-600'} rounded-full`}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-emerald-200 hover:bg-emerald-50 transition-all cursor-pointer">
          <p className="text-xs text-gray-600 mb-1">Raised</p>
          <p className="text-lg font-bold text-gray-900">{totalDonations.toFixed(4)} ETH</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-emerald-200 hover:bg-emerald-50 transition-all cursor-pointer">
          <p className="text-xs text-gray-600 mb-1">Goal</p>
          <p className="text-lg font-bold text-gray-900">{goalAmount.toFixed(4)} ETH</p>
        </div>
      </div>

      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
        <p className="text-sm text-emerald-800 font-medium">{getMilestone()}</p>
      </div>
    </div>
  );
}
