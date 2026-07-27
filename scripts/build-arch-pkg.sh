#!/bin/bash
set -e

pacman -Syu --noconfirm
pacman -S --noconfirm nodejs npm rustup git webkit2gtk-4.1 gtk3 cairo pango glib2 sudo
rustup default stable

useradd builduser -m 2>/dev/null || true
passwd -d builduser
printf 'builduser ALL=(ALL) ALL\n' | tee -a /etc/sudoers
chown -R builduser:builduser .

sudo -H -u builduser bash << 'BUILDEOF'
set -e
rustup default stable

# Build desktop app
cd apps/desktop
npm ci
npx tauri build --no-bundle

# Write package metadata
cd /workspace
cat << 'PKGBUILD_EOF' > PKGBUILD
pkgname=ollama-gui
pkgver=0.1.0
pkgrel=1
pkgdesc="Ollama GUI Desktop Client"
arch=("x86_64")
url="https://github.com/Alex07lol/ollama-gui"
license=("MIT")
depends=("webkit2gtk-4.1" "gtk3" "cairo" "pango" "glib2")

package() {
  install -Dm755 "$startdir/target/release/ollama-desktop" "$pkgdir/usr/bin/ollama-gui"
  
  mkdir -p "$pkgdir/usr/share/applications"
  cat << DESK > "$pkgdir/usr/share/applications/ollama-gui.desktop"
[Desktop Entry]
Name=Ollama GUI
Exec=ollama-gui
Icon=ollama-gui
Terminal=false
Type=Application
Categories=Utility;
DESK
}
PKGBUILD_EOF

makepkg -R --noconfirm
mkdir -p artifacts
cp *.pkg.tar.zst artifacts/
BUILDEOF
