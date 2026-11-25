// Supply chain for a street vendor: what to buy at the wholesale market tomorrow
// morning, from which trader, and how much cash to carry.
//
// For each item the vendor sells:
//   daily demand  d     = units sold in the last 7 days ÷ 7   (online orders + walk-in bills; × 1.5 for festival items)
//   left at close       = stock − d × share of today's selling hours still to go
//   target              = d × days of cover × 1.2   (1 day for fresh items, 3 for hardy veg, 7 for packets)
//   need                = target − left at close   (only half of fresh leftovers count: they won't be as good tomorrow)
// Each trader sells in lots, so qty = need rounded up to the lot. For fresh items, anything more than
// half a day's sales beyond the target will probably be thrown away, so we count that as a cost too:
//   effective cost = qty × price + likely waste × price
// The trader with the lowest effective cost wins. Big-lot traders are cheaper per kg but don't always win.

const roundHalf = x => Math.round(x * 2) / 2;
const roundStep = (x, unit) => { const s = UNITS[unit] ? UNITS[unit].step : 1; return Math.max(s, Math.round(x / s) * s); };
const LONG_LIFE = new Set(['agarbathi', 'camphor', 'jaggery', 'tamarind', 'murukku', 'peanuts']);
const coverDays = type => PERISHABLE.has(type) ? 1 : LONG_LIFE.has(type) ? 7 : 3;

function quotesFor(type, unit) {
  if (!REF[type] || MADE_AT_STALL.has(type)) return [];
  return TRADERS.filter(tr => tr.types.includes(type)).map(tr => {
    const lots = LOTS[unit] || [10, 10];
    const lot = tr.lots === 'big' ? (unit === 'kg' && BIG_BAG[type] ? BIG_BAG[type] : lots[1]) : lots[0];
    return { tr, lot, price: roundHalf(REF[type] * tr.factor) };
  });
}

// Cheapest place to buy one unit, for the vendor's "your margin" hint.
function marketPrice(type, unit) {
  const q = quotesFor(type, unit);
  return q.length ? Math.min(...q.map(x => x.price)) : null;
}

// Share of today's selling hours (6 am to 9 pm) that are still ahead.
function dayLeft() {
  const n = new Date(), h = n.getHours() + n.getMinutes() / 60;
  return Math.min(1, Math.max(0, (21 - h) / 15));
}

function dailyDemand(l) {
  const since = Date.now() - 7 * 864e5;
  let q = 0;
  S.orders.forEach(o => {
    if (o.vendor !== l.vendor || o.at < since || o.status === 'rejected' || o.status === 'cancelled') return;
    o.items.forEach(i => { if (i.lid === l.id) q += i.qty; });
  });
  return q / 7;
}

// Purchase orders to traders. An order that has been sent but not yet received is stock on its way,
// so it counts towards tomorrow and the same items aren't put on the list twice.
const openPOs = vid => (S.pos || []).filter(po => po.vendor === vid && po.status === 'sent');
function incoming(l) {
  return openPOs(l.vendor).reduce((a, po) => a + po.items.filter(i => i.lid === l.id).reduce((b, i) => b + i.qty, 0), 0);
}
// A vendor's regular traders often give credit and keep good stock aside, so they get a small preference.
const myTraders = vid => (vendorById(vid) || {}).traders || [];
const LOYAL = 0.05;

function buyingList(vid) {
  const lines = [], skipped = [];
  const mine = myTraders(vid);
  listingsOf(vid).forEach(l => {
    if (!l.available) return;
    let d = dailyDemand(l);
    if (S.festival && FESTIVE.has(l.type)) d *= 1.5;
    const quotes = quotesFor(l.type, l.unit);
    // what's ordered arrives fresh tomorrow, so it counts in full; today's leftover fresh stock counts half
    const coming = incoming(l);
    const left = Math.max(0, l.stock - d * dayLeft());
    const target = d * coverDays(l.type) * 1.2;
    const need = target - (PERISHABLE.has(l.type) ? left * 0.5 : left) - coming;
    if (!quotes.length) return skipped.push({ l, why: MADE_AT_STALL.has(l.type) ? 'home' : 'nosource' });
    if (d === 0) return skipped.push({ l, why: 'nosales' });
    if (need <= 0.01) return skipped.push({ l, why: coming ? 'ordered' : 'enough', left, d, coming });
    const opts = quotes.map(q => {
      const qty = Math.ceil(need / q.lot - 1e-9) * q.lot;
      const waste = PERISHABLE.has(l.type) ? Math.max(0, qty - target - d * 0.5) : 0;
      const cost = qty * q.price;
      return { ...q, qty, cost, waste, eff: cost + waste * q.price };
    }).sort((a, b) => a.eff - b.eff);
    const loyal = opts.find(o => mine.includes(o.tr.id) && o.eff <= opts[0].eff * (1 + LOYAL));
    const pick = loyal || opts[0];
    const why = pick !== opts[0]
      ? tf('Your regular trader. Only {m} more than {tr}.', { m: money(pick.eff - opts[0].eff), tr: esc(opts[0].tr.name) })
      : buyReason(l, pick, opts);
    lines.push({ l, d, left, need, target, pick, opts, why, profit: pick.qty * (l.price - pick.price) });
  });
  const byTr = {};
  lines.forEach(x => { (byTr[x.pick.tr.id] = byTr[x.pick.tr.id] || []).push(x); });
  const groups = Object.entries(byTr).map(([id, ls]) => ({ tr: TRADERS.find(t => t.id === id), lines: ls, cost: ls.reduce((a, x) => a + x.pick.cost, 0) }))
    .sort((a, b) => b.cost - a.cost);
  const cash = lines.reduce((a, x) => a + x.pick.cost, 0);
  // What going only by the lowest price per kg would cost: the habit this list is meant to beat.
  const naive = lines.reduce((a, x) => a + x.opts.slice().sort((p, q) => p.price - q.price || p.lot - q.lot)[0].cost, 0);
  return { groups, lines, skipped, cash, saved: naive - cash, profit: lines.reduce((a, x) => a + x.profit, 0) };
}

