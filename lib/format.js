export const fmtDate = (d) => new Date(d).toLocaleDateString('ms-MY', { weekday: 'short', day: 'numeric', month: 'short' });
export const fmtTime = (d) => new Date(d).toLocaleTimeString('ms-MY', { hour: 'numeric', minute: '2-digit' });
export const fmtDateTime = (d) => `${fmtDate(d)}, ${fmtTime(d)}`;
export const rm = (n) => 'RM' + Number(n || 0).toLocaleString('en-MY');
export const initials = (name = '') => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
// <input type="datetime-local"> wants local time without a zone
export const toLocalInput = (d) => {
  const x = new Date(d);
  x.setMinutes(x.getMinutes() - x.getTimezoneOffset());
  return x.toISOString().slice(0, 16);
};
