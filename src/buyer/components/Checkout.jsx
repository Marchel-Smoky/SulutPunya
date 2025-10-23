// src/pages/Checkout.jsx
import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../../supabase";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingBag, MessageCircle } from "lucide-react";

export default function Checkout({ tokoId: initialTokoId, cartItems: propsCartItems }) {
  const [form, setForm] = useState({
    namaPenerima: "",
    alamat: "",
    kota: "",
    kodePos: "",
    catatan: "",
  });
  const [tokoWA, setTokoWA] = useState("");
  const [tokoNama, setTokoNama] = useState("");
  const [loadingToko, setLoadingToko] = useState(true);
  const [cartItems, setCartItems] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productImages, setProductImages] = useState({});
  const navigate = useNavigate();

  // Ambil cartItems dari props atau localStorage
  useEffect(() => {
    if (propsCartItems && propsCartItems.length > 0) {
      setCartItems(propsCartItems);
    } else {
      try {
        const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
        setCartItems(storedCart);
      } catch (error) {
        console.error("Error parsing cart from localStorage:", error);
        setCartItems([]);
      }
    }
  }, [propsCartItems]);

  // Ambil gambar produk dari foto_url
  useEffect(() => {
    if (!cartItems || cartItems.length === 0) return;

    const imagesMap = {};
    cartItems.forEach((item) => {
      if (item.foto_url) {
        imagesMap[item.id] = Array.isArray(item.foto_url)
          ? item.foto_url[0]
          : item.foto_url;
      }
    });

    setProductImages(imagesMap);
  }, [cartItems]);

  // Ambil data toko
  const fetchToko = useCallback(async () => {
    let resolvedTokoId = initialTokoId;

    if (!resolvedTokoId && cartItems.length > 0 && cartItems[0].toko_id) {
      resolvedTokoId = cartItems[0].toko_id;
    }

    if (!resolvedTokoId) {
      setLoadingToko(false);
      return;
    }

    try {
      setLoadingToko(true);
      const { data, error } = await supabase
        .from("toko")
        .select("whatsapp, nama")
        .eq("id", resolvedTokoId)
        .single();

      if (error) {
        console.error("Gagal ambil data toko:", error);
        setTokoWA("");
        setTokoNama("");
        return;
      }

      if (!data) {
        console.error("Toko tidak ditemukan");
        setTokoWA("");
        setTokoNama("");
        return;
      }

      let whatsappNumber = data.whatsapp || "";
      whatsappNumber = whatsappNumber.replace(/\D/g, ""); // hanya angka

      setTokoWA(whatsappNumber);
      setTokoNama(data.nama || "");
    } catch (err) {
      console.error("Error fetch toko:", err);
      setTokoWA("");
      setTokoNama("");
    } finally {
      setLoadingToko(false);
    }
  }, [initialTokoId, cartItems]);

  useEffect(() => {
    fetchToko();
  }, [fetchToko]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!form.namaPenerima || !form.alamat || !form.kota || !form.kodePos) {
      alert("Harap isi semua field wajib!");
      setIsSubmitting(false);
      return;
    }

    if (!tokoWA) {
      alert("Nomor WhatsApp toko belum tersedia.");
      setIsSubmitting(false);
      return;
    }

    if (!cartItems || cartItems.length === 0) {
      alert("Keranjang belanja kosong!");
      setIsSubmitting(false);
      return;
    }

    try {
      const totalHarga = cartItems.reduce(
        (sum, item) => sum + (item.harga || 0) * (item.qty || 1),
        0
      );

      const produkText = cartItems
        .map(
          (item, i) =>
            `${i + 1}. ${item.nama || "Produk"} - Qty: ${item.qty || 1} - Rp ${(item.harga || 0).toLocaleString(
              "id-ID"
            )}`
        )
        .join("\n");

      const message = `Halo ${tokoNama}, saya ingin memesan dari toko Anda.
      
-- DAFTAR PRODUK --
${produkText}
Total Harga: Rp ${totalHarga.toLocaleString("id-ID")}

-- DATA PENERIMA --
Nama: ${form.namaPenerima}
Alamat: ${form.alamat}
Kota: ${form.kota}
Kode Pos: ${form.kodePos}
Catatan: ${form.catatan || "-"}

Terima kasih.`;

      const encodedMessage = encodeURIComponent(message);
      const waUrl = `https://wa.me/${tokoWA}?text=${encodedMessage}`;

      localStorage.setItem("checkoutData", JSON.stringify({ form, cartItems }));

      window.open(waUrl, "_blank");

      setForm({
        namaPenerima: "",
        alamat: "",
        kota: "",
        kodePos: "",
        catatan: "",
      });

      if (!propsCartItems) {
        localStorage.removeItem("cart");
        setCartItems([]);
      }

      navigate(`/toko/${tokoNama}`);
    } catch (error) {
      console.error("Error during checkout:", error);
      alert("Terjadi kesalahan saat memproses pesanan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatRupiah = (num) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);

  if (loadingToko) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-[#0b132b] via-[#1c2541] to-[#0b132b]">
        <div className="text-center text-white">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500 mb-2"></div>
          <p>Memuat data toko...</p>
        </div>
      </div>
    );
  }

  const isDisabled = !tokoWA || !cartItems || cartItems.length === 0 || isSubmitting;

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
        <h1 className="text-xl font-bold">Checkout</h1>
        <div className="w-10"></div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-lg">
        {/* Info Toko */}
        {tokoNama && (
          <div className="mb-6 bg-gray-800 p-4 rounded-xl">
            <div className="flex items-center">
              <ShoppingBag size={20} className="mr-2 text-green-400" />
              <h3 className="font-semibold">Pesanan untuk:</h3>
            </div>
            <p className="text-green-400 font-medium text-lg mt-1">{tokoNama}</p>
          </div>
        )}

        {/* Ringkasan Produk */}
        {cartItems && cartItems.length > 0 ? (
          <div className="mb-6 bg-gray-800 p-4 rounded-xl text-white">
            <h3 className="font-semibold mb-3 text-lg border-b border-gray-700 pb-2">
              Produk Dipesan ({cartItems.length} item)
            </h3>
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {cartItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center border-b border-gray-700 pb-3 last:border-0 last:pb-0"
                >
                  <div className="flex-shrink-0 w-16 h-16 mr-3">
                    {productImages[item.id] ? (
                      <img
                        src={productImages[item.id]}
                        alt={item.nama}
                        className="w-full h-full object-cover rounded-md"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-700 rounded-md flex items-center justify-center">
                        <span className="text-xs text-gray-400">No Image</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-grow">
                    <h4 className="font-medium text-sm line-clamp-2">{item.nama}</h4>
                    <p className="text-gray-300 text-xs">Qty: {item.qty || 1}</p>
                    <p className="text-green-400 font-semibold text-sm">
                      {formatRupiah((item.harga || 0) * (item.qty || 1))}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-700 mt-4 pt-3 font-semibold flex justify-between">
              <span>Total:</span>
              <span className="text-green-400">
                {formatRupiah(
                  cartItems.reduce(
                    (sum, item) => sum + (item.harga || 0) * (item.qty || 1),
                    0
                  )
                )}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-white text-center mb-6 py-4 bg-gray-800 rounded-xl">
            Keranjang belanja kosong.
          </p>
        )}

        {/* Form Alamat */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Nama Penerima *
            </label>
            <input
              type="text"
              name="namaPenerima"
              placeholder="Masukkan nama lengkap penerima"
              value={form.namaPenerima}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:outline-none"
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Alamat Lengkap *
            </label>
            <textarea
              name="alamat"
              placeholder="Masukkan alamat lengkap penerima"
              value={form.alamat}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:outline-none"
              rows={3}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Kota *
              </label>
              <input
                type="text"
                name="kota"
                placeholder="Kota"
                value={form.kota}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:outline-none"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Kode Pos *
              </label>
              <input
                type="text"
                name="kodePos"
                placeholder="Kode Pos"
                value={form.kodePos}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:outline-none"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Catatan (opsional)
            </label>
            <textarea
              name="catatan"
              placeholder="Catatan untuk penjual (contoh: warna, ukuran, dll)"
              value={form.catatan}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:outline-none"
              rows={2}
              disabled={isSubmitting}
            />
          </div>

          <button
            type="submit"
            disabled={isDisabled}
            className={`w-full py-4 rounded-xl font-bold transition flex items-center justify-center ${
              isDisabled
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600 text-black"
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-black mr-2"></div>
                Memproses...
              </>
            ) : (
              <>
                <MessageCircle size={20} className="mr-2" />
                Pesan via WhatsApp
              </>
            )}
          </button>

          {!tokoWA && (
            <p className="text-red-400 text-sm text-center mt-2">
              Tidak dapat menghubungi toko. Nomor WhatsApp tidak tersedia.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
