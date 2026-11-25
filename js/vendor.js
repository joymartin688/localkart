// Vendor side. Written for someone who mostly uses WhatsApp: big buttons,
// +/- instead of typing, and one job per screen.

const V = {};
const myShop = () => vendorById(S.vendorId) || S.vendors[0];

V.tabs = () => [
  ['today', 'chart', t('Today')],
  ['orders', 'receipt', t('Orders'), S.orders.filter(o => o.vendor === myShop().id && o.status === 'placed').length],
  ['items', 'box', t('My items')],
  ['market', 'truck', t('Market')],
  ['shop', 'shop', t('My shop')]
];

const FRESH = ['', 'Picked this morning', 'From Koyambedu this morning', 'Cut this morning', 'Strung this morning', 'Home-made today'];
const HOURS = ['6–11 am, 4–9 pm', '6 am – 1 pm', '7 am – 9 pm', '4 – 9 pm', '5 am – 10 pm'];

// ---------------- Today ----------------
V.today = p => {
  const v = myShop();
  const st = vendorStats(v.id), tips = vendorTips(v.id);
  const latest = S.orders.filter(o => o.vendor === v.id).sort((a, b) => b.at - a.at).slice(0, 4);
  const low = listingsOf(v.id).filter(l => l.available && l.stock <= UNITS[l.unit].low).sort((a, b) => a.stock - b.stock).slice(0, 4);
  const max = st.top.length ? st.top[0].amt : 1;
  const plan = buyingList(v.id);
  return `<header class="vhead">${stall(v, 46)}<div><p class="hello">${t('Vanakkam')}, ${esc(v.owner.split(' ')[0])}</p><h1>${shopName(v)}</h1></div></header>
  <div class="pad stack-gap">
    ${sw('v-open', v.open, v.open ? t('Open — customers can order') : t('Closed — customers can’t order'))}
    ${st.fresh ? `<button class="newbox" data-a="v-tab" data-v="orders">${icon('bell')}<span><b>${st.fresh === 1 ? t('1 new order') : tf('{n} new orders', { n: st.fresh })}</b><small>${t('Tap to see and accept')}</small></span>${icon('next')}</button>` : ''}
    <div class="tiles">
      <div class="tile money"><small>${t("Today's earnings")}</small><b class="count" data-n="${st.earned}">${money(st.earned)}</b>
        <span>${tf('from {n} completed orders', { n: st.done })}</span>
        ${st.pendingMoney ? `<span class="soft">${tf('+ {m} in open orders', { m: money(st.pendingMoney) })}</span>` : ''}</div>
      <div class="tile"><small>${t('Orders today')}</small><b>${st.count}</b>
        <span>${tf('{d} done · {o} open', { d: st.done, o: st.open })}</span>
        ${st.walkins ? `<span>${tf('incl. {n} walk-in sales', { n: st.walkins })}</span>` : ''}
        <span class="soft">${tf('Yesterday you earned {m}', { m: money(st.yEarned) })}</span></div>
    </div>
    ${st.spent || st.rescued ? `<div class="statrow">${st.spent ? `<span>${icon('truck')}${t('Spent at market')} <b>${money(st.spent)}</b></span>` : ''}${st.rescued ? `<span>${icon('leaf')}${t('Sold in clearance, not wasted')} <b>${money(st.rescued)}</b></span>` : ''}</div>` : ''}
    <div class="easy-only bigbtns">
      <button class="btn big" data-a="v-tab" data-v="orders">${icon('receipt')}${t('Orders')}</button>
      <button class="btn big" data-a="v-tab" data-v="items">${icon('tag')}${t('Change prices and stock')}</button>
    </div>
    <section class="card qbill">
      <h2 class="card-t">${icon('cash')}${t('Sold something at the cart?')}</h2>
      <form data-form="v-bill" class="qb-row" autocomplete="off">
        <input data-in="v-bill" value="${esc(p.ui.bill || '')}" placeholder="${esc(t('e.g. 2 kg thakkali, 1 kattu malli'))}" aria-label="${t('What did you sell?')}">
        <button class="icon-btn mic" type="button" data-a="v-bill-voice" aria-label="${t('Say it')}">${icon('mic')}</button>
      </form>
      <div class="qb-prev">${billPreview(p)}</div>
    </section>
    ${tips.length ? `<section class="card tips"><h2 class="card-t">${icon('bulb')}${t('Tips from your sales')}</h2>
      <ul>${tips.map(x => `<li class="tip-${x.k}">${x.text}${x.k === 'low' ? ` <button class="link" data-a="v-edit" data-id="${x.lid}">${t('Update stock')}</button>` : ''}${x.k === 'clear' ? ` <button class="link" data-a="v-clear" data-v="20">${t('Start 20% clearance')}</button>` : ''}</li>`).join('')}</ul>
      <p class="note">${t('Worked out from your own orders on LocalKart (demo data).')}</p></section>` : ''}
    <button class="card marketcard" data-a="v-tab" data-v="market">${icon('truck')}<span><b>${t('Tomorrow’s market list')}</b>
      <small>${plan.lines.length ? tf('{a} from {b} · carry {m}', { a: plural(plan.lines.length, 'item', 'items'), b: plural(plan.groups.length, 'trader', 'traders'), m: money(plan.cash) }) : t('You have enough stock for tomorrow')}${openPOs(v.id).length ? ' · ' + plural(openPOs(v.id).length, 'order to collect', 'orders to collect') : ''}</small></span>${icon('next')}</button>
    <section class="card"><h2 class="card-t">${icon('fire')}${t('Evening clearance')}</h2>
      ${seg('v-clear', v.clear || 0, [[0, t('Off')], [10, '10%'], [20, '20%'], [30, '30%']])}
      <p class="note">${v.clear ? tf('Fresh items are {p}% off right now. Shoppers nearby see it on their home screen.', { p: v.clear }) : t('Mark fresh items down in the evening so they sell today instead of being thrown away.')}</p></section>
    ${st.top.length ? `<section class="card adv"><h2 class="card-t">${t('Selling best today')}</h2>
      ${st.top.map(x => `<div class="hbar"><span>${itemName(x.l)}</span><span class="hbar-t"><i style="width:${(x.amt / max) * 100}%"></i></span><b>${money(x.amt)}</b></div>`).join('')}</section>` : ''}
    ${low.length ? `<section class="card"><h2 class="card-t">${t('Running low')}</h2>
      ${low.map(l => `<div class="lowrow">${itemPic(l, 'sm')}<span><b>${itemName(l)}</b><small>${tf('{q} left', { q: qtyLabel(l.stock, l.unit) })}</small></span>${stepper('v-stock', l.id, l.stock, l.unit)}</div>`).join('')}</section>` : ''}
    ${latest.length ? `<section class="card adv"><div class="sec-h"><h2 class="card-t">${t('Latest orders')}</h2><button class="link" data-a="v-tab" data-v="orders">${t('All orders')}</button></div>
      ${latest.map(o => `<button class="orow" data-a="v-order" data-id="${o.id}"><span><b>${custName(o)}</b><small>${o.id} · ${timeAgo(o.at)}</small></span><span class="st st-${o.status}">${statusLabel(o.status, o.mode)}</span><b>${money(orderTotal(o))}</b></button>`).join('')}</section>` : ''}
  </div>`;
};

