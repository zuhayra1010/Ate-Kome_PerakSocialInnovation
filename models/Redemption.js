import mongoose from 'mongoose';

const RedemptionSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    rewardId: { type: String, required: true },
    rewardTitle: { type: String, default: '' },
    cost: { type: Number, required: true },
    code: { type: String, required: true }, // voucher code shown to the student
    status: { type: String, enum: ['issued', 'used'], default: 'issued' },
  },
  { timestamps: true }
);

export default mongoose.models.Redemption || mongoose.model('Redemption', RedemptionSchema);
