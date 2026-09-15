#!/usr/bin/env bash
# สร้าง Caffeine.app จากซอร์ส ต้องรันบน macOS ที่มี Xcode Command Line Tools
#
#   ./build.sh            สร้างไว้ที่ dist/Caffeine.app
#   ./build.sh --install  สร้างแล้วย้ายไป /Applications และเปิดให้เลย
set -euo pipefail

cd "$(dirname "$0")"

APP_NAME="${APP_NAME:-Caffeine}"
EXECUTABLE="Caffeine"
DIST="dist"
APP="$DIST/$APP_NAME.app"
INSTALL=0

for arg in "$@"; do
	case "$arg" in
		--install) INSTALL=1 ;;
		*) echo "ไม่รู้จัก option: $arg" >&2; exit 2 ;;
	esac
done

if [[ "$(uname -s)" != "Darwin" ]]; then
	echo "แอปนี้ build ได้บน macOS เท่านั้น" >&2
	exit 1
fi

if ! command -v swift >/dev/null 2>&1; then
	echo "ไม่เจอ swift — ติดตั้งด้วย: xcode-select --install" >&2
	exit 1
fi

# พยายาม build เป็น universal binary ก่อน ถ้า toolchain ไม่รองรับค่อยถอยไป arch เดียว
BUILD_FLAGS=(-c release --arch arm64 --arch x86_64)
if ! swift build "${BUILD_FLAGS[@]}" 2>/dev/null; then
	echo "build universal ไม่ผ่าน ใช้ arch ของเครื่องนี้แทน"
	BUILD_FLAGS=(-c release)
	swift build "${BUILD_FLAGS[@]}"
fi

BIN_DIR="$(swift build "${BUILD_FLAGS[@]}" --show-bin-path)"

rm -rf "$APP"
mkdir -p "$APP/Contents/MacOS" "$APP/Contents/Resources"

cp "$BIN_DIR/$EXECUTABLE" "$APP/Contents/MacOS/$EXECUTABLE"
cp Resources/Info.plist "$APP/Contents/Info.plist"
cp -R Resources/th.lproj Resources/en.lproj "$APP/Contents/Resources/"
printf 'APPL????' > "$APP/Contents/PkgInfo"

# ไอคอนแอปเป็นของแถม เมนูบาร์ใช้ SF Symbol อยู่แล้ว
if [[ -f Resources/AppIcon.icns ]]; then
	cp Resources/AppIcon.icns "$APP/Contents/Resources/AppIcon.icns"
	/usr/libexec/PlistBuddy -c "Add :CFBundleIconFile string AppIcon" "$APP/Contents/Info.plist" >/dev/null
fi

# เซ็นแบบ ad-hoc พอให้ macOS ยอมรันและให้ SMAppService ตั้ง login item ได้
codesign --force --sign - --identifier "dev.aphisit.caffeine" "$APP"

echo "เสร็จแล้ว: $APP"

if [[ "$INSTALL" -eq 1 ]]; then
	osascript -e 'quit app "Caffeine"' >/dev/null 2>&1 || true
	rm -rf "/Applications/$APP_NAME.app"
	cp -R "$APP" "/Applications/$APP_NAME.app"
	open "/Applications/$APP_NAME.app"
	echo "ติดตั้งไว้ที่ /Applications/$APP_NAME.app แล้ว ดูไอคอนถ้วยกาแฟบน menu bar ได้เลย"
fi
