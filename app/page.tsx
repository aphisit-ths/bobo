import { readFile } from 'node:fs/promises';
import path from 'node:path';
import Script from 'next/script';
export const runtime = 'nodejs';
export default async function Page() {
  const html = await readFile(path.join(process.cwd(),'index.html'),'utf8');
  const styles = html.match(/<style>([\s\S]*?)<\/style>/)?.[1] || '';
  const body = html.match(/<body>([\s\S]*?)<script>/)?.[1] || '';
  const script = html.match(/<script>([\s\S]*?)<\/script>/)?.[1] || '';
  const widget = `<section class="card" aria-labelledby="pushTitle">
    <p class="lab" id="pushTitle">Test push notification</p>
    <p class="note">On iPhone: Safari → Add to Home Screen → open the installed app.</p>
    <button class="big" id="pushEnable" style="width:100%;margin-top:12px">Enable notifications</button>
    <button class="big" id="pushMinute" style="width:100%;margin-top:10px">Test notification · next 1 min</button>
    <p class="note" id="pushStatus" role="status" aria-live="polite"></p>
  </section>`;
  const content = body.replace('<p class="foot">',widget+'<p class="foot">');
  return <>
    <style dangerouslySetInnerHTML={{__html:styles}} />
    <div dangerouslySetInnerHTML={{__html:content}} />
    <Script id="itch-log-app" strategy="afterInteractive" dangerouslySetInnerHTML={{__html:script}} />
    <Script src="/push-client.js" strategy="afterInteractive" />
  </>;
}
