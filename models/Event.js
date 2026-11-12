import mongoose from 'mongoose';

const ParticipantSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    status: { type: String, enum: ['joined', 'checked_in'], default: 'joined' },
    joinedAt: { type: Date, default: Date.now },
    checkedInAt: { type: Date },
    pointsAwarded: { type: Number, default: 0 },
  },
  { _id: false }
);

// Optional screening: the organiser asks questions and/or runs interview rounds
// (each round can carry a Microsoft Teams meeting link) before a student is accepted.
// Student applications live in the separate "applications" collection (models/Application.js).
const ScreeningSchema = new mongoose.Schema(
  {
    enabled: { type: Boolean, default: false },
    questions: { type: [String], default: [] },
    rounds: { type: [{ name: String, teamsLink: String, _id: false }], default: [] }, // 0 rounds = questionnaire only
  },
  { _id: false }
);

const EventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    category: {
      type: String,
      enum: ['environment', 'education', 'community', 'digital', 'disaster', 'health', 'culture'],
      default: 'community',
    },
    organizer: {
      name: { type: String, required: true },
      type: { type: String, enum: ['NGO', 'PBT', 'Community', 'Student Club'], default: 'Community' },
      verified: { type: Boolean, default: false }, // set by admin review, never by the organiser
    },
    district: { type: String, required: true },
    venue: { type: String, default: '' },
    startsAt: { type: Date, required: true },
    durationHrs: { type: Number, default: 3 },
    points: { type: Number, default: 30 },
    slots: { type: Number, default: 20 },
    tags: { type: [String], default: [] },
    skillsCustom: { type: [String], default: [] }, // organiser's own free-text skills
    screening: { type: ScreeningSchema, default: () => ({}) },
    checkInCode: { type: String, required: true }, // organiser shares on the day
    createdBy: { type: String, default: '' }, // userId, '' for seeded events
    participants: { type: [ParticipantSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.models.Event || mongoose.model('Event', EventSchema);
