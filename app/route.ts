import { readFile } from 'node:fs/promises';
import path from 'node:path';
export const runtime = 'nodejs';
export async function GET() {
  const html = await readFile(path.join(process.cwd(), 'index.html'), 'utf8');
  const widget = `<section class="card" aria-labelledby="pushTitle">
  <p class="lab" id="pushTitle">Test push notification</p>
  <p class="note">On iPhone: Safari → Add to Home Screen → open the installed app.</p>
  <button class="big" id="pushEnable" style="width:100%;margin-top:12px">Enable notifications</button>
  <button class="big" id="pushMinute" style="width:100%;margin-top:10px">Test notification · next 1 min</button>
  <p class="note" id="pushStatus" role="status" aria-live="polite"></p>
  </section>`;
  return new Response(html.replace('<p class="foot">', widget + '<p class="foot">').replace('</body>', '<script src="/push-client.js" defer></script></body>'), {headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}});
}
