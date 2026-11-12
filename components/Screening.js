'use client';
import { useState } from 'react';
import { api } from '@/lib/client';
import { fmtDate, fmtDateTime, toLocalInput } from '@/lib/format';
import { Sheet } from '@/components/ui';
import { useToast } from '@/components/AppShell';

const DECISION = { advance: ['Lulus', 'good'], accept: ['Diterima', 'good'], reject: ['Tidak berjaya', 'warn'] };

export function History({ items }) {
  if (!items?.length) return null;
  return (
    <div className="stack" style={{ gap: 8 }}>
      {items.map((h, i) => (
        <div key={i} className="note">
          <div className="row between"><b>{h.stage}</b><span className={'tag ' + DECISION[h.decision][1]}>{DECISION[h.decision][0]}</span></div>
          {h.feedback ? <p>💬 {h.feedback}</p> : <p className="sub">Tiada maklum balas bertulis.</p>}
          <p className="sub">{fmtDate(h.at)}</p>
        </div>
      ))}
    </div>
  );
}

/* ---------- Student side ---------- */
export function ApplyPanel({ ev, onChange }) {
  const toast = useToast();
  const app = ev.myApplication;
  const [open, setOpen] = useState(false);
  const [answers, setAnswers] = useState(ev.screening.questions.map(() => ''));
  const [busy, setBusy] = useState(false);
  const s = ev.screening;

  const submit = async (e) => {
    e.preventDefault(); setBusy(true);
    try { await api(`/events/${ev.id}/apply`, { method: 'POST', body: { answers } }); toast('Permohonan dihantar! 📨'); setOpen(false); await onChange(); }
    catch (err) { toast(err.message, true); } finally { setBusy(false); }
  };
  const withdraw = async () => {
    setBusy(true);
    try { await api(`/events/${ev.id}/apply`, { method: 'DELETE' }); toast('Permohonan ditarik balik'); await onChange(); }
    catch (err) { toast(err.message, true); } finally { setBusy(false); }
  };

  return (
    <div className="card stack">
      <div className="row between"><b>📝 Saringan penganjur</b><span className="tag">Pilihan penganjur</span></div>
      {!app && (
        <>
          <p className="sub">Aktiviti ini perlu permohonan dahulu: {s.questions.length > 0 && `${s.questions.length} soalan`}{s.questions.length > 0 && s.rounds.length > 0 && ' + '}{s.rounds.length > 0 && `${s.rounds.length} pusingan temu duga (Microsoft Teams)`}. Anda akan dapat maklum balas pada setiap peringkat.</p>
          {ev.ended ? <p className="sub">Aktiviti ini sudah tamat.</p> : <button className="btn block" onClick={() => setOpen(true)}>Mohon sertai</button>}
        </>
      )}
      {app?.status === 'pending' && <><p><span className="tag">⏳ Menunggu semakan</span></p><p className="sub">Penganjur sedang menyemak jawapan anda.</p></>}
      {app?.status === 'interview' && (
        <>
          <p><span className="tag good">🎥 Lulus ke: {app.stage}</span></p>
          {app.interviewAt && <p>🗓 {fmtDateTime(app.interviewAt)}</p>}
          {app.teamsLink ? <a className="btn block" href={app.teamsLink} target="_blank" rel="noopener noreferrer">Sertai mesyuarat Microsoft Teams</a> : <p className="sub">Penganjur akan hubungi anda tentang butiran temu duga.</p>}
        </>
      )}
      {app?.status === 'rejected' && <p><span className="tag warn">Permohonan tidak berjaya</span> <span className="sub">Jangan putus asa, cuba aktiviti lain!</span></p>}
      {app?.status === 'accepted' && <p><span className="tag good">✔ Anda diterima!</span></p>}
      <History items={app?.history} />
      {(app?.status === 'pending' || app?.status === 'interview') && <button className="btn ghost sm" disabled={busy} onClick={withdraw}>Tarik balik permohonan</button>}

      {open && (
        <Sheet title="Permohonan anda" onClose={() => setOpen(false)}>
          <form className="stack" onSubmit={submit}>
            {s.questions.map((q, i) => (
              <label key={i} className="f">{i + 1}. {q}
                <textarea className="in" required maxLength={600} value={answers[i]} onChange={(e) => setAnswers(answers.map((a, j) => (j === i ? e.target.value : a)))} />
              </label>
            ))}
            {s.questions.length === 0 && <p>Tiada soalan. Hantar permohonan anda untuk disemak.</p>}
            <button className="btn block" disabled={busy}>Hantar permohonan</button>
          </form>
        </Sheet>
      )}
    </div>
  );
}

