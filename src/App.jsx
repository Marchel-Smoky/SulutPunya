import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Helmet, HelmetProvider } from "react-helmet-async";

// Import logo (asumsikan kita memiliki versi terang dan gelap)
import logoDark from "./image/Logo/logo_bg_white.png";
import logoLight from "./image/Logo/logo.png";

export default function App() {
  const mainRef = useRef(null);
  const [showMain, setShowMain] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    // Cek preferensi pengguna dari localStorage atau sistem
    const savedMode = localStorage.getItem("darkMode");
    return savedMode ? JSON.parse(savedMode) : window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowMain(true);
      mainRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // Efek untuk menyimpan preferensi mode gelap
  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <HelmetProvider>
      <Helmet>
        <title>Smokey - Belanja & Jual Online</title>
      </Helmet>

      {/* Header */}
      <header className="w-full fixed top-0 left-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-lg px-6 md:px-12 py-4 flex justify-between items-center transition-all duration-500 border-b border-blue-400 dark:border-blue-700">
        
        {/* Logo dengan Tulisan Smokey */}
        <Link to="/" className="flex items-center gap-3">
          <motion.img
            src={darkMode ? logoDark : logoLight}
            alt="Logo Smokey"
            whileHover={{ rotate: 5, scale: 1.1 }}
            className="w-16 md:w-20 object-contain transition-transform duration-300"
          />
          <motion.span 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-5xl md:text-6xl font-bold text-gray-800 dark:text-white drop-shadow-lg"
          >
            Smo
            <span className="bg-gradient-to-r from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-600 bg-clip-text text-transparent">
              Key.
            </span>
          </motion.span>
        </Link>
        
        {/* Navigasi dengan Ikon Saja */}
        <nav className="flex gap-4 md:gap-6 items-center">
          {/* Toggle Dark/Light Mode */}
          <button
            onClick={toggleDarkMode}
            className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-xl hover:bg-blue-200 dark:hover:bg-blue-800/60 transition-all group relative"
            title={darkMode ? "Mode Terang" : "Mode Gelap"}
          >
            {darkMode ? (
              <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 01-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
            <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-blue-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {darkMode ? "Mode Terang" : "Mode Gelap"}
            </span>
          </button>

          {/* Belanja */}
          <Link
            to="/buyer"
            className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-xl hover:bg-blue-200 dark:hover:bg-blue-800/60 transition-all group relative"
            title="Belanja"
          >
            <svg className="w-6 h-6 text-blue-700 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6h9M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6" />
            </svg>
            <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-blue-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Belanja
            </span>
          </Link>

          {/* Jualan */}
          <Link
            to="/Login-Seler"
            className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-xl hover:bg-blue-200 dark:hover:bg-blue-800/60 transition-all group relative"
            title="Jualan"
          >
            <svg className="w-6 h-6 text-blue-700 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-blue-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Jualan
            </span>
          </Link>

          {/* Login */}
          <Link
            to="/Login-Seler"
            className="p-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all group relative shadow-md"
            title="Login"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 01-3-3h7a3 3 0 013 3v1" />
            </svg>
            <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-blue-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Login
            </span>
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <main
        ref={mainRef}
        className="min-h-screen pt-24 md:pt-28 relative bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-6 md:px-12 py-12 transition-colors duration-500"
      >
        {/* Hero Section */}
        <section className="flex flex-col md:flex-row items-center justify-between gap-12 mb-20">
          <div className="w-full md:w-1/2">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600 mb-6"
            >
              Welcome to Smokey
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-lg md:text-xl text-gray-800 dark:text-gray-200 mb-8 leading-relaxed"
            >
              Belanja dan jual barang dengan tampilan modern, cepat, dan aman.{" "}
              <span className="font-semibold text-blue-700 dark:text-blue-300">
                Tanpa login untuk belanja
              </span>
              , login hanya untuk menjual.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-6"
            >
              <Link to="/buyer">
                <motion.button
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0px 0px 25px rgba(59, 130, 246, 0.4)",
                  }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-2xl shadow-xl transition-all duration-300 flex items-center gap-2"
                >
                  <span>Belanja Sekarang</span>
                  <span>🛒</span>
                </motion.button>
              </Link>
              <Link to="/Login-Seler">
                <motion.button
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0px 0px 25px rgba(147, 197, 253, 0.4)",
                  }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-4 bg-gradient-to-r from-white to-blue-100 text-blue-800 dark:from-gray-800 dark:to-blue-900 dark:text-white font-bold rounded-2xl shadow-xl transition-all duration-300 flex items-center gap-2 border border-blue-200 dark:border-blue-700"
                >
                  <span>Mulai Jualan</span>
                  <span>🚀</span>
                </motion.button>
              </Link>
            </motion.div>
          </div>
          
          <div className="w-full md:w-1/2">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="bg-gradient-to-br from-blue-200/70 to-blue-300/70 dark:from-blue-500/20 dark:to-blue-600/20 rounded-3xl p-8 h-80 md:h-96 flex items-center justify-center backdrop-blur-md border-2 border-blue-300/60 dark:border-blue-700/50 shadow-xl"
            >
              <div className="text-center">
                <div className="text-6xl md:text-8xl mb-4">🛍️</div>
                <p className="text-xl text-blue-800 dark:text-blue-200 font-semibold">Toko Online Modern</p>
                <p className="text-blue-700 dark:text-blue-300 mt-2">Belanja dan jual dengan mudah</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="my-20">
          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600 mb-16 text-center"
          >
            Mengapa Memilih Smokey? 🚀
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: "🛒", title: "Belanja Tanpa Login", desc: "Nikmati pengalaman belanja tanpa perlu membuat akun terlebih dahulu." },
              { icon: "🚀", title: "Jualan Mudah", desc: "Mulai jualan produk Anda dengan proses yang cepat dan sederhana." },
              { icon: "🔒", title: "Aman dan Terpercaya", desc: "Transaksi aman dengan sistem yang melindungi pembeli dan penjual." },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl p-8 text-center border-2 border-blue-200/50 dark:border-blue-700/30 hover:border-blue-300/70 dark:hover:border-blue-500/50 transition-all shadow-lg"
              >
                <div className="text-5xl mb-6">{feature.icon}</div>
                <h3 className="text-2xl font-bold text-blue-800 dark:text-blue-200 mb-4">{feature.title}</h3>
                <p className="text-blue-700 dark:text-blue-300">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="my-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-blue-200/70 to-blue-300/70 dark:from-blue-600/20 dark:to-blue-700/20 rounded-3xl p-12 border-2 border-blue-300/50 dark:border-blue-700/50 shadow-xl"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-6">
              Siap Bergabung dengan Smokey?
            </h2>
            <p className="text-blue-700 dark:text-blue-200 mb-8 max-w-2xl mx-auto">
              Mulai belanja atau jual produk Anda sekarang juga. Nikmati pengalaman berbelanja dan berjualan yang modern dan menyenangkan.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link to="/buyer">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-2xl shadow-xl transition-all duration-300"
                >
                  Mulai Belanja
                </motion.button>
              </Link>
              <Link to="/Login-Seler">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-4 bg-gradient-to-r from-white to-blue-100 text-blue-800 dark:from-gray-800 dark:to-blue-900 dark:text-white font-bold rounded-2xl shadow-xl transition-all duration-300 border border-blue-200 dark:border-blue-700"
                >
                  Login untuk Jualan
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg text-blue-700 dark:text-blue-200 text-center py-8 border-t border-blue-300 dark:border-blue-700 px-6 transition-colors duration-500 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <img src={darkMode ? logoDark : logoLight} alt="Logo Smokey" className="w-10 h-10 object-contain" />
              <span className="text-2xl font-bold text-gray-800 dark:text-white">
                Smo<span className="text-blue-600 dark:text-blue-400">Key</span>
              </span>
            </div>
            <div className="flex gap-6">
              {["Tentang", "Layanan", "Kebijakan Privasi", "Kontak"].map((item, idx) => (
                <a key={idx} href="#" className="text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-white transition-colors font-medium">
                  {item}
                </a>
              ))}
            </div>
          </div>
          <p className="text-sm text-blue-600 dark:text-blue-300 border-t border-blue-300 dark:border-blue-700 pt-6">
            © {new Date().getFullYear()}{" "}
            <span className="font-semibold text-blue-800 dark:text-blue-200">SmoKey</span>. Semua hak dilindungi. ✨
            Dibuat dengan ❤️ untuk belanja dan jualan lebih mudah.
          </p>
        </div>
      </footer>
    </HelmetProvider>
  );
}