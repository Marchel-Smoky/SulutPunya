import React from "react";

export default function Notification({ message, type = "success", onClose }) {
  const bgColor = type === "error" ? "bg-red-600" : "bg-green-600";

  return (
    <div className={`${bgColor} text-white px-4 py-2 rounded-lg shadow-lg flex items-center fixed top-4 right-4 z-50 animate-fadeIn`}>
      <span className="mr-2">{type === "error" ? "⚠️" : "✓"}</span>
      <p>{message}</p>
      <button onClick={onClose} className="ml-4 font-bold">×</button>

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out;
          }
        `}
      </style>
    </div>
  );
}
