'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import useStore from '@/lib/store';
import { formatCurrency, calculateStock, formatWAPhone, generateReceiptText } from '@/lib/utils';
import { Search, ShoppingBasket, Minus, Plus, X, Trash2, CreditCard, Truck, History, FileDown, Loader2 } from 'lucide-react';
import { uploadImageToDrive } from '@/lib/api';
import { toast } from 'sonner';

export default function TransactionsPage() {
  const [tab, setTab] = useState('pos');

  return (
    <div className="animate-fade-in flex flex-col h-full -m-4 md:-m-6">
      {/* Tabs */}
      <div className="px-4 md:px-6 pt-4 bg-white dark:bg-slate-900 border-b border-slate-200/60 dark:border-slate-800 flex-shrink-0">
        <div className="flex gap-2 pb-3 overflow-x-auto">
          {[
            { id: 'pos', label: 'Kasir POS', icon: CreditCard },
            { id: 'buy', label: 'Beli Stok', icon: Truck },
            { id: 'history', label: 'Riwayat Transaksi', icon: History },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm whitespace-nowrap transition-all ${
                tab === id
                  ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {tab === 'pos' && <POSTab />}
        {tab === 'buy' && <PurchaseTab />}
        {tab === 'history' && <HistoryTab />}
      </div>
    </div>
  );
}

function POSTab() {
  const { items, categories, purchases, sales, posCart, posCategoryFilter, posSearchQuery, addToCart, removeFromCart, changeCartQty, setCartQty, clearCart, setPosSearch, setPosCategoryFilter } = useStore();
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const filteredItems = useMemo(() => {
    let list = items;
    if (posCategoryFilter !== 'all') list = list.filter((i) => i.categoryId === posCategoryFilter);
    if (posSearchQuery) list = list.filter((i) => i.name.toLowerCase().includes(posSearchQuery) || i.code.toLowerCase().includes(posSearchQuery));
    return list;
  }, [items, posCategoryFilter, posSearchQuery]);

  const cartTotal = posCart.reduce((sum, c) => sum + c.qty * c.price, 0);

  const handleAddToCart = (itemId) => {
    const result = addToCart(itemId);
    if (result === 'no_stock') toast.error('Stok barang habis!');
    if (result === 'exceeds_stock') toast.error('Melebihi stok tersedia.');
  };

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-4 h-full p-4 md:p-6 overflow-auto lg:overflow-hidden">
        {/* Products Grid */}
        <div className="flex-1 flex flex-col min-h-[400px] lg:min-h-0 overflow-hidden">
          <div className="flex gap-3 mb-4 flex-shrink-0">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari barang..."
                value={posSearchQuery}
                onChange={(e) => setPosSearch(e.target.value.toLowerCase())}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-full text-sm border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
              />
            </div>
            <select
              value={posCategoryFilter}
              onChange={(e) => setPosCategoryFilter(e.target.value)}
              className="px-3 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm border-none focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
            >
              <option value="all">Semua Kategori</option>
              {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
            </select>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
              {filteredItems.length > 0 ? filteredItems.map((item) => {
                const stock = calculateStock(item.id, items, purchases, sales);
                return (
                  <div key={item.id} onClick={() => handleAddToCart(item.id)} className="pos-item-card bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl overflow-hidden cursor-pointer flex flex-col relative shadow-sm">
                    <div className={`absolute top-2 right-2 z-10 px-2 py-0.5 rounded-full text-xs font-bold ${stock <= 10 ? 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400' : 'bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm text-slate-700 dark:text-slate-300'} shadow-sm`}>
                      {stock}
                    </div>
                    <div className="h-28 bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500" onError={(e) => { e.target.style.display = 'none'; }} />
                      ) : null}
                      <div className="absolute inset-0 flex items-center justify-center text-slate-300 dark:text-slate-600 text-3xl">
                        <ShoppingBasket className="w-8 h-8" />
                      </div>
                    </div>
                    <div className="p-3 flex flex-col flex-1">
                      <p className="font-bold text-sm leading-tight line-clamp-2 mb-2">{item.name}</p>
                      <p className="text-indigo-600 dark:text-indigo-400 font-extrabold mt-auto">{formatCurrency(item.salePrice)}</p>
                    </div>
                  </div>
                );
              }) : (
                <div className="col-span-full py-12 text-center text-slate-400">Barang tidak ditemukan.</div>
              )}
            </div>
          </div>
        </div>

        {/* Cart Panel */}
        <div className="w-full lg:w-[360px] bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl flex flex-col flex-shrink-0 shadow-sm min-h-[350px] lg:min-h-0">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 rounded-t-2xl flex justify-between items-center">
            <span className="font-extrabold text-lg">Keranjang</span>
            <span className="px-2.5 py-0.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-bold">{posCart.length}</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {posCart.length > 0 ? posCart.map((c) => {
              const item = items.find((i) => i.id === c.itemId);
              if (!item) return null;
              return (
                <div key={c.itemId} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-bold text-sm flex-1 pr-2 leading-tight">{item.name}</p>
                    <button onClick={() => removeFromCart(c.itemId)} className="p-1 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-indigo-600 dark:text-indigo-400 font-extrabold text-sm">{formatCurrency(c.qty * c.price)}</p>
                    <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full shadow-sm overflow-hidden">
                      <button onClick={() => { const r = changeCartQty(c.itemId, -1); if (r === 'exceeds_stock') toast.error('Melebihi stok.'); }} className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <Minus className="w-3 h-3" />
                      </button>
                      <input type="number" step="any" value={c.qty} onChange={(e) => { const r = setCartQty(c.itemId, e.target.value); if (r === 'exceeds_stock') toast.error('Melebihi stok.'); }} className="w-10 h-8 text-center text-sm font-bold border-x border-slate-200 dark:border-slate-700 bg-transparent focus:outline-none" />
                      <button onClick={() => { const r = changeCartQty(c.itemId, 1); if (r === 'exceeds_stock') toast.error('Melebihi stok.'); }} className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            }) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 py-12">
                <ShoppingBasket className="w-12 h-12 mb-3 text-slate-200 dark:text-slate-700" />
                <p className="text-sm">Belum ada barang di keranjang</p>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold text-slate-500">Total:</span>
              <span className="text-xl font-extrabold tracking-tight">{formatCurrency(cartTotal)}</span>
            </div>
            <button
              onClick={() => { if (posCart.length === 0) return toast.error('Keranjang masih kosong'); setCheckoutOpen(true); }}
              className="w-full py-3 bg-emerald-500 text-white rounded-xl font-bold text-base hover:bg-emerald-600 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all btn-press flex items-center justify-center gap-2"
            >
              <CreditCard className="w-5 h-5" /> Bayar / Checkout
            </button>
          </div>
        </div>
      </div>

      {checkoutOpen && <CheckoutModal onClose={() => setCheckoutOpen(false)} />}
    </>
  );
}

function CheckoutModal({ onClose }) {
  const { posCart, items, customers, checkout } = useStore();
  const totalPrice = posCart.reduce((sum, c) => sum + c.qty * c.price, 0);
  const [isKasbon, setIsKasbon] = useState(false);
  const [sendWa, setSendWa] = useState(true);
  const [custPhone, setCustPhone] = useState('');
  const [custName, setCustName] = useState('');
  const [custAddress, setCustAddress] = useState('');
  const [custId, setCustId] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('tunai');
  const [showSettings, setShowSettings] = useState(false);
  const { settings, updateSettings } = useStore();
  const [isUploadingQris, setIsUploadingQris] = useState(false);
  const [localBankDetails, setLocalBankDetails] = useState('');

  useEffect(() => {
    if (settings?.bankDetails) {
      setLocalBankDetails(settings.bankDetails);
    }
  }, [settings?.bankDetails]);

  const handlePhoneSearch = (term) => {
    setCustPhone(term);
    setCustId('');
    if (term.length < 3) { setShowResults(false); return; }
    const cleanTerm = term.replace(/\D/g, '');
    const match = customers.filter((c) => {
      const cleanPhone = String(c.phone || '').replace(/\D/g, '');
      return (cleanTerm && cleanPhone.includes(cleanTerm)) || c.name.toLowerCase().includes(term.toLowerCase());
    }).slice(0, 10);
    setSearchResults(match);
    setShowResults(match.length > 0);
  };

  const selectCustomer = (cust) => {
    setCustId(cust.id);
    setCustPhone(cust.phone);
    setCustName(cust.name);
    setCustAddress(cust.address || '');
    setShowResults(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dueDate = e.target.dueDate?.value || null;
    const dpAmount = parseFloat(e.target.dp?.value) || 0;

    if (isKasbon && (!custName || !custPhone || !dueDate)) return toast.error('Nama, No. HP, & Jatuh Tempo wajib untuk Kasbon!');
    if (sendWa && !custPhone) return toast.error('No. HP wajib diisi untuk mengirim nota WA!');

    let customer = null;
    if (custName && custPhone) {
      let existingId = custId;
      const cleanPhoneInput = custPhone.replace(/\D/g, '');
      if (!existingId && cleanPhoneInput) {
        const found = customers.find((c) => String(c.phone || '').replace(/\D/g, '') === cleanPhoneInput);
        if (found) existingId = found.id;
      }
      customer = {
        id: existingId || `cust-${Date.now()}`,
        name: custName, phone: custPhone, address: custAddress,
      };
    }

    const { invoiceNumber, totalPrice: total } = await checkout({ customer, isKasbon, dueDate, dpAmount, sendWa, paymentMethod });

    toast.success('Transaksi Berhasil!');
    onClose();

    if (sendWa && customer) {
      const notaText = generateReceiptText(invoiceNumber, posCart, items, total, isKasbon, dpAmount, customer);
      const waPhone = formatWAPhone(customer.phone);
      window.open(`https://api.whatsapp.com/send?phone=${waPhone}&text=${encodeURIComponent(notaText)}`, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-[100] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col animate-slide-up border border-slate-200/60 dark:border-slate-800" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden flex-1">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
            <h3 className="text-lg font-bold">Checkout / Pembayaran</h3>
            <button type="button" onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><X className="w-5 h-5" /></button>
          </div>
          <div className="p-6 overflow-y-auto space-y-5">
            {/* Total */}
            <div className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 p-5 rounded-xl text-center">
              <p className="text-sm font-medium mb-1">Total Tagihan</p>
              <p className="text-3xl font-extrabold">{formatCurrency(totalPrice)}</p>
            </div>

            {/* Customer */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
              <label className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mb-2 block">Data Pelanggan <span className="text-slate-400 font-normal text-xs">(Opsional untuk Cash)</span></label>
              <div className="relative mb-2">
                <input value={custPhone} onChange={(e) => handlePhoneSearch(e.target.value)} placeholder="Ketik No. HP / WA..." className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none" />
                {showResults && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-50 max-h-40 overflow-y-auto">
                    {searchResults.map((c) => (
                      <div key={c.id} onClick={() => selectCustomer(c)} className="px-4 py-2.5 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 cursor-pointer text-sm border-b border-slate-100 dark:border-slate-800 last:border-b-0 transition-colors">
                        <strong>{c.phone}</strong> — {c.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <input value={custName} onChange={(e) => setCustName(e.target.value)} placeholder="Nama Pelanggan" className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm mb-2 border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none" />
              <textarea value={custAddress} onChange={(e) => setCustAddress(e.target.value)} placeholder="Alamat (Opsional)" rows={2} className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none resize-none" />
            </div>

            {/* Kasbon */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={isKasbon} onChange={(e) => setIsKasbon(e.target.checked)} className="w-5 h-5 rounded accent-indigo-500" />
                <span className="font-semibold text-sm">Catat sebagai Kasbon (Utang Pelanggan)</span>
              </label>
              {isKasbon && (
                <div className="mt-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-3">
                  <div><label className="text-sm font-semibold mb-1 block">Jatuh Tempo <span className="text-red-500">*</span></label><input name="dueDate" type="date" className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 rounded-xl text-sm border border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none" /></div>
                  <div><label className="text-sm font-semibold mb-1 block">DP (Muka)</label><input name="dp" type="number" defaultValue="0" min="0" max={totalPrice} className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 rounded-xl text-sm border border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none" /></div>
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-bold text-indigo-600 dark:text-indigo-400">Metode Pembayaran</label>
                <button type="button" onClick={() => setShowSettings(true)} className="text-xs text-indigo-500 hover:underline font-semibold">Atur QRIS/Rekening</button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {['tunai', 'qris', 'transfer'].map(method => (
                  <button key={method} type="button" onClick={() => setPaymentMethod(method)} className={`py-2 rounded-xl text-sm font-semibold capitalize border transition-all ${paymentMethod === method ? 'bg-indigo-500 text-white border-indigo-500 shadow-md' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                    {method}
                  </button>
                ))}
              </div>
              
              {paymentMethod === 'qris' && settings?.qrisImage && (
                <div className="mt-3 text-center bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                  <p className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Scan QRIS</p>
                  <img src={settings.qrisImage} alt="QRIS" className="h-40 mx-auto rounded-lg object-contain shadow-sm" />
                </div>
              )}
              {paymentMethod === 'transfer' && settings?.bankDetails && (
                <div className="mt-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                  <p className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Tujuan Transfer</p>
                  <p className="text-sm font-semibold whitespace-pre-wrap">{settings.bankDetails}</p>
                </div>
              )}
            </div>

            {/* WhatsApp */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={sendWa} onChange={(e) => setSendWa(e.target.checked)} className="w-5 h-5 rounded accent-green-500" />
                <span className="font-semibold text-sm text-green-600">Kirim Nota ke WhatsApp Pelanggan</span>
              </label>
            </div>
          </div>

          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 rounded-b-2xl shrink-0">
            <button type="button" onClick={onClose} className="px-4 py-2.5 bg-slate-200 dark:bg-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-300 transition-colors">Batal</button>
            <button type="submit" className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 shadow-lg shadow-emerald-500/25 transition-all btn-press flex items-center gap-2">
              <CreditCard className="w-4 h-4" /> Selesaikan Transaksi
            </button>
          </div>
        </form>
      </div>

      {/* Settings Modal (for QRIS & Bank) */}
      {showSettings && (
        <div className="fixed inset-0 bg-slate-900/60 z-[110] flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowSettings(false)}>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl w-full max-w-sm shadow-2xl animate-slide-up border border-slate-200/60 dark:border-slate-800" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">Pengaturan Pembayaran</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold block mb-1">Upload QRIS Toko</label>
                <input type="file" accept="image/*" disabled={isUploadingQris} onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setIsUploadingQris(true);
                    const r = new FileReader();
                    r.onload = () => {
                      const img = new Image();
                      img.onload = async () => {
                        const canvas = document.createElement('canvas');
                        let w = img.width;
                        let h = img.height;
                        const max = 600;
                        if (w > h && w > max) { h *= max / w; w = max; }
                        else if (h > max) { w *= max / h; h = max; }
                        canvas.width = w;
                        canvas.height = h;
                        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
                        const base64 = canvas.toDataURL('image/jpeg', 0.8);
                        try {
                          const url = await uploadImageToDrive(base64, 'qris.jpg', 'image/jpeg');
                          updateSettings({ qrisImage: url });
                          toast.success('QRIS berhasil diunggah!');
                        } catch(err) {
                          toast.error('Gagal mengunggah QRIS');
                        } finally {
                          setIsUploadingQris(false);
                        }
                      };
                      img.src = r.result;
                    };
                    r.readAsDataURL(file);
                  }
                }} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer disabled:opacity-50" />
                {isUploadingQris && <p className="text-xs text-indigo-500 mt-2 flex items-center gap-1"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Mengunggah...</p>}
                {!isUploadingQris && settings?.qrisImage && <img src={settings.qrisImage} className="h-24 mt-3 object-contain rounded-lg border border-slate-200 dark:border-slate-700 p-1" alt="QRIS" />}
              </div>
              <div>
                <label className="text-sm font-semibold block mb-1">Detail Rekening Bank</label>
                <p className="text-xs text-slate-400 mb-2">Format: Nama Bank - No. Rekening - Atas Nama</p>
                <textarea 
                  value={localBankDetails} 
                  onChange={e => setLocalBankDetails(e.target.value)} 
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 border border-transparent outline-none transition-all resize-none" 
                  rows={3}
                  placeholder="Contoh:&#10;BCA 1234567890 a.n Toko TB NS Jaya"
                />
              </div>
            </div>
            <button type="button" onClick={() => { updateSettings({ bankDetails: localBankDetails }); setShowSettings(false); }} className="mt-5 w-full py-2.5 bg-indigo-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/25 hover:bg-indigo-600 transition-all btn-press">Simpan & Tutup</button>
          </div>
        </div>
      )}
    </div>
  );
}

function PurchaseTab() {
  const { items, addPurchase } = useStore();
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [isDebt, setIsDebt] = useState(false);

  const searchResults = useMemo(() => {
    if (searchTerm.length < 1) return [];
    return items.filter((i) => i.name.toLowerCase().includes(searchTerm.toLowerCase()) || i.code.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 20);
  }, [items, searchTerm]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    if (!selectedItem) return toast.error('Pilih barang terlebih dahulu.');
    const qty = parseFloat(form.quantity.value);
    const supplier = form.supplier.value;
    const cost = parseFloat(form.totalCost.value);
    const dueDate = form.dueDate?.value || null;
    if (!qty || !supplier || !cost || (isDebt && !dueDate)) return toast.error('Data tidak lengkap.');

    addPurchase({
      id: `pur-${Date.now()}`, type: 'supplier', itemId: selectedItem.id, quantity: qty, supplier, totalCost: cost,
      isDebt, dueDate: isDebt ? dueDate : null, isPaid: !isDebt, paidAmount: isDebt ? 0 : cost, paymentHistory: [], date: new Date().toISOString(),
    });
    form.reset();
    setSelectedItem(null);
    setSearchTerm('');
    setIsDebt(false);
    toast.success('Pembelian dicatat.');
  };

  return (
    <div className="p-4 md:p-6 overflow-y-auto h-full">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 md:p-6 border border-slate-200/60 dark:border-slate-800 shadow-sm max-w-2xl mx-auto">
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-5 flex items-center gap-2">
          <Truck className="w-4 h-4 text-indigo-500" /> Catat Pembelian Stok Baru
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <label className="text-sm font-semibold mb-1 block">Cari Barang</label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setShowResults(true); setSelectedItem(null); }} placeholder="Ketik nama/kode..." className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none" />
            </div>
            {showResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-50 max-h-48 overflow-y-auto">
                {searchResults.map((i) => (
                  <div key={i.id} onClick={() => { setSelectedItem(i); setSearchTerm(`${i.name} (${i.code})`); setShowResults(false); }} className="px-4 py-2.5 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 cursor-pointer text-sm border-b border-slate-100 dark:border-slate-800 last:border-b-0 transition-colors">
                    {i.name} ({i.code})
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-semibold mb-1 block">Kuantitas{selectedItem ? ` (${selectedItem.unit})` : ''}</label><input name="quantity" type="number" step="any" min="0.01" required className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none" /></div>
            <div><label className="text-sm font-semibold mb-1 block">Pemasok</label><input name="supplier" required className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none" /></div>
          </div>
          <div><label className="text-sm font-semibold mb-1 block">Total Biaya Pembelian Keseluruhan</label><input name="totalCost" type="number" min="0" required className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none" /></div>
          <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
            <label className="flex items-center gap-3 cursor-pointer mb-3">
              <input type="checkbox" checked={isDebt} onChange={(e) => setIsDebt(e.target.checked)} className="w-5 h-5 rounded accent-indigo-500" />
              <span className="font-semibold text-sm">Bayar Nanti (Utang ke Pemasok)</span>
            </label>
            {isDebt && (
              <div><label className="text-sm font-semibold mb-1 block">Jatuh Tempo</label><input name="dueDate" type="date" className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none" /></div>
            )}
          </div>
          <button type="submit" className="w-full py-3 bg-indigo-500 text-white rounded-xl font-bold hover:bg-indigo-600 shadow-lg shadow-indigo-500/25 transition-all btn-press">Catat Pembelian</button>
        </form>
      </div>
    </div>
  );
}

function HistoryTab() {
  const { sales, purchases, items, deleteSale, deletePurchase } = useStore();
  const sortedSales = useMemo(() => [...sales].sort((a, b) => new Date(b.date) - new Date(a.date)), [sales]);
  const sortedPurchases = useMemo(() => purchases.filter((p) => p.type === 'supplier').sort((a, b) => new Date(b.date) - new Date(a.date)), [purchases]);

  const handleExportSalesPDF = async () => {
    const { jsPDF } = await import('jspdf');
    await import('jspdf-autotable');
    const doc = new jsPDF();
    doc.text('Riwayat Penjualan', 14, 16);
    const rows = sortedSales.map((s) => {
      let itemsStr = '';
      if (Array.isArray(s.items)) {
        itemsStr = s.items.map(si => {
          const i = items.find((it) => it.id === si.itemId);
          return `${i?.name || '-'} (${si.quantity} ${i?.unit || ''})`;
        }).join(', ');
      } else {
        const i = items.find((it) => it.id === s.itemId);
        itemsStr = `${i?.name || '-'} (${s.quantity} ${i?.unit || ''})`;
      }
      return [new Date(s.date).toLocaleString('id-ID'), itemsStr, formatCurrency(s.totalPrice)];
    });
    doc.autoTable(['Tanggal', 'Barang (Kuantitas)', 'Total'], rows, { startY: 20 });
    doc.save(`Penjualan-${Date.now()}.pdf`);
    toast.success('PDF Diunduh');
  };

  const handleExportSalesExcel = async () => {
    const XLSX = await import('xlsx');
    const ws = XLSX.utils.json_to_sheet(sortedSales.map((s) => {
      let itemsStr = '';
      if (Array.isArray(s.items)) {
        itemsStr = s.items.map(si => {
          const i = items.find((it) => it.id === si.itemId);
          return `${i?.name || '-'} (${si.quantity} ${i?.unit || ''})`;
        }).join(', ');
      } else {
        const i = items.find((it) => it.id === s.itemId);
        itemsStr = `${i?.name || '-'} (${s.quantity} ${i?.unit || ''})`;
      }
      return { 
        Tanggal: new Date(s.date).toLocaleString(), 
        Barang: itemsStr, 
        Total: s.totalPrice, 
        Tipe: s.isKasbon ? 'Kasbon' : 'Cash',
        Metode: s.paymentMethod || 'tunai'
      };
    }));
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Penjualan');
    XLSX.writeFile(wb, `Penjualan-${Date.now()}.xlsx`);
    toast.success('Excel Diunduh');
  };

  return (
    <div className="p-4 md:p-6 overflow-y-auto h-full space-y-6">
      {/* Sales History */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
        <div className="p-4 md:p-5 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-100 dark:border-slate-800 gap-3">
          <h3 className="font-bold flex items-center gap-2"><ShoppingBasket className="w-4 h-4" /> Riwayat Penjualan</h3>
          <div className="flex gap-2">
            <button onClick={handleExportSalesPDF} className="px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors flex items-center gap-1.5"><FileDown className="w-3.5 h-3.5" /> PDF</button>
            <button onClick={handleExportSalesExcel} className="px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-semibold text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors flex items-center gap-1.5"><FileDown className="w-3.5 h-3.5" /> Excel</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead><tr className="border-b-2 border-slate-100 dark:border-slate-800"><th className="py-3 px-4 text-xs font-bold text-slate-400 uppercase">Tanggal</th><th className="py-3 px-4 text-xs font-bold text-slate-400 uppercase">Barang</th><th className="py-3 px-4 text-xs font-bold text-slate-400 uppercase">Pelanggan</th><th className="py-3 px-4 text-xs font-bold text-slate-400 uppercase text-right">Total</th><th className="py-3 px-4 text-xs font-bold text-slate-400 uppercase text-center">Status</th><th className="py-3 px-4 text-xs font-bold text-slate-400 uppercase text-center">Aksi</th></tr></thead>
            <tbody>
              {sortedSales.length > 0 ? sortedSales.map((s) => {
                return (
                  <tr key={s.id} className="border-b border-slate-100/60 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 text-sm">{new Date(s.date).toLocaleString('id-ID')}</td>
                    <td className="py-3 px-4 text-sm max-w-xs truncate">
                      {Array.isArray(s.items) ? (
                        s.items.map((si) => {
                          const i = items.find((it) => it.id === si.itemId);
                          return `${i?.name || '-'} (${si.quantity} ${i?.unit || ''})`;
                        }).join(', ')
                      ) : (
                        (() => {
                          const i = items.find((it) => it.id === s.itemId);
                          return `${i?.name || '-'} (${s.quantity} ${i?.unit || ''})`;
                        })()
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm">{s.isKasbon ? s.customerDetails?.name : 'Cash'}</td>
                    <td className="py-3 px-4 text-sm text-right font-bold">{formatCurrency(s.totalPrice)}</td>
                    <td className="py-3 px-4 text-center">
                      {s.isKasbon ? (
                        s.isPaid ? <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-bold">Lunas</span> : <span className="px-2.5 py-1 bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 rounded-full text-xs font-bold">Kasbon</span>
                      ) : (
                        s.paymentMethod === 'qris' ? (
                          <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-full text-xs font-bold">QRIS</span>
                        ) : s.paymentMethod === 'transfer' ? (
                          <span className="px-2.5 py-1 bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 rounded-full text-xs font-bold">Transfer</span>
                        ) : (
                          <span className="px-2.5 py-1 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-bold">Tunai</span>
                        )
                      )}
                    </td>
                    <td className="py-3 px-4 text-center"><button onClick={() => { if (confirm('Hapus penjualan ini?')) { deleteSale(s.id); toast.success('Dihapus.'); } }} className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all"><Trash2 className="w-4 h-4" /></button></td>
                  </tr>
                );
              }) : <tr><td colSpan={6} className="py-12 text-center text-slate-400">Belum ada penjualan.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Purchase History */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
        <div className="p-4 md:p-5 flex justify-between items-center border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-bold flex items-center gap-2"><Truck className="w-4 h-4" /> Riwayat Pembelian Stok</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead><tr className="border-b-2 border-slate-100 dark:border-slate-800"><th className="py-3 px-4 text-xs font-bold text-slate-400 uppercase">Tanggal</th><th className="py-3 px-4 text-xs font-bold text-slate-400 uppercase">Barang</th><th className="py-3 px-4 text-xs font-bold text-slate-400 uppercase">Pemasok</th><th className="py-3 px-4 text-xs font-bold text-slate-400 uppercase text-right">Kuantitas</th><th className="py-3 px-4 text-xs font-bold text-slate-400 uppercase text-right">Total Biaya</th><th className="py-3 px-4 text-xs font-bold text-slate-400 uppercase text-center">Aksi</th></tr></thead>
            <tbody>
              {sortedPurchases.length > 0 ? sortedPurchases.map((p) => {
                const item = items.find((i) => i.id === p.itemId);
                return (
                  <tr key={p.id} className="border-b border-slate-100/60 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 text-sm">{new Date(p.date).toLocaleDateString('id-ID')}</td>
                    <td className="py-3 px-4 text-sm">{item?.name}</td>
                    <td className="py-3 px-4 text-sm">{p.supplier}</td>
                    <td className="py-3 px-4 text-sm text-right">{p.quantity} {item?.unit}</td>
                    <td className="py-3 px-4 text-sm text-right font-bold">{formatCurrency(p.totalCost)}</td>
                    <td className="py-3 px-4 text-center"><button onClick={() => { if (confirm('Hapus pembelian ini?')) { deletePurchase(p.id); toast.success('Dihapus.'); } }} className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all"><Trash2 className="w-4 h-4" /></button></td>
                  </tr>
                );
              }) : <tr><td colSpan={6} className="py-12 text-center text-slate-400">Belum ada pembelian.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
