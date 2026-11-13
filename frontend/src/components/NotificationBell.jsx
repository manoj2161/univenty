import React, { useState, useEffect, useRef } from "react";
import { Bell, X, Check, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { fetchNotifications, markNotificationRead, markAllRead, deleteNotification } from "../api/notificationApi";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetchNotifications();
      if (res.success) {
        setNotifications(res.notifications || []);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (e) {
      console.error("Failed to fetch notifications", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (e) {}
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (e) {}
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      const deleted = notifications.find((n) => n._id === id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      if (deleted && !deleted.read) setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (e) {}
  };

  const typeColors = {
    registration: "bg-olive-100 text-olive-700",
    event: "bg-blue-100 text-blue-700",
    announcement: "bg-amber-100 text-amber-700",
    system: "bg-stone-100 text-stone-600",
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => { setOpen(!open); if (!open) loadNotifications(); }}
        className="relative flex items-center justify-center w-9 h-9 rounded-full bg-stone-50 hover:bg-olive-50 border border-stone-200 hover:border-olive-200 text-stone-600 hover:text-olive-700 transition-all"
        title="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white rounded-2xl border border-olive-100 shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100 bg-olive-50/40">
            <h3 className="text-sm font-bold text-stone-800">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-olive-600 hover:text-olive-800 font-semibold flex items-center gap-1"
                >
                  <Check className="w-3 h-3" /> Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-stone-50">
            {loading && notifications.length === 0 ? (
              <div className="py-8 text-center text-stone-400 text-sm">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="py-8 text-center">
                <Bell className="w-8 h-8 text-stone-200 mx-auto mb-2" />
                <p className="text-stone-400 text-sm">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  className={`flex items-start gap-3 px-4 py-3 hover:bg-stone-50 transition-colors ${
                    !n.read ? "bg-olive-50/30" : ""
                  }`}
                >
                  <span
                    className={`mt-0.5 flex-shrink-0 w-2 h-2 rounded-full ${
                      !n.read ? "bg-olive-500" : "bg-stone-200"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-stone-800 leading-snug">{n.title}</span>
                      <button
                        onClick={() => handleDelete(n._id)}
                        className="flex-shrink-0 text-stone-300 hover:text-red-400 transition-colors mt-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">{n.message}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${typeColors[n.type] || typeColors.system}`}>
                        {n.type}
                      </span>
                      <span className="text-[10px] text-stone-400">
                        {new Date(n.createdAt).toLocaleDateString()}
                      </span>
                      {!n.read && (
                        <button
                          onClick={() => handleMarkRead(n._id)}
                          className="text-[10px] text-olive-600 hover:underline font-semibold"
                        >
                          Mark read
                        </button>
                      )}
                      {n.link && (
                        <Link
                          to={n.link}
                          onClick={() => { handleMarkRead(n._id); setOpen(false); }}
                          className="text-[10px] text-olive-600 hover:underline font-semibold flex items-center gap-0.5"
                        >
                          View <ExternalLink className="w-2.5 h-2.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
