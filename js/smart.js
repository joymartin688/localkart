// Typed lists, trip planning and "picked for you".

// ---------- reading a typed list ----------
// Works for a vendor's walk-in bill ("2 kg thakkali, 1 kattu malli") and a shopper's list
// ("tomato 1 kg, vengayam, jasmine 2 muzham"). Tamil and Tanglish number words are understood.
const NUMWORDS = { half: 0.5, arai: 0.5, 'அரை': 0.5, quarter: 0.25, kaal: 0.25, 'கால்': 0.25, mukkal: 0.75, 'முக்கால்': 0.75,
  a: 1, an: 1, one: 1, oru: 1, onnu: 1, 'ஒரு': 1, 'ஒன்று': 1, two: 2, rendu: 2, 'இரண்டு': 2, 'ரெண்டு': 2, three: 3, moonu: 3, 'மூன்று': 3,
  four: 4, naalu: 4, 'நான்கு': 4, five: 5, anju: 5, 'ஐந்து': 5, six: 6, aaru: 6, ten: 10, pathu: 10, 'பத்து': 10 };
const UNITWORDS = { kg: 'kg', kgs: 'kg', kilo: 'kg', kilos: 'kg', 'கிலோ': 'kg', g: 'g', gm: 'g', gms: 'g', gram: 'g', grams: 'g', 'கிராம்': 'g',
  bunch: 'bunch', bunches: 'bunch', kattu: 'bunch', 'கட்டு': 'bunch', pc: 'piece', pcs: 'piece', piece: 'piece', pieces: 'piece', no: 'piece', nos: 'piece',
  muzham: 'muzham', mozham: 'muzham', 'முழம்': 'muzham', dozen: 'dozen', 'டஜன்': 'dozen', packet: 'packet', packets: 'packet', pkt: 'packet',
  litre: 'litre', liter: 'litre', l: 'litre', cup: 'cup', cups: 'cup' };

function parseList(text) {
  return String(text || '').split(/[,;\n+&]|\band\b|\bum\b|மற்றும்/i).map(s => s.trim()).filter(Boolean).map(raw => {
    const toks = raw.toLowerCase().replace(/(\d)\s*(kg|kgs|g|gm|gms|l)\b/g, '$1 $2').split(/\s+/);
    let qty = null, unit = null;
    const words = [];
    toks.forEach(tk => {
      if (/^\d+(\.\d+)?$/.test(tk)) qty = (qty || 0) + Number(tk);
      else if (/^\d+\/\d+$/.test(tk)) { const [a, b] = tk.split('/').map(Number); qty = (qty || 0) + a / b; }
      else if (tk in NUMWORDS && !(tk === 'a' && qty != null)) qty = (qty || 0) + NUMWORDS[tk];
      else if (UNITWORDS[tk]) unit = UNITWORDS[tk];
      else words.push(tk);
    });
    return { raw, name: words.join(' '), qty, unit };
  });
}

// Convert "250 g" or "1 kg" into the listing's own unit (¼ kg, 10 x 100 g, ...).
function toUnitQty(qty, said, unit) {
  let q = qty == null ? 1 : qty;
  if (unit === 'kg' && said === 'g') q = q / 1000;
  if (unit === 'g100') q = said === 'kg' ? q * 10 : said === 'g' ? q / 100 : q;
  if (unit === 'litre' && said === 'g') q = q / 1000;
  const step = UNITS[unit] ? UNITS[unit].step : 1;
  return Math.max(step, Math.round(q / step) * step);
}

function nameScore(n, info) {
  if (!n) return 0;
  let best = 0;
  [info.en, info.ta, info.alias].map(norm).forEach(h => {
    if (!h) return;
    if (h === n) best = Math.max(best, 3);
    else if (h.split(' ').some(w => w === n || (n.length > 2 && w.startsWith(n)))) best = Math.max(best, 2);
    else if (n.length > 3 && (h.includes(n) || n.split(' ').some(w => w.length > 3 && h.split(' ').includes(w)))) best = Math.max(best, 1);
  });
  return best;
}

