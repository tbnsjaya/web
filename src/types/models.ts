/**
 * User & Auth Types
 */
export type UserRole = "owner" | "admin" | "kasir";

export interface User {
  id: string;
  name: string;
  username: string;
  roleId: string;
  roleName: UserRole;
  status: "active" | "inactive";
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

/**
 * Category Types
 */
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

/**
 * Product Types
 * (Stok tidak disimpan di sini — lihat StockMovement / Inventory Ledger)
 */
export interface Product {
  id: string;
  categoryId: string;
  categoryName?: string;
  name: string;
  slug: string;
  sku: string;
  barcode?: string;
  buyPrice: number;
  sellPrice: number;
  unit: string;
  isActive: boolean;
  images?: ProductImage[];
  // Stok dihitung secara runtime dari stock_movements
  currentStock?: number;
}

export interface ProductImage {
  id: string;
  productId: string;
  imageUrl: string;
  isPrimary: boolean;
}

/**
 * Supplier Types
 */
export interface Supplier {
  id: string;
  name: string;
  contact: string;
  address: string;
}

/**
 * Customer Types
 */
export type CustomerType = "umum" | "member";

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  type: CustomerType;
}

/**
 * Sales / POS Types
 */
export type PaymentMethod = "cash" | "transfer" | "kasbon";
export type SaleStatus = "completed" | "kasbon" | "void";

export interface Sale {
  id: string;
  invoiceNo: string;
  date: string;
  customerId?: string;
  customerName?: string;
  userId: string;
  kasirName?: string;
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  status: SaleStatus;
  details?: SaleDetail[];
}

export interface SaleDetail {
  id: string;
  saleId: string;
  productId: string;
  productName?: string;
  qty: number;
  price: number;
  subtotal: number;
}

/**
 * Purchase Types
 */
export type PurchaseStatus = "lunas" | "hutang";

export interface Purchase {
  id: string;
  poNumber: string;
  date: string;
  supplierId: string;
  supplierName?: string;
  userId: string;
  total: number;
  status: PurchaseStatus;
  details?: PurchaseDetail[];
}

export interface PurchaseDetail {
  id: string;
  purchaseId: string;
  productId: string;
  productName?: string;
  qty: number;
  price: number;
  subtotal: number;
}

/**
 * Stock Movement (Inventory Ledger) Types
 */
export type MovementType = "IN" | "OUT" | "ADJ";

export interface StockMovement {
  id: string;
  productId: string;
  productName?: string;
  type: MovementType;
  qty: number;
  referenceId?: string; // sale_id atau purchase_id
  date: string;
  note?: string;
}

/**
 * Kasbon Types
 */
export type KasbonStatus = "unpaid" | "partial" | "paid";

export interface Kasbon {
  id: string;
  saleId: string;
  customerId: string;
  customerName?: string;
  amount: number;
  dueDate: string;
  status: KasbonStatus;
  payments?: KasbonPayment[];
}

export interface KasbonPayment {
  id: string;
  kasbonId: string;
  amount: number;
  date: string;
  userId: string;
}

/**
 * Supplier Debt Types
 */
export type DebtStatus = "unpaid" | "partial" | "paid";

export interface SupplierDebt {
  id: string;
  purchaseId: string;
  supplierId: string;
  supplierName?: string;
  amount: number;
  dueDate: string;
  status: DebtStatus;
  payments?: SupplierDebtPayment[];
}

export interface SupplierDebtPayment {
  id: string;
  supplierDebtId: string;
  amount: number;
  date: string;
  userId: string;
}

/**
 * Blog Types
 */
export type BlogStatus = "draft" | "published";

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  authorId: string;
  authorName?: string;
  categoryId: string;
  categoryName?: string;
  coverImage?: string;
  status: BlogStatus;
  createdAt: string;
}

/**
 * Media Types
 */
export interface Media {
  id: string;
  fileName: string;
  url: string;
  type: string;
  uploadedAt: string;
}

/**
 * Promotion Types
 */
export type DiscountType = "percentage" | "fixed";

export interface Promotion {
  id: string;
  name: string;
  productId?: string;
  discountType: DiscountType;
  discountValue: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

/**
 * Banner Types
 */
export interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  link?: string;
  isActive: boolean;
  position: number;
}

/**
 * Notification Types
 */
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

/**
 * Website Settings Types
 */
export interface WebsiteSettings {
  companyName: string;
  logoUrl: string;
  waNumber: string;
  address: string;
  email: string;
  operationalHours: string;
  gmapsUrl: string;
}
