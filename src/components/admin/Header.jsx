'use client';

import { usePathname } from 'next/navigation';
import { Menu, Sun, Moon, RefreshCw } from 'lucide-react';
import useStore from '@/lib/store';
import { useState } from 'react';
import { toast } from 'sonner';

const pageTitles = {
  '/admin/dashboard': 'Dasbor',
  '/admin/items': 'Manajemen Barang',
  '/admin/transactions': 'Transaksi / POS',
  '/admin/debts': 'Utang Pemasok',
  '/admin/kasbon': 'Kasbon Pelanggan',
  '/admin/customers': 'Data Pelanggan',
  '/admin/calculator': 'Kalkulator',
};

export default function Header({ onMenuToggle }) {
  const pathname = usePathname();
  const { settings, toggleTheme, syncData } = useStore();
  const [syncing, setSyncing] = useState(false);
  const isDark = settings.theme === 'dark';

  const handleSync = async () => {
    setSyncing(true);
    toast.info('Menarik data terbaru...');
    try {
      await syncData();
      toast.success('Sinkronisasi sukses.');
    } catch {
      toast.error('Gagal menarik data.');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 md:px-6 py-3.5 flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800 z-30 sticky top-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="text-lg md:text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight hidden md:block">
          {pageTitles[pathname] || 'Aplikasi'}
        </h2>
      </div>

      <div className="flex items-center gap-2">
        {/* Sync Button */}
        <button
          onClick={handleSync}
          disabled={syncing}
          className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-all duration-200"
          title="Tarik Data Terbaru (Sinkronisasi)"
        >
          <RefreshCw className={`w-[18px] h-[18px] ${syncing ? 'animate-spin-slow' : ''}`} />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-all duration-200"
          title="Ganti Tema"
        >
          {isDark ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
        </button>
      </div>
    </header>
  );
}
