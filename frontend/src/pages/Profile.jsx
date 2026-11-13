import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../api/apiClient";
import { Check } from "lucide-react";

export default function Profile() {
  const { user, updateUser } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    department: user?.department || "",
    rollNumber: user?.rollNumber || "",
    bio: user?.bio || "",
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const res = await apiRequest("/profile", {
        method: "PUT",
        body: JSON.stringify(formData),
      });

      if (res.success && res.user) {
        updateUser(res.user);
        setMessage("Profile updated successfully!");
      } else {
        setError(res.message || "Failed to update profile");
      }
    } catch (err) {
      setError(err.message || "Network error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="py-12 bg-canvas min-h-screen">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="text-3xl sm:text-4xl font-bold font-heading text-stone-900 mb-2">
          Account Profile
        </h1>
        <p className="text-sm text-stone-500 mb-8">
          Manage your personal university profile information.
        </p>

        {message && (
          <div className="p-4 rounded-xl bg-olive-50 border border-olive-200 text-olive-800 text-sm flex items-center gap-2 mb-6">
            <Check className="w-4 h-4 text-olive-600" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm mb-6">
            {error}
          </div>
        )}

        <div className="bg-white rounded-3xl border border-olive-100 shadow-soft p-8 sm:p-10 space-y-8">
          <div className="flex items-center gap-5 pb-6 border-b border-stone-100">
            <img
              src="/profile.jpg"
              alt="Profile"
              className="w-16 h-16 rounded-full object-cover border-2 border-olive-600 shadow-sm"
            />
            <div>
              <h3 className="text-xl font-bold font-heading text-stone-900">{user?.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2.5 py-0.5 rounded-full bg-olive-100 text-olive-800 text-xs font-bold uppercase">
                  {user?.category}
                </span>
                <span className="text-xs text-stone-500">{user?.email}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase mb-2">Full Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-olive-500/20 focus:border-olive-600 shadow-sm transition-all"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase mb-2">Phone</label>
                <input
                  type="text"
                  name="phone"
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-olive-500/20 focus:border-olive-600 shadow-sm transition-all"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase mb-2">Department</label>
                <input
                  type="text"
                  name="department"
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-olive-500/20 focus:border-olive-600 shadow-sm transition-all"
                  value={formData.department}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase mb-2">Student Roll ID</label>
                <input
                  type="text"
                  name="rollNumber"
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-olive-500/20 focus:border-olive-600 shadow-sm transition-all"
                  value={formData.rollNumber}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-600 uppercase mb-2">Bio / Societies</label>
              <textarea
                name="bio"
                rows={3}
                className="w-full p-4 rounded-xl border border-stone-200 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-olive-500/20 focus:border-olive-600 shadow-sm transition-all"
                placeholder="Share your interests, club memberships, or societies..."
                value={formData.bio}
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 rounded-xl bg-olive-600 hover:bg-olive-700 text-white font-semibold text-sm shadow-soft hover:shadow-soft-hover transition-all disabled:opacity-50"
            >
              {saving ? "Saving Changes..." : "Save Profile"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
