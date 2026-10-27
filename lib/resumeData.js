// Resume data: cleaning what the form sends + drafting "experience" from events the student joined.
import { col } from './db';
import { str } from './api';
import { TAGS } from './constants';

const list = (v, n) => (Array.isArray(v) ? v.slice(0, n) : []);
const lines = (v, n, max) => list(v, n).map((x) => str(x, max)).filter(Boolean);

// Whatever the browser sends is trimmed, length-limited and rebuilt field by field.
export function cleanResume(b = {}) {
  const c = b.contact || {};
  return {
    contact: { location: str(c.location, 80), email: str(c.email, 100), phone: str(c.phone, 30) },
    education: list(b.education, 6)
      .map((e) => ({ degree: str(e?.degree, 100), school: str(e?.school, 100), date: str(e?.date, 40) }))
      .filter((e) => e.degree || e.school),
    certifications: list(b.certifications, 8)
      .map((e) => ({ title: str(e?.title, 100), issuer: str(e?.issuer, 80), date: str(e?.date, 40), note: str(e?.note, 200) }))
      .filter((e) => e.title),
    involvement: list(b.involvement, 6)
      .map((e) => ({ role: str(e?.role, 80), org: str(e?.org, 100), dates: str(e?.dates, 50), bullets: lines(e?.bullets, 6, 220) }))
      .filter((e) => e.role || e.org),
    skills: list(b.skills, 6)
      .map((e) => ({ label: str(e?.label, 40), items: str(e?.items, 200) }))
      .filter((e) => e.items),
    experience: list(b.experience, 30)
      .map((e) => ({
        eventId: str(e?.eventId, 40), include: e?.include !== false, title: str(e?.title, 100), org: str(e?.org, 100),
        dates: str(e?.dates, 50), place: str(e?.place, 60), bullets: lines(e?.bullets, 6, 220),
      }))
      .filter((e) => e.title),
  };
}

const monthYear = (d) => new Date(d).toLocaleDateString('en-MY', { month: 'short', year: 'numeric' });

// One checked-in event -> one editable experience entry
export function draftFromEvent(ev, userId) {
  const mine = ev.participants.find((p) => p.userId === userId);
  const bullets = [`Volunteered ${ev.durationHrs} hour${ev.durationHrs === 1 ? '' : 's'} at ${ev.title} in ${ev.district}, Perak.`];
  if (mine?.pointsAwarded) bullets.push(`Attendance verified by organiser check-in; earned ${mine.pointsAwarded} Perak Points.`);
  return {
    eventId: ev.id, include: true, title: `Volunteer, ${ev.title}`, org: ev.organizer.name,
    dates: monthYear(ev.startsAt), place: `${ev.district}, Perak`, bullets,
  };
}

// What the form shows and the PDF prints.
// - Before the student ever saves: sensible defaults from their profile + all attended events.
// - After saving: exactly what they saved; events attended later show up as "newFromEvents".
export async function loadResume(user) {
  const events = await (await col('events')).list();
  const drafts = events
    .filter((e) => e.participants.some((p) => p.userId === user.id && p.status === 'checked_in'))
    .sort((a, b) => new Date(b.startsAt) - new Date(a.startsAt))
    .map((e) => draftFromEvent(e, user.id));
  const saved = user.resume?.saved ? user.resume : null;
  const resume = saved || {
    contact: { location: user.district ? `${user.district}, Perak` : '', email: '', phone: '' },
    education: [{ degree: user.course, school: user.university, date: '' }],
    certifications: [],
    involvement: [],
    skills: user.skills?.length ? [{ label: 'Skills', items: user.skills.map((k) => TAGS[k] || k).join(', ') }] : [],
    experience: drafts,
  };
  const have = new Set(resume.experience.map((e) => e.eventId));
  return {
    resume,
    newFromEvents: saved ? drafts.filter((d) => !have.has(d.eventId)) : [],
    profile: { name: user.name, linkedinUrl: user.linkedinUrl || '' },
  };
}