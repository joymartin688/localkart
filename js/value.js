// Best-value pick, deals, search and vendor tips.
// Everything here is computed from S, nothing is hardcoded text about the data.

// How much each thing counts when we pick the best-value vendor.
const WEIGHTS = { price: 0.40, distance: 0.35, rating: 0.15, stock: 0.10 };

function offersFor(type) {
  return S.listings.filter(l => l.type === type).map(l => {
    const v = vendorById(l.vendor);
    return { l, v, km: km(v), ok: canBuy(l) };
  });
}

function scoreOffers(offers, qty) {
  const live = offers.filter(o => o.ok);
  if (!live.length) return [];
  const cheapest = Math.min(...live.map(o => priceOf(o.l)));
  return live.map(o => {
    const parts = {
      price: cheapest / priceOf(o.l),
      distance: 1 / (1 + o.km),
      // the product's own reviews first, then the shop's, else neutral
      rating: o.l.nrating ? Math.max(0, (o.l.rating - 3) / 2) : o.v.nrating ? Math.max(0, (o.v.rating - 3) / 2) : 0.5,
      stock: o.l.stock >= (qty || 1) * 3 ? 1 : 0.5
    };
    const score = Object.keys(WEIGHTS).reduce((a, k) => a + WEIGHTS[k] * parts[k], 0);
    return { ...o, score, parts };
  }).sort((a, b) => b.score - a.score);
}

// Returns { best, reason, ranked } or null when nobody has it right now.
function bestValue(type, qty) {
  const ranked = scoreOffers(offersFor(type), qty);
  if (!ranked.length) return null;
  const best = ranked[0];
  return { best, ranked, reason: reasonFor(best, ranked) };
}

function reasonFor(best, ranked) {
  const unit = unitLabel(best.l.unit);
  const cheap = ranked.reduce((a, b) => (priceOf(b.l) < priceOf(a.l) ? b : a));
  const near = ranked.reduce((a, b) => (b.km < a.km ? b : a));
  const rated = ranked.filter(o => o.l.nrating > 0);
  const topRated = rated.length ? rated.reduce((a, b) => (b.l.rating > a.l.rating ? b : a)) : null;
  if (ranked.length === 1) return tf('Only vendor near you with this in stock right now.');
  if (best === cheap && best === near) return tf('Cheapest and closest to you.');
  if (best === cheap) return tf('Lowest price nearby, {km} km away.', { km: best.km });
  const diff = priceOf(best.l) - priceOf(cheap.l);
  const closer = Math.round((cheap.km - best.km) * 10) / 10;
  let s = closer > 0
    ? tf('₹{d}/{u} more than {shop}, but {k} km closer.', { d: diff, u: unit, shop: shopName(cheap.v), k: closer })
    : tf('Good balance of price, distance and rating.');
  if (cheap.l.stock < 3 && closer <= 0) s = tf('{shop} is cheaper but nearly sold out.', { shop: shopName(cheap.v) });
  if (best === topRated) s += ' ' + tf('Best rated too ({r}★).', { r: best.l.rating.toFixed(1) });
  return s;
}

// "Fair price" deals: for products that 2+ open vendors sell, the cheapest one within 2 km.
function deals() {
  const types = [...new Set(S.listings.map(l => l.type))];
  const out = [];
  types.forEach(t => {
    const live = offersFor(t).filter(o => o.ok);
    if (live.length < 2) return;
    const near = live.filter(o => o.km <= 2);
    if (!near.length) return;
    const best = near.reduce((a, b) => (priceOf(b.l) < priceOf(a.l) ? b : a));
    const max = Math.max(...live.map(o => priceOf(o.l)));
    if (max > priceOf(best.l)) out.push({ ...best, save: max - priceOf(best.l), pct: (max - priceOf(best.l)) / max });
  });
  return out.sort((a, b) => b.pct - a.pct).slice(0, 8);
}

// ---------- search ----------
const norm = s => String(s || '').toLowerCase().normalize('NFC').replace(/[^\p{L}\p{N}\p{M} ]/gu, ' ').replace(/\s+/g, ' ').trim();

