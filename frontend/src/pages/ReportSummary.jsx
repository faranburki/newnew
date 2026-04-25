import React from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";

export default function ReportSummary() {
  const location = useLocation();
  const navigate = useNavigate();
  const { result } = location.state || {};

  // Redirect if no result
  if (!result) {
    return <Navigate to="/upload-report" replace />;
  }

  const urgencyStyles = {
    routine: {
      bg: "bg-green-500",
      ring: "ring-green-400",
      text: "text-green-700",
      label: "Routine",
      pulse: false,
    },
    soon: {
      bg: "bg-orange-500",
      ring: "ring-orange-400",
      text: "text-orange-700",
      label: "Needs Attention Soon",
      pulse: false,
    },
    urgent: {
      bg: "bg-red-500",
      ring: "ring-red-400",
      text: "text-red-700",
      label: "Urgent",
      pulse: true,
    },
  };

  const urgency =
    urgencyStyles[result.urgency?.toLowerCase()] || urgencyStyles.routine;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pb-20">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 pt-14 pb-28 px-4 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-blue-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-3 drop-shadow-lg">
            📋 Report Analysis
          </h1>
          <p className="text-emerald-200 text-lg">
            Your AI-powered medical report summary is ready
          </p>
        </div>

        {/* Urgency Badge — top right floating */}
        <div className="absolute top-6 right-6 md:top-8 md:right-10 z-20">
          <div className="relative">
            {urgency.pulse && (
              <span
                className={`absolute inset-0 rounded-full ${urgency.bg} opacity-40 animate-ping`}
              ></span>
            )}
            <span
              className={`relative inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-sm font-bold uppercase tracking-wider shadow-lg ${urgency.bg} ring-4 ${urgency.ring}/30`}
            >
              <span className="relative flex h-2.5 w-2.5">
                {urgency.pulse && (
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full ${urgency.bg} opacity-75`}
                  ></span>
                )}
                <span
                  className={`relative inline-flex rounded-full h-2.5 w-2.5 bg-white`}
                ></span>
              </span>
              {urgency.label}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-20 relative z-10 space-y-8">
        {/* 1. Summary Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden">
          <div className="bg-gradient-to-r from-teal-500 to-indigo-500 px-6 py-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-white font-bold text-lg">Report Summary</h2>
          </div>
          <div className="p-6 md:p-8">
            <p className="text-gray-800 text-lg leading-relaxed">
              {result.summary || "No summary available."}
            </p>
          </div>
        </div>

        {/* 2. Normal / Abnormal Two-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Normal Values */}
          <div className="bg-white rounded-2xl shadow-lg border border-green-100 overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="text-white font-bold text-lg">Normal Values</h2>
            </div>
            <div className="p-6">
              {result.normal_values && result.normal_values.length > 0 ? (
                <ul className="space-y-3">
                  {result.normal_values.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </span>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400 italic">No normal values found.</p>
              )}
            </div>
          </div>

          {/* Abnormal Values */}
          <div className="bg-white rounded-2xl shadow-lg border border-red-100 overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-rose-500 px-6 py-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h2 className="text-white font-bold text-lg">Abnormal Values</h2>
            </div>
            <div className="p-6">
              {result.abnormal_values && result.abnormal_values.length > 0 ? (
                <ul className="space-y-3">
                  {result.abnormal_values.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-red-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M12 9v2m0 4h.01"
                          />
                        </svg>
                      </span>
                      <span className="text-gray-700 font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400 italic">
                  No abnormal values detected — great news!
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 3. Recommended Specialist */}
        <div className="bg-gradient-to-r from-indigo-50 via-blue-50 to-indigo-50 border-2 border-emerald-200 rounded-2xl p-6 md:p-8 shadow-lg relative overflow-hidden">
          {/* Decorative accent */}
          <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-indigo-500 to-teal-500 rounded-l-2xl"></div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 ml-4">
            <div>
              <p className="text-sm font-semibold text-emerald-500 uppercase tracking-wider mb-1">
                Recommended Specialist
              </p>
              <h3 className="text-3xl font-extrabold text-gray-900">
                {result.recommended_specialist || "General Physician"}
              </h3>
              <p className="text-gray-500 mt-1 text-sm">
                Based on your report analysis, we recommend consulting this
                specialist
              </p>
            </div>
            <button
              onClick={() =>
                navigate(
                  `/doctors?specialty=${encodeURIComponent(
                    result.recommended_specialist || ""
                  )}`
                )
              }
              className="flex-shrink-0 px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700 text-white font-bold rounded-xl text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              Find This Doctor
            </button>
          </div>
        </div>

        {/* Upload another report button */}
        <div className="text-center pt-4">
          <button
            onClick={() => navigate("/upload-report")}
            className="text-emerald-600 hover:text-emerald-800 font-semibold transition-colors underline underline-offset-4"
          >
            ← Upload Another Report
          </button>
        </div>
      </div>
    </div>
  );
}
