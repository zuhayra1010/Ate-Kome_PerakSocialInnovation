import { ok, handle, requireUser, readJson, bad, str, num } from '@/lib/api';
import { col } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Moh Tumpang! - list rides for upcoming events, optionally for one event.
export const GET = handle(async (req) => {
  const user = await requireUser(req);
  const eventId = new URL(req.url).searchParams.get('eventId');
  const events = await (await col('events')).list();
  const evMap = Object.fromEntries(events.map((e) => [e.id, e]));
  let rides = await (await col('carpools')).list(eventId ? { eventId } : {});
  rides = rides
    .filter((c) => evMap[c.eventId] && new Date(evMap[c.eventId].startsAt).getTime() > Date.now() - 6 * 3600e3)
    .map((c) => {
      const ev = evMap[c.eventId];
      return {
        id: c.id, eventId: c.eventId, eventTitle: ev.title, eventDistrict: ev.district, eventStartsAt: ev.startsAt,
        driverName: c.driverName, from: c.from, departAt: c.departAt, seats: c.seats, note: c.note,
        seatsLeft: c.seats - c.passengers.length,
        isDriver: c.driverId === user.id,
        booked: c.passengers.some((p) => p.userId === user.id),
        passengers: c.driverId === user.id ? c.passengers.map((p) => p.name) : undefined,
      };
    })
    .sort((a, b) => new Date(a.departAt) - new Date(b.departAt));
  return ok({ rides });
});

export const POST = handle(async (req) => {
  const user = await requireUser(req);
  const b = await readJson(req);
  const ev = await (await col('events')).get(String(b.eventId || ''));
  if (!ev) throw bad('Pick an event');
  if (!ev.participants.some((p) => p.userId === user.id)) throw bad('Join the event before offering a ride');
  const departAt = new Date(b.departAt);
  if (isNaN(departAt) || departAt >= new Date(ev.startsAt)) throw bad('Departure must be before the event starts');
  const from = str(b.from, 80);
  if (from.length < 3) throw bad('Where are you leaving from?');
  const carpools = await col('carpools');
  if ((await carpools.list({ eventId: ev.id, driverId: user.id })).length) throw bad('You already offered a ride for this event');
  const cp = await carpools.create({
    eventId: ev.id, driverId: user.id, driverName: user.name, from, departAt,
    seats: num(b.seats, 1, 6, 3), note: str(b.note, 140), passengers: [], bonusPaid: false,
  });
  return ok({ ride: { id: cp.id } }, { status: 201 });
});
