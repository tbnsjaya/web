# Maintenance Guide - TB NS Jaya

Panduan pemeliharaan sistem, pencadangan database Google Spreadsheet, audit log, dan perpanjangan API token.

## 1. Backup & Recovery Database
Google Spreadsheet bertindak sebagai database transaksional. Untuk menghindari kehilangan data:
- Buka Spreadsheet database secara berkala.
- Klik **File** -> **Version history** -> **Name current version** (misal: `Backup Akhir Bulan Juli 2026`).
- Klik **File** -> **Make a copy** untuk mengunduh versi backup fisik dalam format `.xlsx`.

## 2. Troubleshooting Token JWT Apps Script
Sistem autentikasi menggunakan JSON Web Token (JWT) sederhana yang didekripsi di Google Apps Script.
- Jika kasir gagal login dan memunculkan error "Unauthorized 401":
  - Pastikan jam pada perangkat kasir telah tersinkronisasi secara otomatis (Time synchronization).
  - Periksa log di Google Apps Script editor (**Executions**) untuk melihat jika ada error runtime pada fungsi `doPost`.

## 3. Limitasi Quota Google Apps Script
Google membatasi eksekusi Apps Script (Google Workspace account / personal):
- **Triggers**: Maksimal 20 eksekusi per menit.
- **URL Fetch**: 20.000 call per hari.
- Untuk performa optimal, disarankan agar kasir meminimalkan jumlah refresh browser saat POS sedang aktif (POS data di-cache via Zustand & SWR).