function typeInfo(type) {
  if (CATALOG[type]) return CATALOG[type];
  const l = S.listings.find(x => x.type === type);
  return l ? { en: l.name, ta: l.ta || l.name, cat: l.cat, unit: l.unit, alias: '' } : null;
}

function allTypes() { return [...new Set(S.listings.map(l => l.type))]; }

function matchTypes(q) {
  const n = norm(q);
  if (!n) return [];
  return allTypes().map(t => {
    const c = typeInfo(t);
    const hay = [c.en, c.ta, c.alias].map(norm);
    let score = 0;
    hay.forEach((h, i) => {
      if (h === n) score = Math.max(score, 3);
      else if (h.split(' ').some(w => w.startsWith(n))) score = Math.max(score, 2);
      else if (n.length > 2 && h.includes(n)) score = Math.max(score, 1);
    });
    return { t, score };
  }).filter(x => x.score).sort((a, b) => b.score - a.score).map(x => x.t);
}

function matchVendors(q) {
  const n = norm(q);
  if (n.length < 2) return [];
  return S.vendors.filter(v => [v.shop, v.shopTa, v.owner].some(s => norm(s).includes(n)));
}

// ---------- vendor tips ----------
function vendorTips(vid) {
  const mine = S.orders.filter(o => o.vendor === vid && o.status !== 'rejected' && o.status !== 'cancelled');
  const today = mine.filter(o => isToday(o.at));
  const now = new Date();
  const sameTimeYesterday = mine.filter(o => isYesterday(o.at) && new Date(o.at).getHours() * 60 + new Date(o.at).getMinutes() <= now.getHours() * 60 + now.getMinutes());
  const tips = [];

  // 1. what sold most today
  const sold = {};
  today.forEach(o => o.items.forEach(i => { sold[i.lid] = (sold[i.lid] || 0) + i.qty; }));
  const top = Object.entries(sold).sort((a, b) => b[1] - a[1])[0];
  if (top) {
    const l = listingById(top[0]);
    if (l) tips.push({ k: 'top', text: tf('{item} sold the most today — {q} so far.', { item: itemName(l), q: qtyLabel(top[1], l.unit) }) });
  }

  // 2. today vs yesterday by this time
  // Early in the morning yesterday-by-now is often zero, and "21 more than yesterday" reads like a bug,
  // so compare with the whole of yesterday instead.
  const diff = today.length - sameTimeYesterday.length;
  const allYesterday = mine.filter(o => isYesterday(o.at)).length;
  if (today.length && !sameTimeYesterday.length) {
    tips.push({ k: 'trend', text: tf('{n} orders today so far. Yesterday you had {y} in the whole day.', { n: today.length, y: allYesterday }) });
  } else if (today.length) {
    tips.push({ k: 'trend', text: diff > 0 ? tf('{n} orders today, {d} more than yesterday by this time.', { n: today.length, d: diff })
      : diff < 0 ? tf('{n} orders today, {d} fewer than yesterday by this time.', { n: today.length, d: -diff })
      : tf('{n} orders today, same as yesterday by this time.', { n: today.length }) });
  }

  // 3. running low
  const low = listingsOf(vid).filter(l => l.available && l.stock <= UNITS[l.unit].low).sort((a, b) => a.stock - b.stock)[0];
  if (low) tips.push({ k: 'low', lid: low.id, text: low.stock <= 0
    ? tf('{item} is sold out. Customers searching for it are being sent to other vendors.', { item: itemName(low) })
    : tf('{item} is almost out ({q} left). Restock before the evening rush?', { item: itemName(low), q: qtyLabel(low.stock, low.unit) }) });

  // 4. bought together (co-purchase counts, same idea as Round 1 recommendations)
  const pairs = {}, single = {};
  mine.forEach(o => {
    const ids = [...new Set(o.items.map(i => i.lid))];
    ids.forEach(a => { single[a] = (single[a] || 0) + 1; });
    ids.forEach(a => ids.forEach(b => { if (a < b) pairs[a + '|' + b] = (pairs[a + '|' + b] || 0) + 1; }));
  });
  const bestPair = Object.entries(pairs).filter(([, n]) => n >= 3).sort((a, b) => b[1] - a[1])[0];
  if (bestPair) {
    const [a, b] = bestPair[0].split('|');
    const [x, y] = single[a] <= single[b] ? [a, b] : [b, a];
    const lx = listingById(x), ly = listingById(y);
    if (lx && ly) tips.push({ k: 'pair', text: tf('People who buy {a} usually buy {b} too ({n} of {m} orders). Keep them side by side.',
      { a: itemName(lx), b: itemName(ly), n: bestPair[1], m: single[x] }) });
  }

  // 5. evening: fresh stock still on the cart that won't keep till tomorrow
  const v = vendorById(vid);
  if (new Date().getHours() >= 16 && !v.clear) {
    const fresh = listingsOf(vid).filter(l => l.available && PERISHABLE.has(l.type) && l.stock > 0)
      .map(l => ({ l, extra: l.stock - dailyDemand(l) * dayLeft() })).filter(x => x.extra > 0).sort((a, b) => b.extra * b.l.price - a.extra * a.l.price)[0];
    if (fresh) tips.push({ k: 'clear', text: tf('It’s evening and you still have {q} of {item}. A 20% clearance now could sell it before it spoils.',
      { q: qtyLabel(fresh.l.stock, fresh.l.unit), item: itemName(fresh.l) }) });
  }

  // 6. price vs nearby vendors
  let priceTip = null;
  listingsOf(vid).forEach(l => {
    const others = S.listings.filter(o => o.type === l.type && o.vendor !== vid && o.available);
    if (others.length < 2) return;
    const avg = others.reduce((a, o) => a + o.price, 0) / others.length;
    const gap = (l.price - avg) / avg;
    if (!priceTip || Math.abs(gap) > Math.abs(priceTip.gap)) priceTip = { l, avg: Math.round(avg), gap };
  });
  if (priceTip && Math.abs(priceTip.gap) >= 0.05) {
    tips.push({ k: 'price', text: priceTip.gap > 0
      ? tf('Your {item} is ₹{p}; others nearby average ₹{a}. Shoppers comparing may pick them.', { item: itemName(priceTip.l), p: priceTip.l.price, a: priceTip.avg })
      : tf('Your {item} is ₹{p}, below the ₹{a} average nearby. Good one to keep in stock.', { item: itemName(priceTip.l), p: priceTip.l.price, a: priceTip.avg }) });
  }
  return tips.slice(0, 5);
}

