// src/buyer/components/Keranjang.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, ArrowLeft, ShoppingBag } from "lucide-react";
import { supabase } from "../../supabase";
import { useCart } from "../hooks/useCart";

export default function Keranjang() {
  const navigate = useNavigate();
  const { cart, cartCount, removeFromCart, clearCart } = useCart();

  // Format Rupiah
  const formatRupiah = (num) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);

  const totalHarga = cart.reduce((sum, item) => sum + (item.harga || 0) * (item.jumlah || 1), 0);

  // Hapus 1 item
  const handleRemove = async (itemId) => {
    await removeFromCart(itemId);
  };

  // Kosongkan keranjang
  const handleClearCart = async () => {
    await clearCart();
  };

  // Checkout
  const handleCheckout = async () => {
    if (cart.length === 0) return;

    try {
      const { data: pesanan, error: pesananError } = await supabase
        .from("pesanan")
        .insert([
          {
            guest_id: crypto.randomUUID(),
            status: "keranjang",
            created_at: new Date().toISOString(),
            alamat: "",
          },
        ])
        .select("id")
        .single();

      if (pesananError) throw pesananError;

      const pesananId = pesanan.id;

      const detailInsert = cart.map((item) => ({
        pesanan_id: pesananId,
        produk_id: item.id,
        jumlah: item.jumlah || 1,
        harga_saat_ini: item.harga,
      }));

      const { error: detailError } = await supabase.from("pesanan_detail").insert(detailInsert);
      if (detailError) throw detailError;

      await clearCart();
      navigate("/checkout?pesananId=" + pesananId);
    } catch (err) {
      console.error("Gagal checkout:", err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b132b] via-[#1c2541] to-[#0b132b] text-white">
      {/* Header */}
      <div className="bg-[#1c2541] py-4 px-4 sticky top-0 z-10 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold flex items-center relative">
          <div className="relative">
            <ShoppingBag size={24} className="mr-2" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {cartCount}
              </span>
            )}
          </div>
          Keranjang Belanja
        </h1>
        <div className="w-10"></div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {cart.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag size={64} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-400 text-lg mb-6">Keranjang belanja kosong.</p>
            <button
              onClick={() => navigate("/")}
              className="bg-green-500 text-black px-6 py-3 rounded-xl font-bold hover:bg-green-600 transition-colors"
            >
              Mulai Belanja
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Daftar Item */}
            <div className="bg-gray-900/80 rounded-2xl p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Item ({cart.length})</h2>
                <button
                  onClick={handleClearCart}
                  className="text-red-400 text-sm hover:text-red-300 flex items-center"
                >
                  <Trash2 size={16} className="mr-1" />
                  Kosongkan
                </button>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {item.foto_url && (
                        <img
                          src={item.foto_url}
                          alt={item.nama}
                          className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-white truncate">{item.nama}</h3>
                        <p className="text-gray-400 text-sm">
                          {item.jumlah || 1} × {formatRupiah(item.harga)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="text-red-400 hover:text-red-300 p-2 ml-2"
                      aria-label="Hapus item"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Ringkasan Belanja */}
            <div className="bg-gray-900/80 rounded-2xl p-4">
              <h3 className="text-lg font-semibold mb-3">Ringkasan Belanja</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal ({cart.length} item):</span>
                  <span>{formatRupiah(totalHarga)}</span>
                </div>
                <div className="flex justify-between text-green-400 font-semibold text-lg pt-2 border-t border-gray-700">
                  <span>Total:</span>
                  <span>{formatRupiah(totalHarga)}</span>
                </div>
              </div>
            </div>

            {/* Tombol Checkout */}
            <button
              onClick={handleCheckout}
              className="w-full bg-green-500 text-black py-4 rounded-xl font-bold hover:bg-green-600 transition-colors text-lg flex items-center justify-center"
            >
              Lanjut ke Checkout
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 ml-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
