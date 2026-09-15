import AppKit

let application = NSApplication.shared
let delegate = AppDelegate()

application.delegate = delegate
// .accessory = อยู่บน menu bar อย่างเดียว ไม่มีไอคอนใน Dock ไม่มีเมนูด้านบน
application.setActivationPolicy(.accessory)
application.run()
