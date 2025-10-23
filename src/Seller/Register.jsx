import React, { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { useNavigate, Link } from "react-router-dom";
import bcrypt from "bcryptjs";

export default function RegisterToko() {
  const [form, setForm] = useState({
    nama: "",
    email: "",
    password: "",
    whatsapp: "",
    keterangan: "",
    daerah: "",
    logo: null,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState({ text: "", type: "" });
  const navigate = useNavigate();

  // Reset errors ketika form berubah
  useEffect(() => {
    if (message.text) setMessage({ text: "", type: "" });
    if (Object.keys(errors).length > 0) setErrors({});
  }, [form]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      const file = files[0];
      // Validasi file
      if (file) {
        if (!file.type.startsWith('image/')) {
          setErrors({ ...errors, logo: "File harus berupa gambar" });
          return;
        }
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
          setErrors({ ...errors, logo: "Ukuran file maksimal 5MB" });
          return;
        }
        setForm({ ...form, logo: file });
        setPreview(URL.createObjectURL(file));
        setErrors({ ...errors, logo: "" });
      }
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.nama.trim()) {
      newErrors.nama = "Nama toko wajib diisi!";
    }
    
    if (!form.email.trim()) {
      newErrors.email = "Email wajib diisi!";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Format email tidak valid!";
    }
    
    if (!form.password) {
      newErrors.password = "Password wajib diisi!";
    } else if (form.password.length < 6) {
      newErrors.password = "Password minimal 6 karakter!";
    }
    
    if (!form.whatsapp.trim()) {
      newErrors.whatsapp = "Nomor WhatsApp wajib diisi!";
    } else if (!/^[0-9+\-\s()]+$/.test(form.whatsapp)) {
      newErrors.whatsapp = "Format nomor WhatsApp tidak valid!";
    }
    
    if (!form.daerah) {
      newErrors.daerah = "Daerah wajib dipilih!";
    }
    
    if (form.logo && !form.logo.type.startsWith('image/')) {
      newErrors.logo = "File harus berupa gambar!";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      // 1️⃣ Hash password
      const hashedPassword = await bcrypt.hash(form.password, 10);

      // 2️⃣ Upload logo ke Supabase Storage
      let logoUrl = null;
      if (form.logo) {
        const fileName = `logo-${Date.now()}-${form.logo.name}`;
        const { error: uploadError } = await supabase.storage
          .from("logos")
          .upload(fileName, form.logo);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("logos")
          .getPublicUrl(fileName);

        logoUrl = urlData.publicUrl;
      }

      // 3️⃣ Cek apakah email sudah ada
      const { data: existing, error: checkError } = await supabase
        .from("toko")
        .select("id")
        .eq("email", form.email)
        .maybeSingle();

      if (checkError) {
        console.error("Error checking email:", checkError);
        throw new Error("Gagal memeriksa email");
      }

      if (existing) {
        setMessage({ text: "Email sudah terdaftar!", type: "error" });
        setLoading(false);
        return;
      }

      // 4️⃣ Simpan data toko sesuai tabel
      const { error: insertError } = await supabase.from("toko").insert([
        {
          nama: form.nama,
          email: form.email,
          password: hashedPassword,
          whatsapp: form.whatsapp,
          keterangan: form.keterangan,
          daerah: form.daerah,
          logo: logoUrl,
          status: "pending", // otomatis pending
          approved_at: null, // belum disetujui
        },
      ]);

      if (insertError) throw insertError;

      setMessage({ 
        text: "Pendaftaran berhasil! Silakan login dan tunggu persetujuan admin.", 
        type: "success" 
      });
      
      // Reset form setelah berhasil
      setForm({
        nama: "",
        email: "",
        password: "",
        whatsapp: "",
        keterangan: "",
        daerah: "",
        logo: null,
      });
      setPreview(null);
      
      // Navigasi setelah delay
      setTimeout(() => {
        navigate("/login-seller");
      }, 3000);
    } catch (err) {
      console.error(err);
      setMessage({ 
        text: "Gagal mendaftar toko: " + (err.message || "Terjadi kesalahan"), 
        type: "error" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-blue-950 px-4 py-8">
      <div className="w-full max-w-lg bg-gradient-to-br from-gray-900/80 to-gray-800/50 backdrop-blur-xl rounded-3xl shadow-[0_0_30px_rgba(0,0,0,0.7)] p-8 md:p-10 border border-gray-700 transition duration-300 hover:shadow-[0_0_40px_rgba(0,0,0,0.8)]">
        <div className="text-center mb-6">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-2 tracking-wide">
            Daftarkan Toko Anda
          </h2>
          <p className="text-gray-400">Bergabung dengan platform kami</p>
        </div>

        {message.text && (
          <div className={`p-3 mb-4 text-center text-sm rounded-lg ${message.type === "error" ? "bg-red-600/80 text-white" : "bg-green-600/80 text-white"} animate-pulse`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          {/* Upload Logo */}
          <div className="flex flex-col items-center space-y-3">
            <label className="text-gray-300 font-medium">Logo Toko</label>
            <div className="relative w-28 h-28 rounded-full border-2 border-dashed border-gray-500 flex items-center justify-center overflow-hidden cursor-pointer hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/30 transition group">
              {preview ? (
                <>
                  <img
                    src={preview}
                    alt="Preview Logo"
                    className="w-full h-full object-cover rounded-full shadow-md"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </>
              ) : (
                <span className="text-4xl text-gray-400 group-hover:text-blue-400 transition">+</span>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
                disabled={loading}
              />
            </div>
            <p className="text-sm text-gray-400">Klik untuk upload (maks. 5MB)</p>
            {errors.logo && <p className="text-red-500 text-sm">{errors.logo}</p>}
          </div>

          {/* Nama Toko */}
          <div>
            <input
              type="text"
              name="nama"
              value={form.nama}
              onChange={handleChange}
              placeholder="Nama Toko"
              className={`w-full p-3 rounded-xl bg-gray-800/60 border ${errors.nama ? 'border-red-500' : 'border-gray-700'} text-white placeholder-gray-400`}
              disabled={loading}
            />
            {errors.nama && <p className="mt-1 text-red-500 text-sm">{errors.nama}</p>}
          </div>

          {/* Email */}
          <div>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
              className={`w-full p-3 rounded-xl bg-gray-800/60 border ${errors.email ? 'border-red-500' : 'border-gray-700'} text-white placeholder-gray-400`}
              disabled={loading}
            />
            {errors.email && <p className="mt-1 text-red-500 text-sm">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Password"
              className={`w-full p-3 rounded-xl bg-gray-800/60 border ${errors.password ? 'border-red-500' : 'border-gray-700'} text-white placeholder-gray-400`}
              disabled={loading}
            />
            {errors.password && <p className="mt-1 text-red-500 text-sm">{errors.password}</p>}
          </div>

          {/* WhatsApp */}
          <div>
            <input
              type="text"
              name="whatsapp"
              value={form.whatsapp}
              onChange={handleChange}
              placeholder="Nomor WhatsApp Aktif"
              className={`w-full p-3 rounded-xl bg-gray-800/60 border ${errors.whatsapp ? 'border-red-500' : 'border-gray-700'} text-white placeholder-gray-400`}
              disabled={loading}
            />
            {errors.whatsapp && <p className="mt-1 text-red-500 text-sm">{errors.whatsapp}</p>}
          </div>

          {/* Keterangan */}
          <div>
            <textarea
              name="keterangan"
              value={form.keterangan}
              onChange={handleChange}
              placeholder="Tentang Toko"
              rows={3}
              className={`w-full p-3 rounded-xl bg-gray-800/60 border ${errors.keterangan ? 'border-red-500' : 'border-gray-700'} text-white placeholder-gray-400`}
              disabled={loading}
            />
            {errors.keterangan && <p className="mt-1 text-red-500 text-sm">{errors.keterangan}</p>}
          </div>

          {/* Daerah */}
          <div>
            <select
              name="daerah"
              value={form.daerah}
              onChange={handleChange}
              className={`w-full p-3 rounded-xl bg-gray-800/60 border ${errors.daerah ? 'border-red-500' : 'border-gray-700'} text-white`}
              disabled={loading}
              required
            >
              <option value="">🌍 Pilih Daerah (Sulawesi Utara)</option>
              <option value="Manado">Manado</option>
              <option value="Bitung">Bitung</option>
              <option value="Tomohon">Tomohon</option>
              <option value="Minahasa">Minahasa</option>
              <option value="Minahasa Utara">Minahasa Utara</option>
              <option value="Minahasa Selatan">Minahasa Selatan</option>
              <option value="Minahasa Tenggara">Minahasa Tenggara</option>
              <option value="Bolaang Mongondow">Bolaang Mongondow</option>
              <option value="Kotamobagu">Kotamobagu</option>
              <option value="Kepulauan Sangihe">Kepulauan Sangihe</option>
              <option value="Kepulauan Talaud">Kepulauan Talaud</option>
              <option value="Kepulauan Sitaro">Kepulauan Sitaro</option>
            </select>
            {errors.daerah && <p className="mt-1 text-red-500 text-sm">{errors.daerah}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-lg text-white bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 transition-all shadow-lg hover:shadow-blue-600/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Mendaftarkan...
              </>
            ) : "Daftar Sekarang"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-400">
            Sudah punya akun?{" "}
            <Link
              to="/Login-Seller"
              className="text-yellow-400 hover:text-yellow-500 font-semibold transition-colors duration-300"
            >
              Login di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}