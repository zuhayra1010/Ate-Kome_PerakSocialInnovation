import { ok, handle, requireUser, bad, HttpError } from '@/lib/api';
import { col } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Drivers can cancel a ride that nobody has booked (the record is closed, not deleted).
export const DELETE = handle(async (req, { params }) => {
  const user = await requireUser(req);
  const carpools = await col('carpools');
  const cp = await carpools.get(params.id);
  if (!cp || cp.driverId !== user.id) throw new HttpError(404, 'Ride not found');
  if (cp.passengers.length) throw bad('Passengers have booked - message them before cancelling');
  await carpools.update(cp.id, { seats: 0, eventId: '__cancelled__' });
  return ok({ cancelled: true });
});
