// Invoices for orders, in the GST-style layout from Round 1.
// Round 1 added a flat 5% GST. Fresh produce is mostly tax-free, so we don't make up tax
// figures here: prices are shown as they are, and the invoice says it is a demo.

function invoiceDate(t) {
  return new Date(t).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function invoiceText(o) {
  const v = vendorById(o.vendor);
  const rows = o.items.map(i => `${i.name}  ${qtyLabel(i.qty, i.unit)} x ${money(i.price)} = ${money(lineTotal(i))}`);
  return [
    `LocalKart invoice (demo) ${o.id}`,
    `${v.shop} · ${v.owner} · ${v.phone}`,
    v.spot,
    `Bill to: ${o.cust.name || 'Walk-in'}    Date: ${invoiceDate(o.at)}`,
    '',
    ...rows,
    o.fee ? `Delivery ${money(o.fee)}` : null,
    `Total ${money(orderTotal(o))}`,
    o.pay === 'upi' ? 'Payment: UPI (demo, nothing charged)' : 'Payment: at the stall',
    '',
    'Demo invoice. Not a valid GST bill. Prices include any tax.'
  ].filter(x => x !== null).join('\n');
}

// A collapsed card that opens into the invoice. Used on customer and vendor order pages.
function invoiceHtml(o) {
  const v = vendorById(o.vendor);
  return `<details class="card inv">
    <summary><span><b>${t('Invoice')}</b><small>${esc(o.id)} · ${invoiceDate(o.at)}</small></span>${icon('receipt')}</summary>
    <div class="inv-body">
      <div class="inv-from"><b>${shopName(v)}</b><small>${esc(v.owner)} · ${esc(v.spot)}</small><small>${esc(v.phone)}</small></div>
      <table class="inv-t"><tbody>
        ${o.items.map(i => `<tr><td>${esc(ta() ? i.ta || i.name : i.name)}</td><td>${qtyLabel(i.qty, i.unit)} × ${money(i.price)}</td><td class="r">${money(lineTotal(i))}</td></tr>`).join('')}
        ${o.fee ? `<tr><td colspan="2">${t('Delivery')}</td><td class="r">${money(o.fee)}</td></tr>` : ''}
      </tbody><tfoot><tr><th colspan="2">${t('Total')}</th><th class="r">${money(orderTotal(o))}</th></tr></tfoot></table>
      <p class="note">${t('Demo invoice. Not a valid GST bill. Prices include any tax.')}</p>
      <button class="btn small ghost" data-a="inv-copy" data-id="${esc(o.id)}">${icon('copy')}${t('Copy invoice text')}</button>
    </div>
  </details>`;
}

Object.assign(ACT, {
  'inv-copy': (p, d) => {
    const o = orderById(d.id);
    if (!o) return;
    const text = invoiceText(o);
    // Browsers can block copying (for example when opened from a file). Then show the text to select.
    const show = () => openSheet(p, 'bill', text);
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(() => toast(p, t('Invoice copied')), show);
    else show();
  }
});
