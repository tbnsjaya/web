# features/

Direktori ini berisi modul fitur yang dikelompokkan berdasarkan domain bisnis.

## Struktur setiap feature

```
features/<nama-fitur>/
├── api/          # SWR hooks (useProducts, useProduct, dll)
├── components/   # Komponen UI spesifik fitur
├── schemas/      # Zod validation schemas (form validation)
├── types/        # Type/interface tambahan
└── index.ts      # Barrel export publik
```

## Modul yang akan dibuat (Phase berikutnya)

- `auth/` — Login, logout, session management
- `products/` — Katalog produk, CRUD admin
- `categories/` — Manajemen kategori
- `inventory/` — Mutasi stok (Inventory Ledger)
- `pos/` — Point of Sales
- `purchases/` — Pembelian dari supplier
- `customers/` — CRM, data pelanggan
- `kasbon/` — Piutang pelanggan
- `suppliers/` — Master supplier
- `supplier-debt/` — Hutang ke supplier
- `blog/` — Blog CMS
- `media/` — Media library
- `promotions/` — Promosi & banner
- `reports/` — Laporan keuangan & inventaris
- `analytics/` — Website analytics
- `settings/` — Pengaturan website & sistem
