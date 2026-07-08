# Coding, Naming & Commit Conventions

## 1. Naming Convention

### File & Folder
| Jenis | Konvensi | Contoh |
|---|---|---|
| Component | PascalCase | `ProductCard.tsx` |
| Hook | camelCase + "use" prefix | `useDebounceSearch.ts` |
| Store | camelCase + "Store" suffix | `posStore.ts` |
| Utility | camelCase | `format.ts`, `helpers.ts` |
| Constants | camelCase | `routes.ts`, `navigation.ts` |
| Type file | camelCase | `models.ts`, `api.ts` |
| Feature folder | kebab-case | `features/pos/`, `features/blog-cms/` |

### Variables & Functions
```typescript
// Baik
const isModalOpen = true;
const handleSubmit = () => {};
const formatCurrency = (n: number) => {};

// Buruk
const open = true;
const submit = () => {};
const fc = (n: number) => {};
```

### TypeScript Types & Interfaces
```typescript
// Interface untuk objek/model domain
interface Product { id: string; name: string; }

// Type untuk union/alias
type PaymentMethod = "cash" | "transfer" | "kasbon";

// Prefix "I" TIDAK digunakan
```

---

## 2. Coding Convention

### Komponen
```tsx
// ✅ Benar — Named export, Props interface lokal
interface ButtonProps {
  label: string;
  onClick: () => void;
}

export function Button({ label, onClick }: ButtonProps) {
  return <button onClick={onClick}>{label}</button>;
}

// ❌ Buruk — Default export, any type
export default function Button({ label, onClick }: any) {
  return <button>{label}</button>;
}
```

### Import Order
```typescript
// 1. React/Next.js built-in
import { useState } from "react";
import Link from "next/link";

// 2. Third-party libraries
import { motion } from "framer-motion";
import useSWR from "swr";

// 3. Alias imports (@/)
import { cn } from "@/utils";
import type { Product } from "@/types";

// 4. Relative imports (hindari jika bisa)
import { localHelper } from "./helpers";
```

### Type Import
```typescript
// Selalu gunakan "import type" untuk type-only imports
import type { Product, User } from "@/types";
```

### Async/Await
```typescript
// ✅ Selalu handle error
async function fetchData() {
  try {
    const data = await gasRequest("getProducts");
    return data;
  } catch (error) {
    handleApiError(error);
  }
}
```

---

## 3. Commit Convention

Format: `type(scope): pesan singkat`

### Types
| Type | Kapan Digunakan |
|---|---|
| `feat` | Fitur baru |
| `fix` | Bug fix |
| `refactor` | Refactoring tanpa fitur/fix |
| `style` | Perubahan style/UI |
| `docs` | Dokumentasi |
| `chore` | Build, config, dependencies |
| `test` | Test |

### Contoh
```
feat(pos): tambahkan fitur diskon persentase
fix(kasbon): perbaiki kalkulasi sisa hutang
style(dashboard): sesuaikan warna sidebar dark mode
docs(readme): update instruksi instalasi
chore: install framer-motion dependency
refactor(api): pindahkan error handler ke file terpisah
```

---

## 4. Folder & Feature Structure

Setiap fitur di `features/` memiliki struktur:
```
features/products/
├── api/          # SWR hooks & gasRequest calls
├── components/   # Komponen khusus fitur ini
├── schemas/      # Zod validation schemas
├── types/        # Type tambahan khusus fitur
└── index.ts      # Barrel export
```

---

## 5. State Management Rules

| State Type | Solusi |
|---|---|
| Server Data (produk, pelanggan) | SWR (`useSWR`) |
| Global UI (sidebar, theme) | Zustand (`useUIStore`) |
| Auth & Session | Zustand Persist (`useAuthStore`) |
| POS Cart | Zustand (`usePOSStore`) |
| Form Data | React Hook Form |
| Local Component State | `useState` |
