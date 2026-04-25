import React, { useState, useEffect } from "react";
import axios from "axios";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "../context/AuthContext";

export default function DoctorDashboard() {
  const { currentUser } = useAuth();
  const [doctorName, setDoctorName] = useState("");
  const [availability, setAvailability] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedApptId, setExpandedApptId] = useState(null);
  const [updatingAvailability, setUpdatingAvailability] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) return;
      setLoading(true);
      try {
        const token = await currentUser.getIdToken();
        const headers = { Authorization: `Bearer ${token}` };

        // 1. Fetch user profile for name
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          setDoctorName(userDoc.data().name || "Doctor");
        }

        // 2. Fetch doctor status (handle 404 for existing accounts)
        try {
          const docRes = await axios.get(`${API_URL}/doctors/${currentUser.uid}`, { headers });
          setAvailability(docRes.data.availabilityStatus || false);
        } catch (err) {
          if (err.response?.status === 404) {
            const name = userDoc.exists() ? userDoc.data().name : "Doctor";
            const { setDoc, doc } = await import("firebase/firestore");
            await setDoc(doc(db, "doctors", currentUser.uid), {
              name,
              specialty: "General Physician",
              fee: 1000,
              availabilityStatus: true,
              rating: 4.5,
              bio: "Medical professional dedicated to patient care.",
              pmdc_number: "Not Verified",
            });
            setAvailability(true);
          } else {
            console.error("Failed to fetch doctor status:", err);
          }
        }

        // 3. Fetch today's appointments
        const apptsRes = await axios.get(`${API_URL}/appointments/doctor/${currentUser.uid}`, { headers });
        setAppointments(apptsRes.data);

      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser, API_URL]);

  const toggleAvailability = async () => {
    if (!currentUser || updatingAvailability) return;
    setUpdatingAvailability(true);
    const newStatus = !availability;
    try {
      const token = await currentUser.getIdToken();
      await axios.patch(
        `${API_URL}/doctors/${currentUser.uid}/availability`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAvailability(newStatus);
    } catch (err) {
      console.error("Failed to update availability:", err);
    } finally {
      setUpdatingAvailability(false);
    }
  };

  const getTodayDate = () => {
    return new Date().toLocaleDateString("en-PK", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-10 w-10 text-emerald-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-500 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 pt-14 pb-32 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Good morning, <span className="text-emerald-100">Dr. {doctorName}</span>
            </h1>
            <p className="text-emerald-50 mt-2 flex items-center gap-2">
              <svg className="w-5 h-5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {getTodayDate()}
            </p>
          </div>

          {/* Availability Toggle */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex items-center gap-4 border border-white/20">
            <div className="text-right">
              <p className="text-xs font-bold text-emerald-100 uppercase tracking-widest opacity-80">Current Status</p>
              <p className={`text-lg font-bold ${availability ? "text-white" : "text-emerald-200"}`}>
                {availability ? "Available" : "Not Available"}
              </p>
            </div>
            <button
              onClick={toggleAvailability}
              disabled={updatingAvailability}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none ring-2 ring-transparent ring-offset-2 ring-emerald-400 ${
                availability ? "bg-emerald-400" : "bg-gray-400 opacity-50"
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  availability ? "translate-x-7" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-16 relative z-10">
        {/* Appointments Section */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
            Today's Appointments
            <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
              {appointments.length}
            </span>
          </h2>
        </div>

        {appointments.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-20 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-400 text-xl font-medium">No appointments scheduled for today</p>
            <p className="text-gray-300 mt-1">Enjoy your morning!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {appointments.map((appt) => (
              <div
                key={appt.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold text-xl flex-shrink-0">
                      {appt.patientProfile?.name?.[0] || appt.patientId?.[0] || "P"}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {appt.patientProfile?.name || "Patient"}
                      </h3>
                      <p className="text-emerald-600 font-semibold text-sm flex items-center gap-1.5 mt-0.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {appt.time}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setExpandedApptId(expandedApptId === appt.id ? null : appt.id)}
                    className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                      expandedApptId === appt.id
                        ? "bg-emerald-600 text-white"
                        : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    }`}
                  >
                    {expandedApptId === appt.id ? "Close Profile" : "View Patient Profile"}
                    <svg
                      className={`w-4 h-4 transition-transform ${expandedApptId === appt.id ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                {/* Collapsible Profile Section */}
                {expandedApptId === appt.id && (
                  <div className="px-5 pb-6 pt-2 border-t border-gray-50 bg-gray-50/50 animate-in slide-in-from-top-2 duration-300">
                    {!appt.patientProfile || (!appt.patientProfile.bloodType && !appt.patientProfile.allergies) ? (
                      <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm font-medium border border-red-100 flex items-center gap-2">
                        <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        Patient has not filled health profile
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Blood Type</p>
                          <p className="text-lg font-bold text-red-600">{appt.patientProfile.bloodType || "N/A"}</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Allergies</p>
                          <p className="text-sm text-gray-700 font-medium">{appt.patientProfile.allergies || "None"}</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Conditions</p>
                          <p className="text-sm text-gray-700 font-medium">{appt.patientProfile.chronicConditions || "None reported"}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
