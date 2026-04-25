import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white px-4">
      <div className="w-20 h-20 rounded-2xl bg-emerald-100 flex items-center justify-center mb-6">
        <span className="text-4xl">🔍</span>
      </div>
      <h1 className="text-6xl font-extrabold text-emerald-600 mb-3">404</h1>
      <p className="text-xl text-gray-500 mb-8">Page not found</p>
      <Link
        to="/"
        className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-200"
      >
        Go Home
      </Link>
    </div>
  );
}
