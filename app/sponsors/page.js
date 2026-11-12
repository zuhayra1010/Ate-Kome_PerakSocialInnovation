'use client';
import { useEffect, useState } from 'react';
import { api, downloadPdf, useApi } from '@/lib/client';
import { CATEGORIES } from '@/lib/constants';
import { rm } from '@/lib/format';
import { Empty, ErrorBox, Sheet, Skeletons, Verified } from '@/components/ui';
import { OppTabs } from '@/components/Opportunities';
import { useToast } from '@/components/AppShell';

const EMPTY = { eventName: '', organizerName: '', objectives: '', date: '', venue: '', participants: '', audience: '', benefits: '', contactPhone: '', contactEmail: '', category: 'community', budgetItems: [{ label: '', amount: '' }] };
const KEY = 'ms_pitch';

export default function Sponsors() {
  const toast = useToast();
  const [p, setP] = useState(EMPTY);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const sponsors = useApi(`/sponsors?category=${p.category}`);
  const apps = useApi('/sponsorships');

  useEffect(() => { try { const s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s) setP({ ...EMPTY, ...s }); } catch {} }, []);
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(p)); } catch {} }, [p]);

  const set = (k, v) => setP((x) => ({ ...x, [k]: v }));
  const total = p.budgetItems.reduce((s, i) => s + (Number(i.amount) || 0), 0);
  const body = () => ({ ...p, amountRequested: total, budgetItems: p.budgetItems.filter((i) => i.label && Number(i.amount) > 0) });
  const setItem = (i, k, v) => set('budgetItems', p.budgetItems.map((x, j) => (j === i ? { ...x, [k]: v } : x)));

  const pdf = async (sponsorName = '') => {
    setBusy(true);
    try { await downloadPdf('/pitch', { method: 'POST', body: { sponsorName, pitch: body() }, filename: 'kertas-kerja-tajaan.pdf' }); }
    catch (e) { toast(e.message, true); } finally { setBusy(false); }
  };
  const apply = async (s) => {
    setBusy(true);
    try {
      await api('/sponsorships', { method: 'POST', body: { sponsorId: s.id, pitch: body(), message: `Kami ingin mohon tajaan untuk ${p.eventName}.` } });
      toast('Permohonan direkodkan ✔'); await apps.reload(); setConfirm(s);
    } catch (e) { toast(e.message, true); } finally { setBusy(false); }
  };
  const appliedTo = (s) => apps.data?.applications.some((a) => a.sponsorId === s.id && a.eventName === p.eventName);
  const ready = p.eventName.trim().length >= 4;

  return (
    <>
      <header className="page-head"><div><h1>Peluang</h1><p className="sub">Cari tajaan untuk program anda</p></div></header>
      <OppTabs />

      <section className="card stack">
        <button className="row between" style={{ background: 'none', border: 0, padding: 0, textAlign: 'left' }} onClick={() => setOpen(!open)} aria-expanded={open}>
          <span><b>📄 Penjana Kertas Kerja Automatik</b><br /><span className="sub">Isi borang ringkas, dapat PDF siap hantar</span></span><span aria-hidden>{open ? '▲' : '▼'}</span>
        </button>
        {open && (
          <div className="stack">
            <label className="f">Nama program<input className="in" value={p.eventName} onChange={(e) => set('eventName', e.target.value)} /></label>
            <label className="f">Persatuan / penganjur<input className="in" value={p.organizerName} onChange={(e) => set('organizerName', e.target.value)} /></label>
            <label className="f">Kategori (untuk padanan penaja)<select className="in" value={p.category} onChange={(e) => set('category', e.target.value)}>{Object.entries(CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select></label>
            <label className="f">Objektif (satu baris setiap satu)<textarea className="in" value={p.objectives} onChange={(e) => set('objectives', e.target.value)} /></label>
            <div className="row"><label className="f grow">Tarikh<input className="in" type="date" value={p.date} onChange={(e) => set('date', e.target.value)} /></label><label className="f grow">Peserta<input className="in" inputMode="numeric" value={p.participants} onChange={(e) => set('participants', e.target.value)} /></label></div>
            <label className="f">Lokasi<input className="in" value={p.venue} onChange={(e) => set('venue', e.target.value)} /></label>
            <b>Bajet</b>
            {p.budgetItems.map((it, i) => (
              <div className="row" key={i}>
                <input className="in grow" placeholder="Item" aria-label="Item bajet" value={it.label} onChange={(e) => setItem(i, 'label', e.target.value)} />
                <input className="in" style={{ width: 110 }} inputMode="decimal" placeholder="RM" aria-label="Jumlah RM" value={it.amount} onChange={(e) => setItem(i, 'amount', e.target.value)} />
              </div>
            ))}
            <div className="row between"><button className="btn ghost sm" onClick={() => set('budgetItems', [...p.budgetItems, { label: '', amount: '' }])} disabled={p.budgetItems.length >= 15}>+ Tambah item</button><b>Jumlah: {rm(total)}</b></div>
            <label className="f">Faedah kepada penaja (satu baris setiap satu)<textarea className="in" placeholder="Logo pada banner&#10;Penghargaan semasa majlis" value={p.benefits} onChange={(e) => set('benefits', e.target.value)} /></label>
            <div className="row"><label className="f grow">Telefon<input className="in" inputMode="tel" value={p.contactPhone} onChange={(e) => set('contactPhone', e.target.value)} /></label><label className="f grow">Emel<input className="in" inputMode="email" value={p.contactEmail} onChange={(e) => set('contactEmail', e.target.value)} /></label></div>
            <button className="btn block" disabled={!ready || busy} onClick={() => pdf()}>Muat turun kertas kerja (PDF)</button>
            <p className="sub">Draf disimpan pada peranti ini.</p>
          </div>
        )}
      </section>

      <div className="sec"><h2>Direktori penaja</h2><span className="sub">{ready ? 'Disusun ikut padanan' : ''}</span></div>
      {sponsors.loading ? <Skeletons /> : sponsors.error ? <ErrorBox msg={sponsors.error} retry={sponsors.reload} /> : (
        <div className="stack">
          {sponsors.data.sponsors.map((s) => (
            <div key={s.id} className="card stack" style={{ gap: 8 }}>
              <div className="row between"><b style={{ fontSize: 16 }}>{s.name}</b>{s.fit ? <span className="tag good">Sesuai</span> : null}</div>
              <div className="row wrap"><span className="sub">{s.industry} · {s.district}</span><Verified ok={s.verified} /></div>
              <p className="sub">{s.bio}</p>
              <div className="row wrap">{s.supports.map((x) => <span key={x} className="chip">{x}</span>)}</div>
              <p className="sub">💰 {s.budgetRange}</p>
              {appliedTo(s) ? <span className="tag good" style={{ width: 'fit-content' }}>✔ Telah dimohon</span> : (
                <button className="btn sm" disabled={busy} onClick={() => (ready ? apply(s) : (setOpen(true), toast('Isi nama program dahulu', true), window.scrollTo({ top: 0, behavior: 'smooth' })))}>Mohon tajaan</button>
              )}
            </div>
          ))}
        </div>
      )}

      {apps.data?.applications.length > 0 && (
        <>
          <div className="sec"><h2>Permohonan saya</h2></div>
          <div className="stack">{apps.data.applications.map((a) => <div key={a.id} className="card row between"><div><b>{a.eventName}</b><p className="sub">{a.sponsorName}</p></div><span className="tag">{a.status === 'sent' ? 'Dihantar' : a.status}</span></div>)}</div>
        </>
      )}

      {confirm && (
        <Sheet title="Permohonan direkodkan" onClose={() => setConfirm(null)}>
          <div className="stack">
            <p>Muat turun kertas kerja untuk <b>{confirm.name}</b> dan hantarkan kepada mereka melalui emel.</p>
            <button className="btn block" disabled={busy} onClick={() => pdf(confirm.name)}>📄 Muat turun kertas kerja</button>
            {confirm.contactEmail && <a className="btn soft block" href={`mailto:${confirm.contactEmail}?subject=${encodeURIComponent('Permohonan tajaan: ' + p.eventName)}&body=${encodeURIComponent(`Salam,\n\nKami ${p.organizerName || 'pelajar IPT Perak'} ingin memohon tajaan untuk ${p.eventName}. Kertas kerja dilampirkan.\n\nTerima kasih.`)}`}>✉️ Buka emel</a>}
            <p className="sub">Lampirkan PDF yang dimuat turun pada emel anda.</p>
          </div>
        </Sheet>
      )}
    </>
  );
}
