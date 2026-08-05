---
description: "Aturan larangan penggunaan efek 3D Parallax/TiltCard pada elemen box lebar seperti tabel data."
---

# Aturan Animasi UI (No 3D on Wide Tables)

## Konteks
Penggunaan efek animasi 3D, parallax, atau *tilt* (seperti `TiltCard` atau efek pergeseran perspektif 3D yang mengikuti kursor) sangat bagus untuk komponen *card* kecil seperti metrik atau profil. Namun, jika diterapkan pada komponen "box gede dan panjang" seperti **tabel data bergeser (horizontal scroll)** atau **grid lebar**, animasi ini justru menyebabkan distorsi ekstrem yang tidak nyaman dilihat (teks di ujung tabel seakan menjauh atau bergoyang brutal).

## Aturan
- **DILARANG KERAS** membungkus elemen tabel data (`<table>`), grid kalender penuh, atau kontainer lebar (ber-overflow horizontal) dengan komponen animasi 3D/Parallax (misal: `TiltCard`).
- Gunakan `<div className="glass-panel ...">` standar tanpa efek 3D/parallax untuk membungkus elemen-elemen data lebar tersebut.
- Animasi 3D dan *parallax* HANYA diperuntukkan bagi *card* indikator berukuran kecil hingga menengah.
