import React, { useEffect, useState } from "react";
import { supabase } from "../../supabase";
import { useNavigate } from "react-router-dom";
import logoDark from '../../image/Logo/logo_bg_white.png';
import logoLight from '../../image/Logo/logo.png';

export default function Dashboard() {
  const [tokoList, setTokoList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("nama");
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem("darkMode");
    return savedMode ? JSON.parse(savedMode) : window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  const navigate = useNavigate();

  // Efek untuk mode gelap/terang
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

  const fetchToko = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("toko")
        .select("id, nama, keterangan, logo, status, created_at")
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTokoList(data || []);
    } catch (err) {
      console.error("Fetch toko error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchToko();
  }, []);

  const filteredToko = tokoList
    .filter((toko) => toko.nama.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "nama") return a.nama.localeCompare(b.nama);
      if (sortBy === "terbaru") return new Date(b.created_at) - new Date(a.created_at);
      return 0;
    });

  const SkeletonCard = () => (
    <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-5 flex flex-col items-center shadow-md animate-pulse border border-gray-200 dark:border-gray-700">
      <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-gray-300 dark:bg-gray-700 mb-4"></div>
      <div className="h-5 w-3/4 bg-gray-300 dark:bg-gray-700 rounded mb-3"></div>
      <div className="h-4 w-full bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
      <div className="h-4 w-5/6 bg-gray-300 dark:bg-gray-700 rounded"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 text-gray-800 dark:text-white transition-colors duration-300 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex flex-col items-center py-4">
            <div className="flex items-center gap-3 mb-2">
              <img
                src={darkMode ? logoDark : logoLight}
                alt="Smokey Logo"
                className="w-16 h-16 md:w-20 md:h-20 object-contain"
              />
              <button
                onClick={toggleDarkMode}
                className="p-2 bg-blue-100 dark:bg-gray-700 rounded-lg hover:bg-blue-200 dark:hover:bg-gray-600 transition-all duration-200 shadow-sm"
                title={darkMode ? "Mode Terang" : "Mode Gelap"}
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 01-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>
            </div>
            
            <h1 className="text-2xl md:text-3xl font-bold text-center">
              <span className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-400 dark:to-blue-500 bg-clip-text text-transparent">
                SMOKEY
              </span>{" "}
              <span className="text-gray-700 dark:text-gray-300">Dashboard</span>
            </h1>
            
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 text-center max-w-md">
              ✨ Temukan toko terbaik dan produk favoritmu
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* Search and Filter Section */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-semibold text-gray-800 dark:text-gray-200">
              Daftar Toko
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              {filteredToko.length} toko tersedia
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Cari toko..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition shadow-sm"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition shadow-sm"
            >
              <option value="nama">Urutkan A-Z</option>
              <option value="terbaru">Terbaru</option>
            </select>
          </div>
        </div>

        {/* Toko List */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filteredToko.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-5xl mb-4">🏪</div>
            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
              {search ? "Toko tidak ditemukan" : "Belum ada toko"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              {search ? `Tidak ada toko yang cocok dengan "${search}"` : "Belum ada toko yang terdaftar di sistem"}
            </p>
            {search && (
              <button 
                onClick={() => setSearch("")}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition shadow-sm"
              >
                Reset Pencarian
              </button>
            )}
          </div>
        ) : (
          <div className="w-full">
            {/* Container untuk horizontal scroll di mobile */}
            <div className="md:hidden pb-4 -mx-4 px-4 overflow-x-auto">
              <div className="flex space-x-4 w-max min-w-full">
                {filteredToko.map((toko) => (
                  <div
                    key={toko.id}
                    onClick={() => navigate(`/buyer/toko/${toko.id}`)}
                    className="group bg-white dark:bg-gray-800 rounded-2xl p-5 flex flex-col items-center shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-300 cursor-pointer w-64 flex-shrink-0"
                  >
                    {/* Logo atau Inisial */}
                    <div className="relative mb-4">
                      {toko.logo ? (
                        <img
                          src={toko.logo}
                          alt={`Logo ${toko.nama}`}
                          className="w-20 h-20 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-md group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center border-4 border-white dark:border-gray-800 shadow-md text-xl font-bold text-white">
                          {toko.nama.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                    </div>

                    {/* Nama Toko */}
                    <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 text-center mb-2 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {toko.nama}
                    </h3>

                    {/* Deskripsi */}
                    <p className="text-gray-600 dark:text-gray-400 text-xs text-center mb-4 line-clamp-2 flex-1">
                      {toko.keterangan || "Tidak ada deskripsi"}
                    </p>

                    {/* Tombol Aksi */}
                    <div className="w-full mt-auto">
                      <div className="text-xs text-blue-600 dark:text-blue-400 font-medium text-center group-hover:underline">
                        Lihat detail toko →
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Grid untuk tablet dan desktop */}
            <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredToko.map((toko) => (
                <div
                  key={toko.id}
                  onClick={() => navigate(`/buyer/toko/${toko.id}`)}
                  className="group bg-white dark:bg-gray-800 rounded-2xl p-5 flex flex-col items-center shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-300 cursor-pointer"
                >
                  {/* Logo atau Inisial */}
                  <div className="relative mb-4">
                    {toko.logo ? (
                      <img
                        src={toko.logo}
                        alt={`Logo ${toko.nama}`}
                        className="w-24 h-24 md:w-28 md:h-28 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-md group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center border-4 border-white dark:border-gray-800 shadow-md text-3xl font-bold text-white">
                        {toko.nama.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                  </div>

                  {/* Nama Toko */}
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 text-center mb-2 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {toko.nama}
                  </h3>

                  {/* Deskripsi */}
                  <p className="text-gray-600 dark:text-gray-400 text-sm text-center mb-4 line-clamp-2 flex-1">
                    {toko.keterangan || "Tidak ada deskripsi"}
                  </p>

                  {/* Tombol Aksi */}
                  <div className="w-full mt-auto">
                    <div className="text-xs text-blue-600 dark:text-blue-400 font-medium text-center group-hover:underline">
                      Lihat detail toko →
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer - tetap di bawah */}
      <footer className="py-6 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 transition-colors duration-300 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()} SMOKEY Dashboard • Made with ❤️ for better shopping experience
          </p>
        </div>
      </footer>
    </div>
  );
}