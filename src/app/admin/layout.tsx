"use client";

import React from "react";
import { AuthGuard } from "@/components/providers";
import { useAuth } from "@/hooks/useAuth";
import { useUIStore } from "@/stores";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  ShoppingBag,
  ShoppingCart,
  Layers,
  Truck,
  Users,
  Wallet,
  Receipt,
  FileText,
  Image,
  Tag,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  Bell,
  User as UserIcon,
  Shield,
  HelpCircle
} from "lucide-react";

interface MenuItem {
  title: string;
  path: string;
  icon: React.ComponentType<any>;
  permission?: string;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, checkPermission } = useAuth();
  const {
    isSidebarCollapsed,
    toggleSidebarCollapse,
    isMobileNavOpen,
    setMobileNavOpen,
  } = useUIStore();
  
  const pathname = usePathname();

  // Define sidebar menu section configurations
  const menuSections: MenuSection[] = [
    {
      title: "Utama",
      items: [
        { title: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard, permission: "dashboard.read" },
        { title: "Point of Sales", path: "/admin/pos", icon: ShoppingCart, permission: "sales.create" },
      ],
    },
    {
      title: "Master Data",
      items: [
        { title: "Produk", path: "/admin/products", icon: ShoppingBag, permission: "products.read" },
        { title: "Kategori", path: "/admin/categories", icon: Layers, permission: "categories.read" },
        { title: "Supplier", path: "/admin/suppliers", icon: Truck, permission: "suppliers.read" },
        { title: "Pelanggan", path: "/admin/customers", icon: Users, permission: "customers.read" },
      ],
    },
    {
      title: "Transaksi & Stok",
      items: [
        { title: "Pembelian", path: "/admin/purchases", icon: Receipt, permission: "purchases.read" },
        { title: "Stok Barang", path: "/admin/inventory", icon: Layers, permission: "stock.read" },
        { title: "Hutang Supplier", path: "/admin/suppliers/debt", icon: Wallet, permission: "debt.read" },
        { title: "Kasbon Pelanggan", path: "/admin/kasbon", icon: Wallet, permission: "kasbon.read" },
      ],
    },
    {
      title: "Konten & Promo",
      items: [
        { title: "Blog CMS", path: "/admin/blog", icon: FileText, permission: "blog.create" },
        { title: "Media Manager", path: "/admin/media", icon: Image, permission: "media.read" },
        { title: "Promosi & Banner", path: "/admin/promotions", icon: Tag, permission: "promotion.read" },
      ],
    },
    {
      title: "Laporan & Sistem",
      items: [
        { title: "Laporan Keuangan", path: "/admin/reports", icon: BarChart3, permission: "reports.read" },
        { title: "Pengaturan Sistem", path: "/admin/settings/users", icon: Settings, permission: "settings.read" },
      ],
    },
  ];

  // Helper to filter menus based on permissions
  const filteredSections = menuSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) =>
        item.permission ? checkPermission(item.permission) : true
      ),
    }))
    .filter((section) => section.items.length > 0);

  // Helper to format role name for display badge
  const getRoleBadgeStyle = (role: string) => {
    switch (role?.toLowerCase()) {
      case "owner":
        return "bg-orange-500/10 text-orange-500 border border-orange-500/20";
      case "admin":
        return "bg-blue-500/10 text-blue-500 border border-blue-500/20";
      default:
        return "bg-slate-500/10 text-slate-500 border border-slate-500/20";
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen flex bg-[var(--background)]">
        {/* ==========================================
            DESKTOP SIDEBAR
            ========================================== */}
        <aside
          className={`hidden md:flex flex-col border-r border-[var(--border)] bg-[var(--surface)] transition-all duration-300 relative z-30 ${
            isSidebarCollapsed ? "w-20" : "w-64"
          }`}
        >
          {/* Logo & Toggle Header */}
          <div className="h-16 px-4 border-b border-[var(--border)] flex items-center justify-between">
            {!isSidebarCollapsed && (
              <div className="flex items-center space-x-2">
                <span className="w-8 h-8 rounded-lg bg-[var(--primary)] flex items-center justify-center text-white font-bold">
                  N
                </span>
                <span className="font-heading font-extrabold text-[var(--text-heading)] tracking-wider">
                  TB NS JAYA
                </span>
              </div>
            )}
            {isSidebarCollapsed && (
              <span className="w-8 h-8 rounded-lg bg-[var(--primary)] flex items-center justify-center text-white font-bold mx-auto">
                N
              </span>
            )}
            <button
              onClick={toggleSidebarCollapse}
              className="absolute -right-3 top-6 w-6 h-6 rounded-full border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--background)] text-[var(--text-muted)] hover:text-[var(--text-body)] flex items-center justify-center shadow-sm cursor-pointer"
            >
              {isSidebarCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin">
            {filteredSections.map((section, idx) => (
              <div key={idx} className="space-y-1.5">
                {!isSidebarCollapsed && (
                  <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest px-3 block">
                    {section.title}
                  </span>
                )}
                <div className="space-y-1">
                  {section.items.map((item, itemIdx) => {
                    const isActive = pathname === item.path;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={itemIdx}
                        href={item.path}
                        title={isSidebarCollapsed ? item.title : undefined}
                        className={`w-full flex items-center rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium transition-all group ${
                          isActive
                            ? "bg-[var(--primary)] text-white shadow-md shadow-orange-500/10"
                            : "text-[var(--text-body)] hover:bg-[var(--color-slate-100)] dark:hover:bg-[var(--color-slate-800)] hover:text-[var(--text-heading)]"
                        }`}
                      >
                        <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-white" : "text-[var(--text-muted)] group-hover:text-[var(--text-heading)]"}`} />
                        {!isSidebarCollapsed && (
                          <span className="ml-3 truncate">{item.title}</span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* User Profile Footer */}
          <div className="p-4 border-t border-[var(--border)] bg-[var(--border-muted)] flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-[var(--primary)] text-white flex items-center justify-center flex-shrink-0">
              <UserIcon className="w-5 h-5" />
            </div>
            {!isSidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[var(--text-heading)] truncate">
                  {user?.name}
                </p>
                <div className="flex items-center mt-0.5">
                  <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${getRoleBadgeStyle(user?.roleName || "")}`}>
                    {user?.roleName}
                  </span>
                </div>
              </div>
            )}
            {!isSidebarCollapsed && (
              <button
                onClick={logout}
                title="Keluar Sesi"
                className="p-1.5 rounded-lg hover:bg-[var(--color-slate-200)] dark:hover:bg-[var(--color-slate-700)] text-[var(--text-muted)] hover:text-red-500 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </aside>

        {/* ==========================================
            MOBILE SIDEBAR DRAWER
            ========================================== */}
        {isMobileNavOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
              onClick={() => setMobileNavOpen(false)}
            ></div>

            {/* Content */}
            <div className="relative flex flex-col w-64 max-w-xs bg-[var(--surface)] h-full border-r border-[var(--border)] p-4 animate-in slide-in-from-left duration-200">
              <div className="flex items-center justify-between pb-4 border-b border-[var(--border)] mb-4">
                <div className="flex items-center space-x-2">
                  <span className="w-8 h-8 rounded-lg bg-[var(--primary)] flex items-center justify-center text-white font-bold">
                    N
                  </span>
                  <span className="font-heading font-extrabold text-[var(--text-heading)]">
                    TB NS JAYA
                  </span>
                </div>
                <button
                  onClick={() => setMobileNavOpen(false)}
                  className="p-1 rounded-lg border border-[var(--border)] text-[var(--text-muted)]"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto space-y-6">
                {filteredSections.map((section, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest px-3 block">
                      {section.title}
                    </span>
                    <div className="space-y-1">
                      {section.items.map((item, itemIdx) => {
                        const isActive = pathname === item.path;
                        const Icon = item.icon;
                        return (
                          <Link
                            key={itemIdx}
                            href={item.path}
                            onClick={() => setMobileNavOpen(false)}
                            className={`w-full flex items-center rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium transition-all ${
                              isActive
                                ? "bg-[var(--primary)] text-white"
                                : "text-[var(--text-body)] hover:bg-[var(--color-slate-100)]"
                            }`}
                          >
                            <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                            <span>{item.title}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </nav>

              <div className="pt-4 border-t border-[var(--border)] flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[var(--text-heading)]">
                      {user?.name}
                    </p>
                    <span className={`text-[9px] uppercase font-bold px-1 rounded ${getRoleBadgeStyle(user?.roleName || "")}`}>
                      {user?.roleName}
                    </span>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="p-1.5 rounded-lg hover:bg-[var(--color-slate-100)] text-[var(--text-muted)] hover:text-red-500"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            MAIN CONTENT AREA
            ========================================== */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header */}
          <header className="h-16 border-b border-[var(--border)] bg-[var(--surface)] px-4 flex items-center justify-between sticky top-0 z-20">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setMobileNavOpen(true)}
                className="p-1.5 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-body)] md:hidden cursor-pointer"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h2 className="font-heading text-lg font-bold text-[var(--text-heading)] truncate capitalize">
                {pathname?.split("/").pop()?.replace(/-/g, " ")}
              </h2>
            </div>

            <div className="flex items-center space-x-3">
              {/* Notifications Trigger */}
              <button className="p-1.5 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-body)] relative cursor-pointer">
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[var(--primary)]"></span>
              </button>

              {/* Status Badge */}
              <div className="hidden sm:flex items-center space-x-1.5 bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 px-2.5 py-1 rounded-[var(--radius-full)] text-xs font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                <span>API Terhubung</span>
              </div>
            </div>
          </header>

          {/* Main Area */}
          <main className="flex-1 overflow-y-auto p-6 scrollbar-thin">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
