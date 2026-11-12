'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api, downloadPdf, useApi } from '@/lib/client';
import { CATEGORIES, RATING_TAGS_ORGANIZER, RATING_TAGS_STUDENT } from '@/lib/constants';
import { fmtDate, fmtTime } from '@/lib/format';
import { ErrorBox, Sheet, Skeletons, Stars, Verified } from '@/components/ui';
import { OfferRide, RideCard } from '@/components/Carpool';
import { useToast } from '@/components/AppShell';
import { ApplicantsPanel, ApplyPanel } from '@/components/Screening';
import { TAGS } from '@/lib/constants';

function RateSheet({ title, tags, onSubmit, onClose }) {
  const [stars, setStars] = useState(0);
  const [picked, setPicked] = useState([]);
  const [comment, setComment] = useState('');
  return (
    <Sheet title={title} onClose={onClose}>
      <div className="stack">
        <Stars value={stars} onChange={setStars} />
        <div className="row wrap">{tags.map((t) => <button key={t} type="button" className={'chip' + (picked.includes(t) ? ' on' : '')} onClick={() => setPicked(picked.includes(t) ? picked.filter((x) => x !== t) : [...picked, t])}>{t}</button>)}</div>
        <textarea className="in" maxLength={300} placeholder="Komen ringkas (pilihan)" value={comment} onChange={(e) => setComment(e.target.value)} />
        <button className="btn block" disabled={!stars} onClick={() => onSubmit({ stars, tags: picked, comment })}>Hantar penarafan</button>
      </div>
    </Sheet>
  );
}

