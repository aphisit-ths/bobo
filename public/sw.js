/* Itch Log PWA offline cache + Web Push */
const VERSION = 'itchlog-next-push-v1';
const SHELL = ['/', '/manifest.json', '/push-client.js', '/icons/icon-192.png', '/icons/icon-512.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(VERSION).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const url=new URL(e.request.url);
  if(url.origin!==location.origin)return;
  if(e.request.mode==='navigate') {
    e.respondWith(fetch(e.request).catch(()=>caches.match('/')));
    return;
  }
  e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request)));
});
self.addEventListener('push',e=>{
  let data={};
  try {data=e.data?.json()||{};}catch {data={body:e.data?.text()||''};}
  e.waitUntil(self.registration.showNotification(data.title||'Itch Log',{
    body:data.body||'Your notification is here',
    icon:'/icons/icon-192.png',
    badge:'/icons/icon-192.png',
    data:{url:data.url||'/'}
  }));
});
self.addEventListener('notificationclick',e=>{
  e.notification.close();
  const url=new URL(e.notification.data?.url||'/',self.location.origin);
  if(url.origin!==self.location.origin)return;
  e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(async windows=>{
    for(const window of windows){if('focus' in window){await window.navigate(url.href);return window.focus();}}
    return clients.openWindow(url.href);
  }));
});
