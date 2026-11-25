// Screens, navigation and events.
// There are two "phones": the customer one and the vendor one. On a small screen
// you see one at a time; on a laptop you can put them side by side, which is how
// we film the demo (order on the left, it pops up on the right).

let MODE = 'landing';           // landing | single | split
let ROLE = 'customer';          // which phone shows in single mode
const BOOT = Date.now();

const PANES = {
  customer: { role: 'customer', stack: [{ v: 'home' }], form: {}, ui: {}, el: null, seenNote: 0 },
  vendor: { role: 'vendor', stack: [{ v: 'today' }], form: {}, ui: {}, el: null }
};
const SCREENS = { customer: C, vendor: V };

const route = p => p.stack[p.stack.length - 1];
function go(p, v, params = {}) { p.stack.push({ v, ...params }); renderPane(p, true); }
function back(p) {
  if (p.sheet) return closeSheet(p);
  if (p.stack.length > 1) p.stack.pop();
  else p.stack = [{ v: p.role === 'vendor' ? 'today' : 'home' }];
  renderPane(p, true);
}
function tab(p, v) { p.stack = [{ v }]; p.form = v === 'cart' ? p.form : {}; renderPane(p, true); }

function openSheet(p, kind, data) { p.sheet = { kind, data }; renderPane(p); }
function closeSheet(p) { p.sheet = null; renderPane(p); }

function toast(p, msg) {
  const el = p && p.el ? p.el.querySelector('.toast') : document.getElementById('gtoast');
  if (!el || !msg) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 2800);
}

// ---------------- rendering ----------------
function renderAll() {
  document.documentElement.lang = MODE !== 'landing' && S.lang === 'ta' ? 'ta' : 'en';
  renderBar();
  if (MODE === 'landing') return;
  visiblePanes().forEach(p => renderPane(p));
}

const visiblePanes = () => MODE === 'split' ? [PANES.customer, PANES.vendor] : [PANES[ROLE]];

function renderPane(p, fresh) {
  if (!p.el || MODE === 'landing' || !visiblePanes().includes(p)) return;
  const scr = p.el.querySelector('.scr');
  const keep = focusState(p);
  const r = route(p);
  const fn = SCREENS[p.role][r.v] || SCREENS[p.role][p.role === 'vendor' ? 'today' : 'home'];
  let html;
  try { html = fn(p); } catch (e) {
    console.warn(e);
    html = head(t('Something went wrong'), { back: true }) + empty('', t('This screen could not load.'), t('Go back, or reset the demo from the top bar.'), '');
  }
  scr.innerHTML = html;
  if (fresh) scr.scrollTop = 0;
  p.el.classList.toggle('easy', p.role === 'vendor' && S.easy);
  const lab = p.el.querySelector('.pane-l');
  if (lab) lab.textContent = p.role === 'vendor' ? tf('Vendor app · {shop}', { shop: ta() ? myShop().shopTa : myShop().shop }) : tf('Customer app · {name}', { name: S.me.name });
  p.el.querySelector('.tabs').innerHTML = tabsHtml(p);
  p.el.querySelector('.sheet').innerHTML = p.sheet ? sheetHtml(p) : '';
  p.el.querySelector('.sheet').classList.toggle('open', !!p.sheet);
  restoreFocus(p, keep);
  if (p.role === 'customer') noteToast(p);
}

function tabsHtml(p) {
  const r = p.stack[0].v;
  return SCREENS[p.role].tabs().map(([v, ic, label, n]) =>
    `<button data-a="tab" data-v="${v}" class="${r === v ? 'on' : ''}" ${r === v ? 'aria-current="page"' : ''}>${icon(ic)}<span>${label}</span>${n ? `<i class="dotn">${n}</i>` : ''}</button>`).join('');
}

function sheetHtml(p) {
  const s = p.sheet;
  let body = '';
  if (s.kind === 'bill') body = `<h2>${t('Bill')}</h2><p class="note">${t('Copying is blocked here. Select the text and copy it yourself.')}</p><textarea class="bill" readonly rows="10">${esc(s.data)}</textarea>`;
  else if (C.sheets[s.kind]) body = C.sheets[s.kind](p);
  // name the dialog after its own heading
  body = body.replace('<h2', `<h2 id="sh-t-${p.role}"`);
  return `<div class="sheet-bg" data-a="sheet-close"></div><div class="sheet-box" role="dialog" aria-modal="true" aria-labelledby="sh-t-${p.role}">
    <button class="icon-btn sheet-x" data-a="sheet-close" aria-label="${t('Close')}">${icon('x')}</button>${body}</div>`;
}

