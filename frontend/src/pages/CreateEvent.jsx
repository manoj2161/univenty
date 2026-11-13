import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createNewEvent } from "../api/eventApi";
import { ArrowLeft, CheckCircle, Plus, Trash2 } from "lucide-react";

export default function CreateEvent() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    eventDate: "",
    eventTime: "",
    eventLocation: "",
    totalSeats: 100,
    category: "Technical",
    departments: ["Computer Science & Engineering"],
    imageUrl: "/tech.png",
    isTeamEvent: false,
    teamSize: { min: 2, max: 4 },
    hasWaitlist: true,
    customFields: [],
  });

  const [customFieldInput, setCustomFieldInput] = useState({
    label: "",
    type: "text",
    required: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const categories = [
    "Technical",
    "Cultural",
    "Sports",
    "Workshop",
    "Hackathon",
    "Conference",
    "Social & Community",
    "Exhibition",
  ];

  const availableDepartments = [
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

  const presetImages = [
    { label: "Technical & Coding", path: "/tech.png" },
    { label: "Cultural Fest", path: "/fest.png" },
    { label: "Campus Life", path: "/campus.png" },
    { label: "Sports & Football", path: "/football.png" },
    { label: "Creative & Graphic", path: "/graphic.png" },
    { label: "College Main Hall", path: "/collegeimg2.png" },
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDeptToggle = (dept) => {
    setFormData((prev) => {
      const exists = prev.departments.includes(dept);
      if (exists) {
        return { ...prev, departments: prev.departments.filter((d) => d !== dept) };
      } else {
        return { ...prev, departments: [...prev.departments, dept] };
      }
    });
  };

  const addCustomQuestion = () => {
    if (!customFieldInput.label.trim()) return;
    setFormData({
      ...formData,
      customFields: [...formData.customFields, { ...customFieldInput }],
    });
    setCustomFieldInput({ label: "", type: "text", required: false });
  };

  const removeCustomQuestion = (idx) => {
    setFormData({
      ...formData,
      customFields: formData.customFields.filter((_, i) => i !== idx),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await createNewEvent(formData);
      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate("/organiser/dashboard");
        }, 2000);
      } else {
        setError(res.message || "Failed to create event");
      }
    } catch (err) {
      setError(err.message || "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 bg-canvas min-h-screen">
      <div className="max-w-3xl mx-auto px-6">
        <Link
          to="/organiser/dashboard"
          className="inline-flex items-center gap-2 text-stone-500 hover:text-olive-700 text-sm font-semibold mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Organiser Dashboard</span>
        </Link>

        <h1 className="text-3xl sm:text-4xl font-bold font-heading text-stone-900 mb-2">
          Create New Campus Event
        </h1>
        <p className="text-sm text-stone-500 mb-8">
          Fill in event details. Configure waitlists, team registrations, and custom attendee questionnaires.
        </p>

        {success ? (
          <div className="bg-white p-10 rounded-3xl border border-olive-100 shadow-soft text-center space-y-4">
            <CheckCircle className="w-14 h-14 text-olive-600 mx-auto" />
            <h2 className="text-2xl font-bold font-heading text-stone-900">Event Created!</h2>
            <p className="text-sm text-stone-600 max-w-md mx-auto">
              Your event has been submitted with <strong className="text-amber-600">Pending</strong> status for administrative review. Redirecting to your dashboard...
            </p>
          </div>
        ) : (
          <div className="bg-white p-8 sm:p-10 rounded-3xl border border-olive-100 shadow-soft">
            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase mb-2">
                  Event Title
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-olive-500/20 focus:border-olive-600 shadow-sm transition-all"
                  placeholder="e.g. Annual Inter-College Robotics Challenge"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase mb-2">
                  Description & Agenda
                </label>
                <textarea
                  name="description"
                  required
                  rows={4}
                  className="w-full p-4 rounded-xl border border-stone-200 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-olive-500/20 focus:border-olive-600 shadow-sm transition-all"
                  placeholder="Provide schedule, requirements, eligibility, rules..."
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-stone-600 uppercase mb-2">
                    Event Date
                  </label>
                  <input
                    type="date"
                    name="eventDate"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-olive-500/20 focus:border-olive-600 shadow-sm transition-all"
                    value={formData.eventDate}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-600 uppercase mb-2">
                    Event Time
                  </label>
                  <input
                    type="text"
                    name="eventTime"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-olive-500/20 focus:border-olive-600 shadow-sm transition-all"
                    placeholder="e.g. 10:00 AM - 04:00 PM"
                    value={formData.eventTime}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-600 uppercase mb-2">
                    Venue / Campus Location
                  </label>
                  <input
                    type="text"
                    name="eventLocation"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-olive-500/20 focus:border-olive-600 shadow-sm transition-all"
                    placeholder="e.g. Main Auditorium / Lab B"
                    value={formData.eventLocation}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-600 uppercase mb-2">
                    Seat Capacity
                  </label>
                  <input
                    type="number"
                    name="totalSeats"
                    required
                    min={1}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-olive-500/20 focus:border-olive-600 shadow-sm transition-all"
                    value={formData.totalSeats}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase mb-2">
                  Category
                </label>
                <select
                  name="category"
                  className="w-full px-3 py-3 rounded-xl border border-stone-200 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-olive-500/20 focus:border-olive-600 shadow-sm transition-all bg-white"
                  value={formData.category}
                  onChange={handleChange}
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Feature 4: Advanced Event Options */}
              <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200 space-y-4">
                <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Advanced Registration Settings
                </h4>

                <div className="flex flex-col sm:flex-row gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.hasWaitlist}
                      onChange={(e) => setFormData({ ...formData, hasWaitlist: e.target.checked })}
                      className="w-4 h-4 text-olive-600 rounded border-stone-300 focus:ring-olive-500"
                    />
                    <span className="text-xs font-medium text-stone-800">
                      Enable Automated Waitlist When Full
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isTeamEvent}
                      onChange={(e) => setFormData({ ...formData, isTeamEvent: e.target.checked })}
                      className="w-4 h-4 text-olive-600 rounded border-stone-300 focus:ring-olive-500"
                    />
                    <span className="text-xs font-medium text-stone-800">
                      Team Event
                    </span>
                  </label>
                </div>

                {formData.isTeamEvent && (
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-600 mb-1">Min Team Members</label>
                      <input
                        type="number"
                        min={2}
                        max={10}
                        value={formData.teamSize.min}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            teamSize: { ...formData.teamSize, min: parseInt(e.target.value) || 2 },
                          })
                        }
                        className="w-full p-2.5 rounded-xl border border-stone-200 text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-stone-600 mb-1">Max Team Members</label>
                      <input
                        type="number"
                        min={2}
                        max={10}
                        value={formData.teamSize.max}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            teamSize: { ...formData.teamSize, max: parseInt(e.target.value) || 5 },
                          })
                        }
                        className="w-full p-2.5 rounded-xl border border-stone-200 text-xs bg-white"
                      />
                    </div>
                  </div>
                )}

                {/* Custom registration questions */}
                <div className="pt-3 border-t border-stone-200">
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-2">
                    Custom Registration Questions
                  </label>
                  {formData.customFields.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {formData.customFields.map((q, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-stone-200 text-xs text-stone-700"
                        >
                          <div>
                            <span className="font-semibold">{q.label}</span>
                            <span className="text-stone-400 ml-2">({q.type})</span>
                            {q.required && <span className="text-red-500 ml-1 font-bold">*Required</span>}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeCustomQuestion(idx)}
                            className="text-stone-400 hover:text-red-500"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. GitHub profile or dietary preference"
                      value={customFieldInput.label}
                      onChange={(e) =>
                        setCustomFieldInput({ ...customFieldInput, label: e.target.value })
                      }
                      className="flex-1 px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white"
                    />
                    <select
                      value={customFieldInput.type}
                      onChange={(e) =>
                        setCustomFieldInput({ ...customFieldInput, type: e.target.value })
                      }
                      className="px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white"
                    >
                      <option value="text">Text</option>
                      <option value="textarea">Long Text</option>
                    </select>
                    <button
                      type="button"
                      onClick={addCustomQuestion}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-semibold"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Cover Image Presets */}
              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase mb-3">
                  Select Cover Banner (Theme Assets)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {presetImages.map((img) => (
                    <div
                      key={img.path}
                      onClick={() => setFormData({ ...formData, imageUrl: img.path })}
                      className={`cursor-pointer rounded-xl overflow-hidden border-2 transition-all p-1 ${
                        formData.imageUrl === img.path
                          ? "border-olive-600 bg-olive-50"
                          : "border-stone-200 hover:border-olive-300 bg-white"
                      }`}
                    >
                      <img
                        src={img.path}
                        alt={img.label}
                        className="w-full h-20 object-cover rounded-lg"
                      />
                      <div className="text-[11px] font-bold text-center text-stone-700 py-1.5 truncate">
                        {img.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Target Departments */}
              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase mb-3">
                  Eligible Faculties & Departments
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {availableDepartments.map((dept) => {
                    const checked = formData.departments.includes(dept);
                    return (
                      <label
                        key={dept}
                        className="flex items-center gap-2.5 text-xs text-stone-700 cursor-pointer p-2 rounded-lg hover:bg-stone-50"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleDeptToggle(dept)}
                          className="w-4 h-4 text-olive-600 rounded border-stone-300 focus:ring-olive-500"
                        />
                        <span>{dept}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
                <Link
                  to="/organiser/dashboard"
                  className="px-5 py-3 rounded-xl border border-stone-200 text-stone-700 font-semibold text-sm hover:bg-stone-50 transition-all"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 rounded-xl bg-olive-600 hover:bg-olive-700 text-white font-semibold text-sm shadow-soft hover:shadow-soft-hover transition-all disabled:opacity-50"
                >
                  {loading ? "Submitting Event..." : "Submit Event For Approval"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
