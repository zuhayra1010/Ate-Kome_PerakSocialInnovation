import { handle, requireUser } from '@/lib/api';
import { col } from '@/lib/db';
import { badgeDef } from '@/lib/badges';
import { loadResume } from '@/lib/resumeData';
import { buildResumePdf } from '@/lib/resumePdf';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const GET = handle(async (req) => {
  const user = await requireUser(req);
  const { resume } = await loadResume(user);
  const badges = (await (await col('badges')).list({ userId: user.id }, { earnedAt: -1 })).filter((b) => badgeDef(b.key));
  const bytes = await buildResumePdf({ user, resume, badges });
  return new Response(Buffer.from(bytes), {
    headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename="resume.pdf"' },
  });
});