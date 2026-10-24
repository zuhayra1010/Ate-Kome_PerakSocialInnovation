'use client';
import { useCallback, useEffect, useState } from 'react';

const KEY = 'ms_uid';
export const getUid = () => {
  try { return localStorage.getItem(KEY) || ''; } catch { return ''; }
};
export const setUid = (id) => {
  try { id ? localStorage.setItem(KEY, id) : localStorage.removeItem(KEY); } catch {}
};

export async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch('/api' + path, {
    method,
    headers: { 'x-user-id': getUid(), ...(body ? { 'content-type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) {
    setUid('');
    if (typeof window !== 'undefined' && location.pathname !== '/welcome') location.replace('/welcome');
  }
  if (!res.ok) throw new Error(data.error || 'Something went wrong');
  return data;
}

export function useApi(path) {
  const [s, set] = useState({ data: null, error: null, loading: true });
  const load = useCallback(async () => {
    if (!path) return;
    try {
      set({ data: await api(path), error: null, loading: false });
    } catch (e) {
      set((x) => ({ ...x, error: e.message, loading: false }));
    }
  }, [path]);
  useEffect(() => { load(); }, [load]);
  return { ...s, reload: load };
}

// Fetch a PDF with the user header and open/save it.
export async function downloadPdf(path, { method = 'GET', body, filename = 'file.pdf' } = {}) {
  const res = await fetch('/api' + path, {
    method,
    headers: { 'x-user-id': getUid(), ...(body ? { 'content-type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Could not create the PDF');
  const url = URL.createObjectURL(await res.blob());
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function useCountUp(target, ms = 900) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf, start;
    const from = 0;
    const tick = (t) => {
      start ??= t;
      const p = Math.min(1, (t - start) / ms);
      setV(Math.round(from + (target - from) * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return v;
}

// LinkedIn "Add licence or certification" form, prefilled. No API key needed;
// the student reviews and saves it themselves.
export function linkedinAddUrl(title, earnedAt) {
  const d = new Date(earnedAt || Date.now());
  const q = new URLSearchParams({
    startTask: 'CERTIFICATION_NAME', name: `${title} (Moh Siswa!)`, organizationName: 'Moh Siswa!',
    issueYear: String(d.getFullYear()), issueMonth: String(d.getMonth() + 1),
  });
  return 'https://www.linkedin.com/profile/add?' + q.toString();
}
