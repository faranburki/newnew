import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function DoctorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [doctor, setDoctor] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loadingDoc, setLoadingDoc] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [error, setError] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        let token = "";
        if (currentUser) token = await currentUser.getIdToken();
        const res = await axios.get(`${API_URL}/doctors/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDoctor(res.data);
      } catch (err) {
        console.error("Failed to fetch doctor:", err);
        setError("Doctor not found.");
      } finally {
        setLoadingDoc(false);
      }
    };

    const fetchSlots = async () => {
      try {
        let token = "";
        if (currentUser) token = await currentUser.getIdToken();
        const res = await axios.get(`${API_URL}/doctors/${id}/slots`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSlots(res.data);
      } catch (err) {
        console.error("Failed to fetch slots:", err);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchDoctor();
    fetchSlots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const getInitials = (name) => {
    if (!name) return "DR";
    const parts = name.replace("Dr. ", "").split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const renderStars = (rating) => {
    const full = Math.floor(rating || 0);
    const half = rating % 1 >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return (
      <span className="tracking-wider text-lg">
        <span className="text-yellow-500">{"★".repeat(full)}</span>
        {half === 1 && <span className="text-yellow-400">★</span>}
        <span className="text-gray-300">{"☆".repeat(empty)}</span>
      </span>
    );
  };

  // Group slots by date
  const slotsByDate = slots.reduce((acc, slot) => {
    const date = slot.date || "Unknown";
    if (!acc[date]) acc[date] = [];
    acc[date].push(slot);
    return acc;
  }, {});

  // Sort dates
  const sortedDates = Object.keys(slotsByDate).sort();

  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr + "T00:00:00");
      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 1);

      if (d.toDateString() === today.toDateString()) return "Today";
      if (d.toDateString() === tomorrow.toDateString()) return "Tomorrow";
      return d.toLocaleDateString("en-PK", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const handleBookSlot = () => {
    if (!selectedSlot || !doctor) return;
    navigate(`/book/${id}`, {
      state: {
        slotId: selectedSlot.id,
        slotTime: selectedSlot.time,
        slotDate: selectedSlot.date,
        doctorName: doctor.name,
        fee: doctor.fee,
      },
    });
  };

  if (loadingDoc) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <svg className="animate-spin h-10 w-10 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <p className="text-xl text-gray-500 mb-4">{error || "Doctor not found."}</p>
        <button onClick={() => navigate("/doctors")} className="text-emerald-600 font-semibold hover:underline">
          ← Back to Doctors
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 pt-14 pb-32 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-28 relative z-10 space-y-8">
        {/* Doctor Info Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="h-28 w-28 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-4xl shadow-lg ring-4 ring-white">
                {getInitials(doctor.name)}
              </div>
            </div>

            {/* Details */}
            <div className="flex-grow text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                <h1 className="text-3xl font-extrabold text-gray-900">
                  {doctor.name}
                </h1>
                {/* Availability dot */}
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                  doctor.availabilityStatus
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-500"
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    doctor.availabilityStatus ? "bg-green-500 animate-pulse" : "bg-gray-400"
                  }`}></span>
                  {doctor.availabilityStatus ? "Available" : "Unavailable"}
                </span>
              </div>

              {/* Specialty */}
              <span className="inline-block px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-3">
                {doctor.specialty}
              </span>

              {/* PMDC Badge */}
              {doctor.pmdc_number && (
                <div className="mb-3">
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-50 border border-green-200 text-green-700 rounded-full text-sm font-semibold">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Verified PMDC: {doctor.pmdc_number}
                  </span>
                </div>
              )}

              {/* Rating & Fee */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  {renderStars(doctor.rating)}
                  <span className="text-gray-600 font-medium">({doctor.rating})</span>
                </div>
                <div className="h-5 w-px bg-gray-300 hidden sm:block"></div>
                <span className="text-xl font-bold text-gray-900">
                  Rs. {doctor.fee || "Free"}
                  <span className="text-sm font-normal text-gray-500 ml-1">/ consultation</span>
                </span>
              </div>

              {/* Bio */}
              <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                {doctor.bio || "Experienced medical professional dedicated to providing quality healthcare."}
              </p>
            </div>
          </div>
        </div>

        {/* Slots Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            🕐 Available Slots
            <span className="bg-emerald-100 text-emerald-700 py-0.5 px-2.5 rounded-full text-sm">
              {slots.length}
            </span>
          </h2>

          {loadingSlots ? (
            <div className="flex justify-center py-10">
              <svg className="animate-spin h-8 w-8 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : slots.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-gray-500 text-lg">No available slots at the moment.</p>
              <p className="text-gray-400 text-sm mt-1">Please check back later.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {sortedDates.map((date) => (
                <div key={date}>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formatDate(date)}
                    <span className="text-gray-400 font-normal normal-case">({date})</span>
                  </h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {slotsByDate[date]
                      .sort((a, b) => (a.time > b.time ? 1 : -1))
                      .map((slot) => {
                        const isAvailable = slot.status === "available";
                        const isSelected = selectedSlot?.id === slot.id;

                        return (
                          <button
                            key={slot.id}
                            disabled={!isAvailable}
                            onClick={() =>
                              isAvailable &&
                              setSelectedSlot(isSelected ? null : slot)
                            }
                            className={`py-3 px-3 rounded-xl text-sm font-semibold border-2 transition-all ${
                              isSelected
                                ? "border-emerald-600 bg-emerald-600 text-white shadow-lg scale-105"
                                : isAvailable
                                ? "border-green-300 bg-green-50 text-green-700 hover:border-green-500 hover:bg-green-100 hover:shadow-sm cursor-pointer"
                                : "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                            }`}
                          >
                            {slot.time}
                          </button>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Book This Slot Button */}
          {selectedSlot && (
            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-emerald-50 rounded-xl p-5 border border-emerald-100">
                <div>
                  <p className="text-sm text-emerald-600 font-semibold">Selected Slot</p>
                  <p className="text-lg font-bold text-gray-900">
                    {formatDate(selectedSlot.date)} at {selectedSlot.time}
                  </p>
                </div>
                <button
                  onClick={handleBookSlot}
                  className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold rounded-xl text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Book This Slot
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Back link */}
        <div className="text-center pt-2">
          <button
            onClick={() => navigate("/doctors")}
            className="text-emerald-600 hover:text-emerald-800 font-semibold transition-colors underline underline-offset-4"
          >
            ← Back to All Doctors
          </button>
        </div>
      </div>
    </div>
  );
}
