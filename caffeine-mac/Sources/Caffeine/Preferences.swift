import Foundation

/// ค่าตั้งต้นทั้งหมดเก็บใน UserDefaults ของแอปเอง ไม่แตะ setting ของระบบ
struct Preferences {

    private enum Key {
        static let keepDisplayAwake = "keepDisplayAwake"
        static let keepScreenUnlocked = "keepScreenUnlocked"
        static let activateOnLaunch = "activateOnLaunch"
        static let lastDurationMinutes = "lastDurationMinutes"
    }

    /// 0 = ไม่จำกัดเวลา
    static let durationChoices = [0, 15, 30, 60, 120, 300]

    private let defaults: UserDefaults

    init(defaults: UserDefaults = .standard) {
        self.defaults = defaults
        defaults.register(defaults: [
            Key.keepDisplayAwake: true,
            Key.keepScreenUnlocked: false,
            Key.activateOnLaunch: true,
            Key.lastDurationMinutes: 0,
        ])
    }

    var keepDisplayAwake: Bool {
        get { defaults.bool(forKey: Key.keepDisplayAwake) }
        nonmutating set { defaults.set(newValue, forKey: Key.keepDisplayAwake) }
    }

    var keepScreenUnlocked: Bool {
        get { defaults.bool(forKey: Key.keepScreenUnlocked) }
        nonmutating set { defaults.set(newValue, forKey: Key.keepScreenUnlocked) }
    }

    var activateOnLaunch: Bool {
        get { defaults.bool(forKey: Key.activateOnLaunch) }
        nonmutating set { defaults.set(newValue, forKey: Key.activateOnLaunch) }
    }

    var lastDurationMinutes: Int {
        get { defaults.integer(forKey: Key.lastDurationMinutes) }
        nonmutating set { defaults.set(newValue, forKey: Key.lastDurationMinutes) }
    }
}
