import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
  const { currentUser, userRole, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const hideOn = ["/login", "/register"];
  if (hideOn.includes(location.pathname)) return null;

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (e) {
      console.error(e);
    }
  };

  const isDoctor = userRole?.toLowerCase() === "doctor";
  const isPatient = userRole?.toLowerCase() === "patient";

  const linkClass = (path) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
      location.pathname === path
        ? "bg-white/20 text-white shadow-sm"
        : "text-emerald-100 hover:bg-white/10 hover:text-white"
    }`;

  return (
    <nav className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 shadow-lg sticky top-0 z-50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2.5 shrink-0 group">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
              <span className="text-lg">🩺</span>
            </div>
            <span className="text-white font-extrabold text-lg tracking-tight">
              MediConnect <span className="font-normal text-emerald-200">PK</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center space-x-1">
            {(!currentUser || isPatient) && (
              <>
                <Link to="/" className={linkClass("/")}>Home</Link>
                <Link to="/doctors" className={linkClass("/doctors")}>Find Doctors</Link>
              </>
            )}
            {currentUser && isPatient && (
              <>
                <Link to="/profile" className={linkClass("/profile")}>My Profile</Link>
                <Link to="/upload-report" className={linkClass("/upload-report")}>Upload Report</Link>
              </>
            )}
            {currentUser && isDoctor && (
              <Link to="/dashboard" className={linkClass("/dashboard")}>Dashboard</Link>
            )}

            <div className="h-6 w-px bg-emerald-400/40 mx-2"></div>

            {currentUser ? (
              <div className="flex items-center space-x-3 ml-1">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg">
                  <div className="w-6 h-6 rounded-full bg-emerald-400 flex items-center justify-center text-white text-xs font-bold">
                    {currentUser.email?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-emerald-100 text-sm truncate max-w-[140px]">
                    {currentUser.email}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium bg-white/15 text-white hover:bg-red-500/80 transition-all duration-200"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="ml-2 px-5 py-2 rounded-lg text-sm font-semibold bg-white text-emerald-700 hover:bg-emerald-50 transition-colors shadow-sm"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-emerald-500/30 bg-emerald-800/95 backdrop-blur-md pb-4 px-4 space-y-1 pt-3">
          {(!currentUser || isPatient) && (
            <>
              <Link to="/" className="block px-3 py-2.5 rounded-lg text-white hover:bg-white/10" onClick={() => setMobileOpen(false)}>Home</Link>
              <Link to="/doctors" className="block px-3 py-2.5 rounded-lg text-white hover:bg-white/10" onClick={() => setMobileOpen(false)}>Find Doctors</Link>
            </>
          )}
          {currentUser && isPatient && (
            <>
              <Link to="/profile" className="block px-3 py-2.5 rounded-lg text-white hover:bg-white/10" onClick={() => setMobileOpen(false)}>My Profile</Link>
              <Link to="/upload-report" className="block px-3 py-2.5 rounded-lg text-white hover:bg-white/10" onClick={() => setMobileOpen(false)}>Upload Report</Link>
            </>
          )}
          {currentUser && isDoctor && (
            <Link to="/dashboard" className="block px-3 py-2.5 rounded-lg text-white hover:bg-white/10" onClick={() => setMobileOpen(false)}>Dashboard</Link>
          )}
          <div className="border-t border-emerald-500/30 pt-3 mt-3">
            {currentUser ? (
              <div className="flex items-center justify-between">
                <span className="text-emerald-200 text-sm truncate">{currentUser.email}</span>
                <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="px-3 py-1.5 rounded-lg text-sm font-medium bg-red-500/80 text-white">Logout</button>
              </div>
            ) : (
              <Link to="/login" className="block text-center px-4 py-2.5 rounded-lg font-semibold bg-white text-emerald-700" onClick={() => setMobileOpen(false)}>Login</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
