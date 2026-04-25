import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SearchDoctors from "./pages/SearchDoctors";
import DoctorProfile from "./pages/DoctorProfile";
import BookAppointment from "./pages/BookAppointment";
import PatientProfile from "./pages/PatientProfile";
import UploadReport from "./pages/UploadReport";
import ReportSummary from "./pages/ReportSummary";
import DoctorDashboard from "./pages/DoctorDashboard";
import NotFound from "./pages/NotFound";

/**
 * ProtectedRoute – guards routes by auth state and role.
 *  • If not logged in → redirect to /login
 *  • If logged in but wrong role → redirect to /
 */
function ProtectedRoute({ children, allowedRole }) {
  const { currentUser, userRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && userRole?.toLowerCase() !== allowedRole.toLowerCase()) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/doctors" element={<SearchDoctors />} />
      <Route path="/doctors/:id" element={<DoctorProfile />} />
      <Route path="/book/:doctorId" element={<BookAppointment />} />
      <Route path="/report-result" element={<ReportSummary />} />

      {/* Patient-only routes */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute allowedRole="patient">
            <PatientProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/upload-report"
        element={
          <ProtectedRoute allowedRole="patient">
            <UploadReport />
          </ProtectedRoute>
        }
      />

      {/* Doctor-only routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRole="doctor">
            <DoctorDashboard />
          </ProtectedRoute>
        }
      />

      {/* 404 catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
