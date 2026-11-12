import { ok, handle, requireUser, HttpError } from '@/lib/api';
import { col } from '@/lib/db';
import { ratingSummary } from '@/lib/logic';
import { publicEvent } from '@/lib/views';
import { studentView } from '@/lib/screening';

export const dynamic = 'force-dynamic';

export const GET = handle(async (req, { params }) => {
  const user = await requireUser(req);
  const ev = await (await col('events')).get(params.id);
  if (!ev) throw new HttpError(404, 'Event not found');
  const rs = await ratingSummary();
  const out = publicEvent(ev, user, rs);
  const apps = await col('applications');

  if (out.isOwner) {
    const users = await col('users');
    const ratings = await (await col('ratings')).list({ direction: 'organizer_to_student', eventId: ev.id });
    // accepted volunteers, so the organiser can see who showed up and rate them
    out.roster = await Promise.all(
      ev.participants.map(async (p) => ({
        userId: p.userId, status: p.status, name: (await users.get(p.userId))?.name || 'Student',
        rated: ratings.some((r) => r.targetId === p.userId),
      }))
    );
    // screening: Teams links are only ever sent to the organiser here, and to a student for their own round
    out.teamsLinks = (ev.screening?.rounds || []).map((r) => ({ name: r.name, teamsLink: r.teamsLink }));
    const list = (await apps.list({ eventId: ev.id })).filter((a) => a.status !== 'withdrawn');
    out.applications = await Promise.all(
      list.map(async (a) => {
        const u = await users.get(a.userId);
        const r = rs.student(a.userId);
        return {
          id: a.id, name: a.userName || u?.name || 'Student', course: u?.course || '', university: u?.university || '',
          rating: { avg: r.avg, count: r.count }, answers: a.answers || [], status: a.status, round: a.round,
          interviewAt: a.interviewAt || null, history: a.history || [],
        };
      })
    );
  } else {
    const mine = (await apps.list({ eventId: ev.id, userId: user.id }))[0];
    out.myApplication = mine && mine.status !== 'withdrawn' ? studentView(mine, ev) : null;
  }

  out.iRated = (await (await col('ratings')).list({ direction: 'student_to_organizer', eventId: ev.id })).some((r) => r.fromUserId === user.id);
  return ok({ event: out });
});
