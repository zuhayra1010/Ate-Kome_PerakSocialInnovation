import { ok, handle, requireUser, readJson, bad, HttpError } from '@/lib/api';
import { col } from '@/lib/db';
import { applyToEvent, studentView } from '@/lib/screening';

export const dynamic = 'force-dynamic';

export const POST = handle(async (req, { params }) => {
  const user = await requireUser(req);
  const ev = await (await col('events')).get(params.id);
  if (!ev) throw new HttpError(404, 'Event not found');
  const { answers } = await readJson(req);
  const app = await applyToEvent(user, ev, Array.isArray(answers) ? answers : []);
  return ok({ application: studentView(app, ev) }, { status: 201 });
});

// Withdraw an application (or, if already accepted, leave the event).
export const DELETE = handle(async (req, { params }) => {
  const user = await requireUser(req);
  const apps = await col('applications');
  const app = (await apps.list({ eventId: params.id, userId: user.id }))[0];
  if (!app || app.status === 'withdrawn' || app.status === 'rejected') throw bad('Nothing to withdraw');
  if (app.status === 'accepted') throw bad('You were accepted - use "Keluar dari aktiviti" instead');
  await apps.update(app.id, { status: 'withdrawn' });
  return ok({ withdrawn: true });
});