function vendorStats(vid) {
  const mine = S.orders.filter(o => o.vendor === vid);
  const today = mine.filter(o => isToday(o.at));
  const done = today.filter(o => o.status === 'completed');
  const open = today.filter(isOpenOrder);
  const yday = mine.filter(o => isYesterday(o.at) && o.status === 'completed');
  const sold = {};
  today.filter(o => o.status !== 'rejected' && o.status !== 'cancelled')
    .forEach(o => o.items.forEach(i => { sold[i.lid] = (sold[i.lid] || 0) + lineTotal(i); }));
  return {
    earned: done.reduce((a, o) => a + orderTotal(o), 0),
    pendingMoney: open.reduce((a, o) => a + orderTotal(o), 0),
    yEarned: yday.reduce((a, o) => a + orderTotal(o), 0),
    count: today.filter(o => o.status !== 'rejected' && o.status !== 'cancelled').length,
    done: done.length,
    open: open.length,
    fresh: mine.filter(o => o.status === 'placed').length,
    walkins: today.filter(o => o.mode === 'walkin').length,
    rescued: today.filter(o => o.status === 'completed').reduce((a, o) => a + o.items.filter(i => i.full).reduce((b, i) => b + lineTotal(i), 0), 0),
    spent: (S.purchases || []).filter(x => x.vendor === vid && isToday(x.at)).reduce((a, x) => a + x.cost, 0),
    top: Object.entries(sold).map(([lid, amt]) => ({ l: listingById(lid), amt })).filter(x => x.l).sort((a, b) => b.amt - a.amt).slice(0, 4)
  };
}
