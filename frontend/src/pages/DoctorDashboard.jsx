import React from "react";
export default function DoctorDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-20">
      <div className="bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 pt-14 pb-28 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">Doctor Dashboard</h1>
          <p className="text-emerald-100 text-lg">Manage your appointments and availability</p>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 -mt-20 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">👨‍⚕️</span>
          </div>
          <p className="text-gray-500 text-lg">Dashboard coming soon...</p>
        </div>
      </div>
    </div>
  );
}
