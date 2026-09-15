import AppKit
import ServiceManagement

final class AppDelegate: NSObject, NSApplicationDelegate {

    private let blocker = SleepBlocker()
    private let prefs = Preferences()
    private let menu = NSMenu()

    private var statusItem: NSStatusItem!
    private var expiryTimer: Timer?
    private var expiresAt: Date?

    // MARK: - วงจรชีวิตแอป

    func applicationDidFinishLaunching(_ notification: Notification) {
        statusItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.variableLength)

        if let button = statusItem.button {
            button.target = self
            button.action = #selector(statusItemClicked)
            button.sendAction(on: [.leftMouseUp, .rightMouseUp])
        }

        menu.delegate = self

        if prefs.activateOnLaunch {
            activate(minutes: prefs.lastDurationMinutes)
        } else {
            refresh()
        }
    }

    func applicationWillTerminate(_ notification: Notification) {
        blocker.stop()
    }

    func applicationSupportsSecureRestorableState(_ app: NSApplication) -> Bool {
        true
    }

    // MARK: - เปิด / ปิด

    private func activate(minutes: Int) {
        prefs.lastDurationMinutes = minutes

        if let failure = blocker.start(
            keepDisplayAwake: prefs.keepDisplayAwake,
            keepScreenUnlocked: prefs.keepScreenUnlocked
        ) {
            refresh()
            alert(title: "เปิดไม่สำเร็จ", message: failure)
            return
        }

        expiryTimer?.invalidate()
        expiryTimer = nil

        if minutes > 0 {
            let deadline = Date().addingTimeInterval(TimeInterval(minutes) * 60)
            expiresAt = deadline
            let timer = Timer(fire: deadline, interval: 0, repeats: false) { [weak self] _ in
                self?.deactivate()
            }
            RunLoop.main.add(timer, forMode: .common)
            expiryTimer = timer
        } else {
            expiresAt = nil
        }

        refresh()
    }

    private func deactivate() {
        blocker.stop()
        expiryTimer?.invalidate()
        expiryTimer = nil
        expiresAt = nil
        refresh()
    }

    private func toggle() {
        if blocker.isRunning {
            deactivate()
        } else {
            activate(minutes: prefs.lastDurationMinutes)
        }
    }

    /// ถ้าเครื่องหลับคาไว้ ตัว Timer อาจยิงช้ากว่ากำหนด เลยเช็คเวลาจริงซ้ำทุกครั้งที่จะวาด UI
    private func expireIfDue() {
        guard blocker.isRunning, let deadline = expiresAt, deadline <= Date() else { return }
        deactivate()
    }

    // MARK: - หน้าตาบน menu bar

    private func refresh() {
        guard let button = statusItem.button else { return }

        let symbol = blocker.isRunning ? "cup.and.saucer.fill" : "cup.and.saucer"
        if let image = NSImage(systemSymbolName: symbol, accessibilityDescription: statusLine()) {
            image.isTemplate = true
            button.image = image
            button.title = ""
        } else {
            // เครื่องเก่าที่ไม่มี SF Symbols
            button.image = nil
            button.title = blocker.isRunning ? "☕️" : "☕︎"
        }

        button.toolTip = "คาแฟอีน — \(statusLine())"
    }

    private func statusLine() -> String {
        guard blocker.isRunning else { return "ปิดอยู่ เครื่องหลับได้ตามปกติ" }
        guard let deadline = expiresAt else { return "เปิดอยู่ ไม่จำกัดเวลา" }
        return "เปิดอยู่ เหลืออีก \(Self.countdown(until: deadline))"
    }

    private static func countdown(until deadline: Date) -> String {
        let remaining = max(0, Int(deadline.timeIntervalSinceNow.rounded(.up)))
        let hours = remaining / 3600
        let minutes = (remaining % 3600) / 60
        let seconds = remaining % 60
        if hours > 0 {
            return String(format: "%d:%02d:%02d", hours, minutes, seconds)
        }
        return String(format: "%d:%02d", minutes, seconds)
    }

    private static func durationLabel(_ minutes: Int) -> String {
        switch minutes {
        case 0: return "ไม่จำกัดเวลา"
        case ..<60: return "\(minutes) นาที"
        default:
            let hours = Double(minutes) / 60
            let text = hours == hours.rounded() ? String(Int(hours)) : String(format: "%.1f", hours)
            return "\(text) ชั่วโมง"
        }
    }

    // MARK: - คลิกที่ไอคอน

    @objc private func statusItemClicked() {
        let event = NSApp.currentEvent
        let isSecondaryClick = event?.type == .rightMouseUp
            || event?.modifierFlags.contains(.control) == true

        if isSecondaryClick {
            showMenu()
        } else {
            toggle()
        }
    }

    private func showMenu() {
        // ผูกเมนูชั่วคราวแล้วสั่งคลิกเอง เพื่อให้คลิกซ้ายยังเป็นปุ่มเปิด/ปิดได้อยู่
        statusItem.menu = menu
        statusItem.button?.performClick(nil)
        statusItem.menu = nil
    }

    // MARK: - รายการในเมนู

    private func buildMenu() {
        menu.removeAllItems()

        let status = NSMenuItem(title: statusLine(), action: nil, keyEquivalent: "")
        status.isEnabled = false
        menu.addItem(status)
        menu.addItem(.separator())

        menu.addItem(item(
            title: blocker.isRunning ? "ปิด" : "เปิด",
            action: #selector(menuToggle)
        ))

        let durations = NSMenu()
        for minutes in Preferences.durationChoices {
            let entry = item(title: Self.durationLabel(minutes), action: #selector(menuSetDuration(_:)))
            entry.tag = minutes
            entry.state = minutes == prefs.lastDurationMinutes ? .on : .off
            durations.addItem(entry)
        }
        let durationParent = NSMenuItem(title: "ระยะเวลา", action: nil, keyEquivalent: "")
        durationParent.submenu = durations
        menu.addItem(durationParent)

        menu.addItem(.separator())

        menu.addItem(check(
            title: "กันจอดับด้วย",
            on: prefs.keepDisplayAwake,
            action: #selector(menuToggleKeepDisplayAwake)
        ))
        menu.addItem(check(
            title: "กันหน้าจอล็อก (โหมดดื้อ)",
            on: prefs.keepScreenUnlocked,
            action: #selector(menuToggleKeepScreenUnlocked)
        ))
        menu.addItem(check(
            title: "เปิดทันทีที่เริ่มแอป",
            on: prefs.activateOnLaunch,
            action: #selector(menuToggleActivateOnLaunch)
        ))
        menu.addItem(check(
            title: "เปิดแอปอัตโนมัติตอนล็อกอิน",
            on: SMAppService.mainApp.status == .enabled,
            action: #selector(menuToggleLaunchAtLogin)
        ))

        menu.addItem(.separator())
        menu.addItem(item(title: "เกี่ยวกับคาแฟอีน", action: #selector(menuAbout)))
        menu.addItem(item(title: "ออก", action: #selector(menuQuit), keyEquivalent: "q"))
    }

    private func item(title: String, action: Selector, keyEquivalent: String = "") -> NSMenuItem {
        let entry = NSMenuItem(title: title, action: action, keyEquivalent: keyEquivalent)
        entry.target = self
        return entry
    }

    private func check(title: String, on: Bool, action: Selector) -> NSMenuItem {
        let entry = item(title: title, action: action)
        entry.state = on ? .on : .off
        return entry
    }

    // MARK: - ปุ่มในเมนู

    @objc private func menuToggle() {
        toggle()
    }

    @objc private func menuSetDuration(_ sender: NSMenuItem) {
        // เลือกเวลาแล้วให้เริ่มนับใหม่ทันที ไม่ต้องไปกดเปิดซ้ำ
        activate(minutes: sender.tag)
    }

    @objc private func menuToggleKeepDisplayAwake() {
        prefs.keepDisplayAwake.toggle()
        restartIfRunning()
    }

    @objc private func menuToggleKeepScreenUnlocked() {
        prefs.keepScreenUnlocked.toggle()
        restartIfRunning()
    }

    @objc private func menuToggleActivateOnLaunch() {
        prefs.activateOnLaunch.toggle()
    }

    @objc private func menuToggleLaunchAtLogin() {
        do {
            if SMAppService.mainApp.status == .enabled {
                try SMAppService.mainApp.unregister()
            } else {
                try SMAppService.mainApp.register()
            }
        } catch {
            alert(
                title: "ตั้งให้เปิดตอนล็อกอินไม่สำเร็จ",
                message: """
                \(error.localizedDescription)

                ถ้าแอปยังอยู่ในโฟลเดอร์ที่ build ลองย้ายไปไว้ใน /Applications ก่อนแล้วลองใหม่
                """
            )
        }
    }

    @objc private func menuAbout() {
        alert(
            title: "คาแฟอีน",
            message: """
            กันไม่ให้ Mac หลับหรือจอดับ ตราบใดที่ไอคอนถ้วยยังเต็มอยู่

            คลิกซ้ายที่ไอคอน = เปิด/ปิด
            คลิกขวา = เมนูนี้

            ทำงานด้วย IOKit power assertion ซึ่งเป็น API ระดับผู้ใช้
            ไม่ต้องใช้สิทธิ์ admin และไม่แก้ค่า Energy Saver ของเครื่อง
            พอปิดแอป ทุกอย่างกลับไปเป็นค่าเดิมของระบบทันที
            """
        )
    }

    @objc private func menuQuit() {
        NSApp.terminate(nil)
    }

    private func restartIfRunning() {
        guard blocker.isRunning else { return }
        blocker.start(
            keepDisplayAwake: prefs.keepDisplayAwake,
            keepScreenUnlocked: prefs.keepScreenUnlocked
        )
        refresh()
    }

    private func alert(title: String, message: String) {
        NSApp.activate(ignoringOtherApps: true)
        let alert = NSAlert()
        alert.messageText = title
        alert.informativeText = message
        alert.addButton(withTitle: "ตกลง")
        alert.runModal()
    }
}

// MARK: - NSMenuDelegate

extension AppDelegate: NSMenuDelegate {
    func menuNeedsUpdate(_ menu: NSMenu) {
        expireIfDue()
        buildMenu()
    }
}
