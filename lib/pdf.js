// PDF generation with pdf-lib (pure JS, works on Vercel serverless).
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const PURPLE = rgb(0.42, 0.27, 0.9);
const INK = rgb(0.12, 0.1, 0.2);
const MUTED = rgb(0.4, 0.38, 0.5);
const SOFT = rgb(0.95, 0.93, 1);

// pdf-lib's standard fonts only cover WinAnsi; strip anything else (emoji etc.)
const safe = (s) => String(s ?? '').replace(/[^\x20-\x7E -ÿ]/g, '').replace(/\s+/g, ' ');

async function start() {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const W = 595, H = 842, M = 48;
  const ctx = { doc, font, bold, W, H, M, page: null, y: 0 };
  newPage(ctx);
  return ctx;
}

function newPage(ctx) {
  ctx.page = ctx.doc.addPage([ctx.W, ctx.H]);
  ctx.y = ctx.H - ctx.M;
}

function ensure(ctx, h) {
  if (ctx.y - h < ctx.M + 24) newPage(ctx);
}

function wrap(text, font, size, maxW) {
  const out = [];
  for (const para of safe(text).split(/\n/)) {
    let line = '';
    for (const word of para.split(' ')) {
      const t = line ? line + ' ' + word : word;
      if (font.widthOfTextAtSize(t, size) > maxW && line) {
        out.push(line);
        line = word;
      } else line = t;
    }
    out.push(line);
  }
  return out;
}

function text(ctx, s, { size = 11, bold = false, color = INK, gap = 4, indent = 0 } = {}) {
  const f = bold ? ctx.bold : ctx.font;
  for (const line of wrap(s, f, size, ctx.W - ctx.M * 2 - indent)) {
    ensure(ctx, size + gap);
    ctx.page.drawText(line, { x: ctx.M + indent, y: ctx.y - size, size, font: f, color });
    ctx.y -= size + gap;
  }
}

function heading(ctx, s) {
  ensure(ctx, 40);
  ctx.y -= 10;
  ctx.page.drawRectangle({ x: ctx.M, y: ctx.y - 20, width: ctx.W - ctx.M * 2, height: 22, color: SOFT });
  ctx.page.drawText(safe(s).toUpperCase(), { x: ctx.M + 8, y: ctx.y - 14, size: 10, font: ctx.bold, color: PURPLE });
  ctx.y -= 30;
}

function banner(ctx, title, subtitle) {
  ctx.page.drawRectangle({ x: 0, y: ctx.H - 120, width: ctx.W, height: 120, color: PURPLE });
  ctx.page.drawText('MOH SISWA!', { x: ctx.M, y: ctx.H - 40, size: 11, font: ctx.bold, color: rgb(1, 1, 1) });
  const lines = wrap(title, ctx.bold, 24, ctx.W - ctx.M * 2);
  let y = ctx.H - 72;
  for (const l of lines.slice(0, 2)) {
    ctx.page.drawText(l, { x: ctx.M, y, size: 24, font: ctx.bold, color: rgb(1, 1, 1) });
    y -= 28;
  }
  if (subtitle) ctx.page.drawText(safe(subtitle), { x: ctx.M, y: ctx.H - 108, size: 11, font: ctx.font, color: rgb(0.93, 0.9, 1) });
  ctx.y = ctx.H - 120 - 24;
}

function footers(ctx, label) {
  const pages = ctx.doc.getPages();
  pages.forEach((p, i) => {
    p.drawText(safe(`${label}  -  Page ${i + 1} of ${pages.length}`), { x: ctx.M, y: 24, size: 8, font: ctx.font, color: MUTED });
  });
}

const rm = (n) => 'RM ' + Number(n || 0).toLocaleString('en-MY');
const dateStr = (d) => new Date(d).toLocaleDateString('en-MY', { day: 'numeric', month: 'long', year: 'numeric' });