// Tell the customer when the vendor moves their order along (the "it moved!" moment in the demo).
function noteToast(p) {
  const n = S.notes[0];
  if (!n || n.t <= Math.max(BOOT, p.seenNote)) return;
  p.seenNote = n.t;
  const o = orderById(n.oid);
  if (o) setTimeout(() => toast(p, tf(STATUS_NOTE[n.s], { shop: shopName(vendorById(o.vendor)) })), 60);
}

function focusState(p) {
  const a = document.activeElement;
  if (!a || !p.el.contains(a) || !a.dataset || !a.dataset.in) return null;
  return { k: a.dataset.in, name: a.name, s: a.selectionStart, e: a.selectionEnd };
}
function restoreFocus(p, k) {
  if (!k) return;
  const n = p.el.querySelector(`[data-in="${k.k}"]${k.name ? `[name="${k.name}"]` : ''}`);
  if (!n) return;
  n.focus();
  try { n.setSelectionRange(k.s, k.e); } catch (e) { /* number inputs */ }
}

// ---------------- top bar + landing ----------------
function renderBar() {
  const bar = document.getElementById('bar');
  const wide = window.innerWidth >= 1000;
  const say = MODE === 'landing' ? (s => s) : t; // top bar is English on the landing page
  bar.classList.toggle('compact', MODE !== 'landing');
  bar.innerHTML = `
    <button class="logo" data-a="landing" aria-label="LocalKart home">${logoMark()}<span>Local<b>Kart</b></span></button>
    <span class="demo-tag">${say('Demo · sample data')}</span>
    <span class="grow"></span>
    ${MODE !== 'landing' && MODE !== 'split' ? seg('role', ROLE, [['customer', t('Customer')], ['vendor', t('Vendor')]], `aria-label="${say('Switch app')}"`) : ''}
    ${wide && MODE !== 'landing' ? `<button class="barbtn ${MODE === 'split' ? 'on' : ''}" data-a="split" aria-pressed="${MODE === 'split'}">${icon('split')}<span>${say('Side by side')}</span></button>` : ''}
    ${MODE !== 'landing' ? `<button class="barbtn" data-a="lang" aria-label="${S.lang === 'ta' ? 'English' : 'Tamil'} · ${say('Change language')}">${S.lang === 'ta' ? 'English' : 'Tamil'}</button>` : ''}
    <button class="barbtn" data-a="reset" aria-label="${say('Reset')} · ${say('Reset the demo?').replace('?', '')}">${icon('reset')}<span>${say('Reset')}</span></button>`;
}

function logoMark() {
  return `<svg viewBox="0 0 32 32" class="mark" aria-hidden="true"><path d="M4 9h24l-2 7H6z" fill="#f4a21c"/><path d="M8 9h4l-1 7H7zM16 9h4l1 7h-4z" fill="#fff" opacity=".85"/>
    <path d="M6 16h20v5H6z" fill="#f6f1e4"/><circle cx="10" cy="25" r="3" fill="#f6f1e4"/><circle cx="22" cy="25" r="3" fill="#f6f1e4"/></svg>`;
}

// The landing page stays in English on purpose: it's the first screen judges and
// visitors see. Tamil switches on inside the customer and vendor apps.
function landing() {
  const t = s => s;
  return `<div class="landing">
  <section class="lband">
    ${garland()}
    <div class="lhero">
      <div class="lhero-t">
        <p class="eyebrow">${t('For the carts and stalls on your street')}</p>
        <h1>${t('See what the vendor at the corner has today, and at what price.')}</h1>
        <p class="lead">${t('Milk, rice, tea and soap from the shop next door, often ready in about 15 minutes. LocalKart shows every nearby cart and shop that has it, how soon you can have it, and what it costs. Vendors run it from a simple app with big buttons.')}</p>
        <div class="lbtns">
          <button class="btn primary big" data-a="start" data-v="customer">${icon('bag')}${t('I’m shopping')}</button>
          <button class="btn on-dark big" data-a="start" data-v="vendor">${icon('shop')}${t('I sell on the street')}</button>
        </div>
        <p class="lsmall"><button class="link" data-a="start-register">${t('New vendor? Register in two minutes')}</button>
          ${window.innerWidth >= 1000 ? `<button class="link" data-a="start" data-v="split">${icon('split')}${t('See both apps side by side')}</button>` : ''}</p>
      </div>
      <div class="lhero-p">${heroCart()}</div>
    </div>
  </section>
  <div class="lbody">
    <section class="lpoints">
      <div><span class="pic">${art('tomato')}</span><h2>${t('Today’s rate at every cart')}</h2><p>${t('Search “thakkali” and see every vendor nearby who has it, with price, distance and stock.')}</p></div>
      <div class="lp-hot"><span class="pic">${art('marigold')}</span><h2>${t('Best value, not just cheapest')}</h2><p>${t('₹2 cheaper but 3 km away isn’t a deal. We weigh price, distance, rating and stock, and say why.')}</p></div>
      <div class="lp-sky"><span class="pic">${art('milk')}</span><h2>${t('Your daily basket, next door')}</h2><p>${t('Milk, bread, rice and tea, each from the best-value shop nearby. One tap fills the cart, and you see how soon you can have it.')}</p></div>
      <div class="lp-leaf"><span class="pic">${art('coriander')}</span><h2>${t('Built for the vendor too')}</h2><p>${t('Big buttons to change a price, a walk-in bill that understands “2 kg thakkali”, and tomorrow’s market list with orders to their regular trader.')}</p></div>
    </section>
    <p class="ldemo">${t('Demo build: fourteen sample vendors in Mylapore, Chennai. No real payments or deliveries. Everything is saved only in this browser.')}</p>
    <footer class="lfoot"><button class="link" data-a="legal" data-k="about">${t('About')}</button><button class="link" data-a="legal" data-k="privacy">${t('Privacy')}</button><button class="link" data-a="legal" data-k="terms">${t('Terms')}</button></footer>
  </div>
  </div>`;
}

