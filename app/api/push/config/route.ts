import { NextResponse } from 'next/server';
export const runtime = 'nodejs';
export async function GET() {
  const key = process.env.VAPID_PUBLIC_KEY;
  if (!key) return NextResponse.json({error:'VAPID keys are not configured on Vercel'}, {status:503});
  return NextResponse.json({publicKey:key});
}
