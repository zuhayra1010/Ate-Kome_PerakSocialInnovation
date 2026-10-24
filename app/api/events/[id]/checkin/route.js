import { ok, handle, requireUser, readJson } from '@/lib/api';
import { checkIn } from '@/lib/logic';

export const dynamic = 'force-dynamic';

export const POST = handle(async (req, { params }) => {
  const user = await requireUser(req);
  const { code } = await readJson(req);
  return ok(await checkIn(user, params.id, code));
});
