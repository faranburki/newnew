import React, { useState } from "react";
import { useLocation, useNavigate, useParams, Navigate } from "react-router-dom";
import axios from "axios";
import emailjs from "@emailjs/browser";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

export default function BookAppointment() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { doctorId } = useParams();
  const { currentUser } = useAuth();

  const state = location.state || {};
  const { slotId, slotTime, slotDate, doctorName, fee } = state;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmed, setConfirmed] = useState(null); // holds appointmentId on success
  const [emailSent, setEmailSent] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

  // Redirect if no state
  if (!slotId) {
    return <Navigate to="/doctors" replace />;
  }

  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr + "T00:00:00");
      return d.toLocaleDateString("en-PK", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const sendConfirmationEmail = async (appointmentId) => {
    try {
      await emailjs.send(
        process.env.REACT_APP_EMAILJS_SERVICE_ID || "YOUR_SERVICE_ID",
        process.env.REACT_APP_EMAILJS_TEMPLATE_ID || "YOUR_TEMPLATE_ID",
        {
          doctor_name: doctorName,
          appointment_date: slotDate,
          appointment_time: slotTime,
          patient_email: currentUser.email,
          appointment_id: appointmentId,
        },
        process.env.REACT_APP_EMAILJS_PUBLIC_KEY || "YOUR_PUBLIC_KEY"
      );
      setEmailSent(true);
    } catch (emailErr) {
      console.log("Email sending failed (non-blocking):", emailErr);
    }
  };

  const handleConfirm = async () => {
    setLoading(true);
    setError("");

    try {
      const token = await currentUser.getIdToken();
      const res = await axios.post(
        `${API_URL}/appointments/book`,
        {
          doctorId,
          slotId,
          patientId: currentUser.uid,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const apptId = res.data.appointmentId;
      setConfirmed(apptId);

      // Fire-and-forget email — does NOT block the success screen
      sendConfirmationEmail(apptId);
    } catch (err) {
      if (err.response?.status === 409) {
        setError("That slot was just taken — please pick another");
        setTimeout(() => navigate(`/doctors/${doctorId}`), 2000);
      } else {
        setError(
          err.response?.data?.detail || "Booking failed. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // ─── SUCCESS SCREEN ────────────────────────────────────────────
  if (confirmed) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-gray-50 flex items-center justify-center px-4">
        <div className="max-w-lg w-full text-center space-y-6">
          {/* Animated checkmark */}
          <div className="relative mx-auto w-28 h-28">
            <div className="absolute inset-0 rounded-full bg-green-500/20 animate-ping"></div>
            <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-xl">
              <svg
                className="w-14 h-14 text-white"
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
            </div>
          </div>

          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            {t("appointmentConfirmed")}
          </h1>
          <p className="text-gray-500 text-lg">
            Your appointment has been successfully scheduled
          </p>

          {/* Email toast */}
          {emailSent && (
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-100 text-green-700 rounded-full text-sm font-semibold animate-bounce shadow-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Confirmation email sent!
            </div>
          )}

          {/* Details card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 text-left space-y-4 mt-4">
            <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-xl shadow-md">
                {doctorName
                  ?.replace("Dr. ", "")
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase() || "DR"}
              </div>
              <div>
                <p className="font-bold text-gray-900 text-lg">{doctorName}</p>
                <p className="text-sm text-gray-500">Consultation</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                  Date
                </p>
                <p className="text-gray-900 font-medium mt-0.5">
                  {formatDate(slotDate)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                  Time
                </p>
                <p className="text-gray-900 font-medium mt-0.5">{slotTime}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                  Fee
                </p>
                <p className="text-gray-900 font-medium mt-0.5">
                  Rs. {fee || "Free"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                  Appointment ID
                </p>
                <p className="text-emerald-600 font-mono text-sm mt-0.5 truncate">
                  {confirmed}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-center">
            <button
              onClick={() => navigate("/profile")}
              className="px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              {t("goToProfile")}
            </button>
            <button
              onClick={() => navigate("/")}
              className="px-8 py-3.5 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
            >
              {t("backToHome")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── BOOKING FORM SCREEN ───────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 pt-14 pb-28 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-3 drop-shadow-lg">
            {t("confirmBooking")}
          </h1>
          <p className="text-emerald-200 text-lg">
            Review your appointment details before confirming
          </p>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 -mt-20 relative z-10 space-y-6">
        {/* Summary Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Doctor row */}
          <div className="p-6 flex items-center gap-5 border-b border-gray-100">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg flex-shrink-0">
              {doctorName
                ?.replace("Dr. ", "")
                .split(" ")
                .map((w) => w[0])
                .join("")
                .slice(0, 2)
                .toUpperCase() || "DR"}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{doctorName}</h2>
              <p className="text-gray-500 text-sm">Consultation Appointment</p>
            </div>
          </div>

          {/* Details grid */}
          <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center sm:text-left">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-100 mb-3">
                <svg
                  className="w-6 h-6 text-emerald-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                Date
              </p>
              <p className="text-gray-900 font-semibold mt-1">
                {formatDate(slotDate)}
              </p>
            </div>

            <div className="text-center sm:text-left">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100 mb-3">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                Time
              </p>
              <p className="text-gray-900 font-semibold mt-1">{slotTime}</p>
            </div>

            <div className="text-center sm:text-left">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-green-100 mb-3">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                Fee
              </p>
              <p className="text-gray-900 font-semibold mt-1">
                Rs. {fee || "Free"}
              </p>
            </div>
          </div>
        </div>

        {/* Error Toast */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg shadow-sm animate-pulse">
            <div className="flex items-center">
              <svg
                className="h-5 w-5 text-red-500 mr-3 flex-shrink-0"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Confirm Button */}
        <button
          onClick={handleConfirm}
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold text-lg rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:shadow-none disabled:cursor-not-allowed disabled:translate-y-0 flex items-center justify-center gap-3"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.162 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              {t("loading")}
            </>
          ) : (
            <>
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {t("confirmBooking")}
            </>
          )}
        </button>

        {/* Back link */}
        <div className="text-center">
          <button
            onClick={() => navigate(`/doctors/${doctorId}`)}
            className="text-emerald-600 hover:text-emerald-800 font-semibold transition-colors underline underline-offset-4"
          >
            ← {t("backToHome")}
          </button>
        </div>
      </div>
    </div>
  );
}