// ---------------- Orders ----------------
const ORDER_TABS = {
  new: o => o.status === 'placed',
  active: o => ['accepted', 'preparing', 'ready', 'out'].includes(o.status),
  done: o => ['completed', 'rejected', 'cancelled'].includes(o.status)
};

V.orders = p => {
  const v = myShop();
  const mine = S.orders.filter(o => o.vendor === v.id).sort((a, b) => b.at - a.at);
  const r = route(p);
  const n = k => mine.filter(ORDER_TABS[k]).length;
  const tabKey = r.tab || (n('new') ? 'new' : 'active');
  const list = mine.filter(ORDER_TABS[tabKey]).slice(0, 30);
  return head(t('Orders'), { sub: shopName(v) }) + `<div class="pad">
    ${seg('v-otab', tabKey, [['new', tf('New ({n})', { n: n('new') })], ['active', tf('In progress ({n})', { n: n('active') })], ['done', t('Done')]])}</div>
    <div class="pad stack-gap">${list.map(o => vOrderCard(p, o)).join('') ||
      empty(`<span class="pic xl">${art('onion')}</span>`, tabKey === 'new' ? t('No new orders right now') : t('Nothing here'),
        tabKey === 'new' ? t('New orders pop up here and on the Today screen.') : '', '')}</div>`;
};

function vActions(p, o) {
  if (o.status === 'placed') {
    if (p.ui.rej === o.id) {
      return `<div class="confirm"><p>${t('Say no to this order? The customer is told and the stock goes back.')}</p>
        <div class="row2"><button class="btn ghost" data-a="v-rej-cancel">${t('Keep it')}</button><button class="btn danger" data-a="v-status" data-id="${o.id}" data-s="rejected">${t('Yes, say no')}</button></div></div>`;
    }
    return `<div class="row2"><button class="btn ghost danger" data-a="v-status" data-id="${o.id}" data-s="rejected">${icon('x')}${t('Can’t take')}</button>
      <button class="btn primary" data-a="v-status" data-id="${o.id}" data-s="accepted">${icon('check')}${t('Accept')}</button></div>`;
  }
  const next = { accepted: ['preparing', t('Start packing')], preparing: o.mode === 'delivery' ? ['out', t('Out for delivery')] : ['ready', t('Ready for pickup')],
    ready: ['completed', t('Handed over and paid')], out: ['completed', t('Delivered and paid')] }[o.status];
  return next ? `<button class="btn primary wide" data-a="v-status" data-id="${o.id}" data-s="${next[0]}">${next[1]}</button>` : '';
}

function vOrderCard(p, o) {
  return `<div class="card vo ${o.status === 'placed' ? 'isnew' : ''}">
    <button class="vo-h" data-a="v-order" data-id="${o.id}">
      <span><b>${custName(o)}</b><small>${o.id} · ${timeAgo(o.at)}</small></span>
      <span class="pill">${icon(o.mode === 'delivery' ? 'bike' : o.mode === 'walkin' ? 'cash' : 'walk')}${o.mode === 'delivery' ? t('Delivery') : o.mode === 'walkin' ? t('Cash') : t('Pickup')}</span></button>
    <ul class="vo-items">${o.items.map(i => `<li><span>${esc(ta() ? i.ta || i.name : i.name)}</span><b>${qtyLabel(i.qty, i.unit)}</b></li>`).join('')}</ul>
    <div class="vo-f"><b>${money(orderTotal(o))}</b><span class="st st-${o.status}">${statusLabel(o.status, o.mode)}</span></div>
    ${vActions(p, o)}
  </div>`;
}

V.order = p => {
  const o = orderById(route(p).id);
  if (!o) return head(t('Order'), { back: true }) + empty('', t('Order not found.'), '', '');
  return head(tf('Order {id}', { id: o.id }), { back: true, sub: custName(o) + ' · ' + timeAgo(o.at) }) + `<div class="pad stack-gap">
    ${vOrderCard(p, o)}
    ${o.status === 'rejected' || o.status === 'cancelled' ? '' : invoiceHtml(o)}
    <div class="card"><h2 class="card-t">${t('Customer')}</h2>
      ${o.mode === 'walkin' ? `<p class="meta">${icon('cash')}${t('Walk-in sale, paid in cash at the cart')}</p>` : `
      <p class="meta">${icon('user')}${esc(o.cust.name)}</p><p class="meta">${icon('phone')}${esc(o.cust.phone)}</p>
      <p class="meta">${icon('tag')}${o.pay === 'upi' ? t('UPI (demo, nothing charged)') : t('Pays at the stall')}</p>`}</div>
    <div class="card"><h2 class="card-t">${t('What happened')}</h2>
      <ol class="hist">${o.history.map(h => `<li><b>${statusLabel(h.s, o.mode)}</b><span>${clock(h.t)}</span></li>`).join('')}</ol></div>
    <button class="btn ghost" data-a="v-copy-bill" data-id="${o.id}">${icon('copy')}${t('Copy bill for WhatsApp')}</button>
  </div>`;
};

