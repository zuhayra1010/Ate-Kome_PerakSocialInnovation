import mongoose from 'mongoose';

// A business / agency in the sponsorship directory
const SponsorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    industry: { type: String, default: 'General' },
    district: { type: String, default: 'Ipoh' },
    bio: { type: String, default: '' },
    supports: { type: [String], default: [] }, // cash | in-kind | venue | food | merchandise
    budgetRange: { type: String, default: '' }, // e.g. "RM500 - RM3,000"
    focus: { type: [String], default: [] }, // event categories they like
    contactEmail: { type: String, default: '' },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Sponsor || mongoose.model('Sponsor', SponsorSchema);
