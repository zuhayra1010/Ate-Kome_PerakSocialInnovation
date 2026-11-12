// Shapes DB documents for the client. Never leak other users' ids or check-in codes.
import { matchScore } from './logic';

export function publicEvent(ev, user, rs) {
  const { participants = [], checkInCode, screening, ...rest } = ev;
  const mine = user ? participants.find((p) => p.userId === user.id) : null;
  const isOwner = !!user && ev.createdBy === user.id;
  const endsAt = new Date(ev.startsAt).getTime() + ev.durationHrs * 3600e3;
  return {
    ...rest,
    filled: participants.length,
    checkedIn: participants.filter((p) => p.status === 'checked_in').length,
    myStatus: mine?.status || null,
    myPoints: mine?.pointsAwarded || 0,
    isOwner,
    ended: endsAt < Date.now(),
    screening: screeningPublic(screening),
    checkInCode: isOwner ? checkInCode : undefined,
    rating: rs.event(ev.id),
    match: user ? matchScore(user, ev.tags, ev.district, ev.skillsCustom || []) : { score: 0, reasons: [] },
  };
}

export function publicUser(u) {
  const { isSeed, ...rest } = u;
  return rest;
}

// Students see the questions and how many rounds there are. Teams links are only
// revealed per applicant (see /api/events/[id]) once they reach that round.
export function screeningPublic(s) {
  if (!s?.enabled) return { enabled: false, questions: [], rounds: [] };
  return { enabled: true, questions: s.questions || [], rounds: (s.rounds || []).map((r) => ({ name: r.name })) };
}

export function cleanTeamsLink(v) {
  const s = String(v ?? '').trim().slice(0, 500);
  if (!s) return '';
  let u;
  try { u = new URL(/^https?:\/\//i.test(s) ? s : 'https://' + s); } catch { return null; }
  const h = u.hostname.toLowerCase();
  const okHost = h === 'teams.microsoft.com' || h === 'teams.live.com' || h === 'teams.cloud.microsoft' || h.endsWith('.teams.microsoft.com');
  return u.protocol === 'https:' && okHost ? u.toString() : null;
}
