# Shopping flows: sort, rating filter, quick add, product and shop reviews, invoice, legal dialog.
# usage: python3 reviews.py [OUTDIR]
import asyncio, sys, os
from playwright.async_api import async_playwright

OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), 'out')
os.makedirs(OUT, exist_ok=True)
URL = os.environ.get('LOCALKART_URL', 'http://localhost:8000/index.html')
fails = []

def check(name, ok, detail=''):
    print(('PASS ' if ok else 'FAIL ') + name + (f'  [{detail}]' if detail and not ok else ''))
    if not ok:
        fails.append(name)

async def prices(pg, only_live=True):
    sel = '.group:first-of-type .offer' + (':not(.dim)' if only_live else '') + ' .slate'
    return await pg.evaluate(f"""() => [...document.querySelectorAll('{sel}')].map(e => parseInt(e.textContent.replace(/[^0-9]/g, '')))""")

async def run():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=os.environ.get('CHROME_PATH') or None, args=['--no-sandbox'])
        pg = await b.new_page(viewport={'width': 390, 'height': 844})
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)

        # ---- legal dialog on the landing page (no app open yet)
        await pg.goto(URL); await pg.wait_for_timeout(400)
        await pg.click('[data-a="legal"][data-k="privacy"]'); await pg.wait_for_timeout(200)
        h = await pg.inner_text('.dlg.legal h2') if await pg.locator('.dlg.legal h2').count() else ''
        check('legal dialog opens from landing', h == 'Privacy', h)
        await pg.click('.dlg.legal .btn'); await pg.wait_for_timeout(150)
        check('legal dialog closes', await pg.locator('.dlg.legal').count() == 0)
        check('landing says fourteen vendors', 'fourteen sample vendors' in (await pg.inner_text('.ldemo')))

        # ---- customer search: sort, filters, quick add
        await pg.click('[data-a="start"][data-v="customer"]'); await pg.wait_for_timeout(300)
        await pg.click('[data-a="tab"][data-v="search"]'); await pg.wait_for_timeout(200)
        await pg.fill('[data-in="c-q"]', 'tomato'); await pg.wait_for_timeout(250)
        sumline = await pg.inner_text('.sum-line')
        check('summary line shows offers and vendors', 'offers' in sumline and 'vendors' in sumline, sumline)

        await pg.select_option('[data-ch="c-sort"]', 'price-asc'); await pg.wait_for_timeout(200)
        pa = await prices(pg)
        check('sort price low to high', pa == sorted(pa) and len(pa) >= 2, str(pa))
        focus = await pg.evaluate("document.activeElement && document.activeElement.dataset.ch")
        check('sort keeps keyboard focus on the menu', focus == 'c-sort', str(focus))

        await pg.select_option('[data-ch="c-sort"]', 'price-desc'); await pg.wait_for_timeout(200)
        pd = await prices(pg)
        check('sort price high to low', pd == sorted(pd, reverse=True) and len(pd) >= 2, str(pd))

        await pg.select_option('[data-ch="c-sort"]', 'rating'); await pg.wait_for_timeout(200)
        ratings = await pg.evaluate("""() => [...document.querySelectorAll('.group:first-of-type .offer:not(.dim) .rate')].map(e => e.classList.contains('new') ? 0 : parseFloat(e.textContent))""")
        check('sort by customer rating (in-stock first)', ratings == sorted(ratings, reverse=True) and len(ratings) >= 2, str(ratings))

        before = await pg.locator('.group:first-of-type .offer').count()
        await pg.click('[data-a="c-f-rated"]'); await pg.wait_for_timeout(200)
        after_rows = await pg.evaluate("""() => [...document.querySelectorAll('.group:first-of-type .offer .rate')].map(e => e.classList.contains('new') ? 0 : parseFloat(e.textContent))""")
        n_after = await pg.locator('.group:first-of-type .offer').count()
        check('"4 and up" keeps only products rated 4+', n_after <= before and all(r >= 4 for r in after_rows) and n_after >= 1,
              f'before {before} after {n_after} {after_rows}')
        check('clear all chip appears when a filter is on', await pg.locator('[data-a="c-f-clear"]').count() == 1)

        await pg.click('[data-a="c-f-clear"]'); await pg.wait_for_timeout(200)
        check('clear all restores the full list', await pg.locator('.group:first-of-type .offer').count() == before)
        check('clear all chip goes away', await pg.locator('[data-a="c-f-clear"]').count() == 0)

        await pg.click('[data-a="c-f-open"]'); await pg.wait_for_timeout(150)
        check('open-now filter hides closed shops', await pg.locator('.group:first-of-type .pill.shut').count() == 0)
        await pg.click('[data-a="c-f-clear"]'); await pg.wait_for_timeout(150)

        cart_before = await pg.locator('[data-a="tab"][data-v="cart"] .dotn').count()
        await pg.locator('.offer-add').first.click(); await pg.wait_for_timeout(250)
        cart_now = await pg.inner_text('[data-a="tab"][data-v="cart"] .dotn') if await pg.locator('[data-a="tab"][data-v="cart"] .dotn').count() else '0'
        check('quick add puts an item in the cart', cart_now not in ('', '0') and cart_before == 0, f'before {cart_before} now {cart_now}')
        await pg.screenshot(path=f'{OUT}/01-search-sort-filters.png')

        # ---- product page: rating, write a review
        await pg.click('.group-h'); await pg.wait_for_timeout(250)
        await pg.locator('.reviews').first.scroll_into_view_if_needed(); await pg.wait_for_timeout(150)
        await pg.click('[data-a="c-rev-open"][data-kind="item"]'); await pg.wait_for_timeout(150)
        await pg.click('.rv-form button[type="submit"]'); await pg.wait_for_timeout(150)
        err = await pg.inner_text('.rv-form .err') if await pg.locator('.rv-form .err').count() else ''
        check('review needs a star rating', 'star' in err.lower(), err)
        await pg.click('[data-a="c-rev-star"][data-n="4"]'); await pg.wait_for_timeout(120)
        await pg.fill('[data-in="c-rev-text"]', 'Tested review: firm and fresh.'); await pg.wait_for_timeout(80)
        await pg.click('.rv-form button[type="submit"]'); await pg.wait_for_timeout(250)
        mine = await pg.locator('.review.mine').count()
        check('posted product review appears as mine', mine == 1, str(mine))
        check('product review text saved', 'Tested review' in (await pg.inner_text('.review.mine')))
        await pg.locator('.reviews').first.screenshot(path=f'{OUT}/02-product-reviews.png')

        # ---- shop rating
        await pg.click('[data-a="c-vendor"][data-id="selvi"]'); await pg.wait_for_timeout(250)
        await pg.locator('.reviews').first.scroll_into_view_if_needed()
        before_shop = await pg.inner_text('.reviews .rv-big small')
        await pg.click('[data-a="c-rev-open"][data-kind="shop"]'); await pg.wait_for_timeout(120)
        await pg.click('[data-a="c-rev-star"][data-n="5"]'); await pg.wait_for_timeout(100)
        await pg.click('.rv-form button[type="submit"]'); await pg.wait_for_timeout(250)
        after_shop = await pg.inner_text('.reviews .rv-big small')
        check('shop rating count goes up after a review', before_shop != after_shop, f'{before_shop} -> {after_shop}')
        check('shop review shows as mine', await pg.locator('.review.mine').count() == 1)
        await pg.locator('.reviews').first.screenshot(path=f'{OUT}/03-shop-reviews.png')

        # ---- invoice on an earlier order
        await pg.click('[data-a="tab"][data-v="orders"]'); await pg.wait_for_timeout(200)
        await pg.locator('.oc-tap').last.click(); await pg.wait_for_timeout(250)
        check('order page has an invoice card', await pg.locator('details.inv').count() == 1)
        await pg.click('details.inv summary'); await pg.wait_for_timeout(120)
        check('invoice lists the total', 'Total' in (await pg.inner_text('details.inv tfoot')))
        check('invoice says it is a demo, not a GST bill', 'Not a valid GST bill' in (await pg.inner_text('.inv-body')))
        await pg.click('[data-a="inv-copy"]'); await pg.wait_for_timeout(250)
        await pg.screenshot(path=f'{OUT}/04-invoice.png')

        check('no page errors in the flows', not errs, '; '.join(errs[:5]))
        await b.close()

asyncio.run(run())
print('FAILURES:', fails if fails else 'none')
sys.exit(1 if fails else 0)
