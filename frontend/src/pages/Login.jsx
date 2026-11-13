import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const from = location.state?.from?.pathname || null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await login(formData.email, formData.password);
      if (res.success && res.user) {
        if (res.user.isAdmin === true || res.user.category === "Admin") {
          navigate("/admin/dashboard");
        } else if (res.user.category === "Organiser") {
          navigate("/organiser/dashboard");
        } else {
          if (from && from.startsWith("/events/")) {
            navigate(from);
          } else {
            navigate("/student/dashboard");
          }
        }
      } else {
        setError(res.message || "Invalid credentials");
      }
    } catch (err) {
      setError(err.message || "Could not log in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-6 bg-canvas">
      <div className="grid grid-cols-1 md:grid-cols-2 max-w-4xl w-full bg-white rounded-3xl border border-olive-100 shadow-soft overflow-hidden">
        {/* Left Form */}
        <div className="p-8 sm:p-12 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-olive-50 border border-olive-200 flex items-center justify-center">
              <img src="/univenty-logo.png" alt="Univenty" className="w-6 h-6 object-contain" />
            </div>
            <span className="font-heading text-2xl font-bold tracking-tight text-stone-900">
              Univenty
            </span>
          </div>

          <h2 className="text-3xl font-bold font-heading text-stone-900 mb-2">Welcome Back</h2>
          <p className="text-sm text-stone-500 mb-8">
            Enter your university credentials to access your dashboard.
          </p>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-stone-600 uppercase mb-2">
                University Email
              </label>
              <input
                type="email"
                name="email"
                required
                className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-olive-500/20 focus:border-olive-600 shadow-sm transition-all"
                placeholder="student@univenty.edu"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-600 uppercase mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                required
                className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-olive-500/20 focus:border-olive-600 shadow-sm transition-all"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-olive-600 hover:bg-olive-700 text-white font-semibold text-sm shadow-soft hover:shadow-soft-hover transition-all disabled:opacity-50 mt-2"
            >
              {loading ? "Authenticating..." : "Sign In"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-stone-100 text-center text-xs text-stone-500">
            Don't have an account yet?{" "}
            <Link to="/register" className="text-olive-700 font-bold hover:underline">
              Register here
            </Link>
          </div>
        </div>

        {/* Right Visual Image */}
        <div className="relative hidden md:block overflow-hidden">
          <img
            src="/loginimg.png"
            alt="Univenty Portal"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/30 to-transparent" />
          <div className="absolute bottom-8 left-8 right-8 text-white space-y-2">
            <h4 className="text-2xl font-bold text-white font-heading">Campus Community</h4>
            <p className="text-xs text-stone-300 leading-relaxed">
              Log in to track event status, review attendee requests, and discover university activities.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
