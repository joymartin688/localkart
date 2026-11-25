// Customer side: find it nearby, compare vendors, order, track.

const C = {};

C.tabs = () => [
  ['home', 'home', t('Home')],
  ['search', 'search', t('Search')],
  ['nearby', 'map', t('Nearby')],
  ['orders', 'receipt', t('Orders'), S.orders.filter(o => isMine(o) && isOpenOrder(o)).length],
  ['cart', 'bag', t('Cart'), S.cart.length]
];

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? t('Good morning') : h < 17 ? t('Good afternoon') : t('Good evening');
}
const firstName = () => esc(S.me.name.split(' ')[0]);
const chip = (a, on, label, v = '') => `<button class="chip ${on ? 'on' : ''}" data-a="${a}" data-v="${v}" aria-pressed="${!!on}">${label}</button>`;
const typeName = tp => { const c = typeInfo(tp); return esc(ta() ? c.ta : c.en); };
const typeOther = tp => { const c = typeInfo(tp); return esc(ta() ? c.en : c.ta); };

function popularTypes() {
  const n = {};
  S.orders.filter(o => isToday(o.at)).forEach(o => o.items.forEach(i => {
    const l = listingById(i.lid); if (l) n[l.type] = (n[l.type] || 0) + 1;
  }));
  return Object.entries(n).sort((a, b) => b[1] - a[1]).map(x => x[0]);
}

function vendorCard(v, wide) {
  const items = listingsOf(v.id).filter(inStock).slice(0, 3).map(itemName).join(', ');
  return `<button class="vcard ${wide ? 'wide' : ''} ${v.open ? '' : 'dim'}" data-a="c-vendor" data-id="${v.id}">
    ${stall(v, 52)}
    <span class="vcard-b"><b>${shopName(v)}</b>
      <span class="meta">${km(v)} km · ${rate(v)} ${openPill(v)}</span>
      <span class="sells">${items || catLabel(v.cat)}</span></span>
  </button>`;
}

const clearBadge = l => onClear(l) ? `<span class="badge clear">${tf('−{p}% evening', { p: vendorById(l.vendor).clear })}</span>` : '';
const clearNote = l => tf('−{p}% evening · was ₹{w}', { p: vendorById(l.vendor).clear, w: l.price });

function itemCard(l, note) {
  const v = vendorById(l.vendor);
  if (!note && onClear(l)) note = clearNote(l);
  return `<button class="icard ${canBuy(l) ? '' : 'dim'}" data-a="c-product" data-type="${esc(l.type)}" data-id="${l.id}">
    ${itemPic(l)}
    <span class="icard-n">${itemName(l)}</span>
    <span class="icard-v">${shopName(v)} · ${km(v)} km</span>
    <span class="icard-f">${slate(priceOf(l), l.unit)}</span>
    ${note ? `<span class="icard-note">${note}</span>` : ''}
  </button>`;
}

// card with its own add button (can't nest a button inside a button)
function addCard(l, qty, sub) {
  const ok = canBuy(l) && l.stock >= qty;
  return `<div class="icard ${ok ? '' : 'dim'}">
    <button class="icard-tap" data-a="c-product" data-type="${esc(l.type)}" data-id="${l.id}">
      ${itemPic(l)}<span class="icard-n">${itemName(l)}</span><span class="icard-v">${sub}</span>
    </button>
    <div class="icard-f">${slate(priceOf(l), l.unit)}
      ${ok ? `<button class="mini-add" data-a="c-add-q" data-id="${l.id}" data-q="${qty}" aria-label="${t('Add')} ${qtyLabel(qty, l.unit)}">${icon('plus')}<span>${qtyLabel(qty, l.unit)}</span></button>`
           : `<span class="badge out">${t('Out today')}</span>`}
    </div>
  </div>`;
}

function activeStrip(o) {
  const v = vendorById(o.vendor), flow = flowFor(o), at = flow.indexOf(o.status);
  return `<button class="strip" data-a="c-order" data-id="${o.id}">
    <span class="strip-t">${tf('Order from {shop}', { shop: shopName(v) })}<b>${statusLabel(o.status, o.mode)}</b></span>
    <span class="pbar"><i style="width:${((at + 1) / flow.length) * 100}%"></i></span>
  </button>`;
}

// ---------------- Daily basket ----------------
// The things you buy every day. One tap puts them in the cart, each from the best-value shop nearby
// that has enough stock.
const basketDefault = tp => (tp === 'eggs' ? 6 : 1);
const basketStep = tp => ((typeInfo(tp) && UNITS[typeInfo(tp).unit]) || { step: 1 }).step;

function basketLine(b) {
  const bv = bestValue(b.type, b.qty);
  const pick = bv ? bv.ranked.find(x => x.l.stock >= b.qty) || null : null;
  // someone sells it, but not this much today
  return { ...b, unit: (typeInfo(b.type) || { unit: 'piece' }).unit, pick, short: !!bv && !pick };
}

function basketHtml() {
  const lines = S.basket.map(basketLine);
  const addable = allTypes().filter(tp => (typeInfo(tp) || {}).cat === 'daily' && !S.basket.some(b => b.type === tp));
  const total = lines.reduce((a, x) => a + (x.pick ? Math.round(priceOf(x.pick.l) * x.qty) : 0), 0);
  const shops = new Set(lines.filter(x => x.pick).map(x => x.pick.v.id)).size;
  const live = lines.filter(x => x.pick).length;
  return `<section class="sec basket" aria-labelledby="bk-h">
    <div class="sec-h pad"><h2 id="bk-h">${t('My daily basket')}</h2>
      ${lines.length ? `<span class="bk-total">${tf('About {p} from {s}', { p: money(total), s: plural(shops, 'shop', 'shops') })}</span>` : ''}</div>
    <p class="pad note">${t('The things you buy every day. We pick the best-value shop nearby for each.')}</p>
    ${lines.length ? `<ul class="bk-list pad">${lines.map(x => `<li class="bk-line ${x.pick ? '' : 'dim'}">
        <span class="pic sm">${art(x.type)}</span>
        <span class="bk-n"><b>${typeName(x.type)}</b>
          ${x.pick ? `<small>${shopName(x.pick.v)}</small><small class="bk-meta">${money(Math.round(priceOf(x.pick.l) * x.qty))} · ${tf('{n} min', { n: readyMin(x.pick.v) })}</small>`
            : `<small>${x.short ? t('Not enough in stock for this amount') : t('Nobody has it right now')}</small>`}</span>
        <span class="bk-q">
          ${x.qty <= basketStep(x.type)
            ? `<button class="bk-step bin" data-a="c-basket-del" data-type="${esc(x.type)}" aria-label="${tf('Remove {item}', { item: typeName(x.type) })}">${icon('trash')}</button>`
            : `<button class="bk-step" data-a="c-basket-q" data-type="${esc(x.type)}" data-v="-1" aria-label="${tf('Less {item}', { item: typeName(x.type) })}">${icon('minus')}</button>`}
          <output aria-live="polite">${qtyLabel(x.qty, x.unit)}</output>
          <button class="bk-step" data-a="c-basket-q" data-type="${esc(x.type)}" data-v="1" aria-label="${tf('More {item}', { item: typeName(x.type) })}">${icon('plus')}</button>
        </span>
      </li>`).join('')}</ul>
      <div class="pad bk-go"><button class="btn primary big" data-a="c-basket-cart" ${live ? '' : 'disabled'}>${icon('bag')}${t('Add all to cart')}</button></div>`
      : `<p class="pad note">${t('Your basket is empty. Tap an item below to start it.')}</p>`}
    ${addable.length ? `<div class="chips scroll pad bk-add">${addable.slice(0, 12).map(tp =>
      `<button class="chip" data-a="c-basket-add" data-type="${esc(tp)}">${icon('plus')}${typeName(tp)}</button>`).join('')}</div>` : ''}
  </section>`;
}

