# Itch Log — Next.js PWA with scheduled push test

Original Itch Log UI and IndexedDB/localStorage data are preserved. The original `index.html` is served at `/` by a Next.js route handler; the existing PWA assets remain at the same URLs.

## Local development
```bash
npm install
cp .env.example .env.local
npx web-push generate-vapid-keys
# Paste VAPID keys into .env.local; obtain QStash token/signing keys from Upstash.
npm run dev
```

## Vercel deployment
This repository now uses **Next.js**. Set these **server environment variables** in Vercel Project Settings → Environment Variables:
- `VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY`: generate with `npx web-push generate-vapid-keys`. Keep the private key secret.
- `QSTASH_TOKEN`, `QSTASH_CURRENT_SIGNING_KEY`, `QSTASH_NEXT_SIGNING_KEY`: from Upstash QStash console.

Redeploy after setting the variables. QStash schedules an HTTP delivery after **60 seconds** and authenticates the webhook with its signature. No persistent database or Vercel cron is required for this one-device test. If you change your domain, ensure Vercel's `VERCEL_PROJECT_PRODUCTION_URL` points to the reachable deployment.

## Test on iPhone
iOS 16.4+, HTTPS, Safari → Share → Add to Home Screen → open from Home Screen. Tap **Enable notifications**, allow permission, then **Test notification · next 1 min**. You can close the PWA; the push is scheduled server-side. Delivery time depends on the push service/network and may be later than exactly one minute.

This is a demo endpoint: anyone with a valid push subscription can schedule a test to that subscription. For production add authentication and rate limiting. No notification subscriptions are stored server-side.

## Existing data
Itch Log keeps its data in browser storage, not on the server. If your deployment changes origin/domain, browser storage does not transfer automatically. Use Export/Import for migration. The original UI and analytics remain unchanged.
