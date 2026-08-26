# Itch Log

Log what you ate, how you slept and how stressed you were. Answer one question
before bed. After five closed days the app starts showing the odds you'll itch
today and what's pushing them up or down.

Everything stays in the browser. No accounts, no server, no analytics.

## Deploy

Upload this whole folder to any static host — GitHub Pages, Netlify, Vercel,
Cloudflare Pages. No build step. It must be served over http/https, not
`file://`, or the service worker and install prompt won't run.

Local check:

    npx serve .        # or  python3 -m http.server 8080

## Install on a phone

- Android / Chrome: an **Install** button appears in the header.
- iPhone / Safari: Share → Add to Home Screen.

## Files

    index.html                  the whole app
    manifest.json               install metadata
    sw.js                       offline cache — bump VERSION on each deploy
    icons/icon-192.png          home screen
    icons/icon-512.png          splash / store
    icons/icon-maskable-512.png Android adaptive shape (extra padding)
    icons/apple-touch-icon-180.png  iOS home screen
    icons/favicon.ico           browser tab (16/32/48)
    icons/favicon-16.png
    icons/favicon-32.png
    icons/logo.png              1024px transparent, for README or site use
    icons/og-image.png          1200x630 link preview

## Reset

Open the site with `?reset` on the end to wipe local data and start clean.

## The maths

    baseline           = itchy days / closed days
    contribution(item) = (item's own itch rate − baseline) × n/(n+2)
    odds               = baseline + Σ contributions, clamped 3–97%

The `n/(n+2)` term damps items with thin history; under 2 days an item counts
for nothing and shows as `new`. Sleep joins in when the night runs shorter than
your median, stress when you rate it 4 or 5, each with its own measured lift.
Foods under 3 days show faded and stay out of the ranking.

This is a correlation inside one person's diary. Anything eaten every single day
can't separate itself from the baseline — drop it for a week and compare.
Not a diagnosis; if the itching is frequent, see a dermatologist.
