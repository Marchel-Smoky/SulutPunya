import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";

//--- Seler ---//
import Login from "./Seller/Login.jsx";
import Register from "./Seller/Register";
import SellerDashboard from "./Seller/Sellerdashboard";


//---ADMIN----//
import AdminDashboard from "./Admin/Dashboard";

//--- Buyer ---//
import KeranjangPage from "./buyer/pages/KeranjangPage";
import Checkout from "./buyer/components/Checkout";

import BuyerRoutes from "./buyer/buyerRoutes";
import ProdukCard from "./buyer/components/ProdukCard";
import UlasanProduk from "./produk/UlasanProduk";


//--- CSS ---//
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Halaman Utama */}
        <Route path="/" element={<App />} />

        {/* Halaman Ulasan Produk */}
        <Route path="/produk/:id/ulasan" element={<UlasanProduk />} />

        {/* Seller Routes */}
        <Route path="/Login-Seler" element={<Login />} />
        <Route path="/Register" element={<Register />} />
        <Route path="/Sellerdashboard" element={<SellerDashboard />} />

        {/* Buyer Routes */}
        <Route path="/buyer/*" element={<BuyerRoutes />} />
        <Route path="/produk" element={<ProdukCard />} /> 
        <Route path="/keranjang" element={<KeranjangPage />} />
        <Route path="/checkout" element={<Checkout />} />


        {/* Admin Route */}
        <Route path="/admin" element={<AdminDashboard />} />
      
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

