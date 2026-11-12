import { ok, handle, requireUser, bad, HttpError } from '@/lib/api';
import { col } from '@/lib/db';
import { awardPoints } from '@/lib/logic';
import { randomBytes } from 'node:crypto';

export const dynamic = 'force-dynamic';

export const POST = handle(async (req, { params }) => {
  const user = await requireUser(req);
  const rewards = await col('rewards');
  const r = await rewards.get(params.id);
  if (!r) throw new HttpError(404, 'Reward not found');
  if (r.stock === 0) throw bad('Out of stock');
  if (user.points < r.cost) throw bad(`You need ${r.cost - user.points} more Perak Points`);
  await awardPoints(user.id, -r.cost, 'redeem', `Redeemed: ${r.title}`, r.id);
  if (r.stock > 0) await rewards.update(r.id, { stock: r.stock - 1 });
  const h = randomBytes(4).toString('hex').toUpperCase();
  const red = await (await col('redemptions')).create({
    userId: user.id, rewardId: r.id, rewardTitle: r.title, cost: r.cost, code: `MS-${h.slice(0, 4)}-${h.slice(4)}`, status: 'issued',
  });
  return ok({ redemption: red }, { status: 201 });
});
