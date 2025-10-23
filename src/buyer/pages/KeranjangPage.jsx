// src/buyer/pages/KeranjangPages.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../../supabase";
import { useNavigate } from "react-router-dom";
import { Trash2, ShoppingBag, ArrowLeft } from "lucide-react";

export default function KeranjangPages() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [guestId, setGuestId] = useState(null);

  // Ambil guest_id dari localStorage atau buat baru
  useEffect(() => {
    let id = localStorage.getItem("guest_id");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("guest_id", id);
    }
    setGuestId(id);
  }, []);

  // Fetch keranjang berdasarkan guest_id
  const fetchCart = async () => {
    if (!guestId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("keranjang")
        .select("id, produk_id, jumlah, harga, foto_url, nama")
        .eq("guest_id", guestId);

      if (error) throw error;

      setCart(data || []);
    } catch (err) {
      console.error("Gagal fetch keranjang:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (guestId) fetchCart();
  }, [guestId]);

  // Hapus item
  const handleRemove = async (id) => {
    try {
      await supabase.from("keranjang").delete().eq("id", id);
      setCart(cart.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Gagal hapus item:", err.message);
    }
  };

  // Kosongkan keranjang
  const handleClear = async () => {
    try {
      await supabase.from("keranjang").delete().eq("guest_id", guestId);
      setCart([]);
    } catch (err) {
      console.error("Gagal kosongkan keranjang:", err.message);
    }
  };

  // Hitung total harga
  const totalHarga = cart.reduce((sum, item) => sum + (item.harga || 0) * (item.jumlah || 1), 0);

  const formatRupiah = (num) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(num);

  // Checkout
  const handleCheckout = () => {
    if (cart.length === 0) return;
    navigate("/checkout"); // nanti bisa tambahkan guest_id
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-gray-900">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="flex items-center mb-4">
        <button onClick={() => navigate(-1)} className="p-2 bg-gray-800 rounded-lg mr-4">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold flex items-center">
          <ShoppingBag size={24} className="mr-2" />
          Keranjang ({cart.length})
        </h1>
      </div>

      {cart.length === 0 ? (
        <div className="text-center mt-12">
          <ShoppingBag size={64} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-400 mb-6">Keranjang belanja kosong.</p>
          <button
            onClick={() => navigate("/")}
            className="bg-green-500 px-6 py-3 rounded-xl text-black font-bold hover:bg-green-600"
          >
            Mulai Belanja
          </button>
        </div>
      ) : (
        <div className="space-y-6 max-w-2xl mx-auto">
          <div className="bg-gray-800 p-4 rounded-2xl">
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 bg-gray-700 rounded-lg mb-3"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {item.foto_url && (
                    <img
                      src={item.foto_url}
                      alt={item.nama}
                      className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{item.nama}</h3>
                    <p className="text-gray-300 text-sm">
                      {item.jumlah} × {formatRupiah(item.harga)}
                    </p>
                  </div>
                </div>
                <button onClick={() => handleRemove(item.id)} className="text-red-400 hover:text-red-300 p-2">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
            <div className="flex justify-between mt-4 font-semibold text-lg">
              <span>Total:</span>
              <span>{formatRupiah(totalHarga)}</span>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleClear}
                className="flex-1 bg-red-500 py-3 rounded-xl font-bold hover:bg-red-600"
              >
                Kosongkan
              </button>
              <button
                onClick={handleCheckout}
                className="flex-1 bg-green-500 py-3 rounded-xl font-bold hover:bg-green-600"
              >
                Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