function billText(o) {
  const v = vendorById(o.vendor);
  const lines = o.items.map(i => `${i.name} ${qtyLabel(i.qty, i.unit)} x ${money(i.price)} = ${money(lineTotal(i))}`);
  return [v.shop, v.spot, `Bill ${o.id} · ${new Date(o.at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}`, '',
    ...lines, o.fee ? `Delivery ${money(o.fee)}` : '', `Total ${money(orderTotal(o))}`, o.pay === 'upi' ? 'Paid by UPI' : 'Pay at the stall', '', 'Thank you! (LocalKart)']
    .filter((x, i, a) => x !== '' || a[i - 1] !== '').join('\n');
}

// ---------------- Items ----------------
V.items = p => {
  const v = myShop();
  const list = listingsOf(v.id);
  const add = `<button class="btn primary small" data-a="v-new">${icon('plus')}${t('Add item')}</button>`;
  if (!list.length) {
    return head(t('My items'), { right: add }) + `<div class="pad">${empty(`<span class="pic xl">${art(CAT_ART[v.cat] || 'tomato', v.cat)}</span>`,
      t('What are you selling today?'), t('Tap an item to add it. You can change the price any time.'), '')}
      <div class="picker">${pickerTiles(v.cat).slice(0, 9).join('')}</div></div>`;
  }
  return head(t('My items'), { sub: t('Change today’s price with − and +'), right: add }) + `<div class="pad stack-gap">
    ${list.map(l => `<div class="card vitem ${l.available ? '' : 'off'}">
      <div class="vi-top">${itemPic(l, 'sm')}<div class="vi-n"><b>${itemName(l)}</b><small>${tf('per {u}', { u: unitLabel(l.unit) })}${l.fresh ? ' · ' + esc(t(l.fresh)) : ''}</small></div>
        <button class="icon-btn" data-a="v-edit" data-id="${l.id}" aria-label="${t('Edit')} ${itemName(l)}">${icon('edit')}</button></div>
      <div class="vi-ctl">
        <div class="vi-c"><small>${t('Price')}</small><div class="step price">
          <button data-a="v-price" data-id="${l.id}" data-d="-1" aria-label="${t('Lower price')}">${icon('minus')}</button>
          <span class="step-q">${money(l.price)}</span>
          <button data-a="v-price" data-id="${l.id}" data-d="1" aria-label="${t('Raise price')}">${icon('plus')}</button></div></div>
        <div class="vi-c"><small>${t('Stock')}</small>${stepper('v-stock', l.id, l.stock, l.unit)}</div>
      </div>
      ${sw('v-avail', l.available, l.available ? t('Selling today') : t('Not selling today'), l.id)}
      ${l.available && l.stock <= 0 ? `<p class="err">${t('Sold out. Customers see “Out today” and are shown other vendors.')}</p>` : ''}
    </div>`).join('')}</div>`;
};

function pickerTiles(cat) {
  const have = new Set(listingsOf(myShop().id).map(l => l.type));
  return Object.keys(CATALOG).filter(k => !have.has(k))
    .sort((a, b) => (CATALOG[b].cat === cat) - (CATALOG[a].cat === cat))
    .map(k => `<button class="ptile" data-a="v-new-type" data-type="${k}"><span class="pic sm">${art(k)}</span><span>${esc(ta() ? CATALOG[k].ta : CATALOG[k].en)}</span></button>`);
}

function areaAvg(type) {
  const others = S.listings.filter(l => l.type === type && l.vendor !== myShop().id);
  return others.length ? Math.round(others.reduce((a, l) => a + l.price, 0) / others.length) : null;
}

