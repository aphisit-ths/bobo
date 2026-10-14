# Bobo Push Test

Next.js iPhone PWA with permission status, subscribe/unsubscribe, Send Now, and Send in 1 Minute.

## Run

```sh
npm install
npm run build
npm run dev
```

## Vercel

Set Framework Preset to Next.js, Root Directory to repository root, and leave Output Directory blank.

**Send Now** uses Web Push directly from the Next.js API route.

**Send in 1 Minute** uses Upstash QStash. Set `QSTASH_TOKEN`, `QSTASH_CURRENT_SIGNING_KEY`, and `QSTASH_NEXT_SIGNING_KEY` in Vercel environment variables and redeploy. Do not commit QStash credentials.

On iPhone iOS 16.4+, install from Safari via Add to Home Screen and open the installed app to enable push permissions.

The VAPID keypair is embedded in server code for this temporary demo. This repository is public, so do not reuse that keypair in production.
