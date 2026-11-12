import { ok, handle, requireUser, readJson, bad, str, num } from '@/lib/api';
import { col } from '@/lib/db';

export const dynamic = 'force-dynamic';

export const GET = handle(async (req) => {
  const user = await requireUser(req);
  return ok({ applications: await (await col('sponsorships')).list({ userId: user.id }, { createdAt: -1 }) });
});

// Apply: stores the pitch form + a short message. The PDF itself is re-generated
// from pitchSnapshot via /api/pitch, so nothing large is stored.
export const POST = handle(async (req) => {
  const user = await requireUser(req);
  const b = await readJson(req);
  const sponsor = await (await col('sponsors')).get(String(b.sponsorId || ''));
  if (!sponsor) throw bad('Pick a sponsor');
  const p = b.pitch || {};
  const eventName = str(p.eventName, 90);
  if (eventName.length < 4) throw bad('Fill in the event name first');
  const existing = await (await col('sponsorships')).list({ userId: user.id, sponsorId: sponsor.id });
  if (existing.some((x) => x.eventName === eventName)) throw bad('You already applied to this sponsor for this event');
  const app = await (await col('sponsorships')).create({
    userId: user.id, sponsorId: sponsor.id, sponsorName: sponsor.name, eventName,
    organizerName: str(p.organizerName, 80), amountRequested: num(p.amountRequested, 0, 1e7, 0),
    message: str(b.message, 400), pitchSnapshot: p, status: 'sent',
  });
  return ok({ application: app }, { status: 201 });
});
