import React from "react";

export default function ProductCard({ product, onAddToCart, onBuyNow }) {
  const formatRupiah = (num) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);

  return (
    <div className="bg-gray-900/80 border border-gray-700 p-5 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
      {product.foto_url && (
        <img
          src={product.foto_url}
          alt={product.nama}
          className="w-full h-44 object-cover rounded-xl mb-4"
          onError={(e) => { e.target.src = "https://via.placeholder.com/300x200/1c2541/5bc0be?text=Gambar+Tidak+Tersedia"; }}
        />
      )}
      <h3 className="text-lg font-bold mb-1 line-clamp-2">{product.nama}</h3>
      <p className="text-gray-300 mb-3">{formatRupiah(product.harga)}</p>
      <div className="flex justify-between gap-2">
        <button
          onClick={() => onAddToCart(product)}
          className="bg-yellow-400 text-black px-4 py-2 rounded-lg font-bold hover:bg-yellow-500 transition w-1/2"
        >
          🛒 Keranjang
        </button>
        <button
          onClick={() => onBuyNow(product)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-600 transition w-1/2"
        >
          ⚡ Beli
        </button>
      </div>
    </div>
  );
}
