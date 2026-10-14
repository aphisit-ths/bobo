(() => {
  const enable = document.getElementById('pushEnable');
  const test = document.getElementById('pushMinute');
  const status = document.getElementById('pushStatus');
  if (!enable || !test || !status) return;
  const show = message => { status.textContent = message; };
  const supported = () => 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  const decode = key => {
    const s = atob((key + '='.repeat((4 - key.length % 4) % 4)).replace(/-/g,'+').replace(/_/g,'/'));
    return Uint8Array.from(s,c=>c.charCodeAt(0));
  };
  async function subscribe(askPermission) {
    if (!supported()) throw Error('Web Push not supported. On iPhone, add this website to Home Screen and open the app (iOS 16.4+).');
    if (askPermission && Notification.permission !== 'granted') {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') throw Error('Notification permission not granted.');
    }
    if (Notification.permission !== 'granted') throw Error('Tap Enable notifications first.');
    const response = await fetch('/api/push/config',{cache:'no-store'});
    const config = await response.json();
    if (!response.ok) throw Error(config.error || 'Push is not configured');
    const registration = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;
    return await registration.pushManager.getSubscription() ||
      registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:decode(config.publicKey)});
  }
  enable.addEventListener('click',async()=>{
    enable.disabled = true;
    try { await subscribe(true); show('Notifications enabled. Ready to schedule.'); }
    catch(e){show(e.message || 'Could not enable notifications');}
    finally {enable.disabled=false;}
  });
  test.addEventListener('click',async()=>{
    test.disabled = true;
    try {
      const subscription = await subscribe(false);
      const response = await fetch('/api/push/schedule',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({subscription:subscription.toJSON()})});
      const data = await response.json();
      if (!response.ok) throw Error(data.error || 'Scheduling failed');
      show('Scheduled! Push should arrive in about 1 minute, even if you close the app.');
    } catch(e){show(e.message || 'Could not schedule notification');}
    finally {test.disabled=false;}
  });
})();