// ---------------- Home ----------------
C.home = p => {
  const unread = S.notes.filter(n => !n.read).length;
  const near = S.vendors.slice().sort((a, b) => (b.open - a.open) || km(a) - km(b));
  const past = S.orders.filter(o => isMine(o) && o.status === 'completed').sort((a, b) => b.at - a.at);
  const again = [], seen = new Set();
  past.forEach(o => o.items.forEach(i => {
    const l = listingById(i.lid);
    if (l && !seen.has(l.id)) { seen.add(l.id); again.push({ l, qty: i.qty }); }
  }));
  const fresh = S.listings.filter(l => l.fresh && canBuy(l)).slice(0, 8);
  const active = S.orders.filter(o => isMine(o) && isOpenOrder(o)).sort((a, b) => b.at - a.at)[0];
  const dl = deals();
  const picks = picksForMe();
  const cleared = S.listings.filter(l => onClear(l) && canBuy(l)).sort((x, y) => km(vendorById(x.vendor)) - km(vendorById(y.vendor))).slice(0, 8);
  // Everyday items from shops close enough to be ready within about 15 minutes, soonest first.
  const quick = S.listings.filter(l => l.cat === 'daily' && canBuy(l) && readyMin(vendorById(l.vendor)) <= 15)
    .sort((x, y) => readyMin(vendorById(x.vendor)) - readyMin(vendorById(y.vendor)) || priceOf(x) - priceOf(y)).slice(0, 8);
  return `
  <header class="home-head">
    <div><h1 class="hello">${greeting()}, ${firstName()}</h1>
      <button class="place" data-a="c-place">${icon('pin')}<span>${esc(placeLabel(S.place))}</span>${icon('down')}</button></div>
    <button class="icon-btn bell" data-a="c-notes" aria-label="${t('Updates')}">${icon('bell')}${unread ? `<i class="dotn">${unread}</i>` : ''}</button>
  </header>
  <div class="pad">
    <div class="searchbar">
      <button class="fake-input" data-a="c-open-search">${icon('search')}<span>${t('Search tomato, malli, ilaneer…')}</span></button>
      <button class="icon-btn mic" data-a="c-voice" aria-label="${t('Search by voice')}">${icon('mic')}</button>
    </div>
    <div class="chips scroll quick"><span class="chips-l">${t('Popular today')}</span>${popularTypes().slice(0, 6).map(tp =>
      `<button class="chip" data-a="c-quick" data-type="${esc(tp)}">${typeName(tp)}</button>`).join('')}</div>
  </div>
  ${active ? `<div class="pad">${activeStrip(active)}</div>` : ''}
  ${basketHtml()}
  <div class="pad"><button class="listcard" data-a="c-list">${icon('list')}<span><b>${t('Got a shopping list?')}</b><small>${t('Type it once. We plan the fewest stops or the lowest total.')}</small></span>${icon('next')}</button></div>
  <section class="sec"><h2 class="pad">${t('What do you need?')}</h2>
    <div class="cats pad">${Object.keys(CATS).map(c => `<button class="cat" data-a="c-cat" data-c="${c}"><span class="cat-pic">${art(CAT_ART[c], c)}</span><span>${catLabel(c)}</span></button>`).join('')}</div>
  </section>
  ${quick.length ? `<section class="sec quick-sec"><div class="sec-h pad"><h2>${t('Daily needs in about 15 minutes')}</h2></div>
    <p class="pad note">${t('Shops within a short walk, soonest first. Pick it up on your way.')}</p>
    <div class="rail">${quick.map(l => itemCard(l, icon('clock') + tf('Get it in {n} min', { n: readyMin(vendorById(l.vendor)) }))).join('')}</div></section>` : ''}
  ${picks.length ? `<section class="sec"><div class="sec-h pad"><h2>${t('Picked for you')}</h2></div>
    <div class="rail">${picks.map(x => itemCard(x.l, x.reason)).join('')}</div></section>` : ''}
  <section class="sec"><div class="sec-h pad"><h2>${t('Vendors near you')}</h2><button class="link" data-a="c-tab" data-v="nearby">${t('See map')}</button></div>
    <div class="rail">${near.slice(0, 6).map(v => vendorCard(v)).join('')}</div></section>
  ${again.length ? `<section class="sec"><div class="sec-h pad"><h2>${t('Buy again')}</h2><button class="link" data-a="c-reorder" data-id="${past[0].id}">${icon('repeat')}${t('Repeat last order')}</button></div>
    <div class="rail">${again.slice(0, 8).map(({ l, qty }) => addCard(l, qty, shopName(vendorById(l.vendor)))).join('')}</div></section>` : ''}
  ${cleared.length ? `<section class="sec"><div class="sec-h pad"><h2>${t('Evening clearance near you')}</h2></div>
    <p class="pad note">${t('Fresh items vendors are marking down so nothing goes to waste tonight.')}</p>
    <div class="rail">${cleared.map(l => itemCard(l)).join('')}</div></section>` : ''}
  ${dl.length ? `<section class="sec"><div class="sec-h pad"><h2>${t('Fair prices today')}</h2></div>
    <p class="pad note">${t('The cheapest cart within 2 km for things several vendors sell.')}</p>
    <div class="rail">${dl.map(d => itemCard(d.l, tf('₹{n} less than others', { n: d.save }))).join('')}</div></section>` : ''}
  ${fresh.length ? `<section class="sec"><div class="sec-h pad"><h2>${t('Fresh this morning')}</h2></div>
    <div class="rail">${fresh.map(l => itemCard(l, icon('leaf') + esc(t(l.fresh)))).join('')}</div></section>` : ''}
  <p class="foot pad">${t('Prices are set by each vendor and change every day.')}</p>`;
};

// ---------------- Search ----------------
C.search = p => {
  const r = route(p);
  return `<header class="head search-head"><h1 class="sr-only">${t('Search')}</h1>
    <button class="icon-btn" data-a="back" aria-label="${t('Back')}">${icon('back')}</button>
    <form class="searchbar grow" data-form="c-search" role="search">
      <label class="input">${icon('search')}<input data-in="c-q" type="search" enterkeyhint="search" autocomplete="off" spellcheck="false"
        value="${esc(r.q || '')}" placeholder="${t('Tomato, thakkali, தக்காளி…')}" aria-label="${t('Search')}"></label>
      <button type="button" class="icon-btn mic ${p.listening ? 'on' : ''}" data-a="c-voice" aria-label="${t('Search by voice')}">${icon('mic')}</button>
    </form>
  </header>
  <div class="sr">${searchBody(p)}</div>`;
};

// Sort choices, like an online shop's. Offers you can buy today always come before sold-out ones.
const SORTS = [['value', 'Best value'], ['fast', 'Fastest to get'], ['price-asc', 'Price: low to high'], ['price-desc', 'Price: high to low'],
  ['rating', 'Customer rating'], ['near', 'Nearest first']];
const productRating = l => (l.nrating ? l.rating : 0);

function sortedOffers(tp, r) {
  const bv = bestValue(tp, 1);
  const score = o => { const x = bv && bv.ranked.find(y => y.l.id === o.l.id); return x ? x.score : 0; };
  let list = offersFor(tp);
  if (r.stock) list = list.filter(o => o.ok);
  if (r.open) list = list.filter(o => o.v.open);
  if (r.deliv) list = list.filter(o => o.v.delivery);
  if (r.rated) list = list.filter(o => o.l.nrating && o.l.rating >= 4);
  if (r.dist) list = list.filter(o => o.km <= r.dist);
  if (r.maxp) list = list.filter(o => priceOf(o.l) <= r.maxp);
  if (r.fast) list = list.filter(o => readyMin(o.v) <= 15);
  const by = {
    value: (a, b) => score(b) - score(a),
    fast: (a, b) => readyMin(a.v) - readyMin(b.v) || priceOf(a.l) - priceOf(b.l),
    'price-asc': (a, b) => priceOf(a.l) - priceOf(b.l) || a.km - b.km,
    'price-desc': (a, b) => priceOf(b.l) - priceOf(a.l),
    rating: (a, b) => productRating(b.l) - productRating(a.l) || b.l.nrating - a.l.nrating,
    near: (a, b) => a.km - b.km
  };
  list.sort((a, b) => (b.ok - a.ok) || by[r.sort || 'value'](a, b));
  return { list, bv };
}

// "★ 4.6 (38)" for a product, or "New" when nobody has reviewed it yet.
const productRatingHtml = l => (l.nrating
  ? `<span class="rate">${icon('star', 'fill')}${l.rating.toFixed(1)}<span class="rcount">(${l.nrating})</span></span>`
  : `<span class="rate new">${t('New')}</span>`);

function offerRow(o, bv, opts = {}) {
  const isBest = bv && bv.best.l.id === o.l.id;
  const row = `<button class="offer ${o.ok ? '' : 'dim'} ${isBest ? 'best' : ''} ${opts.sel ? 'sel' : ''}" data-a="${opts.action || 'c-product'}" data-type="${esc(o.l.type)}" data-id="${o.l.id}" ${opts.sel ? 'aria-current="true"' : ''}>
    ${stall(o.v, 40)}
    <span class="offer-b">
      <b>${shopName(o.v)}${isBest ? ` <span class="badge best">${t('Best value')}</span>` : ''}</b>
      <span class="meta eta">${icon('clock')}<b>${tf('Get it in {n} min', { n: readyMin(o.v) })}</b>
        <span class="nw">${nextDoor(o.v) ? t('Next door') : icon('walk') + o.km + ' km'}</span></span>
      <span class="meta">${productRatingHtml(o.l)}${o.v.open ? stockBadge(o.l) : openPill(o.v)}${clearBadge(o.l)}${o.v.delivery ? ` <span class="badge">${t('Delivers')}</span>` : ''}</span>
    </span>
    ${slate(priceOf(o.l), o.l.unit)}
  </button>`;
  const add = opts.add && o.ok ? `<button class="offer-add" data-a="c-add-q" data-id="${o.l.id}" data-q="1" aria-label="${esc(tf('Add {q} from {shop}', { q: qtyLabel(1, o.l.unit), shop: o.v.shop }))}">${icon('plus')}</button>` : '';
  return `<div class="offer-row">${row}${add}</div>${isBest && opts.reason ? `<p class="why">${icon('bulb')}<span>${bv.reason}</span></p>` : ''}`;
}

