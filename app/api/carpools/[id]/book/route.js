import { ok, handle, requireUser, bad, HttpError } from '@/lib/api';
import { col } from '@/lib/db';

export const dynamic = 'force-dynamic';

export const POST = handle(async (req, { params }) => {
  const user = await requireUser(req);
  const carpools = await col('carpools');
  const cp = await carpools.get(params.id);
  if (!cp) throw new HttpError(404, 'Ride not found');
  if (cp.driverId === user.id) throw bad('This is your own ride');
  if (cp.passengers.length >= cp.seats) throw bad('No seats left');
  if (cp.passengers.some((p) => p.userId === user.id)) throw bad('You already booked this ride');
  const ev = await (await col('events')).get(cp.eventId);
  if (!ev?.participants.some((p) => p.userId === user.id)) throw bad('Join the event first, then book a ride');
  // one ride per event
  const others = await carpools.list({ eventId: cp.eventId });
  if (others.some((o) => o.passengers.some((p) => p.userId === user.id))) throw bad('You already have a ride to this event');
  cp.passengers.push({ userId: user.id, name: user.name, bookedAt: new Date() });
  await carpools.update(cp.id, { passengers: cp.passengers });
  return ok({ booked: true });
});

export const DELETE = handle(async (req, { params }) => {
  const user = await requireUser(req);
  const carpools = await col('carpools');
  const cp = await carpools.get(params.id);
  if (!cp) throw new HttpError(404, 'Ride not found');
  if (!cp.passengers.some((p) => p.userId === user.id)) throw bad('You have no seat on this ride');
  await carpools.update(cp.id, { passengers: cp.passengers.filter((p) => p.userId !== user.id) });
  return ok({ cancelled: true });
});
