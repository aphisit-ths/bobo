import { Client } from '@upstash/qstash';
import { NextResponse } from 'next/server';
export const runtime = 'nodejs';
export async function POST(request:Request) {
  const token = process.env.QSTASH_TOKEN;
  const publicKey = "BMlJoU0MaWZaEWPqkfm4CFCmZCHKHBGXQc_zjmcRxPjLPsMInKf8KIQdBso8vv7tC-VW1JrJOIxW34uIHBuWnDk";
  const privateKey = "t9ogFkpxqayCxfAlgo0IdFa8E6b2xejc1Vm1tFIFovQ";
  if (!token || !publicKey || !privateKey || !process.env.QSTASH_CURRENT_SIGNING_KEY || !process.env.QSTASH_NEXT_SIGNING_KEY)
    return NextResponse.json({error:'Server push settings missing; see README'}, {status:503});
  let subscription: any;
  try { subscription = (await request.json()).subscription; } catch { return NextResponse.json({error:'Invalid JSON'}, {status:400}); }
  if (!subscription || typeof subscription.endpoint !== 'string' || !subscription.endpoint.startsWith('https://') || typeof subscription.keys?.p256dh !== 'string' || typeof subscription.keys?.auth !== 'string')
    return NextResponse.json({error:'Invalid push subscription'}, {status:400});
  const base = process.env.VERCEL_PROJECT_PRODUCTION_URL ? 'https://' + process.env.VERCEL_PROJECT_PRODUCTION_URL : new URL(request.url).origin;
  try {
    const qstash = new Client({token});
    await qstash.publishJSON({
      url: base + '/api/push/deliver',
      body: {subscription, title:'Itch Log test', body:'Your 1-minute test notification arrived!', url:'/'},
      delay: 60,
      retries: 2
    });
    return NextResponse.json({ok:true,scheduledFor:new Date(Date.now()+60000).toISOString()});
  } catch(e) {
    console.error('QStash scheduling failed',e);
    return NextResponse.json({error:'Scheduling failed; check QStash configuration'}, {status:502});
  }
}
