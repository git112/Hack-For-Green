import mongoose from 'mongoose';

const rewardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: String,
    pointsRequired: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      enum: ['transport', 'food', 'retail', 'entertainment', 'health', 'other'],
      required: true,
    },
    partner: String,
    validUntil: Date,
    redeemInstructions: String,
    image: String,
    available: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Reward', rewardSchema);

const userRewardSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reward: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reward',
      required: true,
    },
    redemptionCode: String,
    redeemedAt: Date,
    status: {
      type: String,
      enum: ['pending', 'redeemed', 'used', 'expired'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

export const UserReward = mongoose.model('UserReward', userRewardSchema);