// Sort menu and filter chips above the results. summary is the line of counts, or null.
function filterBar(r, summary) {
  const on = r.rated || r.open || r.deliv || r.stock || r.fast || r.dist || r.maxp || r.cat;
  return `<div class="sort-row pad">
      <p class="sum-line">${summary || ''}</p>
      <label class="sort"><span>${t('Sort')}</span>
        <select data-ch="c-sort">${SORTS.map(([k, label]) => `<option value="${k}" ${(r.sort || 'value') === k ? 'selected' : ''}>${t(label)}</option>`).join('')}</select>
      </label>
    </div>
    <div class="chips scroll fchips pad">
      ${chip('c-f-rated', r.rated, '★ ' + t('4 and up'))}
      ${chip('c-f-stock', r.stock, t('In stock'))}
      ${chip('c-f-open', r.open, t('Open now'))}
      ${chip('c-f-deliv', r.deliv, t('Delivers'))}
      ${chip('c-f-fast', r.fast, tf('Get it in {n} min', { n: 15 }))}
      ${chip('c-f-dist', r.dist === 0.5, t('Within 500 m'), 0.5)}${chip('c-f-dist', r.dist === 1, t('Within 1 km'), 1)}${chip('c-f-dist', r.dist === 2, t('Within 2 km'), 2)}
      ${chip('c-f-price', r.maxp === 50, t('Under ₹50'), 50)}${chip('c-f-price', r.maxp === 100, t('Under ₹100'), 100)}${chip('c-f-price', r.maxp === 200, t('Under ₹200'), 200)}
      ${Object.keys(CATS).map(c => chip('c-f-cat', r.cat === c, catLabel(c), c)).join('')}
      ${on ? `<button class="chip clear" data-a="c-f-clear">${t('Clear all')}</button>` : ''}
    </div>`;
}

function searchBody(p) {
  const r = route(p);
  const q = (r.q || '').trim();
  const types = r.type ? [r.type] : q ? matchTypes(q) : r.cat ? allTypes().filter(tp => typeInfo(tp).cat === r.cat) : [];
  const vend = q && !r.type ? matchVendors(q) : [];

  if (!q && !r.cat && !r.type) {
    return `<div class="pad hints"><h2>${t('Try searching for')}</h2>
      <div class="chips wrap">${['tomato', 'jasmine', 'ilaneer', 'milk', 'keerai', 'onion'].map(tp => `<button class="chip" data-a="c-quick" data-type="${tp}">${typeName(tp)} <small>${typeOther(tp)}</small></button>`).join('')}</div>
      <p class="note">${t('You can type in English, Tamil, or the way you say it — "thakkali", "vengayam", "malli".')}</p></div>`;
  }

  const sugg = q && !r.type && types.length > 1 ? `<div class="chips scroll pad">${types.slice(0, 6).map(tp =>
    `<button class="chip" data-a="c-sugg" data-type="${esc(tp)}">${typeName(tp)} <small>${typeOther(tp)}</small></button>`).join('')}</div>` : '';

  const single = types.length === 1;
  const built = types.slice(0, 8).map(tp => ({ tp, ...sortedOffers(tp, r) }));
  const nOffers = built.reduce((a, b) => a + b.list.length, 0);
  const nVendors = new Set(built.flatMap(b => b.list.map(o => o.v.id))).size;
  const filters = filterBar(r, !types.length ? null
    : nOffers ? `${plural(nOffers, 'offer', 'offers')} · ${plural(nVendors, 'vendor', 'vendors')}` : t('No offers match these filters'));
  const groups = built.map(({ tp, list, bv }) => {
    const live = list.filter(o => o.ok);
    const min = live.length ? Math.min(...live.map(o => priceOf(o.l))) : null;
    const shown = single ? list : list.slice(0, 3);
    const info = typeInfo(tp);
    return `<section class="group">
      <button class="group-h" data-a="c-product" data-type="${esc(tp)}">
        <span class="pic sm">${art(tp, info.cat)}</span>
        <span class="group-t"><b>${typeName(tp)}</b><small>${typeOther(tp)}</small></span>
        <span class="group-s">${min != null ? tf('{n} have it · from {p}', { n: live.length, p: money(min) + '/' + unitShort(info.unit) }) : t('Nobody has it right now')}</span>
        ${icon('next')}
      </button>
      <div class="offers">${shown.map(o => offerRow(o, bv, { reason: (r.sort || 'value') === 'value', add: true })).join('') ||
        `<p class="note">${t('No vendor matches these filters.')}</p>`}</div>
      ${list.length > shown.length ? `<button class="link more" data-a="c-product" data-type="${esc(tp)}">${tf('Compare all {n} vendors', { n: list.length })}</button>` : ''}
    </section>`;
  }).join('');

  const vlist = vend.length ? `<section class="group pad"><h2>${t('Vendors')}</h2>${vend.map(v => vendorCard(v, true)).join('')}</section>` : '';

  if (!groups && !vlist) {
    return filters + empty(`<span class="pic xl">${art('tomato')}</span>`, tf('No one nearby sells “{q}” yet', { q: esc(q) }),
      t('Check the spelling, or try the Tamil name.'),
      `<div class="chips wrap center">${popularTypes().slice(0, 4).map(tp => `<button class="chip" data-a="c-quick" data-type="${esc(tp)}">${typeName(tp)}</button>`).join('')}</div>`);
  }
  return filters + sugg + `<div class="results">${groups}</div>` + vlist;
}

// ---------------- Product: one item, compared across vendors ----------------
const WLABEL = { price: 'Price', distance: 'Distance', rating: 'Rating', stock: 'Enough stock' };

C.product = p => {
  const r = route(p);
  const info = typeInfo(r.type);
  if (!info) return head(t('Not found'), { back: true }) + empty('', t('This item is no longer listed.'), '', '');
  const offers = offersFor(r.type);
  const bv = bestValue(r.type, 1);
  let l = r.id && listingById(r.id);
  if (!l || l.type !== r.type) l = bv ? bv.best.l : offers[0] && offers[0].l;
  const cartN = S.cart.length;
  const right = `<button class="icon-btn" data-a="c-tab" data-v="cart" aria-label="${t('Cart')}">${icon('bag')}${cartN ? `<i class="dotn">${cartN}</i>` : ''}</button>`;
  if (!l) {
    return head(typeName(r.type), { back: true, right }) + empty(`<span class="pic xl">${art(r.type, info.cat)}</span>`,
      tf('Nobody nearby has {item} right now', { item: typeName(r.type) }), t('Here are similar things in stock:'), similar(r.type));
  }
  const v = vendorById(l.vendor), k = km(v), ok = canBuy(l);
  p.ui.qty = p.ui.qty || {};
  const q = Math.min(p.ui.qty[l.id] || 1, Math.max(UNITS[l.unit].step, l.stock));
  const inCart = cartQty(l.id);
  const ranked = bv ? bv.ranked : [];
  const order = [...ranked, ...offers.filter(o => !o.ok)];

  const buy = ok ? `<div class="buy">${stepper('c-qty', l.id, q, l.unit)}
      <button class="btn primary grow" data-a="c-add" data-id="${l.id}">${t('Add to cart')} · ${money(q * priceOf(l))}</button></div>
      ${inCart ? `<p class="incart">${icon('check')}${tf('{q} in your cart', { q: qtyLabel(inCart, l.unit) })} · <button class="link" data-a="c-tab" data-v="cart">${t('View cart')}</button></p>` : ''}`
    : (() => {
      const alts = ranked.filter(x => x.l.id !== l.id).slice(0, 2);
      return `<div class="alert">
        <b>${v.open ? tf('{shop} is out of {item} today.', { shop: shopName(v), item: itemName(l) }) : tf('{shop} is closed right now.', { shop: shopName(v) })}</b>
        ${alts.length ? `<p>${t('Same item, other vendors nearby:')}</p>${alts.map(a => `<button class="alt" data-a="c-pick" data-id="${a.l.id}">
            ${stall(a.v, 34)}<span><b>${shopName(a.v)}</b><small>${a.km} km · ${rate(a.v)}</small></span>${slate(priceOf(a.l), a.l.unit)}<span class="alt-go">${t('Switch')}</span></button>`).join('')}`
          : `<p>${t('Nobody nearby has it right now. Similar things in stock:')}</p>${similar(r.type)}`}
      </div>`;
    })();

  return head(itemName(l), { back: true, right }) + `
  <div class="prod-hero">${itemPic(l, 'xl')}</div>
  <div class="pad">
    <h2 class="prod-n">${itemName(l)}</h2>
    <p class="prod-o">${itemOther(l)}${itemOther(l) ? ' · ' : ''}${catLabel(l.cat)}</p>
    <p class="prod-r">${l.nrating ? `${productRatingHtml(l)}<span class="meta">${plural(l.nrating, 'rating', 'ratings')}</span>` : `<span class="meta">${t('No reviews yet for this item')}</span>`}</p>
    <div class="card seller">
      <button class="seller-h" data-a="c-vendor" data-id="${v.id}">${stall(v, 44)}
        <span><b>${shopName(v)}</b><span class="meta">${icon('walk')}${k} km · ${walkMin(k)} min · ${rate(v)}</span></span>${icon('next')}</button>
      <div class="seller-p">${slate(priceOf(l), l.unit, true)}${onClear(l) ? `<s class="was">₹${l.price}</s>` : ''}${v.open ? stockBadge(l) : openPill(v)}${clearBadge(l)}</div>
      ${l.fresh ? `<p class="fresh">${icon('leaf')}${esc(t(l.fresh))}</p>` : ''}
      <p class="meta">${icon('clock')}${tf('Ready in about {n} min', { n: v.prep })} · ${v.delivery ? tf('delivers within {k} km', { k: v.delivery.km }) : t('pickup only')}</p>
      ${buy}
    </div>
    ${offers.length > 1 ? `<section class="sec cmp">
      <h2>${tf('Compare {n} vendors', { n: offers.length })}</h2>
      ${bv ? `<div class="pick"><span class="badge best">${t('Best value')}</span><b>${shopName(bv.best.v)} · ${money(priceOf(bv.best.l))}/${unitShort(bv.best.l.unit)}</b><p>${bv.reason}</p></div>` : ''}
      <div class="offers">${order.map(o => offerRow(o, bv, { action: 'c-pick', sel: o.l.id === l.id })).join('')}</div>
      <details class="how"><summary>${t('How we pick the best value')}</summary>
        <div class="weights">${Object.entries(WEIGHTS).map(([key, w]) => `<div class="wrow"><span>${t(WLABEL[key])}</span><span class="wbar"><i style="width:${w / 0.4 * 100}%"></i></span><b>${Math.round(w * 100)}%</b></div>`).join('')}</div>
        <p>${t('Closed vendors and sold-out items are left out. The cheapest cart is not always the best pick if it is far away. No vendor can pay to be shown higher.')}</p>
      </details>
    </section>` : ''}
    ${reviewsHtml(p, l)}
    ${withHtml(r.type, v)}
  </div>`;
};

