const VERSION='push-test-v2';
self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('push',event=>{
  let data={};try{data=event.data?.json()||{};}catch{data={body:event.data?.text()||''};}
  event.waitUntil(self.registration.showNotification(data.title||'Notification Test',{body:data.body||'Your test push arrived!',data:{url:data.url||'/'}}));
});
self.addEventListener('notificationclick',event=>{
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data?.url||'/'));
});
