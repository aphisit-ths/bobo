self.addEventListener("install",e=>e.waitUntil(self.skipWaiting()));
self.addEventListener("activate",e=>e.waitUntil(self.clients.claim()));
self.addEventListener("push",e=>{let data={};try{data=e.data?.json()||{}}catch{}e.waitUntil(self.registration.showNotification(data.title||"Bobo Push Test",{body:data.body||"Notification received",data:{url:data.url||"/"}}))});
self.addEventListener("notificationclick",e=>{e.notification.close();e.waitUntil(self.clients.openWindow(e.notification.data?.url||"/"))});