V.edit = p => {
  const f = p.form;
  const v = myShop();
  if (!f.id && !f.type && !f.custom) {
    return head(t('Add item'), { back: true }) + `<div class="pad"><p class="note">${t('Pick what you are adding. Your usual items come first.')}</p>
      <div class="picker">${pickerTiles(v.cat).join('')}
      <button class="ptile other" data-a="v-custom"><span class="pic sm">${icon('plus')}</span><span>${t('Something else')}</span></button></div></div>`;
  }
  const avg = f.type && !f.custom ? areaAvg(f.type) : null;
  const mp = f.type && !f.custom ? marketPrice(f.type, f.unit) : null;
  const step = UNITS[f.unit].step;
  return head(f.id ? t('Edit item') : t('Add item'), { back: true }) + `<div class="pad stack-gap edit">
    <div class="ed-pic">${f.photo ? `<img class="pic xl photo" src="${f.photo}" alt="">` : `<span class="pic xl">${art(f.type, f.cat)}</span>`}
      <div class="ed-pa"><label class="btn ghost small">${icon('camera')}${f.photo ? t('Change photo') : t('Add a photo')}<input type="file" accept="image/*" data-ch="v-photo" class="vh"></label>
      ${f.photo ? `<button class="btn ghost small" data-a="v-photo-del">${t('Use drawing')}</button>` : ''}</div></div>
    ${f.custom ? `<label class="field"><span>${t('Item name')}</span><input data-in="v-f" name="name" value="${esc(f.name || '')}" placeholder="${t('e.g. Raw banana')}" maxlength="40"></label>
      <label class="field"><span>${t('Name in Tamil (optional)')}</span><input data-in="v-f" name="ta" value="${esc(f.ta || '')}" placeholder="வாழைக்காய்" maxlength="40"></label>
      <div class="field"><span>${t('Type')}</span><div class="chips wrap">${Object.keys(CATS).map(c => chip('v-f-cat', f.cat === c, catLabel(c), c)).join('')}</div></div>`
    : `<div><h2 class="prod-n">${esc(ta() ? f.ta : f.name)}</h2><p class="prod-o">${esc(ta() ? f.name : f.ta)}</p>${!f.id ? `<button class="link" data-a="v-repick">${t('Pick a different item')}</button>` : ''}</div>`}
    <div class="field"><span>${tf('Price per {u}', { u: unitLabel(f.unit) })}</span>
      <div class="bigprice"><button data-a="v-f-price" data-d="-1" aria-label="${t('Lower price')}">${icon('minus')}</button>
        <label>₹<input data-in="v-f" name="price" inputmode="numeric" value="${esc(f.price)}" aria-label="${t('Price')}"></label>
        <button data-a="v-f-price" data-d="1" aria-label="${t('Raise price')}">${icon('plus')}</button></div>
      ${avg ? `<small class="hint">${tf('Others nearby charge about ₹{a}', { a: avg })}</small>` : ''}
      ${mp ? `<small class="hint">${tf('Wholesale about ₹{w} · your margin {m}%', { w: fmtRs(mp), m: Math.round((1 - mp / (Number(f.price) || 1)) * 100) })}</small>` : ''}</div>
    <div class="field"><span>${t('Sold by')}</span><div class="chips wrap">${Object.keys(UNITS).map(u => chip('v-f-unit', f.unit === u, unitLabel(u), u)).join('')}</div></div>
    <div class="field"><span>${t('How much do you have?')}</span>
      <div class="row2">${stepper('v-f-stock', 'f', f.stock, f.unit)}
        <div class="chips">${[5, 10].map(n => `<button class="chip" data-a="v-f-add" data-v="${n * step * (f.unit === 'kg' ? 4 : 1)}">+${qtyLabel(n * step * (f.unit === 'kg' ? 4 : 1), f.unit)}</button>`).join('')}</div></div></div>
    <div class="field"><span>${t('Freshness note (optional)')}</span><div class="chips wrap">${FRESH.map(x => chip('v-f-fresh', (f.fresh || '') === x, x ? t(x) : t('None'), x)).join('')}</div></div>
    ${sw('v-f-avail', f.available, t('Selling today'))}
    ${f.err ? `<p class="err" role="alert">${f.err}</p>` : ''}
    <button class="btn primary big" data-a="v-save">${icon('check')}${t('Save')}</button>
    ${f.id ? (p.ui.del === f.id
      ? `<div class="confirm"><p>${t('Remove this item from your shop? Customers will not see it any more.')}</p><div class="row2"><button class="btn ghost" data-a="v-del-cancel">${t('Keep it')}</button><button class="btn danger" data-a="v-del">${t('Yes, remove')}</button></div></div>`
      : `<button class="btn ghost danger" data-a="v-del">${icon('trash')}${t('Remove item')}</button>`) : ''}
  </div>`;
};

// ---------------- Market: tomorrow's buying list ----------------
const snap = (x, u) => { const st = UNITS[u] ? UNITS[u].step : 1; return Math.max(0, Math.round(x / st) * st); };

