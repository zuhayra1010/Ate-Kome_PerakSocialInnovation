import { ok, handle, requireUser, bad, HttpError } from '@/lib/api';
import { col } from '@/lib/db';
import { joinEvent } from '@/lib/logic';

export const dynamic = 'force-dynamic';

export const POST = handle(async (req, { params }) => {
  const user = await requireUser(req);
  const ev = await (await col('events')).get(params.id);
  if (ev?.createdBy === user.id) throw bad('You are organising this event');
  if (ev?.screening?.enabled) throw bad('This event needs an application first');
  await joinEvent(user, params.id);
  return ok({ joined: true });
});

// Leave an event you have not checked in to (frees the slot, cancels any carpool seat).
export const DELETE = handle(async (req, { params }) => {
  const user = await requireUser(req);
  const events = await col('events');
  const ev = await events.get(params.id);
  if (!ev) throw new HttpError(404, 'Event not found');
  const p = ev.participants.find((x) => x.userId === user.id);
  if (!p) throw bad('You have not joined this event');
  if (p.status === 'checked_in') throw bad('You already checked in');
  await events.update(ev.id, { participants: ev.participants.filter((x) => x.userId !== user.id) });
  const carpools = await col('carpools');
  for (const cp of await carpools.list({ eventId: ev.id })) {
    if (cp.passengers.some((x) => x.userId === user.id)) {
      await carpools.update(cp.id, { passengers: cp.passengers.filter((x) => x.userId !== user.id) });
    }
  }
  const apps = await col('applications');
  for (const a of await apps.list({ eventId: ev.id, userId: user.id })) await apps.update(a.id, { status: 'withdrawn' });
  return ok({ left: true });
});
