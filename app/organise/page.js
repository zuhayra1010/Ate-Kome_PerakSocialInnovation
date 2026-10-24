'use client';
import { useState } from 'react';
import Link from 'next/link';
import { api, useApi } from '@/lib/client';
import { CATEGORIES, DISTRICTS, TAGS } from '@/lib/constants';
import { fmtDateTime, toLocalInput } from '@/lib/format';
import { Empty, Skeletons } from '@/components/ui';
import { useToast } from '@/components/AppShell';

export default function Organise() {
  const toast = useToast();
  const events = useApi('/events');
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({ title: '', description: '', category: 'community', district: 'Ipoh', venue: '', startsAt: toLocalInput(new Date(Date.now() + 7 * 864e5)), durationHrs: 3, slots: 20, points: 20, tags: [], skillsCustom: '', screening: { enabled: false, questions: [''], rounds: [] } });
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));
  const sc = f.screening;
  const setSc = (patch) => set('screening', { ...sc, ...patch });
  const mine = events.data?.events.filter((e) => e.isOwner) || [];

  const submit = async (e) => {
    e.preventDefault(); setBusy(true);
    try { await api('/events', { method: 'POST', body: {
      ...f, startsAt: new Date(f.startsAt).toISOString(),
      skillsCustom: f.skillsCustom.split(',').map((x) => x.trim()).filter(Boolean),
      screening: sc.enabled ? { enabled: true, questions: sc.questions.filter((q) => q.trim()), rounds: sc.rounds } : { enabled: false },
    } }); toast('Program dicipta! Kongsi kod check-in pada hari kejadian.'); setOpen(false); await events.reload(); }
    catch (err) { toast(err.message, true); } finally { setBusy(false); }
  };

  return (
    <>
      <header className="page-head"><div><h1>Anjur program</h1><p className="sub">Cari sukarelawan untuk program anda</p></div><button className="btn sm" onClick={() => setOpen(!open)}>{open ? 'Tutup' : '+ Baru'}</button></header>
      {open && (
        <form className="card stack" onSubmit={submit}>
          <label className="f">Tajuk<input className="in" required minLength={4} value={f.title} onChange={(e) => set('title', e.target.value)} /></label>
          <label className="f">Penerangan<textarea className="in" value={f.description} onChange={(e) => set('description', e.target.value)} /></label>
          <div className="row"><label className="f grow">Kategori<select className="in" value={f.category} onChange={(e) => set('category', e.target.value)}>{Object.entries(CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select></label>
            <label className="f grow">Daerah<select className="in" value={f.district} onChange={(e) => set('district', e.target.value)}>{DISTRICTS.map((d) => <option key={d}>{d}</option>)}</select></label></div>
          <label className="f">Lokasi<input className="in" value={f.venue} onChange={(e) => set('venue', e.target.value)} /></label>
          <label className="f">Tarikh &amp; masa<input className="in" type="datetime-local" required value={f.startsAt} onChange={(e) => set('startsAt', e.target.value)} /></label>
          <div className="row">
            <label className="f grow">Jam<input className="in" type="number" min="1" max="12" value={f.durationHrs} onChange={(e) => set('durationHrs', e.target.value)} /></label>
            <label className="f grow">Slot<input className="in" type="number" min="2" max="200" value={f.slots} onChange={(e) => set('slots', e.target.value)} /></label>
            <label className="f grow">Mata<input className="in" type="number" min="5" max="30" value={f.points} onChange={(e) => set('points', e.target.value)} /></label>
          </div>
          <div className="f"><span>Kemahiran diperlukan</span><div className="row wrap" style={{ marginTop: 6 }}>{Object.entries(TAGS).map(([k, v]) => <button type="button" key={k} className={'chip' + (f.tags.includes(k) ? ' on' : '')} onClick={() => set('tags', f.tags.includes(k) ? f.tags.filter((t) => t !== k) : [...f.tags, k])}>{v}</button>)}</div></div>
          <label className="f">Kemahiran lain (tulis sendiri, asingkan dengan koma)
            <input className="in" placeholder="cth. Pandai Excel, Bahasa Inggeris" value={f.skillsCustom} onChange={(e) => set('skillsCustom', e.target.value)} />
          </label>

          <div className="card stack" style={{ boxShadow: 'none', background: 'var(--surface-2)' }}>
            <label className="row" style={{ gap: 10 }}>
              <input type="checkbox" style={{ width: 20, height: 20 }} checked={sc.enabled} onChange={(e) => setSc({ enabled: e.target.checked })} />
              <span><b>Saring pemohon dahulu</b> <span className="tag">Pilihan</span></span>
            </label>
            {!sc.enabled && <p className="sub">Tutup = pelajar terus sertai. Buka = pelajar mohon, anda semak, kemudian terima atau tolak dengan maklum balas.</p>}
            {sc.enabled && (
              <>
                <b>Soalan untuk pemohon (maks 8)</b>
                {sc.questions.map((q, i) => (
                  <div className="row" key={i}>
                    <input className="in grow" placeholder={`Soalan ${i + 1}`} maxLength={200} value={q} onChange={(e) => setSc({ questions: sc.questions.map((x, j) => (j === i ? e.target.value : x)) })} />
                    <button type="button" className="btn danger sm" aria-label="Buang soalan" onClick={() => setSc({ questions: sc.questions.filter((_, j) => j !== i) })}>✕</button>
                  </div>
                ))}
                <button type="button" className="btn ghost sm" disabled={sc.questions.length >= 8} onClick={() => setSc({ questions: [...sc.questions, ''] })}>+ Tambah soalan</button>

                <b>Pusingan temu duga (maks 3, pilihan)</b>
                <p className="sub">Setiap pusingan ada pautan Microsoft Teams sendiri. Pelajar hanya nampak pautan bila anda luluskan mereka ke pusingan itu.</p>
                {sc.rounds.map((r, i) => (
                  <div className="stack" key={i} style={{ gap: 6 }}>
                    <div className="row">
                      <input className="in grow" placeholder={`Nama pusingan ${i + 1}`} maxLength={40} value={r.name || ''} onChange={(e) => setSc({ rounds: sc.rounds.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)) })} />
                      <button type="button" className="btn danger sm" aria-label="Buang pusingan" onClick={() => setSc({ rounds: sc.rounds.filter((_, j) => j !== i) })}>✕</button>
                    </div>
                    <input className="in" inputMode="url" placeholder="https://teams.microsoft.com/l/meetup-join/..." value={r.teamsLink || ''} onChange={(e) => setSc({ rounds: sc.rounds.map((x, j) => (j === i ? { ...x, teamsLink: e.target.value } : x)) })} />
                  </div>
                ))}
                <button type="button" className="btn ghost sm" disabled={sc.rounds.length >= 3} onClick={() => setSc({ rounds: [...sc.rounds, { name: '', teamsLink: '' }] })}>+ Tambah pusingan temu duga</button>
              </>
            )}
          </div>

          <p className="sub">Program pelajar dipaparkan sebagai “Belum disahkan” dan mata maksimum 30 sehingga disahkan pihak berkaitan.</p>
          <button className="btn block" disabled={busy}>Terbitkan program</button>
        </form>
      )}
      <div className="sec"><h2>Program saya</h2></div>
      {events.loading ? <Skeletons n={2} /> : mine.length === 0 ? <Empty icon="📣">Belum ada program. Tekan “+ Baru” untuk mula.</Empty> : (
        <div className="stack">{mine.map((e) => (
          <Link key={e.id} href={`/feed/${e.id}`} className="card stack" style={{ gap: 4 }}>
            <b>{e.title}</b><p className="sub">{fmtDateTime(e.startsAt)} · {e.filled}/{e.slots} sertai · {e.checkedIn} hadir</p>
            <p>Kod check-in: <span className="tag pts">{e.checkInCode}</span></p>
          </Link>))}</div>
      )}
    </>
  );
}
