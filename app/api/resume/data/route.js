import { ok, handle, requireUser, readJson } from '@/lib/api';
import { col } from '@/lib/db';
import { cleanResume, loadResume } from '@/lib/resumeData';

export const dynamic = 'force-dynamic';

export const GET = handle(async (req) => {
  const user = await requireUser(req);
  return ok(await loadResume(user));
});

export const PUT = handle(async (req) => {
  const user = await requireUser(req);
  const body = await readJson(req);
  await (await col('users')).update(user.id, { resume: { ...cleanResume(body), saved: true } });
  return ok({ saved: true });
});