// ---------------- Ratings and reviews (products and shops) ----------------
const starRowHtml = n => `<span class="stars" aria-label="${n.toFixed(1)} / 5">${'★'.repeat(Math.round(n))}<span>${'★'.repeat(5 - Math.round(n))}</span></span>`;

function reviewCard(rv) {
  return `<article class="review ${rv.me ? 'mine' : ''}">
    <div class="rv-h"><b>${esc(rv.name)}${rv.me ? ` <span class="badge">${t('You')}</span>` : ''}</b>
      <span class="stars" aria-label="${rv.stars} / 5">${'★'.repeat(rv.stars)}<span>${'★'.repeat(5 - rv.stars)}</span></span></div>
    ${rv.text ? `<p>${esc(rv.text)}</p>` : ''}
  </article>`;
}

// Five bars, like an online shop: how many people gave each number of stars.
function reviewsHtml(p, l) {
  const n = l.nrating;
  const pct = c => (n ? Math.round((c / n) * 100) : 0);
  const bars = [5, 4, 3, 2, 1].map(s => `<div class="bar-row"><span>${s} ★</span><span class="bar"><i style="width:${pct(l.dist[s - 1])}%"></i></span><b>${pct(l.dist[s - 1])}%</b></div>`).join('');
  const rev = p.ui.rev && p.ui.rev.kind === 'item' && p.ui.rev.id === l.id ? p.ui.rev : null;
  return `<section class="sec reviews">
    <h2>${t('Ratings and reviews')}</h2>
    ${n ? `<div class="rv-top">
      <div class="rv-big"><b>${l.rating.toFixed(1)}</b>${starRowHtml(l.rating)}<small>${plural(n, 'rating', 'ratings')}</small></div>
      <div class="rv-bars">${bars}</div>
    </div>` : `<p class="rv-none">${icon('star')}<span>${t('No ratings yet')}. ${t('Be the first to review this.')}</span></p>`}
    ${reviewForm(p, 'item', l.id, rev, tf('Your review of {item}', { item: itemName(l) }), t('Write a review'))}
    ${l.reviews.length ? `<div class="rv-list">${l.reviews.map(reviewCard).join('')}</div>` : ''}
    <p class="note">${t('Some reviews are samples for the demo.')}</p>
  </section>`;
}

function shopReviewsHtml(p, v) {
  const rev = p.ui.rev && p.ui.rev.kind === 'shop' && p.ui.rev.id === v.id ? p.ui.rev : null;
  return `<section class="sec pad reviews">
    <h2>${t('Ratings and reviews')}</h2>
    <div class="rv-top">
      <div class="rv-big"><b>${v.nrating ? v.rating.toFixed(1) : '–'}</b>${v.nrating ? starRowHtml(v.rating) : ''}<small>${v.nrating ? plural(v.nrating, 'rating', 'ratings') : t('No ratings yet')}</small></div>
      <p class="note">${t('Rate the shop after you have bought from them. It helps other shoppers choose.')}</p>
    </div>
    ${reviewForm(p, 'shop', v.id, rev, tf('Your rating for {shop}', { shop: shopName(v) }), t('Rate this shop'))}
    ${v.reviews.length ? `<div class="rv-list">${v.reviews.map(reviewCard).join('')}</div>` : ''}
    <p class="note">${t('Some reviews are samples for the demo.')}</p>
  </section>`;
}

// Closed: one button. Open: stars, name, optional words, post.
function reviewForm(p, kind, id, rev, title, openLabel) {
  if (!rev) return `<button class="btn ghost wide rv-open" data-a="c-rev-open" data-kind="${kind}" data-id="${id}">${icon('edit')}${openLabel}</button>`;
  return `<form class="card rv-form" data-form="c-review" data-kind="${kind}" data-id="${id}" novalidate>
    <b class="rv-q">${title}</b>
    <div class="stars-pick" role="radiogroup" aria-label="${t('Your rating')}">${[1, 2, 3, 4, 5].map(n =>
      `<button type="button" data-a="c-rev-star" data-n="${n}" role="radio" aria-checked="${rev.stars === n}" aria-label="${n}" class="${n <= rev.stars ? 'on' : ''}">${icon('star', n <= rev.stars ? 'fill' : '')}</button>`).join('')}</div>
    <label class="field"><span>${t('Your name')}</span><input data-in="c-rev-name" value="${esc(rev.name)}" autocomplete="name"></label>
    <label class="field"><span>${t('Review (optional)')}</span><textarea data-in="c-rev-text" rows="3" placeholder="${esc(t('Quality, weight, freshness…'))}">${esc(rev.text)}</textarea></label>
    ${rev.err ? `<p class="err" role="alert">${rev.err}</p>` : ''}
    <div class="row2"><button class="btn ghost" type="button" data-a="c-rev-close">${t('Cancel')}</button><button class="btn primary" type="submit">${t('Post review')}</button></div>
  </form>`;
}

// "Often bought with": prefer the same cart, so it's no extra stop.
function withHtml(type, v) {
  const cards = boughtWith(type, 4).map(tp => {
    const here1 = S.listings.find(l => l.vendor === v.id && l.type === tp && canBuy(l));
    if (here1) return itemCard(here1, tf('Also at {shop}, no extra stop', { shop: shopName(v) }));
    const bv = bestValue(tp, 1);
    return bv ? itemCard(bv.best.l) : '';
  }).filter(Boolean).slice(0, 3);
  return cards.length ? `<section class="sec"><h2>${tf('Often bought with {item}', { item: typeName(type) })}</h2><div class="rail tight">${cards.join('')}</div></section>` : '';
}

function similar(type) {
  const info = typeInfo(type);
  const others = allTypes().filter(tp => tp !== type && typeInfo(tp).cat === info.cat)
    .map(tp => bestValue(tp, 1)).filter(Boolean).slice(0, 4);
  if (!others.length) return '';
  return `<div class="rail tight">${others.map(b => itemCard(b.best.l)).join('')}</div>`;
}

// ---------------- Nearby: map or list ----------------
C.nearby = p => {
  const r = route(p);
  const mode = r.mode || 'map';
  const list = S.vendors.filter(v => !r.cat || v.cat === r.cat || listingsOf(v.id).some(l => l.cat === r.cat))
    .sort((a, b) => (b.open - a.open) || km(a) - km(b));
  const sel = (r.sel && list.find(v => v.id === r.sel)) || list[0];
  return head(t('Vendors near you'), {
    sub: tf('{n} street vendors around {place}', { n: list.length, place: esc(placeLabel(S.place).split('·').pop().trim()) }),
    right: seg('c-map-mode', mode, [['map', icon('map') + `<span class="vh">${t('Map')}</span>`], ['list', icon('list') + `<span class="vh">${t('List')}</span>`]])
  }) + `<div class="chips scroll pad">${chip('c-map-cat', !r.cat, t('All'), '')}${Object.keys(CATS).map(c => chip('c-map-cat', r.cat === c, catLabel(c), c)).join('')}</div>` +
  (mode === 'map'
    ? `<div class="mapbox">${streetMap(list, sel)}</div>${sel ? `<div class="pad">${vendorCard(sel, true)}</div>` : ''}
       <p class="note pad">${t('Tap a pin to see the vendor. The map is a simple drawing of Mylapore, not to scale.')}</p>`
    : `<div class="list pad">${list.map(v => vendorCard(v, true)).join('') || `<p class="note">${t('No vendors in this category yet.')}</p>`}</div>`);
};

