import { ok, handle, requireUser } from '@/lib/api';
import { col } from '@/lib/db';

export const dynamic = 'force-dynamic';

export const GET = handle(async (req) => {
  const user = await requireUser(req);
  const [rewards, redemptions, txs] = await Promise.all([
    (await col('rewards')).list({}, { cost: 1 }),
    (await col('redemptions')).list({ userId: user.id }, { createdAt: -1 }),
    (await col('pointtxs')).list({ userId: user.id }, { createdAt: -1 }),
  ]);
  return ok({ rewards, redemptions, txs: txs.slice(0, 30), points: user.points });
});
