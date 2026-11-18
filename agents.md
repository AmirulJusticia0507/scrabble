# AGENTS.md — Little Arcade Autonomous Development Guide

Dokumen ini menjadi pedoman operasional bagi agen AI dalam mengelola, mengembangkan, dan memelihara proyek **Little Arcade**.

---

## 1. Aturan Kerja Agen (Agent Work Protocol)

1. **Eksekusi Mandiri (Autonomous Execution):**
   * Setiap tugas dikerjakan secara berurutan dan tuntas tanpa memerlukan konfirmasi manual untuk setiap langkah teknis.
   * Setelah sebuah tugas selesai diverifikasi, segera tandai statusnya menjadi `[x]` pada daftar tugas.
   * **Wajib langsung melakukan `git commit` dan `git push` ke `origin/main`** setelah setiap tugas tuntas.
   * Langsung lanjutkan ke tugas berikutnya hingga seluruh roadmap selesai.

2. **Kualitas Kode & Standar Arsitektur:**
   * Mempertahankan filosofi *zero-dependency / vanilla web* (HTML5, modern CSS3, ES6+ JavaScript).
   * Menjaga performa tetap *ultra-fast*, *offline-first*, dan desain *retro-modern arcade* yang konsisten.
   * Seluruh perubahan wajib menjaga kompatibilitas lintas browser dan perangkat (desktop & mobile).

---

## 2. Gambaran Proyek (Project Overview)

* **Nama:** Little Arcade (`a little arcade.`)
* **Repositori:** `https://github.com/AmirulJusticia0507/scrabble.git`
* **Permainan:**
  1. **Scrabble** (`index.html`, `scrabble.js`): Latihan kata papan 10×10 dengan kamus offline 248k kata bahasa Inggris & lookup definisi online.
  2. **Karambol** (`index2.html`, `carrom.js`): Simulasi fisika karambol 2D dengan *sub-stepping*, tabrakan elastis, kontrol mouse slingshot & keyboard.
  3. **Pachinko** (`index3.html`, `pachinko.js`): Simulasi bola jatuh beruntun, pasak dinamis, dan efek suara Web Audio API sintetis.
* **Komponen Bersama:**
  * `arcade.css`: Dark-mode theme, Space Grotesk & DM Sans typography, responsive layout.
  * `arcade.js`: Dynamic template injector (header, navigation, footer), localStorage helpers.

---

## 3. Daftar Tugas & Roadmap Pengembangan

- [x] **Task 1: Inisialisasi Lingkungan & Manajemen Repositori**
  - Buat file `agents.md` berisi panduan kerja agen dan daftar tugas terperinci.
  - Tambahkan file `.gitignore` standar web.
  - Bersihkan file artefak kosong `game scrabble amirul.txt`.
  - Commit & push ke repository.

- [x] **Task 2: Refactoring & Formatisasi Kode Inti**
  - Format ulang JavaScript yang padat/semi-minified (`arcade.js`, `scrabble.js`, `carrom.js`, `pachinko.js`) menjadi kode terstruktur, bersih, dan berorientasi modularitas.
  - Pertahankan seluruh fungsionalitas dan logika eksisting tanpa regresi.
  - Commit & push ke repository.

- [x] **Task 3: Efek Suara Web Audio API untuk Karambol (Carrom Sound FX)**
  - Implementasikan sound engine menggunakan Web Audio API pada `carrom.js` (suara tabrakan koin, pantulan tepi papan, dan koin masuk lubang).
  - Tambahkan tombol kontrol toggle suara di `index2.html` konsisten dengan Pachinko.
  - Commit & push ke repository.

- [x] **Task 4: Peningkatan Gameplay Scrabble (Petak Bonus & Skor Dinamis)**
  - Tambahkan petak bonus (Double Letter `2L` dan Double Word `2W`) pada papan 10×10.
  - Perbarui style di `arcade.css` dan kalkulasi skor di `scrabble.js` untuk melipatgandakan poin secara akurat.
  - Perbarui petunjuk permainan di `index.html`.
  - Commit & push ke repository.

- [x] **Task 5: Efek Visual & Partikel Pachinko (Visual FX & Feedback)**
  - Tambahkan partikel visual / ledakan bintang kecil saat bola mengenai pasak atau mendarat di slot poin tinggi (terutama slot 50).
  - Tingkatkan kepuasan visual pemain (*game feel* / *juice*).
  - Commit & push ke repository.

- [x] **Task 6: Verifikasi Akhir & Dokumentasi Penutup**
  - Uji seluruh ketiga game (Scrabble, Karambol, Pachinko) untuk memastikan tidak ada error JavaScript di console.
  - Perbarui status seluruh task di `agents.md` menjadi selesai.
  - Commit & push penutup.

- [x] **Task 7: Setup PWA Manifest & App Icons**
  - Buat direktori `icons/` dan buat icon aset SVG dan PNG (192×192 & 512×512) dengan tema visual Little Arcade.
  - Buat file `manifest.json` lengkap dengan metadata PWA, start_url, theme_color, dan shortcuts ke setiap permainan.
  - Tambahkan meta tags PWA (manifest, theme-color, apple-touch-icon, mobile-web-app) di `index.html`, `index2.html`, dan `index3.html`.
  - Commit & push ke repository.

- [x] **Task 8: Implementasi Service Worker & Offline Caching Engine**
  - Buat `sw.js` (Service Worker) dengan strategi caching offline-first untuk shell, CSS, JS, dan kamus lokal.
  - Tambahkan registrasi Service Worker di `arcade.js` secara otomatis.
  - Commit & push ke repository.

- [x] **Task 9: Konfigurasi Vercel & Optimasi Deployment**
  - Buat file konfigurasi `vercel.json` dengan caching header, clean URLs, dan header PWA `Service-Worker-Allowed`.
  - Buat `README.md` utama di root repositori dengan dokumentasi proyek, panduan PWA, dan panduan deploy ke Vercel.
  - Commit & push penutup.

---

## 4. Riwayat Pengerjaan (Changelog)

* **Task 1 (`a79963e`):** Inisialisasi panduan operasional `agents.md`, setup `.gitignore`, pembersihan file kosong `game scrabble amirul.txt`.
* **Task 2 (`9b3ee23`):** Refactoring format kode JavaScript (`arcade.js`, `scrabble.js`, `carrom.js`, `pachinko.js`) agar rapi, modular, dan mudah dipelihara.
* **Task 3 (`7c9d95b`):** Penambahan sound engine sintetis Web Audio API pada Karambol (suara benturan koin, pantulan kayu tepi, koin masuk kantung) beserta tombol toggle suara di UI.
* **Task 4 (`8147cc6`):** Penambahan petak bonus 2L (Double Letter) dan 2W (Double Word) pada papan Scrabble 10×10 dengan kalkulasi skor dinamis.
* **Task 5 (`fe020bd`):** Penambahan sistem partikel visual FX pada Pachinko saat benturan pasak dan ledakan confetti/bintang saat jackpot 50 poin.
* **Task 6 (`08324d4`):** Verifikasi lintas file dan dokumentasi penutup.
* **Task 7 (`6dd8bab`):** Konfigurasi PWA Web App Manifest (`manifest.json`), meta tags mobile/retina, dan pembuatan icon vektor SVG serta PNG (192px, 512px, maskable).
* **Task 8 (`698af2c`):** Pembuatan Service Worker (`sw.js`) dengan strategi offline-first caching dan registrasi otomatis di `arcade.js`.
* **Task 9:** Konfigurasi deployment `vercel.json` (clean URLs, rewrites, headers caching PWA) dan pembuatan `README.md` utama.


