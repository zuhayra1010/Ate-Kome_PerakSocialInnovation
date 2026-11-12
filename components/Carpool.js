'use client';
import { useState } from 'react';
import { api } from '@/lib/client';
import { fmtDateTime, toLocalInput } from '@/lib/format';
import { Sheet } from '@/components/ui';
import { useToast } from '@/components/AppShell';

export function RideCard({ r, onChange, showEvent = false }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const run = async (fn, okMsg) => {
    setBusy(true);
    try { await fn(); toast(okMsg); await onChange(); } catch (e) { toast(e.message, true); } finally { setBusy(false); }
  };
  return (
    <div className="card stack" style={{ gap: 8 }}>
      {showEvent && <b>{r.eventTitle}</b>}
      <div className="row between">
        <div><b>🚗 {r.driverName}</b><p className="sub">dari {r.from}</p></div>
        <span className={'tag' + (r.seatsLeft > 0 ? ' good' : ' warn')}>{r.seatsLeft > 0 ? `${r.seatsLeft} kerusi` : 'Penuh'}</span>
      </div>
      <p className="sub">🕒 Bertolak {fmtDateTime(r.departAt)}{showEvent ? ` · 📍 ${r.eventDistrict}` : ''}</p>
      {r.note && <p className="sub">💬 {r.note}</p>}
      {r.isDriver ? (
        <>
          <p className="sub">Penumpang: {r.passengers?.length ? r.passengers.join(', ') : 'belum ada'} · +10 mata bila anda check-in dengan penumpang</p>
          {!r.passengers?.length && <button className="btn danger sm" disabled={busy} onClick={() => run(() => api(`/carpools/${r.id}`, { method: 'DELETE' }), 'Tumpangan dibatalkan')}>Batalkan tawaran</button>}
        </>
      ) : r.booked ? (
        <button className="btn ghost sm" disabled={busy} onClick={() => run(() => api(`/carpools/${r.id}/book`, { method: 'DELETE' }), 'Tempahan dibatalkan')}>✔ Ditempah · Batalkan</button>
      ) : (
        <button className="btn sm" disabled={busy || r.seatsLeft < 1} onClick={() => run(() => api(`/carpools/${r.id}/book`, { method: 'POST' }), 'Kerusi ditempah!')}>Tempah kerusi</button>
      )}
    </div>
  );
}

// events: [{id,title,startsAt}] the user has joined and may offer a ride to
export function OfferRide({ events, eventId, onClose, onDone }) {
  const toast = useToast();
  const first = events.find((e) => e.id === eventId) || events[0];
  const [f, setF] = useState({ eventId: first?.id || '', from: '', departAt: first ? toLocalInput(new Date(new Date(first.startsAt).getTime() - 2 * 3600e3)) : '', seats: 3, note: '' });
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));
  const pick = (id) => { const e = events.find((x) => x.id === id); setF((x) => ({ ...x, eventId: id, departAt: toLocalInput(new Date(new Date(e.startsAt).getTime() - 2 * 3600e3)) })); };
  const submit = async (e) => {
    e.preventDefault(); setBusy(true);
    try { await api('/carpools', { method: 'POST', body: { ...f, departAt: new Date(f.departAt).toISOString() } }); toast('Tumpangan dibuka! 🚗'); await onDone(); onClose(); }
    catch (err) { toast(err.message, true); setBusy(false); }
  };
  return (
    <Sheet title="Tawar tumpangan" onClose={onClose}>
      {events.length === 0 ? <p className="sub">Sertai satu aktiviti dahulu, kemudian anda boleh tawarkan tumpangan.</p> : (
        <form className="stack" onSubmit={submit}>
          <label className="f">Aktiviti<select className="in" value={f.eventId} onChange={(e) => pick(e.target.value)}>{events.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}</select></label>
          <label className="f">Bertolak dari<input className="in" required placeholder="cth. UTP, Seri Iskandar" value={f.from} onChange={(e) => set('from', e.target.value)} /></label>
          <label className="f">Masa bertolak<input className="in" type="datetime-local" required value={f.departAt} onChange={(e) => set('departAt', e.target.value)} /></label>
          <label className="f">Kerusi kosong<select className="in" value={f.seats} onChange={(e) => set('seats', Number(e.target.value))}>{[1, 2, 3, 4, 5, 6].map((n) => <option key={n}>{n}</option>)}</select></label>
          <label className="f">Nota (tempat jumpa, kongsi minyak)<input className="in" maxLength={140} value={f.note} onChange={(e) => set('note', e.target.value)} /></label>
          <button className="btn block" disabled={busy}>Buka tumpangan</button>
        </form>
      )}
    </Sheet>
  );
}
