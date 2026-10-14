import Script from 'next/script';
export default function Home() {
  return <main className="wrap">
    <div className="symbol">🔔</div>
    <p className="eyebrow">WEB PUSH · PWA TEST</p>
    <h1>Notification Test</h1>
    <p className="intro">Test a push notification delivered in about 1 minute — even after you close the app.</p>
    <section className="panel">
      <p className="step">STEP 1</p>
      <button id="pushEnable" type="button">Enable notifications</button>
      <p className="step second">STEP 2</p>
      <button id="pushMinute" type="button" className="secondary">Send test in 1 minute →</button>
      <p id="pushStatus" role="status" aria-live="polite" className="status">Ready to test.</p>
    </section>
    <p className="hint">On iPhone: open in Safari, tap Share → Add to Home Screen, then launch the installed app before enabling notifications.</p>
    <Script src="/push-client.js" strategy="afterInteractive" />
  </main>;
}
