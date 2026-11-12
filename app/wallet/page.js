'use client';
import { useState } from 'react';
import Link from 'next/link';
import { api, useApi, useCountUp } from '@/lib/client';
import { levelFor } from '@/lib/constants';
import { fmtDate } from '@/lib/format';
import { ErrorBox, Ring, Sheet, Skeletons } from '@/components/ui';
import { useToast } from '@/components/AppShell';

export default function Wallet() {
  const w = useApi('/rewards');
  const me = useApi('/me');
  const toast = useToast();
  const [pick, setPick] = useState(null);
  const [got, setGot] = useState(null);
  const [busy, setBusy] = useState(false);
  const pts = useCountUp(w.data?.points ?? 0);

  if (w.loading || me.loading) return <div className="stack" style={{ paddingTop: 40 }}><Skeletons /></div>;
  if (w.error) return <ErrorBox msg={w.error} retry={w.reload} />;
  const level = me.data ? me.data.level : levelFor(0);
  const redeem = async () => {
    setBusy(true);
    try { const r = await api(`/rewards/${pick.id}/redeem`, { method: 'POST' }); setGot(r.redemption); setPick(null); await Promise.all([w.reload(), me.reload()]); }
    catch (e) { toast(e.message, true); } finally { setBusy(false); }
  };

  return (
    <>
      <header className="page-head"><div><h1>Dompet</h1><p className="sub">Perak Points &amp; ganjaran</p></div></header>
      <section className="card hero">
        <div className="row between">
          <div><p className="sub">Baki mata</p><p className="big">{pts}</p><p className="sub" style={{ marginTop: 6 }}>Tahap {level.name}{level.next ? ` · ${level.toNext} lagi ke ${level.next.name}` : ''}</p></div>
          <Ring pct={level.progress} size={88}><b>{level.progress}%</b></Ring>
        </div>
      </section>

      <div className="sec"><h2>Tebus ganjaran</h2></div>
      <div className="stack">
        {w.data.rewards.map((r) => {
          const can = w.data.points >= r.cost && r.stock !== 0;
          return (
            <div key={r.id} className="card row">
              {r.icon
                  ? <img src={r.icon} alt="" width={40} height={40} style={{ objectFit: 'contain' }} />
                  : <span style={{ fontSize: 32 }} aria-hidden>{r.emoji}</span>}
              <div className="grow"><b>{r.title}</b><p className="sub">{r.description}</p><p className="sub">{r.provider}</p></div>
              <button className={'btn sm' + (can ? '' : ' ghost')} disabled={!can} onClick={() => setPick(r)}>{r.cost} mata</button>
            </div>
          );
        })}
        <p className="sub">Ganjaran contoh. Penyedia sebenar (kerajaan negeri, Yayasan Perak, KTM) perlu disahkan sebelum pelancaran.</p>
      </div>

      {w.data.redemptions.length > 0 && (
        <>
          <div className="sec"><h2>Baucar saya</h2></div>
          <div className="stack">{w.data.redemptions.map((r) => <div key={r.id} className="card row between"><div><b>{r.rewardTitle}</b><p className="sub">{fmtDate(r.createdAt)}</p></div><span className="tag pts" style={{ letterSpacing: 1 }}>{r.code}</span></div>)}</div>
        </>
      )}

      <div className="sec"><h2>Sejarah mata</h2></div>
      <div className="card stack" style={{ gap: 10 }}>
        {w.data.txs.length === 0 && <p className="sub">Belum ada transaksi. <Link href="/feed" style={{ color: 'var(--primary-strong)' }}>Cari aktiviti</Link></p>}
        {w.data.txs.map((t) => <div key={t.id} className="row between"><div><p>{t.reason}</p><p className="sub">{fmtDate(t.createdAt)}</p></div><b style={{ color: t.amount < 0 ? 'var(--bad)' : 'var(--good)' }}>{t.amount > 0 ? '+' : ''}{t.amount}</b></div>)}
      </div>

      {pick && (
        <Sheet title={`Tebus ${pick.title}?`} onClose={() => setPick(null)}>
          <div className="stack"><p>{pick.cost} mata akan ditolak. Baki selepas tebus: <b>{w.data.points - pick.cost}</b>.</p><button className="btn block" disabled={busy} onClick={redeem}>Ya, tebus</button></div>
        </Sheet>
      )}
      {got && (
        <div className="pop" onClick={() => setGot(null)}><div onClick={(e) => e.stopPropagation()}>
          <div style={{ fontSize: 48 }}>🎁</div><h2>Berjaya ditebus!</h2><p className="sub">{got.rewardTitle}</p>
          <p className="tag pts" style={{ fontSize: 20, letterSpacing: 2, margin: '12px 0', padding: '8px 14px' }}>{got.code}</p>
          <button className="btn block" onClick={() => setGot(null)}>Selesai</button>
        </div></div>
      )}
    </>
  );
}
