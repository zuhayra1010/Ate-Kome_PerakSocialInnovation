import mongoose from 'mongoose';

// One student's application to an event that uses screening.
// Stages: 0 = application review, 1..N = interview rounds configured by the organiser.
const HistorySchema = new mongoose.Schema(
  {
    stage: { type: String, required: true }, // "Application review", "Round 1", ...
    decision: { type: String, enum: ['advance', 'accept', 'reject'], required: true },
    feedback: { type: String, default: '' }, // shown to the student
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ApplicationSchema = new mongoose.Schema(
  {
    eventId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    userName: { type: String, default: '' },
    answers: { type: [{ q: String, a: String, _id: false }], default: [] },
    status: { type: String, enum: ['pending', 'interview', 'accepted', 'rejected', 'withdrawn'], default: 'pending' },
    round: { type: Number, default: 0 }, // current stage; 0 = application review
    interviewAt: { type: Date }, // optional time the organiser sets for the current round
    history: { type: [HistorySchema], default: [] },
  },
  { timestamps: true }
);

ApplicationSchema.index({ eventId: 1, userId: 1 }, { unique: true });

export default mongoose.models.Application || mongoose.model('Application', ApplicationSchema);
