// All app data lives in one object, S, saved to localStorage.
// Customer and vendor screens read from the same object, so an order placed on
// one side shows up on the other straight away (also across two browser tabs).

const KEY = 'localkart-r2';
let S;

function load() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    if (s && s.v === 7) return catchUp(s);
  } catch (e) { /* private mode or blocked storage: fall back to fresh demo data */ }
  return seed();
}

// Seeded history is relative to the day it was made. Opening the demo on a later
// day moves everything forward so "today" on the vendor dashboard isn't empty.
function catchUp(s) {
  const [y, m, d] = s.seedDay.split('-').map(Number);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const days = Math.round((today - new Date(y, m - 1, d)) / 864e5);
  if (days > 0) {
    const shift = days * 864e5;
    s.orders.forEach(o => { o.at += shift; o.history.forEach(h => { h.t += shift; }); });
    s.notes.forEach(n => { n.t += shift; });
    (s.purchases || []).forEach(x => { x.at += shift; });
    (s.pos || []).forEach(x => { x.at += shift; if (x.done) x.done += shift; });
    s.seedDay = dayKey(Date.now());
  }
  return s;
}

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* storage full or blocked; the demo still works until reload */ }
}

function commit() { save(); renderAll(); }

function resetDemo() {
  const keepLang = S.lang;
  S = seed();
  S.lang = keepLang;
  commit();
}

// ---------- lookups ----------
const vendorById = id => S.vendors.find(v => v.id === id);
const listingById = id => S.listings.find(l => l.id === id);
const orderById = id => S.orders.find(o => o.id === id);
const listingsOf = vid => S.listings.filter(l => l.vendor === vid);
const here = () => PLACES[S.place] || PLACES.home;

function km(v) {
  const p = here();
  // straight-line distance x 1.25 is a rough walking distance on these streets
  const d = Math.hypot(v.x - p.x, v.y - p.y) / 100 * 1.25;
  return Math.max(0.1, Math.round(d * 10) / 10);
}
const walkMin = k => Math.max(2, Math.round(k * 13));

// Ready-in time: the shop's prep time plus the walk to it. A rough estimate, shown as "about".
const readyMin = v => (v.prep || 10) + walkMin(km(v));
// A shop close enough to just walk over.
const nextDoor = v => km(v) <= 0.5;

const inStock = l => l.available && l.stock > 0;

// Evening clearance: a vendor can mark fresh items down so they sell today instead of being thrown away.
const onClear = l => { const v = vendorById(l.vendor); return !!(v && v.clear && PERISHABLE.has(l.type)); };
const priceOf = l => onClear(l) ? Math.max(1, Math.round(l.price * (100 - vendorById(l.vendor).clear) / 100)) : l.price;
const canBuy = l => inStock(l) && vendorById(l.vendor).open;

const isToday = t => dayKey(t) === dayKey(Date.now());
const isYesterday = t => dayKey(t) === dayKey(Date.now() - 864e5);

const lineTotal = i => Math.round(i.qty * i.price);
const subTotal = o => o.items.reduce((a, i) => a + lineTotal(i), 0);
const orderTotal = o => subTotal(o) + (o.fee || 0);

function flowFor(o) {
  if (o.mode === 'walkin') return ['completed'];
  return o.mode === 'delivery'
    ? ['placed', 'accepted', 'preparing', 'out', 'completed']
    : ['placed', 'accepted', 'preparing', 'ready', 'completed'];
}
const isOpenOrder = o => !['completed', 'rejected', 'cancelled'].includes(o.status);
const isMine = o => !!o.cust.me;

// ---------- cart ----------
function cartQty(lid) { const c = S.cart.find(c => c.lid === lid); return c ? c.qty : 0; }

function addToCart(lid, qty) {
  const c = S.cart.find(c => c.lid === lid);
  if (c) c.qty = roundQty(c.qty + qty); else S.cart.push({ lid, qty });
  commit();
}

function setCartQty(lid, qty) {
  if (qty <= 0) S.cart = S.cart.filter(c => c.lid !== lid);
  else { const c = S.cart.find(c => c.lid === lid); if (c) c.qty = roundQty(qty); }
  commit();
}

// Swap an item for the same product at another vendor, keeping the quantity.
function switchCartItem(fromLid, toLid) {
  const c = S.cart.find(c => c.lid === fromLid);
  if (!c) return;
  const qty = c.qty;
  S.cart = S.cart.filter(x => x.lid !== fromLid);
  const existing = S.cart.find(x => x.lid === toLid);
  if (existing) existing.qty = roundQty(existing.qty + qty); else S.cart.push({ lid: toLid, qty });
  commit();
}

const roundQty = q => Math.round(q * 100) / 100;