function streetMap(list, sel) {
  const me = here();
  const road = (d, w = 12) => `<path d="${d}" stroke="#d9d2c0" stroke-width="${w + 3}" fill="none" stroke-linecap="round"/><path d="${d}" stroke="#fffdf7" stroke-width="${w}" fill="none" stroke-linecap="round"/>`;
  const label = (x, y, rot, s) => `<text x="${x}" y="${y}" transform="rotate(${rot} ${x} ${y})" class="mlabel">${s}</text>`;
  const pins = list.map(v => {
    const c = v.open ? (CAT_COLOR[v.cat] || '#2f9e6a') : '#8c8f8a';
    const on = sel && sel.id === v.id;
    return `<g class="mpin ${on ? 'on' : ''}" data-a="c-map-pin" data-id="${v.id}" transform="translate(${v.x} ${v.y})" role="button" aria-label="${shopName(v)}">
      <circle r="20" fill="transparent"/>
      <g transform="scale(${on ? 1.35 : 1})"><path d="M0 0C-8 -10 -11 -14 -11 -20A11 11 0 1 1 11 -20C11 -14 8 -10 0 0Z" fill="${c}" stroke="#fff" stroke-width="2"/>
      <circle cy="-20" r="4.5" fill="#fff"/></g>
      ${on ? `<text y="-${on ? 38 : 30}" text-anchor="middle" class="mpin-l">${shopName(v)}</text>` : ''}
    </g>`;
  }).join('');
  return `<svg class="map" viewBox="0 0 440 400" role="img" aria-label="${t('Map of vendors near you')}">
    <rect width="440" height="400" fill="#f1eadb"/>
    <path d="M412 0H440V400H404Q414 200 412 0Z" fill="#efe0b4"/><path d="M428 0H440V400H424Q432 200 428 0Z" fill="#a9d4de"/>
    <path d="M62 66Q90 46 140 58Q160 90 146 118Q100 132 70 114Q52 92 62 66Z" fill="#cfe3bd"/>
    ${label(74, 92, 0, 'Nageswara Rao Park')}
    <rect x="198" y="64" width="54" height="44" rx="3" fill="#cfc7b2"/><rect x="204" y="70" width="42" height="32" rx="2" fill="#a9cfe0"/>
    <path d="M262 106V78l6 -14h12l6 14v28z" fill="#d9a66a"/><path d="M266 78h18M265 88h20M264 98h22" stroke="#b8834a" stroke-width="2"/>
    ${label(196, 58, 0, t('Temple tank'))}
    ${road('M0 300L440 284', 6)}${road('M110 232L372 216', 6)}${road('M0 82L372 64', 6)}${road('M300 140L440 150', 6)}
    ${road('M150 400L205 0')}${road('M0 172L300 140')}${road('M268 0L292 400')}${road('M92 0L108 400')}${road('M372 0L380 400')}${road('M196 118H262', 7)}${road('M400 0L404 400', 8)}
    ${label(158, 384, -82, 'Kutchery Rd')}${label(8, 166, -6, 'Luz Church Rd')}${label(276, 30, 86, 'R K Mutt Rd')}
    ${label(100, 360, -88, 'Royapettah High Rd')}${label(366, 300, -88, 'Santhome High Rd')}${label(204, 130, 0, 'East Mada St')}
    ${label(338, 360, 0, 'Mandaveli')}${label(432, 140, 90, 'Santhome beach')}
    <g transform="translate(${me.x} ${me.y})"><circle r="16" fill="#e4572e" opacity=".22" class="pulse"/><circle r="7" fill="#2e2a72" stroke="#fff" stroke-width="3"/></g>
    <text x="${me.x + 12}" y="${me.y + 20}" class="mlabel you">${t('You')}</text>
    ${pins}
  </svg>`;
}

// ---------------- Vendor profile ----------------
C.vendor = p => {
  const v = vendorById(route(p).id);
  if (!v) return head(t('Vendor'), { back: true }) + empty('', t('This vendor is no longer listed.'), '', '');
  const items = listingsOf(v.id).sort((a, b) => canBuy(b) - canBuy(a));
  const fav = S.favs.includes(v.id);
  return head(shopName(v), { back: true, right: `<button class="icon-btn ${fav ? 'faved' : ''}" data-a="c-fav" data-id="${v.id}" aria-pressed="${fav}" aria-label="${t('Favourite')}">${icon('heart')}</button>` }) + `
  <div class="vhero pad">${stall(v, 76)}<div>
    <h2>${shopName(v)}</h2>
    <p class="meta">${esc(v.owner)} · ${tf('on this street since {y}', { y: v.since })}</p>
    <p class="meta">${rate(v)} <span>(${v.nrating})</span> ${openPill(v)}</p></div></div>
  <div class="facts pad">
    <p>${icon('pin')}<span>${esc(v.spot)} · ${km(v)} km</span></p>
    <p>${icon('clock')}<span>${esc(v.hours)}</span></p>
    <p>${icon(v.delivery ? 'bike' : 'walk')}<span>${v.delivery ? tf('Pickup, or delivery within {k} km for {f}', { k: v.delivery.km, f: v.delivery.fee ? money(v.delivery.fee) : t('free') }) : t('Pickup only')}</span></p>
    <p>${icon('phone')}<span>${esc(v.phone)}</span> <a class="link" href="tel:${esc(v.phone.replace(/\s/g, ''))}">${t('Call')}</a></p>
    ${v.upi ? `<p>${icon('tag')}<span>${tf('UPI at the stall: {id}', { id: esc(v.upi) })}</span></p>` : ''}
  </div>
  <section class="sec"><h2 class="pad">${t("Today's items")}</h2>
    ${items.length ? `<div class="grid pad">${items.map(l => addCard(l, 1, l.available && l.stock > 0 ? (l.stock <= UNITS[l.unit].low ? tf('Only {q} left', { q: qtyLabel(l.stock, l.unit) }) : t('In stock')) : t('Out today'))).join('')}</div>`
      : `<p class="note pad">${t('This vendor has not added items yet.')}</p>`}
  </section>
  ${shopReviewsHtml(p, v)}`;
};

// ---------------- Shopping list → trip plan ----------------
const SAMPLE_LIST = '1 kg thakkali, arai kilo vengayam, 1 kattu kothamalli, 2 muzham malli, 1 dozen banana';

C.list = p => head(t('Plan my shopping'), { back: true, sub: t('Type your list the way you would say it.') }) + `
  <div class="pad stack-gap">
    <form class="card" data-form="c-list">
      <label class="field"><span>${t('Your list')}</span>
        <textarea data-in="c-list" rows="3" placeholder="${esc(t('e.g. 1 kg thakkali, arai kilo vengayam, malli, 2 muzham jasmine'))}">${esc(S.list || '')}</textarea></label>
      <div class="row2"><button class="btn primary" type="submit">${icon('map')}${t('Plan my trip')}</button>
        <button type="button" class="btn ghost" data-a="c-list-sample">${t('Try a sample list')}</button></div>
    </form>
    ${p.ui.planned ? planBody() : `<p class="note">${t('We read quantities like “1 kg”, “arai kilo”, “2 kattu” and names in English, Tamil or Tanglish. Then we compare two ways to buy it all.')}</p>`}
  </div>`;

function planBody() {
  const { items, unknown } = readShoppingList(S.list);
  if (!items.length) return `<div class="alert"><b>${t('We couldn’t find any items in that list.')}</b><p>${t('Try names like tomato, thakkali, vengayam or jasmine, separated by commas.')}</p></div>`;
  const plan = planTrip(items);
  const { cheap, fewest } = plan;
  const extra = cheap.stops.length - fewest.stops.length, saving = fewest.total - cheap.total;
  const same = extra <= 0;
  const recCheap = same || saving >= 15 * extra;
  const card = (k, pl, title, rec) => `<section class="card plan ${rec ? 'rec' : ''}">
    <div class="plan-h"><h2>${title}</h2>${rec ? `<span class="badge best">${t('Suggested')}</span>` : ''}</div>
    <div class="plan-stats"><span><b>${pl.stops.length}</b>${pl.stops.length === 1 ? t('stop') : t('stops')}</span><span><b>${pl.walk} km</b>${t('walk, there and back')}</span><span><b>${money(pl.total)}</b>${t('total')}</span></div>
    ${pl.stops.map(st => `<div class="pstop">${stall(st.v, 34)}<span><b>${shopName(st.v)}</b><small>${st.lines.map(x => `${itemName(x.l)} ${qtyLabel(x.qty, x.l.unit)}`).join(', ')}</small></span>
      <b>${money(st.lines.reduce((a, x) => a + Math.round(x.qty * priceOf(x.l)), 0))}</b></div>`).join('')}
    <button class="btn ${rec ? 'primary' : 'ghost'} wide" data-a="c-plan-use" data-k="${k}">${icon('bag')}${t('Add these to cart')}</button>
  </section>`;
  return `<div class="chips wrap">${items.map(it => `<span class="chip on">${typeName(it.type)} · ${qtyLabel(it.qty, typeInfo(it.type).unit)}</span>`).join('')}</div>
    ${unknown.length ? `<p class="err">${tf('Couldn’t match: {list}', { list: unknown.map(esc).join(', ') })}</p>` : ''}
    ${plan.missing.length ? `<p class="note">${tf('Nobody within 3 km has enough {list} right now.', { list: plan.missing.map(m => typeName(m.type)).join(', ') })}</p>` : ''}
    ${same ? card('cheap', cheap, t('Cheapest and fewest stops'), true)
      : `<p class="why">${icon('bulb')}<span>${tf('The lowest-price plan saves {m} but adds {n} and {k} km of walking.', { m: money(saving), n: plural(extra, 'stop', 'stops'), k: Math.max(0, Math.round((cheap.walk - fewest.walk) * 10) / 10) })}</span></p>
        ${card('fewest', fewest, t('Fewest stops'), !recCheap)}${card('cheap', cheap, t('Lowest total'), recCheap)}`}`;
}

