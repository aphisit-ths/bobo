import {NextResponse} from "next/server";
import {Client} from "@upstash/qstash";
import webpush from "web-push";
export const runtime="nodejs";
const publicKey="BMlJoU0MaWZaEWPqkfm4CFCmZCHKHBGXQc_zjmcRxPjLPsMInKf8KIQdBso8vv7tC-VW1JrJOIxW34uIHBuWnDk";
const privateKey="t9ogFkpxqayCxfAlgo0IdFa8E6b2xejc1Vm1tFIFovQ";
export async function POST(request:Request){
 let payload:any;try{payload=await request.json()}catch{return NextResponse.json({error:"Invalid JSON"},{status:400})}
 const {subscription,delay}=payload;
 if(!subscription||typeof subscription.endpoint!=="string"||!subscription.endpoint.startsWith("https://")||typeof subscription.keys?.p256dh!=="string"||typeof subscription.keys?.auth!=="string"||![0,60].includes(delay))return NextResponse.json({error:"Invalid subscription or delay"},{status:400});
 if(delay===60){const token=process.env.QSTASH_TOKEN;if(!token||!process.env.QSTASH_CURRENT_SIGNING_KEY||!process.env.QSTASH_NEXT_SIGNING_KEY)return NextResponse.json({error:"1-minute scheduling requires QSTASH_TOKEN and both QStash signing keys on Vercel."},{status:503});try{const url=new URL("/api/push/deliver",request.url).toString();await new Client({token}).publishJSON({url,body:{subscription},delay:60,retries:2});return NextResponse.json({ok:true,scheduled:true});}catch(e){console.error(e);return NextResponse.json({error:"QStash scheduling failed"},{status:502})}}
 try{webpush.setVapidDetails("mailto:push@example.com",publicKey,privateKey);await webpush.sendNotification(subscription,JSON.stringify({title:"Bobo Push Test",body:"Your immediate notification arrived!",url:"/"}));return NextResponse.json({ok:true});}catch(e:any){console.error(e);return NextResponse.json({error:e?.statusCode===410?"Subscription expired; unsubscribe and enable again.":"Push delivery failed: "+(e?.message||"unknown")},{status:502})}
}
