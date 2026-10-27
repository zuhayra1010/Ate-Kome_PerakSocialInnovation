import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    university: { type: String, required: true },
    course: { type: String, required: true },
    skills: { type: [String], default: [] }, // tag keys, see lib/constants.js
    district: { type: String, default: '' },
    bio: { type: String, default: '' },
    linkedinUrl: { type: String, default: '' },
        resume: { type: Object, default: {} },
    points: { type: Number, default: 0 }, // spendable balance
    lifetimePoints: { type: Number, default: 0 }, // drives level, never decreases
    streak: { type: Number, default: 0 }, // consecutive weeks with a check-in
    lastCheckinWeek: { type: Number, default: -1 },
    isSeed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model('User', UserSchema);
