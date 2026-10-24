import { ok, handle, requireUser, readJson, bad, str, num } from '@/lib/api';
import { col } from '@/lib/db';
import { RATING_TAGS_ORGANIZER, RATING_TAGS_STUDENT } from '@/lib/constants';
import { HttpError } from '@/lib/api';

export const dynamic = 'force-dynamic';

// Two-way ratings. Only people who were actually at the event can rate, once each.
export const POST = handle(async (req) => {
  const user = await requireUser(req);
  const b = await readJson(req);
  const events = await col('events');
  const ev = await events.get(String(b.eventId || ''));
  if (!ev) throw new HttpError(404, 'Event not found');
  const ratings = await col('ratings');
  const stars = Math.round(num(b.stars, 0, 5, 0));
  if (stars < 1) throw bad('Pick 1 to 5 stars');
  const comment = str(b.comment, 300);

  if (b.direction === 'student_to_organizer') {
    const p = ev.participants.find((x) => x.userId === user.id);
    if (p?.status !== 'checked_in') throw bad('Only volunteers who checked in can rate the organiser');
    const dup = (await ratings.list({ direction: 'student_to_organizer', eventId: ev.id })).some((r) => r.fromUserId === user.id);
    if (dup) throw bad('You already rated this event');
    const tags = (Array.isArray(b.tags) ? b.tags : []).filter((t) => RATING_TAGS_ORGANIZER.includes(t));
    const r = await ratings.create({ direction: 'student_to_organizer', fromUserId: user.id, targetId: ev.id, eventId: ev.id, stars, tags, comment });
    return ok({ rating: r }, { status: 201 });
  }

  if (b.direction === 'organizer_to_student') {
    if (ev.createdBy !== user.id) throw bad('Only the organiser can rate volunteers');
    const target = ev.participants.find((x) => x.userId === b.studentId);
    if (target?.status !== 'checked_in') throw bad('That student did not check in');
    const dup = (await ratings.list({ direction: 'organizer_to_student', eventId: ev.id, targetId: b.studentId })).length;
    if (dup) throw bad('You already rated this student');
    const tags = (Array.isArray(b.tags) ? b.tags : []).filter((t) => RATING_TAGS_STUDENT.includes(t));
    const r = await ratings.create({ direction: 'organizer_to_student', fromUserId: user.id, targetId: b.studentId, eventId: ev.id, stars, tags, comment });
    return ok({ rating: r }, { status: 201 });
  }
  throw bad('Unknown rating type');
});
