'use client';

import { useState, useMemo } from 'react';
import useStore from '@/lib/store';
import { Search, Edit2, X } from 'lucide-react';
import { toast } from 'sonner';

export default function CustomersPage() {
  const { customers, updateCustomer } = useStore();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name-asc');
  const [editModal, setEditModal] = useState(null);

  const filtered = useMemo(() => {
    let list = customers.filter((c) => {
      const cleanPhone = String(c.phone || '').replace(/\D/g, '');
      const cleanTerm = search.replace(/\D/g, '');
      return c.name.toLowerCase().includes(search.toLowerCase()) || (cleanTerm && cleanPhone.includes(cleanTerm)) || String(c.phone || '').includes(search);
    });
    list.sort((a, b) => {
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
      if (sortBy === 'tx-desc') return (b.totalTransactions || 0) - (a.totalTransactions || 0);
      if (sortBy === 'date-desc') return new Date(b.joinDate) - new Date(a.joinDate);
      return 0;
    });
    return list;
  }, [customers, search, sortBy]);

  const handleEdit = (e) => {
    e.preventDefault();
    updateCustomer(editModal.id, {
      name: e.target.name.value,
      phone: e.target.phone.value,
      address: e.target.address.value,
    });
    setEditModal(null);
    toast.success('Data pelanggan diperbarui.');
  };

  return (
    <div className="animate-fade-in space-y-5">
      {/* KPI */}
      <div className="stagger-1 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800 shadow-sm inline-block">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Pelanggan Aktif</p>
        <p className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">{customers.length}</p>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
        <div className="p-4 md:p-5 flex flex-col md:flex-row gap-3 items-start md:items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Cari nama atau No. HP..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-full text-sm border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all" />
          </div>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-3 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-full text-sm border-none focus:ring-2 focus:ring-indigo-500/20 focus:outline-none">
            <option value="name-asc">Nama A-Z</option>
            <option value="name-desc">Nama Z-A</option>
            <option value="tx-desc">Transaksi Terbanyak</option>
            <option value="date-desc">Terbaru Bergabung</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead><tr className="border-b-2 border-slate-100 dark:border-slate-800"><th className="py-3 px-4 text-xs font-bold text-slate-400 uppercase">Nama Pelanggan</th><th className="py-3 px-4 text-xs font-bold text-slate-400 uppercase">No. HP / WA</th><th className="py-3 px-4 text-xs font-bold text-slate-400 uppercase">Alamat</th><th className="py-3 px-4 text-xs font-bold text-slate-400 uppercase text-right">Total Transaksi</th><th className="py-3 px-4 text-xs font-bold text-slate-400 uppercase">Tgl Bergabung</th><th className="py-3 px-4 text-xs font-bold text-slate-400 uppercase text-center">Aksi</th></tr></thead>
            <tbody>
              {filtered.length > 0 ? filtered.map((c) => (
                <tr key={c.id} className="border-b border-slate-100/60 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-semibold">{c.name}</td>
                  <td className="py-3 px-4 text-sm">{c.phone}</td>
                  <td className="py-3 px-4 text-sm text-slate-500">{c.address || '-'}</td>
                  <td className="py-3 px-4 text-right font-bold text-indigo-600 dark:text-indigo-400">{c.totalTransactions || 0}</td>
                  <td className="py-3 px-4 text-sm text-slate-500">{new Date(c.joinDate).toLocaleDateString('id-ID')}</td>
                  <td className="py-3 px-4 text-center"><button onClick={() => setEditModal(c)} className="p-2 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-all"><Edit2 className="w-4 h-4" /></button></td>
                </tr>
              )) : <tr><td colSpan={6} className="py-12 text-center text-slate-400">Tidak ada data pelanggan.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in" onClick={() => setEditModal(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md animate-slide-up border border-slate-200/60 dark:border-slate-800" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleEdit}>
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <h3 className="text-lg font-bold">Edit Data Pelanggan</h3>
                <button type="button" onClick={() => setEditModal(null)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div><label className="text-sm font-semibold mb-1 block">Nama Pelanggan</label><input name="name" defaultValue={editModal.name} required className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none" /></div>
                <div><label className="text-sm font-semibold mb-1 block">No. HP / WA</label><input name="phone" defaultValue={editModal.phone} required className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none" /></div>
                <div><label className="text-sm font-semibold mb-1 block">Alamat</label><textarea name="address" defaultValue={editModal.address || ''} rows={2} className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none resize-none" /></div>
              </div>
              <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                <button type="button" onClick={() => setEditModal(null)} className="px-4 py-2.5 bg-slate-200 dark:bg-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-300 transition-colors">Batal</button>
                <button type="submit" className="px-6 py-2.5 bg-indigo-500 text-white rounded-xl text-sm font-semibold hover:bg-indigo-600 shadow-lg shadow-indigo-500/25 transition-all btn-press">Update Pelanggan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
