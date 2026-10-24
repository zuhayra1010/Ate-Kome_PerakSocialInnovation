import mongoose from 'mongoose';

// Ledger of every Perak Point movement. User.points is the cached balance.
const PointTxSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    amount: { type: Number, required: true }, // + earn, - redeem
    kind: { type: String, enum: ['earn', 'bonus', 'carpool', 'redeem'], required: true },
    reason: { type: String, required: true },
    refId: { type: String, default: '' }, // event / reward id
  },
  { timestamps: true }
);

export default mongoose.models.PointTx || mongoose.model('PointTx', PointTxSchema);
