import React, { useState, useRef } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import DoctorCard from "../components/patient/DoctorCard";
import { useTranslation } from "react-i18next";

export default function Home() {
  const { t } = useTranslation();
  const [symptoms, setSymptoms] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [fallbackWarning, setFallbackWarning] = useState("");
  const textareaRef = useRef(null);

  const { currentUser } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!symptoms.trim()) return;
    setLoading(true);
    setFallbackWarning("");
    setResult(null);
    try {
      let token = "";
      if (currentUser) token = await currentUser.getIdToken();
      const response = await axios.post(
        `${API_URL}/ai/analyze-symptoms`,
        { symptoms },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = response.data;
      if (data.fallback) {
        setFallbackWarning(data.message || "Please describe your symptoms in more detail.");
        setTimeout(() => textareaRef.current?.focus(), 100);
      } else {
        setResult(data);
      }
    } catch (error) {
      console.error("Error analyzing symptoms:", error);
      setFallbackWarning("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyBadge = (urgency) => {
    const map = {
      routine: "bg-emerald-100 text-emerald-700 border-emerald-200",
      soon: "bg-amber-100 text-amber-700 border-amber-200",
      urgent: "bg-red-100 text-red-700 border-red-200",
    };
    const style = map[urgency?.toLowerCase()] || map.routine;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${style}`}>
        {urgency || "Routine"}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-20">
      {/* Hero */}
      <div className="bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 pt-16 pb-32 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-teal-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4"></div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/15 rounded-full text-emerald-100 text-sm font-medium mb-6 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
            Powered by Gemini AI
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4 drop-shadow-md leading-tight">
            {t("heroTitlePart1")}<br />
            <span className="text-emerald-200">{t("heroTitlePart2")}</span>
          </h1>
          <p className="text-emerald-100 text-lg max-w-xl mx-auto">
            {t("heroSubtitle")}
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-24">
        {/* Input Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100 relative z-10">
          <form onSubmit={handleSubmit} className="flex flex-col items-center">
            <textarea
              ref={textareaRef}
              disabled={loading}
              className="w-full min-h-[150px] p-5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-400 transition-all text-lg resize-none placeholder-gray-400"
              placeholder={t("symptomPlaceholder")}
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
            ></textarea>

            <button
              type="submit"
              disabled={loading || !symptoms.trim()}
              className="mt-5 px-10 py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white font-bold rounded-xl text-lg transition-all shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-200 hover:-translate-y-0.5 disabled:shadow-none flex items-center gap-3 w-full sm:w-auto justify-center"
            >
              {loading && (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {loading ? t("loading") : `🔍 ${t("findDoctor")}`}
            </button>
          </form>

          {/* Fallback */}
          {fallbackWarning && (
            <div className="mt-6 bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-xl">
              <p className="text-sm text-amber-700 font-medium">{fallbackWarning}</p>
            </div>
          )}
        </div>

        {/* Results */}
        {result && !loading && (
          <div className="mt-10 space-y-6">
            {/* AI Result */}
            <div className="bg-white p-6 rounded-2xl shadow-md border border-emerald-100 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-emerald-500 to-teal-500 rounded-l-2xl"></div>
              <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1 ml-4">{t("analysisTitle")}</p>
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 mb-3 ml-4">
                <span className="text-2xl font-bold text-gray-900">{result.specialist}</span>
                {getUrgencyBadge(result.urgency)}
              </div>
              <p className="text-gray-600 text-base bg-gray-50 p-4 rounded-xl border border-gray-100 ml-4">
                {result.reason}
              </p>
            </div>

            {/* Doctors */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                Available Specialists
                <span className="bg-emerald-100 text-emerald-700 py-0.5 px-2.5 rounded-full text-sm">{result.doctors?.length || 0}</span>
              </h3>
              <div className="space-y-3">
                {result.doctors && result.doctors.length > 0 ? (
                  result.doctors.map((doc) => <DoctorCard key={doc.id} doctor={doc} />)
                ) : (
                  <div className="text-center py-10 bg-white rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-gray-400 text-lg">{t("noResults")}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
