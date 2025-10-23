// src/buyer/buyerRoutes.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Pages
import Dashboard from "./pages/Dashboard";
import TokoProduk from "./pages/TokoProduk";
import KeranjangPage from "./pages/KeranjangPage";


export default function BuyerRoutes() {
  return (
    <Routes>
  <Route path="/" element={<Dashboard />} />
  <Route path="/toko/:tokoId" element={<TokoProduk />} />
  <Route path="/keranjang" element={<KeranjangPage />} />
  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>

  );
}