V.market = p => {
  const v = myShop(), plan = buyingList(v.id);
  const bought = (S.purchases || []).filter(x => x.vendor === v.id && isToday(x.at));
  const skipWhy = sk => ({ home: t('made at your stall'), nosource: t('no wholesale quote yet'), nosales: t('no sales in the last 7 days'),
    ordered: tf('on order ({q} coming)', { q: sk.coming ? qtyLabel(sk.coming, sk.l.unit) : '' }),
    enough: tf('enough stock ({q} left at closing)', { q: sk.left != null ? qtyLabel(snap(sk.left, sk.l.unit), sk.l.unit) : '' }) }[sk.why]);
  const pos = openPOs(v.id);
  const mineTr = myTraders(v.id);
  const trName = id => esc((TRADERS.find(x => x.id === id) || {}).name || '');
  const poCard = po => `<div class="po" data-po="${po.id}">
      <div class="po-h"><span><b>${trName(po.trader)}</b><small>${po.id} · ${tf('sent {t}', { t: timeAgo(po.at) })} · ${plural(po.items.length, 'item', 'items')}</small></span><b>${money(po.cost)}</b></div>
      <p class="po-items">${po.items.map(i => `${esc(ta() ? i.ta : i.name)} ${qtyLabel(i.qty, i.unit)}`).join(' · ')}</p>
      <div class="row2"><button class="btn primary" data-a="v-po-recv" data-id="${po.id}">${icon('check')}${t('Received: add to stock')}</button>
        <button class="btn ghost small" data-a="v-po-copy" data-id="${po.id}" aria-label="${tf('Copy order {id} for WhatsApp', { id: po.id })}">${icon('copy')}${t('Copy')}</button>
        <button class="btn ghost small danger" data-a="v-po-cancel" data-id="${po.id}">${t('Cancel')}</button></div>
    </div>`;
  return head(t('Tomorrow at the market'), { sub: t('Worked out from your last 7 days of sales'),
    right: plan.lines.length ? `<button class="icon-btn" data-a="v-copy-list" aria-label="${t('Copy list for WhatsApp')}">${icon('copy')}</button>` : '' }) + `
  <div class="pad stack-gap">
    ${sw('v-fest', S.festival, S.festival ? t('Festival tomorrow: flowers, fruit and coconut × 1.5') : t('Festival tomorrow? Turn on to buy more flowers and fruit'))}
    ${plan.lines.length ? `<div class="cashbox">
        <div><small>${t('Cash to carry')}</small><b>${money(plan.cash)}</b><span>${tf('{a} from {b}', { a: plural(plan.lines.length, 'item', 'items'), b: plural(plan.groups.length, 'trader', 'traders') })}</span></div>
        <div><small>${t('If it all sells')}</small><b>+${money(plan.profit)}</b><span>${t('over what you pay')}</span></div></div>
      ${plan.saved > 0 ? `<p class="why">${icon('bulb')}<span>${tf('Going only by the lowest price per kg would cost {m} more. Lot size matters.', { m: money(plan.saved) })}</span></p>` : ''}`
    : `<div class="callout">${icon('check')}<span>${pos.length ? t('Nothing more to buy. Your orders to traders cover tomorrow.') : t('Nothing to buy for tomorrow. You have enough stock.')}</span></div>`}
    ${pos.length ? `<section class="card pos"><h2 class="card-t">${icon('truck')}${t('Orders to traders')}</h2>
      <p class="note">${t('Collect these at the market, then tap Received. Items on order are not bought twice.')}</p>
      ${pos.map(poCard).join('')}</section>` : ''}
    ${plan.groups.map(g => `<section class="card trader">
      <div class="tr-h"><span><b>${esc(g.tr.name)}</b><small>${esc(g.tr.area)} · ${esc(g.tr.hours)}</small></span><b>${money(g.cost)}</b></div>
      <button class="chip mytr ${mineTr.includes(g.tr.id) ? 'on' : ''}" data-a="v-mytr" data-tr="${g.tr.id}" aria-pressed="${mineTr.includes(g.tr.id)}">${mineTr.includes(g.tr.id) ? '★ ' + t('My regular trader') : '☆ ' + t('Mark as my regular trader')}</button>
      ${g.lines.map(x => `<div class="buyrow">${itemPic(x.l, 'sm')}<div class="br-b">
          <b>${itemName(x.l)} · ${qtyLabel(x.pick.qty, x.l.unit)}</b>
          <small>${tf('Sells about {d} a day · {left} left at closing', { d: qtyLabel(roundStep(x.d, x.l.unit), x.l.unit), left: qtyLabel(snap(x.left, x.l.unit), x.l.unit) })}</small>
          <small>${tf('₹{w}/{u} wholesale · you sell at ₹{s} · {m}% margin', { w: fmtRs(x.pick.price), u: unitShort(x.l.unit), s: x.l.price, m: Math.round((1 - x.pick.price / x.l.price) * 100) })}</small>
          ${x.why ? `<small class="br-why">${x.why}</small>` : ''}</div><b>${money(x.pick.cost)}</b></div>`).join('')}
      <div class="row2 tr-act"><button class="btn light" data-a="v-po-send" data-tr="${g.tr.id}">${icon('send')}${t('Send order')}</button>
        <button class="btn ghost" data-a="v-bought" data-tr="${g.tr.id}">${icon('check')}${t('Bought: add to my stock')}</button></div>
    </section>`).join('')}
    ${plan.skipped.length ? `<details class="card fold"><summary>${tf('Not on the list ({n})', { n: plan.skipped.length })}</summary>
      <ul class="skip">${plan.skipped.map(sk => `<li><b>${itemName(sk.l)}</b>: ${skipWhy(sk)}</li>`).join('')}</ul></details>` : ''}
    ${bought.length ? `<section class="card"><h2 class="card-t">${t('Bought today')}</h2>${bought.map(b => `<div class="sum"><span>${esc((TRADERS.find(x => x.id === b.trader) || {}).name || '')} · ${b.items.map(i => esc(ta() ? i.ta : i.name)).join(', ')}</span><b>${money(b.cost)}</b></div>`).join('')}</section>` : ''}
    <details class="card fold how"><summary>${t('How this list is worked out')}</summary>
      <p>${t('Daily sales = what you sold in the last 7 days (online orders and walk-in bills) ÷ 7. Fresh items are bought for 1 day, hardy vegetables for 3 days, packets for 7, plus 20% extra.')}</p>
      <p>${t('Traders sell in lots, so each amount is rounded up to their lot. A big crate is cheaper per kg, but for fresh items we count what would probably be thrown away as a cost. The trader with the lowest real cost is picked.')}</p>
      <p>${t('Wholesale prices here are sample figures for the demo.')}</p>
    </details>
  </div>`;
};

function custName(o) { return o.mode === 'walkin' ? t('Walk-in sale') : esc(o.cust.name); }

function billPreview(p) {
  const text = (p.ui.bill || '').trim();
  if (!text) return `<p class="note">${t('Type what you sold. It counts towards your stock, earnings and tomorrow’s market list.')}</p>`;
  const bill = readBill(myShop().id, text);
  return `${bill.lines.length ? `<ul class="qb-lines">${bill.lines.map(x => `<li><span>${itemName(x.l)} · ${qtyLabel(x.qty, x.l.unit)}</span><b>${money(x.qty * priceOf(x.l))}</b></li>`).join('')}</ul>` : ''}
    ${bill.unknown.length ? `<p class="err">${tf('Not in your items: {list}', { list: bill.unknown.map(esc).join(', ') })}</p>` : ''}
    ${bill.lines.length ? `<button class="btn primary wide" data-a="v-bill-save">${icon('check')}${tf('Add cash sale · {m}', { m: money(bill.total) })}</button>` : ''}`;
}