function buyReason(l, pick, opts) {
  if (opts.length < 2) return '';
  const other = opts[1];
  const u = unitShort(l.unit);
  if (other.price < pick.price && other.waste > 0) {
    return tf('{tr} is ₹{d}/{u} cheaper but sells {lot} at a time — about {w} would likely be thrown away.',
      { tr: esc(other.tr.name), d: fmtRs(pick.price - other.price), u, lot: qtyLabel(other.lot, l.unit), w: qtyLabel(roundStep(other.waste, l.unit), l.unit) });
  }
  if (pick.lot > other.lot) return tf('Bigger lot, but cheaper overall: {a} instead of {b}.', { a: money(pick.cost), b: money(other.cost) });
  if (pick.price < other.price) return tf('Lowest price per {u}, and the lot size fits what you sell.', { u });
  return tf('Smaller lot means less left over: {a} instead of {b}.', { a: money(pick.cost), b: money(other.cost) });
}
const fmtRs = n => (Math.round(n * 2) / 2).toLocaleString('en-IN');

function markBought(vid, trId) {
  const plan = buyingList(vid);
  const g = plan.groups.find(x => x.tr.id === trId);
  if (!g) return 0;
  g.lines.forEach(x => { x.l.stock = roundQty(x.l.stock + x.pick.qty); });
  S.purchases.push({ vendor: vid, trader: trId, at: Date.now(), cost: g.cost,
    items: g.lines.map(x => ({ lid: x.l.id, name: x.l.name, ta: x.l.ta, unit: x.l.unit, qty: x.pick.qty, price: x.pick.price })) });
  commit();
  return g.cost;
}

// Send the trader's part of the list as one order, to collect at the market.
function sendPO(vid, trId) {
  const g = buyingList(vid).groups.find(x => x.tr.id === trId);
  if (!g) return null;
  S.pos = S.pos || [];
  const po = { id: 'PO-' + (S.nextPo = (S.nextPo || 100) + 1), vendor: vid, trader: trId, at: Date.now(), status: 'sent', cost: g.cost,
    items: g.lines.map(x => ({ lid: x.l.id, name: x.l.name, ta: x.l.ta, unit: x.l.unit, qty: x.pick.qty, price: x.pick.price })) };
  S.pos.unshift(po);
  commit();
  return po;
}

// Goods collected: the ordered amounts go into stock and the spend is recorded like any purchase.
function receivePO(id) {
  const po = (S.pos || []).find(x => x.id === id);
  if (!po || po.status !== 'sent') return null;
  po.items.forEach(i => { const l = listingById(i.lid); if (l) l.stock = roundQty(l.stock + i.qty); });
  po.status = 'received'; po.done = Date.now();
  S.purchases.push({ vendor: po.vendor, trader: po.trader, at: Date.now(), cost: po.cost, po: po.id, items: po.items });
  commit();
  return po;
}

function cancelPO(id) {
  const po = (S.pos || []).find(x => x.id === id);
  if (!po || po.status !== 'sent') return;
  po.status = 'cancelled'; po.done = Date.now();
  commit();
}

function toggleTrader(vid, trId) {
  const v = vendorById(vid);
  v.traders = v.traders || [];
  v.traders = v.traders.includes(trId) ? v.traders.filter(x => x !== trId) : [...v.traders, trId];
  commit();
  return v.traders.includes(trId);
}

function poText(po) {
  const v = vendorById(po.vendor), tr = TRADERS.find(x => x.id === po.trader);
  return [`Order ${po.id} from ${v.shop} (${v.phone})`, `To ${tr.name}, ${tr.area}`, '',
    ...po.items.map(i => `- ${i.name}: ${qtyLabel(i.qty, i.unit)} @ ₹${fmtRs(i.price)} = ${money(i.qty * i.price)}`),
    '', `Total ${money(po.cost)}`, `I will collect it during your hours (${tr.hours}) and pay cash.`, '(Sent from LocalKart, demo)'].join('\n');
}

function listText(vid) {
  const v = vendorById(vid), plan = buyingList(vid);
  const out = [`${v.shop}: market list`, ''];
  plan.groups.forEach(g => {
    out.push(`${g.tr.name} (${g.tr.area})`);
    g.lines.forEach(x => out.push(`- ${x.l.name}: ${qtyLabel(x.pick.qty, x.l.unit)} @ ₹${fmtRs(x.pick.price)} = ${money(x.pick.cost)}`));
    out.push(`  Total ${money(g.cost)}`, '');
  });
  out.push(`Cash to carry: ${money(plan.cash)}`);
  return out.join('\n');
}
