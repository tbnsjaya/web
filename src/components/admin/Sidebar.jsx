'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FileText,
  HandCoins,
  Users,
  Calculator,
  X,
  Settings,
  LogOut,
} from 'lucide-react';
import { logoutAction } from '@/app/actions/auth';

const navItems = [
  { href: '/admin/dashboard', label: 'Dasbor', icon: LayoutDashboard },
  { href: '/admin/items', label: 'Manajemen Barang', icon: Package },
  { href: '/admin/transactions', label: 'Transaksi / POS', icon: ShoppingCart },
  { href: '/admin/debts', label: 'Utang Pemasok', icon: FileText },
  { href: '/admin/kasbon', label: 'Kasbon Pelanggan', icon: HandCoins },
  { href: '/admin/customers', label: 'Data Pelanggan', icon: Users },
  { href: '/admin/calculator', label: 'Kalkulator', icon: Calculator },
  { href: '/admin/settings', label: 'Pengaturan Toko', icon: Settings },
];

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed md:relative top-0 left-0 h-screen z-50 md:z-auto
          w-[260px] bg-white dark:bg-slate-900 border-r border-slate-200/60 dark:border-slate-800
          flex flex-col flex-shrink-0 transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Brand Header */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Package className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-extrabold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent tracking-tight">
              TB NS Jaya
            </span>
          </div>
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`
                  nav-link-custom flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-[0.9rem]
                  ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-indigo-600 dark:hover:text-indigo-400'
                  }
                `}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-500' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer & Logout */}
        <div className="px-4 py-3 border-t border-slate-200/60 dark:border-slate-800 space-y-2 flex-shrink-0">
          <form action={logoutAction}>
            <button type="submit" className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold text-[0.9rem] text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all">
              <LogOut className="w-5 h-5" /> Logout
            </button>
          </form>
          <p className="text-[0.65rem] text-slate-400 text-center">© 2026 TB NS Jaya</p>
        </div>
      </aside>
    </>
  );
}