/* ---------- Organiser side ---------- */
function DecideSheet({ app, action, totalRounds, onClose, onDone }) {
  const toast = useToast();
  const [feedback, setFeedback] = useState('');
  const [when, setWhen] = useState(toLocalInput(new Date(Date.now() + 2 * 864e5)));
  const [busy, setBusy] = useState(false);
  const goingToRound = action === 'advance' && app.round < totalRounds;
  const title = action === 'reject' ? `Tolak ${app.name}` : goingToRound ? `Lulus ${app.name} ke pusingan ${app.round + 1}` : `Terima ${app.name}`;
  const submit = async () => {
    setBusy(true);
    try {
      await api(`/applications/${app.id}/decide`, { method: 'POST', body: { decision: action, feedback, interviewAt: goingToRound && when ? new Date(when).toISOString() : undefined } });
      toast('Keputusan dihantar kepada pelajar'); await onDone(); onClose();
    } catch (e) { toast(e.message, true); setBusy(false); }
  };
  return (
    <Sheet title={title} onClose={onClose}>
      <div className="stack">
        {goingToRound && <label className="f">Masa temu duga (pilihan)<input className="in" type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} /></label>}
        <label className="f">Maklum balas untuk pelajar {action === 'reject' ? '(digalakkan, supaya mereka boleh bertambah baik)' : '(pilihan)'}
          <textarea className="in" maxLength={500} value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="cth. Jawapan anda bagus, kami mahu kenal anda dengan lebih lanjut." />
        </label>
        <button className={'btn block' + (action === 'reject' ? ' danger' : '')} disabled={busy} onClick={submit}>Hantar keputusan</button>
      </div>
    </Sheet>
  );
}

export function ApplicantsPanel({ ev, onChange }) {
  const [act, setAct] = useState(null); // {app, action}
  const apps = ev.applications || [];
  const open = apps.filter((a) => a.status === 'pending' || a.status === 'interview');
  const closed = apps.filter((a) => !['pending', 'interview'].includes(a.status));
  const totalRounds = ev.screening.rounds.length;
  const label = { pending: 'Baharu', interview: 'Temu duga', accepted: 'Diterima', rejected: 'Ditolak' };

  const Card = ({ a }) => (
    <div className="card stack" style={{ gap: 8, boxShadow: 'none' }}>
      <div className="row between"><div><b>{a.name}</b><p className="sub">{a.course} · {a.university}</p></div>
        <div style={{ textAlign: 'right' }}><span className={'tag' + (a.status === 'accepted' ? ' good' : a.status === 'rejected' ? ' warn' : '')}>{label[a.status]}{a.status === 'interview' ? ` ${a.round}` : ''}</span>{a.rating.count > 0 && <p className="sub">★ {a.rating.avg} ({a.rating.count})</p>}</div></div>
      <details><summary style={{ cursor: 'pointer', fontWeight: 700 }}>Jawapan ({a.answers.length})</summary>
        <div className="stack" style={{ gap: 8, marginTop: 8 }}>{a.answers.map((x, i) => <div key={i}><p className="sub">{x.q}</p><p>{x.a}</p></div>)}{a.answers.length === 0 && <p className="sub">Tiada soalan.</p>}</div></details>
      {a.interviewAt && a.status === 'interview' && <p className="sub">🗓 Temu duga: {fmtDateTime(a.interviewAt)}</p>}
      <History items={a.history} />
      {(a.status === 'pending' || a.status === 'interview') && (
        <div className="row wrap">
          <button className="btn sm" onClick={() => setAct({ app: a, action: 'advance' })}>{a.round < totalRounds ? `Lulus ke pusingan ${a.round + 1}` : 'Terima'}</button>
          {a.round < totalRounds && <button className="btn soft sm" onClick={() => setAct({ app: a, action: 'accept' })}>Terima terus</button>}
          <button className="btn danger sm" onClick={() => setAct({ app: a, action: 'reject' })}>Tolak</button>
        </div>
      )}
    </div>
  );

  return (
    <div className="card stack">
      <b>📝 Permohonan ({apps.length})</b>
      <p className="sub">Saringan: {ev.screening.questions.length} soalan, {totalRounds} pusingan temu duga. Pelajar yang diterima terus masuk senarai sukarelawan.</p>
      {ev.teamsLinks?.map((r, i) => <p key={i} className="sub">🎥 {r.name}: {r.teamsLink ? <a href={r.teamsLink} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-strong)', fontWeight: 700 }}>pautan Teams</a> : 'tiada pautan'}</p>)}
      {open.map((a) => <Card key={a.id} a={a} />)}
      {open.length === 0 && <p className="sub">Tiada permohonan menunggu.</p>}
      {closed.length > 0 && <details><summary style={{ cursor: 'pointer', fontWeight: 700 }}>Selesai ({closed.length})</summary><div className="stack" style={{ marginTop: 8 }}>{closed.map((a) => <Card key={a.id} a={a} />)}</div></details>}
      {act && <DecideSheet app={act.app} action={act.action} totalRounds={totalRounds} onClose={() => setAct(null)} onDone={onChange} />}
    </div>
  );
}
