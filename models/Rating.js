import mongoose from 'mongoose';

// Two-way ratings.
//  direction "student_to_organizer": targetId = eventId (rates the organiser/event)
//  direction "organizer_to_student": targetId = studentId, eventId = the event
const RatingSchema = new mongoose.Schema(
  {
    direction: { type: String, enum: ['student_to_organizer', 'organizer_to_student'], required: true },
    fromUserId: { type: String, required: true },
    targetId: { type: String, required: true },
    eventId: { type: String, required: true },
    stars: { type: Number, required: true, min: 1, max: 5 },
    tags: { type: [String], default: [] }, // "Food provided", "Clear tasks", ...
    comment: { type: String, default: '', maxlength: 300 },
  },
  { timestamps: true }
);

export default mongoose.models.Rating || mongoose.model('Rating', RatingSchema);
