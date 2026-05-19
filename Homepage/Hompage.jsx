import React from "react";
import { ShoppingBag, Truck, ShieldCheck, Star } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center py-14 sm:py-16 md:py-20 px-4 sm:px-6">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white drop-shadow-lg leading-tight">
          Selamat Datang di{" "}
          <span className="text-purple-400">Smokey Store</span>
        </h1>

        <p className="mt-4 text-sm sm:text-base md:text-lg text-gray-300 max-w-xl md:max-w-2xl leading-relaxed">
          Toko online terpercaya untuk produk unik, berkualitas, dan bergaya.
          Belanja lebih mudah, cepat, dan aman hanya di{" "}
          <span className="text-purple-300 font-semibold">Smokey</span>.
        </p>

        <button className="mt-6 px-5 sm:px-6 py-2.5 sm:py-3 bg-purple-500 hover:bg-purple-600 rounded-xl sm:rounded-2xl shadow-lg text-sm sm:text-base md:text-lg font-semibold transition-all">
          Mulai Belanja
        </button>
      </section>

      {/* Keuntungan Section */}
      <section className="py-12 sm:py-14 md:py-16 px-4 sm:px-6 md:px-8 bg-gray-950 rounded-t-3xl shadow-2xl">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10 md:mb-12">
          Kenapa Pilih <span className="text-purple-400">Smokey?</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 md:gap-10 max-w-6xl mx-auto">
          {/* Card */}
          <div className="bg-gray-800 p-5 sm:p-6 md:p-8 rounded-2xl shadow-lg hover:scale-105 transition-all">
            <ShoppingBag className="w-10 h-10 sm:w-12 sm:h-12 text-purple-400 mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold mb-2">
              Produk Berkualitas
            </h3>
            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
              Semua produk terjamin kualitasnya, dengan pilihan terbaik hanya
              untuk Anda.
            </p>
          </div>

          <div className="bg-gray-800 p-5 sm:p-6 md:p-8 rounded-2xl shadow-lg hover:scale-105 transition-all">
            <Truck className="w-10 h-10 sm:w-12 sm:h-12 text-purple-400 mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold mb-2">
              Pengiriman Cepat
            </h3>
            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
              Nikmati pengiriman cepat & aman ke seluruh Indonesia dengan
              layanan terpercaya.
            </p>
          </div>

          <div className="bg-gray-800 p-5 sm:p-6 md:p-8 rounded-2xl shadow-lg hover:scale-105 transition-all">
            <ShieldCheck className="w-10 h-10 sm:w-12 sm:h-12 text-purple-400 mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold mb-2">
              Belanja Aman
            </h3>
            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
              Transaksi dilindungi dengan sistem keamanan terbaik untuk
              kenyamanan Anda.
            </p>
          </div>
        </div>

        {/* Bonus */}
        <div className="mt-14 sm:mt-16 flex flex-col items-center text-center px-2">
          <Star className="w-12 h-12 sm:w-14 sm:h-14 text-yellow-400 mb-4" />

          <p className="text-sm sm:text-base md:text-lg text-gray-300 max-w-lg md:max-w-xl leading-relaxed">
            Dapatkan penawaran spesial dan diskon eksklusif setiap minggunya
            hanya di{" "}
            <span className="text-purple-300 font-semibold">
              Smokey Store
            </span>.
          </p>

          <button className="mt-6 px-5 sm:px-6 py-2.5 sm:py-3 bg-yellow-500 hover:bg-yellow-600 rounded-xl sm:rounded-2xl shadow-lg text-sm sm:text-base md:text-lg font-semibold transition-all">
            Lihat Promo
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-5 sm:py-6 text-center text-gray-400 text-xs sm:text-sm">
        © 2025 Smokey Store. Semua Hak Dilindungi.
      </footer>
    </div>
  );
}