# QA record

Run on 2026-11-02 against the production build `iR7PorNU94pdjqevlA7pr`
(Next.js 16.4.3, Turbopack, Prisma 6.19.3, PostgreSQL 18).

Environment:

- App: `http://localhost:3000` (`next start`).
- Database: `127.0.0.1:5433`, database `boutique`.
- Customer demo: `pelanggan@boutique.local` / `pelanggan123`.
- Admin demo: `admin@boutique.local` / `admin12345`.
- Browser automation: Playwright with Firefox.

## Verification summary

| Check | Command | Result |
|---|---|---|
| TypeScript | `npx tsc --noEmit` | PASS, no errors |
| Lint | `npm run lint` | PASS, no warnings |
| Production build | `npm run build` | PASS, 15 pages (including not-found) and 14 route handlers |
| End-to-end flow | `node /tmp/opencode/pw/flow.mjs` | 19 of 19 checks PASS |
| API and ownership invariants | `node /tmp/opencode/pw/invariants.mjs` | 20 of 20 checks PASS |
| Contrast | `node /tmp/opencode/pw/contrast.mjs` | 17 views, 0 elements below WCAG AA |
| Responsive overflow | `node /tmp/opencode/pw/overflow.mjs` | 84 route and width combinations, 0 failures |
| Keyboard | `node /tmp/opencode/pw/keyboard.mjs` | 2px focus ring, dialog focus, Escape closes |
| Console errors | tracked inside `flow.mjs` | none |

The end-to-end run reports no console errors and no page errors.

## End-to-end flow (19 checks)

1. Storefront renders the hero and all eight seeded products.
2. The Batik filter shows only batik products and "Lihat semua" restores the catalog.
3. Product detail adds size M, quantity 2 to the cart with the correct subtotal.
4. Cart survives a reload; anonymous checkout redirects to login and returns to checkout.
5. Customer login returns to checkout with the cart intact.
6. Checkout creates a bank transfer order with a demo VA number in `PENDING_PAYMENT`.
7. Customer uploads payment proof; status moves to `AWAITING_VERIFICATION`.
8. Customer is blocked from `/admin` and sent back to the account area.
9. Admin login loads live dashboard numbers from the database.
10. Admin finds the order and verifies payment (`PAID`, payment `VERIFIED`).
11. Admin moves the order through processing, shipped, and completed.
12. Customer sees the completed order and the finished timeline.
13. Admin product form rejects an empty submit with field errors.
14. Admin creates, edits, and deactivates a product; the inactive product leaves the storefront.
15. Try-on runs in stub mode and states that `FAL_KEY` is not set.
16. Public credit page lists every photo source (10 links).
17. Escape closes the cart dialog.
18. QRIS order renders a demo QR image and the "do not scan" disclaimer.
19. New customer registration through the real form lands on an empty account.

## Business invariants (20 checks)

The API suite uses four isolated cookie jars: anonymous, customer, second customer, and admin.
It sends the correct `Origin` header and exercises the route handlers directly.

| Invariant | Result |
|---|---|
| Seeded customer and admin can log in | PASS |
| Second customer can register | PASS |
| Anonymous `GET /api/orders` is rejected (401) | PASS |
| Public catalog filters by collection (3 kebaya) | PASS |
| Customer creates an order (201) | PASS |
| Client supplied `price` and `total` are ignored; server price and shipping are used | PASS |
| Stock decrements by the ordered quantity | PASS |
| Order above available stock is rejected (409) | PASS |
| Another customer cannot read the order (404) | PASS |
| Another customer cannot upload proof (404) | PASS |
| Customer cannot change order status (403) | PASS |
| Admin cannot skip the state machine, for example ship a pending order (409) | PASS |
| Customer cannot create a product (403) | PASS |
| Customer list ignores the admin `semua=1` flag | PASS |
| New customer starts with an empty order list | PASS |
| Admin cancels a pending order (200) | PASS |
| Cancel restores stock exactly once | PASS |
| Admin sees every order | PASS |
| Anonymous cannot read a QR image (401) | PASS |

## Contrast (WCAG AA)

Automated audit of computed foreground and background colours, including
pseudo-elements and layered backgrounds, across 17 rendered views:

home, filter, product, checkout, order detail, QRIS order, account, credits,
try-on, login, admin dashboard, admin orders, admin products, admin product
form, admin order detail, admin product edit, cart drawer.

Result: 0 elements below AA. The lowest measured ratios are the secondary text
pair at 5.63:1, clay labels at 5.72:1, and the waiting status at 5.25:1.

## Responsive overflow

`overflow.mjs` visits 14 routes at 320, 360, 390, 768, 1024, and 1440 pixels.
It checks both document overflow and any text node escaping the viewport.

| Width | Routes | Result |
|---|---|---|
| 320px | 14 | clean |
| 360px | 14 | clean |
| 390px | 14 | clean |
| 768px | 14 | clean |
| 1024px | 14 | clean |
| 1440px | 14 | clean |

