// Optional screening: application -> (interview rounds) -> accepted / rejected, with feedback.
import { col } from './db';
import { HttpError, bad } from './api';

export const stageName = (ev, round) => (round === 0 ? 'Semakan permohonan' : ev.screening?.rounds?.[round - 1]?.name || `Pusingan ${round}`);

// What the applicant is allowed to see (Teams link only for the round they are in).
export function studentView(app, ev) {
  if (!app) return null;
  const link = app.status === 'interview' ? ev.screening?.rounds?.[app.round - 1]?.teamsLink || '' : '';
  return {
    id: app.id, status: app.status, round: app.round, totalRounds: ev.screening?.rounds?.length || 0,
    stage: stageName(ev, app.round), interviewAt: app.interviewAt || null, teamsLink: link,
    history: (app.history || []).map((h) => ({ stage: h.stage, decision: h.decision, feedback: h.feedback, at: h.at })),
  };
}

export async function applyToEvent(user, ev, answers) {
  const s = ev.screening;
  if (!s?.enabled) throw bad('This event does not use applications - just join it');
  if (ev.createdBy === user.id) throw bad('You are organising this event');
  if (ev.participants.some((p) => p.userId === user.id)) throw bad('You are already in this event');
  if (new Date(ev.startsAt) < new Date(Date.now() - ev.durationHrs * 3600e3)) throw bad('This event has already ended');
  const clean = (s.questions || []).map((q, i) => {
    const a = String(answers?.[i] ?? '').trim().slice(0, 600);
    if (!a) throw bad(`Please answer: ${q}`);
    return { q, a };
  });
  const apps = await col('applications');
  const existing = (await apps.list({ eventId: ev.id, userId: user.id }))[0];
  if (existing && existing.status !== 'withdrawn') throw bad(existing.status === 'rejected' ? 'Your application was not successful for this event' : 'You already applied');
  const base = { answers: clean, status: 'pending', round: 0, interviewAt: null, history: [] };
  return existing ? apps.update(existing.id, base) : apps.create({ eventId: ev.id, userId: user.id, userName: user.name, ...base });
}

export async function decide(owner, appId, { decision, feedback = '', interviewAt }) {
  const apps = await col('applications');
  const events = await col('events');
  const app = await apps.get(appId);
  const ev = app && (await events.get(app.eventId));
  if (!app || !ev || ev.createdBy !== owner.id) throw new HttpError(404, 'Application not found');
  if (!['pending', 'interview'].includes(app.status)) throw bad('This application is already closed');
  if (!['advance', 'accept', 'reject'].includes(decision)) throw bad('Unknown decision');

  const rounds = ev.screening?.rounds?.length || 0;
  const fb = String(feedback || '').trim().slice(0, 500);
  const entry = { stage: stageName(ev, app.round), decision, feedback: fb, at: new Date() };
  let patch;

  if (decision === 'reject') {
    patch = { status: 'rejected' };
  } else if (decision === 'advance' && app.round < rounds) {
    const when = interviewAt ? new Date(interviewAt) : null;
    if (when && isNaN(when)) throw bad('Invalid interview time');
    patch = { status: 'interview', round: app.round + 1, interviewAt: when };
  } else {
    // accept now, or advancing past the last round
    entry.decision = 'accept';
    if (ev.participants.length >= ev.slots) throw bad('The event is full - increase slots first');
    if (!ev.participants.some((p) => p.userId === app.userId)) {
      ev.participants.push({ userId: app.userId, status: 'joined', joinedAt: new Date(), pointsAwarded: 0 });
      await events.update(ev.id, { participants: ev.participants });
    }
    patch = { status: 'accepted' };
  }
  return apps.update(app.id, { ...patch, history: [...app.history, entry] });
}