// ---------------- Cart ----------------
C.cart = p => {
  const groups = cartGroups();
  if (!groups.length) {
    return head(t('Cart')) + empty(`<span class="pic xl">${art('brinjal')}</span>`, t('Your cart is empty'),
      t('Search for something, or see which vendors are near you.'),
      `<button class="btn primary" data-a="c-tab" data-v="search">${t('Find something')}</button>`);
  }
  const f = p.form;
  if (f.name == null) f.name = S.me.name;
  if (f.phone == null) f.phone = S.me.phone;
  const okGroups = groups.filter(g => !g.blocked);
  const total = okGroups.reduce((a, g) => a + g.total, 0);
  return head(t('Cart'), { sub: groups.length > 1 ? tf('{n} vendors, so {n} separate orders', { n: groups.length }) : '' }) + `<div class="pad stack-gap">
    ${groups.map((g, i) => cartGroup(g, i, groups.length)).join('')}
    <section class="card">
      <h2 class="card-t">${t('How will you pay?')}</h2>
      ${radio('c-pay', 'stall', S.pay, t('At the stall'), t('Cash or the vendor’s own UPI QR, when you collect.'))}
      ${radio('c-pay', 'upi', S.pay, t('UPI now (demo)'), t('Shown for the demo only. No money moves and no UPI app opens.'))}
    </section>
    <form class="card" data-form="c-place-order" novalidate>
      <h2 class="card-t">${t('Your details')}</h2>
      <label class="field"><span>${t('Name')}</span><input data-in="c-f" name="name" value="${esc(f.name)}" autocomplete="name"></label>
      <label class="field"><span>${t('Mobile number')}</span><input data-in="c-f" name="phone" value="${esc(f.phone)}" inputmode="tel" autocomplete="tel"></label>
      ${f.err ? `<p class="err" role="alert">${f.err}</p>` : ''}
      <div class="grand"><span>${t('To pay')}</span><b>${money(total)}</b></div>
      <button class="btn primary big" type="submit" ${okGroups.length ? '' : 'disabled'}>${okGroups.length > 1 ? tf('Place {n} orders', { n: okGroups.length }) : t('Place order')} · ${money(total)}</button>
      ${okGroups.length < groups.length ? `<p class="err">${t('Sort out the items marked in red first, or that vendor’s order will be left out.')}</p>` : ''}
      <p class="note">${t('Each vendor gets their own order and confirms it themselves.')}</p>
    </form>
  </div>`;
};

function radio(a, v, cur, title, sub) {
  return `<button type="button" class="radio ${cur === v ? 'on' : ''}" data-a="${a}" data-v="${v}" role="radio" aria-checked="${cur === v}">
    <span class="rd"></span><span><b>${title}</b><small>${sub}</small></span></button>`;
}

function cartGroup(g, i, n) {
  const v = g.v, d = km(v);
  const canDeliver = v.delivery && d <= v.delivery.km;
  return `<section class="card cgroup ${g.blocked ? 'blocked' : ''}">
    <div class="cg-h">${stall(v, 38)}<span><b>${shopName(v)}</b><small>${d} km · ${esc(v.spot)}</small></span>${n > 1 ? `<span class="cg-n">${tf('{i} of {n}', { i: i + 1, n })}</span>` : ''}</div>
    ${g.lines.map(cartLine).join('')}
    ${addOnsFor(v.id, g.lines.map(x => x.l.type)).slice(0, 1).map(x => `<div class="addon"><span>${tf('Often bought with {item}:', { item: typeName(x.why) })} <b>${itemName(x.l)}</b> ${money(priceOf(x.l))}/${unitShort(x.l.unit)}</span>
      <button class="mini-add" data-a="c-add-q" data-id="${x.l.id}" data-q="1">${icon('plus')}<span>${t('Add')}</span></button></div>`).join('')}
    <div class="cg-mode" data-vid="${v.id}">${seg('c-mode', g.mode, [['pickup', icon('walk') + t('Pickup')], ['delivery', icon('bike') + t('Delivery'), !canDeliver]])}</div>
    <p class="note">${g.mode === 'pickup' ? tf('Ready in about {n} min at {spot}.', { n: v.prep, spot: esc(v.spot) }) + (S.pay === 'stall' && v.upi ? ' ' + tf('Pay cash or UPI to {id}.', { id: esc(v.upi) }) : '')
      : tf('{shop} brings it to you. Delivery fee {f}.', { shop: shopName(v), f: g.fee ? money(g.fee) : t('free') })}
      ${!v.delivery ? ' ' + t("This vendor doesn't deliver.") : !canDeliver ? ' ' + tf('Delivers within {k} km; you are {d} km away.', { k: v.delivery.km, d }) : ''}</p>
    <div class="sum"><span>${t('Items')}</span><b>${money(g.sub)}</b></div>
    ${g.mode === 'delivery' ? `<div class="sum"><span>${t('Delivery')}</span><b>${g.fee ? money(g.fee) : t('Free')}</b></div>` : ''}
  </section>`;
}

function cartLine(x) {
  const l = x.l, v = vendorById(l.vendor);
  let warn = '';
  if (!canBuy(l) || l.stock < x.qty) {
    const bv = bestValue(l.type, x.qty);
    const alt = bv && bv.ranked.find(o => o.l.id !== l.id && o.l.stock >= x.qty);
    const why = !v.open ? tf('{shop} has closed for now.', { shop: shopName(v) })
      : (!l.available || l.stock <= 0) ? t('Sold out since you added it.') : tf('Only {q} left.', { q: qtyLabel(l.stock, l.unit) });
    warn = `<div class="warn"><b>${why}</b><div class="warn-a">
      ${alt ? `<button class="btn small" data-a="c-switch" data-id="${l.id}" data-to="${alt.l.id}">${tf('Switch to {shop} · {p}', { shop: shopName(alt.v), p: money(priceOf(alt.l)) })}</button>` : ''}
      ${v.open && l.available && l.stock > 0 && l.stock < x.qty ? `<button class="btn small ghost" data-a="c-fit" data-id="${l.id}">${tf('Take {q}', { q: qtyLabel(l.stock, l.unit) })}</button>` : ''}
      <button class="btn small ghost" data-a="c-remove" data-id="${l.id}">${t('Remove')}</button></div></div>`;
  }
  return `<div class="cline">${itemPic(l, 'sm')}<div class="cl-b"><b>${itemName(l)}</b><small>${money(priceOf(l))}/${unitShort(l.unit)}${onClear(l) ? ' · ' + clearBadge(l) : ''}</small></div>
    ${stepper('c-cqty', l.id, x.qty, l.unit)}<b class="cl-t">${money(x.qty * priceOf(l))}</b></div>${warn}`;
}

// ---------------- After placing ----------------
C.placed = p => {
  const os = (route(p).ids || []).map(orderById).filter(Boolean);
  return `<div class="done-hero pad"><span class="tick">${icon('check')}</span>
    <h1>${os.length > 1 ? tf('{n} orders sent', { n: os.length }) : t('Order sent')}</h1>
    <p>${t('The vendor will confirm in a few minutes. You can follow it here.')}</p></div>
    <div class="pad stack-gap">${os.map(orderCard).join('')}
    ${MODE === 'split' ? `<p class="hint">${icon('split')}${t('It has already reached the vendor’s phone on the right.')}</p>` : `<p class="hint">${t('Demo: switch to “Vendor” at the top to accept this order.')}</p>`}
    <button class="btn ghost" data-a="c-tab" data-v="home">${t('Back to home')}</button></div>`;
};

function orderCard(o) {
  const v = vendorById(o.vendor), live = isOpenOrder(o), flow = flowFor(o), at = flow.indexOf(o.status);
  const n = o.items.length;
  return `<div class="card ocard">
    <button class="oc-tap" data-a="c-order" data-id="${o.id}">${stall(v, 40)}
      <span><b>${shopName(v)}</b><small>${o.id} · ${timeAgo(o.at)} · ${n === 1 ? t('1 item') : tf('{n} items', { n })}</small></span>
      <span class="st st-${o.status}">${statusLabel(o.status, o.mode)}</span></button>
    ${live ? `<span class="pbar"><i style="width:${((at + 1) / flow.length) * 100}%"></i></span>` : ''}
    <div class="oc-f"><b>${money(orderTotal(o))}</b>
      ${live ? `<button class="link" data-a="c-order" data-id="${o.id}">${t('Track')}</button>` : `<button class="btn small ghost" data-a="c-reorder" data-id="${o.id}">${icon('repeat')}${t('Order again')}</button>`}</div>
  </div>`;
}

