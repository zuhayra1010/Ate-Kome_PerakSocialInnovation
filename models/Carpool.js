import mongoose from 'mongoose';

const PassengerSchema = new mongoose.Schema(
  { userId: { type: String, required: true }, name: String, bookedAt: { type: Date, default: Date.now } },
  { _id: false }
);

// "Moh Tumpang!" - a student driver offers seats to an event
const CarpoolSchema = new mongoose.Schema(
  {
    eventId: { type: String, required: true },
    driverId: { type: String, required: true },
    driverName: { type: String, default: '' },
    from: { type: String, required: true }, // e.g. "UTP, Seri Iskandar"
    departAt: { type: Date, required: true },
    seats: { type: Number, default: 3, min: 1, max: 6 },
    note: { type: String, default: '' }, // meeting point, petrol share, etc.
    passengers: { type: [PassengerSchema], default: [] },
    bonusPaid: { type: Boolean, default: false }, // driver bonus paid once
  },
  { timestamps: true }
);

export default mongoose.models.Carpool || mongoose.model('Carpool', CarpoolSchema);
