// src/Admin/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { Button } from "../Admin/ui/button";
import { Input } from "../Admin/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../Admin/ui/card";
import { Badge } from "../Admin/ui/badge";
import { 
  X, Store, Sun, Moon, CheckCircle, XCircle, Trash2, 
  Edit, Star, MessageCircle, User 
} from "lucide-react";

const Dashboard = () => {
  const [tokoList, setTokoList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("pending");
  const [selectedToko, setSelectedToko] = useState(null);
  const [produkList, setProdukList] = useState([]);
  const [komentarList, setKomentarList] = useState([]);
  const [produkLoading, setProdukLoading] = useState(false);
  const [komentarLoading, setKomentarLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    nama: "",
    whatsapp: "",
    daerah: "",
    keterangan: ""
  });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // =======================
  // Ambil toko sesuai status
  // =======================
  const fetchToko = async (statusFilter) => {
    setLoading(true);
    try {
      const { data: tokoData, error: tokoError } = await supabase
        .from("toko")
        .select("id, nama, logo, whatsapp, daerah, status, created_at, keterangan")
        .eq("status", statusFilter)
        .order("created_at", { ascending: true });

      if (tokoError) throw tokoError;

      // hitung jumlah produk per toko
      const tokoWithProduk = await Promise.all(
        tokoData.map(async (t) => {
          const { count } = await supabase
            .from("produk")
            .select("id", { count: "exact", head: true })
            .eq("toko_id", t.id);
          return { ...t, jumlah_produk: count || 0 };
        })
      );

      setTokoList(tokoWithProduk);
    } catch (err) {
      showToast("Gagal ambil data: " + err.message, "error");
      setTokoList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchToko(filter);
  }, [filter]);

  // =======================
  // Ambil produk per toko
  // =======================
  const fetchProduk = async (tokoId) => {
    setProdukLoading(true);
    const { data, error } = await supabase
      .from("produk")
      .select("*")
      .eq("toko_id", tokoId);
    if (error) showToast("Gagal ambil produk: " + error.message, "error");
    else setProdukList(data || []);
    setProdukLoading(false);
  };

  // =======================
  // Ambil komentar per toko
  // =======================
  const fetchKomentar = async (tokoId) => {
    setKomentarLoading(true);
    const { data, error } = await supabase
      .from("komentar")
      .select(`
        *,
        user:user_id (nama)
      `)
      .eq("toko_id", tokoId)
      .order("created_at", { ascending: false });
    
    if (error) showToast("Gagal ambil komentar: " + error.message, "error");
    else setKomentarList(data || []);
    setKomentarLoading(false);
  };

  const openDetail = (toko) => {
    setSelectedToko(toko);
    fetchProduk(toko.id);
    fetchKomentar(toko.id);
    setEditForm({
      nama: toko.nama,
      whatsapp: toko.whatsapp || "",
      daerah: toko.daerah || "",
      keterangan: toko.keterangan || ""
    });
  };

  const closeDetail = () => {
    setSelectedToko(null);
    setProdukList([]);
    setKomentarList([]);
    setEditMode(false);
  };

  // =======================
  // Update status toko
  // =======================
  const updateStatus = async (id, status) => {
    setActionLoading(id + status);
    const { error } = await supabase
      .from("toko")
      .update({
        status,
        approved_at: status === "approved" ? new Date() : null,
      })
      .eq("id", id);
    setActionLoading(null);
    if (error) showToast("Gagal update status: " + error.message, "error");
    else {
      showToast(
        `Toko ${status === "approved" ? "disetujui" : "ditolak"} ✔️`,
        "success"
      );
      fetchToko(filter);
    }
  };

  // =======================
  // Hapus toko
  // =======================
  const deleteToko = async (id) => {
    if (!window.confirm("Apakah yakin ingin menghapus toko ini?")) return;
    setActionLoading("delete" + id);
    const { error } = await supabase.from("toko").delete().eq("id", id);
    setActionLoading(null);
    if (error) showToast("Gagal hapus: " + error.message, "error");
    else {
      showToast("Toko berhasil dihapus 🗑️", "success");
      fetchToko(filter);
    }
  };

  // =======================
  // Edit toko
  // =======================
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm({ ...editForm, [name]: value });
  };

  const updateToko = async (e) => {
    e.preventDefault();
    setActionLoading("edit" + selectedToko.id);
    
    const { error } = await supabase
      .from("toko")
      .update(editForm)
      .eq("id", selectedToko.id);
    
    setActionLoading(null);
    
    if (error) {
      showToast("Gagal update toko: " + error.message, "error");
    } else {
      showToast("Toko berhasil diupdate ✔️", "success");
      setEditMode(false);
      fetchToko(filter);
      // Update selected toko data
      setSelectedToko({ ...selectedToko, ...editForm });
    }
  };

  const getBadgeVariant = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500 text-black";
      case "approved":
        return "bg-green-500 text-white";
      case "rejected":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const formatRupiah = (num) =>
    num ? "Rp " + Number(num).toLocaleString("id-ID") : "-";

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          size={16}
          className={i <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
        />
      );
    }
    return stars;
  };

  const filteredToko = tokoList.filter((t) =>
    t.nama.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`${darkMode ? "dark" : ""}`}>
      <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-white dark:from-gray-900 dark:via-gray-800 dark:to-black p-6 transition-colors">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
              <Store /> Admin Dashboard
            </h1>
            <div className="flex items-center gap-3">
              <Input
                placeholder="Cari toko..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-60"
              />
              <Button
                variant="outline"
                onClick={() => setDarkMode(!darkMode)}
                className="flex items-center gap-2"
              >
                {darkMode ? <Sun size={16} /> : <Moon size={16} />}
                {darkMode ? "Light" : "Dark"}
              </Button>
            </div>
          </div>

          {/* Filter */}
          <div className="flex gap-3 flex-wrap">
            {["pending", "approved", "rejected"].map((status) => (
              <Button
                key={status}
                onClick={() => setFilter(status)}
                variant={filter === status ? "default" : "outline"}
                className={`capitalize ${
                  filter === status
                    ? status === "pending"
                      ? "bg-yellow-500 text-black"
                      : status === "approved"
                      ? "bg-green-500 text-white"
                      : "bg-red-500 text-white"
                    : ""
                }`}
              >
                {status}
              </Button>
            ))}
          </div>

          {/* Toko List */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredToko.length === 0 ? (
            <p className="text-center text-gray-600 dark:text-gray-400 py-8">
              Tidak ada toko dengan status {filter}.
            </p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredToko.map((toko) => (
                <Card
                  key={toko.id}
                  className="bg-white dark:bg-gray-800/80 border-gray-300 dark:border-gray-700 hover:shadow-lg transition cursor-pointer"
                >
                  <CardHeader onClick={() => openDetail(toko)}>
                    <div className="flex items-center gap-3">
                      {toko.logo ? (
                        <img
                          src={toko.logo}
                          alt={toko.nama}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-400 dark:bg-gray-600 flex items-center justify-center text-white">
                          <Store size={20} />
                        </div>
                      )}
                      <CardTitle className="text-gray-900 dark:text-white">
                        {toko.nama}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="text-gray-700 dark:text-gray-300 space-y-2">
                    <p>📞 {toko.whatsapp || "-"}</p>
                    <p>📍 {toko.daerah || "-"}</p>
                    <p>📦 {toko.jumlah_produk} produk</p>
                    <Badge className={getBadgeVariant(toko.status)}>
                      {toko.status}
                    </Badge>

                    <div className="flex gap-2 pt-2 flex-wrap">
                      {filter === "pending" && (
                        <>
                          <Button
                            size="sm"
                            disabled={actionLoading === toko.id + "approved"}
                            className="bg-green-600 hover:bg-green-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateStatus(toko.id, "approved");
                            }}
                          >
                            <CheckCircle size={16} /> Setujui
                          </Button>
                          <Button
                            size="sm"
                            disabled={actionLoading === toko.id + "rejected"}
                            className="bg-red-600 hover:bg-red-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateStatus(toko.id, "rejected");
                            }}
                          >
                            <XCircle size={16} /> Tolak
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        disabled={actionLoading === "delete" + toko.id}
                        className="bg-gray-600 hover:bg-gray-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteToko(toko.id);
                        }}
                      >
                        <Trash2 size={16} /> Hapus
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Modal Detail Toko */}
        {selectedToko && (
          <div className="fixed inset-0 bg-black/70 flex justify-center items-start pt-10 pb-10 z-50 overflow-auto">
            <div className="bg-white dark:bg-gray-800/90 backdrop-blur-lg rounded-xl shadow-2xl w-full max-w-4xl p-6 relative">
              <button
                onClick={closeDetail}
                className="absolute top-4 right-4 text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 p-1 rounded-full"
              >
                <X size={24} />
              </button>
              
              <div className="flex items-center gap-4 mb-6">
                {selectedToko.logo ? (
                  <img
                    src={selectedToko.logo}
                    alt={selectedToko.nama}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-400 dark:bg-gray-600 flex items-center justify-center text-white">
                    <Store size={24} />
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedToko.nama}
                  </h2>
                  <Badge className={getBadgeVariant(selectedToko.status)}>
                    {selectedToko.status}
                  </Badge>
                </div>
                
                {selectedToko.status === "approved" && (
                  <Button
                    onClick={() => setEditMode(!editMode)}
                    className="ml-auto flex items-center gap-2"
                  >
                    <Edit size={16} /> {editMode ? "Batal Edit" : "Edit Toko"}
                  </Button>
                )}
              </div>

              {/* Form Edit Toko */}
              {editMode && (
                <form onSubmit={updateToko} className="mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Edit Toko</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Nama Toko
                      </label>
                      <Input
                        name="nama"
                        value={editForm.nama}
                        onChange={handleEditChange}
                        className="w-full"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        WhatsApp
                      </label>
                      <Input
                        name="whatsapp"
                        value={editForm.whatsapp}
                        onChange={handleEditChange}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Daerah
                      </label>
                      <Input
                        name="daerah"
                        value={editForm.daerah}
                        onChange={handleEditChange}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Keterangan
                      </label>
                      <textarea
                        name="keterangan"
                        value={editForm.keterangan}
                        onChange={handleEditChange}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        rows={3}
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    disabled={actionLoading === "edit" + selectedToko.id}
                    className="mt-4 flex items-center gap-2"
                  >
                    {actionLoading === "edit" + selectedToko.id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Menyimpan...
                      </>
                    ) : (
                      "Simpan Perubahan"
                    )}
                  </Button>
                </form>
              )}

              {/* Tabs untuk Produk dan Komentar */}
              <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
                <div className="flex space-x-4">
                  <button
                    onClick={() => {
                      setProdukList([]);
                      fetchProduk(selectedToko.id);
                    }}
                    className="py-2 px-4 font-medium text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                  >
                    Produk ({produkList.length})
                  </button>
                  <button
                    onClick={() => {
                      setKomentarList([]);
                      fetchKomentar(selectedToko.id);
                    }}
                    className="py-2 px-4 font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    Komentar ({komentarList.length})
                  </button>
                </div>
              </div>

              {/* Daftar Produk */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Produk</h3>
                {produkLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : produkList.length === 0 ? (
                  <p className="text-gray-600 dark:text-gray-300 py-4 text-center">
                    Belum ada produk.
                  </p>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {produkList.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-start gap-4 bg-gray-100 dark:bg-gray-700/50 p-4 rounded-lg"
                      >
                        {p.foto_url?.[0] ? (
                          <img
                            src={p.foto_url[0]}
                            alt={p.nama}
                            className="w-20 h-20 object-cover rounded"
                          />
                        ) : (
                          <div className="w-20 h-20 bg-gray-400 dark:bg-gray-600 flex items-center justify-center text-white rounded">
                            ?
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="text-gray-900 dark:text-white font-medium">
                            {p.nama}
                          </p>
                          <p className="text-gray-700 dark:text-gray-300 text-sm mt-1">
                            {p.deskripsi || "-"}
                          </p>
                          <p className="text-gray-900 dark:text-white font-semibold mt-2">
                            {formatRupiah(p.harga)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Daftar Komentar */}
              <div className="mt-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Komentar</h3>
                {komentarLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : komentarList.length === 0 ? (
                  <p className="text-gray-600 dark:text-gray-300 py-4 text-center">
                    Belum ada komentar.
                  </p>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {komentarList.map((k) => (
                      <div
                        key={k.id}
                        className="bg-gray-100 dark:bg-gray-700/50 p-4 rounded-lg"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
                            <User size={16} />
                          </div>
                          <div>
                            <p className="text-gray-900 dark:text-white font-medium">
                              {k.user?.nama || "Pengguna"}
                            </p>
                            <div className="flex items-center gap-1">
                              {renderStars(k.rating)}
                            </div>
                          </div>
                          <span className="text-xs text-gray-500 ml-auto">
                            {new Date(k.created_at).toLocaleDateString('id-ID')}
                          </span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300">
                          {k.komentar}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div
            className={`fixed bottom-5 right-5 px-4 py-3 rounded-lg shadow-lg text-white flex items-center gap-2 ${
              toast.type === "error" ? "bg-red-600" : "bg-green-600"
            } transition-transform duration-300 transform ${toast ? 'translate-y-0' : 'translate-y-20'}`}
          >
            {toast.type === "success" ? (
              <CheckCircle size={20} />
            ) : (
              <XCircle size={20} />
            )}
            {toast.msg}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;