// Vendor walk-in bill: match each part to one of this vendor's items.
function readBill(vid, text) {
  const mine = listingsOf(vid);
  const lines = [], unknown = [];
  parseList(text).forEach(part => {
    const n = norm(part.name);
    const hit = mine.map(l => ({ l, s: nameScore(n, typeInfo(l.type) || { en: l.name, ta: l.ta }) })).filter(x => x.s)
      .map(x => ({ ...x, s: x.s + (part.unit && part.unit === x.l.unit ? 0.5 : 0) })).sort((a, b) => b.s - a.s)[0];
    if (!hit) return unknown.push(part.raw);
    const qty = toUnitQty(part.qty, part.unit, hit.l.unit);
    const same = lines.find(x => x.l.id === hit.l.id);
    if (same) same.qty = roundQty(same.qty + qty); else lines.push({ l: hit.l, qty });
  });
  return { lines, unknown, total: lines.reduce((a, x) => a + Math.round(x.qty * priceOf(x.l)), 0) };
}

function recordWalkIn(vid, bill) {
  const items = bill.lines.map(x => ({ lid: x.l.id, name: x.l.name, ta: x.l.ta, unit: x.l.unit, qty: x.qty, price: priceOf(x.l), ...(onClear(x.l) ? { full: x.l.price } : {}) }));
  const o = makeOrder('LK' + (S.nextOrder++), vid, { name: 'Walk-in' }, items, 'walkin', 'completed', Date.now());
  o.pay = 'cash';
  S.orders.push(o);
  bill.lines.forEach(x => { x.l.stock = roundQty(Math.max(0, x.l.stock - x.qty)); });
  commit();
  return o;
}

// Shopper's list: match each part to a product type anywhere nearby.
function readShoppingList(text) {
  const items = [], unknown = [];
  parseList(text).forEach(part => {
    const n = norm(part.name);
    const t = allTypes().map(tp => ({ tp, s: nameScore(n, typeInfo(tp)) })).filter(x => x.s)
      .map(x => ({ ...x, s: x.s + (part.unit && part.unit === typeInfo(x.tp).unit ? 0.5 : 0) })).sort((a, b) => b.s - a.s)[0];
    if (!t) return unknown.push(part.raw);
    const unit = typeInfo(t.tp).unit;
    const qty = toUnitQty(part.qty, part.unit, unit);
    const same = items.find(x => x.type === t.tp);
    if (same) same.qty = roundQty(same.qty + qty); else items.push({ type: t.tp, qty });
  });
  return { items, unknown };
}

// ---------- trip planner ----------
// Two ways to buy a list: from as few carts as possible, or each thing at its lowest price.
const PLAN_RADIUS = 3;

function sellersFor(item) {
  return S.listings.filter(l => l.type === item.type && canBuy(l) && l.stock >= item.qty)
    .map(l => ({ l, v: vendorById(l.vendor), km: km(vendorById(l.vendor)) })).filter(o => o.km <= PLAN_RADIUS);
}

function walkRoute(vendors) {
  // nearest-neighbour walk from where you are, through every stop, and back
  let at = here(), left = vendors.slice(), dist = 0;
  while (left.length) {
    left.sort((a, b) => Math.hypot(a.x - at.x, a.y - at.y) - Math.hypot(b.x - at.x, b.y - at.y));
    const nx = left.shift();
    dist += Math.hypot(nx.x - at.x, nx.y - at.y);
    at = nx;
  }
  dist += Math.hypot(here().x - at.x, here().y - at.y);
  return Math.round(dist / 100 * 1.25 * 10) / 10;
}

function summarisePlan(picks) {
  const stops = {};
  picks.forEach(p => { (stops[p.v.id] = stops[p.v.id] || { v: p.v, lines: [] }).lines.push(p); });
  const list = Object.values(stops).sort((a, b) => km(a.v) - km(b.v));
  return { stops: list, total: picks.reduce((a, p) => a + Math.round(p.qty * priceOf(p.l)), 0), walk: walkRoute(list.map(s => s.v)) };
}

