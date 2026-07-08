# Deployment Guide - TB NS Jaya

Panduan deployment lengkap Next.js 16 (Static Export), Google Apps Script, dan Google Spreadsheet.

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

## 2. Setup Environment Variables Local
1. Buat file `.env.local` di folder root project:
   ```env
   NEXT_PUBLIC_API_URL=https://script.google.com/macros/s/AKfycbw78VLFu2utibnz7T2PheYMW-O3R7i-fbDeFM8e9BmiX32dNNgofJ_xzUNhsQPe_mnpIA/exec
   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-P1M8K23
   NEXT_PUBLIC_GTM_ID=GTM-P1M8K23
   NEXT_PUBLIC_WA_NUMBER=6282330449041
   ```

## 3. Build & Static Export (GitHub Pages)
1. Jalankan perintah kompilasi build static:
   ```bash
   npm run build
   ```
2. Next.js akan menghasilkan folder `out` di root direktori.
3. Folder `out` ini berisi seluruh aset HTML/CSS/JS statis yang siap di-host di GitHub Pages.

## 4. Deploy ke GitHub Pages
1. Pastikan repository Anda terhubung ke GitHub:
   - Link Repo: `https://github.com/tbnsjaya/web.git`
2. Instal `gh-pages` helper untuk mempermudah upload folder `out`:
   ```bash
   npm install --save-dev gh-pages
   ```
3. Tambahkan script deployment di `package.json`:
   ```json
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d out"
   }
   ```
4. Jalankan perintah deploy:
   ```bash
   npm run deploy
   ```
5. Buka repository GitHub -> **Settings** -> **Pages**.
   - Atur source ke cabang `gh-pages`.
   - Simpan dan website akan live dalam beberapa menit!
