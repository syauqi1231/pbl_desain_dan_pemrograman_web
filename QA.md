# QA record

Last run: **2026-11-03** against the production build (`next start`) on
`http://localhost:3000`.

Environment:

- Node.js + Next.js 16.4.3, Turbopack, Prisma 6.19.3, PostgreSQL 18.
- Database on `127.0.0.1:5433`, schema applied with `prisma db push`.
- Browser automation: Playwright 1.64.1 with Firefox.
- Demo accounts come from `.env`; no credentials are stored in this file.

## Verification summary

| Check | Command | Result |
|---|---|---|
| TypeScript | `npx tsc --noEmit` | PASS, no errors |
| Lint | `npm run lint` | PASS, no warnings |
| Production build | `npm run build` | PASS |
| Playwright UI/SEO/order suite | `node /tmp/opencode/pw/verify.mjs` | **48 of 48 checks PASS** |
| Real FASHN inference (direct Space call) | manual API check | HTTP 200, real result |
| Real FASHN inference (through app API) | `POST /api/try-on` | HTTP 200 in 35.8 s, 576×823 WebP |

Server logs were checked after the run: no application errors.

## What the 48 checks cover

### Typography and SEO (17 checks)

- Computed `font-family` on `body` and headings is Inter, including the
  `--font-display` alias.
- Home page: title, meta description, canonical, OpenGraph title/image, Twitter
  card, and `WebSite` JSON-LD.
- Product page: title, canonical, meta description, and `Product` JSON-LD with
  IDR price and in-stock availability.
- `/robots.txt`: 200, disallows `/admin` and `/api/`, references `/sitemap.xml`.
- `/sitemap.xml`: 200 and includes active product URLs.

### Try-on UI (15 checks)

- The CTA text is exactly **“Generate Virtual Try-On”**.
- Copy lists JPG/PNG/WEBP and the 8 MB limit.
- File selection shows a preview and a “Ganti foto” control.
- “Hapus foto” restores the upload prompt.
- A text file is rejected with the format error.
- A 9 MB PNG is rejected with the size error.
- Two synchronous clicks produce exactly one request (duplicate-submit guard).
- The real stored result image renders at 576×823.
- The provider note names FASHN VTON v1.5.
- The download link is `/api/try-on/<id>/image?download=1` and the response is
  `Content-Disposition: attachment; filename="fashn-try-on.webp"`.
- Retry and “Kembali ke pilihan” controls are present, and returning hides the
  result.

### Profile CRUD (7 checks)

- Profile page loads at `/akun/profil`.
- Name/phone/address/city/postal code save and persist across reload.
- Password change succeeds, then is reverted to the original password.
- Address can be cleared.
- Phone can be cleared.

### Admin product CRUD (5 checks)

- Admin dashboard loads.
- Product image upload shows a preview before saving.
- A new product created through the upload form appears in the admin list.
- Editing the product name updates the list.
- Unchecking “Tampilkan produk di toko” shows “Tidak aktif” (soft removal).

### Admin order visibility (4 checks)

- A customer order is created through the API (`201`).
- The order number appears in the admin order list **without a manual reload**
  in ~19.9 s (auto-refresh interval is 20 s).
- The admin order detail shows the customer and item; the admin can cancel it
  (`200`, status `CANCELLED`).

## API and ownership checks performed separately

- Real try-on through the app returned HTTP 200 and a valid WebP.
- Own result: HTTP 200 with `Cache-Control: private, no-store`.
- Download request: `Content-Disposition: attachment`.
- Anonymous result request: HTTP 401.
- Different signed-in user: HTTP 404.
- Invalid file type: HTTP 400 with a clear format error.
- Product without a try-on photo: HTTP 400 with a clear eligibility error.
- Missing photo: HTTP 400.
- Profile update, password change/revert, and address clearing: HTTP 200.
- Product image upload and fetch: HTTP 201/200 with `image/jpeg`.
- Product create/update/deactivate and cleanup: HTTP 201/200/200.

After the run, the temporary Playwright product, its uploaded image, and the
temporary order were deleted. The database was left at 9 products and the
pre-existing orders; the customer profile was restored (phone and address empty).

## Data lifecycle

- Customer try-on photos are **not stored**. `TryOnJob.photoPath` remains `null`.
- Generated try-on results live under `.data/results/` and are owner-guarded.
- Payment proofs live under `.data/proofs/` and are owner/admin-guarded.
- Admin product images live under `.data/products/` and are public by design
  (they are catalog photos).
- `.data/` and `.env` are git-ignored and are not committed.

## Known limits

- The free FASHN Space can sleep or hit ZeroGPU quota. The app surfaces this as a
  safe 503/429/504 error; it never presents a static image as model output.
- `FASHN_TIMEOUT_MS` defaults to `100000`. Lower it to `55000` if the deployment
  platform caps requests at 60 seconds.
- Payments are simulated; QRIS and virtual accounts are demo values.
- Chat is a local demo (`Contoh data`), not connected to the backend.
- Rate limiting is in memory per process.
- Uploads need a persistent volume or object storage in production.
- Auth has no email verification, password reset, or MFA.

## Reproduce

```bash
cp .env.example .env      # fill DATABASE_URL, APP_URL and seed passwords
npm install
docker compose up -d      # or use an existing PostgreSQL
npx prisma db push
npm run db:seed
npm run build
npm start
```

The Playwright suite is a local QA artifact and is not committed. It expects the
server on `http://localhost:3000`, the demo accounts from `.env`, and the two
official FASHN example images (a full-body person photo and a garment photo).
