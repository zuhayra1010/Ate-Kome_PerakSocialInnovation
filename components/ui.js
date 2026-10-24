'use client';
import Link from 'next/link';
import { useEffect } from 'react';
import { CATEGORIES } from '@/lib/constants';
import { fmtDate, fmtTime } from '@/lib/format';

export function Sheet({ title, onClose, children }) {
  useEffect(() => {
    const k = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);
  return (
    <div className="backdrop" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <div className="grab" />
        {title && <h2>{title}</h2>}
        {children}
      </div>
    </div>
  );
}

export function Stars({ value, onChange }) {
  return (
    <div className="row" role="radiogroup" aria-label="Penarafan">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" className={'star' + (n <= value ? ' on' : '')} onClick={() => onChange(n)} aria-label={`${n} bintang`} aria-checked={n === value} role="radio">★</button>
      ))}
    </div>
  );
}

export function Ring({ pct, size = 96, stroke = 9, color = 'var(--ring)', track = 'var(--ring-track)', children }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }} aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" style={{ stroke: track }} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - Math.min(100, pct) / 100)} style={{ stroke: color, transition: 'stroke-dashoffset 1s ease-out' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center' }}>{children}</div>
    </div>
  );
}

export const Verified = ({ ok = true }) =>
  ok ? <span className="tag good" title="Disahkan">✔ Disahkan</span> : <span className="tag warn" title="Belum disahkan">Belum disahkan</span>;

export const Skeletons = ({ n = 3 }) => (
  <div className="stack">{Array.from({ length: n }, (_, i) => <div key={i} className="skeleton" />)}</div>
);

export const Empty = ({ icon = '🌱', children }) => (
  <div className="empty"><b aria-hidden>{icon}</b>{children}</div>
);

export const ErrorBox = ({ msg, retry }) => (
  <div className="card" role="alert"><p>{msg}</p>{retry && <button className="btn soft sm" style={{ marginTop: 8 }} onClick={retry}>Cuba lagi</button>}</div>
);

export function EventCard({ ev, showReasons = true }) {
  const cat = CATEGORIES[ev.category] || { label: ev.category, emoji: '✨' };
  const pct = Math.round((ev.filled / ev.slots) * 100);
  return (
    <Link href={`/feed/${ev.id}`} className="card ev" style={{ position: 'relative' }}>
      <div className="row between">
        <span className="chip">{cat.emoji} {cat.label}</span>
        <span className="row" style={{ gap: 6 }}>{ev.screening?.enabled && !ev.myStatus && !ev.isOwner && <span className="tag">📝 Saringan</span>}<span className="tag pts">+{ev.points} mata</span></span>
      </div>
      <h3>{ev.title}</h3>
      <div className="meta">
        <span>📍 {ev.district}</span><span>🗓 {fmtDate(ev.startsAt)}, {fmtTime(ev.startsAt)}</span><span>⏱ {ev.durationHrs} jam</span>
      </div>
      <div className="row wrap" style={{ margin: '8px 0 6px' }}>
        <span className="sub">{ev.organizer.name}</span>
        <Verified ok={ev.organizer.verified} />
        {ev.rating?.count > 0 && <span className="tag">★ {ev.rating.avg}</span>}
      </div>
      <div className="bar" aria-label={`${ev.filled} daripada ${ev.slots} slot`}><i style={{ width: pct + '%' }} /></div>
      <div className="row between" style={{ marginTop: 6 }}>
        <span className="sub">{ev.filled}/{ev.slots} sertai</span>
        {ev.myStatus === 'checked_in' ? <span className="tag good">✔ Hadir</span> : ev.myStatus ? <span className="tag">Anda sertai</span> : ev.isOwner ? <span className="tag">Anda anjur</span> : ev.filled >= ev.slots ? <span className="tag warn">Penuh</span> : null}
      </div>
      {showReasons && ev.match?.reasons?.length > 0 && !ev.myStatus && <div className="reason" style={{ marginTop: 6 }}>✨ {ev.match.reasons[0]}</div>}
    </Link>
  );
}