// ---------------- Shop and settings ----------------
V.shop = p => {
  const v = myShop();
  return head(t('My shop')) + `<div class="pad stack-gap">
    <div class="card vhero">${stall(v, 64)}<div><h2>${shopName(v)}</h2><p class="meta">${esc(v.owner)}</p><p class="meta">${rate(v)} (${v.nrating})</p></div></div>
    <div class="card facts">
      <p>${icon('pin')}<span>${esc(v.spot)}</span></p><p>${icon('phone')}<span>${esc(v.phone)}</span></p>
      <p class="note">${t('Customers see this phone number so they can call you.')}</p></div>
    <section class="card"><h2 class="card-t">${t('Easy mode')}</h2>
      ${sw('v-easy', S.easy, S.easy ? t('On — bigger buttons and text') : t('Off'))}
      <p class="note">${t('Bigger text, bigger buttons, fewer things on each screen.')}</p></section>
    <section class="card"><h2 class="card-t">${t('Language')}</h2>${seg('v-lang', S.lang, [['en', 'English'], ['ta', 'தமிழ்']])}</section>
    <section class="card"><h2 class="card-t">${t('Timings')}</h2><div class="chips wrap">${HOURS.map(h => chip('v-hours', v.hours === h, esc(h), h)).join('')}</div></section>
    <section class="card"><h2 class="card-t">${t('Delivery')}</h2>
      ${sw('v-deliv', !!v.delivery, v.delivery ? t('I deliver nearby') : t('Pickup only'))}
      ${v.delivery ? `<div class="field"><span>${t('Delivery fee')}</span><div class="chips wrap">${[0, 10, 15, 20].map(n => chip('v-dfee', v.delivery.fee === n, n ? money(n) : t('Free'), n)).join('')}</div></div>
        <div class="field"><span>${t('How far')}</span><div class="chips wrap">${[0.5, 1, 1.5, 2].map(n => chip('v-drad', v.delivery.km === n, n + ' km', n)).join('')}</div></div>` : ''}</section>
    <section class="card"><h2 class="card-t">${t('Demo accounts')}</h2><p class="note">${t('Switch between sample vendors to see their dashboards.')}</p>
      ${S.vendors.map(x => radio('v-switch', x.id, S.vendorId, shopName(x), esc(x.owner) + ' · ' + catLabel(x.cat))).join('')}
      <button class="btn ghost" data-a="v-register">${icon('plus')}${t('Register a new vendor')}</button></section>
  </div>`;
};

V.register = p => {
  const f = p.form;
  const mapPin = f.x != null ? `<g transform="translate(${f.x} ${f.y})"><path d="M0 0C-8 -10 -11 -14 -11 -20A11 11 0 1 1 11 -20C11 -14 8 -10 0 0Z" fill="#e4572e" stroke="#fff" stroke-width="2"/><circle cy="-20" r="4.5" fill="#fff"/></g>` : '';
  return head(t('Join LocalKart'), { back: true, sub: t('Takes about two minutes. Free for street vendors.') }) + `
  <form class="pad stack-gap" data-form="v-reg" novalidate>
    <label class="field"><span>${t('Your name')}</span><input data-in="v-f" name="owner" value="${esc(f.owner || '')}" autocomplete="name" maxlength="40"></label>
    <label class="field"><span>${t('Shop or cart name')}</span><input data-in="v-f" name="shop" value="${esc(f.shop || '')}" placeholder="${t('e.g. Ravi Vegetables')}" maxlength="40"></label>
    <label class="field"><span>${t('Mobile number')}</span><input data-in="v-f" name="phone" value="${esc(f.phone || '')}" inputmode="tel" autocomplete="tel"></label>
    <label class="field"><span>${t('UPI ID (optional)')}</span><input data-in="v-f" name="upi" value="${esc(f.upi || '')}" placeholder="${t('e.g. ravi.veg@okbank')}" autocapitalize="off" spellcheck="false">
      <small class="note">${t('Shown to customers who pay at your cart. LocalKart never takes money in this demo.')}</small></label>
    <div class="field"><span>${t('What do you sell?')}</span><div class="cats">${Object.keys(CATS).map(c =>
      `<button type="button" class="cat ${f.cat === c ? 'on' : ''}" data-a="v-reg-cat" data-c="${c}" aria-pressed="${f.cat === c}"><span class="cat-pic">${art(CAT_ART[c], c)}</span><span>${catLabel(c)}</span></button>`).join('')}</div></div>
    <div class="field"><span>${t('Where do you usually stand? Tap the map.')}</span>
      <div class="mapbox small">${streetMap([], null).replace('</svg>', mapPin + '</svg>').replace('<svg class="map"', '<svg class="map" data-a="v-reg-map"')}</div>
      <input data-in="v-f" name="spot" value="${esc(f.spot || '')}" placeholder="${t('Landmark, e.g. near the bus stop')}" aria-label="${t('Landmark')}" maxlength="60"></div>
    <div class="field"><span>${t('Timings')}</span><div class="chips wrap">${HOURS.map(h => chip('v-reg-hours', f.hours === h, esc(h), h)).join('')}</div></div>
    <div class="field"><span>${t('Can you deliver nearby?')}</span>${seg('v-reg-deliv', f.deliv ? 'yes' : 'no', [['no', t('No, pickup only')], ['yes', t('Yes, within 1 km')]])}</div>
    <div class="field"><span>${t('Photo of your cart (optional)')}</span>
      <div class="row2">${f.photo ? `<img class="stall photo" src="${f.photo}" alt="" style="width:56px;height:56px">` : ''}
      <label class="btn ghost small">${icon('camera')}${f.photo ? t('Change photo') : t('Add a photo')}<input type="file" accept="image/*" data-ch="v-reg-photo" class="vh"></label></div></div>
    ${f.err ? `<p class="err" role="alert">${f.err}</p>` : ''}
    <button class="btn primary big" type="submit">${t('Create my shop')}</button>
    <p class="note">${t('Demo: your shop is saved in this browser only. No documents or KYC are asked for.')}</p>
  </form>`;
};

