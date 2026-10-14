import type { ReactNode } from 'react';
export const metadata = {
  title:'Notification Test',
  description:'Test Web Push notifications on an installed iPhone PWA',
  manifest:'/manifest.json',
  appleWebApp:{capable:true,title:'Push Test',statusBarStyle:'default' as const},
};
export default function RootLayout({children}:{children:ReactNode}) {
  return <html lang="en"><head><meta name="theme-color" content="#0b1020" /></head><body>
    <style>{`
      *{box-sizing:border-box}html,body{margin:0;min-height:100%;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
      body{background:#0b1020;color:#f8fafc}.wrap{max-width:480px;margin:0 auto;padding:70px 24px 40px}
      .symbol{font-size:52px;margin-bottom:22px}.eyebrow,.step{font-size:11px;font-weight:800;letter-spacing:.16em;color:#93a4c3}
      h1{font-size:40px;letter-spacing:-.04em;margin:8px 0 14px}.intro{line-height:1.65;color:#a9b7ce;margin-bottom:32px}
      .panel{background:#151e32;border:1px solid #29334c;border-radius:22px;padding:24px}
      .step{margin:0 0 12px}.second{margin-top:26px}
      button{width:100%;min-height:54px;border:0;border-radius:13px;background:#a5f3fc;color:#09202b;font-size:15px;font-weight:800;cursor:pointer}
      button.secondary{background:#34425f;color:white}button:disabled{opacity:.5;cursor:wait}
      .status{font-size:13px;line-height:1.6;color:#b9d9e6;min-height:22px;margin:24px 0 0}
      .hint{font-size:13px;line-height:1.7;color:#93a4c3;margin-top:24px}
    `}</style>{children}</body></html>;
}
