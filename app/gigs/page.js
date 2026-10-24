'use client';
import { useState } from 'react';
import { api, useApi } from '@/lib/client';
import { Empty, ErrorBox, Skeletons, Verified } from '@/components/ui';
import { OppTabs } from '@/components/Opportunities';
import { useToast } from '@/components/AppShell';
import { TAGS } from '@/lib/constants';

const UNIT = { hour: 'jam', day: 'hari', task: 'tugas' };

export default function Gigs() {
  const { data, loading, error, reload } = useApi('/gigs');
  const toast = useToast();
  const [busy, setBusy] = useState('');
  const apply = async (g) => {
    setBusy(g.id);
    try { const r = await api(`/gigs/${g.id}/apply`, { method: 'POST' }); toast(r.priority ? 'Permohonan dihantar · keutamaan kerana penarafan tinggi ⭐' : 'Permohonan dihantar!'); await reload(); }
    catch (e) { toast(e.message, true); } finally { setBusy(''); }
  };
  return (
    <>
      <header className="page-head"><div><h1>Peluang</h1><p className="sub">Kerja sambilan disahkan berhampiran kampus</p></div></header>
      <OppTabs />
      {loading ? <Skeletons /> : error ? <ErrorBox msg={error} retry={reload} /> : data.gigs.length === 0 ? <Empty icon="💼">Tiada kerja buat masa ini.</Empty> : (
        <div className="stack">
          {data.gigs.map((g) => (
            <div key={g.id} className="card stack" style={{ gap: 8 }}>
              <div className="row between"><b style={{ fontSize: 16 }}>{g.title}</b><span className="tag pts">RM{g.payRate}/{UNIT[g.payUnit]}</span></div>
              <div className="row wrap"><span className="sub">{g.employer}</span><Verified ok={g.verified} /></div>
              <p className="sub">{g.description}</p>
              <div className="meta"><span>📍 {g.nearCampus || g.district}</span><span>⏱ ~{g.hoursPerWeek} jam/minggu</span></div>
              <div className="row wrap">{g.tags.map((t) => <span key={t} className="chip">{TAGS[t] || t}</span>)}</div>
              {g.match.reasons[0] && <p className="reason">✨ {g.match.reasons.join(' · ')}</p>}
              {g.applied ? <span className="tag good" style={{ width: 'fit-content' }}>✔ Permohonan dihantar</span> : g.verified ? <button className="btn sm" disabled={busy === g.id} onClick={() => apply(g)}>Mohon</button> : <p className="sub">⚠️ Majikan belum disahkan. Permohonan dibuka selepas semakan.</p>}
            </div>
          ))}
          <p className="sub">Pelajar dengan penarafan 4.5★ ke atas diberi keutamaan. Jangan sekali-kali bayar yuran untuk mendapat kerja.</p>
        </div>
      )}
    </>
  );
}