function cartGroups() {
  const groups = {};
  S.cart.forEach(c => {
    const l = listingById(c.lid);
    if (!l) return;
    (groups[l.vendor] = groups[l.vendor] || []).push({ ...c, l });
  });
  return Object.entries(groups).map(([vid, lines]) => {
    const v = vendorById(vid);
    const mode = S.cartMode[vid] === 'delivery' && v.delivery && km(v) <= v.delivery.km ? 'delivery' : 'pickup';
    const sub = lines.reduce((a, x) => a + Math.round(x.qty * priceOf(x.l)), 0);
    const fee = mode === 'delivery' ? v.delivery.fee : 0;
    return { v, lines, mode, sub, fee, total: sub + fee, blocked: lines.some(x => !canBuy(x.l) || x.l.stock < x.qty) };
  });
}

function placeOrders(cust) {
  const ids = [];
  cartGroups().forEach(g => {
    if (g.blocked) return;
    const id = 'LK' + (S.nextOrder++);
    const items = g.lines.map(x => ({ lid: x.l.id, name: x.l.name, ta: x.l.ta, unit: x.l.unit, qty: x.qty, price: priceOf(x.l), ...(onClear(x.l) ? { full: x.l.price } : {}) }));
    const o = makeOrder(id, g.v.id, { ...cust }, items, g.mode, 'placed', Date.now());
    o.fee = g.fee;
    o.pay = S.pay;
    S.orders.push(o);
    // Hold the stock as soon as the order comes in, give it back if the vendor says no.
    g.lines.forEach(x => { x.l.stock = roundQty(Math.max(0, x.l.stock - x.qty)); });
    S.cart = S.cart.filter(c => !g.lines.some(x => x.lid === c.lid));
    ids.push(id);
  });
  commit();
  return ids;
}

const STATUS_NOTE = {
  accepted: '{shop} accepted your order',
  preparing: '{shop} is packing your order',
  ready: 'Your order is ready at {shop}',
  out: 'Your order from {shop} is on the way',
  completed: 'Order from {shop} completed',
  rejected: "{shop} couldn't take your order"
};

function setStatus(oid, status) {
  const o = orderById(oid);
  if (!o || o.status === status) return;
  o.status = status;
  o.history.push({ s: status, t: Date.now() });
  if (status === 'rejected' || status === 'cancelled') {
    o.items.forEach(i => { const l = listingById(i.lid); if (l) l.stock = roundQty(l.stock + i.qty); });
  }
  if (isMine(o) && STATUS_NOTE[status]) {
    S.notes.unshift({ oid, s: status, t: Date.now(), read: false });
    S.notes = S.notes.slice(0, 30);
  }
  commit();
}

function rateOrder(oid, stars) {
  const o = orderById(oid);
  if (!o || o.rated) return;
  const v = vendorById(o.vendor);
  v.rating = Math.round(((v.rating * v.nrating + stars) / (v.nrating + 1)) * 10) / 10;
  v.nrating += 1;
  o.rated = stars;
  commit();
}

function updateListing(lid, patch) {
  const l = listingById(lid);
  if (!l) return;
  Object.assign(l, patch);
  if (l.price < 1) l.price = 1;
  if (l.stock < 0) l.stock = 0;
  l.stock = roundQty(l.stock);
  commit();
}

// Reviews. A shopper gets one review per product and per shop: posting again replaces the first.
function postReview(list, stars, text, name) {
  const mine = list.find(r => r.me);
  if (mine) list.splice(list.indexOf(mine), 1);
  list.unshift({ name, stars, text, me: true, t: Date.now() });
  return list.slice(0, 20);
}

// A product's rating comes from its star counts, so the average and the bars always agree.
function addListingReview(lid, stars, text, name) {
  const l = listingById(lid);
  if (!l) return;
  const mine = l.reviews.find(r => r.me);
  if (mine) l.dist[mine.stars - 1] -= 1;
  l.dist[stars - 1] += 1;
  l.nrating = l.dist.reduce((a, b) => a + b, 0);
  l.rating = Math.round((l.dist.reduce((a, c, i) => a + c * (i + 1), 0) / l.nrating) * 10) / 10;
  l.reviews = postReview(l.reviews, stars, text, name);
  commit();
}

function addVendorReview(vid, stars, text, name) {
  const v = vendorById(vid);
  if (!v) return;
  const mine = v.reviews.find(r => r.me);
  if (mine) {
    v.rating = Math.round(((v.rating * v.nrating - mine.stars + stars) / v.nrating) * 10) / 10;
  } else {
    v.rating = Math.round(((v.rating * v.nrating + stars) / (v.nrating + 1)) * 10) / 10;
    v.nrating += 1;
  }
  v.reviews = postReview(v.reviews, stars, text, name);
  commit();
}

function addListing(vid, data) {
  const l = Object.assign({ id: 'l' + (S.nextListing++), vendor: vid, available: true, fresh: '', photo: null,
    rating: 0, nrating: 0, dist: [0, 0, 0, 0, 0], reviews: [] }, data);
  S.listings.push(l);
  commit();
  return l;
}

function deleteListing(lid) {
  S.listings = S.listings.filter(l => l.id !== lid);
  S.cart = S.cart.filter(c => c.lid !== lid);
  commit();
}

window.addEventListener('storage', e => {
  if (e.key === KEY) { S = load(); renderAll(); }
});
