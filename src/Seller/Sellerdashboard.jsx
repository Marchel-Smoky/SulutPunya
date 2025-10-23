// src/SellerDashboard.jsx
import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "../supabase";
import {
  LogOut,
  Trash2,
  Edit3,
  Upload,
  Camera,
  Star,
  User,
  X,
  Plus,
  Loader,
  Image as ImageIcon,
  DollarSign,
  Type,
  AlignLeft,
  Share2
} from "lucide-react";

// === Komponen Carousel Gambar Produk Otomatis + Manual ===
function Carousel({ images }) {
  const [index, setIndex] = React.useState(0);
  const timeoutRef = React.useRef(null);

  if (!images || images.length === 0) return null;

  const prev = () => setIndex(i => (i === 0 ? images.length - 1 : i - 1));
  const next = () => setIndex(i => (i === images.length - 1 ? 0 : i + 1));

  React.useEffect(() => {
    if (images.length <= 1) return;
    timeoutRef.current = setTimeout(() => {
      setIndex(i => (i + 1) % images.length);
    }, 3000);

    return () => clearTimeout(timeoutRef.current);
  }, [index, images.length]);

  return (
    <div className="relative mt-2 w-full h-48 rounded-lg overflow-hidden">
      <img
        src={images[index]}
        alt={`foto-${index}`}
        className="w-full h-full object-cover rounded-lg"
      />
      {images.length > 1 && (
        <>
          <button
            onClick={() => { prev(); clearTimeout(timeoutRef.current); }}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 p-1 rounded-full hover:bg-black/70 transition"
          >
            <ChevronLeft className="text-white w-5 h-5" />
          </button>

          <button
            onClick={() => { next(); clearTimeout(timeoutRef.current); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 p-1 rounded-full hover:bg-black/70 transition"
          >
            <ChevronRight className="text-white w-5 h-5" />
          </button>
        </>
      )}

      {images.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => { setIndex(i); clearTimeout(timeoutRef.current); }}
              className={`w-2 h-2 rounded-full ${i === index ? "bg-yellow-400" : "bg-gray-600"} hover:bg-yellow-300 transition`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// === Komponen Rating Bintang ===
function StarRating({ rating }) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={16}
          className={
            i < fullStars
              ? "text-yellow-400 fill-yellow-400"
              : i === fullStars && hasHalfStar
              ? "text-yellow-400 fill-yellow-400 opacity-50"
              : "text-gray-400"
          }
        />
      ))}
      <span className="ml-1 text-sm text-gray-300">({rating})</span>
    </div>
  );
}

// === Komponen Preview Gambar ===
function ImagePreview({ images, onRemove }) {
  if (!images || images.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {images.map((image, index) => (
        <div key={index} className="relative">
          <img src={typeof image === 'string' ? image : URL.createObjectURL(image)} alt={`preview-${index}`} className="w-16 h-16 object-cover rounded" />
          <button 
            type="button"
            onClick={() => onRemove(index)}
            className="absolute -top-2 -right-2 bg-red-600 rounded-full p-1"
          >
            <X size={12} />
          </button>
        </div>
      ))}
    </div>
  );
}

// Fungsi untuk generate slug yang aman
const generateSlug = (name) => {
  const baseSlug = name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '')
    .substring(0, 50); // Batasi panjang slug
  
  const randomSuffix = Math.random().toString(36).substring(2, 8); // 6 karakter acak
  return `${baseSlug}-${randomSuffix}`;
};

