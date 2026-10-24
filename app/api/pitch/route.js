import { handle, requireUser, readJson, bad, str, num } from '@/lib/api';
import { pitchPdf } from '@/lib/pdf';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Auto-Pitch Deck: form in, standard sponsorship proposal PDF out.
export const POST = handle(async (req) => {
  const user = await requireUser(req);
  const b = await readJson(req);
  const p = b.pitch || b;
  const eventName = str(p.eventName, 90);
  if (eventName.length < 4) throw bad('Event name is required');
  const clean = {
    eventName,
    organizerName: str(p.organizerName, 80) || user.name,
    institution: str(p.institution, 80) || user.university,
    objectives: str(p.objectives, 800),
    date: p.date ? str(p.date, 30) : '',
    venue: str(p.venue, 100),
    participants: num(p.participants, 0, 100000, 0),
    audience: str(p.audience, 120),
    amountRequested: num(p.amountRequested, 0, 1e7, 0),
    budgetItems: (Array.isArray(p.budgetItems) ? p.budgetItems : []).slice(0, 15).map((i) => ({ label: str(i.label, 60), amount: num(i.amount, 0, 1e7, 0) })),
    benefits: str(p.benefits, 600),
    contactName: str(p.contactName, 60) || user.name,
    contactPhone: str(p.contactPhone, 30),
    contactEmail: str(p.contactEmail, 80),
  };
  const bytes = await pitchPdf(clean, str(b.sponsorName, 80));
  return new Response(Buffer.from(bytes), {
    headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="proposal.pdf"` },
  });
});
