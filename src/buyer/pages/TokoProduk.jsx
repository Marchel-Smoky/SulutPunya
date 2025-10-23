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
  MapPin
} from "lucide-react";
import Notification from "../components/Notification.jsx";
import ProductCard from "../../components/ProductCard.jsx";

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
        .select("id, nama, keterangan, logo, whatsapp, daerah")
        .eq("id", id)
        .single();

      if (tokoError || !tokoData) throw new Error("Toko tidak ditemukan");
      setToko(tokoData);

      const { data: produkData, error: produkError } = await supabase
        .from("produk")
        .select("id, nama, deskripsi, harga, foto_url, created_at")
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex flex-col items-center justify-center p-4">
        <Loader className="animate-spin h-12 w-12 text-[#5bc0be] mb-4" />
        <p className="text-gray-300 text-sm sm:text-base">Memuat toko...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <div className="text-5xl sm:text-6xl mb-4">😢</div>
          <h2 className="text-xl sm:text-2xl font-bold text-red-400 mb-2">Terjadi Kesalahan</h2>
          <p className="text-gray-300 text-sm sm:text-base mb-6">{error}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button 
              onClick={fetchData} 
              className="bg-[#5bc0be] px-4 py-2 rounded-lg text-black font-semibold flex items-center justify-center gap-2 hover:bg-[#4aa8a6] transition-colors text-sm sm:text-base"
            >
              <RefreshCw size={18} /> Coba Lagi
            </button>
            <button 
              onClick={() => navigate("/")} 
              className="bg-gray-600 px-4 py-2 rounded-lg text-white font-semibold flex items-center justify-center gap-2 hover:bg-gray-700 transition-colors text-sm sm:text-base"
            >
              <Home size={18} /> Beranda
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Split products for different layouts
  const mobileHorizontalProducts = produk.slice(0, 3);
  const mobileVerticalProducts = produk.slice(3);
  
  const desktopHorizontalProducts = produk.slice(0, 7);
  const desktopVerticalProducts = produk.slice(7);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      {notification && <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}

      {/* Header */}
      <header className="bg-gray-800/90 backdrop-blur-sm py-4 px-3 sm:px-4 lg:px-6 sticky top-0 z-50 border-b border-gray-700">
        <div className="max-w-7xl mx-auto">
          {/* Navigation */}
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <button 
              onClick={() => navigate(-1)} 
              className="bg-white/10 p-2 rounded-lg hover:bg-white/20 transition-all duration-200 flex items-center gap-2"
            >
              <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm hidden sm:block">Kembali</span>
            </button>
            
            <button 
              onClick={() => navigate("/keranjang")} 
              className="bg-[#5bc0be] p-2 rounded-lg text-black font-semibold relative hover:bg-[#4aa8a6] transition-colors flex items-center gap-2"
            >
              <ShoppingCart size={18} className="sm:w-5 sm:h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
              <span className="text-xs sm:text-sm hidden sm:block">Keranjang</span>
            </button>
          </div>

          {/* Toko Info */}
          <div className="text-center">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2 line-clamp-1">
              {toko.nama}
            </h1>
            <p className="text-gray-300 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2">
              {toko.keterangan}
            </p>
            
            {/* Lokasi Toko */}
            {toko.daerah && (
              <div className="flex items-center justify-center gap-1 mb-3 sm:mb-4">
                <MapPin size={14} className="text-[#5bc0be]" />
                <span className="text-gray-400 text-xs sm:text-sm">{toko.daerah}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
              <button 
                onClick={openWhatsApp} 
                className="bg-green-500 px-4 sm:px-5 py-2 rounded-xl text-black font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base flex-1 sm:flex-none"
              >
                <MessageCircle size={18} className="sm:w-5 sm:h-5" />
                <span>Chat Toko</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Produk Section */}
      <main className="max-w-7xl mx-auto p-3 sm:p-4 lg:p-6 mt-4 sm:mt-6">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2">Produk Kami</h2>
          <p className="text-gray-400 text-sm sm:text-base">
            {produk.length} produk tersedia
          </p>
        </div>

        {produk.length === 0 ? (
          <div className="text-center py-8 sm:py-12 lg:py-16 text-gray-400 bg-gray-800/50 rounded-2xl mx-2 sm:mx-0">
            <div className="text-5xl sm:text-6xl mb-4">📦</div>
            <p className="text-base sm:text-lg mb-2">Belum ada produk di toko ini.</p>
            <p className="text-sm text-gray-500">Silakan hubungi toko untuk informasi lebih lanjut</p>
          </div>
        ) : (
          <div className="w-full">
            {/* Mobile Layout: 3 horizontal + vertical scroll */}
            <div className="block xl:hidden">
              {/* Horizontal Scroll untuk 3 item pertama */}
              {mobileHorizontalProducts.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-400 mb-3 px-1">Produk Unggulan</h3>
                  <div className="flex space-x-4 overflow-x-auto pb-4 -mx-2 px-2 scrollbar-hide">
                    {mobileHorizontalProducts.map((p) => (
                      <ProductCard 
                        key={p.id} 
                        product={p} 
                        onAddToCart={handleAddToCart} 
                        onBuyNow={handleBuyNow}
                        layout="horizontal"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Vertical List untuk item selanjutnya */}
              {mobileVerticalProducts.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-3 px-1">Semua Produk</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {mobileVerticalProducts.map((p) => (
                      <ProductCard 
                        key={p.id} 
                        product={p} 
                        onAddToCart={handleAddToCart} 
                        onBuyNow={handleBuyNow}
                        layout="vertical"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Desktop Layout: 7 horizontal + vertical grid */}
            <div className="hidden xl:block">
              {/* Horizontal Scroll untuk 7 item pertama */}
              {desktopHorizontalProducts.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-400 mb-4">Produk Unggulan</h3>
                  <div className="flex space-x-6 overflow-x-auto pb-6 -mx-2 px-2 scrollbar-hide">
                    {desktopHorizontalProducts.map((p) => (
                      <ProductCard 
                        key={p.id} 
                        product={p} 
                        onAddToCart={handleAddToCart} 
                        onBuyNow={handleBuyNow}
                        layout="horizontal"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Grid untuk item selanjutnya */}
              {desktopVerticalProducts.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-400 mb-4">Produk Lainnya</h3>
                  <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                    {desktopVerticalProducts.map((p) => (
                      <ProductCard 
                        key={p.id} 
                        product={p} 
                        onAddToCart={handleAddToCart} 
                        onBuyNow={handleBuyNow}
                        layout="grid"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Floating Action Button for Mobile */}
      <div className="fixed bottom-4 right-4 sm:hidden z-40">
        <button 
          onClick={() => navigate("/keranjang")} 
          className="bg-[#5bc0be] p-3 rounded-full text-black font-semibold relative hover:bg-[#4aa8a6] transition-colors shadow-lg"
        >
          <ShoppingCart size={20} />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {cartCount > 9 ? "9+" : cartCount}
            </span>
          )}
        </button>
      </div>

      {/* Bottom Navigation for Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 p-3 sm:hidden z-30">
        <div className="flex justify-between items-center">
          <button 
            onClick={() => navigate(-1)} 
            className="flex flex-col items-center text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="text-xs mt-1">Kembali</span>
          </button>
          <button 
            onClick={openWhatsApp} 
            className="flex flex-col items-center text-gray-400 hover:text-white transition-colors"
          >
            <MessageCircle size={20} />
            <span className="text-xs mt-1">Chat</span>
          </button>
        </div>
      </nav>

      {/* Add padding for mobile bottom nav */}
      <div className="pb-16 sm:pb-0"></div>
    </div>
  );
}
