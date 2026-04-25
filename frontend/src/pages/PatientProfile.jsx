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

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

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

    // ─── RENDER ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans">
      {/* Header */}
      <div className="medical-gradient pt-20 pb-32 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
        <div className="max-w-5xl mx-auto flex items-center gap-8 relative z-10">
          <div className="w-24 h-24 rounded-[32px] bg-white/10 backdrop-blur-md flex items-center justify-center text-white font-bold text-4xl shadow-2xl flex-shrink-0 ring-1 ring-white/20">
            {currentUser?.email?.[0]?.toUpperCase() || "P"}
          </div>
          <div className="space-y-1">
            <h1 className="text-4xl font-bold text-white tracking-tight">
              {currentUser?.displayName || currentUser?.email?.split("@")[0] || "Patient"}
            </h1>
            <p className="text-teal-100 font-medium opacity-80">{currentUser?.email}</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-16 relative z-10">
        {/* Main Card Container */}
        <div className="bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex bg-slate-50/50 p-2 border-b border-slate-100">
            {TABS.map((tab, i) => (
              <button
                key={tab}
                onClick={() => setActiveTab(i)}
                className={`flex-1 py-4 px-6 text-sm font-bold tracking-tight rounded-[24px] transition-all duration-300 ${
                  activeTab === i
                    ? "text-teal-700 bg-white shadow-xl shadow-slate-200/50 ring-1 ring-slate-100"
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-100/50"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-8 md:p-12">
            {/* ─── TAB 0: Health Profile ─────────────────────────── */}
            {activeTab === 0 && (
              <div className="max-w-2xl">
                {saveSuccess && (
                  <div className="mb-8 inline-flex items-center gap-3 px-6 py-3 bg-teal-50 text-teal-700 rounded-2xl text-sm font-bold border border-teal-100 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    Profile Configuration Synchronized
                  </div>
                )}

                {profileLoading ? (
                  <div className="flex justify-center py-20">
                    <svg className="animate-spin h-10 w-10 text-teal-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.162 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                ) : (
                  <form onSubmit={handleSaveProfile} className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3 ml-1">
                          Blood Group Specification
                        </label>
                        <select
                          value={profile.bloodType}
                          onChange={(e) => setProfile({ ...profile, bloodType: e.target.value })}
                          className="input-medical"
                        >
                          <option value="">Select profile type</option>
                          {BLOOD_TYPES.map((bt) => (
                            <option key={bt} value={bt}>{bt}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3 ml-1">
                          Clinical Age
                        </label>
                        <input
                          type="number"
                          value={profile.age}
                          onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                          placeholder="e.g. 24"
                          className="input-medical"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3 ml-1">
                        Allergen History
                      </label>
                      <input
                        type="text"
                        value={profile.allergies}
                        onChange={(e) => setProfile({ ...profile, allergies: e.target.value })}
                        placeholder="Specify any identified allergens"
                        className="input-medical"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3 ml-1">
                        Chronic Medical Conditions
                      </label>
                      <input
                        type="text"
                        value={profile.chronicConditions}
                        onChange={(e) => setProfile({ ...profile, chronicConditions: e.target.value })}
                        placeholder="List diagnosed ongoing conditions"
                        className="input-medical"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={saving}
                      className="btn-primary px-12 py-4 shadow-teal-500/10"
                    >
                      {saving ? (
                        <div className="flex items-center gap-3">
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.162 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing Sync...
                        </div>
                      ) : (
                        "Update Health Profile"
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* ─── TAB 1: My Appointments ─────────────────────────── */}
            {activeTab === 1 && (
              <div className="space-y-8">
                {apptLoading ? (
                  <div className="flex justify-center py-20">
                    <svg className="animate-spin h-10 w-10 text-teal-600" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.162 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                ) : appointments.length === 0 ? (
                  <div className="text-center py-24 bg-slate-50/50 rounded-[32px] border border-dashed border-slate-200">
                    <p className="text-slate-400 font-bold text-lg mb-6 tracking-tight">No Active Consultations Scheduled</p>
                    <button
                      onClick={() => navigate("/doctors")}
                      className="btn-primary px-8"
                    >
                      Connect with Specialists
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {appointments.map((appt) => (
                      <div
                        key={appt.id}
                        className="group bg-white rounded-[32px] border border-slate-100 p-6 flex items-center justify-between hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300"
                      >
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors duration-300">
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-lg tracking-tight">
                              {appt.doctorName || "Specialist"}
                            </p>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                              {formatDate(appt.date)} — {appt.time}
                            </p>
                            {appt.doctorSpecialty && (
                              <div className="mt-3 inline-flex px-3 py-1 bg-slate-50 text-slate-500 rounded-full text-[10px] font-bold uppercase tracking-wider group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors">
                                {appt.doctorSpecialty}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className={`w-3 h-3 rounded-full ${appt.status === "confirmed" ? "bg-teal-500 shadow-[0_0_12px_rgba(20,184,166,0.5)]" : "bg-slate-300"}`}></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ─── TAB 2: My Reports ──────────────────────────────── */}
            {activeTab === 2 && (
              <div className="space-y-8">
                {reportsLoading ? (
                  <div className="flex justify-center py-20">
                    <svg className="animate-spin h-10 w-10 text-teal-600" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.162 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                ) : reports.length === 0 ? (
                  <div className="text-center py-24 bg-slate-50/50 rounded-[32px] border border-dashed border-slate-200">
                    <p className="text-slate-400 font-bold text-lg mb-6 tracking-tight">No Clinical Documentation Found</p>
                    <button
                      onClick={() => navigate("/upload-report")}
                      className="btn-primary px-8"
                    >
                      Initialize Analysis
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {reports.map((report) => (
                      <div
                        key={report.id}
                        className="bg-white rounded-[32px] border border-slate-100 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-slate-200/50"
                      >
                        <button
                          onClick={() => setExpandedReportId(expandedReportId === report.id ? null : report.id)}
                          className="w-full px-8 py-6 flex items-center justify-between text-left group"
                        >
                          <div className="flex items-center gap-6">
                            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-teal-50 group-hover:text-teal-600 transition-all duration-300">
                              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 text-lg tracking-tight">
                                {report.recommended_specialist || "Clinical Summary"}
                              </p>
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                                Analysis Generated: {formatDate(report.createdAt)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-5">
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${getUrgencyStyle(report.urgency)}`}>
                              {report.urgency || "routine"}
                            </span>
                            <svg className={`w-6 h-6 text-slate-300 transition-transform duration-500 ${expandedReportId === report.id ? "rotate-180 text-teal-600" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </button>

                        {expandedReportId === report.id && (
                          <div className="px-8 pb-8 pt-2 border-t border-slate-50 animate-in slide-in-from-top-4 duration-500">
                            <div className="bg-slate-50 rounded-[24px] p-6 mt-4">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Executive Summary</label>
                              <p className="text-slate-600 font-medium leading-relaxed">
                                {report.summary || "Summary data processing in progress."}
                              </p>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                              <div className="bg-teal-50/30 rounded-[24px] p-6 border border-teal-50">
                                <label className="text-[10px] font-bold text-teal-600 uppercase tracking-widest block mb-3">Normative Findings</label>
                                {report.normal_values?.length > 0 ? (
                                  <ul className="space-y-2">
                                    {report.normal_values.map((v, i) => (
                                      <li key={i} className="text-xs text-slate-600 font-bold flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-teal-400"></div> {v}
                                      </li>
                                    ))}
                                  </ul>
                                ) : <p className="text-xs text-slate-300 font-bold italic">No findings reported</p>}
                              </div>
                              <div className="bg-red-50/30 rounded-[24px] p-6 border border-red-50">
                                <label className="text-[10px] font-bold text-red-600 uppercase tracking-widest block mb-3">Clinical Deviations</label>
                                {report.abnormal_values?.length > 0 ? (
                                  <ul className="space-y-2">
                                    {report.abnormal_values.map((v, i) => (
                                      <li key={i} className="text-xs text-slate-600 font-bold flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div> {v}
                                      </li>
                                    ))}
                                  </ul>
                                ) : <p className="text-xs text-slate-300 font-bold italic">No deviations reported</p>}
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-4 mt-8 pt-4">
                              <button
                                onClick={() => navigate("/report-result", { state: { result: report } })}
                                className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
                              >
                                View Detailed Analysis
                              </button>
                              {report.recommended_specialist && (
                                <button
                                  onClick={() => navigate(`/doctors?specialty=${encodeURIComponent(report.recommended_specialist)}`)}
                                  className="px-8 py-3 bg-white border border-teal-600 text-teal-600 rounded-2xl font-bold text-sm hover:bg-teal-50 transition-all"
                                >
                                  Consult {report.recommended_specialist}
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
