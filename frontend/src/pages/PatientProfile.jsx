import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "../context/AuthContext";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
const TABS = ["Health Profile", "My Appointments", "My Reports"];

export default function PatientProfile() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);

  // ─── Health Profile State ──────────────────────────────────────
  const [profile, setProfile] = useState({
    bloodType: "",
    allergies: "",
    chronicConditions: "",
    age: "",
  });
  const [profileLoading, setProfileLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // ─── Appointments State ────────────────────────────────────────
  const [appointments, setAppointments] = useState([]);
  const [apptLoading, setApptLoading] = useState(false);

  // ─── Reports State ─────────────────────────────────────────────
  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [expandedReportId, setExpandedReportId] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

  // Load health profile from Firestore
  useEffect(() => {
    const loadProfile = async () => {
      if (!currentUser) return;
      try {
        const docRef = doc(db, "users", currentUser.uid, "profile", "health");
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setProfile((prev) => ({ ...prev, ...snap.data() }));
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setProfileLoading(false);
      }
    };
    loadProfile();
  }, [currentUser]);

  // Load appointments when tab switches
  useEffect(() => {
    if (activeTab !== 1 || !currentUser) return;
    const fetchAppointments = async () => {
      setApptLoading(true);
      try {
        const token = await currentUser.getIdToken();
        const res = await axios.get(
          `${API_URL}/appointments/patient/${currentUser.uid}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAppointments(res.data);
      } catch (err) {
        console.error("Failed to load appointments:", err);
      } finally {
        setApptLoading(false);
      }
    };
    fetchAppointments();
  }, [activeTab, currentUser, API_URL]);

  // Load reports when tab switches
  useEffect(() => {
    if (activeTab !== 2 || !currentUser) return;
    const fetchReports = async () => {
      setReportsLoading(true);
      try {
        const token = await currentUser.getIdToken();
        const res = await axios.get(
          `${API_URL}/reports/${currentUser.uid}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setReports(res.data);
      } catch (err) {
        console.error("Failed to load reports:", err);
      } finally {
        setReportsLoading(false);
      }
    };
    fetchReports();
  }, [activeTab, currentUser, API_URL]);

  // Save health profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    setSaving(true);
    setSaveSuccess(false);
    try {
      const docRef = doc(db, "users", currentUser.uid, "profile", "health");
      await setDoc(docRef, {
        bloodType: profile.bloodType,
        allergies: profile.allergies,
        chronicConditions: profile.chronicConditions,
        age: Number(profile.age) || 0,
        updatedAt: new Date(),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save profile:", err);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("en-PK", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const getUrgencyStyle = (urgency) => {
    const map = {
      routine: "bg-green-100 text-green-700",
      soon: "bg-orange-100 text-orange-700",
      urgent: "bg-red-100 text-red-700",
    };
    return map[urgency?.toLowerCase()] || map.routine;
  };

  // ─── RENDER ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 pt-14 pb-28 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="max-w-4xl mx-auto flex items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-3xl shadow-lg flex-shrink-0 ring-4 ring-white/30">
            {currentUser?.email?.[0]?.toUpperCase() || "P"}
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              {currentUser?.displayName || currentUser?.email?.split("@")[0] || "Patient"}
            </h1>
            <p className="text-emerald-200">{currentUser?.email}</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-20 relative z-10">
        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 mb-8 overflow-hidden">
          <div className="flex border-b border-gray-100">
            {TABS.map((tab, i) => (
              <button
                key={tab}
                onClick={() => setActiveTab(i)}
                className={`flex-1 py-4 px-4 text-sm font-semibold transition-all relative ${
                  activeTab === i
                    ? "text-emerald-700 bg-emerald-50/50"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                {tab}
                {activeTab === i && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600"></div>
                )}
              </button>
            ))}
          </div>

          <div className="p-6 md:p-8">
            {/* ─── TAB 0: Health Profile ─────────────────────────── */}
            {activeTab === 0 && (
              <div>
                {/* Success toast */}
                {saveSuccess && (
                  <div className="mb-6 inline-flex items-center gap-2 px-5 py-2.5 bg-green-100 text-green-700 rounded-full text-sm font-semibold shadow-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    Health profile saved successfully!
                  </div>
                )}

                {profileLoading ? (
                  <div className="flex justify-center py-16">
                    <svg className="animate-spin h-8 w-8 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                ) : (
                  <form onSubmit={handleSaveProfile} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {/* Blood Type */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Blood Type
                        </label>
                        <select
                          value={profile.bloodType}
                          onChange={(e) =>
                            setProfile({ ...profile, bloodType: e.target.value })
                          }
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                        >
                          <option value="">Select blood type</option>
                          {BLOOD_TYPES.map((bt) => (
                            <option key={bt} value={bt}>
                              {bt}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Age */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Age
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="150"
                          value={profile.age}
                          onChange={(e) =>
                            setProfile({ ...profile, age: e.target.value })
                          }
                          placeholder="e.g. 30"
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Allergies */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Allergies
                      </label>
                      <input
                        type="text"
                        value={profile.allergies}
                        onChange={(e) =>
                          setProfile({ ...profile, allergies: e.target.value })
                        }
                        placeholder="e.g. Penicillin, Peanuts"
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      />
                    </div>

                    {/* Chronic Conditions */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Chronic Conditions
                      </label>
                      <input
                        type="text"
                        value={profile.chronicConditions}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            chronicConditions: e.target.value,
                          })
                        }
                        placeholder="e.g. Diabetes, Hypertension"
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={saving}
                      className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                    >
                      {saving ? (
                        <>
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </>
                      ) : (
                        "Save Profile"
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* ─── TAB 1: My Appointments ─────────────────────────── */}
            {activeTab === 1 && (
              <div>
                {apptLoading ? (
                  <div className="flex justify-center py-16">
                    <svg className="animate-spin h-8 w-8 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                ) : appointments.length === 0 ? (
                  <div className="text-center py-16">
                    <p className="text-gray-400 text-lg mb-4">No appointments yet.</p>
                    <button
                      onClick={() => navigate("/doctors")}
                      className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors shadow"
                    >
                      Find a Doctor
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {appointments.map((appt) => (
                      <div
                        key={appt.id}
                        className="bg-gray-50 rounded-xl border border-gray-100 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                            <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">
                              {appt.doctorName || "Doctor"}
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatDate(appt.date)} at {appt.time}
                            </p>
                            {appt.doctorSpecialty && (
                              <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                                {appt.doctorSpecialty}
                              </span>
                            )}
                          </div>
                        </div>
                        <span
                          className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase ${
                            appt.status === "confirmed"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {appt.status || "pending"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ─── TAB 2: My Reports ──────────────────────────────── */}
            {activeTab === 2 && (
              <div>
                {reportsLoading ? (
                  <div className="flex justify-center py-16">
                    <svg className="animate-spin h-8 w-8 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                ) : reports.length === 0 ? (
                  <div className="text-center py-16">
                    <p className="text-gray-400 text-lg mb-4">No reports uploaded yet.</p>
                    <button
                      onClick={() => navigate("/upload-report")}
                      className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors shadow"
                    >
                      Upload Your First Report
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reports.map((report) => (
                      <div
                        key={report.id}
                        className="bg-gray-50 rounded-xl border border-gray-100 overflow-hidden transition-shadow hover:shadow-sm"
                      >
                        {/* Report Header */}
                        <button
                          onClick={() =>
                            setExpandedReportId(
                              expandedReportId === report.id ? null : report.id
                            )
                          }
                          className="w-full px-5 py-4 flex items-center justify-between text-left"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {report.recommended_specialist || "Medical Report"}
                              </p>
                              <p className="text-sm text-gray-500">
                                {formatDate(report.createdAt)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getUrgencyStyle(
                                report.urgency
                              )}`}
                            >
                              {report.urgency || "routine"}
                            </span>
                            <svg
                              className={`w-5 h-5 text-gray-400 transition-transform ${
                                expandedReportId === report.id ? "rotate-180" : ""
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </button>

                        {/* Expanded Summary */}
                        {expandedReportId === report.id && (
                          <div className="px-5 pb-5 pt-0 border-t border-gray-200 space-y-3">
                            <div className="bg-blue-50 rounded-xl p-4 mt-3">
                              <p className="text-sm font-semibold text-blue-600 mb-1">Summary</p>
                              <p className="text-gray-700 text-sm">
                                {report.summary || "No summary available."}
                              </p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="bg-green-50 rounded-xl p-3">
                                <p className="text-xs font-semibold text-green-700 mb-1">Normal</p>
                                {report.normal_values?.length > 0 ? (
                                  <ul className="space-y-0.5">
                                    {report.normal_values.map((v, i) => (
                                      <li key={i} className="text-xs text-gray-700 flex items-center gap-1">
                                        <span className="text-green-500">✓</span> {v}
                                      </li>
                                    ))}
                                  </ul>
                                ) : <p className="text-xs text-gray-400">None</p>}
                              </div>
                              <div className="bg-red-50 rounded-xl p-3">
                                <p className="text-xs font-semibold text-red-700 mb-1">Abnormal</p>
                                {report.abnormal_values?.length > 0 ? (
                                  <ul className="space-y-0.5">
                                    {report.abnormal_values.map((v, i) => (
                                      <li key={i} className="text-xs text-gray-700 flex items-center gap-1">
                                        <span className="text-red-500">⚠</span> {v}
                                      </li>
                                    ))}
                                  </ul>
                                ) : <p className="text-xs text-gray-400">None</p>}
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-3 pt-2">
                              <button
                                onClick={() =>
                                  navigate("/report-result", {
                                    state: { result: report },
                                  })
                                }
                                className="px-5 py-2 bg-emerald-600 text-white rounded-lg font-medium text-sm hover:bg-emerald-700 transition-colors"
                              >
                                View Full Report
                              </button>
                              {report.recommended_specialist && (
                                <button
                                  onClick={() =>
                                    navigate(
                                      `/doctors?specialty=${encodeURIComponent(
                                        report.recommended_specialist
                                      )}`
                                    )
                                  }
                                  className="px-5 py-2 bg-teal-600 text-white rounded-lg font-medium text-sm hover:bg-teal-700 transition-colors"
                                >
                                  Find {report.recommended_specialist}
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