C.orders = p => {
  const mine = S.orders.filter(isMine).sort((a, b) => b.at - a.at);
  const live = mine.filter(isOpenOrder), past = mine.filter(o => !isOpenOrder(o));
  if (!mine.length) return head(t('Your orders')) + empty(`<span class="pic xl">${art('banana')}</span>`, t('No orders yet'), t('Your orders and their progress will show here.'), `<button class="btn primary" data-a="c-tab" data-v="search">${t('Find something')}</button>`);
  return head(t('Your orders')) + `<div class="pad stack-gap">
    ${live.length ? `<h2 class="sub-h">${t('In progress')}</h2>${live.map(orderCard).join('')}` : ''}
    ${past.length ? `<h2 class="sub-h">${t('Earlier')}</h2>${past.map(orderCard).join('')}` : ''}</div>`;
};

C.order = p => {
  const o = orderById(route(p).id);
  if (!o) return head(t('Order'), { back: true }) + empty('', t('Order not found.'), '', '');
  const v = vendorById(o.vendor);
  const firstType = (listingById(o.items[0].lid) || {}).type;
  return head(tf('Order {id}', { id: o.id }), { back: true, sub: shopName(v) + ' · ' + timeAgo(o.at) }) + `<div class="pad stack-gap">
    ${o.status === 'rejected' ? '' : `<div class="card track">${progress(o)}</div>`}
    ${o.status === 'ready' ? `<div class="callout">${icon('shop')}<span>${tf('Collect from {spot}. Show order number {id}.', { spot: esc(v.spot), id: o.id })}</span></div>` : ''}
    ${o.status === 'out' ? `<div class="callout">${icon('bike')}<span>${tf('{shop} is on the way with your order.', { shop: shopName(v) })}</span></div>` : ''}
    ${o.status === 'rejected' ? `<div class="alert"><b>${t('Sorry, they couldn’t take this one.')}</b><p>${t('Nothing was charged. Other vendors nearby may have it.')}</p>
      ${firstType ? `<button class="btn small" data-a="c-product" data-type="${esc(firstType)}">${t('Find another vendor')}</button>` : ''}</div>` : ''}
    <div class="card">
      ${o.items.map(i => `<div class="sum"><span>${esc(ta() ? i.ta || i.name : i.name)} · ${qtyLabel(i.qty, i.unit)}</span><b>${money(lineTotal(i))}</b></div>`).join('')}
      ${o.fee ? `<div class="sum"><span>${t('Delivery')}</span><b>${money(o.fee)}</b></div>` : ''}
      <div class="sum total"><span>${t('Total')}</span><b>${money(orderTotal(o))}</b></div>
      <p class="note">${o.mode === 'delivery' ? t('Delivery') : t('Pickup')} · ${o.pay === 'upi' ? t('UPI (demo, nothing charged)') : t('Pay at the stall')}</p>
    </div>
    ${o.status === 'rejected' || o.status === 'cancelled' ? '' : invoiceHtml(o)}
    <button class="card vline" data-a="c-vendor" data-id="${v.id}">${stall(v, 40)}<span><b>${shopName(v)}</b><small>${esc(v.spot)} · ${esc(v.phone)}</small></span>${icon('next')}</button>
    ${o.status === 'placed' ? `<button class="btn ghost danger" data-a="c-cancel" data-id="${o.id}">${t('Cancel order')}</button>` : ''}
    ${o.status === 'completed' ? (o.rated ? `<p class="note center">${tf('You rated this {n} out of 5.', { n: o.rated })}</p>`
      : `<div class="card rate-box"><b>${tf('How was {shop}?', { shop: shopName(v) })}</b><div class="stars-in">${[1, 2, 3, 4, 5].map(n => `<button data-a="c-rate" data-id="${o.id}" data-n="${n}" aria-label="${n}">${icon('star')}</button>`).join('')}</div></div>`) : ''}
    ${!isOpenOrder(o) ? `<button class="btn ghost" data-a="c-reorder" data-id="${o.id}">${icon('repeat')}${t('Order the same again')}</button>` : ''}
  </div>`;
};

C.notes = p => {
  const list = S.notes;
  const html = head(t('Updates'), { back: true }) + (list.length
    ? `<div class="pad stack-gap">${list.map(n => { const o = orderById(n.oid); if (!o) return ''; const v = vendorById(o.vendor);
        return `<button class="card note-row ${n.read ? '' : 'unread'}" data-a="c-order" data-id="${o.id}">${stall(v, 36)}<span><b>${tf(STATUS_NOTE[n.s], { shop: shopName(v) })}</b><small>${o.id} · ${timeAgo(n.t)}</small></span></button>`; }).join('')}</div>`
    : empty(`<span class="pic xl">${art('jasmine')}</span>`, t('No updates yet'), t('When a vendor accepts or packs your order, you will see it here.'), ''));
  if (list.some(n => !n.read)) { list.forEach(n => { n.read = true; }); save(); }
  return html;
};

C.sheets = {
  place: () => `<h2>${t('Where are you shopping from?')}</h2>
    ${Object.keys(PLACES).map(k => radio('c-place-set', k, S.place, esc(placeLabel(k)), k === 'home' ? t('Distances are worked out from here.') : t('Handy when you shop on the way back from work.'))).join('')}
    <p class="note">${t('Demo: two saved places. Live GPS is not used.')}</p>`
};

