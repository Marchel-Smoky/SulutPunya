// src/Login.jsx
import React, { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { useNavigate, Link } from "react-router-dom";
import bcrypt from "bcryptjs";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Reset errors ketika form berubah
  useEffect(() => {
    if (message) setMessage("");
    if (Object.keys(errors).length > 0) setErrors({});
  }, [form]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const validateForm = () => {
    const newErrors = {};
    const emailOrUsername = form.email.trim();
    
    if (!emailOrUsername) {
      newErrors.email = "Email/Username wajib diisi!";
    }
    
    if (!form.password) {
      newErrors.password = "Password wajib diisi!";
    } else if (form.password.length < 6) {
      newErrors.password = "Password minimal 6 karakter!";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setMessage("");
    setLoading(true);

    try {
      const emailOrUsername = form.email.trim();

      // ================================
      // 1. Cek Admin
      // ================================
      const { data: adminData, error: adminError } = await supabase
        .from("admin")
        .select("*")
        .eq("username", emailOrUsername)
        .maybeSingle();

      if (adminError) {
        console.warn("Admin check error:", adminError);
      }

      if (adminData) {
        const isValid = await bcrypt.compare(form.password, adminData.password);
        if (isValid) {
          // Simpan data admin di localStorage
          localStorage.setItem("userEmail", adminData.username);
          localStorage.setItem("userRole", "admin");
          localStorage.setItem("userId", adminData.id);

          navigate("/admin", { 
            state: { role: "admin", id: adminData.id },
            replace: true 
          });
          return;
        } else {
          setMessage("Password salah untuk Admin!");
          return;
        }
      }

      // ================================
      // 2. Cek Toko
      // ================================
      const { data: tokoData, error: tokoError } = await supabase
        .from("toko")
        .select("*")
        .eq("email", emailOrUsername)
        .maybeSingle();

      if (tokoError) {
        console.warn("Toko check error:", tokoError);
      }

      if (!tokoData) {
        setMessage("Email atau password salah!");
        return;
      }

      const isTokoValid = await bcrypt.compare(form.password, tokoData.password);
      if (!isTokoValid) {
        setMessage("Email atau password salah!");
        return;
      }

      if (tokoData.status && tokoData.status !== "approved") {
        setMessage("Toko Anda belum disetujui admin.");
        return;
      }

      // ✅ Login sukses Toko
      // Simpan data toko di localStorage
      localStorage.setItem("userEmail", tokoData.email);
      localStorage.setItem("userRole", "toko");
      localStorage.setItem("userId", tokoData.id);

      navigate("/Sellerdashboard", {
        state: { role: "toko", id: tokoData.id },
        replace: true
      });
    } catch (err) {
      console.error("Login error:", err);
      setMessage("Terjadi kesalahan server. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-blue-950 px-4 py-8">
      <div className="w-full max-w-md bg-gray-800/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-gray-700 transform transition-transform duration-300 hover:scale-[1.01]">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>
        
        <h2 className="text-3xl font-bold text-center text-white mb-2">
          Login
        </h2>
        <p className="text-center text-gray-400 mb-6">Masuk ke akun Anda</p>

        {message && (
          <div className="p-3 mb-4 text-center text-sm bg-red-600/80 text-white rounded-lg animate-pulse">
            {message}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="text"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email Toko"
              className={`w-full p-3 rounded-xl bg-gray-800/60 border ${errors.email ? 'border-red-500' : 'border-gray-700'} text-white transition-colors duration-300`}
              disabled={loading}
            />
            {errors.email && <p className="mt-1 text-red-500 text-sm">{errors.email}</p>}
          </div>
          
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Password"
              className={`w-full p-3 pr-10 rounded-xl bg-gray-800/60 border ${errors.password ? 'border-red-500' : 'border-gray-700'} text-white transition-colors duration-300`}
              disabled={loading}
            />
            <button
              type="button"
              className="absolute right-3 top-3 text-gray-400 hover:text-white"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              )}
            </button>
            {errors.password && <p className="mt-1 text-red-500 text-sm">{errors.password}</p>}
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Memproses...
              </>
            ) : "Login"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-400">
            Belum punya toko?{" "}
            <Link
              to="/Register"
              className="text-yellow-400 hover:text-yellow-500 font-semibold transition-colors duration-300"
            >
              Daftar Sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );

}

