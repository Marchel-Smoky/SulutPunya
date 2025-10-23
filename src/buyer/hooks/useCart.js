// src/buyer/hooks/useCart.js
import { useState, useEffect } from "react";
import { supabase } from "../../supabase";

export function useCart() {
  const [cart, setCart] = useState([]);
  const [guestId, setGuestId] = useState(null);

  // Generate guest_id untuk user anonim
  useEffect(() => {
    let storedGuestId = localStorage.getItem("guest_id");
    if (!storedGuestId) {
      storedGuestId = crypto.randomUUID();
      localStorage.setItem("guest_id", storedGuestId);
    }
    setGuestId(storedGuestId);
  }, []);

  // Load keranjang dari Supabase saat guestId sudah tersedia
  useEffect(() => {
    if (!guestId) return;

      const fetchCart = async () => {
        if (!guestId) return;
        try {
          const { data, error } = await supabase
            .from("keranjang")
            .select("*")
            .eq("guest_id", guestId); // pastikan guestId valid & tidak null

          if (error) throw error;
          setCart(data || []);
        } catch (err) {
          console.error("Gagal fetch keranjang:", err.message);
        }
      };
      ;
    fetchCart();
  }, [guestId]);

  // Tambah item ke keranjang
  const addToCart = async (item) => {
    if (!guestId) return;

    // Cek apakah item sudah ada di cart
    const exists = cart.find((c) => c.id === item.id);
    if (exists) {
      // Tambah jumlah
      const newCart = cart.map((c) =>
        c.id === item.id ? { ...c, jumlah: (c.jumlah || 1) + 1 } : c
      );
      setCart(newCart);

      await supabase
        .from("keranjang")
        .update({ jumlah: exists.jumlah + 1 })
        .eq("guest_id", guestId)
        .eq("produk_id", item.id);
    } else {
      // Tambah item baru
      const newItem = { ...item, jumlah: 1 };
      setCart((prev) => [...prev, newItem]);

      await supabase
        .from("keranjang")
        .insert({
          guest_id: guestId,
          produk_id: item.id,
          nama: item.nama,
          harga: item.harga,
          foto_url: item.foto_url?.[0] || null,
          jumlah: 1,
        });
    }
  };

  // Hapus item dari keranjang
  const removeFromCart = async (itemId) => {
    setCart((prev) => prev.filter((c) => c.id !== itemId));
    await supabase
      .from("keranjang")
      .delete()
      .eq("guest_id", guestId)
      .eq("produk_id", itemId);
  };

  // Kosongkan keranjang
  const clearCart = async () => {
    setCart([]);
    await supabase
      .from("keranjang")
      .delete()
      .eq("guest_id", guestId);
  };

  const cartCount = cart.reduce((sum, item) => sum + (item.jumlah || 1), 0);

  return { cart, cartCount, addToCart, removeFromCart, clearCart };
}