/* ---------- Auto-Pitch Deck (sponsorship proposal / kertas kerja) ---------- */
export async function pitchPdf(p, sponsorName) {
  const ctx = await start();
  banner(ctx, p.eventName, `Sponsorship proposal  |  ${p.organizerName}`);

  if (sponsorName) text(ctx, `Prepared for: ${sponsorName}`, { bold: true, size: 12, gap: 8 });
  text(ctx, `Date prepared: ${dateStr(new Date())}`, { color: MUTED, gap: 8 });

  heading(ctx, '1. Introduction');
  text(ctx, `${p.organizerName} from ${p.institution || 'a higher learning institution in Perak'} is organising "${p.eventName}"${p.date ? ' on ' + dateStr(p.date) : ''}${p.venue ? ' at ' + p.venue : ''}. We respectfully invite you to partner with us as a sponsor.`, { size: 11, gap: 5 });

  heading(ctx, '2. Objectives');
  const objs = String(p.objectives || '').split(/\n|;/).map((s) => s.trim()).filter(Boolean);
  (objs.length ? objs : ['To benefit the community in Perak']).forEach((o, i) => text(ctx, `${i + 1}. ${o}`, { indent: 8, gap: 4 }));

  heading(ctx, '3. Event details');
  [
    ['Expected participants', p.participants ? String(p.participants) : '-'],
    ['Target audience', p.audience || 'University students and local community'],
    ['Date', p.date ? dateStr(p.date) : 'To be confirmed'],
    ['Venue', p.venue || 'To be confirmed'],
  ].forEach(([k, v]) => {
    ensure(ctx, 16);
    ctx.page.drawText(k, { x: ctx.M + 8, y: ctx.y - 11, size: 10, font: ctx.bold, color: MUTED });
    ctx.page.drawText(safe(v), { x: ctx.M + 170, y: ctx.y - 11, size: 11, font: ctx.font, color: INK });
    ctx.y -= 18;
  });

  heading(ctx, '4. Budget');
  const items = (p.budgetItems || []).filter((i) => i.label && Number(i.amount) > 0);
  let total = 0;
  items.forEach((i) => {
    total += Number(i.amount);
    ensure(ctx, 16);
    ctx.page.drawText(safe(i.label), { x: ctx.M + 8, y: ctx.y - 11, size: 11, font: ctx.font, color: INK });
    const amt = rm(i.amount);
    ctx.page.drawText(amt, { x: ctx.W - ctx.M - ctx.font.widthOfTextAtSize(amt, 11) - 8, y: ctx.y - 11, size: 11, font: ctx.font, color: INK });
    ctx.y -= 18;
  });
  const requested = Number(p.amountRequested) || total;
  ensure(ctx, 24);
  ctx.page.drawLine({ start: { x: ctx.M, y: ctx.y - 2 }, end: { x: ctx.W - ctx.M, y: ctx.y - 2 }, thickness: 0.7, color: MUTED });
  ctx.y -= 8;
  ctx.page.drawText(items.length ? 'Total budget' : 'Amount requested', { x: ctx.M + 8, y: ctx.y - 11, size: 11, font: ctx.bold, color: INK });
  const tt = rm(items.length ? total : requested);
  ctx.page.drawText(tt, { x: ctx.W - ctx.M - ctx.bold.widthOfTextAtSize(tt, 12) - 8, y: ctx.y - 12, size: 12, font: ctx.bold, color: PURPLE });
  ctx.y -= 22;
  if (items.length && requested && requested !== total) text(ctx, `Sponsorship requested: ${rm(requested)}`, { bold: true, gap: 6 });

  heading(ctx, '5. Sponsor benefits');
  const benefits = String(p.benefits || '').split(/\n|;/).map((s) => s.trim()).filter(Boolean);
  (benefits.length ? benefits : ['Logo on banners and social media posts', 'Verbal recognition during the event', 'Photos and a thank-you post after the event']).forEach((b) => text(ctx, `- ${b}`, { indent: 8, gap: 4 }));

  heading(ctx, '6. Contact');
  text(ctx, `${p.contactName || p.organizerName}${p.contactPhone ? '  |  ' + p.contactPhone : ''}${p.contactEmail ? '  |  ' + p.contactEmail : ''}`, { gap: 6 });
  text(ctx, 'Thank you for considering our proposal.', { color: MUTED });

  footers(ctx, `${safe(p.eventName)} - Sponsorship proposal`);
  return doc2bytes(ctx);
}

