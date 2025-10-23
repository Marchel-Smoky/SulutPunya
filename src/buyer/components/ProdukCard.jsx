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
      ${layout === "vertical" ? "p-4" : "p-2 sm:p-3"}
      ${layout === "grid" ? "hover:-translate-y-1 w-full" : ""}
      
      /* Responsive sizing untuk grid layout */
      ${layout === "grid" ? `
        /* Mobile: 3 kolom - kompak */
        /* Tablet: 5 kolom - medium */
        md:min-w-0
        /* Desktop: 7 kolom - kecil */
        xl:min-w-0
      ` : ""}
    `}>
      
      {/* Product Content */}
      <div className={layout === "vertical" ? "flex items-center gap-4" : ""}>
        
        {/* Product Image - Responsive height */}
        {product.foto_url?.length > 0 ? (
          <div className={`
            relative overflow-hidden mb-2 sm:mb-3
            ${layout === "horizontal" ? "rounded-lg h-32" : ""}
            ${layout === "vertical" ? "rounded-lg w-16 h-16 flex-shrink-0" : ""}
            ${layout === "grid" ? `
              rounded-lg 
              h-24 sm:h-28 md:h-24 lg:h-28 xl:h-24
              /* Mobile: tinggi sedang, Tablet: lebih pendek, Desktop: paling pendek */
            ` : ""}
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
            bg-gray-700 mb-2 sm:mb-3 flex items-center justify-center
            ${layout === "horizontal" ? "rounded-lg h-32" : ""}
            ${layout === "vertical" ? "rounded-lg w-16 h-16 flex-shrink-0" : ""}
            ${layout === "grid" ? `
              rounded-lg 
              h-24 sm:h-28 md:h-24 lg:h-28 xl:h-24
            ` : ""}
          `}>
            <div className="text-xl sm:text-2xl text-gray-500">📷</div>
          </div>
        )}

        {/* Product Info - Responsive text sizing */}
        <div className={`flex-1 ${layout === "vertical" ? "min-w-0" : ""}`}>
          <h3 className={`
            font-bold mb-1 line-clamp-2 group-hover:text-[#5bc0be] transition-colors
            ${layout === "vertical" ? "text-sm line-clamp-1" : `
              text-xs sm:text-sm
              /* Mobile: text kecil, Tablet/Desktop: text normal */
            `}
          `}>
            {product.nama}
          </h3>
          <p className={`
            text-gray-300 mb-1 sm:mb-2
            ${layout === "vertical" ? "text-xs line-clamp-2" : `
              text-xs line-clamp-2
              /* Selalu text kecil untuk grid layout */
            `}
          `}>
            {product.deskripsi || "Tidak ada deskripsi"}
          </p>
          <p className={`
            text-yellow-400 font-bold
            ${layout === "grid" ? "text-xs sm:text-sm" : "text-sm"}
            /* Harga: mobile kecil, tablet/desktop normal */
          `}>
            {formatRupiah(product.harga)}
          </p>
        </div>
      </div>

      {/* Action Buttons - Responsive sizing */}
      <div className={`flex gap-1 sm:gap-2 ${layout === "vertical" ? "mt-3" : "mt-2 sm:mt-3"}`}>
        <button 
          onClick={() => onAddToCart(product)} 
          className={`
            flex-1 py-1 sm:py-2 rounded-lg font-semibold hover:bg-[#4aa8a6] transition-colors 
            flex items-center justify-center gap-1
            ${layout === "grid" ? `
              bg-[#5bc0be] text-xs
              /* Mobile: button kecil, Tablet/Desktop: normal */
            ` : "bg-[#5bc0be] text-xs"}
          `}
        >
          <ShoppingCart size={layout === "grid" ? 10 : 12} className="flex-shrink-0" />
          <span className="truncate">Keranjang</span>
        </button>
        <button 
          onClick={() => onBuyNow(product)} 
          className={`
            flex-1 py-1 sm:py-2 rounded-lg font-semibold hover:bg-green-600 transition-colors 
            flex items-center justify-center gap-1
            ${layout === "grid" ? `
              bg-green-500 text-xs
              /* Mobile: button kecil, Tablet/Desktop: normal */
            ` : "bg-green-500 text-xs"}
          `}
        >
          <Zap size={layout === "grid" ? 10 : 12} className="flex-shrink-0" />
          <span className="truncate">Beli</span>
        </button>
      </div>
    </div>
  );
}
