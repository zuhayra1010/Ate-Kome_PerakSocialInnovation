import { ok, handle, requireUser } from '@/lib/api';
import { col } from '@/lib/db';
import { matchScore } from '@/lib/logic';

export const dynamic = 'force-dynamic';

export const GET = handle(async (req) => {
  const user = await requireUser(req);
  const gigs = (await (await col('gigs')).list())
    .map(({ applicants, ...g }) => ({
      ...g,
      applied: applicants.some((a) => a.userId === user.id),
      applicantCount: applicants.length,
      match: matchScore(user, g.tags, g.district),
    }))
    .sort((a, b) => Number(b.verified) - Number(a.verified) || b.match.score - a.match.score);
  return ok({ gigs });
});
