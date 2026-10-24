import { handle, requireUser } from '@/lib/api';
import { col } from '@/lib/db';
import { levelFor } from '@/lib/constants';
import { badgeDef } from '@/lib/badges';
import { ratingSummary } from '@/lib/logic';
import { resumePdf } from '@/lib/pdf';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const GET = handle(async (req) => {
  const user = await requireUser(req);
  const events = (await (await col('events')).list())
    .filter((e) => e.participants.some((p) => p.userId === user.id && p.status === 'checked_in'))
    .sort((a, b) => new Date(b.startsAt) - new Date(a.startsAt));
  const badges = (await (await col('badges')).list({ userId: user.id }, { earnedAt: -1 })).filter((b) => badgeDef(b.key));
  const bytes = await resumePdf({
    user, level: levelFor(user.lifetimePoints), events, badges, rating: (await ratingSummary()).student(user.id),
  });
  return new Response(Buffer.from(bytes), {
    headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename="moh-siswa-resume.pdf"' },
  });
});
