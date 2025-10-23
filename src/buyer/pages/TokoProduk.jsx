// src/buyer/pages/TokoProduk.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../supabase";
import { 
  ShoppingCart, 
  MessageCircle, 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  Loader, 
  RefreshCw, 
  Home,
  ChevronDown 
} from "lucide-react";
import Notification from "../components/Notification.jsx";

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
        { onConflict: ["guest_id", "produk_id"] } // pastikan kolom ini ada di table
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
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <Loader className="animate-spin h-12 w-12 text-[#5bc0be]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">😢</div>
          <h2 className="text-2xl font-bold text-red-400 mb-2">Terjadi Kesalahan</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={fetchData} className="bg-[#5bc0be] px-4 py-2 rounded-lg text-black font-semibold flex items-center gap-2 hover:bg-[#4aa8a6]">
              <RefreshCw size={18} /> Coba Lagi
            </button>
            <button onClick={() => navigate("/")} className="bg-gray-600 px-4 py-2 rounded-lg text-white font-semibold flex items-center gap-2 hover:bg-gray-700">
              <Home size={18} /> Beranda
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {notification && <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}

      {/* Header */}
      <header className="bg-gray-800 py-6 px-4 text-center sticky top-0 z-50">
        <button onClick={() => navigate(-1)} className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/10 p-2 rounded-lg hover:bg-white/20 transition">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">{toko.nama}</h1>
        <p className="text-gray-300">{toko.keterangan}</p>
        <div className="flex justify-center gap-4 mt-4">
          <button onClick={() => navigate("/keranjang")} className="flex items-center gap-2 bg-[#5bc0be] px-5 py-2 rounded-xl text-black font-semibold relative hover:bg-[#4aa8a6]">
            <ShoppingCart size={20} /> Keranjang
            {cartCount > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{cartCount}</span>}
          </button>
          <button onClick={openWhatsApp} className="flex items-center gap-2 bg-green-500 px-5 py-2 rounded-xl text-black font-semibold hover:bg-green-600">
            <MessageCircle size={20} /> Chat
          </button>
        </div>
      </header>

      {/* Produk */}
      <main className="max-w-6xl mx-auto p-4 mt-6">
        <h2 className="text-2xl font-bold mb-6 text-center">Produk Kami</h2>
        {produk.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-6xl mb-4">📦</div>
            <p>Belum ada produk di toko ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {produk.map((p) => (
              <div key={p.id} className="bg-gray-800 p-4 rounded-xl shadow hover:shadow-[#5bc0be]/30 transition">
                <h3 className="font-bold text-lg mb-2">{p.nama}</h3>
                <p className="text-gray-300 text-sm mb-2 line-clamp-2">{p.deskripsi}</p>
                <p className="text-yellow-400 font-bold mb-3">Rp {p.harga.toLocaleString('id-ID')}</p>
                {p.foto_url?.length > 0 && <img src={p.foto_url[0]} alt={p.nama} className="w-full h-32 object-cover rounded-lg mb-3" />}
                <div className="flex gap-2 mt-2">
                  <button onClick={() => handleAddToCart(p)} className="flex-1 bg-[#5bc0be] py-2 rounded-lg font-semibold hover:bg-[#4aa8a6]">+ Keranjang</button>
                  <button onClick={() => handleBuyNow(p)} className="flex-1 bg-green-500 py-2 rounded-lg font-semibold hover:bg-green-600">Beli</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
