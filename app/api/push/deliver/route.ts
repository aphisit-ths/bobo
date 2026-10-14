import { Receiver } from '@upstash/qstash';
import webpush from 'web-push';
import { NextResponse } from 'next/server';
export const runtime = 'nodejs';
export async function POST(request:Request) {
  const currentSigningKey = process.env.QSTASH_CURRENT_SIGNING_KEY;
  const nextSigningKey = process.env.QSTASH_NEXT_SIGNING_KEY;
  const publicKey = "BMlJoU0MaWZaEWPqkfm4CFCmZCHKHBGXQc_zjmcRxPjLPsMInKf8KIQdBso8vv7tC-VW1JrJOIxW34uIHBuWnDk";
  const privateKey = "t9ogFkpxqayCxfAlgo0IdFa8E6b2xejc1Vm1tFIFovQ";
  if (!currentSigningKey || !nextSigningKey || !publicKey || !privateKey)
    return NextResponse.json({error:'Not configured'}, {status:503});
  const signature = request.headers.get('upstash-signature');
  if (!signature) return NextResponse.json({error:'Unauthorized'}, {status:401});
  const body = await request.text();
  const receiver = new Receiver({currentSigningKey,nextSigningKey});
  const valid = await receiver.verify({signature,body,url:request.url}).catch(()=>false);
  if (!valid) return NextResponse.json({error:'Invalid signature'}, {status:401});
  try {
    const payload = JSON.parse(body);
    const sub = payload.subscription;
    if (!sub || typeof sub.endpoint !== 'string' || !sub.endpoint.startsWith('https://') || !sub.keys?.p256dh || !sub.keys?.auth)
      return NextResponse.json({error:'Invalid subscription'}, {status:400});
    webpush.setVapidDetails('mailto:push@example.com',publicKey,privateKey);
    await webpush.sendNotification(sub,JSON.stringify({title:payload.title || 'Itch Log',body:payload.body || 'Test notification',url:'/'}));
    return NextResponse.json({ok:true});
  } catch(e:any) {
    console.error('Push delivery failed',e);
    if (e?.statusCode===404 || e?.statusCode===410) return NextResponse.json({error:'Subscription expired'}, {status:200});
    return NextResponse.json({error:'Push delivery failed'}, {status:500});
  }
}