/* ---------- Smart Resume (co-curricular record) ---------- */
export async function resumePdf({ user, level, events, badges, rating }) {
  const ctx = await start();
  banner(ctx, user.name, `${user.course}  |  ${user.university}`);

  if (user.bio) text(ctx, user.bio, { gap: 6, size: 11 });
  const contact = [user.district && `Based in ${user.district}, Perak`, user.linkedinUrl].filter(Boolean).join('   |   ');
  if (contact) text(ctx, contact, { color: MUTED, gap: 8 });

  heading(ctx, 'Snapshot');
  text(ctx, `${events.length} volunteer activit${events.length === 1 ? 'y' : 'ies'} completed  |  ${user.lifetimePoints} Perak Points  |  ${level.name} level  |  ${user.streak}-week streak${rating?.count ? `  |  ${rating.avg}/5 from ${rating.count} organiser rating${rating.count === 1 ? '' : 's'}` : ''}`, { gap: 6 });

  if (user.skills?.length) {
    heading(ctx, 'Skills');
    text(ctx, user.skills.join(', '), { gap: 6 });
  }

  heading(ctx, 'Micro-credentials');
  if (!badges.length) text(ctx, 'No badges yet.', { color: MUTED });
  badges.forEach((b) => {
    text(ctx, `${b.title}`, { bold: true, gap: 2 });
    text(ctx, `${b.verifiedByAgency ? 'Verified by partner agency' : 'Issued by Moh Siswa! (pending agency verification)'}  |  Earned ${dateStr(b.earnedAt)}`, { size: 9, color: MUTED, indent: 0, gap: 6 });
  });

  heading(ctx, 'Co-curricular record');
  if (!events.length) text(ctx, 'No completed activities yet.', { color: MUTED });
  events.forEach((e) => {
    text(ctx, e.title, { bold: true, gap: 2 });
    text(ctx, `${e.organizer.name}  |  ${e.district}  |  ${dateStr(e.startsAt)}  |  ${e.durationHrs} hrs`, { size: 9, color: MUTED, gap: 6 });
  });

  footers(ctx, `${safe(user.name)} - Moh Siswa! co-curricular record`);
  return doc2bytes(ctx);
}

/* ---------- Participation certificate ---------- */
export async function certificatePdf({ user, event, hours }) {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const page = doc.addPage([842, 595]); // A4 landscape
  const W = 842, H = 595;
  page.drawRectangle({ x: 20, y: 20, width: W - 40, height: H - 40, borderColor: PURPLE, borderWidth: 4 });
  page.drawRectangle({ x: 32, y: 32, width: W - 64, height: H - 64, borderColor: rgb(0.8, 0.75, 1), borderWidth: 1 });
  const center = (s, y, size, f, color = INK) => {
    const t = safe(s);
    page.drawText(t, { x: (W - f.widthOfTextAtSize(t, size)) / 2, y, size, font: f, color });
  };
  center('MOH SISWA!', H - 90, 14, bold, PURPLE);
  center('Certificate of Participation', H - 150, 34, bold);
  center('This is to certify that', H - 205, 13, font, MUTED);
  center(user.name, H - 260, 30, bold, PURPLE);
  center(`${user.course}, ${user.university}`, H - 288, 12, font, MUTED);
  center('has successfully completed volunteer service at', H - 335, 13, font, MUTED);
  center(event.title, H - 372, 22, bold);
  center(`organised by ${event.organizer.name}, ${event.district}`, H - 398, 12, font, INK);
  center(`${dateStr(event.startsAt)}  |  ${hours} hour${hours === 1 ? '' : 's'}`, H - 422, 12, font, MUTED);
  center('Attendance confirmed by organiser check-in code. Digital record - Moh Siswa!', 62, 9, font, MUTED);
  return doc.save();
}

async function doc2bytes(ctx) {
  return ctx.doc.save();
}
