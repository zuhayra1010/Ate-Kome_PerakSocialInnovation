import { ok, handle, requireUser } from '@/lib/api';
import { col } from '@/lib/db';
import { matchScore, ratingSummary } from '@/lib/logic';
import { publicEvent } from '@/lib/views';

export const dynamic = 'force-dynamic';

// Smart Match: rank open events and gigs by course + skills + district.
export const GET = handle(async (req) => {
  const user = await requireUser(req);
  const rs = await ratingSummary();
  const events = (await (await col('events')).list())
    .map((e) => publicEvent(e, user, rs))
    .filter((e) => !e.ended && !e.myStatus && !e.isOwner && e.filled < e.slots && e.match.score > 0)
    .sort((a, b) => b.match.score - a.match.score || new Date(a.startsAt) - new Date(b.startsAt))
    .slice(0, 5);
  const gigs = (await (await col('gigs')).list())
    .filter((g) => g.verified && !g.applicants.some((a) => a.userId === user.id))
    .map((g) => ({ ...g, applicants: undefined, match: matchScore(user, g.tags, g.district) }))
    .filter((g) => g.match.score > 0)
    .sort((a, b) => b.match.score - a.match.score)
    .slice(0, 3);
  return ok({ events, gigs });
});
