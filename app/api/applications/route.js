import { ok, handle, requireUser } from '@/lib/api';
import { col } from '@/lib/db';
import { studentView } from '@/lib/screening';

export const dynamic = 'force-dynamic';

// "Permohonan saya": every application the student made, with status + organiser feedback.
export const GET = handle(async (req) => {
  const user = await requireUser(req);
  const events = await col('events');
  const list = await (await col('applications')).list({ userId: user.id }, { createdAt: -1 });
  const out = [];
  for (const a of list) {
    if (a.status === 'withdrawn') continue;
    const ev = await events.get(a.eventId);
    if (ev) out.push({ eventId: ev.id, eventTitle: ev.title, startsAt: ev.startsAt, ...studentView(a, ev) });
  }
  return ok({ applications: out });
});
