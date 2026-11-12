import { handle, requireUser, bad, HttpError } from '@/lib/api';
import { col } from '@/lib/db';
import { certificatePdf } from '@/lib/pdf';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const GET = handle(async (req) => {
  const user = await requireUser(req);
  const id = new URL(req.url).searchParams.get('eventId') || '';
  const ev = await (await col('events')).get(id);
  if (!ev) throw new HttpError(404, 'Event not found');
  if (ev.participants.find((p) => p.userId === user.id)?.status !== 'checked_in') throw bad('Certificates are only issued after check-in');
  const bytes = await certificatePdf({ user, event: ev, hours: ev.durationHrs });
  return new Response(Buffer.from(bytes), {
    headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename="certificate.pdf"' },
  });
});
