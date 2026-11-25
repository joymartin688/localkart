# Supplier purchase orders and regular traders (the Round 1 flow).
# usage: python3 po.py [OUTDIR]
import asyncio, sys, os, re
from playwright.async_api import async_playwright

OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), 'out')
os.makedirs(OUT, exist_ok=True)
URL = os.environ.get('LOCALKART_URL', 'http://localhost:8000/index.html')
fails = []

def check(name, ok, detail=''):
    print(('PASS ' if ok else 'FAIL ') + name + (f'  [{detail}]' if detail and not ok else ''))
    if not ok: fails.append(name)

async def run():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=os.environ.get('CHROME_PATH') or None, args=['--no-sandbox'])
        pg = await b.new_page(viewport={'width': 390, 'height': 844})
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
        await pg.goto(URL); await pg.wait_for_timeout(400)
        await pg.click('[data-a="start"][data-v="vendor"]'); await pg.wait_for_timeout(300)
        await pg.click('[data-a="tab"][data-v="market"]'); await pg.wait_for_timeout(300)

        groups = await pg.locator('.card.trader').count()
        check('market shows trader cards', groups >= 1, str(groups))
        check('every trader card has Send order', await pg.locator('[data-a="v-po-send"]').count() == groups)
        mine = await pg.locator('.mytr.on').all_inner_texts()
        check('Selvi has Kannan Traders as her regular trader', len(mine) == 1 and 'regular' in mine[0], str(mine))
        cash0 = await pg.evaluate("() => buyingList('selvi').cash")
        first = await pg.locator('.card.trader').first.locator('.tr-h b').first.inner_text()
        tr_id = await pg.locator('.card.trader').first.locator('[data-a="v-po-send"]').get_attribute('data-tr')
        sent_items = await pg.evaluate(f"() => buyingList('selvi').groups.find(g => g.tr.id === '{tr_id}').lines.map(x => [x.l.id, x.pick.qty, x.l.stock])")
        await pg.screenshot(path=f'{OUT}/01-market.png')

        # send an order
        await pg.locator('.card.trader').first.locator('[data-a="v-po-send"]').click(); await pg.wait_for_timeout(300)
        check('order card appears under Orders to traders', await pg.locator('.card.pos .po').count() == 1)
        po_text = await pg.locator('.card.pos .po').inner_text()
        check('order card names the trader and PO number', first in po_text and 'PO-101' in po_text, po_text[:120])
        check('that trader is no longer on the list', await pg.locator(f'[data-a="v-po-send"][data-tr="{tr_id}"]').count() == 0)
        cash1 = await pg.evaluate("() => buyingList('selvi').cash")
        check('cash to carry drops by the order', cash1 < cash0, f'{cash0} -> {cash1}')
        skipped = await pg.evaluate("() => buyingList('selvi').skipped.filter(s => s.why === 'ordered').length")
        check('ordered items are listed as on order', skipped == len(sent_items), f'{skipped} vs {len(sent_items)}')
        await pg.screenshot(path=f'{OUT}/02-order-sent.png')

        # copy for WhatsApp: clipboard or the fallback sheet; either way the text is right
        text = await pg.evaluate("() => poText(S.pos[0])")
        check('WhatsApp text has order, items and total', text.startswith('Order PO-101 from Selvi Vegetables') and 'Total ₹' in text and '- ' in text, text[:80])

        # Today shows the order waiting
        await pg.click('[data-a="tab"][data-v="today"]'); await pg.wait_for_timeout(250)
        mk = await pg.inner_text('.marketcard')
        check('Today says 1 order to collect', '1 order to collect' in mk, mk)

        # receive it
        await pg.click('[data-a="tab"][data-v="market"]'); await pg.wait_for_timeout(250)
        await pg.click('[data-a="v-po-recv"]'); await pg.wait_for_timeout(300)
        after = await pg.evaluate(f"() => {[[l, q] for l, q, s in sent_items]}.map(([id]) => listingById(id).stock)")
        expect = [round(s + q, 2) for (l, q, s) in sent_items]
        check('received order adds the ordered amounts to stock', [round(x, 2) for x in after] == expect, f'{after} vs {expect}')
        check('no open orders after receiving', await pg.locator('.card.pos').count() == 0)
        bought = await pg.locator('.card h2.card-t', has_text='Bought today').count()
        check('received order shows under Bought today', bought == 1)
        st = await pg.evaluate("() => S.pos[0].status")
        check('order status is received', st == 'received', st)

        # send and cancel: items come back on the list
        n_before = await pg.locator('[data-a="v-po-send"]').count()
        if n_before:
            tr2 = await pg.locator('[data-a="v-po-send"]').first.get_attribute('data-tr')
            await pg.locator('[data-a="v-po-send"]').first.click(); await pg.wait_for_timeout(250)
            await pg.click('[data-a="v-po-cancel"]'); await pg.wait_for_timeout(250)
            check('cancelled order puts the trader back on the list', await pg.locator(f'[data-a="v-po-send"][data-tr="{tr2}"]').count() == 1)
            check('cancelled order status', await pg.evaluate("() => S.pos[0].status") == 'cancelled')

        # regular trader rule: a pick is never more than 5% above the cheapest real cost
        ok = await pg.evaluate("""() => {
          const v = vendorById('selvi'); const keep = v.traders.slice(); let good = true;
          for (const set of [[], ['velu'], ['kannan'], ['velu', 'pasumai'], TRADERS.map(t => t.id)]) {
            v.traders = set;
            buyingList('selvi').lines.forEach(x => { if (x.pick.eff > x.opts[0].eff * 1.05 + 1e-6) good = false;
              if (x.pick !== x.opts[0] && !set.includes(x.pick.tr.id)) good = false; });
          }
          v.traders = keep; return good; }""")
        check('regular trader preferred only within 5% of the cheapest', ok)

        # toggle a regular trader from the screen
        if await pg.locator('.mytr:not(.on)').count():
            await pg.locator('.mytr:not(.on)').first.click(); await pg.wait_for_timeout(200)
            check('marking a regular trader saves it', len(await pg.evaluate("() => vendorById('selvi').traders")) == 2)

        # Tamil
        await pg.evaluate("() => { S.lang = 'ta'; commit(); }"); await pg.wait_for_timeout(200)
        if await pg.locator('[data-a="v-po-send"]').count():
            lbl = await pg.locator('[data-a="v-po-send"]').first.inner_text()
            check('Send order is in Tamil', 'ஆர்டர் அனுப்பு' in lbl, lbl)
        await pg.screenshot(path=f'{OUT}/03-market-tamil.png')

        check('no page or console errors', not errs, '; '.join(errs[:3]))
        await b.close()

asyncio.run(run())
print('FAILURES:', fails if fails else 'none')
sys.exit(1 if fails else 0)
