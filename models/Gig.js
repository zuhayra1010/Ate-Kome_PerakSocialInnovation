import mongoose from 'mongoose';

const ApplicantSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    appliedAt: { type: Date, default: Date.now },
    priority: { type: Boolean, default: false }, // high-rated students get priority
    avgRating: { type: Number, default: 0 },
  },
  { _id: false }
);

const GigSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    employer: { type: String, required: true },
    description: { type: String, default: '' },
    district: { type: String, default: 'Seri Iskandar' },
    nearCampus: { type: String, default: '' },
    payRate: { type: Number, required: true }, // RM
    payUnit: { type: String, enum: ['hour', 'day', 'task'], default: 'hour' },
    hoursPerWeek: { type: Number, default: 10 },
    tags: { type: [String], default: [] },
    verified: { type: Boolean, default: false },
    applicants: { type: [ApplicantSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.models.Gig || mongoose.model('Gig', GigSchema);