export default function SellerDashboard() {
  const [toko, setToko] = useState(null);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [tab, setTab] = useState("produk");
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState({ nama: "", deskripsi: "", harga: "", foto_url:[] });
  const [tokoForm, setTokoForm] = useState({ nama: "", whatsapp: "", daerah: "", keterangan: "" });
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [currentReviewPage, setCurrentReviewPage] = useState(1);
  const reviewsPerPage = 5;

  useEffect(() => {
    const fetchData = async () => {
      const email = localStorage.getItem("userEmail");
      if (!email) {
        alert("Silakan login terlebih dahulu!");
        window.location.href = "/Login-Seler";
        return;
      }

      try {
        const { data: tokoData, error: tokoError } = await supabase
          .from("toko")
          .select("*")
          .eq("email", email)
          .single();  

        if (tokoError) throw tokoError;
        setToko(tokoData);
        setTokoForm({
          nama: tokoData.nama || "",
          whatsapp: tokoData.whatsapp || "",
          daerah: tokoData.daerah || "",
          keterangan: tokoData.keterangan || "",
        });

        // Ambil produk
        const { data: produkData, error: produkError } = await supabase
          .from("produk")
          .select("*")
          .eq("toko_id", tokoData.id)
          .order("created_at", { ascending: false });
        if (!produkError) setProducts(produkData || []);

        // Ambil ulasan
        const { data: ulasanData, error: ulasanError } = await supabase
          .from("ulasan")
          .select(`
            id,
            produk_id,
            nama_pembeli,
            rating,
            komentar,
            created_at,
            produk!inner(toko_id)
          `)
          .eq("produk.toko_id", tokoData.id)
          .order("created_at", { ascending: false });
        if (!ulasanError) setReviews(ulasanData || []);
      } catch (err) {
        console.error("Error fetching toko data:", err);
        alert("Gagal memuat data toko!");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fungsi untuk membagikan produk
  const shareProduct = async (product) => {
    try {
      const productLink = `${window.location.origin}/produk/${product.slug}`;
      
      // Cek apakah Web Share API tersedia (mobile)
      if (navigator.share) {
        await navigator.share({
          title: product.nama,
          text: `Lihat produk ${product.nama} dengan harga Rp ${parseInt(product.harga).toLocaleString("id-ID")}`,
          url: productLink,
        });
      } else if (navigator.clipboard) {
        // Fallback: copy ke clipboard
        await navigator.clipboard.writeText(productLink);
        alert(`Link produk berhasil disalin:\n${productLink}`);
      } else {
        // Fallback untuk browser lama
        const textArea = document.createElement('textarea');
        textArea.value = productLink;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert(`Link produk berhasil disalin:\n${productLink}`);
      }
    } catch (err) {
      console.error('Error sharing product:', err);
      // Fallback ke copy clipboard jika share dibatalkan
      const productLink = `${window.location.origin}/produk/${product.slug}`;
      navigator.clipboard.writeText(productLink);
      alert(`Link produk disalin: ${productLink}`);
    }
  };

  // === Upload Logo Toko ===
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return alert("File harus berupa gambar");
    if (file.size > 2 * 1024 * 1024) return alert("Maksimal 2MB");

    setIsUploading(true);
    try {
      const fileName = `logo-${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from("logos").upload(fileName, file);
      if (error) throw error;

      const { data: urlData } = supabase.storage.from("logos").getPublicUrl(fileName);
      const { error: updateError } = await supabase.from("toko").update({ logo: urlData.publicUrl }).eq("id", toko.id);
      if (updateError) throw updateError;

      setToko({ ...toko, logo: urlData.publicUrl });
      alert("Logo berhasil diupload!");
    } catch (err) {
      console.error(err);
      alert("Upload logo gagal!");
    } finally {
      setIsUploading(false);
    }
  };

  // === Upload Gambar Produk ===
  const handleImageUpload = async (files) => {
    if (!toko) return alert("Toko belum terdeteksi!");
    if (!form.nama) return alert("Nama produk harus diisi sebelum upload gambar");

    setIsUploading(true);
    const uploadedUrls = [];

    try {
      for (const file of files) {
        if (!file.type.startsWith("image/")) {
          alert("Semua file harus berupa gambar");
          continue;
        }
        if (file.size > 2 * 1024 * 1024) {
          alert("Maksimal ukuran per file adalah 2MB");
          continue;
        }

        const safeProductName = form.nama.replace(/\s+/g, "_").toLowerCase();
        const filePath = `${toko.id}/${safeProductName}/${Date.now()}-${file.name}`;

        const { error } = await supabase.storage.from("produk").upload(filePath, file);
        if (error) throw error;

        const { data: urlData } = supabase.storage.from("produk").getPublicUrl(filePath);
        uploadedUrls.push(urlData.publicUrl);
      }

      setForm(prev => ({ ...prev, foto_url: [...prev.foto_url, ...uploadedUrls] }));
      setImageFiles([]);
    } catch (err) {
      console.error(err);
      alert("Upload gambar gagal!");
    } finally {
      setIsUploading(false);
    }
  };

  // === Hapus Gambar dari Preview ===
  const removeImage = (index) => {
    setForm(prev => {
      const newFotoUrl = [...prev.foto_url];
      newFotoUrl.splice(index, 1);
      return { ...prev, foto_url: newFotoUrl };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nama || !form.harga) return alert("Nama dan harga wajib diisi");
    if (form.harga <= 0) return alert("Harga harus lebih dari 0");

    setIsUploading(true);

    try {
      let uploadedUrls = [...form.foto_url];

      // Upload gambar baru jika ada
      if (imageFiles.length > 0) {
        for (const file of imageFiles) {
          if (!file.type.startsWith("image/")) {
            alert("Semua file harus berupa gambar");
            continue;
          }
          if (file.size > 2 * 1024 * 1024) {
            alert("Maksimal ukuran per file adalah 2MB");
            continue;
          }

          const safeProductName = form.nama.replace(/\s+/g, "_").toLowerCase();
          const filePath = `${toko.id}/${safeProductName}/${Date.now()}-${file.name}`;

          const { error: uploadError } = await supabase.storage.from("produk").upload(filePath, file);
          if (uploadError) throw uploadError;

          const { data: urlData } = supabase.storage.from("produk").getPublicUrl(filePath);
          uploadedUrls.push(urlData.publicUrl);
        }
      }

      if (editProduct) {
        // Update produk (pertahankan slug yang sudah ada)
        const { error } = await supabase
          .from("produk")
          .update({ 
            ...form, 
            foto_url: uploadedUrls, 
            slug: editProduct.slug // Pertahankan slug lama
          })
          .eq("id", editProduct.id);
        if (error) throw error;

        setProducts(prev => prev.map(p => p.id === editProduct.id ? { 
          ...p, 
          ...form, 
          foto_url: uploadedUrls, 
          slug: editProduct.slug 
        } : p));
        setEditProduct(null);
      } else {
        // Tambah produk baru dengan slug unik
        const slug = generateSlug(form.nama);

        const { data, error } = await supabase
          .from("produk")
          .insert([{ 
            ...form, 
            toko_id: toko.id, 
            foto_url: uploadedUrls, 
            slug 
          }])
          .select()
          .single();
        if (error) throw error;

        setProducts(prev => [data, ...prev]);
      }

      setForm({ nama: "", deskripsi: "", harga: "", foto_url: [] });
      setImageFiles([]);
      alert(editProduct ? "Produk berhasil diupdate!" : "Produk berhasil ditambahkan!");
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan produk!");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (product) => {
    if (!window.confirm("Yakin hapus produk ini? Semua gambar akan terhapus juga!")) return;

    setIsUploading(true);

    try {
      if (product.foto_url && product.foto_url.length > 0) {
        const safeProductName = product.nama.replace(/\s+/g, "_").toLowerCase();
        const folderPath = `${toko.id}/${safeProductName}`;

        const { data: listData, error: listError } = await supabase.storage
          .from("produk")
          .list(folderPath);

        if (listError) throw listError;

        if (listData && listData.length > 0) {
          const filesToDelete = listData.map(file => `${folderPath}/${file.name}`);
          const { error: deleteError } = await supabase.storage.from("produk").remove(filesToDelete);
          if (deleteError) throw deleteError;
        }
      }

      const { error } = await supabase.from("produk").delete().eq("id", product.id);
      if (error) throw error;

      setProducts(prev => prev.filter(p => p.id !== product.id));
      alert("Produk dan semua gambarnya berhasil dihapus!");
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus produk!");
    } finally {
      setIsUploading(false);
    }
  };

  // === Update Profil Toko ===
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!tokoForm.nama) return alert("Nama toko wajib diisi");
    
    try {
      const { error } = await supabase.from("toko").update(tokoForm).eq("id", toko.id);
      if (error) throw error;
      setToko({ ...toko, ...tokoForm });
      alert("Profil toko berhasil diperbarui!");
    } catch (err) {
      console.error(err);
      alert("Gagal update profil toko!");
    }
  };

  // === Pagination untuk Ulasan ===
  const indexOfLastReview = currentReviewPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview);
  const totalReviewPages = Math.ceil(reviews.length / reviewsPerPage);

  const paginate = (pageNumber) => setCurrentReviewPage(pageNumber);

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-blue-950 text-white flex items-center justify-center">
      <div className="text-center">
        <Loader className="animate-spin mx-auto mb-4" size={32} />
        <p>Memuat data toko...</p>
      </div>
    </div>
  );
  
  if (!toko) return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-blue-950 text-white flex items-center justify-center">
      <div className="text-center p-10">
        <p>Toko tidak ditemukan</p>
        <button 
          onClick={() => window.location.href = "/Login-Seler"} 
          className="mt-4 bg-blue-600 px-4 py-2 rounded"
        >
          Kembali ke Login
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-blue-950 text-white">
      {/* Header */}
      <header className="bg-gray-800/60 border-b border-gray-700 p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          {toko.logo ? (
            <img src={toko.logo} alt="Logo toko" className="w-12 h-12 rounded-full object-cover" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center">
              <Camera size={20} />
            </div>
          )}
          <div>
            <h1 className="font-bold">{toko.nama}</h1>
            <p className="text-gray-400 text-sm">{toko.daerah || "Lokasi belum diatur"}</p>
            <p className="text-xs text-yellow-400">Status: {toko.status}</p>
          </div>
          <label className="ml-3 cursor-pointer">
            {isUploading ? <Loader className="animate-spin" size={16} /> : <Upload size={16} />}
            <input type="file" className="hidden" onChange={handleLogoUpload} disabled={isUploading} />
          </label>
        </div>
        <button
          onClick={() => { localStorage.removeItem("userEmail"); window.location.href = "/Login-Seler"; }}
          className="bg-red-600 px-3 py-2 rounded-lg flex items-center gap-1 hover:bg-red-700 transition"
          disabled={isUploading}
        >
          <LogOut size={16} /> Logout
        </button>
      </header>

      {/* Tabs */}
      <nav className="flex justify-center gap-6 bg-gray-800/40 border-b border-gray-700 py-3">
        <button 
          onClick={() => setTab("produk")} 
          className={`px-4 py-2 rounded-lg transition ${tab === "produk" ? "bg-yellow-500 text-black font-bold" : "hover:bg-gray-700"}`}
        >
          Produk
        </button>
        <button 
          onClick={() => setTab("profil")} 
          className={`px-4 py-2 rounded-lg transition ${tab === "profil" ? "bg-yellow-500 text-black font-bold" : "hover:bg-gray-700"}`}
        >
          Profil
        </button>
        <button 
          onClick={() => setTab("ulasan")} 
          className={`px-4 py-2 rounded-lg transition ${tab === "ulasan" ? "bg-yellow-500 text-black font-bold" : "hover:bg-gray-700"}`}
        >
          Ulasan ({reviews.length})
        </button>
      </nav>

      <main className="p-4 md:p-6">
        {tab === "produk" && (
          <>
            <div className="flex flex-col md:flex-row gap-6">
              {/* Form Tambah/Edit Produk */}
              <div className="bg-gray-800 p-6 rounded-lg md:w-1/2">
                <h2 className="text-xl font-bold mb-6 pb-2 border-b border-gray-700 flex items-center gap-2">
                  {editProduct ? (
                    <>
                      <Edit3 size={20} /> Edit Produk
                    </>
                  ) : (
                    <>
                      <Plus size={20} /> Tambah Produk Baru
                    </>
                  )}
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                      <Type size={16} /> Nama Produk <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      placeholder="Contoh: Kemeja Flanel Pria" 
                      value={form.nama} 
                      onChange={e => setForm({ ...form, nama: e.target.value })} 
                      className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-yellow-500 focus:outline-none transition"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                      <AlignLeft size={16} /> Deskripsi Produk
                    </label>
                    <textarea 
                      placeholder="Deskripsikan produk Anda secara detail..." 
                      value={form.deskripsi} 
                      onChange={e => setForm({ ...form, deskripsi: e.target.value })} 
                      className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-yellow-500 focus:outline-none transition"
                      rows="4"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                      <DollarSign size={16} /> Harga <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-400">Rp</span>
                      <input 
                        type="number" 
                        placeholder="0" 
                        value={form.harga} 
                        onChange={e => setForm({ ...form, harga: e.target.value })} 
                        className="w-full pl-10 p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-yellow-500 focus:outline-none transition"
                        min="1"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                      <ImageIcon size={16} /> Gambar Produk (Maksimal 5)
                    </label>
                    
                    <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 transition hover:border-yellow-500">
                      <div className="flex flex-col items-center justify-center gap-2 text-center">
                        <Upload size={24} className="text-gray-400" />
                        <p className="text-sm text-gray-400">Seret & letakkan gambar di sini atau klik untuk memilih</p>
                        <label className="flex items-center gap-1 bg-blue-600 px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-700 transition mt-2">
                          <Plus size={16} /> Pilih Gambar
                          <input 
                            type="file" 
                            multiple 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => {
                              const files = Array.from(e.target.files);
                              if (form.foto_url.length + files.length > 5) {
                                alert("Maksimal 5 gambar per produk");
                                return;
                              }
                              setImageFiles(files);
                            }}
                            disabled={isUploading || form.foto_url.length >= 5}
                          />
                        </label>
                        <p className="text-xs text-gray-500 mt-1">Format: JPG, PNG. Maksimal 2MB per gambar</p>
                      </div>
                      
                      {(form.foto_url.length > 0 || imageFiles.length > 0) && (
                        <div className="mt-4">
                          <p className="text-sm font-medium text-gray-300 mb-2">Gambar yang akan diupload:</p>
                          
                          <ImagePreview images={form.foto_url} onRemove={removeImage} />
                          
                          {imageFiles.length > 0 && (
                            <div className="mt-3">
                              <p className="text-sm text-yellow-400 mb-2">Gambar baru:</p>
                              <div className="flex flex-wrap gap-2">
                                {imageFiles.map((file, index) => (
                                  <div key={index} className="relative">
                                    <img src={URL.createObjectURL(file)} alt={`preview-new-${index}`} className="w-16 h-16 object-cover rounded" />
                                    <button 
                                      type="button"
                                      onClick={() => {
                                        const newFiles = [...imageFiles];
                                        newFiles.splice(index, 1);
                                        setImageFiles(newFiles);
                                      }}
                                      className="absolute -top-2 -right-2 bg-red-600 rounded-full p-1"
                                    >
                                      <X size={12} />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2 mt-3 text-sm text-gray-400">
                            <div className={`h-2 flex-1 rounded-full ${form.foto_url.length >= 5 ? 'bg-red-500' : 'bg-gray-700'}`}>
                              <div 
                                className={`h-2 rounded-full ${form.foto_url.length >= 5 ? 'bg-red-500' : 'bg-blue-500'}`} 
                                style={{ width: `${(form.foto_url.length / 5) * 100}%` }}
                              ></div>
                            </div>
                            <span>{form.foto_url.length}/5</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <button 
                      type="submit" 
                      className="flex-1 bg-blue-600 px-4 py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 font-medium"
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <>
                          <Loader className="animate-spin" size={16} /> 
                          {editProduct ? "Mengupdate..." : "Menyimpan..."}
                        </>
                      ) : (
                        <>
                          {editProduct ? "Update Produk" : "Tambah Produk"}
                        </>
                      )}
                    </button>
                    
                    {editProduct && (
                      <button 
                        type="button" 
                        onClick={() => {
                          setEditProduct(null);
                          setForm({ nama: "", deskripsi: "", harga: "", foto_url: [] });
                          setImageFiles([]);
                        }}
                        className="px-4 py-3 rounded-lg bg-gray-600 hover:bg-gray-700 transition font-medium"
                      >
                        Batal
                      </button>
                    )}
                  </div>
                </form>
              </div>
              
              {/* Daftar Produk */}
              <div className="bg-gray-800 p-6 rounded-lg md:w-1/2 overflow-y-auto max-h-[80vh]">
                <h2 className="text-xl font-bold mb-4">Daftar Produk ({products.length})</h2>

                {products.length === 0 ? (
                  <div className="bg-gray-800 p-8 rounded-lg text-center">
                    <ImageIcon size={48} className="mx-auto text-gray-500 mb-4" />
                    <p className="text-gray-400">Belum ada produk.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {products.map((p) => (
                      <div key={p.id} className="bg-gray-800 rounded-lg shadow-lg flex flex-col overflow-hidden">
                        {/* Gambar utama */}
                        <div className="relative">
                          {p.foto_url.length > 0 ? (
                            <Carousel images={p.foto_url} />
                          ) : (
                            <div className="w-full h-48 bg-gray-700 flex items-center justify-center rounded-t-lg">
                              <ImageIcon size={32} className="text-gray-500" />
                            </div>
                          )}
                          {p.stok === 0 && (
                            <span className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 text-xs rounded">Habis</span>
                          )}
                        </div>

                        {/* Info produk */}
                        <div className="p-4 flex-1 flex flex-col justify-between">
                          <h3 className="font-bold text-lg line-clamp-2">{p.nama}</h3>
                          <p className="text-yellow-400 font-bold mt-2">
                            Rp {parseInt(p.harga).toLocaleString("id-ID")}
                          </p>
                        </div>

                        {/* Tombol Edit / Hapus / Bagikan di bawah */}
                        <div className="p-3 flex justify-between items-center gap-2 border-t border-gray-700">
                          <button
                            onClick={() => { setForm(p); setEditProduct(p); }}
                            className="flex-1 bg-yellow-500 px-3 py-2 rounded flex items-center gap-1 justify-center hover:bg-yellow-600 transition text-sm"
                          >
                            <Edit3 size={14}/> Edit
                          </button>

                          <button
                            onClick={() => handleDelete(p)}
                            className="flex-1 bg-red-600 px-3 py-2 rounded flex items-center gap-1 justify-center hover:bg-red-700 transition text-sm"
                          >
                            <Trash2 size={14}/> Hapus
                          </button>

                          <button
                            onClick={() => shareProduct(p)}
                            className="flex-1 bg-green-600 px-3 py-2 rounded flex items-center gap-1 justify-center hover:bg-green-700 transition text-sm"
                          >
                            <Share2 size={14}/> Bagikan
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {tab === "profil" && (
          <form onSubmit={handleProfileUpdate} className="bg-gray-800 p-6 rounded-lg space-y-4 max-w-lg mx-auto">
            <div>
              <label className="block mb-1 text-sm text-gray-400">Nama Toko*</label>
              <input 
                type="text" 
                placeholder="Nama Toko" 
                value={tokoForm.nama} 
                onChange={e => setTokoForm({...tokoForm, nama: e.target.value})} 
                className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-yellow-500 focus:outline-none"
                required
              />
            </div>
            
            <div>
              <label className="block mb-1 text-sm text-gray-400">Whatsapp</label>
              <input 
                type="text" 
                placeholder="Nomor Whatsapp" 
                value={tokoForm.whatsapp} 
                onChange={e => setTokoForm({...tokoForm, whatsapp: e.target.value})} 
                className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-yellow-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block mb-1 text-sm text-gray-400">Daerah</label>
              <input 
                type="text" 
                placeholder="Daerah" 
                value={tokoForm.daerah} 
                onChange={e => setTokoForm({...tokoForm, daerah: e.target.value})} 
                className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-yellow-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block mb-1 text-sm text-gray-400">Keterangan</label>
              <textarea 
                placeholder="Keterangan toko" 
                value={tokoForm.keterangan} 
                onChange={e => setTokoForm({...tokoForm, keterangan: e.target.value})} 
                className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-yellow-500 focus:outline-none"
                rows="4"
              />
            </div>
            
            <button 
              type="submit" 
              className="bg-green-600 px-4 py-2 rounded hover:bg-green-700 transition w-full"
            >
              Update Profil
            </button>
          </form>
        )}

        {tab === "ulasan" && (
          <div className="space-y-4 max-w-3xl mx-auto">
            <h2 className="text-xl font-bold mb-4">Ulasan Pelanggan</h2>
            
            {reviews.length === 0 ? (
              <div className="bg-gray-800 p-6 rounded-lg text-center">
                <p className="text-gray-400">Belum ada ulasan untuk toko Anda</p>
              </div>
            ) : (
              <>
                {currentReviews.map(r => (
                  <div key={r.id} className="bg-gray-800 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="bg-blue-600 p-2 rounded-full">
                        <User size={16} />
                      </div>
                      <span className="font-semibold">{r.nama_pembeli}</span>
                    </div>
                    <StarRating rating={r.rating} />
                    <p className="text-gray-300 mt-2">{r.komentar}</p>
                    <p className="text-xs text-gray-500 mt-2">{new Date(r.created_at).toLocaleString('id-ID')}</p>
                  </div>
                ))}
                
                {/* Pagination Controls */}
                {totalReviewPages > 1 && (
                  <div className="flex justify-center mt-6 gap-2">
                    <button
                      onClick={() => paginate(currentReviewPage - 1)}
                      disabled={currentReviewPage === 1}
                      className="px-3 py-1 rounded bg-gray-700 disabled:opacity-50"
                    >
                      Prev
                    </button>
                    
                    {Array.from({ length: totalReviewPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => paginate(page)}
                        className={`px-3 py-1 rounded ${currentReviewPage === page ? 'bg-yellow-500 text-black' : 'bg-gray-700'}`}
                      >
                        {page}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => paginate(currentReviewPage + 1)}
                      disabled={currentReviewPage === totalReviewPages}
                      className="px-3 py-1 rounded bg-gray-700 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}