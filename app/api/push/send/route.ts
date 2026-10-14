import {NextResponse} from "next/server";
import webpush from "web-push";
export const runtime="nodejs";
const publicKey="BMlJoU0MaWZaEWPqkfm4CFCmZCHKHBGXQc_zjmcRxPjLPsMInKf8KIQdBso8vv7tC-VW1JrJOIxW34uIHBuWnDk";
const privateKey="t9ogFkpxqayCxfAlgo0IdFa8E6b2xejc1Vm1tFIFovQ";
export async function POST(request:Request){
 let payload:any;try{payload=await request.json()}catch{return NextResponse.json({error:"Invalid JSON"},{status:400})}
 const {subscription}=payload;
 if(!subscription||typeof subscription.endpoint!=="string"||!subscription.endpoint.startsWith("https://")||typeof subscription.keys?.p256dh!=="string"||typeof subscription.keys?.auth!=="string")return NextResponse.json({error:"Invalid subscription or delay"},{status:400});
 try{webpush.setVapidDetails("mailto:push@example.com",publicKey,privateKey);await webpush.sendNotification(subscription,JSON.stringify({title:"Bobo Push Test",body:"Your immediate notification arrived!",url:"/"}));return NextResponse.json({ok:true});}catch(e:any){console.error(e);return NextResponse.json({error:e?.statusCode===410?"Subscription expired; unsubscribe and enable again.":"Push delivery failed: "+(e?.message||"unknown")},{status:502})}
}
