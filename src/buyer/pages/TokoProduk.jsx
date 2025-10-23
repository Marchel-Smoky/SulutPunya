// src/buyer/pages/TokoProduk.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../supabase";
import { 
  ShoppingCart, 
  MessageCircle, 
  ArrowLeft, 
  Loader, 
  RefreshCw, 
  Home,
  MapPin,
  Star,
  Clock
} from "lucide-react";
import Notification from "../components/Notification.jsx";
import ProductCard from "../components/ProdukCard.jsx";

export default function TokoProduk() {
  const { tokoId } = useParams();
  const navigate = useNavigate();
  const [toko, setToko] = useState(null);
  const [produk, setProduk] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [guestId, setGuestId] = useState(null);

  // Setup guest_id
  useEffect(() => {
    let id = localStorage.getItem("guest_id");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("guest_id", id);
    }
    setGuestId(id);
  }, []);

  // Fetch toko & produk
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const id = Number(tokoId);
      if (isNaN(id)) throw new Error("ID toko tidak valid");

      const { data: tokoData, error: tokoError } = await supabase
        .from("toko")
        .select("id, nama, keterangan, logo, whatsapp, daerah, created_at")
        .eq("id", id)
        .single();

      if (tokoError || !tokoData) throw new Error("Toko tidak ditemukan");
      setToko(tokoData);

      const { data: produkData, error: produkError } = await supabase
        .from("produk")
        .select("id, nama, deskripsi, harga, foto_url, created_at, stok")
        .eq("toko_id", tokoData.id)
        .order("created_at", { ascending: false });

      if (produkError) throw produkError;
      setProduk(produkData || []);
    } catch (err) {
      console.error("Fetch error:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [tokoId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fetch jumlah cart
  const fetchCartCount = async () => {
    if (!guestId) return;
    const { count, error } = await supabase
      .from("keranjang")
      .select("*", { count: "exact" })
      .eq("guest_id", guestId);
    if (!error) setCartCount(count || 0);
  };

  useEffect(() => {
    if (guestId) fetchCartCount();
  }, [guestId]);

  const showNotification = (msg, type = "success") => {
    setNotification({ message: msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Add to cart
  const handleAddToCart = async (item) => {
    if (!guestId) return;
    try {
      const { data, error } = await supabase
        .from("keranjang")
        .upsert(
          {
            guest_id: guestId,
            produk_id: item.id,
            nama: item.nama,
            harga: item.harga,
            jumlah: 1
          },
          { onConflict: ["guest_id", "produk_id"] }
        );

      if (error) throw error;
      showNotification(`${item.nama} ditambahkan ke keranjang!`);
      fetchCartCount();
    } catch (err) {
      console.error("Gagal tambah keranjang:", err.message);
      showNotification("Gagal menambahkan ke keranjang", "error");
    }
  };

  const handleBuyNow = async (item) => {
    await handleAddToCart(item);
    navigate("/checkout");
  };

  const openWhatsApp = () => {
    if (!toko?.whatsapp) {
      showNotification("Nomor WhatsApp toko belum tersedia", "error");
      return;
    }
    const msg = `Halo, saya tertarik dengan produk di toko ${toko.nama}`;
    window.open(`https://wa.me/${toko.whatsapp}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  // Format tanggal bergabung
  const formatJoinDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <Loader className="animate-spin h-16 w-16 text-[#5bc0be] mb-4 mx-auto" />
          <p className="text-gray-300 text-lg font-medium">Memuat toko...</p>
          <p className="text-gray-400 text-sm mt-2">Mohon tunggu sebentar</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <div className="text-6xl mb-4">😢</div>
          <h2 className="text-2xl font-bold text-red-400 mb-3">Terjadi Kesalahan</h2>
          <p className="text-gray-300 text-base mb-6 bg-gray-800/50 p-4 rounded-xl">{error}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button 
              onClick={fetchData} 
              className="bg-[#5bc0be] px-6 py-3 rounded-xl text-black font-semibold flex items-center justify-center gap-2 hover:bg-[#4aa8a6] transition-all duration-300 text-base shadow-lg"
            >
              <RefreshCw size={20} /> Coba Lagi
            </button>
            <button 
              onClick={() => navigate("/")} 
              className="bg-gray-700 px-6 py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 hover:bg-gray-600 transition-all duration-300 text-base shadow-lg"
            >
              <Home size={20} /> Beranda
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {notification && <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}

      {/* Header dengan gradient yang menarik */}
      <header className="bg-gradient-to-r from-gray-800 via-gray-800 to-gray-900 backdrop-blur-sm py-6 px-4 sm:px-6 lg:px-8 sticky top-0 z-50 border-b border-gray-700/50 shadow-2xl">
        <div className="max-w-7xl mx-auto">
          {/* Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={() => navigate(-1)} 
              className="bg-white/10 p-3 rounded-xl hover:bg-white/20 transition-all duration-300 flex items-center gap-2 group border border-white/10 hover:border-white/20"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium hidden sm:block">Kembali</span>
            </button>
            
            <button 
              onClick={() => navigate("/keranjang")} 
              className="bg-gradient-to-r from-[#5bc0be] to-[#4aa8a6] p-3 rounded-xl text-black font-semibold relative hover:from-[#4aa8a6] hover:to-[#3b8d8b] transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 group"
            >
              <ShoppingCart size={20} className="group-hover:scale-110 transition-transform" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
              <span className="text-sm hidden sm:block">Keranjang</span>
            </button>
          </div>

          {/* Toko Info dengan design yang lebih menarik */}
          <div className="text-center">
            {/* Logo atau Avatar Toko */}
            <div className="flex justify-center mb-4">
              {toko.logo ? (
                <img
                  src={toko.logo}
                  alt={`Logo ${toko.nama}`}
                  className="w-20 h-20 rounded-2xl object-cover border-4 border-[#5bc0be]/30 shadow-2xl"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#5bc0be] to-[#4aa8a6] flex items-center justify-center border-4 border-[#5bc0be]/30 shadow-2xl">
                  <span className="text-2xl font-bold text-white">{toko.nama.charAt(0).toUpperCase()}</span>
                </div>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              {toko.nama}
            </h1>
            
            <p className="text-gray-300 text-base sm:text-lg mb-3 max-w-2xl mx-auto leading-relaxed">
              {toko.keterangan}
            </p>
            
            {/* Info Tambahan Toko */}
            <div className="flex flex-wrap justify-center gap-4 mb-4">
              {/* Lokasi Toko */}
              {toko.daerah && (
                <div className="flex items-center gap-2 bg-gray-700/50 px-3 py-2 rounded-lg border border-gray-600">
                  <MapPin size={16} className="text-[#5bc0be]" />
                  <span className="text-gray-300 text-sm">{toko.daerah}</span>
                </div>
              )}

              {/* Tanggal Bergabung */}
              {toko.created_at && (
                <div className="flex items-center gap-2 bg-gray-700/50 px-3 py-2 rounded-lg border border-gray-600">
                  <Clock size={16} className="text-[#5bc0be]" />
                  <span className="text-gray-300 text-sm">Bergabung {formatJoinDate(toko.created_at)}</span>
                </div>
              )}

              {/* Jumlah Produk */}
              <div className="flex items-center gap-2 bg-gray-700/50 px-3 py-2 rounded-lg border border-gray-600">
                <Star size={16} className="text-[#5bc0be]" />
                <span className="text-gray-300 text-sm">{produk.length} Produk</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button 
                onClick={openWhatsApp} 
                className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-3 rounded-xl text-white font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 flex items-center justify-center gap-2 text-base shadow-lg hover:shadow-xl hover:scale-105 group"
              >
                <MessageCircle size={20} className="group-hover:scale-110 transition-transform" />
                <span>Chat via WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Produk Section dengan grid yang rapi */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 mt-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Katalog Produk
          </h2>
          <p className="text-gray-400 text-lg">
            Temukan {produk.length} produk terbaik dari toko kami
          </p>
        </div>

        {produk.length === 0 ? (
          <div className="text-center py-16 bg-gray-800/30 rounded-3xl border-2 border-dashed border-gray-700 mx-2">
            <div className="text-7xl mb-6">📦</div>
            <h3 className="text-2xl font-bold text-gray-300 mb-3">Belum ada produk</h3>
            <p className="text-gray-400 text-lg mb-6 max-w-md mx-auto">
              Toko ini sedang mempersiapkan produk terbaik untuk Anda
            </p>
            <button 
              onClick={openWhatsApp} 
              className="bg-gradient-to-r from-[#5bc0be] to-[#4aa8a6] px-8 py-3 rounded-xl text-black font-semibold hover:from-[#4aa8a6] hover:to-[#3b8d8b] transition-all duration-300 text-lg shadow-lg hover:shadow-xl"
            >
              Tanya Pemilik Toko
            </button>
          </div>
        ) : (
          <div className="w-full">
            {/* Grid Produk - 3 kolom untuk semua device */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {produk.map((p, index) => (
                <div 
                  key={p.id} 
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <ProductCard 
                    product={p} 
                    onAddToCart={handleAddToCart} 
                    onBuyNow={handleBuyNow}
                    layout="grid"
                  />
                </div>
              ))}
            </div>

            {/* Info jumlah produk */}
            <div className="text-center mt-12 pt-8 border-t border-gray-700/50">
              <p className="text-gray-400 text-sm">
                Menampilkan semua {produk.length} produk • Scroll untuk melihat lebih banyak
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Floating Action Button for Mobile */}
      <div className="fixed bottom-6 right-6 sm:hidden z-40 animate-bounce">
        <button 
          onClick={() => navigate("/keranjang")} 
          className="bg-gradient-to-r from-[#5bc0be] to-[#4aa8a6] p-4 rounded-full text-black font-semibold relative hover:from-[#4aa8a6] hover:to-[#3b8d8b] transition-all duration-300 shadow-2xl hover:scale-110 group"
        >
          <ShoppingCart size={24} className="group-hover:scale-110 transition-transform" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-lg animate-pulse">
              {cartCount > 9 ? "9+" : cartCount}
            </span>
          )}
        </button>
      </div>

      {/* Bottom Navigation for Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 bg-gray-800/95 backdrop-blur-lg border-t border-gray-700 p-4 sm:hidden z-30">
        <div className="flex justify-around items-center">
          <button 
            onClick={() => navigate(-1)} 
            className="flex flex-col items-center text-gray-300 hover:text-white transition-all duration-300 group"
          >
            <div className="bg-gray-700 p-3 rounded-xl group-hover:bg-gray-600 transition-colors">
              <ArrowLeft size={20} />
            </div>
            <span className="text-xs mt-2 font-medium">Kembali</span>
          </button>
          
          <button 
            onClick={openWhatsApp} 
            className="flex flex-col items-center text-gray-300 hover:text-white transition-all duration-300 group"
          >
            <div className="bg-green-500/20 p-3 rounded-xl group-hover:bg-green-500/30 transition-colors">
              <MessageCircle size={20} className="text-green-400" />
            </div>
            <span className="text-xs mt-2 font-medium">Chat</span>
          </button>

          <button 
            onClick={() => navigate("/")} 
            className="flex flex-col items-center text-gray-300 hover:text-white transition-all duration-300 group"
          >
            <div className="bg-gray-700 p-3 rounded-xl group-hover:bg-gray-600 transition-colors">
              <Home size={20} />
            </div>
            <span className="text-xs mt-2 font-medium">Home</span>
          </button>
        </div>
      </nav>

      {/* Add padding for mobile bottom nav */}
      <div className="pb-20 sm:pb-0"></div>

      {/* Custom CSS untuk animasi */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
