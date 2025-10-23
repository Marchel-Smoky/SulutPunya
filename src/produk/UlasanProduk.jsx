import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "../supabase";

export default function UlasanProduk({ produkId }) {
  const [ulasan, setUlasan] = useState([]);
  const [nama, setNama] = useState("");
  const [rating, setRating] = useState(0);
  const [komentar, setKomentar] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchUlasan() {
      const { data, error } = await supabase
        .from("ulasan")
        .select("*")
        .eq("produk_id", produkId)
        .order("created_at", { ascending: false })
        .limit(5);
      if (!error) setUlasan(data);
    }

    fetchUlasan();

    // Realtime listener
    const channel = supabase
      .channel("ulasan-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "ulasan",
          filter: `produk_id=eq.${produkId}`,
        },
        (payload) => {
          setUlasan((prev) => {
            const newList = [payload.new, ...prev];
            return newList.slice(0, 5);
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [produkId]);

  const renderStars = (ratingValue, interactive = false) =>
    Array(5)
      .fill(0)
      .map((_, i) => (
        <span
          key={i}
          onClick={() => interactive && setRating(i + 1)}
          className={`cursor-${interactive ? "pointer" : "default"} text-2xl ${
            i < ratingValue ? "text-yellow-400" : "text-gray-600"
          }`}
        >
          ★
        </span>
      ));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nama || !rating || !komentar) {
      alert("Mohon lengkapi semua data ulasan 🙏");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("ulasan").insert([
      {
        produk_id: produkId,
        nama_pembeli: nama,
        rating,
        komentar,
      },
    ]);

    setLoading(false);

    if (error) {
      alert("Gagal menyimpan ulasan 😢");
    } else {
      setNama("");
      setRating(0);
      setKomentar("");
      alert("Terima kasih atas ulasan Anda! 🎉");
    }
  };

  return (
    <section className="bg-gray-900 py-16 px-6 rounded-2xl mt-10 shadow-lg">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-8"
      >
        Apa Kata Mereka? 💬
      </motion.h2>

      {/* Daftar ulasan */}
      {ulasan.length === 0 ? (
        <p className="text-gray-400 text-center">
          Belum ada ulasan untuk produk ini.  
          <br />Jadilah yang pertama memberi ulasan! 🚀
        </p>
      ) : (
        <div className="space-y-6 max-w-3xl mx-auto mb-10">
          {ulasan.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-lg transition"
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-white">{item.nama_pembeli}</h3>
                <div className="flex">{renderStars(item.rating)}</div>
              </div>
              <p className="text-gray-300">{item.komentar}</p>
              <p className="text-xs text-gray-500 mt-3">
                {new Date(item.created_at).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Form tambah ulasan */}
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl mx-auto bg-gray-800 p-6 rounded-xl shadow-md"
      >
        <h3 className="text-xl font-semibold text-white mb-4">
          Tinggalkan Ulasan Anda ✨
        </h3>

        <input
          type="text"
          placeholder="Nama Anda"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          className="w-full p-3 mb-4 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />

        <div className="mb-4">
          <label className="block text-gray-300 mb-2">Rating:</label>
          <div className="flex">{renderStars(rating, true)}</div>
        </div>

        <textarea
          placeholder="Tulis komentar Anda..."
          value={komentar}
          onChange={(e) => setKomentar(e.target.value)}
          className="w-full p-3 h-24 mb-4 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-yellow-500 text-black font-semibold py-3 rounded-lg hover:bg-yellow-400 transition disabled:opacity-50"
        >
          {loading ? "Mengirim..." : "Kirim Ulasan 🚀"}
        </button>
      </motion.form>
    </section>
  );
}
