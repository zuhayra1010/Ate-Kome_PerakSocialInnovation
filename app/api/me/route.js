import { ok, handle, requireUser, readJson, str, cleanLinkedin } from '@/lib/api';
import { col } from '@/lib/db';
import { COURSES, UNIVERSITIES, DISTRICTS, TAGS, levelFor } from '@/lib/constants';
import { BADGE_DEFS, badgeDef } from '@/lib/badges';
import { computeStats, ratingSummary, weekIdx } from '@/lib/logic';
import { publicUser } from '@/lib/views';

export const dynamic = 'force-dynamic';

export const GET = handle(async (req) => {
  const user = await requireUser(req);
  const [badgeRows, events, rs] = await Promise.all([
    (await col('badges')).list({ userId: user.id }, { earnedAt: -1 }),
    (await col('events')).list(),
    ratingSummary(),
  ]);
  const st = await computeStats(user);
  const have = new Set(badgeRows.map((b) => b.key));
  const badges = badgeRows.map((b) => ({ ...b, emoji: badgeDef(b.key)?.emoji || '🏅', desc: badgeDef(b.key)?.desc || '' }));
  const locked = BADGE_DEFS.filter((d) => !have.has(d.key)).map(({ key, title, emoji, desc }) => ({ key, title, emoji, desc }));
  const mine = events
    .filter((e) => e.participants.some((p) => p.userId === user.id))
    .map((e) => ({ id: e.id, title: e.title, startsAt: e.startsAt, status: e.participants.find((p) => p.userId === user.id).status, district: e.district }));
  return ok({
    user: publicUser(user),
    level: levelFor(user.lifetimePoints),
    badges, locked, stats: st,
    rating: rs.student(user.id),
    myEvents: mine,
    weekDone: user.lastCheckinWeek === weekIdx(Date.now()),
  });
});

export const PATCH = handle(async (req) => {
  const user = await requireUser(req);
  const b = await readJson(req);
  const patch = {};
  if (b.name !== undefined && str(b.name, 60).length >= 2) patch.name = str(b.name, 60);
  if (b.course in COURSES) patch.course = b.course;
  if (UNIVERSITIES.includes(b.university)) patch.university = b.university;
  if (Array.isArray(b.skills)) patch.skills = b.skills.filter((s) => s in TAGS).slice(0, 8);
  if (b.district !== undefined) patch.district = DISTRICTS.includes(b.district) ? b.district : '';
  if (b.bio !== undefined) patch.bio = str(b.bio, 240);
  if (b.linkedinUrl !== undefined) patch.linkedinUrl = cleanLinkedin(b.linkedinUrl);
  const u = await (await col('users')).update(user.id, patch);
  return ok({ user: publicUser(u) });
});