// ---------------- Actions ----------------
Object.assign(ACT, {
  'c-tab': (p, d) => tab(p, d.v),
  'c-open-search': p => { go(p, 'search', { q: '' }); focusSearch(p); },
  'c-quick': (p, d) => { go(p, 'search', { q: typeInfo(d.type).en }); },
  'c-sugg': (p, d) => { const r = route(p); r.type = d.type; r.q = ta() ? typeInfo(d.type).ta : typeInfo(d.type).en; renderPane(p); },
  'c-cat': (p, d) => go(p, 'search', { cat: d.c }),
  'c-vendor': (p, d) => go(p, 'vendor', { id: d.id }),
  'c-product': (p, d) => go(p, 'product', { type: d.type, id: d.id }),
  'c-pick': (p, d) => { route(p).id = d.id; renderPane(p); },
  'c-qty': (p, d) => {
    const l = listingById(d.id); if (!l) return;
    const step = UNITS[l.unit].step;
    const cur = p.ui.qty[l.id] || 1;
    p.ui.qty[l.id] = Math.min(Math.max(step, roundQty(cur + d.d * step)), l.stock);
    renderPane(p);
  },
  'c-add': (p, d) => {
    const l = listingById(d.id); if (!l) return;
    const q = Math.min(p.ui.qty && p.ui.qty[l.id] || 1, l.stock);
    addToCart(l.id, q);
    toast(p, tf('Added {q} {item} from {shop}', { q: qtyLabel(q, l.unit), item: itemName(l), shop: shopName(vendorById(l.vendor)) }));
  },
  'c-add-q': (p, d) => {
    const l = listingById(d.id); if (!l) return;
    const q = Math.min(Number(d.q) || 1, l.stock);
    addToCart(l.id, q);
    toast(p, tf('Added {q} {item}', { q: qtyLabel(q, l.unit), item: itemName(l) }));
  },
  'c-reorder': (p, d) => {
    const o = orderById(d.id); if (!o) return;
    let added = 0, swapped = 0, missed = 0;
    o.items.forEach(i => {
      const l = listingById(i.lid);
      if (l && canBuy(l) && l.stock >= i.qty) { S.cart.push({ lid: l.id, qty: i.qty }); added++; return; }
      const bv = l && bestValue(l.type, i.qty);
      const alt = bv && bv.ranked.find(x => x.l.stock >= i.qty);
      if (alt) { S.cart.push({ lid: alt.l.id, qty: i.qty }); swapped++; } else missed++;
    });
    mergeCart();
    commit();
    tab(p, 'cart');
    toast(p, swapped || missed
      ? tf('{a} added, {s} from another vendor, {m} not available today', { a: added, s: swapped, m: missed })
      : t('Same items are in your cart'));
  },
  'c-cqty': (p, d) => { const l = listingById(d.id); const c = S.cart.find(x => x.lid === d.id); if (l && c) setCartQty(l.id, Math.min(roundQty(c.qty + d.d * UNITS[l.unit].step), Math.max(l.stock, c.qty))); },
  'c-remove': (p, d) => setCartQty(d.id, 0),
  'c-switch': (p, d) => { switchCartItem(d.id, d.to); toast(p, t('Switched vendor')); },
  'c-fit': (p, d) => { const l = listingById(d.id); if (l) setCartQty(l.id, l.stock); },
  'c-mode': (p, d, el) => { const vid = el.closest('[data-vid]').dataset.vid; S.cartMode[vid] = d.v; commit(); },
  'c-pay': (p, d) => { S.pay = d.v; commit(); },
  'c-order': (p, d) => go(p, 'order', { id: d.id }),
  'c-cancel': (p, d) => { setStatus(d.id, 'cancelled'); toast(p, t('Order cancelled')); },
  'c-rate': (p, d) => { rateOrder(d.id, Number(d.n)); toast(p, t('Thanks! Your rating helps other shoppers.')); },
  'c-fav': (p, d) => { S.favs = S.favs.includes(d.id) ? S.favs.filter(x => x !== d.id) : [...S.favs, d.id]; commit(); },
  'c-notes': p => go(p, 'notes'),
  'c-place': p => openSheet(p, 'place'),
  'c-place-set': (p, d) => { S.place = d.v; closeSheet(p); commit(); toast(p, tf('Showing vendors near {place}', { place: esc(placeLabel(d.v)) })); },
  'c-map-mode': (p, d) => { route(p).mode = d.v; renderPane(p); },
  'c-map-cat': (p, d) => { const r = route(p); r.cat = d.v || null; r.sel = null; renderPane(p); },
  'c-map-pin': (p, d) => { route(p).sel = d.id; renderPane(p); },
  'c-f-rated': p => { const r = route(p); r.rated = !r.rated; renderSearch(p); },
  'c-f-open': p => { const r = route(p); r.open = !r.open; renderSearch(p); },
  'c-f-deliv': p => { const r = route(p); r.deliv = !r.deliv; renderSearch(p); },
  'c-f-fast': p => { const r = route(p); r.fast = !r.fast; renderSearch(p); },
  'c-basket-q': (p, d) => {
    const b = S.basket.find(x => x.type === d.type); if (!b) return;
    const step = basketStep(b.type);
    b.qty = roundQty(Math.min(99, Math.max(step, b.qty + step * Number(d.v))));
    commit();
  },
  'c-basket-del': (p, d) => { S.basket = S.basket.filter(x => x.type !== d.type); commit(); },
  'c-basket-add': (p, d) => { if (!S.basket.some(x => x.type === d.type)) S.basket.push({ type: d.type, qty: basketDefault(d.type) }); commit(); },
  'c-basket-cart': p => {
    // Each basket item goes to the cart at its best-value shop, at the basket quantity.
    const shops = new Set(); let added = 0, skipped = 0;
    S.basket.forEach(b => {
      const pick = basketLine(b).pick;
      if (!pick) { skipped++; return; }
      const c = S.cart.find(x => x.lid === pick.l.id);
      if (c) c.qty = b.qty; else S.cart.push({ lid: pick.l.id, qty: b.qty });
      shops.add(pick.v.id); added++;
    });
    commit();
    toast(p, added
      ? tf('{items} from {shops} are in your cart', { items: plural(added, 'item', 'items'), shops: plural(shops.size, 'shop', 'shops') }) + (skipped ? ' ' + t('Some items are not available in that amount right now.') : '')
      : t('Nothing in your basket is in stock right now.'));
  },
  'c-f-clear': p => { Object.assign(route(p), { rated: false, open: false, deliv: false, stock: false, fast: false, dist: null, maxp: null, cat: null }); renderSearch(p); },
  'c-rev-open': (p, d) => { p.ui.rev = { kind: d.kind, id: d.id, stars: 0, text: '', name: S.me.name, err: '' }; renderPane(p); },
  'c-rev-close': p => { p.ui.rev = null; renderPane(p); },
  'c-rev-star': (p, d) => { if (p.ui.rev) { p.ui.rev.stars = Number(d.n); p.ui.rev.err = ''; renderPane(p); } },
  'c-f-stock': p => { const r = route(p); r.stock = !r.stock; renderSearch(p); },
  'c-f-dist': (p, d) => { const r = route(p); r.dist = r.dist === Number(d.v) ? null : Number(d.v); renderSearch(p); },
  'c-f-price': (p, d) => { const r = route(p); r.maxp = r.maxp === Number(d.v) ? null : Number(d.v); renderSearch(p); },
  'c-f-cat': (p, d) => { const r = route(p); r.cat = r.cat === d.v ? null : d.v; renderSearch(p); },
  'c-voice': p => voiceSearch(p),
  'c-list': p => go(p, 'list'),
  'c-list-sample': p => { S.list = SAMPLE_LIST; p.ui.planned = true; save(); renderPane(p); },
  'c-plan-use': (p, d) => {
    const plan = planTrip(readShoppingList(S.list).items)[d.k];
    plan.stops.forEach(st => st.lines.forEach(x => S.cart.push({ lid: x.l.id, qty: x.qty })));
    mergeCart();
    commit();
    tab(p, 'cart');
    toast(p, tf('Added from {v}', { v: plural(plan.stops.length, 'vendor', 'vendors') }));
  }
});
INPUT['c-list'] = (p, value) => { S.list = value; save(); };
FORM['c-list'] = p => { p.ui.planned = true; renderPane(p); };

function mergeCart() {
  const m = {};
  S.cart.forEach(c => { m[c.lid] = roundQty((m[c.lid] || 0) + c.qty); });
  S.cart = Object.entries(m).map(([lid, qty]) => ({ lid, qty }));
}

INPUT['c-q'] = (p, value) => { const r = route(p); r.q = value; r.type = null; renderSearch(p); };
INPUT['c-f'] = (p, value, el) => { p.form[el.name] = value; };
INPUT['c-rev-text'] = (p, value) => { if (p.ui.rev) p.ui.rev.text = value; };
INPUT['c-rev-name'] = (p, value) => { if (p.ui.rev) p.ui.rev.name = value; };
CHANGE['c-sort'] = (p, el) => {
  route(p).sort = el.value;
  renderSearch(p);
  const sel = p.el && p.el.querySelector('[data-ch="c-sort"]');   // keep keyboard focus on the menu
  if (sel) sel.focus();
};
FORM['c-review'] = p => {
  const rev = p.ui.rev;
  if (!rev) return;
  if (!rev.stars) { rev.err = t('Tap a star to rate it.'); return renderPane(p); }
  const name = (rev.name || '').trim() || S.me.name;
  if (rev.kind === 'shop') addVendorReview(rev.id, rev.stars, rev.text.trim(), name);
  else addListingReview(rev.id, rev.stars, rev.text.trim(), name);
  p.ui.rev = null;
  toast(p, t('Thanks! Your review is posted.'));
};
FORM['c-search'] = (p, form) => { const i = form.querySelector('input'); if (i) i.blur(); };
FORM['c-place-order'] = p => {
  const f = p.form;
  const name = (f.name || '').trim();
  const digits = (f.phone || '').replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '');
  if (name.length < 2) { f.err = t('Please enter your name so the vendor knows whose order it is.'); return renderPane(p); }
  if (!/^[6-9]\d{9}$/.test(digits)) { f.err = t('Mobile number should be 10 digits, starting with 6, 7, 8 or 9.'); return renderPane(p); }
  f.err = '';
  S.me.name = name;
  S.me.phone = digits.slice(0, 5) + ' ' + digits.slice(5);
  const ids = placeOrders({ name: S.me.name, phone: S.me.phone, me: true });
  if (!ids.length) { f.err = t('Nothing could be ordered. Check the items marked in red.'); return renderPane(p); }
  p.stack = [{ v: 'home' }, { v: 'placed', ids }];
  p.tab = 'orders';
  renderPane(p, true);
};

function renderSearch(p) {
  const box = p.el && p.el.querySelector('.sr');
  if (box && route(p).v === 'search') box.innerHTML = searchBody(p); else renderPane(p);
}

function focusSearch(p) {
  requestAnimationFrame(() => { const i = p.el && p.el.querySelector('[data-in="c-q"]'); if (i) i.focus(); });
}

// Voice input with the browser's own speech recognition (Chrome / Edge), in Tamil or English.
// Used for customer search and for the vendor's walk-in bill.
function listenInto(p, onText) {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return toast(p, t('Voice search needs Chrome or Edge. You can type instead.'));
  if (p.listening) { try { p.rec.stop(); } catch (e) {} return; }
  try {
    const rec = new SR();
    rec.lang = ta() ? 'ta-IN' : 'en-IN';
    rec.interimResults = false;
    rec.onresult = e => onText(e.results[0][0].transcript);
    rec.onerror = e => toast(p, e.error === 'not-allowed' || e.error === 'service-not-allowed'
      ? t('Microphone is blocked here. Open the app in its own browser tab to use voice.')
      : t('Didn’t catch that. Try again, or type.'));
    rec.onend = () => { p.listening = false; renderPane(p); };
    p.rec = rec;
    p.listening = true;
    rec.start();
    renderPane(p);
    toast(p, ta() ? t('Listening… say the item in Tamil') : t('Listening… say an item, like “tomato”'));
  } catch (e) {
    p.listening = false;
    toast(p, t('Voice search isn’t available here. You can type instead.'));
  }
}

function voiceSearch(p) {
  listenInto(p, said => {
    if (route(p).v !== 'search') go(p, 'search', { q: said }); else { route(p).q = said; route(p).type = null; }
    renderPane(p);
  });
}
