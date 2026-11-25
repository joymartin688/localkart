# Demo video and slides plan

## Before recording

- Use a laptop browser window at least 1280 px wide, zoomed to 100%. Press **Reset** in the top bar before every take.
- Start on the landing page (always English). Use **See both apps side by side** for most of the video: the phone frames look right on camera, and the vendor side updates live.
- Record between about 9 am and 4 pm if you can. The market list uses the time of day to estimate what will be left at closing, so daytime lists are fuller. The evening clearance tip appears after 4 pm. Either way works.
- Turn off notifications and close other tabs. Recording the voiceover separately makes it easier to keep clicks and words in sync.

## Scene order (about 2 min 55 s)

| # | Time | Screen | What to do | What to say (roughly) |
|---|---|---|---|---|
| 1 | 0:00–0:10 | Landing | Hold on the pushcart and headline | "Selvi sells vegetables from a cart on Kutchery Road. Her customers can't see what she has today, or that her tomatoes are ₹40." |
| 2 | 0:10–0:16 | Side by side | Click *See both apps side by side* | "LocalKart has two apps on one shared system: shoppers on the left, vendors like Selvi on the right." |
| 3 | 0:16–0:32 | Customer: home | Point at *My daily basket*, tap + on milk, then *Add all to cart*; point at *Daily needs in about 15 minutes* | "Priya buys milk, bread and tea every day. Her basket puts each one in the cart from the best-value shop nearby, and the shop next door has it ready in about nine minutes." |
| 4 | 0:32–0:44 | Customer: search | Tap the *Tomato* chip (or type `thakkali`) | "She types thakkali, the way she says it. Four vendors nearby have tomatoes." |
| 5 | 0:44–1:00 | Customer: compare | Point at the Best value card and reason; open the sort menu (*Fastest to get*, *Price: low to high*) and tap *★ 4 and up* | "Anbu is ₹2 cheaper but 3 km away. LocalKart picks Selvi and says why. She can sort by price or by how soon she gets it, like any big shopping site. Nobody can pay to rank higher." |
| 6 | 1:00–1:08 | Customer: product → cart | Add 1 kg; open the cart | "Pickup, pay at the stall. Each vendor gets their own order." |
| 7 | 1:08–1:14 | Place order | Place order and pause on the right phone | "The order is already on Selvi's phone." |
| 8 | 1:14–1:30 | Vendor: accept → ready | Orange *1 new order* → Accept → Start packing → Ready for pickup; point at the customer's progress | "Big buttons, one tap each. Priya sees every step." |
| 9 | 1:30–1:42 | Vendor: walk-in bill | On Today, type `2 kg thakkali, arai kilo vengayam` → Add cash sale | "Most of Selvi's sales are still cash at the cart. She types them the way she talks. They count towards stock, earnings and tomorrow's buying." |
| 10 | 1:42–2:12 | Vendor: market list and trader order | Market tab: cash to carry, Velu vs Kannan reason, *★ My regular trader*; tap *Send order* on Kannan Traders; show the order card, *Copy*, then *Received: add to stock* | "This is the supply chain part. From her last 7 days of sales, LocalKart says what to buy and from whom. Lot sizes and waste matter, and her regular trader gets preference when he's close on price. She sends him one order, copies it to WhatsApp, and when she collects it, her stock updates. Ordered items are never bought twice." |
| 11 | 2:12–2:24 | Vendor: tips + clearance | Scroll the tips; set clearance to 20%; show the customer home *Evening clearance* row | "Tips come from her own sales. In the evening she marks greens down, and shoppers nearby see it." |
| 12 | 2:24–2:36 | Customer: trip planner | Home → *Got a shopping list?* → *Try a sample list* | "Priya can type a whole list. Fewest stops or lowest total, her choice." |
| 13 | 2:36–2:55 | Tamil + close | Top bar *Tamil*, then back to landing | "Everything works in Tamil, on any phone, and it installs like an app. Payments and delivery are simulated here. Next: UPI to the vendor's own ID, WhatsApp ordering, and a pilot on one street." |

Avoid on camera:

- **Voice input.** In embedded previews the microphone is blocked and the app shows a message. Only use it if you run the files in Chrome with mic permission.
- **Calling it "AI".** Every pick is a simple rule that explains itself. Say "worked out from her own sales". Judges trust what they can follow.

## Slide storyline (10 slides)

1. **Title.** LocalKart: street vendors, on your phone. Team names.
2. **Selvi's day.** A real cart near you (take the photo yourself). Customers walking past, onions sold out by 6 pm, coriander thrown away, buying at 4 am from memory.
3. **Why quick commerce doesn't fit.** Dark stores, delivery-only, platform prices. Street vendors need a tool, not a smaller Blinkit. Use the comparison table from the README.
4. **LocalKart in one picture.** The side-by-side screenshot: shopper and vendor apps on one shared system.
5. **Intelligent recommendations.** Best value with a reason (show the 40/35/15/10 weights), picked for you, often bought with, vendor tips.
6. **Supply chain at street level.** The market list screenshot and the tomato/onion lot-size example. One order per trader, sent to WhatsApp and marked received; items on order are not bought twice; a regular trader is preferred when within 5%. Walk-in bills feed it, and evening clearance reduces waste.
7. **Digital marketplace.** Daily basket and *Daily needs in about 15 minutes*; compare across carts with sort (best value, fastest to get, price, rating, nearest) and filters (4★ and up, within 500 m, get it in 15 min); ratings and reviews; trip planner; separate orders per vendor; two-minute vendor sign-up.
8. **Built for vendors who use WhatsApp.** Tamil throughout, easy mode, − / + pricing, typed or spoken bills, copy bill or list for WhatsApp.
9. **How it's built + honest limits.** Plain HTML/CSS/JS, no build, shared data layer, installs as an app and works offline. Quality: Lighthouse 99–100 in every category, no accessibility issues found by axe on any screen, automated tests for every flow. Limits: simulated payments, delivery and GPS; sample prices and vendors. Then the **References** slide (four sources, full links, README section "Research and sources").
10. **What's next.** OTP + backend, UPI to the vendor's ID, WhatsApp ordering, live Koyambedu prices, a four-week pilot with 10 vendors. Business model: free in the pilot, then a small fixed fee per online order.
