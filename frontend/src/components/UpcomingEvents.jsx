import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchEvents } from "../api/eventApi";
import { Calendar, MapPin, Users, ArrowRight } from "lucide-react";

export default function UpcomingEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const res = await fetchEvents();
        if (res.success && res.events) {
          setEvents(res.events.slice(0, 3));
        }
      } catch (e) {
        console.error("Failed to load upcoming events:", e.message);
      } finally {
        setLoading(false);
      }
    };
    loadEvents();
  }, []);

  return (
    <section className="py-20 bg-white border-t border-b border-olive-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-wrap justify-between items-end gap-4 mb-12">
          <div>
            <div className="text-xs font-bold text-olive-700 tracking-wider uppercase mb-2">
              Curated For Students
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold font-heading text-stone-900">
              Upcoming Campus Events
            </h2>
          </div>
          <Link
            to="/events"
            className="inline-flex items-center gap-2 text-sm font-semibold text-olive-700 hover:text-olive-800 bg-olive-50 hover:bg-olive-100 px-5 py-2.5 rounded-full transition-all"
          >
            <span>Browse All Events</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12 text-stone-500 font-medium">
            Loading upcoming campus events...
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-16 bg-canvas rounded-2xl border border-dashed border-olive-200">
            <p className="text-stone-600 mb-4 font-medium">No approved upcoming events right now.</p>
            <Link
              to="/events"
              className="inline-flex px-5 py-2.5 rounded-full bg-olive-600 text-white text-sm font-semibold hover:bg-olive-700 transition-all shadow-sm"
            >
              Check Events Calendar
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => {
              const remaining = Math.max(0, (event.totalSeats || 0) - (event.bookedSeats || 0));
              const eventImg = event.imageUrl || "/fest.png";

              return (
                <div
                  key={event._id}
                  className="bg-white rounded-2xl overflow-hidden border border-olive-100/90 shadow-soft hover:shadow-soft-hover hover:-translate-y-1 transition-all flex flex-col group"
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
    </section>
  );
}
