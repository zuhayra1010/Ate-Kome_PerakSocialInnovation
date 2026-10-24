import { ok, handle } from '@/lib/api';
import { col, isDemo } from '@/lib/db';

export const dynamic = 'force-dynamic';

export const GET = handle(async () => {
  const events = await (await col('events')).count();
  return ok({ status: 'ok', mode: isDemo ? 'demo (in-memory)' : 'mongodb', events });
});
