// Business rules: points, streaks, badges, smart match, ratings.
import { col } from './db';
import { HttpError, bad } from './api';
import { COURSES, TAGS } from './constants';
import { BADGE_DEFS } from './badges';

const WEEK = 7 * 864e5;
// Weeks start on Monday (epoch day 0 was a Thursday).
export const weekIdx = (ms) => Math.floor((ms - 4 * 864e5) / WEEK);

/* ---------- Points ---------- */

export async function awardPoints(userId, amount, kind, reason, refId = '') {
  const users = await col('users');
  const user = await users.get(userId);
  if (!user) throw new HttpError(404, 'User not found');
  const spend = amount < 0;
  if (spend && user.points + amount < 0) throw bad('Not enough Perak Points');
  await (await col('pointtxs')).create({ userId, amount, kind, reason, refId });
  return users.update(userId, {
    points: user.points + amount,
    lifetimePoints: user.lifetimePoints + (spend ? 0 : amount),
  });
}

/* ---------- Smart Match ---------- */

export function matchScore(user, tags = [], district = '', custom = []) {
  const skills = new Set(user.skills || []);
  const courseTags = new Set(COURSES[user.course] || []);
  let score = 0;
  const reasons = [];
  let courseHit = false;
  for (const t of tags) {
    if (skills.has(t)) {
      score += 3;
      reasons.push(`Kemahiran anda: ${TAGS[t] || t}`);
    } else if (courseTags.has(t)) {
      score += 2;
      courseHit = true;
    }
  }
  // organiser's own words: match loosely against the student's skill names
  const labels = [...skills].map((k) => (TAGS[k] || k).toLowerCase());
  for (const c of custom) {
    const lc = c.toLowerCase();
    if (labels.some((l) => lc.includes(l) || l.includes(lc))) {
      score += 3;
      reasons.push(`Kemahiran anda: ${c}`);
    }
  }
  if (courseHit) reasons.push(`Sesuai dengan bidang ${user.course}`);
  if (district && user.district && user.district === district) {
    score += 1;
    reasons.push('Dekat dengan anda');
  }
  return { score, reasons: reasons.slice(0, 3) };
}

/* ---------- Ratings ---------- */

export async function ratingSummary() {
  // Small dataset: one pass and group in memory.
  const all = await (await col('ratings')).list();
  const byEvent = {};
  const byStudent = {};
  for (const r of all) {
    const bucket = r.direction === 'student_to_organizer' ? byEvent : byStudent;
    const key = r.direction === 'student_to_organizer' ? r.eventId : r.targetId;
    (bucket[key] ||= []).push(r);
  }
  const avg = (arr = []) => (arr.length ? Math.round((arr.reduce((s, r) => s + r.stars, 0) / arr.length) * 10) / 10 : 0);
  return {
    event: (id) => ({ avg: avg(byEvent[id]), count: (byEvent[id] || []).length }),
    student: (id) => ({ avg: avg(byStudent[id]), count: (byStudent[id] || []).length, list: byStudent[id] || [] }),
  };
}

/* ---------- Badges ---------- */

export async function computeStats(user) {
  const events = await (await col('events')).list();
  const carpools = await (await col('carpools')).list({ driverId: user.id });
  const byCategory = {};
  let checkins = 0;
  let bestOrganisedTurnout = 0;
  for (const e of events) {
    const p = e.participants.find((x) => x.userId === user.id);
    if (p?.status === 'checked_in') {
      checkins += 1;
      byCategory[e.category] = (byCategory[e.category] || 0) + 1;
    }
    if (e.createdBy === user.id) {
      const turnout = e.participants.filter((x) => x.status === 'checked_in').length;
      bestOrganisedTurnout = Math.max(bestOrganisedTurnout, turnout);
    }
  }
  const passengersCarried = carpools.filter((c) => c.bonusPaid).reduce((s, c) => s + c.passengers.length, 0);
  return { checkins, byCategory, bestOrganisedTurnout, passengersCarried, streak: user.streak };
}

