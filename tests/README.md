# Tests

Browser tests for the main flows, written with [Playwright for Python](https://playwright.dev/python/).
Each script prints PASS or FAIL per check and exits with 1 if anything failed. Screenshots go to `tests/out/`.

| Script | What it checks |
|---|---|
| `reviews.py` | Sort menu, rating and other filters, quick add, product and shop reviews, invoice, About/Privacy/Terms |
| `daily.py` | Daily basket (steppers, bin, quick add, add all to cart), 15-minute shelf, fastest-to-get sort, 500 m filter, Tamil search and screens, short-stock message |
| `po.py` | Orders to traders: send, items not bought twice, Today count, receive into stock, cancel, regular-trader rule, WhatsApp text, Tamil |

Run them:

```
pip install playwright
playwright install chromium
python3 -m http.server 8000          # in the project folder, in another terminal
python3 tests/daily.py
python3 tests/po.py
python3 tests/reviews.py
```

Use another address with `LOCALKART_URL=http://localhost:9000/index.html`, or your own Chrome with `CHROME_PATH=/path/to/chrome`.
