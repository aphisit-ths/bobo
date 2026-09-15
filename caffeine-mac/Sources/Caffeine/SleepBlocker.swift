import Foundation
import IOKit.pwr_mgt

/// ตัวกันเครื่องหลับ ทำงานผ่าน IOKit power assertion
///
/// assertion เป็น API ระดับผู้ใช้ ไม่ต้องขอสิทธิ์ admin และไม่แตะ setting ของระบบ
/// พอปล่อย assertion (หรือแอปถูกปิด) ค่า Energy Saver เดิมกลับมาทำงานเองทันที
final class SleepBlocker {

    /// ชื่อ assertion type เขียนเป็น string ตรง ๆ เพราะค่าคงที่ใน IOPMLib
    /// ถูก import เข้ามาใน Swift ไม่เหมือนกันในแต่ละเวอร์ชันของ SDK
    private static let preventDisplaySleep = "PreventUserIdleDisplaySleep" as CFString
    private static let preventSystemSleep = "PreventUserIdleSystemSleep" as CFString

    /// ระยะห่างของการแจ้ง "มีคนใช้เครื่องอยู่" ต้องต่ำกว่า 1 นาที
    /// ซึ่งเป็นค่า idle ที่สั้นที่สุดที่ตั้ง screen saver ได้
    private static let userActivityInterval: TimeInterval = 25

    private var sleepAssertion: IOPMAssertionID?
    private var userActivityAssertion: IOPMAssertionID?
    private var userActivityTimer: Timer?

    private(set) var isRunning = false

    /// - Parameters:
    ///   - keepDisplayAwake: `true` กันจอดับด้วย, `false` ปล่อยให้จอดับได้แต่เครื่องไม่หลับ
    ///   - keepScreenUnlocked: รีเซ็ต idle timer เป็นระยะ เพื่อไม่ให้ screen saver เด้ง
    /// - Returns: ข้อความ error ถ้าสร้าง assertion ไม่สำเร็จ, `nil` ถ้าเรียบร้อย
    @discardableResult
    func start(keepDisplayAwake: Bool, keepScreenUnlocked: Bool) -> String? {
        stop()

        var assertionID = IOPMAssertionID(0)
        let result = IOPMAssertionCreateWithName(
            keepDisplayAwake ? Self.preventDisplaySleep : Self.preventSystemSleep,
            IOPMAssertionLevel(kIOPMAssertionLevelOn),
            "คาแฟอีน: ผู้ใช้สั่งให้เครื่องตื่นอยู่" as CFString,
            &assertionID
        )

        guard result == kIOReturnSuccess else {
            return "สร้าง power assertion ไม่สำเร็จ (IOReturn \(result))"
        }

        sleepAssertion = assertionID
        isRunning = true

        if keepScreenUnlocked {
            startDeclaringUserActivity()
        }
        return nil
    }

    func stop() {
        userActivityTimer?.invalidate()
        userActivityTimer = nil

        if let assertionID = sleepAssertion {
            IOPMAssertionRelease(assertionID)
            sleepAssertion = nil
        }
        if let assertionID = userActivityAssertion {
            IOPMAssertionRelease(assertionID)
            userActivityAssertion = nil
        }
        isRunning = false
    }

    deinit {
        stop()
    }

    // MARK: - โหมดดื้อ

    /// `IOPMAssertionDeclareUserActivity` บอกระบบว่าเพิ่งมีคนใช้เครื่อง ซึ่งรีเซ็ต idle timer
    /// ที่ screen saver กับ auto-lock ใช้นับ — เป็น API สาธารณะ ไม่ต้องขอสิทธิ์ Accessibility
    /// เหมือนการปลอม event เมาส์
    private func startDeclaringUserActivity() {
        declareUserActivity()

        let timer = Timer(timeInterval: Self.userActivityInterval, repeats: true) { [weak self] _ in
            self?.declareUserActivity()
        }
        // .common เพื่อให้เดินต่อตอนเมนูเปิดค้างอยู่
        RunLoop.main.add(timer, forMode: .common)
        userActivityTimer = timer
    }

    private func declareUserActivity() {
        // ส่ง ID เดิมกลับเข้าไปเพื่อต่ออายุ assertion เดิม แทนที่จะสร้างใหม่ทุกรอบ
        var assertionID = userActivityAssertion ?? IOPMAssertionID(0)
        let result = IOPMAssertionDeclareUserActivity(
            "คาแฟอีน: กันหน้าจอล็อก" as CFString,
            kIOPMUserActiveLocal,
            &assertionID
        )
        if result == kIOReturnSuccess {
            userActivityAssertion = assertionID
        }
    }
}