function planTrip(items) {
  const able = items.filter(it => sellersFor(it).length);
  const missing = items.filter(it => !sellersFor(it).length);
  // lowest price: each item from its cheapest seller (nearer one on a tie)
  const cheap = able.map(it => {
    const o = sellersFor(it).sort((a, b) => priceOf(a.l) - priceOf(b.l) || a.km - b.km)[0];
    return { ...o, qty: it.qty, type: it.type };
  });
  // fewest stops: keep picking the cart that covers the most of what's left
  const fewest = [];
  let todo = able.slice();
  while (todo.length) {
    const cover = {};
    todo.forEach(it => sellersFor(it).forEach(o => { (cover[o.v.id] = cover[o.v.id] || []).push({ ...o, qty: it.qty, type: it.type }); }));
    const best = Object.values(cover).sort((a, b) => b.length - a.length
      || a.reduce((s, x) => s + x.qty * priceOf(x.l), 0) - b.reduce((s, x) => s + x.qty * priceOf(x.l), 0)
      || a[0].km - b[0].km)[0];
    fewest.push(...best);
    todo = todo.filter(it => !best.some(x => x.type === it.type));
  }
  return { cheap: summarisePlan(cheap), fewest: summarisePlan(fewest), missing };
}

// ---------- bought together ----------
function typePairs() {
  const pairs = {};
  S.orders.forEach(o => {
    if (o.status === 'rejected' || o.status === 'cancelled') return;
    const ts = [...new Set(o.items.map(i => (listingById(i.lid) || {}).type).filter(Boolean))];
    ts.forEach(a => ts.forEach(b => { if (a !== b) { pairs[a] = pairs[a] || {}; pairs[a][b] = (pairs[a][b] || 0) + 1; } }));
  });
  return pairs;
}

function boughtWith(type, n = 3) {
  const p = typePairs()[type] || {};
  return Object.entries(p).sort((a, b) => b[1] - a[1]).slice(0, n).map(x => x[0]);
}

// Add-ons for one vendor's part of the cart: things from the same cart people often buy with these.
function addOnsFor(vid, cartTypes) {
  const pairs = typePairs();
  return listingsOf(vid).filter(l => canBuy(l) && !cartTypes.includes(l.type))
    .map(l => ({ l, s: cartTypes.reduce((a, t) => a + ((pairs[t] || {})[l.type] || 0), 0),
      why: cartTypes.slice().sort((a, b) => ((pairs[b] || {})[l.type] || 0) - ((pairs[a] || {})[l.type] || 0))[0] }))
    .filter(x => x.s >= 2).sort((a, b) => b.s - a.s).slice(0, 2);
}

// ---------- picked for you ----------
const MORNING = new Set(['milk', 'curd', 'bread', 'keerai', 'coriander', 'curry', 'jasmine', 'banana', 'murungai']);
const EVENING = new Set(['jasmine', 'sundal', 'bajji', 'peanuts', 'ilaneer', 'garland', 'kanakambaram']);

function picksForMe() {
  const mine = S.orders.filter(isMine);
  const myTypes = [...new Set(mine.flatMap(o => o.items.map(i => (listingById(i.lid) || {}).type)).filter(Boolean))];
  const lastTypes = mine.length ? mine.slice().sort((a, b) => b.at - a.at)[0].items.map(i => (listingById(i.lid) || {}).type) : [];
  const pairs = typePairs();
  const pop = {};
  S.orders.filter(o => isToday(o.at)).forEach(o => o.items.forEach(i => { const l = listingById(i.lid); if (l) pop[l.type] = (pop[l.type] || 0) + 1; }));
  const h = new Date().getHours();
  const timeSet = h < 11 ? MORNING : h >= 16 ? EVENING : null;
  return allTypes().filter(tp => !lastTypes.includes(tp)).map(tp => {
    const because = myTypes.map(m => ({ m, n: (pairs[m] || {})[tp] || 0 })).sort((a, b) => b.n - a.n)[0] || { n: 0 };
    const co = because.n, pp = pop[tp] || 0, tm = timeSet && timeSet.has(tp) ? 1 : 0;
    const score = 3 * co + 0.5 * pp + 4 * tm;
    const reason = 3 * co >= 4 * tm && co > 0 ? tf('Because you buy {item}', { item: typeName(because.m) })
      : tm ? (h < 11 ? t('Good for the morning') : t('Popular this evening')) : t('Popular nearby today');
    const bv = bestValue(tp, 1);
    return bv && { l: bv.best.l, score, reason };
  }).filter(Boolean).sort((a, b) => b.score - a.score).slice(0, 6);
}
