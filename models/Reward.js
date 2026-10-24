import mongoose from 'mongoose';

const RewardSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    cost: { type: Number, required: true },
    provider: { type: String, default: '' },
    emoji: { type: String, default: '🎁' },
    stock: { type: Number, default: -1 }, // -1 = unlimited
  },
  { timestamps: true }
);

export default mongoose.models.Reward || mongoose.model('Reward', RewardSchema);
