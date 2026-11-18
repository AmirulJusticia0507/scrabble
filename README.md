# 🕹️ Little Arcade (`a little arcade.`)

> Koleksi permainan retro-arcade modern berbasis web: ultra-cepat, *offline-first*, tanpa dependensi eksternal, dan siap diinstal sebagai **Progressive Web App (PWA)** serta di-deploy langsung ke **Vercel**.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-brightgreen.svg)](#-progressive-web-app-pwa)
[![Deploy with Vercel](https://img.shields.io/badge/Deploy-Vercel-black.svg?logo=vercel)](#-deploy-ke-vercel)

---

## 🎮 Permainan yang Tersedia

### 1. Scrabble (`index.html` / `/scrabble`)
* **Mode Latihan 10 × 10:** Papan kata ukuran ringkas dengan rak 7 huruf otomatis.
* **Kamus Lokal Offline 248k Kata:** Verifikasi instan menggunakan JavaScript Set lokal tanpa perlu koneksi internet.
* **Petak Bonus Dinamis:**
  * **2L (Double Letter):** Menggandakan nilai poin huruf tertentu.
  * **2W (Double Word):** Melipatgandakan total poin seluruh kata.
* **Integrasi Definisi Kata:** Lookup arti kata bahasa Inggris otomatis via Dictionary API publik (dengan timeout aman non-blocking).

### 2. Karambol (`index2.html` / `/karambol`)
* **Simulasi Fisika 2D Akurat:** Menggunakan fixed timestep 60 FPS dan 3 *sub-steps* per frame untuk mencegah penetrasi/tunneling.
* **Tabrakan Elastis & Lubang:** Deteksi benturan lingkaran (*circle-to-circle collision*), gesekan papan, dan 4 kantung sudut.
* **Audio Web Audio API Sintetis:** Efek suara benturan koin (*clack*), pantulan dinding kayu, dan koin masuk lubang tanpa aset audio eksternal.
* **Kontrol Fleksibel:** Tarik *slingshot* striker via Mouse/Touch atau gunakan Keyboard (Panah & Spasi).

### 3. Pachinko (`index3.html` / `/pachinko`)
* **Mekanisme Drop 3 Bola:** Bola jatuh dengan gravitasi realistis dan memantul dinamis di antara pasak rintangan.
* **Tiga Tingkat Kepadatan:** Level 01 (Santai), Level 02 (Ramai), dan Level 03 (Penuh Kejutan).
* **Partikel Visual FX & Audio:** Ledakan kembang api partikel saat meraih **Jackpot 50 poin** serta synthesizer audio dinamis.

---

## 📱 Progressive Web App (PWA)

Aplikasi ini sudah berstandar PWA penuh dengan:
* **Web App Manifest (`manifest.json`):** Nama, warna tema dark `#111514`, ikon resolusi tinggi (SVG vektor dan PNG 192px & 512px maskable).
* **Service Worker (`sw.js`):** Caching *offline-first* seluruh file HTML, CSS, JS, dan kamus kata lokal.
* **Instalasi Mandiri:**
  * **Di Ponsel (Android / iOS):** Buka di Chrome/Safari lalu pilih *"Add to Home Screen"* / *"Install App"*.
  * **Di Desktop (Chrome / Edge):** Klik ikon install di bilah alamat browser untuk menjadikannya aplikasi desktop terpisah.

---

## 🚀 Deploy ke Vercel

Proyek ini telah dilengkapi [vercel.json](file:///c:/laragon/www/scrabble/vercel.json) dengan konfigurasi *Clean URLs*, *Rewrites*, serta *Cache-Control* optimal untuk Service Worker dan PWA.

### Opsi A: Hubungkan Repositori GitHub ke Vercel (Rekomendasi)
1. Buka dashboard [Vercel](https://vercel.com).
2. Klik **Add New Project** → pilih repositori `AmirulJusticia0507/scrabble`.
3. Vercel akan otomatis mendeteksi proyek web statis. Klik **Deploy**.
4. Selesai! Setiap `git push` ke branch `main` akan otomatis memicu deployment produksi secara instan.

### Opsi B: Menggunakan Vercel CLI
```bash
# Login ke akun Vercel Anda
vercel login

# Deploy ke lingkungan preview
vercel

# Deploy langsung ke produksi
vercel --prod
```

---

## 💻 Menjalankan Secara Lokal

Karena proyek ini murni *Vanilla Web (zero-dependency)*, Anda dapat menjalankannya dengan berbagai cara:

### 1. Menggunakan Laragon / XAMPP / Apache
Cukup letakkan folder ini di direktori web root (misalnya `C:\laragon\www\scrabble`) dan buka:
```text
http://localhost/scrabble/
```

### 2. Menggunakan Python Server
```bash
python -m http.server 8000
```
Buka browser di `http://localhost:8000`.

### 3. Menggunakan VS Code Live Server / NodeJS `serve`
```bash
npx serve .
```

---

## 📁 Struktur Berkas

```text
├── index.html              # Halaman Scrabble
├── index2.html             # Halaman Karambol
├── index3.html             # Halaman Pachinko
├── arcade.css              # Styling global & dark theme
├── arcade.js               # Shared header, navigation, & PWA registration
├── scrabble.js             # Logika Scrabble & petak bonus
├── carrom.js               # Fisika & audio karambol
├── pachinko.js             # Simulasi Pachinko & partikel FX
├── manifest.json           # PWA Web App Manifest
├── sw.js                   # PWA Service Worker caching
├── vercel.json             # Konfigurasi deployment Vercel
├── icons/                  # Ikon aplikasi PWA (SVG, PNG 192px, 512px, Maskable)
├── data/                   # Kamus bahasa Inggris lokal 248k kata
└── agents.md               # Pedoman kerja dan roadmap agen AI
```
