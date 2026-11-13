import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchEvents } from "../api/eventApi";
import { Search, Calendar, MapPin, Users, ArrowRight } from "lucide-react";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const categories = [
    "All",
    "Technical",
    "Cultural",
    "Sports",
    "Workshop",
    "Hackathon",
    "Conference",
    "Social & Community",
  ];

  useEffect(() => {
    loadEvents();
  }, [category]);

  const loadEvents = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (category !== "All") params.category = category;
      if (search) params.search = search;

      const data = await fetchEvents(params);
      if (data.success) {
        setEvents(data.events || []);
      } else {
        setError(data.message || "Failed to load events");
      }
    } catch (err) {
      setError(err.message || "Could not connect to event server");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadEvents();
  };

  return (
    <div className="py-12 bg-canvas min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        {/* Title */}
        <div className="mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold font-heading text-stone-900 mb-3">
            Explore Events
          </h1>
          <p className="text-base text-stone-600">
            Discover and participate in approved student-led and faculty events happening across campus.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10 pb-8 border-b border-olive-100">
          {/* Category Chips */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  category === cat
                    ? "bg-olive-600 text-white shadow-sm"
                    : "bg-white text-stone-700 border border-stone-200 hover:border-olive-300 hover:bg-olive-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search form */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full lg:w-80">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Search events..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-white text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-olive-500/20 focus:border-olive-600 shadow-sm transition-all"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-olive-600 hover:bg-olive-700 text-white font-semibold text-sm shadow-sm transition-all"
            >
              Search
            </button>
          </form>
        </div>

        {/* State rendering */}
        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm mb-8">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-stone-500 font-medium">
            Loading university events...
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-olive-200 shadow-sm p-8">
            <Calendar className="w-12 h-12 text-olive-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold font-heading text-stone-900 mb-2">No Events Found</h3>
            <p className="text-sm text-stone-500 max-w-md mx-auto mb-6">
              There are currently no approved events matching your selected criteria.
            </p>
            {category !== "All" && (
              <button
                onClick={() => setCategory("All")}
                className="px-5 py-2.5 rounded-full bg-olive-50 border border-olive-200 text-olive-800 text-sm font-semibold hover:bg-olive-100 transition-all"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => {
              const remaining = Math.max(0, (event.totalSeats || 0) - (event.bookedSeats || 0));
              const eventImg = event.imageUrl || "/tech.png";

              return (
                <div
                  key={event._id}
                  className="bg-white rounded-2xl overflow-hidden border border-olive-100 shadow-soft hover:shadow-soft-hover hover:-translate-y-1 transition-all flex flex-col group"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={eventImg}
                      alt={event.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[11px] font-bold text-olive-800 border border-olive-200 shadow-sm uppercase tracking-wider">
                      {event.category}
                    </span>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-bold font-heading text-stone-900 group-hover:text-olive-700 transition-colors line-clamp-1 mb-2">
                        <Link to={`/events/${event._id}`}>{event.name}</Link>
                      </h3>
                      <p className="text-sm text-stone-600 line-clamp-2 leading-relaxed mb-6">
                        {event.description}
                      </p>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-stone-100">
                      <div className="space-y-2 text-xs text-stone-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-olive-600" />
                          <span>
                            {new Date(event.eventDate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}{" "}
                            &bull; {event.eventTime}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-olive-600" />
                          <span className="line-clamp-1">{event.eventLocation}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-3.5 h-3.5 text-olive-600" />
                          <span className="font-semibold text-olive-800">
                            {remaining} / {event.totalSeats} seats available
                          </span>
                        </div>
                      </div>

                      <Link
                        to={`/events/${event._id}`}
                        className="block w-full text-center py-2.5 px-4 rounded-xl bg-canvas hover:bg-olive-50 border border-stone-200 hover:border-olive-300 text-stone-800 hover:text-olive-800 text-sm font-semibold transition-all"
                      >
                        View & Register
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
