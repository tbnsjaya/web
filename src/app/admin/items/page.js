'use client';

import { useState, useMemo, useCallback } from 'react';
import useStore from '@/lib/store';
import { formatCurrency, calculateStock } from '@/lib/utils';
import { Search, Plus, Tags, Edit2, Warehouse, Trash2, Package, X } from 'lucide-react';
import { toast } from 'sonner';

export default function ItemsPage() {
  const { items, categories, purchases, sales, addItem, updateItem, deleteItem, adjustStock, addCategory, updateCategory, deleteCategory } = useStore();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name-asc');
  const [modal, setModal] = useState(null); // null | 'add' | 'edit' | 'adjust' | 'categories'
  const [editingItem, setEditingItem] = useState(null);

  const filteredItems = useMemo(() => {
    let list = items.filter(
      (item) => item.name.toLowerCase().includes(search.toLowerCase()) || item.code.toLowerCase().includes(search.toLowerCase())
    );
    list.sort((a, b) => {
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
      if (sortBy === 'price-asc') return a.salePrice - b.salePrice;
      if (sortBy === 'price-desc') return b.salePrice - a.salePrice;
      if (sortBy === 'category') return (categories.find((c) => c.id === a.categoryId)?.name || '').localeCompare(categories.find((c) => c.id === b.categoryId)?.name || '');
      return 0;
    });
    return list;
  }, [items, search, sortBy, categories]);

  const handleAddItem = useCallback((e) => {
    e.preventDefault();
    const form = e.target;
    addItem({
      id: `item-${Date.now()}`,
      code: form.code.value,
      name: form.name.value,
      categoryId: form.category.value,
      unit: form.unit.value,
      hpp: parseFloat(form.hpp.value),
      salePrice: parseFloat(form.salePrice.value),
      initialStock: parseFloat(form.initialStock.value),
      imageUrl: form.imageUrl.value,
    });
    setModal(null);
    toast.success('Barang berhasil disimpan.');
  }, [addItem]);

  const handleEditItem = useCallback((e) => {
    e.preventDefault();
    const form = e.target;
    updateItem(editingItem.id, {
      name: form.name.value,
      categoryId: form.category.value,
      unit: form.unit.value,
      hpp: parseFloat(form.hpp.value),
      salePrice: parseFloat(form.salePrice.value),
      imageUrl: form.imageUrl.value,
    });
    setModal(null);
    setEditingItem(null);
    toast.success('Barang diperbarui.');
  }, [editingItem, updateItem]);

  const handleAdjustStock = useCallback((e) => {
    e.preventDefault();
    const val = parseFloat(e.target.adjustment.value);
    adjustStock(editingItem.id, val);
    setModal(null);
    setEditingItem(null);
    toast.success('Stok disesuaikan.');
  }, [editingItem, adjustStock]);

  const handleDeleteItem = useCallback((id) => {
    if (!confirm('Hapus barang ini? Data terkait mungkin terpengaruh.')) return;
    deleteItem(id);
    toast.success('Barang dihapus.');
  }, [deleteItem]);

  return (
    <div className="animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
        {/* Toolbar */}
        <div className="p-4 md:p-5 flex flex-col md:flex-row gap-3 items-start md:items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama atau kode barang..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-full text-sm border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
            />
          </div>
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-full text-sm border-none focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
            >
              <option value="name-asc">Nama A-Z</option>
              <option value="name-desc">Nama Z-A</option>
              <option value="price-asc">Harga Terendah</option>
              <option value="price-desc">Harga Tertinggi</option>
              <option value="category">Kategori</option>
            </select>
            <button onClick={() => setModal('categories')} className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              <Tags className="w-4 h-4" /> Kategori
            </button>
            <button onClick={() => setModal('add')} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-500 text-white rounded-xl text-sm font-semibold hover:bg-indigo-600 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all btn-press">
              <Plus className="w-4 h-4" /> Barang Baru
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b-2 border-slate-100 dark:border-slate-800">
                {['Kode', 'Gambar', 'Nama Barang', 'Kategori', 'Satuan', 'Stok', 'Harga Jual', 'Aksi'].map((h) => (
                  <th key={h} className={`py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider ${['Stok', 'Harga Jual'].includes(h) ? 'text-right' : ''} ${h === 'Aksi' ? 'text-center' : ''}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => {
                  const stock = calculateStock(item.id, items, purchases, sales);
                  const cat = categories.find((c) => c.id === item.categoryId);
                  return (
                    <tr key={item.id} className="border-b border-slate-100/60 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 text-slate-400 font-mono text-sm">{item.code}</td>
                      <td className="py-3 px-4">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                          ) : (
                            <Package className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold">{item.name}</td>
                      <td className="py-3 px-4 text-slate-500">{cat?.name || '-'}</td>
                      <td className="py-3 px-4 text-slate-500">{item.unit}</td>
                      <td className={`py-3 px-4 text-right font-bold ${stock <= 10 ? 'text-red-500' : ''}`}>{stock}</td>
                      <td className="py-3 px-4 text-right text-indigo-600 dark:text-indigo-400 font-semibold">{formatCurrency(item.salePrice)}</td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => { setEditingItem(item); setModal('edit'); }} className="p-2 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-all" title="Edit">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => { setEditingItem(item); setModal('adjust'); }} className="p-2 rounded-lg text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-all" title="Sesuaikan Stok">
                            <Warehouse className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteItem(item.id)} className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all" title="Hapus">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan={8} className="py-12 text-center text-slate-400">Tidak ada barang ditemukan.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {modal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in" onClick={() => { setModal(null); setEditingItem(null); }}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col animate-slide-up border border-slate-200/60 dark:border-slate-800" onClick={(e) => e.stopPropagation()}>
            {/* Add Item Modal */}
            {modal === 'add' && (
              <form onSubmit={handleAddItem}>
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <h3 className="text-lg font-bold">Barang Baru</h3>
                  <button type="button" onClick={() => setModal(null)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><X className="w-5 h-5" /></button>
                </div>
                <div className="p-6 overflow-y-auto space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-sm font-semibold mb-1 block">Kode</label><input name="code" defaultValue={`BRG-${Date.now().toString().slice(-5)}`} readOnly className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm border-none" /></div>
                    <div><label className="text-sm font-semibold mb-1 block">Nama</label><input name="name" required className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-sm font-semibold mb-1 block">Kategori</label><select name="category" className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm border-none">{categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}</select></div>
                    <div><label className="text-sm font-semibold mb-1 block">Satuan</label><input name="unit" placeholder="Pcs, Kg, dll" required className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-sm font-semibold mb-1 block">Harga Awal (HPP)</label><input name="hpp" type="number" required className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none" /></div>
                    <div><label className="text-sm font-semibold mb-1 block">Harga Jual</label><input name="salePrice" type="number" required className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-sm font-semibold mb-1 block">Stok Awal</label><input name="initialStock" type="number" step="any" defaultValue="0" required className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none" /></div>
                    <div><label className="text-sm font-semibold mb-1 block">Link Gambar</label><input name="imageUrl" type="url" placeholder="https://..." className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none" /></div>
                  </div>
                </div>
                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                  <button type="button" onClick={() => setModal(null)} className="px-4 py-2.5 bg-slate-200 dark:bg-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-300 transition-colors">Batal</button>
                  <button type="submit" className="px-6 py-2.5 bg-indigo-500 text-white rounded-xl text-sm font-semibold hover:bg-indigo-600 shadow-lg shadow-indigo-500/25 transition-all btn-press">Simpan</button>
                </div>
              </form>
            )}

            {/* Edit Item Modal */}
            {modal === 'edit' && editingItem && (
              <form onSubmit={handleEditItem}>
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <h3 className="text-lg font-bold">Edit Barang</h3>
                  <button type="button" onClick={() => { setModal(null); setEditingItem(null); }} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><X className="w-5 h-5" /></button>
                </div>
                <div className="p-6 overflow-y-auto space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-sm font-semibold mb-1 block">Kode</label><input defaultValue={editingItem.code} disabled className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm border-none opacity-60" /></div>
                    <div><label className="text-sm font-semibold mb-1 block">Nama</label><input name="name" defaultValue={editingItem.name} required className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-sm font-semibold mb-1 block">Kategori</label><select name="category" defaultValue={editingItem.categoryId} className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm border-none">{categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}</select></div>
                    <div><label className="text-sm font-semibold mb-1 block">Satuan</label><input name="unit" defaultValue={editingItem.unit} required className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-sm font-semibold mb-1 block">Harga Awal (HPP)</label><input name="hpp" type="number" defaultValue={editingItem.hpp} required className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none" /></div>
                    <div><label className="text-sm font-semibold mb-1 block">Harga Jual</label><input name="salePrice" type="number" defaultValue={editingItem.salePrice} required className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none" /></div>
                  </div>
                  <div><label className="text-sm font-semibold mb-1 block">Link Gambar</label><input name="imageUrl" type="url" defaultValue={editingItem.imageUrl || ''} placeholder="https://..." className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none" /></div>
                </div>
                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                  <button type="button" onClick={() => { setModal(null); setEditingItem(null); }} className="px-4 py-2.5 bg-slate-200 dark:bg-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-300 transition-colors">Batal</button>
                  <button type="submit" className="px-6 py-2.5 bg-indigo-500 text-white rounded-xl text-sm font-semibold hover:bg-indigo-600 shadow-lg shadow-indigo-500/25 transition-all btn-press">Update</button>
                </div>
              </form>
            )}

            {/* Adjust Stock Modal */}
            {modal === 'adjust' && editingItem && (
              <form onSubmit={handleAdjustStock}>
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <h3 className="text-lg font-bold">Sesuaikan Stok</h3>
                  <button type="button" onClick={() => { setModal(null); setEditingItem(null); }} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><X className="w-5 h-5" /></button>
                </div>
                <div className="p-6 space-y-4">
                  <p>Stok Saat Ini: <strong>{calculateStock(editingItem.id, items, purchases, sales)} {editingItem.unit}</strong></p>
                  <div><label className="text-sm font-semibold mb-1 block">Penyesuaian (Gunakan - untuk kurang)</label><input name="adjustment" type="number" step="any" required className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none" /></div>
                </div>
                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                  <button type="button" onClick={() => { setModal(null); setEditingItem(null); }} className="px-4 py-2.5 bg-slate-200 dark:bg-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-300 transition-colors">Batal</button>
                  <button type="submit" className="px-6 py-2.5 bg-indigo-500 text-white rounded-xl text-sm font-semibold hover:bg-indigo-600 shadow-lg shadow-indigo-500/25 transition-all btn-press">Simpan</button>
                </div>
              </form>
            )}

            {/* Category Manager Modal */}
            {modal === 'categories' && (
              <CategoryManager categories={categories} items={items} addCategory={addCategory} updateCategory={updateCategory} deleteCategory={deleteCategory} onClose={() => setModal(null)} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function CategoryManager({ categories, items, addCategory, updateCategory, deleteCategory, onClose }) {
  const [newCat, setNewCat] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newCat.trim()) return;
    addCategory({ id: `cat-${Date.now()}`, name: newCat.trim() });
    setNewCat('');
    toast.success('Kategori ditambahkan.');
  };

  const handleDelete = (id) => {
    if (items.some((i) => i.categoryId === id)) return toast.error('Kategori sedang digunakan oleh barang.');
    if (!confirm('Hapus kategori ini?')) return;
    deleteCategory(id);
    toast.success('Kategori dihapus.');
  };

  const handleEdit = (id) => {
    const cat = categories.find((c) => c.id === id);
    if (!cat) return;
    const newName = prompt('Masukkan nama kategori baru:', cat.name);
    if (newName && newName.trim()) {
      updateCategory(id, newName.trim());
      toast.success('Kategori diperbarui.');
    }
  };

  return (
    <>
      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
        <h3 className="text-lg font-bold">Manajemen Kategori</h3>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><X className="w-5 h-5" /></button>
      </div>
      <div className="p-6 overflow-y-auto">
        <form onSubmit={handleAdd} className="flex gap-3 mb-4">
          <input value={newCat} onChange={(e) => setNewCat(e.target.value)} placeholder="Nama Kategori Baru" className="flex-1 px-3 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none" />
          <button type="submit" className="px-4 py-2.5 bg-indigo-500 text-white rounded-xl text-sm font-semibold hover:bg-indigo-600 transition-all btn-press">Tambah</button>
        </form>
        <table className="w-full text-sm">
          <thead><tr className="border-b-2 border-slate-100 dark:border-slate-800"><th className="py-2 px-3 text-left text-xs font-bold text-slate-400 uppercase">Nama Kategori</th><th className="py-2 px-3 text-center text-xs font-bold text-slate-400 uppercase w-24">Aksi</th></tr></thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className="border-b border-slate-100/60 dark:border-slate-800/60">
                <td className="py-2.5 px-3 font-semibold">{c.name}</td>
                <td className="py-2.5 px-3 text-center">
                  <div className="flex justify-center gap-1">
                    <button onClick={() => handleEdit(c.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-all"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {categories.length === 0 && <tr><td colSpan={2} className="py-4 text-center text-slate-400">Belum ada kategori.</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end">
        <button onClick={onClose} className="px-4 py-2.5 bg-slate-200 dark:bg-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-300 transition-colors">Tutup</button>
      </div>
    </>
  );
}
