import type { Metadata } from "next";
import type { ReactNode } from "react";
export const metadata: Metadata = {title:"Bobo Push Test",description:"iPhone PWA Web Push notification test",manifest:"/manifest.webmanifest",appleWebApp:{capable:true,title:"Bobo Push",statusBarStyle:"default"}};
export default function RootLayout({children}:{children:ReactNode}) {return <html lang="en"><head><meta name="theme-color" content="#111827"/><link rel="apple-touch-icon" href="/icon.svg"/></head><body style={{margin:0,background:"#0b1220",color:"#f8fafc",fontFamily:"system-ui,-apple-system,sans-serif"}}>{children}</body></html>}
