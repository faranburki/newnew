import React from "react";
import { useNavigate } from "react-router-dom";

export default function DoctorCard({ doctor }) {
  const navigate = useNavigate();

  const getInitials = (name) => {
    if (!name) return "DR";
    const parts = name.replace("Dr. ", "").split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const handleCardClick = () => navigate(`/doctors/${doctor.id}`);
  const handleBookClick = (e) => {
    e.stopPropagation();
    navigate(`/book/${doctor.id}`);
  };

  const renderStars = (rating) => {
    const count = Math.round(rating || 0);
    return "★".repeat(count) + "☆".repeat(5 - count);
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 p-4 cursor-pointer flex flex-col sm:flex-row gap-4 items-start sm:items-center w-full group hover:border-emerald-100"
    >
      <div className="flex-shrink-0">
        <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-lg shadow-sm">
          {getInitials(doctor.name)}
        </div>
      </div>

      <div className="flex-grow min-w-0">
        <h3 className="text-base font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">{doctor.name}</h3>
        <div className="flex flex-wrap items-center gap-2 mt-1">
          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md text-xs font-semibold">{doctor.specialty}</span>
          <span className="text-yellow-500 text-sm">{renderStars(doctor.rating)}</span>
          <span className="text-gray-500 text-xs">({doctor.rating})</span>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          <span className="font-semibold text-gray-700">Rs. {doctor.fee || "Free"}</span>
          {doctor.bio && <span className="hidden sm:inline"> · {doctor.bio.substring(0, 60)}...</span>}
        </p>
      </div>

      <button
        onClick={handleBookClick}
        className="flex-shrink-0 w-full sm:w-auto px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-all text-sm shadow-sm"
      >
        Book Now
      </button>
    </div>
  );
}
