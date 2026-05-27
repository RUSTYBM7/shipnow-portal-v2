/**
 * AirPak Express - Rewards Page
 * Display user rewards and loyalty points
 */

import React from 'react';
import { Gift, Trophy, Star, ChevronRight, Sparkles, Package } from 'lucide-react';

interface RewardsPageProps {}

const RewardsPage: React.FC<RewardsPageProps> = () => {
  const rewards = [
    { id: 1, title: 'Free Express Shipping', description: 'Get free express delivery on your next shipment', points: 500, icon: Package },
    { id: 2, title: 'Priority Support', description: 'Skip the queue with 24/7 priority support access', points: 750, icon: Star },
    { id: 3, title: 'Discount Voucher', description: '15% off any shipment under 5kg', points: 1000, icon: Gift },
  ];

  const tierBenefits = {
    bronze: ['Basic tracking', 'Email support', 'Standard shipping rates'],
    silver: ['Advanced tracking', 'Priority email support', '5% discount on all shipments', 'Free signature confirmation'],
    gold: ['Real-time tracking', '24/7 phone support', '10% discount on all shipments', 'Free insurance up to $500', 'Priority customs clearance'],
    platinum: ['Premium tracking with SMS', 'Dedicated account manager', '15% discount on all shipments', 'Free insurance up to $2000', 'White glove delivery', 'Exclusive platinum events']
  };

  const userTier = 'gold';
  const userPoints = 2450;
  const nextTier = 'platinum';
  const pointsToNextTier = 5000 - userPoints;

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Rewards & Loyalty</h1>
        <p className="text-gray-400 mt-1">Earn points with every shipment and redeem exclusive rewards</p>
      </div>

      {/* Points Card */}
      <div className="bg-gradient-to-r from-[#E31837] to-[#B01030] rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm opacity-80">Available Points</p>
            <p className="text-4xl font-bold mt-1">{userPoints.toLocaleString()}</p>
            <p className="text-sm opacity-80 mt-2">
              {pointsToNextTier.toLocaleString()} points to {nextTier}
            </p>
          </div>
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
            <Trophy size={32} />
          </div>
        </div>
        <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full"
            style={{ width: `${(userPoints / 5000) * 100}%` }}
          />
        </div>
        <p className="text-xs mt-2 opacity-80">{Math.round((userPoints / 5000) * 100)}% progress to Platinum</p>
      </div>

      {/* Current Tier Benefits */}
      <div className="bg-[#1C1C1E] rounded-2xl p-6 border border-white/5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center">
            <Sparkles size={20} className="text-yellow-500" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Current Tier</p>
            <p className="text-lg font-semibold text-yellow-500 capitalize">{userTier} Member</p>
          </div>
        </div>
        <div className="space-y-3">
          {tierBenefits[userTier as keyof typeof tierBenefits].map((benefit, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-sm text-gray-300">{benefit}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Redeemable Rewards */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Available Rewards</h2>
        <div className="grid gap-4">
          {rewards.map((reward) => (
            <div
              key={reward.id}
              className="bg-[#1C1C1E] border border-white/5 rounded-2xl p-4 flex items-center justify-between hover:border-white/10 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#E31837]/10 rounded-xl flex items-center justify-center">
                  <reward.icon size={24} className="text-[#E31837]" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{reward.title}</h3>
                  <p className="text-sm text-gray-400 mt-1">{reward.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-[#E31837]">{reward.points}</span>
                <ChevronRight size={20} className="text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How to Earn */}
      <div className="bg-[#1C1C1E] rounded-2xl p-6 border border-white/5">
        <h2 className="text-lg font-semibold text-white mb-4">How to Earn Points</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Package size={24} className="text-blue-500" />
            </div>
            <p className="text-sm text-gray-400">Per Shipment</p>
            <p className="text-lg font-semibold text-white mt-1">100 points</p>
          </div>
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Star size={24} className="text-green-500" />
            </div>
            <p className="text-sm text-gray-400">Leave a Review</p>
            <p className="text-lg font-semibold text-white mt-1">50 points</p>
          </div>
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Gift size={24} className="text-purple-500" />
            </div>
            <p className="text-sm text-gray-400">Refer a Friend</p>
            <p className="text-lg font-semibold text-white mt-1">200 points</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RewardsPage;