export async function evaluateBadges(userId) {
  const users = await col('users');
  const user = await users.get(userId);
  const stats = await computeStats(user);
  const badges = await col('badges');
  const have = new Set((await badges.list({ userId })).map((b) => b.key));
  const earned = [];
  for (const def of BADGE_DEFS) {
    if (!have.has(def.key) && def.check(stats)) {
      try {
        await badges.create({ userId, key: def.key, title: def.title, issuer: 'Moh Siswa!', verifiedByAgency: false, earnedAt: new Date() });
        earned.push({ key: def.key, title: def.title, emoji: def.emoji });
      } catch {
        /* unique index race: already issued */
      }
    }
  }
  return earned;
}

/* ---------- Events ---------- */

export async function joinEvent(user, eventId) {
  const events = await col('events');
  const ev = await events.get(eventId);
  if (!ev) throw new HttpError(404, 'Event not found');
  if (ev.participants.some((p) => p.userId === user.id)) throw bad('You already joined this event');
  if (ev.participants.length >= ev.slots) throw bad('This event is full');
  if (new Date(ev.startsAt) < new Date(Date.now() - ev.durationHrs * 3600e3)) throw bad('This event has already ended');
  ev.participants.push({ userId: user.id, status: 'joined', joinedAt: new Date(), pointsAwarded: 0 });
  return events.update(eventId, { participants: ev.participants });
}

export async function checkIn(user, eventId, code) {
  const events = await col('events');
  const ev = await events.get(eventId);
  if (!ev) throw new HttpError(404, 'Event not found');
  const p = ev.participants.find((x) => x.userId === user.id);
  if (!p) throw bad('Join the event first');
  if (p.status === 'checked_in') throw bad('You already checked in');
  if (String(code || '').trim().toUpperCase() !== ev.checkInCode.toUpperCase()) throw bad('Wrong check-in code. Ask the organiser.');

  // In production set STRICT_CHECKIN=1 so check-in only works around the event time.
  if (process.env.STRICT_CHECKIN === '1') {
    const start = new Date(ev.startsAt).getTime();
    const end = start + ev.durationHrs * 3600e3;
    const now = Date.now();
    if (now < start - 3600e3 || now > end + 6 * 3600e3) throw bad('Check-in is only open around the event time');
  }

  const bonuses = [];
  let total = ev.points;
  await awardPoints(user.id, ev.points, 'earn', `Volunteered: ${ev.title}`, ev.id);

  // Weekly streak bonus
  const users = await col('users');
  const fresh = await users.get(user.id);
  const week = weekIdx(Date.now());
  let streak = fresh.streak;
  if (fresh.lastCheckinWeek !== week) streak = fresh.lastCheckinWeek === week - 1 ? streak + 1 : 1;
  if (streak >= 2 && fresh.lastCheckinWeek !== week) {
    const b = Math.min(streak - 1, 4) * 5;
    await awardPoints(user.id, b, 'bonus', `${streak}-week streak bonus`, ev.id);
    bonuses.push({ label: `${streak}-week streak`, points: b });
    total += b;
  }
  await users.update(user.id, { streak, lastCheckinWeek: week });

  // Moh Tumpang! driver bonus (once per carpool, only if someone actually rode)
  const carpools = await col('carpools');
  for (const cp of await carpools.list({ eventId: ev.id, driverId: user.id })) {
    if (!cp.bonusPaid && cp.passengers.length >= 1) {
      await awardPoints(user.id, 10, 'carpool', `Moh Tumpang! driver bonus: ${ev.title}`, cp.id);
      await carpools.update(cp.id, { bonusPaid: true });
      bonuses.push({ label: 'Moh Tumpang! driver', points: 10 });
      total += 10;
    }
  }

  p.status = 'checked_in';
  p.checkedInAt = new Date();
  p.pointsAwarded = total;
  await events.update(ev.id, { participants: ev.participants });

  const newBadges = await evaluateBadges(user.id);
  // Organiser's badge may now qualify too (Community Leader)
  if (ev.createdBy) await evaluateBadges(ev.createdBy);
  return { points: ev.points, bonuses, total, streak, newBadges };
}
