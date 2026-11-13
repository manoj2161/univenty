import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchOrganiserEvents, deleteEventById } from "../api/eventApi";
import { PlusCircle, Calendar, Users, Trash2 } from "lucide-react";

export default function OrganiserDashboard() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({
    totalEvents: 0,
    approvedEvents: 0,
    pendingEvents: 0,
    rejectedEvents: 0,
    totalRegistrations: 0,
    pendingRegistrations: 0,
    approvedRegistrations: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchOrganiserEvents();
      if (data.success) {
        setEvents(data.events || []);
        if (data.stats) {
          setStats(data.stats);
        }
      } else {
        setError(data.message || "Failed to load dashboard");
      }
    } catch (err) {
      setError(err.message || "Could not retrieve organiser data");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, eventName) => {
    if (!window.confirm(`Are you sure you want to delete "${eventName}"?`)) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await deleteEventById(id);
      if (res.success) {
        setEvents((prev) => prev.filter((e) => e._id !== id));
        loadDashboard();
      } else {
        alert(res.message || "Failed to delete event");
      }
    } catch (err) {
      alert(err.message || "Cannot delete event");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="py-12 bg-canvas min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        {/* Welcome Header */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-10">
          <div>
            <div className="text-xs font-bold text-olive-700 tracking-wider uppercase mb-1">
              Organiser Workspace
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold font-heading text-stone-900">
              {user?.name || "Organiser"} Dashboard
            </h1>
            <p className="text-sm text-stone-500 mt-1">
              Manage your hosted events, check admin approvals, and review student attendance requests.
            </p>
          </div>

          <Link
            to="/organiser/create-event"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-olive-600 hover:bg-olive-700 text-white font-semibold text-sm shadow-soft hover:shadow-soft-hover transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Event</span>
          </Link>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm mb-8">
            {error}
          </div>
        )}

        {/* Statistical Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5 mb-12">
          <div className="bg-white p-5 rounded-2xl border border-olive-100 shadow-soft">
            <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
              Total Events
            </div>
            <div className="font-heading text-3xl font-bold text-stone-900">{stats.totalEvents}</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-olive-100 shadow-soft">
            <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
              Approved Live
            </div>
            <div className="font-heading text-3xl font-bold text-olive-700">{stats.approvedEvents}</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-olive-100 shadow-soft">
            <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
              Pending Review
            </div>
            <div className="font-heading text-3xl font-bold text-amber-600">{stats.pendingEvents}</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-olive-100 shadow-soft">
            <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
              Registrations
            </div>
            <div className="font-heading text-3xl font-bold text-stone-900">{stats.totalRegistrations}</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-olive-100 shadow-soft col-span-2 sm:col-span-1">
            <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
              Requests To Review
            </div>
            <div className="font-heading text-3xl font-bold text-olive-700">{stats.pendingRegistrations}</div>
          </div>
        </div>

        {/* Events Table */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold font-heading text-stone-900">My Hosted Events</h2>
            <span className="text-xs text-stone-500 font-medium">
              {events.length} event{events.length === 1 ? "" : "s"} found
            </span>
          </div>

          {loading ? (
            <div className="text-center py-20 text-stone-500 font-medium">
              Loading organiser events...
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-olive-200 p-8 shadow-sm">
              <Calendar className="w-12 h-12 text-olive-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold font-heading text-stone-900 mb-2">No Events Created Yet</h3>
              <p className="text-sm text-stone-500 max-w-sm mx-auto mb-6">
                You haven't posted any campus events. Create your first event and submit it for administrative approval.
              </p>
              <Link
                to="/organiser/create-event"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-olive-600 hover:bg-olive-700 text-white font-semibold text-sm shadow-soft transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create Event</span>
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-olive-100 shadow-soft overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-olive-50/60 border-b border-olive-100 text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                      <th className="py-4 px-6">Event Title</th>
                      <th className="py-4 px-6">Date & Time</th>
                      <th className="py-4 px-6">Location</th>
                      <th className="py-4 px-6">Category</th>
                      <th className="py-4 px-6">Seats (Booked / Total)</th>
                      <th className="py-4 px-6">Approval Status</th>
                      <th className="py-4 px-6">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-sm">
                    {events.map((evt) => {
                      const remaining = Math.max(0, (evt.totalSeats || 0) - (evt.bookedSeats || 0));

                      return (
                        <tr key={evt._id} className="hover:bg-olive-50/30 transition-colors">
                          <td className="py-4 px-6">
                            <div className="font-semibold text-stone-900">{evt.name}</div>
                            <div className="text-xs text-stone-500 mt-0.5">
                              Remaining: {remaining} seats
                            </div>
                          </td>
                          <td className="py-4 px-6 text-stone-600">
                            {new Date(evt.eventDate).toLocaleDateString()} at {evt.eventTime}
                          </td>
                          <td className="py-4 px-6 text-stone-600">{evt.eventLocation}</td>
                          <td className="py-4 px-6">
                            <span className="inline-block px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 text-xs font-semibold">
                              {evt.category}
                            </span>
                          </td>
                          <td className="py-4 px-6 font-semibold text-stone-900">
                            {evt.bookedSeats || 0} / {evt.totalSeats}
                          </td>
                          <td className="py-4 px-6">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                                evt.status === "Approved"
                                  ? "bg-green-100 text-green-800"
                                  : evt.status === "Pending"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {evt.status}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <Link
                                to={`/organiser/event/${evt._id}/registrations`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-olive-50 hover:bg-olive-100 text-olive-800 text-xs font-bold transition-all"
                              >
                                <Users className="w-3.5 h-3.5" />
                                <span>Requests</span>
                              </Link>
                              <button
                                onClick={() => handleDelete(evt._id, evt.name)}
                                disabled={deletingId === evt._id}
                                className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-all disabled:opacity-50"
                                title="Delete Event"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
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
      </div>
    </div>
  );
}
