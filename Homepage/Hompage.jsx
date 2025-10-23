import React from "react";
import { ShoppingBag, Truck, ShieldCheck, Star } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center py-20 px-6">
        <h1 className="text-5xl font-extrabold tracking-tight text-white drop-shadow-lg">
          Selamat Datang di <span className="text-purple-400">Smoky Store</span>
        </h1>
        <p className="mt-4 text-lg text-gray-300 max-w-2xl">
          Toko online terpercaya untuk produk unik, berkualitas, dan bergaya.
          Belanja lebih mudah, cepat, dan aman hanya di <span className="text-purple-300 font-semibold">Smoky</span>.
        </p>
        <button className="mt-6 px-6 py-3 bg-purple-500 hover:bg-purple-600 rounded-2xl shadow-lg text-lg font-semibold transition-all">
          Mulai Belanja
        </button>
      </section>

      {/* Keuntungan Section */}
      <section className="py-16 px-8 bg-gray-950 rounded-t-3xl shadow-2xl">
        <h2 className="text-3xl font-bold text-center mb-12">
          Kenapa Pilih <span className="text-purple-400">Smoky?</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {/* Card */}
          <div className="bg-gray-800 p-8 rounded-2xl shadow-lg hover:scale-105 transition-all">
            <ShoppingBag className="w-12 h-12 text-purple-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Produk Berkualitas</h3>
            <p className="text-gray-400 text-sm">
              Semua produk terjamin kualitasnya, dengan pilihan terbaik hanya untuk Anda.
            </p>
          </div>

          <div className="bg-gray-800 p-8 rounded-2xl shadow-lg hover:scale-105 transition-all">
            <Truck className="w-12 h-12 text-purple-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Pengiriman Cepat</h3>
            <p className="text-gray-400 text-sm">
              Nikmati pengiriman cepat & aman ke seluruh Indonesia dengan layanan terpercaya.
            </p>
          </div>

          <div className="bg-gray-800 p-8 rounded-2xl shadow-lg hover:scale-105 transition-all">
            <ShieldCheck className="w-12 h-12 text-purple-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Belanja Aman</h3>
            <p className="text-gray-400 text-sm">
              Transaksi dilindungi dengan sistem keamanan terbaik untuk kenyamanan Anda.
            </p>
          </div>
        </div>

        {/* Bonus */}
        <div className="mt-16 flex flex-col items-center">
          <Star className="w-14 h-14 text-yellow-400 mb-4" />
          <p className="text-lg text-gray-300 max-w-xl text-center">
            Dapatkan penawaran spesial dan diskon eksklusif setiap minggunya hanya di <span className="text-purple-300 font-semibold">Smoky Store</span>.
          </p>
          <button className="mt-6 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 rounded-2xl shadow-lg text-lg font-semibold transition-all">
            Lihat Promo
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center text-gray-400 text-sm">
        © 2025 Smoky Store. Semua Hak Dilindungi.
      </footer>
    </div>
  );
}
