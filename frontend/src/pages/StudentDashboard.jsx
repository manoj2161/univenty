import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchMyRegistrations } from "../api/registrationApi";
import { fetchEvents } from "../api/eventApi";
import { Calendar, CheckCircle2, Clock, MapPin, ArrowRight } from "lucide-react";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [recommendedEvents, setRecommendedEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [regRes, eventRes] = await Promise.all([
          fetchMyRegistrations().catch(() => ({ success: false, registrations: [] })),
          fetchEvents().catch(() => ({ success: false, events: [] })),
        ]);

        if (regRes.success) setRegistrations(regRes.registrations || []);
        if (eventRes.success) setRecommendedEvents((eventRes.events || []).slice(0, 3));
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const pendingCount = registrations.filter((r) => r.status === "Pending").length;
  const approvedCount = registrations.filter((r) => r.status === "Approved").length;

  return (
    <div className="py-12 bg-canvas min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        {/* Welcome Header */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-10">
          <div>
            <div className="text-xs font-bold text-olive-700 tracking-wider uppercase mb-1">
              Student Workspace
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold font-heading text-stone-900">
              Welcome back, {user?.name}
            </h1>
            <p className="text-sm text-stone-500 mt-1">
              {user?.department || "University Campus"} &bull; ID: {user?.rollNumber || "Not set"}
            </p>
          </div>
          <Link
            to="/events"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-olive-600 hover:bg-olive-700 text-white font-semibold text-sm shadow-soft hover:shadow-soft-hover transition-all"
          >
            <span>Explore Events</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-2xl border border-olive-100 shadow-soft">
            <div className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
              Total Registrations
            </div>
            <div className="font-heading text-4xl font-bold text-stone-900">
              {registrations.length}
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-olive-100 shadow-soft">
            <div className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
              Approved Passes
            </div>
            <div className="font-heading text-4xl font-bold text-olive-700">{approvedCount}</div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-olive-100 shadow-soft">
            <div className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
              Pending Review
            </div>
            <div className="font-heading text-4xl font-bold text-gold-600">{pendingCount}</div>
          </div>
        </div>

        {/* Recent Registrations */}
        <div className="mb-14">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold font-heading text-stone-900">My Registrations</h2>
            <Link
              to="/student/registrations"
              className="text-xs font-bold text-olive-700 hover:underline uppercase tracking-wider"
            >
              View All &rarr;
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12 text-stone-500 font-medium">
              Loading registrations...
            </div>
          ) : registrations.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-olive-200 p-6">
              <p className="text-sm text-stone-500 mb-4">You have not registered for any events yet.</p>
              <Link
                to="/events"
                className="inline-flex px-4 py-2 rounded-full bg-olive-50 border border-olive-200 text-olive-800 text-xs font-bold hover:bg-olive-100 transition-all"
              >
                Discover Events
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-olive-100 shadow-soft overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-olive-50/60 border-b border-olive-100 text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                      <th className="py-4 px-6">Event</th>
                      <th className="py-4 px-6">Date & Schedule</th>
                      <th className="py-4 px-6">Location</th>
                      <th className="py-4 px-6">Registered On</th>
                      <th className="py-4 px-6">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-sm">
                    {registrations.slice(0, 5).map((reg) => {
                      const event = reg.event;
                      return (
                        <tr key={reg._id} className="hover:bg-olive-50/30 transition-colors">
                          <td className="py-4 px-6 font-semibold text-stone-900">
                            {event ? (
                              <Link to={`/events/${event._id}`} className="hover:text-olive-700">
                                {event.name}
                              </Link>
                            ) : (
                              <span className="text-stone-400">Event removed</span>
                            )}
                          </td>
                          <td className="py-4 px-6 text-stone-600">
                            {event
                              ? `${new Date(event.eventDate).toLocaleDateString()} at ${event.eventTime}`
                              : "-"}
                          </td>
                          <td className="py-4 px-6 text-stone-600">{event?.eventLocation || "-"}</td>
                          <td className="py-4 px-6 text-stone-500">
                            {new Date(reg.registeredAt).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-6">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                                reg.status === "Approved"
                                  ? "bg-green-100 text-green-800"
                                  : reg.status === "Pending"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {reg.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Recommended Events */}
        {recommendedEvents.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold font-heading text-stone-900 mb-6">
              Events You Might Like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedEvents.map((evt) => (
                <div
                  key={evt._id}
                  className="bg-white p-6 rounded-2xl border border-olive-100 shadow-soft hover:shadow-soft-hover transition-all flex flex-col justify-between"
                >
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-olive-100 text-olive-800 text-[11px] font-bold uppercase tracking-wider mb-3">
                      {evt.category}
                    </span>
                    <h3 className="text-lg font-bold font-heading text-stone-900 line-clamp-1 mb-2">
                      <Link to={`/events/${evt._id}`} className="hover:text-olive-700">
                        {evt.name}
                      </Link>
                    </h3>
                    <p className="text-xs text-stone-500 mb-4">
                      {new Date(evt.eventDate).toLocaleDateString()} &bull; {evt.eventLocation}
                    </p>
                  </div>
                  <Link
                    to={`/events/${evt._id}`}
                    className="block text-center py-2 px-4 rounded-xl bg-canvas hover:bg-olive-50 border border-stone-200 hover:border-olive-300 text-stone-800 text-xs font-bold transition-all"
                  >
                    View & Register
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
