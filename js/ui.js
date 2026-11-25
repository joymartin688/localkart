// Small building blocks shared by the customer and vendor screens.

// Event handlers, filled in by customer.js, vendor.js and app.js.
// Markup says data-a="name" (click), data-in="name" (typing), data-ch="name" (change), data-form="name" (submit).
const ACT = {}, INPUT = {}, CHANGE = {}, FORM = {};

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = n => '₹' + Math.round(n).toLocaleString('en-IN');

const ICONS = {
  home: '<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
  pin: '<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  bag: '<path d="M5 8h14l-1 12H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
  receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6M9 16h3"/>',
  mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
  heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
  phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  check: '<path d="M5 12l5 5 9-10"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
  next: '<path d="M9 5l7 7-7 7"/>',
  down: '<path d="M6 9l6 6 6-6"/>',
  bell: '<path d="M6 16v-5a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
  shop: '<path d="M4 9l2-5h12l2 5"/><path d="M4 9a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0 2.7 2.7 0 0 0 5.3 0"/><path d="M5 11v9h14v-9M10 20v-5h4v5"/>',
  box: '<path d="M3 7l9-4 9 4-9 4z"/><path d="M3 7v10l9 4 9-4V7M12 11v10"/>',
  chart: '<path d="M5 20v-6M11 20V9M17 20V4M3 20h18"/>',
  walk: '<circle cx="13" cy="4.5" r="1.8"/><path d="M10 21l2.5-6.5L10 11l1.5-4 3.5 3 3 1M8.5 12.5L10 9M13 15l2.5 6"/>',
  bike: '<circle cx="6" cy="17" r="3"/><circle cx="18" cy="17" r="3"/><path d="M6 17h5l4-8h3M15 9l3 8M9 9h4"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  reset: '<path d="M4 12a8 8 0 1 0 2.3-5.6L4 9"/><path d="M4 4v5h5"/>',
  split: '<rect x="3" y="4" width="8" height="16" rx="2"/><rect x="13" y="4" width="8" height="16" rx="2"/>',
  camera: '<rect x="3" y="7" width="18" height="13" rx="2"/><circle cx="12" cy="13.5" r="3.5"/><path d="M8 7l2-3h4l2 3"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13 7l4 4"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  map: '<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/>',
  list: '<path d="M9 6h12M9 12h12M9 18h12"/><circle cx="4.5" cy="6" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="18" r="1"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
  bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>',
  repeat: '<path d="M17 2l3 3-3 3"/><path d="M4 11V9a4 4 0 0 1 4-4h12M7 22l-3-3 3-3"/><path d="M20 13v2a4 4 0 0 1-4 4H4"/>',
  star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
  tag: '<path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9z"/><circle cx="8" cy="8" r="1.5"/>',
  leaf: '<path d="M5 19c0-9 6-14 15-14 0 9-5 15-14 15"/><path d="M5 19l8-8"/>',
  truck: '<path d="M2 6h12v10H2z"/><path d="M14 9h4l3 3v4h-7"/><circle cx="6" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
  cash: '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 9v.01M18 15v.01"/>',
  fire: '<path d="M12 3c1 3 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-6 1-9z"/>',
  send: '<path d="M21 3 3 10.5l7 2.5 2.5 7z"/><path d="M10 13 21 3"/>'
};
const icon = (n, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n] || ''}</svg>`;

const slate = (price, unit, big) => `<span class="slate${big ? ' big' : ''}">${money(price)}<em>/${esc(unitShort(unit))}</em></span>`;
const rate = v => v.nrating ? `<span class="rate">${icon('star', 'fill')}${v.rating.toFixed(1)}</span>` : `<span class="rate new">${t('New')}</span>`;

function stockBadge(l) {
  if (!l.available || l.stock <= 0) return `<span class="badge out">${t('Out today')}</span>`;
  if (l.stock <= UNITS[l.unit].low) return `<span class="badge low">${tf('Only {q} left', { q: qtyLabel(l.stock, l.unit) })}</span>`;
  return `<span class="badge ok">${t('In stock')}</span>`;
}

const openPill = v => v.open ? `<span class="pill open">${t('Open now')}</span>` : `<span class="pill shut">${t('Closed now')}</span>`;

function timeAgo(ts) {
  const m = Math.round((Date.now() - ts) / 6e4);
  if (m < 1) return t('just now');
  if (m < 60) return tf('{n} min ago', { n: m });
  if (isToday(ts)) return tf('{n} h ago', { n: Math.round(m / 60) });
  if (isYesterday(ts)) return t('yesterday');
  return new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}
const clock = ts => new Date(ts).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });

// Screen header. opts: back (bool), right (html), sub (text)
function head(title, opts = {}) {
  return `<header class="head">
    ${opts.back ? `<button class="icon-btn" data-a="back" aria-label="${t('Back')}">${icon('back')}</button>` : ''}
    <div class="head-t"><h1>${title}</h1>${opts.sub ? `<p>${opts.sub}</p>` : ''}</div>
    ${opts.right || ''}
  </header>`;
}

function empty(pic, title, text, btn) {
  return `<div class="empty">${pic}<h2>${title}</h2>${text ? `<p>${text}</p>` : ''}${btn || ''}</div>`;
}

function stepper(action, id, qty, unit, extra = '') {
  return `<div class="step" ${extra}>
    <button data-a="${action}" data-id="${id}" data-d="-1" aria-label="${t('Less')}">${icon('minus')}</button>
    <span class="step-q">${qtyLabel(qty, unit)}</span>
    <button data-a="${action}" data-id="${id}" data-d="1" aria-label="${t('More')}">${icon('plus')}</button>
  </div>`;
}

function seg(action, current, options, extra = '') {
  return `<div class="seg" role="group" ${extra}>${options.map(([val, label, dis]) =>
    `<button data-a="${action}" data-v="${val}" class="${String(current) === String(val) ? 'on' : ''}" ${dis ? 'disabled' : ''} aria-pressed="${String(current) === String(val)}">${label}</button>`).join('')}</div>`;
}

const sw = (action, on, label, id = '') =>
  `<button class="switch ${on ? 'on' : ''}" role="switch" aria-checked="${on}" data-a="${action}" data-id="${id}"><span class="knob"></span><span class="sw-l">${label}</span></button>`;

function progress(o) {
  const flow = flowFor(o);
  if (o.status === 'rejected' || o.status === 'cancelled') {
    return `<div class="prog stopped"><div class="prog-msg">${o.status === 'rejected' ? t("The vendor couldn't take this order.") : t('You cancelled this order.')}</div></div>`;
  }
  const at = flow.indexOf(o.status);
  const when = s => { const h = o.history.find(x => x.s === s); return h ? clock(h.t) : ''; };
  return `<ol class="prog" style="--done:${at / (flow.length - 1)}">${flow.map((s, i) =>
    `<li class="${i < at ? 'done' : i === at ? 'now' : ''}"><span class="dot">${i <= at ? icon('check') : ''}</span><b>${statusLabel(s, o.mode)}</b><small>${when(s)}</small></li>`).join('')}</ol>`;
}
