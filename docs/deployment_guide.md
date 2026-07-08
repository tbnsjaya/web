# Deployment Guide - TB NS Jaya

Panduan deployment lengkap Next.js 16 (Static Export), Google Apps Script, dan Google Spreadsheet.

---

## 1. Setup Google Spreadsheet & Google Apps Script
1. Buat salinan Google Spreadsheet berdasarkan struktur database TB NS Jaya:
   - Link Spreadsheet: [Google Sheets](https://docs.google.com/spreadsheets/d/1GPVg576MXj9yGBVDPi4ygg8JY64OKp1Kgq3EslO18XM/edit?usp=sharing)
2. Buka Spreadsheet -> **Extensions** -> **Apps Script**.
3. Hapus kode default dan ganti dengan konten file `Code.gs` dari repository Anda.
4. Klik **Deploy** -> **New Deployment**.
   - Select type: **Web App**.
   - Description: `TB NS Jaya Production API v1`.
   - Execute as: **Me**.
   - Who has access: **Anyone** (wajib untuk REST API).
5. Salin **Web App URL** yang dihasilkan (akan berakhiran `/exec`).

---

## 2. Setup Environment Variables Local
1. Buat file `.env.local` di folder root project:
   ```env
   NEXT_PUBLIC_API_URL=https://script.google.com/macros/s/AKfycbzqfFXx7y4CfVDJGv5twLxih4z3Q1sakewZrlw-2v2rXs683yBie0HNgOllM4DAg9brMQ/exec
   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-P1M8K23
   NEXT_PUBLIC_GTM_ID=GTM-P1M8K23
   NEXT_PUBLIC_WA_NUMBER=6282330449041
   ```

---

## 3. Deploy Otomatis via GitHub Actions (Sangat Direkomendasikan)

Project ini telah dilengkapi dengan GitHub Actions workflow [deploy.yml](file:///.github/workflows/deploy.yml) agar sistem dapat melakukan build dan deployment otomatis ke GitHub Pages setiap kali Anda melakukan `git push` ke branch `main`.

### Langkah-langkah Setup di GitHub:

#### A. Konfigurasi Sumber GitHub Pages
1. Masuk ke halaman repositori Anda di GitHub.
2. Buka menu **Settings** -> **Pages** (di bawah menu Code and automation).
3. Pada bagian **Build and deployment** -> **Source**, ubah pilihan dropdown menjadi **GitHub Actions** (bukan *Deploy from a branch*).

#### B. Setup Environment Variables / Secrets di GitHub
Agar website hasil build otomatis memiliki akses ke API URL yang benar dan nomor WhatsApp yang tepat, Anda perlu memasukkan variabel tersebut ke dalam GitHub Secrets:
1. Di halaman repositori GitHub Anda, buka menu **Settings** -> **Secrets and variables** -> **Actions**.
2. Klik tombol **New repository secret**.
3. Tambahkan Secrets berikut satu per satu:
   - **`NEXT_PUBLIC_API_URL`**: Isi dengan URL Web App dari Google Apps Script Anda (URL berakhiran `/exec`).
   - **`NEXT_PUBLIC_GA_MEASUREMENT_ID`**: Isi dengan Google Analytics ID Anda (misal: `G-P1M8K23`).
   - **`NEXT_PUBLIC_GTM_ID`**: Isi dengan Google Tag Manager ID Anda (misal: `GTM-P1M8K23`).
   - **`NEXT_PUBLIC_WA_NUMBER`**: Isi dengan nomor WhatsApp bisnis tujuan (misal: `6282330449041`).
   - **`NEXT_PUBLIC_APP_URL`**: Isi dengan URL website live Anda (misal: `https://username.github.io` atau custom domain).

*Catatan: Jika Secrets tidak diisi, GitHub Actions akan menggunakan nilai default yang telah disiapkan di file workflow.*

#### C. Cara Deploy Otomatis
Setelah setup di atas selesai, setiap kali Anda melakukan perubahan kode dan mem-push ke branch `main`:
```bash
git add .
git commit -m "Update website feature"
git push origin main
```
1. GitHub akan otomatis menjalankan workflow build & deployment.
2. Anda bisa memantau prosesnya di tab **Actions** di repositori GitHub Anda.
3. Setelah selesai, website Anda akan diperbarui secara otomatis dalam beberapa detik!

---

## 4. Deploy Manual via Local (Alternatif)

Jika Anda ingin melakukan build dan deployment secara manual langsung dari komputer lokal Anda:

1. Pastikan repository Anda terhubung ke GitHub:
   - Link Repo: `https://github.com/tbnsjaya/web.git`
2. Pastikan file `.env.local` sudah terisi dengan benar.
3. Jalankan perintah deploy manual:
   ```bash
   npm run deploy
   ```
   *Perintah ini akan secara otomatis melakukan kompilasi (`npm run build`) dan mengunggah folder hasil compile (`out/`) ke branch `gh-pages` menggunakan library helper `gh-pages`.*
4. Di menu **Settings** -> **Pages** pada GitHub, pastikan Source diatur ke **Deploy from a branch** dan pilih branch **`gh-pages`** (folder `/root`).

