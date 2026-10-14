import { NextResponse } from 'next/server';
export const runtime = 'nodejs';
export async function GET() {
  const key = "BMlJoU0MaWZaEWPqkfm4CFCmZCHKHBGXQc_zjmcRxPjLPsMInKf8KIQdBso8vv7tC-VW1JrJOIxW34uIHBuWnDk";
  if (!key) return NextResponse.json({error:'VAPID keys are not configured on Vercel'}, {status:503});
  return NextResponse.json({publicKey:key});
}
