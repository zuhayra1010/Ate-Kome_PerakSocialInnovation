import { ok, handle, readJson, bad, str, num } from '@/lib/api';
import { col } from '@/lib/db';
import { CATEGORIES, DISTRICTS, TAGS } from '@/lib/constants';
import { ratingSummary } from '@/lib/logic';
import { publicEvent, cleanTeamsLink } from '@/lib/views';
import { requireUser } from '@/lib/api';

export const dynamic = 'force-dynamic';

export const GET = handle(async (req) => {
  const user = await requireUser(req);
  const url = new URL(req.url);
  const category = url.searchParams.get('category');
  const district = url.searchParams.get('district');
  const q = (url.searchParams.get('q') || '').toLowerCase();
  const sort = url.searchParams.get('sort') || 'date';
  const rs = await ratingSummary();
  let list = (await (await col('events')).list()).map((e) => publicEvent(e, user, rs));
  list = list.filter((e) => !e.ended || e.myStatus || e.isOwner); // past events only if you took part or run them
  if (category) list = list.filter((e) => e.category === category);
  if (district) list = list.filter((e) => e.district === district);
  if (q) list = list.filter((e) => (e.title + ' ' + e.description + ' ' + e.organizer.name).toLowerCase().includes(q));
  list.sort((a, b) => (sort === 'match' ? b.match.score - a.match.score : new Date(a.startsAt) - new Date(b.startsAt)));
  return ok({ events: list });
});

// Student-organised programme. Always unverified and capped points: an admin
// must verify the organiser before the event can award more.
export const POST = handle(async (req) => {
  const user = await requireUser(req);
  const b = await readJson(req);
  const title = str(b.title, 90);
  if (title.length < 4) throw bad('Give the event a title');
  if (!(b.category in CATEGORIES)) throw bad('Pick a category');
  if (!DISTRICTS.includes(b.district)) throw bad('Pick a district');
  const startsAt = new Date(b.startsAt);
  if (isNaN(startsAt) || startsAt < new Date()) throw bad('Pick a future date and time');
  // organiser's own skills, free text (max 6)
  const skillsCustom = [...new Set((Array.isArray(b.skillsCustom) ? b.skillsCustom : []).map((x) => str(x, 30)).filter(Boolean))].slice(0, 6);

  // optional screening: questions + 0..3 interview rounds (each may have a Teams link)
  let screening = { enabled: false, questions: [], rounds: [] };
  if (b.screening?.enabled) {
    const questions = (Array.isArray(b.screening.questions) ? b.screening.questions : []).map((q) => str(q, 200)).filter(Boolean).slice(0, 8);
    const rounds = (Array.isArray(b.screening.rounds) ? b.screening.rounds : []).slice(0, 3).map((r, i) => {
      const link = cleanTeamsLink(r?.teamsLink);
      if (link === null) throw bad(`Round ${i + 1}: paste a Microsoft Teams meeting link (teams.microsoft.com or teams.live.com)`);
      return { name: str(r?.name, 40) || `Pusingan ${i + 1}`, teamsLink: link };
    });
    if (!questions.length && !rounds.length) throw bad('Add at least one question or one interview round, or turn screening off');
    screening = { enabled: true, questions, rounds };
  }
  const code = Math.random().toString(36).slice(2, 8).toUpperCase();
  const ev = await (await col('events')).create({
    title, description: str(b.description, 500), category: b.category,
    organizer: { name: str(b.organizerName, 60) || `${user.name} (student)`, type: 'Student Club', verified: false },
    district: b.district, venue: str(b.venue, 100), startsAt,
    durationHrs: num(b.durationHrs, 1, 12, 3), points: num(b.points, 5, 30, 20),
    slots: num(b.slots, 2, 200, 20),
    tags: (Array.isArray(b.tags) ? b.tags : []).filter((t) => t in TAGS).slice(0, 5), skillsCustom, screening,
    checkInCode: code, createdBy: user.id, participants: [],
  });
  return ok({ event: publicEvent(ev, user, await ratingSummary()) }, { status: 201 });
});
