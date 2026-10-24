import { ok, handle, requireUser, readJson } from '@/lib/api';
import { decide } from '@/lib/screening';

export const dynamic = 'force-dynamic';

export const POST = handle(async (req, { params }) => {
  const owner = await requireUser(req);
  const b = await readJson(req);
  const app = await decide(owner, params.id, b);
  return ok({ status: app.status, round: app.round });
});
