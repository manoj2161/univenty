import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchMyBookmarks, toggleBookmark } from "../api/reviewApi";
import { Calendar, MapPin, Bookmark, ArrowLeft } from "lucide-react";

export default function BookmarkedEvents() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    fetchMyBookmarks()
      .then((res) => {
        if (res.success) setBookmarks(res.bookmarks || []);
        else setError(res.message || "Failed to load bookmarks");
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleRemoveBookmark = async (eventId) => {
    try {
      await toggleBookmark(eventId);
      setBookmarks((prev) => prev.filter((e) => e._id !== eventId));
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="py-12 bg-canvas min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        <Link
          to="/student/dashboard"
          className="inline-flex items-center gap-2 text-stone-500 hover:text-olive-700 text-sm font-semibold mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <h1 className="text-3xl sm:text-4xl font-bold font-heading text-stone-900 mb-2">
          Bookmarked Events
        </h1>
        <p className="text-sm text-stone-500 mb-8">Events you've saved for later.</p>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm mb-6">{error}</div>
        )}

        {loading ? (
          <div className="text-center py-20 text-stone-500">Loading bookmarks...</div>
        ) : bookmarks.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-olive-200">
            <Bookmark className="w-12 h-12 text-olive-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold font-heading text-stone-900 mb-2">No Bookmarks Yet</h3>
            <p className="text-sm text-stone-500 max-w-sm mx-auto mb-6">
              Save events you're interested in by clicking the bookmark icon on any event.
            </p>
            <Link
              to="/events"
              className="inline-flex px-6 py-3 rounded-full bg-olive-600 hover:bg-olive-700 text-white font-semibold text-sm shadow-soft transition-all"
            >
              Browse Events
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookmarks.map((event) => (
              <div
                key={event._id}
                className="bg-white rounded-2xl border border-olive-100 shadow-soft hover:shadow-md transition-shadow overflow-hidden"
              >
                {event.imageUrl && (
                  <img
                    src={event.imageUrl}
                    alt={event.name}
                    className="w-full h-40 object-cover"
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                )}
                <div className="p-5">
                  <span className="inline-block text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-olive-100 text-olive-700 mb-2">
                    {event.category}
                  </span>
                  <h3 className="font-heading font-bold text-stone-900 text-lg mb-2 line-clamp-2">{event.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(event.eventDate).toLocaleDateString()} at {event.eventTime}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-4">
                    <MapPin className="w-3.5 h-3.5" />
                    {event.eventLocation}
                  </div>
                  <div className="flex gap-2">
                    <Link
                      to={`/events/${event._id}`}
                      className="flex-1 text-center px-4 py-2 rounded-xl bg-olive-600 hover:bg-olive-700 text-white text-sm font-semibold transition-all"
                    >
                      View Event
                    </Link>
                    <button
                      onClick={() => handleRemoveBookmark(event._id)}
                      className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-red-50 hover:text-red-600 text-stone-600 text-sm transition-all"
                      title="Remove bookmark"
                    >
                      <Bookmark className="w-4 h-4 fill-current" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
