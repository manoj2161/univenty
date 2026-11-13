import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LogOut, Calendar, PlusCircle, LayoutDashboard, Shield,
  User as UserIcon, Bookmark, Menu, X
} from "lucide-react";
import NotificationBell from "./NotificationBell";

export default function Header() {
  const { user, isAuthenticated, isAdmin, isOrganiser, isStudent, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;
  const closeMenu = () => setMenuOpen(false);

  const navLinkClass = (path) =>
    `flex items-center gap-1.5 text-sm font-semibold transition-colors ${
      isActive(path) ? "text-olive-700" : "text-stone-600 hover:text-olive-700"
    }`;

  return (
    <header className="univenty-header sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-olive-100 shadow-sm transition-all">
      <div className="univenty-header-inner max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" onClick={closeMenu} className="flex items-center gap-3 group shrink-0">
          <div className="w-10 h-10 flex items-center justify-center group-hover:scale-105 transition-transform">
            <img src="/univenty-logo.png" alt="Univenty" className="w-6 h-6 object-contain" />
          </div>
          <span className="font-heading text-2xl font-bold tracking-tight text-stone-900 group-hover:text-olive-700 transition-colors">
            Univenty
          </span>
        </Link>

        <nav className="univenty-desktop-nav flex items-center gap-6">
          {!isAdmin && <Link to="/events" className={navLinkClass("/events")}><Calendar className="w-4 h-4" /><span>Events</span></Link>}

          {isAuthenticated && isStudent && (
            <>
              <Link to="/student/dashboard" className={navLinkClass("/student/dashboard")}><LayoutDashboard className="w-4 h-4" /><span>Dashboard</span></Link>
              <Link to="/student/registrations" className={navLinkClass("/student/registrations")}>My Registrations</Link>
            </>
          )}

          {isAuthenticated && isOrganiser && (
            <>
              <Link to="/organiser/dashboard" className={navLinkClass("/organiser/dashboard")}><LayoutDashboard className="w-4 h-4" /><span>Dashboard</span></Link>
              <Link to="/organiser/create-event" className={navLinkClass("/organiser/create-event")}><PlusCircle className="w-4 h-4" /><span>Create Event</span></Link>
            </>
          )}

          {isAuthenticated && isAdmin && (
            <Link to="/admin/dashboard" className="flex items-center gap-1.5 text-sm font-bold text-olive-700 bg-olive-50 px-3 py-1.5 rounded-full border border-olive-200">
              <Shield className="w-4 h-4 text-olive-600" /><span>Administrator</span>
            </Link>
          )}

          {isAuthenticated ? (
            <div className="flex items-center gap-2 pl-3 border-l border-stone-200">
              {isStudent && <Link to="/student/bookmarks" className="flex items-center justify-center w-9 h-9 rounded-full bg-stone-50 hover:bg-olive-50 border border-stone-200 text-stone-600" title="Bookmarks"><Bookmark className="w-4 h-4" /></Link>}
              <NotificationBell />
              <Link to="/profile" className="flex items-center gap-2 bg-stone-50 border border-stone-200 text-stone-800 text-sm font-medium px-3.5 py-1.5 rounded-full">
                <UserIcon className="w-3.5 h-3.5 text-olive-600" />
                <span>{user?.name?.split(" ")[0] || "Profile"}</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-olive-100 text-olive-800">{user?.category}</span>
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-1 text-sm font-medium text-stone-600 bg-stone-50 border border-stone-200 px-3 py-1.5 rounded-full" title="Logout"><LogOut className="w-3.5 h-3.5" /><span>Logout</span></button>
            </div>
          ) : (
            <div className="flex items-center gap-3 pl-3 border-l border-stone-200">
              <Link to="/login" className="text-sm font-semibold text-stone-700 px-4 py-2 rounded-full border border-stone-200 bg-white">Log in</Link>
              <Link to="/register" className="text-sm font-semibold text-white bg-olive-600 px-4 py-2 rounded-full shadow-sm">Register</Link>
            </div>
          )}
        </nav>

        <button
          type="button"
          className="univenty-mobile-toggle"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={23} /> : <Menu size={23} />}
        </button>
      </div>

      {menuOpen && (
        <nav className="univenty-mobile-nav" aria-label="Mobile navigation">
          {!isAdmin && <Link onClick={closeMenu} to="/events" className={navLinkClass("/events")}><Calendar size={17} />Events</Link>}
          {isAuthenticated && isStudent && <>
            <Link onClick={closeMenu} to="/student/dashboard" className={navLinkClass("/student/dashboard")}><LayoutDashboard size={17} />Dashboard</Link>
            <Link onClick={closeMenu} to="/student/registrations" className={navLinkClass("/student/registrations")}>My Registrations</Link>
            <Link onClick={closeMenu} to="/student/bookmarks" className={navLinkClass("/student/bookmarks")}><Bookmark size={17} />Bookmarks</Link>
          </>}
          {isAuthenticated && isOrganiser && <>
            <Link onClick={closeMenu} to="/organiser/dashboard" className={navLinkClass("/organiser/dashboard")}><LayoutDashboard size={17} />Dashboard</Link>
            <Link onClick={closeMenu} to="/organiser/create-event" className={navLinkClass("/organiser/create-event")}><PlusCircle size={17} />Create Event</Link>
          </>}
          {isAuthenticated && isAdmin && <Link onClick={closeMenu} to="/admin/dashboard" className={navLinkClass("/admin/dashboard")}><Shield size={17} />Administrator</Link>}
          {isAuthenticated ? <>
            <Link onClick={closeMenu} to="/profile" className={navLinkClass("/profile")}><UserIcon size={17} />{user?.name || "Profile"} ({user?.category})</Link>
            <div className="univenty-mobile-account-actions"><NotificationBell /><button onClick={handleLogout} className="univenty-mobile-logout"><LogOut size={16} />Logout</button></div>
          </> : <>
            <Link onClick={closeMenu} to="/login" className={navLinkClass("/login")}>Log in</Link>
            <Link onClick={closeMenu} to="/register" className="univenty-mobile-register">Register</Link>
          </>}
        </nav>
      )}
    </header>
  );
}
