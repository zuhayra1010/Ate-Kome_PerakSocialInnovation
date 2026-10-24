import mongoose from 'mongoose';

// Micro-credential earned by a student. Definitions live in lib/badges.js.
const BadgeSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    key: { type: String, required: true }, // e.g. "crisis-management"
    title: { type: String, required: true },
    issuer: { type: String, default: 'Moh Siswa!' },
    // true only after a partner agency signs off - not automatic
    verifiedByAgency: { type: Boolean, default: false },
    earnedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

BadgeSchema.index({ userId: 1, key: 1 }, { unique: true });

export default mongoose.models.Badge || mongoose.model('Badge', BadgeSchema);
