import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";

export default function Navbar() {
  const { currentUser, userRole, logout } = useAuth();
  const { t, i18n } = useTranslation();
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

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "ur" : "en";
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === "ur" ? "rtl" : "ltr";
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
                <Link to="/" className={linkClass("/")}>{t("home") || "Home"}</Link>
                <Link to="/doctors" className={linkClass("/doctors")}>{t("findDoctor")}</Link>
              </>
            )}
            {currentUser && isPatient && (
              <>
                <Link to="/profile" className={linkClass("/profile")}>{t("myProfile")}</Link>
                <Link to="/upload-report" className={linkClass("/upload-report")}>{t("uploadReport")}</Link>
              </>
            )}
            {currentUser && isDoctor && (
              <Link to="/dashboard" className={linkClass("/dashboard")}>{t("dashboard")}</Link>
            )}

            <div className="h-6 w-px bg-emerald-400/40 mx-2"></div>

            {/* Lang Toggle */}
            <button
              onClick={toggleLanguage}
              className="px-2 py-1 rounded text-xs font-bold bg-white/20 text-white hover:bg-white/30 transition-colors uppercase mr-2"
            >
              {i18n.language === "en" ? "اردو" : "EN"}
            </button>

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
                  {t("logout")}
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
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleLanguage}
              className="px-2 py-1 rounded text-xs font-bold bg-white/20 text-white"
            >
              {i18n.language === "en" ? "اردو" : "EN"}
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
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
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-emerald-500/30 bg-emerald-800/95 backdrop-blur-md pb-4 px-4 space-y-1 pt-3">
          {(!currentUser || isPatient) && (
            <>
              <Link to="/" className="block px-3 py-2.5 rounded-lg text-white hover:bg-white/10" onClick={() => setMobileOpen(false)}>{t("home") || "Home"}</Link>
              <Link to="/doctors" className="block px-3 py-2.5 rounded-lg text-white hover:bg-white/10" onClick={() => setMobileOpen(false)}>{t("findDoctor")}</Link>
            </>
          )}
          {currentUser && isPatient && (
            <>
              <Link to="/profile" className="block px-3 py-2.5 rounded-lg text-white hover:bg-white/10" onClick={() => setMobileOpen(false)}>{t("myProfile")}</Link>
              <Link to="/upload-report" className="block px-3 py-2.5 rounded-lg text-white hover:bg-white/10" onClick={() => setMobileOpen(false)}>{t("uploadReport")}</Link>
            </>
          )}
          {currentUser && isDoctor && (
            <Link to="/dashboard" className="block px-3 py-2.5 rounded-lg text-white hover:bg-white/10" onClick={() => setMobileOpen(false)}>{t("dashboard")}</Link>
          )}
          <div className="border-t border-emerald-500/30 pt-3 mt-3">
            {currentUser ? (
              <div className="flex items-center justify-between">
                <span className="text-emerald-200 text-sm truncate">{currentUser.email}</span>
                <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="px-3 py-1.5 rounded-lg text-sm font-medium bg-red-500/80 text-white">{t("logout")}</button>
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
