// src/components/ProductCard.jsx
import React from "react";
import { ShoppingCart, Zap } from "lucide-react";

export default function ProductCard({ product, onAddToCart, onBuyNow, layout = "grid" }) {
  const formatRupiah = (num) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);

  return (
    <div className={`
      bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-[#5bc0be]/20 
      transition-all duration-300 border border-gray-700 hover:border-[#5bc0be]/30 group
      ${layout === "horizontal" ? "w-56 flex-shrink-0 xl:w-64" : ""}
      ${layout === "vertical" ? "p-4" : "p-3"}
      ${layout === "grid" ? "hover:-translate-y-1" : ""}
    `}>
      
      {/* Product Content */}
      <div className={layout === "vertical" ? "flex items-center gap-4" : ""}>
        
        {/* Product Image */}
        {product.foto_url?.length > 0 ? (
          <div className={`
            relative overflow-hidden mb-3
            ${layout === "horizontal" ? "rounded-lg h-32" : ""}
            ${layout === "vertical" ? "rounded-lg w-16 h-16 flex-shrink-0" : ""}
            ${layout === "grid" ? "rounded-lg h-40" : ""}
          `}>
            <img 
              src={product.foto_url[0]} 
              alt={product.nama} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
              onError={(e) => { 
                e.target.src = "https://via.placeholder.com/300x200/1f2937/5bc0be?text=Gambar+Tidak+Tersedia"; 
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        ) : (
          <div className={`
            bg-gray-700 mb-3 flex items-center justify-center
            ${layout === "horizontal" ? "rounded-lg h-32" : ""}
            ${layout === "vertical" ? "rounded-lg w-16 h-16 flex-shrink-0" : ""}
            ${layout === "grid" ? "rounded-lg h-40" : ""}
          `}>
            <div className="text-3xl text-gray-500">📷</div>
          </div>
        )}

        {/* Product Info */}
        <div className={`flex-1 ${layout === "vertical" ? "min-w-0" : ""}`}>
          <h3 className={`
            font-bold mb-1 line-clamp-2 group-hover:text-[#5bc0be] transition-colors
            ${layout === "vertical" ? "text-sm line-clamp-1" : "text-sm"}
          `}>
            {product.nama}
          </h3>
          <p className={`
            text-gray-300 mb-2
            ${layout === "vertical" ? "text-xs line-clamp-2" : "text-xs line-clamp-2"}
          `}>
            {product.deskripsi || "Tidak ada deskripsi"}
          </p>
          <p className="text-yellow-400 font-bold text-sm">
            {formatRupiah(product.harga)}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className={`flex gap-2 ${layout === "vertical" ? "mt-3" : "mt-3"}`}>
        <button 
          onClick={() => onAddToCart(product)} 
          className="flex-1 bg-[#5bc0be] py-2 rounded-lg font-semibold hover:bg-[#4aa8a6] transition-colors text-xs flex items-center justify-center gap-1"
        >
          <ShoppingCart size={12} />
          <span>Keranjang</span>
        </button>
        <button 
          onClick={() => onBuyNow(product)} 
          className="flex-1 bg-green-500 py-2 rounded-lg font-semibold hover:bg-green-600 transition-colors text-xs flex items-center justify-center gap-1"
        >
          <Zap size={12} />
          <span>Beli</span>
        </button>
      </div>
    </div>
  );
}