// ---------------- Actions ----------------
function readPhoto(file, done) {
  if (!file || !/^image\//.test(file.type)) return;
  const fr = new FileReader();
  fr.onload = () => {
    const img = new Image();
    img.onload = () => {
      const s = 320, c = document.createElement('canvas');
      const k = Math.min(1, s / Math.max(img.width, img.height));
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      done(c.toDataURL('image/jpeg', 0.8));
    };
    img.src = fr.result;
  };
  fr.readAsDataURL(file);
}

function formFromType(type) {
  const c = CATALOG[type];
  const avg = areaAvg(type);
  return { type, name: c.en, ta: c.ta, cat: c.cat, unit: c.unit, price: avg || REF[type] || 20, stock: c.unit === 'kg' ? 5 : 10, fresh: '', available: true, photo: null };
}

Object.assign(ACT, {
  'v-tab': (p, d) => tab(p, d.v),
  'v-clear': (p, d) => { const v = myShop(); v.clear = Number(d.v); commit(); toast(p, v.clear ? tf('Clearance on: fresh items {p}% off', { p: v.clear }) : t('Clearance off')); },
  'v-fest': () => { S.festival = !S.festival; commit(); },
  'v-bought': (p, d) => { const c = markBought(myShop().id, d.tr); if (c) toast(p, tf('Stock updated. Spent {m}.', { m: money(c) })); },
  'v-po-send': (p, d) => {
    const po = sendPO(myShop().id, d.tr); if (!po) return;
    toast(p, tf('Order {id} saved for {tr}. Copy it to send on WhatsApp.', { id: po.id, tr: (TRADERS.find(x => x.id === po.trader) || {}).name || '' }));
  },
  'v-po-recv': (p, d) => { const po = receivePO(d.id); if (po) toast(p, tf('Stock updated from {id}. Spent {m}.', { id: po.id, m: money(po.cost) })); },
  'v-po-cancel': (p, d) => { cancelPO(d.id); toast(p, tf('Order {id} cancelled', { id: d.id })); },
  'v-po-copy': (p, d) => {
    const po = (S.pos || []).find(x => x.id === d.id); if (!po) return;
    const text = poText(po);
    const fallback = () => openSheet(p, 'bill', text);
    try { navigator.clipboard.writeText(text).then(() => toast(p, t('Order copied. Paste it in WhatsApp for the trader.')), fallback); } catch (e) { fallback(); }
  },
  'v-mytr': (p, d) => {
    const on = toggleTrader(myShop().id, d.tr);
    const name = (TRADERS.find(x => x.id === d.tr) || {}).name || '';
    toast(p, on ? tf('{tr} is now your regular trader', { tr: name }) : tf('{tr} removed from your regular traders', { tr: name }));
  },
  'v-copy-list': p => {
    const text = listText(myShop().id);
    const fallback = () => openSheet(p, 'bill', text);
    try { navigator.clipboard.writeText(text).then(() => toast(p, t('List copied. Paste it in WhatsApp for the trader.')), fallback); } catch (e) { fallback(); }
  },
  'v-bill-save': p => {
    const bill = readBill(myShop().id, p.ui.bill || '');
    if (!bill.lines.length) return;
    recordWalkIn(myShop().id, bill);
    p.ui.bill = '';
    renderPane(p);
    toast(p, tf('Cash sale of {m} added', { m: money(bill.total) }));
  },
  'v-bill-voice': p => listenInto(p, said => { p.ui.bill = said; renderPane(p); }),
  'v-open': p => { const v = myShop(); v.open = !v.open; commit(); toast(p, v.open ? t('You are open. Customers can order now.') : t('Closed. Customers can still see you but can’t order.')); },
  'v-status': (p, d) => {
    if (d.s === 'rejected' && p.ui.rej !== d.id) { p.ui.rej = d.id; return renderPane(p); }
    p.ui.rej = null;
    setStatus(d.id, d.s);
    toast(p, { accepted: t('Accepted. The customer can see it.'), preparing: t('Packing'), ready: t('Customer told it’s ready'),
      out: t('Customer told it’s on the way'), completed: t('Done. Added to today’s earnings.'), rejected: t('Order declined. Stock is back.') }[d.s]);
  },
  'v-rej-cancel': p => { p.ui.rej = null; renderPane(p); },
  'v-order': (p, d) => go(p, 'order', { id: d.id }),
  'v-otab': (p, d) => { route(p).tab = d.v; renderPane(p); },
  'v-price': (p, d) => { const l = listingById(d.id); if (l) updateListing(l.id, { price: l.price + Number(d.d) }); },
  'v-stock': (p, d) => { const l = listingById(d.id); if (l) updateListing(l.id, { stock: l.stock + Number(d.d) * UNITS[l.unit].step }); },
  'v-avail': (p, d) => { const l = listingById(d.id); if (l) updateListing(l.id, { available: !l.available }); },
  'v-edit': (p, d) => { const l = listingById(d.id); if (!l) return; p.form = { ...l, custom: !CATALOG[l.type] }; p.ui.del = null; go(p, 'edit', { id: l.id }); },
  'v-new': p => { p.form = { available: true, stock: 10, unit: 'kg', fresh: '', price: 20 }; go(p, 'edit', {}); },
  'v-new-type': (p, d) => { p.form = formFromType(d.type); if (route(p).v === 'edit') renderPane(p); else go(p, 'edit', {}); },
  'v-custom': p => { const v = myShop(); p.form = { custom: true, cat: v.cat, unit: 'kg', price: 20, stock: 5, fresh: '', available: true }; renderPane(p); },
  'v-repick': p => { p.form = { available: true, stock: 10, unit: 'kg', fresh: '', price: 20 }; renderPane(p); },
  'v-f-price': (p, d) => { const f = p.form; f.price = Math.max(1, (Number(f.price) || 0) + Number(d.d)); renderPane(p); },
  'v-f-unit': (p, d) => { p.form.unit = d.v; renderPane(p); },
  'v-f-stock': (p, d) => { const f = p.form; f.stock = Math.max(0, roundQty((Number(f.stock) || 0) + Number(d.d) * UNITS[f.unit].step)); renderPane(p); },
  'v-f-add': (p, d) => { const f = p.form; f.stock = roundQty((Number(f.stock) || 0) + Number(d.v)); renderPane(p); },
  'v-f-fresh': (p, d) => { p.form.fresh = d.v; renderPane(p); },
  'v-f-avail': p => { p.form.available = !p.form.available; renderPane(p); },
  'v-f-cat': (p, d) => { p.form.cat = d.v; renderPane(p); },
  'v-photo-del': p => { p.form.photo = null; renderPane(p); },
  'v-save': p => {
    const f = p.form, v = myShop();
    const price = Number(f.price);
    if (f.custom && !(f.name || '').trim()) { f.err = t('Please give the item a name.'); return renderPane(p); }
    if (!(price >= 1 && price <= 5000)) { f.err = t('Price should be between ₹1 and ₹5,000.'); return renderPane(p); }
    const name = (f.name || '').trim();
    const type = f.custom ? (f.type && !CATALOG[f.type] ? f.type : 'c-' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-')) : f.type;
    const data = { type, name, ta: (f.ta || '').trim() || name, cat: f.cat, unit: f.unit, price: Math.round(price), stock: Math.max(0, Number(f.stock) || 0),
      fresh: f.fresh || '', available: !!f.available, photo: f.photo || null };
    if (f.id) updateListing(f.id, data); else addListing(v.id, data);
    p.form = {};
    tab(p, 'items');
    toast(p, f.id ? t('Saved') : tf('{item} added. Customers can see it now.', { item: esc(ta() ? data.ta : data.name) }));
  },
  'v-del': p => {
    const f = p.form;
    if (p.ui.del !== f.id) { p.ui.del = f.id; return renderPane(p); }
    deleteListing(f.id); p.ui.del = null; p.form = {}; tab(p, 'items'); toast(p, t('Item removed'));
  },
  'v-del-cancel': p => { p.ui.del = null; renderPane(p); },
  'v-copy-bill': (p, d) => {
    const o = orderById(d.id); if (!o) return;
    const text = billText(o);
    const fallback = () => openSheet(p, 'bill', text);
    try { navigator.clipboard.writeText(text).then(() => toast(p, t('Bill copied. Paste it in WhatsApp.')), fallback); } catch (e) { fallback(); }
  },
  'v-easy': () => { S.easy = !S.easy; commit(); },
  'v-lang': (p, d) => { S.lang = d.v; commit(); },
  'v-hours': (p, d) => { myShop().hours = d.v; commit(); },
  'v-deliv': () => { const v = myShop(); v.delivery = v.delivery ? null : { fee: 10, km: 1 }; commit(); },
  'v-dfee': (p, d) => { myShop().delivery.fee = Number(d.v); commit(); },
  'v-drad': (p, d) => { myShop().delivery.km = Number(d.v); commit(); },
  'v-switch': (p, d) => { S.vendorId = d.v; p.ui = {}; commit(); tab(p, 'today'); },
  'v-register': p => { p.form = { cat: 'veg', hours: HOURS[0], deliv: false }; go(p, 'register'); },
  'v-reg-cat': (p, d) => { p.form.cat = d.c; renderPane(p); },
  'v-reg-hours': (p, d) => { p.form.hours = d.v; renderPane(p); },
  'v-reg-deliv': (p, d) => { p.form.deliv = d.v === 'yes'; renderPane(p); },
  'v-reg-map': (p, d, el, e) => {
    const svg = el.closest('svg'), r = svg.getBoundingClientRect();
    p.form.x = Math.round((e.clientX - r.left) / r.width * 440);
    p.form.y = Math.round((e.clientY - r.top) / r.height * 400);
    renderPane(p);
  }
});

CHANGE['v-photo'] = (p, el) => readPhoto(el.files[0], url => { p.form.photo = url; renderPane(p); });
CHANGE['v-reg-photo'] = (p, el) => readPhoto(el.files[0], url => { p.form.photo = url; renderPane(p); });
INPUT['v-f'] = (p, value, el) => { p.form[el.name] = value; };
INPUT['v-bill'] = (p, value) => { p.ui.bill = value; const box = p.el.querySelector('.qb-prev'); if (box) box.innerHTML = billPreview(p); };
FORM['v-bill'] = p => ACT['v-bill-save'](p);

FORM['v-reg'] = p => {
  const f = p.form;
  const digits = (f.phone || '').replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '');
  const need = [];
  if (!(f.owner || '').trim()) need.push(t('your name'));
  if (!(f.shop || '').trim()) need.push(t('a shop name'));
  if (!/^[6-9]\d{9}$/.test(digits)) need.push(t('a 10-digit mobile number'));
  if (f.x == null) need.push(t('your spot on the map'));
  if (f.upi && !/^[\w.\-]{2,}@[a-z]{2,}$/i.test(f.upi.trim())) need.push(t('a UPI ID like name@bank, or leave it empty'));
  if (need.length) { f.err = tf('Please add {list}.', { list: need.join(', ') }); return renderPane(p); }
  const id = 'v' + Date.now().toString(36);
  S.vendors.push({ id, owner: f.owner.trim(), shop: f.shop.trim(), shopTa: f.shop.trim(), cat: f.cat, x: f.x, y: f.y,
    spot: (f.spot || '').trim() || t('Near the marked spot'), phone: digits.slice(0, 5) + ' ' + digits.slice(5),
    rating: 5, nrating: 0, hours: f.hours, delivery: f.deliv ? { fee: 10, km: 1 } : null, prep: 10, since: new Date().getFullYear(),
    open: true, photo: f.photo || null, reviews: [], clear: 0, upi: (f.upi || '').trim() });
  S.vendorId = id;
  p.form = {};
  commit();
  tab(p, 'items');
  toast(p, t('Your shop is ready. Add what you are selling today.'));
};
