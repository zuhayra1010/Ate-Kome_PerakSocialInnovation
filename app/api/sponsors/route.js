import { ok, handle, requireUser } from '@/lib/api';
import { col } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Sponsorship Matchmaker: directory, ranked by how well a sponsor's focus matches ?category=
export const GET = handle(async (req) => {
  await requireUser(req);
  const category = new URL(req.url).searchParams.get('category');
  const sponsors = (await (await col('sponsors')).list())
    .map((s) => ({ ...s, fit: category && s.focus.includes(category) ? 1 : 0 }))
    .sort((a, b) => b.fit - a.fit || Number(b.verified) - Number(a.verified) || a.name.localeCompare(b.name));
  return ok({ sponsors });
});
