import type { ReactNode } from 'react';
export const metadata = {
  title:'Itch Log',
  description:'Log food, sleep and stress. See the odds you will itch today.',
  manifest:'/manifest.json',
  appleWebApp:{capable:true,title:'Itch Log',statusBarStyle:'default'},
};
export default function RootLayout({children}:{children:ReactNode}) {
  return <html lang="en"><head><meta name="theme-color" content="#F1EFE9" /><link rel="apple-touch-icon" href="/icons/apple-touch-icon-180.png" /><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Noto+Sans+Thai:wght@400;500;600;700&display=swap" /></head><body>{children}</body></html>;
}
