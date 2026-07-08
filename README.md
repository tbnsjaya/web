# TB NS Jaya — Platform Digital Terintegrasi

Platform digital enterprise untuk toko bangunan TB NS Jaya, mencakup Website Publik, POS, Inventory (Ledger), CRM, Blog CMS, dan Analytics.

## Tech Stack

| Layer      | Teknologi                               |
|------------|------------------------------------------|
| Framework  | Next.js 16 (App Router)                 |
| Styling    | Tailwind CSS v4                         |
| Animasi    | Framer Motion                           |
| Icons      | Lucide React                            |
| State      | Zustand (UI/POS), SWR (Server Data)     |
| Forms      | React Hook Form + Zod                   |
| Charts     | Chart.js + react-chartjs-2              |
| Notifikasi | Sonner                                  |
| Tema       | next-themes (Light/Dark)                |
| Backend    | Google Apps Script (Code.gs)            |
| Database   | Google Spreadsheet (25 Sheets)          |
| Deployment | GitHub Pages (Static Export)            |

## Quick Start

```bash
# 1. Clone repository
git clone https://github.com/yourusername/tbnsjaya.git
cd tbnsjaya

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env.local
# Edit .env.local sesuai konfigurasi Anda

# 4. Jalankan development server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## Scripts

```bash
npm run dev          # Development server
npm run build        # Production build (static export)
npm run lint         # ESLint check
npm run lint:fix     # ESLint auto-fix
npm run format       # Prettier format
npm run type-check   # TypeScript check
```

## Struktur Folder

```
src/
├── app/                  # Next.js App Router
│   ├── (public)/         # Public Website routes
│   ├── (admin)/          # Dashboard routes
│   ├── layout.tsx        # Root Layout (SEO, Fonts, Providers)
│   ├── globals.css       # Design Tokens & Global Styles
│   ├── sitemap.ts        # Dynamic Sitemap
│   └── robots.ts         # Robots.txt
│
├── components/           # UI Components (Atomic Design)
│   ├── providers/        # Context Providers
│   ├── ui/               # Atoms & Molecules
│   ├── shared/           # Organisms
│   └── layouts/          # Templates
│
├── features/             # Feature-based modules
│   ├── auth/
│   ├── products/
│   ├── pos/
│   ├── inventory/
│   └── ...
│
├── hooks/                # Custom React Hooks
├── stores/               # Zustand State Management
├── services/             # API Communication Layer
│   └── api/              # Fetch client, request helpers
│
├── types/                # TypeScript Interfaces
├── utils/                # Pure utility functions
├── constants/            # App-wide constants
└── styles/               # Additional stylesheets
```

## Konvensi Kode

Lihat [CONVENTIONS.md](./CONVENTIONS.md) untuk panduan lengkap.

## Dokumentasi Teknis

- [SRS](../docs/srs_tb_ns_jaya.md) — Software Requirement Specification
- [Design Spec](../docs/design_specification_tb_ns_jaya.md) — UI/UX Blueprint

## Environment Variables

Salin `.env.example` ke `.env.local` dan isi nilai yang sesuai:

```bash
cp .env.example .env.local
```

| Variable                       | Keterangan                        |
|--------------------------------|-----------------------------------|
| `NEXT_PUBLIC_API_URL`          | URL Google Apps Script Web App    |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID`| Google Analytics 4 Measurement ID |
| `NEXT_PUBLIC_GTM_ID`           | Google Tag Manager Container ID   |
| `NEXT_PUBLIC_WA_NUMBER`        | Nomor WhatsApp bisnis             |

## Arsitektur

```
Browser (Next.js) → Google Apps Script → Google Spreadsheet
                  ↘ Google Analytics 4 (via GTM)
                  ↘ WhatsApp (redirect link)
```

---
**TB NS Jaya** — Platform Digital Toko Bangunan Modern
