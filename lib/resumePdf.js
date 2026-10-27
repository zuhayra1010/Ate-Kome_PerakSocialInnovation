// Resume PDF in a clean one-column template: centred name, contact line, uppercase section
// headings with a rule, bold titles with right-aligned dates, bullets. Flows onto page 2+.
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const INK = rgb(0.17, 0.2, 0.27);
const LIGHT = rgb(0.86, 0.87, 0.91);
const W = 595, H = 842, M = 50;

// pdf-lib's built-in fonts only know Latin-1: swap fancy punctuation, drop anything else (emoji etc.)
const clean = (s) =>
  String(s ?? '')
    .replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"').replace(/[\u2013\u2014]/g, '-').replace(/\u2026/g, '...')
    .replace(/[^\x20-\x7E\xA0-\xFF\u2022]/g, '').replace(/\s+/g, ' ').trim();

const monthYear = (d) => new Date(d).toLocaleDateString('en-MY', { month: 'short', year: 'numeric' });

export async function buildResumePdf({ user, resume, badges = [] }) {
  const doc = await PDFDocument.create();
  const reg = await doc.embedFont(StandardFonts.TimesRoman);   // serif, like the template
  const bold = await doc.embedFont(StandardFonts.TimesRomanBold);
  let page, y;
  const newPage = () => { page = doc.addPage([W, H]); y = H - M; };
  const need = (h) => { if (y - h < M) newPage(); };
  newPage();

  const draw = (t, { x = M, size = 10.5, font = reg, color = INK } = {}) =>
    page.drawText(clean(t), { x, y: y - size, size, font, color });
  const width = (t, font, size) => font.widthOfTextAtSize(clean(t), size);
  const wrap = (t, font, size, maxW) => {
    const out = []; let cur = '';
    for (const w of clean(t).split(' ').filter(Boolean)) {
      const next = cur ? cur + ' ' + w : w;
      if (width(next, font, size) > maxW && cur) { out.push(cur); cur = w; } else cur = next;
    }
    if (cur) out.push(cur);
    return out;
  };
  const rule = (color, thickness) => page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness, color });

  const bullet = (t) => {
    wrap(t, reg, 10.5, W - 2 * M - 14).forEach((l, i) => {
      need(15);
      if (i === 0) draw('\u2022', { x: M + 2 });
      draw(l, { x: M + 14 });
      y -= 14;
    });
  };
  const sub = (t) => { if (!clean(t)) return; need(15); draw(t); y -= 14; };
  const section = (title, first) => {
    need(70);
    if (!first) { rule(LIGHT, 0.8); y -= 18; }
    draw(title.toUpperCase(), { size: 13, font: bold });
    y -= 17;
    rule(INK, 1);
    y -= 9;
  };
  // title line, then "left (bold) ........ right (bold)" line, then bullets
  const entry = ({ title, left, right, bullets = [] }) => {
    need(46);
    draw(title, { size: 11.5, font: bold }); y -= 15;
    if (left || right) {
      draw(left || '', { font: bold });
      if (right) draw(right, { font: bold, x: W - M - width(right, bold, 10.5) });
      y -= 14;
    }
    bullets.forEach(bullet);
    y -= 6;
  };

  /* ---------- header ---------- */
  const name = clean(user.name);
  draw(name, { size: 24, font: bold, x: (W - width(name, bold, 24)) / 2 });
  y -= 32;
  const c = resume.contact || {};
  const linkedin = (user.linkedinUrl || '').replace(/^https?:\/\/(www\.)?/i, '').replace(/\/$/, '');
  const contact = [c.location, c.email, c.phone, linkedin].map(clean).filter(Boolean).join('   |   ');
  wrap(contact, reg, 10, W - 2 * M).forEach((l) => { draw(l, { size: 10, x: (W - width(l, reg, 10)) / 2 }); y -= 14; });
  y -= 4; rule(LIGHT, 0.8); y -= 16;

  /* ---------- sections (reorder these blocks to reorder the resume) ---------- */
  let first = true;
  const open = (title) => { section(title, first); first = false; };

  const exp = (resume.experience || []).filter((e) => e.include !== false);
  if (exp.length) {
    open('Experience');
    exp.forEach((e) => entry({ title: e.title, left: e.org, right: [e.dates, e.place].filter(Boolean).join(', '), bullets: e.bullets }));
  }

  const certs = resume.certifications || [];
  if (certs.length || badges.length) {
    open('Certifications');
    certs.forEach((e) => { need(46); draw(e.title, { size: 11.5, font: bold }); y -= 15; sub([e.issuer, e.date].filter(Boolean).join('  \u2022  ')); if (e.note) bullet(e.note); y -= 6; });
    badges.forEach((b) => {
      need(46); draw(b.title, { size: 11.5, font: bold }); y -= 15;
      sub(`Moh Siswa! micro-credential  \u2022  ${monthYear(b.earnedAt)}`);
      bullet(b.verifiedByAgency ? 'Verified by partner agency.' : 'Issued by Moh Siswa!, pending agency verification.');
      y -= 6;
    });
  }

  if ((resume.education || []).length) {
    open('Education');
    resume.education.forEach((e) => { need(40); draw(e.degree || e.school, { size: 11.5, font: bold }); y -= 15; sub([e.degree ? e.school : '', e.date].filter(Boolean).join('  \u2022  ')); y -= 6; });
  }

  if ((resume.involvement || []).length) {
    open('Involvement');
    resume.involvement.forEach((e) => { need(46); draw(e.role || e.org, { size: 11.5, font: bold }); y -= 15; sub([e.role ? e.org : '', e.dates].filter(Boolean).join('  \u2022  ')); (e.bullets || []).forEach(bullet); y -= 6; });
  }

  if ((resume.skills || []).length) {
    open('Skills');
    resume.skills.forEach((s) => wrap(`${s.label ? s.label + ': ' : ''}${s.items}`, bold, 10.5, W - 2 * M).forEach((l) => { need(15); draw(l, { font: bold }); y -= 15; }));
  }

  return doc.save();
}