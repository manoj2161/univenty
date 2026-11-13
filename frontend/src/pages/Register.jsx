import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { CheckCircle } from "lucide-react";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    category: "Student", // Student or Organiser
    department: "Computer Science & Engineering",
    rollNumber: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const departments = [
    "Computer Science & Engineering",
    "Information Technology",
    "Electronics & Communication",
    "Mechanical Engineering",
    "Civil Engineering",
    "Electrical & Electronics",
    "Business Administration & Management",
    "Arts & Humanities",
    "Biotechnology",
    "Design & Media",
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await register(formData);
      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate("/login");
        }, 2200);
      } else {
        setError(res.message || "Registration failed");
      }
    } catch (err) {
      setError(err.message || "Failed to register account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-6 bg-canvas">
      <div className="max-w-xl w-full bg-white rounded-3xl border border-olive-100 shadow-soft p-8 sm:p-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-olive-50 border border-olive-200 flex items-center justify-center">
            <img src="/univenty-logo.png" alt="Univenty" className="w-6 h-6 object-contain" />
          </div>
          <span className="font-heading text-2xl font-bold tracking-tight text-stone-900">
            Univenty
          </span>
        </div>

        <h2 className="text-3xl font-bold font-heading text-stone-900 mb-2">Create an Account</h2>
        <p className="text-sm text-stone-500 mb-8">
          Select your campus role and register to access university events.
        </p>

        {success ? (
          <div className="p-8 rounded-2xl bg-olive-50 border border-olive-200 text-center space-y-3">
            <CheckCircle className="w-12 h-12 text-olive-600 mx-auto" />
            <h3 className="text-xl font-bold text-olive-800">Registration Successful!</h3>
            <p className="text-sm text-stone-600">
              Your account has been created. Redirecting you to login...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                {error}
              </div>
            )}

            {/* Role Selection */}
            <div>
              <label className="block text-xs font-bold text-stone-600 uppercase mb-2">
                I am registering as
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, category: "Student" })}
                  className={`py-3 px-4 rounded-xl text-sm font-bold border transition-all ${
                    formData.category === "Student"
                      ? "bg-olive-600 text-white border-olive-600 shadow-sm"
                      : "bg-white text-stone-700 border-stone-200 hover:bg-stone-50"
                  }`}
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, category: "Organiser" })}
                  className={`py-3 px-4 rounded-xl text-sm font-bold border transition-all ${
                    formData.category === "Organiser"
                      ? "bg-olive-600 text-white border-olive-600 shadow-sm"
                      : "bg-white text-stone-700 border-stone-200 hover:bg-stone-50"
                  }`}
                >
                  Event Organiser
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-600 uppercase mb-2">Full Name</label>
              <input
                type="text"
                name="name"
                required
                className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-olive-500/20 focus:border-olive-600 shadow-sm transition-all"
                placeholder="Alex Johnson"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-600 uppercase mb-2">University Email</label>
              <input
                type="email"
                name="email"
                required
                className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-olive-500/20 focus:border-olive-600 shadow-sm transition-all"
                placeholder="alex.johnson@univenty.edu"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-600 uppercase mb-2">Password</label>
              <input
                type="password"
                name="password"
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-olive-500/20 focus:border-olive-600 shadow-sm transition-all"
                placeholder="Minimum 6 characters"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase mb-2">Department</label>
                <select
                  name="department"
                  className="w-full px-3 py-3 rounded-xl border border-stone-200 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-olive-500/20 focus:border-olive-600 shadow-sm transition-all bg-white"
                  value={formData.department}
                  onChange={handleChange}
                >
                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase mb-2">
                  {formData.category === "Student" ? "Student Roll ID" : "Club / Chapter ID"}
                </label>
                <input
                  type="text"
                  name="rollNumber"
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-olive-500/20 focus:border-olive-600 shadow-sm transition-all"
                  placeholder="CS2026-042"
                  value={formData.rollNumber}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-olive-600 hover:bg-olive-700 text-white font-semibold text-sm shadow-soft hover:shadow-soft-hover transition-all disabled:opacity-50 mt-4"
            >
              {loading ? "Registering..." : `Register as ${formData.category}`}
            </button>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-stone-100 text-center text-xs text-stone-500">
          Already have an account?{" "}
          <Link to="/login" className="text-olive-700 font-bold hover:underline">
            Log in here
          </Link>
        </div>
      </div>
    </div>
  );
}
