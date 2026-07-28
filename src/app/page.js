'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [waModalOpen, setWaModalOpen] = useState(false);
  const [waMessage, setWaMessage] = useState('Halo TB NS JAYA, saya ingin bertanya tentang kebutuhan bahan bangunan.');

  // Form states for simulator
  const [simProduct, setSimProduct] = useState('Semen (Tiga Roda/Gresik/Dynamix)');
  const [simQty, setSimQty] = useState('');
  const [simName, setSimName] = useState('');
  const [simAddress, setSimAddress] = useState('');
  const [simPayment, setSimPayment] = useState('COD (Bayar di Tempat)');

  const openWAModal = (message) => {
    if (message) {
      setWaMessage(message);
    }
    setWaModalOpen(true);
  };

  const closeWAModal = () => {
    setWaModalOpen(false);
  };

  const redirectWA = (phoneNumber) => {
    const encodedText = encodeURIComponent(waMessage);
    const waUrl = `https://wa.me/${phoneNumber}?text=${encodedText}`;
    window.open(waUrl, '_blank');
    closeWAModal();
  };

  const handleSimulatorSubmit = (e) => {
    e.preventDefault();
    const formattedMessage = `Halo TB NS JAYA, saya mau pesan barang dengan rincian berikut:\n\n` +
      `📌 *Produk:* ${simProduct}\n` +
      `🔢 *Jumlah:* ${simQty}\n` +
      `👤 *Nama Pemesan:* ${simName}\n` +
      `📍 *Alamat Kirim:* ${simAddress}\n` +
      `💳 *Metode Pembayaran:* ${simPayment}\n\n` +
      `Mohon konfirmasi ketersediaan stok & harganya. Terima kasih!`;
    openWAModal(formattedMessage);
  };

  return (
    <>
      {/* Stylesheet links hoisted by React 19 */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" precedence="default" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" precedence="default" />

      <div className="bg-white text-slate-800 font-sans antialiased selection:bg-blue-600 selection:text-white min-h-screen">

        {/* NAVIGATION BAR */}
        <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">

              {/* Logo & Brand Name */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-500 to-blue-400 flex items-center justify-center text-white text-2xl font-black shadow-md">
                  <i className="fa-solid fa-helmet-safety"></i>
                </div>
                <div>
                  <span className="text-2xl font-extrabold tracking-tight text-blue-700 block leading-none">TB NS JAYA</span>
                  <span className="text-[11px] text-slate-500 tracking-wider uppercase font-semibold">Bahan Bangunan & Mebel Jepara</span>
                </div>
              </div>

              {/* Desktop Menu */}
              <div className="hidden md:flex items-center space-x-8 text-sm font-semibold text-slate-600">
                <a href="#home" className="hover:text-blue-600 transition-colors">Beranda</a>
                <a href="#produk" className="hover:text-blue-600 transition-colors">Katalog Produk</a>
                <a href="#keunggulan" className="hover:text-blue-600 transition-colors">Keunggulan</a>
                <a href="#pembayaran" className="hover:text-blue-600 transition-colors">Pembayaran</a>
                <a href="#kalkulator" className="hover:text-blue-600 transition-colors">Simulasi Order</a>
                <a href="#lokasi" className="hover:text-blue-600 transition-colors">Lokasi</a>
              </div>

              {/* CTA Button */}
              <div className="hidden sm:flex items-center gap-3">
                <button
                  onClick={() => openWAModal('Halo TB NS JAYA, saya ingin bertanya tentang stok & harga bahan bangunan.')}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold px-5 py-2.5 rounded-xl shadow-md hover:shadow-blue-200 hover:scale-105 transition-all duration-200 flex items-center gap-2 cursor-pointer"
                >
                  <i className="fa-brands fa-whatsapp text-lg"></i>
                  <span>Hubungi Kami</span>
                </button>
              </div>

              {/* Mobile Menu Button */}
              <div className="md:hidden">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="text-slate-600 hover:text-blue-600 p-2 text-2xl focus:outline-none cursor-pointer"
                >
                  <i className={`fa-solid ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Dropdown Menu */}
          <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 shadow-lg`}>
            <a href="#home" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-600 hover:text-blue-600 font-medium">Beranda</a>
            <a href="#produk" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-600 hover:text-blue-600 font-medium">Katalog Material</a>
            <a href="#keunggulan" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-600 hover:text-blue-600 font-medium">Keunggulan Toko</a>
            <a href="#pembayaran" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-600 hover:text-blue-600 font-medium">Metode Pembayaran</a>
            <a href="#kalkulator" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-600 hover:text-blue-600 font-medium">Simulasi Order</a>
            <a href="#lokasi" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-600 hover:text-blue-600 font-medium">Lokasi Toko</a>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                openWAModal('Halo TB NS JAYA, saya mau konsultasi kebutuhan proyek bangunan.');
              }}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow cursor-pointer"
            >
              <i className="fa-brands fa-whatsapp text-xl"></i> Chat WhatsApp CS
            </button>
          </div>
        </nav>

        {/* HERO SECTION */}
        <section id="home" className="relative pt-10 pb-20 md:pt-16 md:pb-28 overflow-hidden bg-gradient-to-br from-white via-blue-50 to-slate-50">
          {/* Decorative light blobs */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/60 rounded-full blur-[120px] pointer-events-none -translate-y-1/4 translate-x-1/4"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-50/80 rounded-full blur-[100px] pointer-events-none"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-12 gap-12 items-center">

              {/* Hero Text Left */}
              <div className="lg:col-span-7 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/10 border border-blue-200 text-blue-700 font-semibold text-xs sm:text-sm mb-6 tracking-wide">
                  <i className="fa-solid fa-truck-fast text-orange-500"></i> PUSAT MATERIAL BANGUNAN & MEBEL JEPARA
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-slate-900 mb-6">
                  Bangun Rumah & Usaha Mebel Impian Bersama <span className="text-blue-600">TB NS JAYA</span>
                </h1>

                <p className="text-base sm:text-lg text-slate-600 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  Menyediakan semen, pasir, bata ringan, batu, besi SNI, cat, hingga kebutuhan produksi <strong className="text-blue-700">pertukangan mebel Jepara</strong>. Siap antar cepat langsung ke lokasi Anda!
                </p>

                {/* Fast Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                  <button
                    onClick={() => openWAModal('Halo TB NS JAYA, saya mau tanya stok dan penawaran harga terbaru.')}
                    className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-black rounded-xl shadow-lg shadow-blue-200 hover:shadow-blue-300 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 text-lg cursor-pointer"
                  >
                    <i className="fa-brands fa-whatsapp text-2xl"></i>
                    <span>Pesan via WhatsApp</span>
                  </button>

                  <a href="#produk" className="w-full sm:w-auto px-8 py-4 bg-white border-2 border-blue-200 hover:border-blue-400 text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition-all text-center flex items-center justify-center gap-2 shadow-sm">
                    <i className="fa-solid fa-boxes-stacked text-orange-500"></i>
                    <span>Lihat Katalog</span>
                  </a>
                </div>

                {/* Highlights Badge Bar */}
                <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-200 pt-8">
                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm text-center lg:text-left">
                    <div className="text-2xl font-black text-blue-600"><i className="fa-solid fa-circle-check text-orange-500 mr-1"></i> 100%</div>
                    <div className="text-xs text-slate-500 font-medium">Bahan Quality Control</div>
                  </div>
                  <div className="text-center lg:text-left p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <div className="text-2xl font-black text-blue-600"><i className="fa-solid fa-hand-holding-dollar text-orange-500 mr-1"></i> Bersaing</div>
                    <div className="text-xs text-slate-500 font-medium">Harga Grosir & Eceran</div>
                  </div>
                  <div className="text-center lg:text-left p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <div className="text-2xl font-black text-blue-600"><i className="fa-solid fa-truck-ramp-box text-orange-500 mr-1"></i> COD</div>
                    <div className="text-xs text-slate-500 font-medium">Bisa Bayar Tempat</div>
                  </div>
                  <div className="text-center lg:text-left p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <div className="text-2xl font-black text-blue-600"><i className="fa-solid fa-bolt text-orange-500 mr-1"></i> Cepat</div>
                    <div className="text-xs text-slate-500 font-medium">Pengiriman Jepara Area</div>
                  </div>
                </div>
              </div>

              {/* Hero Feature Card Right */}
              <div className="lg:col-span-5 relative">
                <div className="relative bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200">
                  <div className="absolute -top-4 -right-4 bg-orange-500 text-white font-extrabold px-4 py-1.5 rounded-xl text-xs uppercase tracking-wider shadow-md flex items-center gap-1.5 animate-bounce">
                    <i className="fa-solid fa-truck-fast"></i> Antar Sampai Lokasi
                  </div>

                  {/* Image Cover Badge */}
                  <div className="relative w-full h-44 rounded-2xl overflow-hidden mb-6 border border-slate-200">
                    <img src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80" alt="Material Bangunan TB NS JAYA" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/20 to-transparent"></div>
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <span className="bg-blue-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded tracking-wide uppercase">Toko Resmi</span>
                      <h4 className="text-sm font-extrabold mt-0.5">TB NS JAYA Desa Semat Tahunan</h4>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <i className="fa-solid fa-store text-blue-600"></i> Info Kontak & Pelayanan
                  </h3>

                  <div className="space-y-3.5 text-sm text-slate-600">
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100">
                      <i className="fa-solid fa-location-dot text-blue-600 text-lg mt-0.5 shrink-0"></i>
                      <div>
                        <div className="font-semibold text-slate-800">Alamat Toko:</div>
                        <div className="text-xs text-slate-500">RT02/RW01, Desa Semat, Kecamatan Tahunan, Kabupaten Jepara</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                      <i className="fa-solid fa-phone text-emerald-600 text-lg mt-0.5 shrink-0"></i>
                      <div>
                        <div className="font-semibold text-slate-800">Layanan WhatsApp / HP:</div>
                        <div className="text-xs font-mono text-emerald-600 font-bold mt-0.5">
                          0812-2876-440 <br/> 0823-3044-9041
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-xl bg-orange-50 border border-orange-100">
                      <i className="fa-solid fa-credit-card text-orange-500 text-lg mt-0.5 shrink-0"></i>
                      <div>
                        <div className="font-semibold text-slate-800">Pilihan Pembayaran:</div>
                        <div className="text-xs text-slate-500">Cash, Transfer Bank, QRIS, & COD</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <button
                      onClick={() => openWAModal('Halo TB NS JAYA, saya mau tanya stok material.')}
                      className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-extrabold rounded-xl text-center shadow-md hover:shadow-blue-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <i className="fa-brands fa-whatsapp text-xl"></i> Konsultasi Stok via WA
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* PRODUCT CATALOG SECTION */}
        <section id="produk" className="py-20 bg-slate-50 border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="px-3.5 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-full text-xs font-bold uppercase tracking-widest inline-flex items-center gap-1.5">
                <i className="fa-solid fa-boxes-packing"></i> KATALOG MATERIAL LENGKAP
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3">Produk Konstruksi & Bahan Mebel</h2>
              <p className="mt-3 text-slate-500 text-sm sm:text-base">Menyediakan segala kebutuhan pembangunan rumah, gedung, hingga bahan baku produksi industri mebel Jepara.</p>
            </div>

            {/* Product Grid (8 Categories) */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">

              {/* Card 1: Semen */}
              <div className="bg-white border border-slate-200 hover:border-blue-400 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group flex flex-col justify-between shadow-sm">
                <div>
                  <div className="relative h-40 overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&q=80" alt="Semen" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent"></div>
                    <div className="absolute top-3 left-3 bg-blue-600 text-white p-2 rounded-xl text-lg shadow">
                      <i className="fa-solid fa-cubes-stacked"></i>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Semen Premium</h3>
                    <p className="text-slate-500 text-xs leading-relaxed mb-4">Semen PCC & Portland (Tiga Roda, Gresik, Dynamix) untuk hasil bangunan kokoh & tahan retak.</p>
                    <ul className="text-xs text-slate-600 space-y-1.5 mb-2">
                      <li><i className="fa-solid fa-circle-check text-blue-600 mr-1.5"></i> Sak 40kg & 50kg</li>
                      <li><i className="fa-solid fa-circle-check text-blue-600 mr-1.5"></i> Semen Mortar & Perekat</li>
                      <li><i className="fa-solid fa-circle-check text-blue-600 mr-1.5"></i> Siap Kirim Partai Besar</li>
                    </ul>
                  </div>
                </div>
                <div className="p-5 pt-0">
                  <button
                    onClick={() => openWAModal('Halo TB NS JAYA, saya mau tanya harga Semen sak/partai.')}
                    className="w-full py-2.5 bg-slate-100 group-hover:bg-blue-600 text-slate-600 group-hover:text-white font-bold rounded-xl transition-all text-xs flex items-center justify-center gap-2 cursor-pointer border border-slate-200 group-hover:border-blue-600"
                  >
                    <i className="fa-brands fa-whatsapp text-sm"></i> Pesan Semen
                  </button>
                </div>
              </div>

              {/* Card 2: Pasir & Batu */}
              <div className="bg-white border border-slate-200 hover:border-blue-400 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group flex flex-col justify-between shadow-sm">
                <div>
                  <div className="relative h-40 overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80" alt="Pasir Batu" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent"></div>
                    <div className="absolute top-3 left-3 bg-blue-600 text-white p-2 rounded-xl text-lg shadow">
                      <i className="fa-solid fa-mountain"></i>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Pasir & Batu Kali</h3>
                    <p className="text-slate-500 text-xs leading-relaxed mb-4">Pasir pasang, pasir cor super, batu kerikil/split, dan batu pondasi kali tanpa lumpur.</p>
                    <ul className="text-xs text-slate-600 space-y-1.5 mb-2">
                      <li><i className="fa-solid fa-circle-check text-blue-600 mr-1.5"></i> Pasir Cor & Pasang Clean</li>
                      <li><i className="fa-solid fa-circle-check text-blue-600 mr-1.5"></i> Batu Split / Kerikil Cor</li>
                      <li><i className="fa-solid fa-circle-check text-blue-600 mr-1.5"></i> Hitungan Rit / Engkel</li>
                    </ul>
                  </div>
                </div>
                <div className="p-5 pt-0">
                  <button
                    onClick={() => openWAModal('Halo TB NS JAYA, saya mau tanya harga Pasir / Batu per rit.')}
                    className="w-full py-2.5 bg-slate-100 group-hover:bg-blue-600 text-slate-600 group-hover:text-white font-bold rounded-xl transition-all text-xs flex items-center justify-center gap-2 cursor-pointer border border-slate-200 group-hover:border-blue-600"
                  >
                    <i className="fa-brands fa-whatsapp text-sm"></i> Tanya Pasir & Batu
                  </button>
                </div>
              </div>

              {/* Card 3: Hebel / Bata Ringan */}
              <div className="bg-white border border-slate-200 hover:border-blue-400 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group flex flex-col justify-between shadow-sm">
                <div>
                  <div className="relative h-40 overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=600&q=80" alt="Bata Ringan Hebel" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent"></div>
                    <div className="absolute top-3 left-3 bg-blue-600 text-white p-2 rounded-xl text-lg shadow">
                      <i className="fa-solid fa-shapes"></i>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Bata Ringan / Hebel</h3>
                    <p className="text-slate-500 text-xs leading-relaxed mb-4">Hebel siku presisi tinggi, hemat perekat mortar, dan pemasangan dinding cepat & hemat waktu.</p>
                    <ul className="text-xs text-slate-600 space-y-1.5 mb-2">
                      <li><i className="fa-solid fa-circle-check text-blue-600 mr-1.5"></i> Ukuran 7.5 cm & 10 cm</li>
                      <li><i className="fa-solid fa-circle-check text-blue-600 mr-1.5"></i> Mortar Perekat Spesial</li>
                      <li><i className="fa-solid fa-circle-check text-blue-600 mr-1.5"></i> Siap Bongkar Muat</li>
                    </ul>
                  </div>
                </div>
                <div className="p-5 pt-0">
                  <button
                    onClick={() => openWAModal('Halo TB NS JAYA, saya mau tanya stok & harga Bata Ringan Hebel.')}
                    className="w-full py-2.5 bg-slate-100 group-hover:bg-blue-600 text-slate-600 group-hover:text-white font-bold rounded-xl transition-all text-xs flex items-center justify-center gap-2 cursor-pointer border border-slate-200 group-hover:border-blue-600"
                  >
                    <i className="fa-brands fa-whatsapp text-sm"></i> Pesan Hebel
                  </button>
                </div>
              </div>

              {/* Card 4: Besi SNI & Baja Ringan */}
              <div className="bg-white border border-slate-200 hover:border-blue-400 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group flex flex-col justify-between shadow-sm">
                <div>
                  <div className="relative h-40 overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1535813547-99c456a41d4a?auto=format&fit=crop&w=600&q=80" alt="Besi SNI Baja Ringan" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent"></div>
                    <div className="absolute top-3 left-3 bg-blue-600 text-white p-2 rounded-xl text-lg shadow">
                      <i className="fa-solid fa-layer-group"></i>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Besi SNI & Baja Ringan</h3>
                    <p className="text-slate-500 text-xs leading-relaxed mb-4">Besi beton polos & ulir standar SNI, kawat bendrat, kanal C galvalum, dan reng atap.</p>
                    <ul className="text-xs text-slate-600 space-y-1.5 mb-2">
                      <li><i className="fa-solid fa-circle-check text-blue-600 mr-1.5"></i> Besi Beton Ukuran Lengkap</li>
                      <li><i className="fa-solid fa-circle-check text-blue-600 mr-1.5"></i> Canal C & Reng Galvalum</li>
                      <li><i className="fa-solid fa-circle-check text-blue-600 mr-1.5"></i> Wiremesh & Kawat Ikat</li>
                    </ul>
                  </div>
                </div>
                <div className="p-5 pt-0">
                  <button
                    onClick={() => openWAModal('Halo TB NS JAYA, saya mau cek harga Besi Beton SNI / Galvalum.')}
                    className="w-full py-2.5 bg-slate-100 group-hover:bg-blue-600 text-slate-600 group-hover:text-white font-bold rounded-xl transition-all text-xs flex items-center justify-center gap-2 cursor-pointer border border-slate-200 group-hover:border-blue-600"
                  >
                    <i className="fa-brands fa-whatsapp text-sm"></i> Cek Besi SNI
                  </button>
                </div>
              </div>

              {/* Card 5: Cat Tembok & Kayu */}
              <div className="bg-white border border-slate-200 hover:border-blue-400 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group flex flex-col justify-between shadow-sm">
                <div>
                  <div className="relative h-40 overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=600&q=80" alt="Cat Tembok dan Kayu" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent"></div>
                    <div className="absolute top-3 left-3 bg-blue-600 text-white p-2 rounded-xl text-lg shadow">
                      <i className="fa-solid fa-paint-roller"></i>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Cat Tembok & Kayu</h3>
                    <p className="text-slate-500 text-xs leading-relaxed mb-4">Cat tembok interior/eksterior tahan cuaca, cat dasar anti bocor, kuas roll, dan pelapis.</p>
                    <ul className="text-xs text-slate-600 space-y-1.5 mb-2">
                      <li><i className="fa-solid fa-circle-check text-blue-600 mr-1.5"></i> Pilihan Warna Lengkap</li>
                      <li><i className="fa-solid fa-circle-check text-blue-600 mr-1.5"></i> Cat Anti Bocor Waterproof</li>
                      <li><i className="fa-solid fa-circle-check text-blue-600 mr-1.5"></i> Rol & Alat Cat Lengkap</li>
                    </ul>
                  </div>
                </div>
                <div className="p-5 pt-0">
                  <button
                    onClick={() => openWAModal('Halo TB NS JAYA, saya mau tanya warna & harga Cat Tembok/Kayu.')}
                    className="w-full py-2.5 bg-slate-100 group-hover:bg-blue-600 text-slate-600 group-hover:text-white font-bold rounded-xl transition-all text-xs flex items-center justify-center gap-2 cursor-pointer border border-slate-200 group-hover:border-blue-600"
                  >
                    <i className="fa-brands fa-whatsapp text-sm"></i> Pesan Cat
                  </button>
                </div>
              </div>

              {/* Card 6: Bahan Mebel Jepara — Featured */}
              <div className="bg-gradient-to-b from-blue-600 to-blue-700 border border-blue-500 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group flex flex-col justify-between shadow-md relative">
                <div className="absolute top-3 right-3 bg-orange-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-lg uppercase tracking-wider z-10 shadow">
                  Khusus Mebel Jepara
                </div>
                <div>
                  <div className="relative h-40 overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=600&q=80" alt="Bahan Mebel Jepara" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-900/70 via-blue-900/20 to-transparent"></div>
                    <div className="absolute top-3 left-3 bg-white/20 backdrop-blur text-white p-2 rounded-xl text-lg shadow">
                      <i className="fa-solid fa-couch"></i>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-xl font-bold text-white mb-2">Bahan Permebelan</h3>
                    <p className="text-blue-100 text-xs leading-relaxed mb-4">Suplai bahan baku pertukangan mebel Jepara: Thinner, Sanding Sealer, Amplas roll, Lem kayu epoksi, sekrup, dll.</p>
                    <ul className="text-xs text-blue-50 space-y-1.5 mb-2">
                      <li><i className="fa-solid fa-circle-check text-orange-300 mr-1.5"></i> Thinner High Grade & Sealer</li>
                      <li><i className="fa-solid fa-circle-check text-orange-300 mr-1.5"></i> Amplas Meteran/Roll & Lem Kayu</li>
                      <li><i className="fa-solid fa-circle-check text-orange-300 mr-1.5"></i> Engsel, Sekrup, & Aksesoris</li>
                    </ul>
                  </div>
                </div>
                <div className="p-5 pt-0">
                  <button
                    onClick={() => openWAModal('Halo TB NS JAYA, saya mau pesan Bahan Mebel (Thinner, Amplas, Lem, Sealer).')}
                    className="w-full py-2.5 bg-white text-blue-700 font-extrabold rounded-xl transition-all text-xs flex items-center justify-center gap-2 shadow hover:bg-blue-50 cursor-pointer"
                  >
                    <i className="fa-brands fa-whatsapp text-sm"></i> Pesan Bahan Mebel
                  </button>
                </div>
              </div>

              {/* Card 7: Pipa & Sanitari */}
              <div className="bg-white border border-slate-200 hover:border-blue-400 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group flex flex-col justify-between shadow-sm">
                <div>
                  <div className="relative h-40 overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=600&q=80" alt="Pipa PVC" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent"></div>
                    <div className="absolute top-3 left-3 bg-blue-600 text-white p-2 rounded-xl text-lg shadow">
                      <i className="fa-solid fa-faucet"></i>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Pipa & Plambing</h3>
                    <p className="text-slate-500 text-xs leading-relaxed mb-4">Pipa PVC air bersih/kotor, keran air stainless, sambungan knee/tee, lem pipa PVC anti bocor.</p>
                    <ul className="text-xs text-slate-600 space-y-1.5 mb-2">
                      <li><i className="fa-solid fa-circle-check text-blue-600 mr-1.5"></i> Pipa PVC Berbagai Ukuran</li>
                      <li><i className="fa-solid fa-circle-check text-blue-600 mr-1.5"></i> Keran Air, Stop Kran, & Knee</li>
                      <li><i className="fa-solid fa-circle-check text-blue-600 mr-1.5"></i> Lem Pipa Kuat Presisi</li>
                    </ul>
                  </div>
                </div>
                <div className="p-5 pt-0">
                  <button
                    onClick={() => openWAModal('Halo TB NS JAYA, saya mau pesan Pipa PVC dan fitting air.')}
                    className="w-full py-2.5 bg-slate-100 group-hover:bg-blue-600 text-slate-600 group-hover:text-white font-bold rounded-xl transition-all text-xs flex items-center justify-center gap-2 cursor-pointer border border-slate-200 group-hover:border-blue-600"
                  >
                    <i className="fa-brands fa-whatsapp text-sm"></i> Pesan Pipa Air
                  </button>
                </div>
              </div>

              {/* Card 8: Perkakas & Lainnya */}
              <div className="bg-white border border-slate-200 hover:border-blue-400 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group flex flex-col justify-between shadow-sm">
                <div>
                  <div className="relative h-40 overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80" alt="Perkakas Pertukangan" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent"></div>
                    <div className="absolute top-3 left-3 bg-blue-600 text-white p-2 rounded-xl text-lg shadow">
                      <i className="fa-solid fa-screwdriver-wrench"></i>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Perkakas & Tools</h3>
                    <p className="text-slate-500 text-xs leading-relaxed mb-4">Paku kayu/beton, sekop, cangkul, meteran, benang bangunan, ember cor, dan perlengkapan tukang.</p>
                    <ul className="text-xs text-slate-600 space-y-1.5 mb-2">
                      <li><i className="fa-solid fa-circle-check text-blue-600 mr-1.5"></i> Paku Kayu, Seng, & Beton</li>
                      <li><i className="fa-solid fa-circle-check text-blue-600 mr-1.5"></i> Alat Kerja Pertukangan Lengkap</li>
                      <li><i className="fa-solid fa-circle-check text-blue-600 mr-1.5"></i> Stok Selalu Ready</li>
                    </ul>
                  </div>
                </div>
                <div className="p-5 pt-0">
                  <button
                    onClick={() => openWAModal('Halo TB NS JAYA, saya mau tanya stok perkakas tukang.')}
                    className="w-full py-2.5 bg-slate-100 group-hover:bg-blue-600 text-slate-600 group-hover:text-white font-bold rounded-xl transition-all text-xs flex items-center justify-center gap-2 cursor-pointer border border-slate-200 group-hover:border-blue-600"
                  >
                    <i className="fa-brands fa-whatsapp text-sm"></i> Tanya Perkakas
                  </button>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* WHY CHOOSE US SECTION */}
        <section id="keunggulan" className="py-20 bg-white relative overflow-hidden">
          {/* Decorative orange blob */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="px-3.5 py-1 bg-orange-50 border border-orange-200 text-orange-600 rounded-full text-xs font-bold uppercase tracking-widest inline-flex items-center gap-1.5">
                <i className="fa-solid fa-award"></i> KEUNGGULAN KAMI
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3">Mengapa Berbelanja di TB NS JAYA?</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center hover:border-blue-300 hover:shadow-lg transition-all group">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center text-3xl mx-auto mb-6 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-colors shadow-sm">
                  <i className="fa-solid fa-shield-halved"></i>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">Kualitas Terjamin</h3>
                <p className="text-slate-500 text-sm leading-relaxed">Seluruh bahan bangunan dan perlengkapan mebel berasal dari pabrik/produsen resmi berkualifikasi standar tinggi.</p>
              </div>

              <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center hover:border-blue-300 hover:shadow-lg transition-all group">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center text-3xl mx-auto mb-6 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-colors shadow-sm">
                  <i className="fa-solid fa-truck-fast"></i>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">Pengiriman Siap & COD</h3>
                <p className="text-slate-500 text-sm leading-relaxed">Siap antar pesanan sampai ke lokasi proyek atau rumah Anda di wilayah Jepara dengan sistem COD (Bayar di Tempat).</p>
              </div>

              <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center hover:border-blue-300 hover:shadow-lg transition-all group">
                <div className="w-16 h-16 rounded-2xl bg-orange-50 text-orange-500 border border-orange-200 flex items-center justify-center text-3xl mx-auto mb-6 group-hover:bg-orange-500 group-hover:text-white group-hover:border-orange-500 transition-colors shadow-sm">
                  <i className="fa-solid fa-tags"></i>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">Harga Bersahabat</h3>
                <p className="text-slate-500 text-sm leading-relaxed">Dapatkan penawaran harga grosir & eceran bersaing di area Desa Semat, Tahunan, Jepara tanpa biaya tersembunyi.</p>
              </div>
            </div>
          </div>
        </section>

        {/* PAYMENT METHODS SECTION */}
        <section id="pembayaran" className="py-20 bg-blue-700 border-y border-blue-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="px-3.5 py-1 bg-white/10 border border-white/30 text-white rounded-full text-xs font-bold uppercase tracking-widest inline-flex items-center gap-1.5">
                <i className="fa-solid fa-wallet"></i> KEMUDAHAN TRANSAKSI
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3">4 Opsi Pembayaran Praktis</h2>
              <p className="mt-3 text-blue-200 text-sm">Pilih cara pembayaran yang paling sesuai dan fleksibel untuk Anda.</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Cash */}
              <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-6 text-center hover:bg-white/20 hover:border-white/40 transition-all shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-emerald-400/20 text-emerald-300 text-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-300/30">
                  <i className="fa-solid fa-money-bill-wave"></i>
                </div>
                <h4 className="font-bold text-white text-lg">Cash (Tunai)</h4>
                <p className="text-xs text-blue-200 mt-2">Bayar langsung secara tunai di kasir toko atau saat armada sampai.</p>
              </div>

              {/* Transfer Bank */}
              <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-6 text-center hover:bg-white/20 hover:border-white/40 transition-all shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-white/10 text-white text-2xl flex items-center justify-center mx-auto mb-4 border border-white/20">
                  <i className="fa-solid fa-building-columns"></i>
                </div>
                <h4 className="font-bold text-white text-lg">Transfer Bank</h4>
                <p className="text-xs text-blue-200 mt-2">Transfer via M-Banking / ATM setelah konfirmasi ketersediaan barang.</p>
              </div>

              {/* QRIS */}
              <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-6 text-center hover:bg-white/20 hover:border-white/40 transition-all shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-cyan-400/20 text-cyan-300 text-2xl flex items-center justify-center mx-auto mb-4 border border-cyan-300/30">
                  <i className="fa-solid fa-qrcode"></i>
                </div>
                <h4 className="font-bold text-white text-lg">QRIS Instant</h4>
                <p className="text-xs text-blue-200 mt-2">Scan praktis melalui GoPay, OVO, Dana, ShopeePay, atau aplikasi Bank.</p>
              </div>

              {/* COD */}
              <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-6 text-center hover:bg-white/20 hover:border-white/40 transition-all shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-orange-400/20 text-orange-300 text-2xl flex items-center justify-center mx-auto mb-4 border border-orange-300/30">
                  <i className="fa-solid fa-handshake"></i>
                </div>
                <h4 className="font-bold text-white text-lg">COD (Bayar Tempat)</h4>
                <p className="text-xs text-blue-200 mt-2">Bayar setelah bahan bangunan diperiksa dan tiba di lokasi Anda.</p>
              </div>
            </div>
          </div>
        </section>

        {/* INTERACTIVE ORDER SIMULATOR SECTION */}
        <section id="kalkulator" className="py-20 bg-slate-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-lg relative overflow-hidden">

              {/* Decorative corner accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-bl-full pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-50 rounded-tr-full pointer-events-none"></div>

              <div className="text-center mb-8 relative z-10">
                <span className="px-3.5 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
                  <i className="fa-solid fa-calculator"></i> Simulasi Order Cepat
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3">Format Pesanan Langsung ke WhatsApp</h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">Isi rincian kebutuhan Anda di bawah ini untuk menghasilkan pesan WhatsApp otomatis ke CS TB NS JAYA.</p>
              </div>

              <form onSubmit={handleSimulatorSubmit} className="space-y-6 relative z-10">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Pilih Material / Bahan:</label>
                    <select
                      value={simProduct}
                      onChange={(e) => setSimProduct(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="Semen (Tiga Roda/Gresik/Dynamix)">Semen (Tiga Roda / Gresik / Dynamix)</option>
                      <option value="Pasir Pasang / Pasir Cor">Pasir (Cor / Pasang)</option>
                      <option value="Bata Ringan Hebel">Bata Ringan / Hebel</option>
                      <option value="Batu Pondasi / Batu Split">Batu Pondasi / Batu Split</option>
                      <option value="Besi Beton SNI / Baja Ringan">Besi Beton SNI / Baja Ringan</option>
                      <option value="Cat Tembok / Cat Kayu">Cat Tembok / Cat Kayu</option>
                      <option value="Bahan Mebel (Thinner/Amplas/Lem/Sealer)">Bahan Mebel (Thinner, Amplas, Lem, Sealer)</option>
                      <option value="Pipa PVC & Plambing Air">Pipa PVC & Fitting Air</option>
                      <option value="Lainnya (Perkakas/Paku/Ember)">Lainnya (Perkakas/Paku/Dsb)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Estimasi Jumlah / Detail:</label>
                    <input
                      type="text"
                      value={simQty}
                      onChange={(e) => setSimQty(e.target.value)}
                      placeholder="Contoh: 25 sak / 2 rit / 5 roll"
                      required
                      className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 placeholder-slate-400"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Nama Pemesan:</label>
                    <input
                      type="text"
                      value={simName}
                      onChange={(e) => setSimName(e.target.value)}
                      placeholder="Nama Anda"
                      required
                      className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 placeholder-slate-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Alamat / Lokasi Pengiriman:</label>
                    <input
                      type="text"
                      value={simAddress}
                      onChange={(e) => setSimAddress(e.target.value)}
                      placeholder="Desa / Kecamatan di Jepara"
                      required
                      className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 placeholder-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Pilihan Metode Bayar:</label>
                  <select
                    value={simPayment}
                    onChange={(e) => setSimPayment(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="COD (Bayar di Tempat)">COD (Bayar di Tempat)</option>
                    <option value="Cash (Tunai di Toko)">Cash (Tunai di Toko)</option>
                    <option value="Transfer Bank">Transfer Bank</option>
                    <option value="QRIS">QRIS</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-black rounded-xl text-lg shadow-lg shadow-blue-100 hover:shadow-blue-200 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <i className="fa-brands fa-whatsapp text-2xl"></i>
                  <span>Kirim Pesanan Ini ke WhatsApp</span>
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* LOCATION SECTION */}
        <section id="lokasi" className="py-20 bg-white border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">

              <div>
                <span className="px-3.5 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-full text-xs font-bold uppercase tracking-widest inline-flex items-center gap-1.5">
                  <i className="fa-solid fa-map-pin"></i> LOKASI TOKO KAMI
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3 mb-6">Alamat Toko TB NS JAYA</h2>

                <div className="space-y-6 text-slate-600">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 text-xl font-bold border border-blue-200">
                      <i className="fa-solid fa-location-dot"></i>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-lg">Alamat Lengkap</h4>
                      <p className="text-sm text-slate-500 leading-relaxed mt-1">
                        RT02 / RW01, Desa Semat, Kecamatan Tahunan, Kabupaten Jepara, Jawa Tengah.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 text-xl font-bold border border-emerald-200">
                      <i className="fa-solid fa-clock"></i>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-lg">Jam Operasional</h4>
                      <p className="text-sm text-slate-500 mt-1">Buka Setiap Hari: 07.00 - 16.00 WIB</p>
                      <p className="text-sm text-orange-500 font-semibold mt-0.5"><i className="fa-solid fa-circle-info mr-1"></i>Khusus Hari Jumat: 07.00 - 11.00 WIB</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 text-xl font-bold border border-blue-200">
                      <i className="fa-solid fa-phone"></i>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-lg">Nomor Kontak WhatsApp</h4>
                      <p className="text-sm text-emerald-600 font-mono font-bold mt-1">0812-2876-440</p>
                      <p className="text-sm text-emerald-600 font-mono font-bold">0823-3044-9041</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap gap-4">
                  <a href="https://maps.app.goo.gl/tmKKJNb1D3X6nSg28" target="_blank" rel="noopener noreferrer" className="px-6 py-3.5 bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-blue-400 text-slate-700 font-bold rounded-xl shadow-sm transition-all flex items-center gap-2">
                    <i className="fa-solid fa-map-location-dot text-blue-600 text-xl"></i> Buka Google Maps
                  </a>
                  <button
                    onClick={() => openWAModal('Halo TB NS JAYA, saya minta petunjuk arah lokasi toko.')}
                    className="px-6 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <i className="fa-brands fa-whatsapp text-xl"></i> Petunjuk Arah via WA
                  </button>
                </div>
              </div>

              {/* Map */}
              <div className="bg-slate-50 p-3 sm:p-4 rounded-3xl border border-slate-200 shadow-md relative overflow-hidden">
                <div className="relative w-full h-[380px] sm:h-[420px] rounded-2xl overflow-hidden border border-slate-200 shadow-inner">

                  {/* Embedded Live Google Maps Frame */}
                  <iframe
                    src="https://maps.google.com/maps?q=TB.+NS+JAYA,+Semat,+Tahunan,+Jepara&t=&z=16&ie=UTF8&iwloc=&output=embed"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={true}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Peta Lokasi TB NS JAYA Semat Tahunan Jepara"
                    className="w-full h-full rounded-2xl transition-all duration-300">
                  </iframe>

                  {/* Map Top Overlay Badge */}
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md border border-slate-200 text-slate-800 px-3.5 py-2 rounded-xl shadow-md flex items-center gap-2.5 z-10">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                    <div>
                      <div className="text-xs font-bold text-slate-800 leading-tight">TB NS JAYA Semat Jepara</div>
                      <div className="text-[10px] text-slate-500 font-medium">Buka Setiap Hari (07.00 - 16.00 | Jumat s/d 11.00)</div>
                    </div>
                  </div>

                  {/* Map Floating Navigation Button Bottom Overlay */}
                  <div className="absolute bottom-3 right-3 left-3 sm:left-auto z-10">
                    <a href="https://maps.app.goo.gl/tmKKJNb1D3X6nSg28" target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-xs font-extrabold rounded-xl shadow-md transition-all duration-200 flex items-center justify-center gap-2">
                      <i className="fa-solid fa-diamond-turn-right text-sm"></i>
                      <span>Petunjuk Rute Google Maps</span>
                    </a>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="bg-blue-900 border-t border-blue-800 py-12 text-blue-200 text-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white font-black text-xl shadow">
                  <i className="fa-solid fa-helmet-safety"></i>
                </div>
                <div>
                  <span className="text-lg font-extrabold text-white">TB NS JAYA</span>
                  <p className="text-xs text-blue-300">Pusat Bahan Bangunan & Mebel Semat Tahunan Jepara</p>
                </div>
              </div>

              {/* Subtle Admin Portal Link — now correctly points to /login */}
              <div>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-orange-400/50 hover:bg-white/10 text-blue-300 hover:text-white transition-all text-xs font-semibold"
                >
                  <i className="fa-solid fa-user-shield text-orange-400 animate-pulse"></i>
                  <span>Portal Admin</span>
                </Link>
              </div>

              <div className="text-center md:text-right text-xs text-blue-400 space-y-1">
                <p>&copy; 2026 TB NS JAYA. Hak Cipta Dilindungi.</p>
                <p>RT02/RW01, Desa Semat, Kec. Tahunan, Kab. Jepara | HP: 08122876440 / 082330449041</p>
              </div>

            </div>
          </div>
        </footer>

        {/* FLOATING WA BUTTON */}
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={() => openWAModal('Halo TB NS JAYA, saya mau menanyakan ketersediaan stok barang.')}
            className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white flex items-center justify-center text-3xl shadow-2xl shadow-emerald-500/40 hover:scale-110 transition-all duration-300 group cursor-pointer"
          >
            <i className="fa-brands fa-whatsapp group-hover:rotate-12 transition-transform"></i>
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full border-2 border-white animate-ping"></span>
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full border-2 border-white"></span>
          </button>
        </div>

        {/* WHATSAPP NUMBER SELECTION MODAL */}
        <div
          id="waModal"
          onClick={(e) => {
            if (e.target.id === 'waModal') closeWAModal();
          }}
          className={`${waModalOpen ? 'flex' : 'hidden'} fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 items-center justify-center p-4`}
        >
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 relative shadow-2xl animate-in fade-in zoom-in duration-200">
            <button
              onClick={closeWAModal}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 text-xl cursor-pointer"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>

            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-500 text-3xl flex items-center justify-center mx-auto mb-3 border border-emerald-200">
                <i className="fa-brands fa-whatsapp"></i>
              </div>
              <h3 className="text-xl font-bold text-slate-800">Hubungi CS TB NS JAYA</h3>
              <p className="text-xs text-slate-500 mt-1">Pilih salah satu nomor WhatsApp berikut untuk terhubung langsung:</p>
            </div>

            <div className="space-y-3">
              {/* CS Option 1 */}
              <button
                onClick={() => redirectWA('628122876440')}
                className="w-full p-4 rounded-2xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-400 flex items-center justify-between text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg font-bold border border-blue-200">
                    <i className="fa-solid fa-user-headset"></i>
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 group-hover:text-blue-700">WhatsApp CS 1</div>
                    <div className="text-xs text-slate-500 font-mono">0812-2876-440</div>
                  </div>
                </div>
                <i className="fa-solid fa-chevron-right text-slate-400 group-hover:text-blue-500"></i>
              </button>

              {/* CS Option 2 */}
              <button
                onClick={() => redirectWA('6282330449041')}
                className="w-full p-4 rounded-2xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-400 flex items-center justify-between text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg font-bold border border-blue-200">
                    <i className="fa-solid fa-user-headset"></i>
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 group-hover:text-blue-700">WhatsApp CS 2</div>
                    <div className="text-xs text-slate-500 font-mono">0823-3044-9041</div>
                  </div>
                </div>
                <i className="fa-solid fa-chevron-right text-slate-400 group-hover:text-blue-500"></i>
              </button>
            </div>

            <p className="text-[11px] text-center text-slate-400 mt-6">
              *Pesan pertanyaan atau rincian simulasi pesanan Anda akan otomatis terisi.
            </p>
          </div>
        </div>

      </div>
    </>
  );
}
