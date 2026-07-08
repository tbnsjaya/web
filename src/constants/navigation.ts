import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Warehouse,
  ShoppingBag,
  Users,
  Truck,
  CreditCard,
  FileText,
  BarChart3,
  Image,
  Tag,
  Bell,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { ROUTES } from "./routes";

/**
 * Tipe untuk item navigasi sidebar
 */
export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  children?: NavItem[];
  /** Role yang diizinkan mengakses menu ini */
  roles?: ("owner" | "admin" | "kasir")[];
}

/**
 * Konfigurasi Sidebar Dashboard
 * Dikelompokkan berdasarkan section
 */
export const SIDEBAR_NAV: { section: string; items: NavItem[] }[] = [
  {
    section: "Utama",
    items: [
      {
        label: "Dashboard",
        href: ROUTES.DASHBOARD,
        icon: LayoutDashboard,
        roles: ["owner", "admin", "kasir"],
      },
      {
        label: "POS",
        href: ROUTES.POS,
        icon: ShoppingCart,
        roles: ["owner", "admin", "kasir"],
      },
    ],
  },
  {
    section: "Inventaris",
    items: [
      {
        label: "Produk",
        href: ROUTES.PRODUCTS_ADMIN,
        icon: Package,
        roles: ["owner", "admin"],
        children: [
          { label: "Daftar Produk", href: ROUTES.PRODUCTS_ADMIN, icon: Package },
          { label: "Kategori", href: ROUTES.CATEGORIES_ADMIN, icon: Tag },
        ],
      },
      {
        label: "Inventory",
        href: ROUTES.INVENTORY,
        icon: Warehouse,
        roles: ["owner", "admin"],
        children: [
          { label: "Mutasi Stok", href: ROUTES.STOCK_MOVEMENTS, icon: Warehouse },
          { label: "Stock Opname", href: ROUTES.STOCK_OPNAME, icon: Warehouse },
        ],
      },
      {
        label: "Pembelian",
        href: ROUTES.PURCHASES,
        icon: ShoppingBag,
        roles: ["owner", "admin"],
      },
    ],
  },
  {
    section: "CRM & Keuangan",
    items: [
      {
        label: "Pelanggan",
        href: ROUTES.CUSTOMERS,
        icon: Users,
        roles: ["owner", "admin", "kasir"],
      },
      {
        label: "Kasbon",
        href: ROUTES.KASBON,
        icon: CreditCard,
        roles: ["owner", "admin", "kasir"],
      },
      {
        label: "Supplier",
        href: ROUTES.SUPPLIERS,
        icon: Truck,
        roles: ["owner", "admin"],
        children: [
          { label: "Daftar Supplier", href: ROUTES.SUPPLIERS, icon: Truck },
          { label: "Hutang Supplier", href: ROUTES.SUPPLIER_DEBT, icon: CreditCard },
        ],
      },
    ],
  },
  {
    section: "Konten Website",
    items: [
      {
        label: "Blog",
        href: ROUTES.BLOG_CMS,
        icon: FileText,
        roles: ["owner", "admin"],
      },
      {
        label: "Media",
        href: ROUTES.MEDIA,
        icon: Image,
        roles: ["owner", "admin"],
      },
      {
        label: "Promosi",
        href: ROUTES.PROMOTIONS,
        icon: Tag,
        roles: ["owner", "admin"],
      },
    ],
  },
  {
    section: "Analitik & Laporan",
    items: [
      {
        label: "Laporan",
        href: ROUTES.REPORTS,
        icon: BarChart3,
        roles: ["owner", "admin"],
      },
      {
        label: "Analytics",
        href: ROUTES.ANALYTICS,
        icon: BarChart3,
        roles: ["owner"],
      },
    ],
  },
  {
    section: "Sistem",
    items: [
      {
        label: "Notifikasi",
        href: "/admin/notifications",
        icon: Bell,
        roles: ["owner", "admin", "kasir"],
      },
      {
        label: "Pengaturan",
        href: ROUTES.SETTINGS,
        icon: Settings,
        roles: ["owner"],
      },
    ],
  },
];

/**
 * Navigasi Publik (Navbar Website)
 */
export const PUBLIC_NAV: { label: string; href: string }[] = [
  { label: "Beranda", href: ROUTES.HOME },
  { label: "Tentang Kami", href: ROUTES.ABOUT },
  { label: "Produk", href: ROUTES.PRODUCTS },
  { label: "Artikel", href: ROUTES.BLOG },
  { label: "Kontak", href: ROUTES.CONTACT },
];
