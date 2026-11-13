import React, { useState, useEffect } from "react";
import {
  fetchAdminStats,
  fetchAdminUsers,
  blockAdminUser,
  unblockAdminUser,
  fetchAdminEvents,
  reviewAdminEvent,
  deleteAdminEvent,
  fetchAdminRegistrations,
  reviewAdminRegistration,
  cancelAdminRegistration,
  fetchAdminLogs,
} from "../api/adminApi";
import {
  fetchAnalytics,
  fetchAdminAnnouncements,
  createAnnouncement,
  toggleAnnouncement,
  deleteAnnouncement,
} from "../api/announcementApi";
import {
  Shield,
  Users,
  Calendar,
  ClipboardList,
  Activity,
  CheckCircle,
  XCircle,
  Lock,
  Unlock,
  Trash2,
  BarChart3,
  Megaphone,
  Plus,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Users State
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [userCategory, setUserCategory] = useState("All");

  // Events State
  const [events, setEvents] = useState([]);
  const [eventStatus, setEventStatus] = useState("All");

  // Registrations State
  const [registrations, setRegistrations] = useState([]);

  // Logs State
  const [logs, setLogs] = useState([]);

  // Feature 6: Analytics & Announcements
  const [analytics, setAnalytics] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [annForm, setAnnForm] = useState({ title: "", message: "", type: "info" });
  const [annCreating, setAnnCreating] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    if (activeTab === "users") loadUsers();
    if (activeTab === "events") loadEvents();
    if (activeTab === "registrations") loadRegistrations();
    if (activeTab === "logs") loadLogs();
    if (activeTab === "analytics") loadAnalytics();
    if (activeTab === "announcements") loadAnnouncements();
  }, [activeTab, userCategory, eventStatus]);

  const loadStats = async () => {
    try {
      const res = await fetchAdminStats();
      if (res.success) setStats(res.stats);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingStats(false);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await fetchAdminUsers({ category: userCategory, search: userSearch });
      if (res.success) setUsers(res.users);
    } catch (e) {
      console.error(e);
    }
  };

  const loadEvents = async () => {
    try {
      const res = await fetchAdminEvents({ status: eventStatus });
      if (res.success) setEvents(res.events);
    } catch (e) {
      console.error(e);
    }
  };

  const loadRegistrations = async () => {
    try {
      const res = await fetchAdminRegistrations();
      if (res.success) setRegistrations(res.registrations);
    } catch (e) {
      console.error(e);
    }
  };

  const loadLogs = async () => {
    try {
      const res = await fetchAdminLogs();
      if (res.success) setLogs(res.logs);
    } catch (e) {
      console.error(e);
    }
  };

  const loadAnalytics = async () => {
    try {
      const res = await fetchAnalytics();
      if (res.success) setAnalytics(res.analytics);
    } catch (e) {
      console.error(e);
    }
  };

  const loadAnnouncements = async () => {
    try {
      const res = await fetchAdminAnnouncements();
      if (res.success) setAnnouncements(res.announcements || []);
    } catch (e) {
      console.error(e);
    }
  };

  // User Actions
  const handleToggleBlock = async (user) => {
    const isBlocked = user.accountStatus === "Blocked";
    const confirmMsg = isBlocked
      ? `Unblock user ${user.email}?`
      : `Block user ${user.email}? Their active session will be invalidated immediately.`;

    if (!window.confirm(confirmMsg)) return;

    try {
      if (isBlocked) {
        await unblockAdminUser(user._id);
      } else {
        const reason = window.prompt("Reason for blocking account:", "Platform policy violation");
        await blockAdminUser(user._id, reason || "Administrative action");
      }
      loadUsers();
      loadStats();
    } catch (e) {
      alert(e.message || "Action failed");
    }
  };

  // Event Actions
  const handleReviewEvent = async (id, status) => {
    try {
      await reviewAdminEvent(id, status);
      loadEvents();
      loadStats();
    } catch (e) {
      alert(e.message || "Failed to update event status");
    }
  };

  const handleDeleteEvent = async (id, name) => {
    if (!window.confirm(`Permanently delete event "${name}"?`)) return;
    try {
      await deleteAdminEvent(id);
      loadEvents();
      loadStats();
    } catch (e) {
      alert(e.message || "Failed to delete event");
    }
  };

  // Registration Actions
  const handleReviewReg = async (id, status) => {
    try {
      await reviewAdminRegistration(id, status);
      loadRegistrations();
      loadStats();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleCancelReg = async (id) => {
    if (!window.confirm("Cancel this student registration?")) return;
    try {
      await cancelAdminRegistration(id);
      loadRegistrations();
      loadStats();
    } catch (e) {
      alert(e.message);
    }
  };

  // Announcement Actions
  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    setAnnCreating(true);
    try {
      const res = await createAnnouncement(annForm);
      if (res.success) {
        setAnnForm({ title: "", message: "", type: "info" });
        loadAnnouncements();
      }
    } catch (e) {
      alert(e.message);
    } finally {
      setAnnCreating(false);
    }
  };

  const handleToggleAnn = async (id) => {
    try {
      await toggleAnnouncement(id);
      loadAnnouncements();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleDeleteAnn = async (id) => {
    if (!window.confirm("Delete this banner?")) return;
    try {
      await deleteAnnouncement(id);
      loadAnnouncements();
    } catch (e) {
      alert(e.message);
    }
  };

  const COLORS = ["#4a5e3a", "#c4a35a", "#8c7a6b", "#5a7a8c", "#8c5a6b", "#7a8c5a"];

  return (
    <div className="py-12 bg-canvas min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        {/* Admin Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-olive-700 uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4" />
            <span>Administrative Command</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-heading text-stone-900">
            Platform Management Center
          </h1>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-olive-100 mb-8 overflow-x-auto">
          {[
            { id: "overview", label: "Overview", icon: Shield },
            { id: "analytics", label: "Analytics", icon: BarChart3 },
            { id: "announcements", label: "Announcements", icon: Megaphone },
            { id: "users", label: "Users & Accounts", icon: Users },
            { id: "events", label: "Events & Approvals", icon: Calendar },
            { id: "registrations", label: "Registrations", icon: ClipboardList },
            { id: "logs", label: "Audit Logs", icon: Activity },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                  active
                    ? "border-olive-600 text-olive-700 bg-olive-50/50"
                    : "border-transparent text-stone-500 hover:text-stone-800"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div>
            {loadingStats ? (
              <div className="text-center py-20 text-stone-500 font-medium">Loading statistics...</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-olive-100 shadow-soft">
                  <div className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Total Users</div>
                  <div className="font-heading text-3xl font-bold text-stone-900">{stats?.totalUsers || 0}</div>
                  <div className="text-xs text-stone-500 mt-2">
                    {stats?.totalStudents || 0} Students &bull; {stats?.totalOrganisers || 0} Organisers
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-olive-100 shadow-soft">
                  <div className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Blocked Accounts</div>
                  <div className="font-heading text-3xl font-bold text-red-600">{stats?.blockedAccounts || 0}</div>
                  <div className="text-xs text-stone-500 mt-2">Access restricted</div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-olive-100 shadow-soft">
                  <div className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Total Events</div>
                  <div className="font-heading text-3xl font-bold text-stone-900">{stats?.totalEvents || 0}</div>
                  <div className="text-xs text-olive-700 font-medium mt-2">
                    {stats?.approvedEvents || 0} Approved Live
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-olive-100 shadow-soft">
                  <div className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Pending Events</div>
                  <div className="font-heading text-3xl font-bold text-amber-600">{stats?.pendingEvents || 0}</div>
                  <div className="text-xs text-stone-500 mt-2">Awaiting review</div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-olive-100 shadow-soft">
                  <div className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Registrations</div>
                  <div className="font-heading text-3xl font-bold text-stone-900">{stats?.totalRegistrations || 0}</div>
                  <div className="text-xs text-olive-700 font-medium mt-2">
                    {stats?.pendingRegistrations || 0} Pending
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: ANALYTICS (Feature 6) */}
        {activeTab === "analytics" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Daily Registrations */}
              <div className="bg-white p-6 rounded-2xl border border-olive-100 shadow-soft">
                <h3 className="text-base font-bold font-heading text-stone-900 mb-4">
                  Registrations Over Time (Last 30 Days)
                </h3>
                <div className="h-64">
                  {analytics?.registrationsPerDay?.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.registrationsPerDay}>
                        <XAxis dataKey="_id" stroke="#888888" fontSize={11} />
                        <YAxis stroke="#888888" fontSize={11} allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#4a5e3a" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-stone-400 text-sm">
                      No registrations recorded in the last 30 days
                    </div>
                  )}
                </div>
              </div>

              {/* Event Categories */}
              <div className="bg-white p-6 rounded-2xl border border-olive-100 shadow-soft">
                <h3 className="text-base font-bold font-heading text-stone-900 mb-4">
                  Approved Events By Category
                </h3>
                <div className="h-64 flex items-center justify-center">
                  {analytics?.eventsByCategory?.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analytics.eventsByCategory}
                          dataKey="count"
                          nameKey="_id"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ _id, count }) => `${_id}: ${count}`}
                        >
                          {analytics.eventsByCategory.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-stone-400 text-sm">No event category data available</div>
                  )}
                </div>
              </div>
            </div>

            {/* Top Events */}
            {analytics?.topEvents?.length > 0 && (
              <div className="bg-white p-6 rounded-2xl border border-olive-100 shadow-soft">
                <h3 className="text-base font-bold font-heading text-stone-900 mb-4">
                  Top 5 Most Popular Events
                </h3>
                <div className="space-y-3">
                  {analytics.topEvents.map((evt, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
                      <span className="text-sm font-semibold text-stone-800">{evt.name}</span>
                      <span className="text-xs font-bold text-olive-700 bg-olive-100 px-2.5 py-1 rounded-full">
                        {evt.count} Approved Attendees
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: ANNOUNCEMENTS (Feature 6) */}
        {activeTab === "announcements" && (
          <div className="space-y-8">
            {/* Create Announcement */}
            <div className="bg-white p-6 rounded-2xl border border-olive-100 shadow-soft">
              <h3 className="text-base font-bold font-heading text-stone-900 mb-3">
                Post Platform Announcement Banner
              </h3>
              <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="sm:col-span-3">
                    <input
                      type="text"
                      required
                      placeholder="Announcement Title (e.g., Campus Weather Alert)"
                      value={annForm.title}
                      onChange={(e) => setAnnForm({ ...annForm, title: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-1 focus:ring-olive-500"
                    />
                  </div>
                  <div>
                    <select
                      value={annForm.type}
                      onChange={(e) => setAnnForm({ ...annForm, type: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm bg-white"
                    >
                      <option value="info">Info (Blue)</option>
                      <option value="warning">Warning (Amber)</option>
                      <option value="urgent">Urgent (Red)</option>
                      <option value="success">Success (Green)</option>
                    </select>
                  </div>
                </div>
                <div>
                  <textarea
                    required
                    rows={2}
                    placeholder="Announcement Message shown across all user dashboards and headers..."
                    value={annForm.message}
                    onChange={(e) => setAnnForm({ ...annForm, message: e.target.value })}
                    className="w-full p-4 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-1 focus:ring-olive-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={annCreating}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-olive-600 hover:bg-olive-700 text-white text-sm font-bold shadow-sm transition-all disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  <span>{annCreating ? "Publishing..." : "Broadcast Announcement"}</span>
                </button>
              </form>
            </div>

            {/* List */}
            <div className="bg-white rounded-2xl border border-olive-100 shadow-soft overflow-hidden">
              <div className="p-4 bg-olive-50/50 border-b border-olive-100 font-bold text-sm text-stone-800">
                Active & Past Broadcasts
              </div>
              <div className="divide-y divide-stone-100 text-sm">
                {announcements.length === 0 ? (
                  <div className="py-8 text-center text-stone-400">No announcements posted yet.</div>
                ) : (
                  announcements.map((ann) => (
                    <div key={ann._id} className="p-5 flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-stone-900">{ann.title}</span>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                            {ann.type}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              ann.isActive ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-400"
                            }`}
                          >
                            {ann.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <p className="text-xs text-stone-600">{ann.message}</p>
                        <span className="text-[10px] text-stone-400 block">
                          Posted by {ann.createdBy?.name || "Admin"} on {new Date(ann.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleAnn(ann._id)}
                          className="px-3 py-1.5 rounded-lg border border-stone-200 text-xs font-semibold hover:bg-stone-50"
                        >
                          {ann.isActive ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          onClick={() => handleDeleteAnn(ann._id)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: USERS */}
        {activeTab === "users" && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
              <div className="flex gap-2">
                {["All", "Student", "Organiser", "Admin"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setUserCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                      userCategory === cat
                        ? "bg-olive-600 text-white shadow-sm"
                        : "bg-white text-stone-700 border border-stone-200 hover:bg-stone-50"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <form onSubmit={(e) => { e.preventDefault(); loadUsers(); }} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="px-4 py-2 rounded-xl border border-stone-200 bg-white text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-olive-500/20 focus:border-olive-600 shadow-sm"
                />
                <button type="submit" className="px-4 py-2 rounded-xl bg-olive-600 text-white font-bold text-xs shadow-sm">
                  Search
                </button>
              </form>
            </div>

            <div className="bg-white rounded-2xl border border-olive-100 shadow-soft overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-olive-50/60 border-b border-olive-100 text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                      <th className="py-4 px-6">User</th>
                      <th className="py-4 px-6">Role</th>
                      <th className="py-4 px-6">Department</th>
                      <th className="py-4 px-6">Account Status</th>
                      <th className="py-4 px-6">Joined</th>
                      <th className="py-4 px-6">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-sm">
                    {users.map((u) => {
                      const isBlocked = u.accountStatus === "Blocked";
                      const isAdminUser = u.category === "Admin";

                      return (
                        <tr key={u._id} className="hover:bg-olive-50/30 transition-colors">
                          <td className="py-4 px-6">
                            <div className="font-semibold text-stone-900">{u.name}</div>
                            <div className="text-xs text-stone-500">{u.email}</div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="inline-block px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 text-xs font-semibold">
                              {u.category}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-stone-600">{u.department || "—"}</td>
                          <td className="py-4 px-6">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                                isBlocked ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                              }`}
                            >
                              {u.accountStatus}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-stone-500">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-6">
                            {!isAdminUser && (
                              <button
                                onClick={() => handleToggleBlock(u)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                  isBlocked
                                    ? "bg-green-50 text-green-700 hover:bg-green-100"
                                    : "bg-red-50 text-red-700 hover:bg-red-100"
                                }`}
                              >
                                {isBlocked ? (
                                  <>
                                    <Unlock className="w-3.5 h-3.5" /> Unblock
                                  </>
                                ) : (
                                  <>
                                    <Lock className="w-3.5 h-3.5" /> Block
                                  </>
                                )}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: EVENTS */}
        {activeTab === "events" && (
          <div>
            <div className="flex gap-2 mb-6">
              {["All", "Pending", "Approved", "Rejected"].map((st) => (
                <button
                  key={st}
                  onClick={() => setEventStatus(st)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                    eventStatus === st
                      ? "bg-olive-600 text-white shadow-sm"
                      : "bg-white text-stone-700 border border-stone-200 hover:bg-stone-50"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-olive-100 shadow-soft overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-olive-50/60 border-b border-olive-100 text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                      <th className="py-4 px-6">Event</th>
                      <th className="py-4 px-6">Organiser</th>
                      <th className="py-4 px-6">Date & Location</th>
                      <th className="py-4 px-6">Seats</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6">Review Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-sm">
                    {events.map((evt) => (
                      <tr key={evt._id} className="hover:bg-olive-50/30 transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-semibold text-stone-900">{evt.name}</div>
                          <div className="text-xs text-olive-700 font-semibold">{evt.category}</div>
                        </td>
                        <td className="py-4 px-6">
                          <div>{evt.organiser?.name || "Campus Organiser"}</div>
                          <div className="text-xs text-stone-500">{evt.organiser?.email}</div>
                        </td>
                        <td className="py-4 px-6 text-stone-600">
                          <div>{new Date(evt.eventDate).toLocaleDateString()}</div>
                          <div className="text-xs text-stone-400">{evt.eventLocation}</div>
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
                          <div className="flex items-center gap-1.5">
                            {evt.status !== "Approved" && (
                              <button
                                onClick={() => handleReviewEvent(evt._id, "Approved")}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-olive-600 hover:bg-olive-700 text-white text-xs font-bold transition-all shadow-sm"
                              >
                                <CheckCircle className="w-3.5 h-3.5" /> Approve
                              </button>
                            )}
                            {evt.status !== "Rejected" && (
                              <button
                                onClick={() => handleReviewEvent(evt._id, "Rejected")}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-all"
                              >
                                <XCircle className="w-3.5 h-3.5" /> Reject
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteEvent(evt._id, evt.name)}
                              className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-all"
                              title="Delete Event"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: REGISTRATIONS */}
        {activeTab === "registrations" && (
          <div className="bg-white rounded-2xl border border-olive-100 shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-olive-50/60 border-b border-olive-100 text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                    <th className="py-4 px-6">Student</th>
                    <th className="py-4 px-6">Event</th>
                    <th className="py-4 px-6">Registered At</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-sm">
                  {registrations.map((reg) => (
                    <tr key={reg._id} className="hover:bg-olive-50/30 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-semibold text-stone-900">{reg.student?.name}</div>
                        <div className="text-xs text-stone-500">{reg.student?.email}</div>
                      </td>
                      <td className="py-4 px-6 text-stone-800 font-medium">
                        {reg.event?.name || "Deleted Event"}
                      </td>
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
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          {reg.status !== "Approved" && (
                            <button
                              onClick={() => handleReviewReg(reg._id, "Approved")}
                              className="px-3 py-1.5 rounded-lg bg-olive-600 hover:bg-olive-700 text-white text-xs font-bold transition-all shadow-sm"
                            >
                              Approve
                            </button>
                          )}
                          {reg.status !== "Cancelled" && (
                            <button
                              onClick={() => handleCancelReg(reg._id)}
                              className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition-all"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: LOGS */}
        {activeTab === "logs" && (
          <div className="bg-white rounded-2xl border border-olive-100 shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-olive-50/60 border-b border-olive-100 text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                    <th className="py-4 px-6">Timestamp</th>
                    <th className="py-4 px-6">Action</th>
                    <th className="py-4 px-6">Target</th>
                    <th className="py-4 px-6">Admin User</th>
                    <th className="py-4 px-6">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-sm">
                  {logs.map((log) => (
                    <tr key={log._id} className="hover:bg-olive-50/30 transition-colors">
                      <td className="py-4 px-6 text-xs text-stone-500 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-olive-100 text-olive-800 text-[11px] font-bold uppercase tracking-wider">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-xs text-stone-600 font-semibold">{log.targetType}</td>
                      <td className="py-4 px-6 text-xs text-stone-700 font-medium">
                        {log.admin?.name || log.admin?.email || "Admin"}
                      </td>
                      <td className="py-4 px-6 text-xs text-stone-600">{log.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
