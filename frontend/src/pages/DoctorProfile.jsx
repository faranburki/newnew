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

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

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
  // ─── RENDER ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans">
      {/* Header */}
      <div className="medical-gradient pt-20 pb-40 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4"></div>
        <div className="max-w-4xl mx-auto relative z-10">
          <button
            onClick={() => navigate("/doctors")}
            className="text-white/60 hover:text-white font-bold text-xs uppercase tracking-[0.2em] mb-8 transition-all flex items-center gap-2"
          >
            ← Physician Directory
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-32 relative z-10 space-y-12">
        {/* Doctor Info Card */}
        <div className="bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 p-8 md:p-12">
          <div className="flex flex-col md:flex-row gap-10 items-center md:items-start text-center md:text-left">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="h-36 w-36 rounded-[48px] bg-white flex items-center justify-center text-teal-600 font-bold text-5xl shadow-2xl shadow-slate-200 ring-1 ring-slate-100 relative">
                {getInitials(doctor.name)}
                <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-2xl border-4 border-white ${
                  doctor.availabilityStatus ? "bg-teal-500 shadow-[0_0_15px_rgba(20,184,166,0.5)]" : "bg-slate-300"
                }`}></div>
              </div>
            </div>

            {/* Details */}
            <div className="flex-grow space-y-6">
              <div>
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                  <h1 className="text-4xl font-bold text-slate-800 tracking-tight">
                    {doctor.name}
                  </h1>
                </div>
                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                  <span className="px-5 py-2 bg-slate-50 text-slate-500 rounded-2xl text-[10px] font-bold uppercase tracking-widest border border-slate-100 shadow-sm">
                    {doctor.specialty}
                  </span>
                  {doctor.pmdc_number && (
                    <span className="px-5 py-2 bg-teal-50 text-teal-700 rounded-2xl text-[10px] font-bold uppercase tracking-widest border border-teal-100 shadow-sm flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Verified Practitioner
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-center md:justify-start gap-8 py-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Clinical Rating</p>
                  <div className="flex items-center gap-3">
                    {renderStars(doctor.rating)}
                    <span className="text-slate-800 font-bold">{doctor.rating}</span>
                  </div>
                </div>
                <div className="w-px h-8 bg-slate-100 hidden sm:block"></div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Session Rate</p>
                  <p className="text-2xl font-bold text-slate-800 tracking-tight">
                    Rs. {doctor.fee || "0"}
                  </p>
                </div>
              </div>

              <div className="bg-slate-50/50 rounded-[32px] p-6 border border-slate-100">
                <p className="text-slate-500 font-medium leading-relaxed italic">
                  "{doctor.bio || "Patient-centered healthcare specialist dedicated to evidence-based clinical practice and professional medical standards."}"
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Slots Section */}
        <div className="bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 p-8 md:p-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12 pb-8 border-b border-slate-50">
            <h2 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-4">
              Schedule Availability
              <span className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 text-sm font-bold border border-slate-100">
                {slots.length}
              </span>
            </h2>
          </div>

          {loadingSlots ? (
            <div className="flex justify-center py-20">
              <svg className="animate-spin h-12 w-12 text-teal-600" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.162 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : slots.length === 0 ? (
            <div className="text-center py-24 bg-slate-50/50 rounded-[40px] border border-dashed border-slate-200">
              <p className="text-slate-400 font-bold text-xl tracking-tight">No Temporal Slots Available</p>
              <p className="text-slate-300 font-medium text-sm mt-2">Consultant has no scheduled sessions at this time.</p>
            </div>
          ) : (
            <div className="space-y-12">
              {sortedDates.map((date) => (
                <div key={date} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-4">
                    <span className="w-8 h-px bg-slate-100"></span>
                    {formatDate(date)}
                    <span className="w-full h-px bg-slate-100"></span>
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {slotsByDate[date]
                      .sort((a, b) => (a.time > b.time ? 1 : -1))
                      .map((slot) => {
                        const isAvailable = slot.status === "available";
                        const isSelected = selectedSlot?.id === slot.id;

                        return (
                          <button
                            key={slot.id}
                            disabled={!isAvailable}
                            onClick={() => isAvailable && setSelectedSlot(isSelected ? null : slot)}
                            className={`py-5 px-4 rounded-3xl font-bold text-sm tracking-tight transition-all duration-300 ${
                              isSelected
                                ? "bg-teal-600 text-white shadow-2xl shadow-teal-500/40 ring-4 ring-teal-500/20 -translate-y-1"
                                : isAvailable
                                ? "bg-white text-slate-700 border-2 border-slate-100 hover:border-teal-500/50 hover:bg-teal-50/30 hover:text-teal-700"
                                : "bg-slate-50 text-slate-300 border-2 border-transparent cursor-not-allowed grayscale"
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
            <div className="mt-16 animate-in zoom-in-95 duration-300">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-slate-900 rounded-[40px] p-8 md:p-10 shadow-2xl shadow-slate-400 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
                <div className="relative z-10 text-center md:text-left">
                  <p className="text-[10px] font-bold text-teal-400 uppercase tracking-[0.3em] mb-2">Reservation Selected</p>
                  <p className="text-2xl font-bold text-white tracking-tight">
                    {formatDate(selectedSlot.date)} @ {selectedSlot.time}
                  </p>
                </div>
                <button
                  onClick={handleBookSlot}
                  className="btn-primary w-full md:w-auto px-12 py-5 text-xl flex items-center justify-center gap-4 group"
                >
                  Complete Registration
                  <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
}
