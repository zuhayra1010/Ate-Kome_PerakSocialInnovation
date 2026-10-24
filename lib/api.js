import { NextResponse } from 'next/server';
import { col } from './db';

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export const bad = (msg) => new HttpError(400, msg);

// Wrap a route handler: JSON errors instead of stack traces.
export const handle = (fn) => async (req, ctx) => {
  try {
    return await fn(req, ctx);
  } catch (e) {
    const status = e.status || 500;
    if (status === 500) console.error(e);
    const message = status === 500 && process.env.NODE_ENV === 'production' ? 'Server error' : e.message;
    return NextResponse.json({ error: message }, { status });
  }
};

export const ok = (data, init) => NextResponse.json(data, init);

// Demo-grade identity: the browser keeps a userId and sends it as x-user-id.
// Swap for real auth (NextAuth / Clerk / university SSO) before launch.
export async function requireUser(req) {
  const id = req.headers.get('x-user-id');
  if (!id) throw new HttpError(401, 'Not signed in');
  const user = await (await col('users')).get(id);
  if (!user) throw new HttpError(401, 'Unknown user - please sign in again');
  return user;
}

export async function readJson(req) {
  try {
    return await req.json();
  } catch {
    throw bad('Invalid JSON body');
  }
}

// Trim + clamp user-supplied text.
export const str = (v, max = 200) => String(v ?? '').trim().slice(0, max);
export const num = (v, min, max, dflt = 0) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return dflt;
  return Math.min(max, Math.max(min, n));
};

export function cleanLinkedin(v) {
  const s = str(v, 200);
  if (!s) return '';
  const url = /^https?:\/\//i.test(s) ? s : 'https://' + s;
  try {
    const u = new URL(url);
    if (!/(^|\.)linkedin\.com$/i.test(u.hostname)) throw 0;
    return u.toString();
  } catch {
    throw bad('LinkedIn URL must be a linkedin.com link');
  }
}
