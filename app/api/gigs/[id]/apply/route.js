import { ok, handle, requireUser, bad, HttpError } from '@/lib/api';
import { col } from '@/lib/db';
import { ratingSummary } from '@/lib/logic';

export const dynamic = 'force-dynamic';

export const POST = handle(async (req, { params }) => {
  const user = await requireUser(req);
  const gigs = await col('gigs');
  const g = await gigs.get(params.id);
  if (!g) throw new HttpError(404, 'Gig not found');
  if (!g.verified) throw bad('This employer is not verified yet, so applications are closed');
  if (g.applicants.some((a) => a.userId === user.id)) throw bad('You already applied');
  const r = (await ratingSummary()).student(user.id);
  // Community Rating System: well-rated students go to the front of the queue.
  const priority = r.count >= 1 && r.avg >= 4.5;
  g.applicants.push({ userId: user.id, appliedAt: new Date(), priority, avgRating: r.avg });
  await gigs.update(g.id, { applicants: g.applicants });
  return ok({ applied: true, priority });
});