// A marigold-and-jasmine string across the top of the hero, like the ones on carts at festival time.
function garland() {
  const W = 120, swags = [];
  for (let x = 0; x < 1440; x += W) {
    let dots = '';
    for (let i = 1; i < 14; i++) {
      const u = i / 14, y = 4 + 112 * u * (1 - u); // same curve as the string below
      dots += `<circle cx="${(x + u * W).toFixed(1)}" cy="${y.toFixed(1)}" r="3.6" fill="${i % 2 ? '#f4a21c' : '#fff7ea'}"/>`;
    }
    swags.push(`<g class="swag" style="animation-delay:${(x / W) * 0.06}s"><path d="M${x} 4Q${x + W / 2} 60 ${x + W} 4" stroke="#d9d6f5" stroke-width="1" fill="none" opacity=".5"/>${dots}</g>`);
  }
  const knots = Array.from({ length: 13 }, (_, i) => `<circle cx="${i * W}" cy="5" r="7" fill="#f4a21c"/><circle cx="${i * W}" cy="5" r="3" fill="#e4572e"/>`).join('');
  return `<svg class="garland" viewBox="0 0 1440 42" preserveAspectRatio="xMidYMin slice" aria-hidden="true">${swags.join('')}${knots}</svg>`;
}

function setMode(mode, role) {
  MODE = mode;
  if (role) ROLE = role;
  const stage = document.getElementById('stage');
  stage.className = 'stage ' + mode;
  if (mode === 'landing') {
    document.documentElement.lang = 'en';
    stage.innerHTML = landing();
    Object.values(PANES).forEach(p => { p.el = null; });
    renderBar();
    window.scrollTo(0, 0);
    return;
  }
  stage.innerHTML = visiblePanes().map(p => `<section class="pane" data-role="${p.role}" aria-label="${p.role === 'vendor' ? t('Vendor app') : t('Customer app')}">
    ${mode === 'split' ? '<p class="pane-l"></p>' : ''}
    <div class="phone"><div class="scr"></div><nav class="tabs" aria-label="${t('Main')}"></nav><div class="sheet"></div><div class="toast" role="status" aria-live="polite"></div></div></section>`).join('');
  Object.values(PANES).forEach(p => { p.el = stage.querySelector(`.pane[data-role="${p.role}"]`); });
  renderAll();
}

// ---------------- global actions ----------------
Object.assign(ACT, {
  back: p => back(p),
  tab: (p, d) => tab(p, d.v),
  'sheet-close': p => closeSheet(p),
  landing: () => setMode('landing'),
  start: (p, d) => d.v === 'split' ? setMode('split') : setMode('single', d.v),
  'start-register': () => { setMode('single', 'vendor'); ACT['v-register'](PANES.vendor); },
  role: (p, d) => { ROLE = d.v; setMode('single'); },
  split: () => setMode(MODE === 'split' ? 'single' : 'split'),
  lang: () => { S.lang = S.lang === 'ta' ? 'en' : 'ta'; commit(); },
  reset: () => {
    const say = MODE === 'landing' ? (s => s) : t;
    const dlg = document.getElementById('dialog');
    dlg.innerHTML = `<div class="sheet-bg" data-a="dlg-close"></div><div class="dlg" role="alertdialog" aria-modal="true" aria-labelledby="dlg-t">
      <h2 id="dlg-t">${say('Reset the demo?')}</h2><p>${say('Orders, cart and any vendors or items you added go back to the starting sample data.')}</p>
      <div class="row2"><button class="btn ghost" data-a="dlg-close">${say('Cancel')}</button><button class="btn primary" data-a="dlg-reset">${say('Reset')}</button></div></div>`;
    dlg.classList.add('open');
  },
  'dlg-close': () => { const d = document.getElementById('dialog'); d.classList.remove('open'); d.innerHTML = ''; },
  'dlg-reset': () => {
    ACT['dlg-close']();
    Object.values(PANES).forEach(p => { p.stack = [{ v: p.role === 'vendor' ? 'today' : 'home' }]; p.form = {}; p.ui = {}; p.sheet = null; p.seenNote = Date.now(); });
    resetDemo();
    toast(MODE === 'landing' ? null : visiblePanes()[0], MODE === 'landing' ? 'Demo reset to the starting data' : t('Demo reset to the starting data'));
  }
});

