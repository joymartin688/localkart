# Daily needs flows: get-it-in times, fastest-to-get sort, 500 m filter, the daily basket.
# usage: python3 daily.py [OUTDIR]
import asyncio, sys, os, re
from playwright.async_api import async_playwright

OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), 'out')
os.makedirs(OUT, exist_ok=True)
URL = os.environ.get('LOCALKART_URL', 'http://localhost:8000/index.html')
fails = []

def check(name, ok, detail=''):
    print(('PASS ' if ok else 'FAIL ') + name + (f'  [{detail}]' if detail and not ok else ''))
    if not ok:
        fails.append(name)

def mins(texts):
    return [int(re.search(r'(\d+) min', x).group(1)) for x in texts if re.search(r'(\d+) min', x)]

async def run():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=os.environ.get('CHROME_PATH') or None, args=['--no-sandbox'])
        pg = await b.new_page(viewport={'width': 390, 'height': 844})
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)

        await pg.goto(URL); await pg.wait_for_timeout(400)
        check('landing says ready in about 15 minutes', 'about 15 minutes' in (await pg.inner_text('.landing .lead')))

        await pg.click('[data-a="start"][data-v="customer"]'); await pg.wait_for_timeout(300)

        # ---- home: basket and the shelf
        check('basket section on home', await pg.locator('.basket').count() == 1)
        check('basket starts with six lines', await pg.locator('.bk-line').count() == 6, str(await pg.locator('.bk-line').count()))
        bk_meta = await pg.locator('.bk-line .bk-meta').all_inner_texts()
        check('every basket line shows a price and minutes', len(bk_meta) == 6 and all(re.search(r'₹\d+ · \d+ min', x) for x in bk_meta), str(bk_meta))
        total = await pg.inner_text('.bk-total')
        check('basket shows an estimated total', total.startswith('About ₹'), total)
        shelf = await pg.locator('.quick-sec .icard-note').all_inner_texts()
        check('ready in 15 minutes shelf has items', len(shelf) >= 1, str(len(shelf)))
        check('shelf items are all within 15 minutes', all(m <= 15 for m in mins(shelf)), str(shelf))
        await pg.screenshot(path=f'{OUT}/01-home-basket.png', full_page=False)

        # quantity steps: milk goes from 2 to 3 packets
        before = await pg.locator('.bk-line').first.locator('output').inner_text()
        await pg.locator('.bk-line').first.locator('[data-v="1"]').click(); await pg.wait_for_timeout(150)
        after = await pg.locator('.bk-line').first.locator('output').inner_text()
        check('basket + step raises the quantity', before != after, f'{before} -> {after}')

        # remove curd
        # curd is at its smallest amount, so its minus button is a bin
        await pg.locator('.bk-line', has_text='Curd').locator('[data-a="c-basket-del"]').click(); await pg.wait_for_timeout(150)
        check('remove takes the line out', await pg.locator('.bk-line').count() == 5)

        # add rice from the quick chips
        await pg.locator('.bk-add [data-type="rice"]').click(); await pg.wait_for_timeout(150)
        check('quick-add chip adds rice to the basket', await pg.locator('.bk-line', has_text='Rice').count() == 1)

        # the state after the edits, from the app itself
        st = await pg.evaluate("() => S.basket.map(b => [b.type, b.qty])")
        check('basket state holds six items', len(st) == 6, str(st))

        # add all to cart: each line goes to its best-value shop at the basket quantity
        await pg.click('[data-a="c-basket-cart"]'); await pg.wait_for_timeout(250)
        cart = await pg.evaluate("() => S.cart.map(c => [c.lid, c.qty])")
        check('add all puts every shop-listed item in the cart', len(cart) == 6, str(cart))
        basket_qty = await pg.evaluate("() => S.basket.map(b => b.qty)")
        check('cart quantities match the basket', sorted(q for _, q in cart) == sorted(basket_qty), f'{cart} vs {basket_qty}')
        toast = await pg.inner_text('.toast') if await pg.locator('.toast').count() else ''
        check('confirmation toast names items and shops', 'in your cart' in toast, toast)

        # ---- search: ready-in sort and filter, next-door label, Tamil alias
        await pg.click('[data-a="tab"][data-v="search"]'); await pg.wait_for_timeout(200)
        await pg.fill('[data-in="c-q"]', 'arisi'); await pg.wait_for_timeout(300)
        names = await pg.locator('.group-t b').all_inner_texts()
        check('Tamil alias "arisi" finds rice', any('Rice' in n for n in names), str(names))

        await pg.fill('[data-in="c-q"]', 'rice'); await pg.wait_for_timeout(300)
        rows = await pg.locator('.offer:not(.dim) .eta b').all_inner_texts()
        check('rice has at least two live offers', len(rows) >= 2, str(rows))
        await pg.select_option('[data-ch="c-sort"]', 'fast'); await pg.wait_for_timeout(250)
        rows = await pg.locator('.offer:not(.dim) .eta b').all_inner_texts()
        seq = mins(rows)
        check('ready soonest sorts shortest time first', seq == sorted(seq) and len(seq) >= 2, f'{seq}')
        check('sort menu keeps the choice', await pg.locator('[data-ch="c-sort"]').input_value() == 'fast')

        await pg.click('[data-a="c-f-fast"]'); await pg.wait_for_timeout(250)
        rows = await pg.locator('.offer .eta b').all_inner_texts()
        check('ready in 15 min filter keeps only quick shops', len(rows) >= 1 and all(m <= 15 for m in mins(rows)), str(rows))
        await pg.click('[data-a="c-f-clear"]'); await pg.wait_for_timeout(200)

        await pg.click('[data-a="c-f-dist"][data-v="0.5"]'); await pg.wait_for_timeout(250)
        nd = await pg.locator('.offer .eta').all_inner_texts()
        check('within 500 m shows only next-door shops', len(nd) >= 1 and all('Next door' in x for x in nd), str(nd[:3]))
        summary = await pg.inner_text('.sum-line')
        check('summary uses singular for one offer', summary.startswith('1 offer ·') and '1 offers' not in summary, summary)
        await pg.screenshot(path=f'{OUT}/02-rice-next-door.png', full_page=False)
        await pg.click('[data-a="c-f-clear"]'); await pg.wait_for_timeout(200)

        # ---- Tamil: the new home sections translate
        await pg.evaluate("() => { S.lang = 'ta'; commit(); }"); await pg.wait_for_timeout(200)
        await pg.click('[data-a="tab"][data-v="home"]'); await pg.wait_for_timeout(250)
        heads = await pg.locator('.basket h2').all_inner_texts()
        check('basket heading in Tamil', 'அன்றாடக் கூடை' in ' '.join(heads), str(heads))
        await pg.screenshot(path=f'{OUT}/03-home-tamil.png', full_page=False)
        await pg.evaluate("() => { S.lang = 'en'; commit(); }"); await pg.wait_for_timeout(150)

        # ---- a phone-size full-page look at the home
        await pg.click('[data-a="tab"][data-v="home"]'); await pg.wait_for_timeout(200)
        await pg.screenshot(path=f'{OUT}/04-home-full.png', full_page=True)

        # ---- more than the shops hold: the line says so, and doesn't say nobody has it
        await pg.evaluate("() => { S.basket.find(b => b.type === 'rice').qty = 50; commit(); }"); await pg.wait_for_timeout(200)
        await pg.click('[data-a="tab"][data-v="home"]'); await pg.wait_for_timeout(200)
        rice_line = await pg.locator('.bk-line', has_text='Rice').inner_text()
        check('basket says not enough stock, not nobody has it', 'Not enough in stock for this amount' in rice_line and 'Nobody' not in rice_line, rice_line)

        # ---- the new drawings: a search for oil and soap, shown together
        await pg.click('[data-a="tab"][data-v="search"]'); await pg.wait_for_timeout(200)
        await pg.fill('[data-in="c-q"]', 'oil'); await pg.wait_for_timeout(300)
        await pg.screenshot(path=f'{OUT}/05-oil.png', full_page=False)
        await pg.fill('[data-in="c-q"]', 'soap'); await pg.wait_for_timeout(300)
        await pg.screenshot(path=f'{OUT}/06-soap.png', full_page=False)
        check('soap search finds at least one offer', await pg.locator('.offer').count() >= 1)

        check('no page or console errors', not errs, '; '.join(errs[:3]))
        await b.close()

asyncio.run(run())
print('FAILURES:', fails if fails else 'none')
sys.exit(1 if fails else 0)