The admin dashboard table was the last real overflow at 1024px. Grid children
now use `min-w-0`, the dashboard hides the secondary date column, and the full
order list hides that column below `xl`. Long order numbers wrap at 320px.

## Keyboard

- Tab focus moves through the header and shows a 2px clay outline
  (`rgb(158, 69, 48)`) with 2px offset.
- Opening the cart moves focus into the dialog.
- Escape closes the cart and returns focus to the trigger.
- The payment method radios are reachable and the focus ring uses
  `focus-within` on the label.

## Defects found and fixed during this pass

- Auth forms posted to `/api/auth/masuk` and `/api/auth/daftar`, which returned
  404. They now map to `/api/auth/login` and `/api/auth/register`.
- The payment proof input was a raw native file control. It is now a styled
  picker with a filename state and a disabled submit until a file is chosen.
- Admin KPI values overflowed the card at 320px. Values now use a smaller base
  size, wrapping, and tabular numbers.
- The mobile admin nav scrolled horizontally. It now wraps.
- A long order number overflowed the admin order heading at 320px. The heading
  now uses a smaller base size and `break-words`.
- The dashboard table was clipped at 1440px and pushed the page at 1024px. It
  now respects grid minimums and drops the date column where space is tight.
- A stored image path can point at a missing file. The catalog now treats a
  missing local file as "no photo", so cards show the labelled placeholder and
  try-on does not offer a garment it cannot render.
- "Blouse Tenun Sumba" was tagged as Kebaya in the seed data. It is now Baru
  only, so the Kebaya filter shows the three kebaya pieces.

## Screenshots

All files are in `docs/`, captured from the production build at 1440x1000 or
390x844.

- `storefront-desktop.png`, `storefront-mobile.png`: hero, Kebaya filter, cards.
- `product-desktop.png`, `product-mobile.png`: gallery, sizes, stock, buy action.
- `cart-desktop.png`, `cart-mobile.png`: cart drawer and totals.
- `checkout-desktop.png`: address form, payment choice, order summary.
- `order-desktop.png`, `order-mobile.png`: completed order, VA reference, proof, timeline.
- `try-on-desktop.png`, `try-on-mobile.png`: upload panel, garment picker, stub notice.
- `kredit-desktop.png`: photo credits and licences.
- `chat-mobile.png`: demo conversation with `[Nama pelanggan]`.
- `admin-desktop.png`, `admin-mobile.png`: live KPIs, recent orders, chat demo.
- `admin-order-desktop.png`: customer, items, payment reference, proof, history.

## Known limits

- Real fal.ai try-on is not exercised because `FAL_KEY` is absent. The stub path
  is verified end to end. With a key, the adapter sends `human_image_url`,
  `garment_image_url`, and `description` to IDM-VTON and stores the returned image.
- Payments are simulated. QRIS is a generated demo code containing
  `BUKAN-PEMBAYARAN-NYATA`; bank transfer is a demo VA number. No money moves,
  and an admin must verify the uploaded proof by hand.
- Chat is a local demo from `src/lib/mock/inbox.ts`, labelled `Contoh data`. It
  is not connected to the backend.
- Uploaded proofs and try-on images live in `.data/` on local disk. A deployment
  needs a persistent volume or object storage.
- Rate limiting is in memory per server process. Restarting the server clears
  the buckets. A multi-instance deployment needs a shared store.
- Email and password auth is demo grade: no email verification, password reset,
  or MFA.
- The project is not a git repository, so these changes are uncommitted.
- The build prints six Turbopack warnings about dynamic filesystem access in
  `src/lib/storage.ts`. The build succeeds; the warnings concern output tracing
  for local uploads. Prisma also warns that `package.json#prisma` will move to a
  config file in Prisma 7.
- The live demo database is not empty: 8 seeded products plus one user-created
  product (`test` / `testing`, kept on purpose), 2 users, and 8 demo orders from
  verification runs. Do not truncate orders or delete the user product when
  re-running the seed.

## Reproduce

```bash
cd ~/Documents/boutique_pbl/boutique
npm run db:seed          # resets seeded stock and product fields, keeps orders/users
npm run build
npm run start            # http://localhost:3000

node /tmp/opencode/pw/flow.mjs
node /tmp/opencode/pw/invariants.mjs
node /tmp/opencode/pw/contrast.mjs
node /tmp/opencode/pw/overflow.mjs
node /tmp/opencode/pw/keyboard.mjs
node /tmp/opencode/pw/final-shots.mjs
```

`flow.mjs` resets stock for the two demo variants it buys, so repeated runs do
not drain the size M variant. `invariants.mjs` registers a temporary
`uji-inv-*@boutique.local` user and cancels its order. Remove that test user and
its cancelled order afterwards if you need a pristine demo dataset.