export default function EventDetail() {
  const { id } = useParams();
  const router = useRouter();
  const toast = useToast();
  const ev = useApi(`/events/${id}`);
  const rides = useApi(`/carpools?eventId=${id}`);
  const me = useApi('/me');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [win, setWin] = useState(null);
  const [rate, setRate] = useState(null); // null | 'organizer' | {studentId,name}
  const [offer, setOffer] = useState(false);

  if (ev.loading) return <div style={{ paddingTop: 40 }}><Skeletons /></div>;
  if (ev.error) return <div style={{ paddingTop: 40 }}><ErrorBox msg={ev.error} retry={ev.reload} /></div>;
  const e = ev.data.event;
  const cat = CATEGORIES[e.category] || { label: e.category, icon: '' };
  const refresh = () => Promise.all([ev.reload(), rides.reload(), me.reload()]);

  const act = async (fn, okMsg) => {
    setBusy(true);
    try { const r = await fn(); if (okMsg) toast(okMsg); await refresh(); return r; }
    catch (err) { toast(err.message, true); } finally { setBusy(false); }
  };
  const doCheckin = async () => {
    const r = await act(() => api(`/events/${id}/checkin`, { method: 'POST', body: { code } }));
    if (r) { setWin(r); setCode(''); }
  };
  const submitRating = (extra) => async (form) => {
    await act(() => api('/ratings', { method: 'POST', body: { eventId: id, ...extra, ...form } }), 'Terima kasih atas penarafan!');
    setRate(null);
  };
  const myJoined = (me.data?.myEvents || []).filter((x) => x.status === 'joined' && new Date(x.startsAt) > new Date());

  return (
    <>
      <header className="page-head"><button className="btn ghost sm" onClick={() => router.back()} aria-label="Kembali">← Kembali</button><span className="tag pts">+{e.points} mata</span></header>
      <div className="stack">
        <div className="card stack" style={{ gap: 8 }}>
          <span className="chip" style={{ width: 'fit-content' }}>{cat.icon} {cat.label}</span>
          <h1 style={{ fontSize: 22, letterSpacing: '-.02em' }}>{e.title}</h1>
          <div className="meta"><span>📍 {e.venue ? `${e.venue}, ` : ''}{e.district}</span><span>🗓 {fmtDate(e.startsAt)}, {fmtTime(e.startsAt)}</span><span>⏱ {e.durationHrs} jam</span></div>
          <p>{e.description}</p>
          <div className="row wrap"><span className="sub">{e.organizer.name} ({e.organizer.type})</span><Verified ok={e.organizer.verified} />{e.rating.count > 0 && <span className="tag">★ {e.rating.avg} ({e.rating.count})</span>}</div>
          {!e.organizer.verified && <p className="sub">⚠️ Penganjur ini belum disahkan. Jumpa di tempat awam dan maklumkan rakan sebelum pergi.</p>}
          {(e.tags.length > 0 || e.skillsCustom?.length > 0) && (
            <div><p className="sub" style={{ marginBottom: 4 }}>Kemahiran diperlukan</p><div className="row wrap">{e.tags.map((t) => <span key={t} className="chip">{TAGS[t] || t}</span>)}{e.skillsCustom?.map((t) => <span key={t} className="chip">{t}</span>)}</div></div>
          )}
          <p className="sub">{e.filled}/{e.slots} slot diisi</p>
          {e.match.reasons.length > 0 && !e.myStatus && <p className="reason">✨ {e.match.reasons.join(' · ')}</p>}
        </div>

        {/* Screening (optional, set by the organiser) */}
        {!e.isOwner && e.screening.enabled && (!e.myStatus || e.myApplication) && <ApplyPanel ev={e} onChange={refresh} />}
        {e.isOwner && e.screening.enabled && <ApplicantsPanel ev={e} onChange={refresh} />}

        {/* Student actions */}
        {!e.isOwner && (!e.screening.enabled || e.myStatus) && (
          <div className="card stack">
            {!e.myStatus && (e.ended ? <p className="sub">Aktiviti ini sudah tamat.</p> : <button className="btn block" disabled={busy || e.filled >= e.slots} onClick={() => act(() => api(`/events/${id}/join`, { method: 'POST' }), 'Anda sudah sertai! 🎉')}>{e.filled >= e.slots ? 'Penuh' : 'Sertai aktiviti'}</button>)}
            {e.myStatus === 'joined' && (
              <>
                <b>Pada hari kejadian: masukkan kod check-in</b>
                <p className="sub">Minta kod daripada penganjur. Mata dikira selepas check-in.</p>
                <div className="row"><input className="in" placeholder="KOD" value={code} onChange={(x) => setCode(x.target.value)} autoCapitalize="characters" aria-label="Kod check-in" /><button className="btn" disabled={busy || !code} onClick={doCheckin}>Check-in</button></div>
                <button className="btn ghost sm" disabled={busy} onClick={() => act(() => api(`/events/${id}/join`, { method: 'DELETE' }), 'Anda keluar dari aktiviti')}>Keluar dari aktiviti</button>
                {process.env.NODE_ENV !== 'production' && <p className="sub">Kod demo untuk aktiviti sampel: <b>MOH123</b></p>}
              </>
            )}
            {e.myStatus === 'checked_in' && (
              <>
                <p><span className="tag good">✔ Hadir</span> &nbsp;Anda dapat <b>{e.myPoints} mata</b> daripada aktiviti ini.</p>
                <div className="row wrap">
                  <button className="btn soft sm" onClick={() => act(() => downloadPdf(`/certificate?eventId=${id}`, { filename: 'sijil-moh-siswa.pdf' }))}>📜 Muat turun sijil</button>
                  {!e.iRated && <button className="btn soft sm" onClick={() => setRate('organizer')}>⭐ Nilai penganjur</button>}
                  {e.iRated && <span className="tag">Terima kasih, anda sudah menilai</span>}
                </div>
              </>
            )}
          </div>
        )}

        {/* Organiser view */}
        {e.isOwner && (
          <div className="card stack">
            <b>Anda penganjur</b>
            <p>Kod check-in: <span className="tag pts" style={{ fontSize: 16, letterSpacing: 2 }}>{e.checkInCode}</span></p>
            <p className="sub">Kongsi kod ini hanya kepada sukarelawan yang hadir. {e.checkedIn} telah check-in.</p>
            {e.roster?.length > 0 && <b>Sukarelawan</b>}
            {e.roster?.map((r) => (
              <div key={r.userId} className="row between">
                <span>{r.name} <span className={'tag' + (r.status === 'checked_in' ? ' good' : '')}>{r.status === 'checked_in' ? 'Hadir' : 'Belum'}</span></span>
                {r.status === 'checked_in' && (r.rated ? <span className="sub">Dinilai</span> : <button className="btn soft sm" onClick={() => setRate({ studentId: r.userId, name: r.name })}>Nilai</button>)}
              </div>
            ))}
          </div>
        )}

        {/* Moh Tumpang! */}
        <div className="sec" style={{ margin: '10px 0 0' }}><h2>🚗 Moh Tumpang!</h2>{e.myStatus === 'joined' && <button className="btn soft sm" onClick={() => setOffer(true)}>Tawar tumpangan</button>}</div>
        {rides.data?.rides.length ? rides.data.rides.map((r) => <RideCard key={r.id} r={r} onChange={refresh} />) : <p className="sub">Belum ada tumpangan. {e.myStatus ? 'Ada kereta? Tawarkan dan dapat +10 mata.' : 'Sertai aktiviti untuk menempah tumpangan.'}</p>}
      </div>

      {win && (
        <div className="pop" onClick={() => setWin(null)}>
          <div onClick={(x) => x.stopPropagation()}>
            <div className="plus">+{win.total}</div>
            <h2>Perak Points masuk!</h2>
            <p className="sub" style={{ margin: '6px 0' }}>{win.points} mata aktiviti{win.bonuses.map((b) => ` · +${b.points} ${b.label}`).join('')}</p>
            {win.newBadges.map((b) => <p key={b.key} style={{ marginTop: 8 }}><span className="tag good" style={{ fontSize: 14 }}>{b.icon} Lencana baharu: {b.title}</span></p>)}
            <button className="btn block" style={{ marginTop: 16 }} onClick={() => setWin(null)}>Hebat!</button>
          </div>
        </div>
      )}
      {rate === 'organizer' && <RateSheet title="Nilai penganjur" tags={RATING_TAGS_ORGANIZER} onClose={() => setRate(null)} onSubmit={submitRating({ direction: 'student_to_organizer' })} />}
      {rate?.studentId && <RateSheet title={`Nilai ${rate.name}`} tags={RATING_TAGS_STUDENT} onClose={() => setRate(null)} onSubmit={submitRating({ direction: 'organizer_to_student', studentId: rate.studentId })} />}
      {offer && <OfferRide events={myJoined} eventId={id} onClose={() => setOffer(false)} onDone={refresh} />}
    </>
  );
}
