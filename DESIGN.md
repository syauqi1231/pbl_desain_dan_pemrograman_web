# Boutique: Design Direction

Source: the four reference screens in `../` (Warm Ivory set).
This file records the direction. `src/app/globals.css` is the single source of the tokens.

## Reading

Storefront and back office for an Indonesian boutique selling kebaya, batik and tenun.
Audience: shoppers who buy tailored pieces, and one shop admin running orders and chat from a phone.
Visual language: warm editorial. Ivory paper, clear sans-serif type, terracotta accent, generous whitespace.
Dial: **ENERGY 2 / RHYTHM 2 / MOTION 1**.

- ENERGY 2: the large headline and hero feel present, but nothing shouts.
- RHYTHM 2: the storefront is one calm editorial block, then a product grid. The app screens change layout by task (studio, thread, dashboard), not by decoration.
- MOTION 1: hover and focus transitions only. No scroll reveals, no floating elements.

## Palette

Sampled from the reference PNGs with ImageMagick.

| Token | Hex | Role | Reason |
|---|---|---|---|
| `ivory-50` | `#FBF9F6` | cards, raised surfaces | keeps cards from going pure white |
| `ivory-100` | `#F8F4ED` | page background | warm paper, the brand's base |
| `ivory-200` | `#F3EADD` | quiet sections | one step darker than the page |
| `sand-200` | `#DFCBB1` | media placeholder | stands in for product photography |
| `sand-300` | `#D9C4A7` | media placeholder, alt | varies per product like the reference |
| `sand-400` | `#CDB798` | media placeholder, deep | varies per product like the reference |
| `clay-500` | `#9E4530` | primary action, accent, labels | terracotta reads tailored, not SaaS |
| `clay-600` | `#8A3B29` | pressed state | one step darker |
| `espresso-900` | `#2C2420` | text, admin sidebar | near-black brown, softer than black |
| `espresso-500` | `#6B5F58` | secondary text | 5.7:1 on ivory, passes AA |
| `line` | `#E4D8C8` | hairlines, borders | 1px rules, never a shadow |
| `sage-700` | `#3E6B45` | status: Lunas, Dikirim | the reference uses green for settled states |
| `amber-700` | `#965B1B` | status: Menunggu | readable amber, not neon |

Two core colours (ivory, espresso) plus one accent (clay). Sand and sage are roles, not new brand colours.

## Typography

- Display and body: **Inter**. Reason: standard e-commerce legibility at every size, consistent Latin and numeral shapes for prices/order numbers, and a neutral tone that lets the product photography carry the editorial feel. `--font-display` intentionally resolves to the same family; it is a semantic alias, not a second typeface.
- Scale: hero `clamp(2.75rem, 5.6vw, 5.25rem)`, section title `clamp(1.9rem, 3vw, 2.75rem)`, body 1rem/1.65.
- No monospace in UI copy. Labels are uppercase at `0.14em`, which is the reference's own treatment. Monospace appears only on the demo VA digits, where character alignment helps copying.

## Shape and depth

- Radius: cards and media `1.25rem`, buttons and inputs full pill (the reference uses pills for actions only), chips pill.
- Depth: hairlines and surface tints do the work. No drop shadows anywhere. Nothing floats.

## Theme

Fixed Warm Ivory. No dark toggle.
Reason: the ivory paper is the brand identity named in the chosen design, not a default. A dark variant would be a different boutique.

## Motion

150ms colour and opacity transitions on interactive elements. `prefers-reduced-motion` removes them.

## Placeholder policy

- Product photography is stock from Wikimedia Commons, cropped for the cards. Every file is credited on `/kredit` and in `public/products/CREDITS.md`, with a link to the source and licence. It is demo photography for a demo shop, not the owner's own catalogue.
- The shop name is the literal `[NAMA BOUTIQUE]` placeholder until the owner supplies one.
- Customer names in the demo chat are `[Nama pelanggan]`. The seeded customer account is `Pelanggan Demo` so real personal data is never invented.
- Admin numbers come from the database. With no orders, revenue shows `Rp 0` and the list shows an empty state. Demo chat is marked `Contoh data`.
- AI Try-On calls the official **FASHN VTON v1.5** Hugging Face Space through its Gradio queue API. It never presents a stand-in image as a real try-on result. Customer photos are not stored; only the generated result is kept and shown to its owner.

## Accessibility

- Body text `espresso-900` on `ivory-100`: 13.8:1.
- Secondary `espresso-500` on `ivory-100`: 5.7:1.
- Clay button: white on `clay-500`: 6.5:1.
- Focus: 2px clay outline, 2px offset, on every interactive element. Sand outline on the dark admin sidebar.
- Tap targets: 44px minimum on every control.
