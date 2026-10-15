# Love Coupons — Love for Mena

A little book of promises, redeemable any time. Pick a coupon whenever you
like — no expiry, no questions — or write your own. Part of the **Love for
Mena** collection.

**Live:** https://menaammarpro.github.io/love-coupons/

## What it does

- **Ten starter coupons** — small promises and big ones
- Tap a coupon to **redeem** it (stamped with the date); tap again to put it back
- **Write your own** coupon, with optional fine print, and remove it later
- A **Surprise me** button that picks one for you
- Everything is stored on the device only — no tracking, no network calls
- Installable PWA with offline support

## How it works

Coupons live in `localStorage` on that device. To change the starter set, edit
the `DEFAULT` array at the top of `js/app.js`.

## Files

- `index.html` — the page
- `css/theme.css` — shared love-theme (copied from `_love-theme/`)
- `css/app.css` — page-specific styles (the ticket-style coupons)
- `js/theme-main.js`, `js/effects.js` — shared behaviour/effects
- `js/app.js` — coupon book logic
- `manifest.webmanifest`, `sw.js` — PWA
- `assets/` — favicon and icons

## Run locally

```powershell
py -m http.server 8000
```

Then visit http://localhost:8000.

## Deploy

Static site, deployed with GitHub Pages from `main`.

## License

Creative Commons BY-NC-ND 4.0 — see [`LICENSE`](LICENSE).
© 2026 Ammar (MenaAmmarPro). Made with care for Mena.
