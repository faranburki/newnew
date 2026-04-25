import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import DoctorCard from "../components/patient/DoctorCard";

const SPECIALTIES = ["All", "Cardiologist", "Dermatologist", "General Physician", "ENT", "Neurologist", "Orthopedic"];

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="h-14 w-14 rounded-xl bg-gray-200 flex-shrink-0"></div>
        <div className="flex-grow space-y-2.5 w-full">
          <div className="h-4 bg-gray-200 rounded w-2/5"></div>
          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
        </div>
        <div className="h-10 w-24 bg-gray-200 rounded-lg flex-shrink-0"></div>
      </div>
    </div>
  );
}

export default function SearchDoctors() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSpecialty = searchParams.get("specialty") || "All";
  const [specialty, setSpecialty] = useState(initialSpecialty);
  const [searchQuery, setSearchQuery] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { currentUser } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  const fetchDoctors = async (spec) => {
    setLoading(true);
    setError("");
    try {
      let token = "";
      if (currentUser) token = await currentUser.getIdToken();
      const params = {};
      if (spec && spec !== "All") params.specialty = spec;
      const res = await axios.get(`${API_URL}/doctors`, { params, headers: { Authorization: `Bearer ${token}` } });
      setDoctors(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load doctors.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors(specialty);
    if (specialty && specialty !== "All") setSearchParams({ specialty });
    else setSearchParams({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [specialty]);

  const filteredDoctors = doctors.filter((doc) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return doc.name?.toLowerCase().includes(q) || doc.specialty?.toLowerCase().includes(q) || doc.bio?.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-20">
      <div className="bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 pt-14 pb-28 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2 drop-shadow-md">Find a Doctor</h1>
          <p className="text-emerald-100 text-lg">Browse specialists and book an appointment</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-20 relative z-10 space-y-6">
        <div className="bg-white rounded-2xl shadow-xl p-5 border border-gray-100 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by name..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors" />
          </div>
          <select value={specialty} onChange={(e) => setSpecialty(e.target.value)}
            className="px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium sm:w-52 cursor-pointer">
            {SPECIALTIES.map((s) => <option key={s} value={s}>{s === "All" ? "All Specialties" : s}</option>)}
          </select>
        </div>

        {specialty !== "All" && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Filtered:</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold">
              {specialty}
              <button onClick={() => setSpecialty("All")} className="ml-1 hover:text-emerald-900">✕</button>
            </span>
          </div>
        )}

        {error && <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg"><p className="text-sm text-red-700 font-medium">{error}</p></div>}

        {loading ? (
          <div className="space-y-3"><SkeletonCard /><SkeletonCard /><SkeletonCard /></div>
        ) : (
          <>
            <p className="text-sm text-gray-500">Showing <span className="font-semibold text-gray-700">{filteredDoctors.length}</span> doctor{filteredDoctors.length !== 1 ? "s" : ""}</p>
            {filteredDoctors.length > 0 ? (
              <div className="space-y-3">{filteredDoctors.map((doc) => <DoctorCard key={doc.id} doctor={doc} />)}</div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
                <p className="text-gray-400 text-lg">No doctors found for this specialty</p>
                <button onClick={() => { setSpecialty("All"); setSearchQuery(""); }} className="mt-3 text-emerald-600 font-semibold underline underline-offset-4 hover:text-emerald-700">Clear filters</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
