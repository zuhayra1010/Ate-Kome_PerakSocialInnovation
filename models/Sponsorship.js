import mongoose from 'mongoose';

// A student club's sponsorship application to a sponsor
const SponsorshipSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    sponsorId: { type: String, required: true },
    sponsorName: { type: String, default: '' },
    eventName: { type: String, required: true },
    organizerName: { type: String, default: '' },
    amountRequested: { type: Number, default: 0 },
    message: { type: String, default: '' },
    pitchSnapshot: { type: Object, default: {} }, // the form data used to generate the PDF
    status: { type: String, enum: ['sent', 'viewed', 'accepted', 'declined'], default: 'sent' },
  },
  { timestamps: true }
);

export default mongoose.models.Sponsorship || mongoose.model('Sponsorship', SponsorshipSchema);
