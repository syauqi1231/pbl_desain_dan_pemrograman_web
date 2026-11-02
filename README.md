# Boutique frontend

Next.js 16 + Tailwind 4 frontend for the Warm Ivory boutique design.
The backend is deliberately not scaffolded yet. Product, order and chat data
come from `src/lib/mock/`.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Routes

| Route | What it is |
|---|---|
| `/` | Storefront, hero and collection grid. `?kategori=baru\|batik\|kebaya` filters. |
| `/produk/[slug]` | Product detail with size, quantity and add to cart. |
| `/masuk` | Sign-in form, client-side validation only. |
| `/try-on` | AI Virtual Try-On. Stub provider, no photo leaves the browser. |
| `/chat` | Customer chat thread. Messages live in local state. |
| `/admin` | Admin dashboard. `?view=ringkasan\|pesanan\|produk\|chat`. |

## Where to plug the backend

- `src/lib/mock/catalog.ts` -> replace with product API calls.
- `src/lib/mock/inbox.ts` -> orders and chat threads.
- `src/lib/api.ts` -> `requestTryOn`. Swap the stub for fal.ai IDM-VTON, Replicate,
  or your own worker. Keep the return shape, the UI does not change.
- `src/components/cart-provider.tsx` -> cart currently persists to localStorage.
  Move it to server cart lines when auth exists.

## Decisions

- API: Django Ninja REST if Django is required; otherwise Next route handlers
  plus Postgres. GraphQL is not used because there is one client and no
  third-party consumers.
- Auth: session cookies on the same origin. Proxy `/api` through Next.
- Payments: Midtrans or Xendit for QRIS and virtual accounts.
- Theme: fixed Warm Ivory. Tokens are in `src/app/globals.css`, rationale in
  `DESIGN.md`.

## Checks

```bash
npm run build
npm run lint
```
