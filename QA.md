# QA record

Last run: **2026-11-04** against the local app on `http://localhost:3000`.

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
| Targeted UI suite | `node /tmp/opencode/pw/verify.mjs` | **29 of 29 checks PASS** |
| Finance API CRUD | `curl` against `/api/admin/finance` | PASS: 201 create, 200 update, 200 delete |
| Signup field validation | `curl` against `/api/auth/register` | PASS: 400 missing or invalid map, 201 valid |
| Customer finance access | `GET /api/admin/finance` | PASS: 403 for customer |
| Browser console | Playwright error listener | PASS: no errors |

Server logs were checked after the run: no application errors.

## Current regression suite (29 checks)

### Typography and signup (11 checks)

- Computed `font-family` on `body` and headings is Manrope.
- The signup page shows phone, address, home map link, and optional address
  description fields.
- An invalid map link shows the Indonesian validation message and stays on the
  page.
- A valid registration redirects to `/akun`.
- Phone, map link, and address description persist on `/akun/profil` after
  reload.
- The signup page has no horizontal overflow at 390 px.

### Admin finance CRUD (12 checks)

- Admin login succeeds and the Keuangan navigation item is visible.
- The empty state renders when there are no entries.
- An invalid amount (`0`) is rejected by the API with `400`.
- Creating an expense adds the row and updates the expense summary.
- Editing the row updates the description and amount in the list and summary.
- Reloading keeps the saved row.
- Deleting the row returns the page to the empty state.
- The finance page has no horizontal overflow at 390 px and exposes the mobile
  admin navigation.

### Try-on copy (4 checks)

- Customer copy contains no FASHN, Hugging Face, GPU, queue, or server wording.
- The exact photo sentence is present: “Foto Anda hanya digunakan untuk membuat
  hasil try-on dan tidak disimpan.”
- The result copy uses estimation wording.
- No browser console errors were recorded across the whole run.

## API and security checks performed separately

- Registration without `mapUrl`: `400` with `Masukkan tautan peta rumah.`
- Registration with `mapUrl: "bukan-link"`: `400` with the map validation message.
- Registration with all fields: `201`, and `/api/auth/me` returns the saved
  phone, address, map link, and address note.
- Profile update with map link and address note: `200`, values persist.
- Finance list/create/update/delete as admin: `200/201/200/200`.
- Finance list as a customer: `403`.
- Finance create with amount `0`: `400`.
- Finance entry creation also checks the session, same-origin header, and a
  per-admin rate limit.

After the run, the temporary finance entry and the Playwright registration were
removed. Existing products and orders were left untouched.

## Previous baseline (2026-11-03)

- Playwright Firefox suite: **48 of 48 checks passed**, covering:
  - Meta description, canonical, OpenGraph, Twitter, WebSite/Product JSON-LD,
    `robots.txt`, and `sitemap.xml`.
  - Try-on CTA text, preview, replace/remove, type and size validation,
    duplicate-submit guard, real result rendering, download header, retry, and
    return to selection.
  - Profile save/persist, password change and revert, clear address, clear phone.
  - Admin product create with image upload, edit, and deactivate.
  - Customer order creation, admin auto-refresh, order detail, and cancellation.
- Real FASHN inference through the app returned HTTP 200 in 35.8 s and a
  576×823 WebP result.
- Anonymous result request returned `401`; a different signed-in user received
  `404`; download responses used `Content-Disposition: attachment`.

## Data lifecycle

- Customer try-on photos are **not stored**. `TryOnJob.photoPath` remains `null`.
- Generated try-on results live under `.data/results/` and are owner-guarded.
- Payment proofs live under `.data/proofs/` and are owner/admin-guarded.
- Admin product images live under `.data/products/` and are public by design
  (they are catalog photos).
- Finance entries are stored in PostgreSQL and are visible only to admins.
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
server on `http://localhost:3000` and the demo accounts from `.env`.