// About, Privacy and Terms, from the projectnova build, written to be honest that this is a demo.
const LEGAL = {
  about: { title: 'About LocalKart', body: [
    'LocalKart is a hackathon prototype for the E-commerce and Digital Ecosystem track. It helps street vendors show today’s prices and take orders, and helps neighbours find what is nearby at a fair price.',
    'The vendors, prices, ratings, reviews and invoices in this demo are sample data. Payments and deliveries are simulated.'] },
  privacy: { title: 'Privacy', body: [
    'This demo keeps everything in your browser’s local storage. Nothing is sent to a server, so the name and phone number you type stay on this device.',
    'There are no accounts or logins. Use Reset in the top bar to clear what you have entered.'] },
  terms: { title: 'Terms of demo use', body: [
    'This is a demo for judging and learning. No real orders, payments or deliveries happen, and prices are samples.',
    'Please don’t enter real payment details. The vendor phone numbers, ratings and reviews in this build are made up.'] }
};

Object.assign(ACT, {
  legal: (p, d) => {
    const L = LEGAL[d.k];
    if (!L) return;
    const dlg = document.getElementById('dialog');
    dlg.innerHTML = `<div class="sheet-bg" data-a="dlg-close"></div><div class="dlg legal" role="dialog" aria-modal="true" aria-labelledby="dlg-t">
      <h2 id="dlg-t">${L.title}</h2>${L.body.map(x => `<p>${x}</p>`).join('')}
      <button class="btn primary" data-a="dlg-close">Close</button></div>`;
    dlg.classList.add('open');
  }
});

const paneOf = el => { const s = el.closest('.pane'); return s ? PANES[s.dataset.role] : null; };

document.addEventListener('click', e => {
  const el = e.target.closest('[data-a]');
  if (!el || el.disabled) return;
  const fn = ACT[el.dataset.a];
  if (!fn) return;
  if (el.tagName === 'A') return;
  e.preventDefault();
  fn(paneOf(el), el.dataset, el, e);
});
document.addEventListener('input', e => {
  const el = e.target;
  if (el.dataset && el.dataset.in && INPUT[el.dataset.in]) INPUT[el.dataset.in](paneOf(el), el.value, el);
});
document.addEventListener('change', e => {
  const el = e.target;
  if (el.dataset && el.dataset.ch && CHANGE[el.dataset.ch]) CHANGE[el.dataset.ch](paneOf(el), el);
});
document.addEventListener('submit', e => {
  const f = e.target;
  e.preventDefault();
  if (f.dataset.form && FORM[f.dataset.form]) FORM[f.dataset.form](paneOf(f), f);
});
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (document.getElementById('dialog').classList.contains('open')) return ACT['dlg-close']();
  const p = visiblePanes().find(x => x.sheet);
  if (p) closeSheet(p);
});

let lastWide = window.innerWidth >= 1000;
window.addEventListener('resize', () => {
  const wide = window.innerWidth >= 1000;
  if (wide === lastWide) return;
  lastWide = wide;
  if (!wide && MODE === 'split') setMode('single'); else if (MODE === 'landing') setMode('landing'); else renderBar();
});

// Refresh "5 min ago" labels now and then without touching anything the user is typing.
setInterval(() => { if (MODE !== 'landing' && !document.activeElement.matches('input, textarea')) visiblePanes().forEach(p => renderPane(p)); }, 60000);

// Fonts are linked with media="print" so they don't hold up the first paint; the link's onload switches
// them on. Do it here too, in case a strict page policy blocks inline handlers.
{ const f = document.querySelector('link[href*="fonts.googleapis"][media="print"]'); if (f) f.media = 'all'; }

S = load();
save();
setMode('landing');

// Install as an app and work offline, but only when served over http(s): opened straight from
// the file, browsers refuse both and would log errors. Inside an embedded preview it may also be refused.
if (/^https?:$/.test(location.protocol)) {
  const m = document.createElement('link');
  m.rel = 'manifest'; m.href = 'manifest.webmanifest';
  document.head.appendChild(m);
  try {
    if ('serviceWorker' in navigator && window.top === window) {
      window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
    }
  } catch (e) { /* sandboxed frame: no offline mode */ }
}
