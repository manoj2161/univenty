import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { fetchEventById } from "../api/eventApi";
import { registerForEvent } from "../api/registrationApi";
import { fetchEventReviews, submitReview, toggleBookmark, fetchMyBookmarks } from "../api/reviewApi";
import { useAuth } from "../context/AuthContext";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Shield,
  ArrowLeft,
  CheckCircle,
  Bookmark,
  Star,
  Download,
  Share2,
} from "lucide-react";

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isStudent } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [registering, setRegistering] = useState(false);
  const [notes, setNotes] = useState("");
  const [customAnswers, setCustomAnswers] = useState({});
  const [successMsg, setSuccessMsg] = useState("");

  // Feature 3: Bookmarks & Reviews
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");

  useEffect(() => {
    const loadDetails = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await fetchEventById(id);
        if (data.success && data.event) {
          setEvent(data.event);
        } else {
          setError(data.message || "Event not found");
        }
      } catch (err) {
        setError(err.message || "Failed to load event details");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadDetails();
      loadReviews();
      checkBookmarkStatus();
    }
  }, [id, isAuthenticated]);

  const loadReviews = async () => {
    try {
      const res = await fetchEventReviews(id);
      if (res.success) {
        setReviews(res.reviews || []);
        setAvgRating(res.averageRating || 0);
      }
    } catch (e) {}
  };

  const checkBookmarkStatus = async () => {
    if (!isAuthenticated || !isStudent) return;
    try {
      const res = await fetchMyBookmarks();
      if (res.success && res.bookmarks) {
        const found = res.bookmarks.some((b) => (b._id || b) === id);
        setIsBookmarked(found);
      }
    } catch (e) {}
  };

  const handleToggleBookmark = async () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/events/${id}` } });
      return;
    }
    try {
      const res = await toggleBookmark(id);
      if (res.success) {
        setIsBookmarked(res.bookmarked);
      }
    } catch (e) {
      alert(e.message);
    }
  };

  const handleDownloadICS = () => {
    if (!event) return;
    const start = new Date(event.eventDate);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000); // 2 hours
    const fmt = (d) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

    const icsData = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Univenty//Campus Events//EN",
      "BEGIN:VEVENT",
      `SUMMARY:${event.name}`,
      `DESCRIPTION:${event.description.replace(/\n/g, "\\n")}`,
      `LOCATION:${event.eventLocation}`,
      `DTSTART:${fmt(start)}`,
      `DTEND:${fmt(end)}`,
      "STATUS:CONFIRMED",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([icsData], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = `${event.name.replace(/\s+/g, "_")}.ics`;
    link.click();
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/events/${id}` } });
      return;
    }

    if (!isStudent) {
      setError("Only verified students can submit registration requests for events.");
      return;
    }

    setRegistering(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await registerForEvent(id, { notes, customAnswers });
      if (res.success) {
        setSuccessMsg(res.message || "Registration request submitted for organiser review!");
      } else {
        setError(res.message || "Failed to submit registration");
      }
    } catch (err) {
      setError(err.message || "Could not complete registration");
    } finally {
      setRegistering(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewSubmitting(true);
    setReviewError("");
    try {
      const res = await submitReview(id, { rating: reviewRating, comment: reviewComment });
      if (res.success) {
        setReviewComment("");
        loadReviews();
      } else {
        setReviewError(res.message || "Failed to post review");
      }
    } catch (err) {
      setReviewError(err.message || "You must have attended this event (checked in) to post a review.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center text-stone-500 font-medium">
        Loading event details...
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <div className="max-w-md mx-auto bg-white p-8 rounded-2xl border border-red-200 shadow-soft">
          <h2 className="text-xl font-bold font-heading text-red-600 mb-2">Error Loading Event</h2>
          <p className="text-sm text-stone-600 mb-6">{error}</p>
          <Link
            to="/events"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-olive-600 text-white text-sm font-semibold hover:bg-olive-700 transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Events
          </Link>
        </div>
      </div>
    );
  }

  if (!event) return null;

  const remaining = Math.max(0, (event.totalSeats || 0) - (event.bookedSeats || 0));
  const eventImg = event.imageUrl || "/tech.png";

  return (
    <div className="py-12 bg-canvas min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/events"
            className="inline-flex items-center gap-2 text-stone-500 hover:text-olive-700 text-sm font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to all events</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleBookmark}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full border text-xs font-semibold transition-all ${
                isBookmarked
                  ? "bg-olive-100 border-olive-300 text-olive-800"
                  : "bg-white border-stone-200 text-stone-700 hover:bg-stone-50"
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? "fill-current" : ""}`} />
              <span>{isBookmarked ? "Bookmarked" : "Bookmark"}</span>
            </button>
            <button
              onClick={handleDownloadICS}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold transition-all shadow-sm"
              title="Add to Google / Apple Calendar"
            >
              <Calendar className="w-3.5 h-3.5 text-olive-600" />
              <span>Add to Calendar (.ics)</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Main Info */}
          <div className="lg:col-span-8 space-y-8">
            <div className="rounded-2xl overflow-hidden border border-olive-100 shadow-soft bg-white p-2">
              <img
                src={eventImg}
                alt={event.name}
                className="w-full h-80 sm:h-96 object-cover rounded-xl"
              />
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              <span className="px-3 py-1 rounded-full bg-olive-100 text-olive-800 text-xs font-bold uppercase tracking-wider">
                {event.category}
              </span>
              {avgRating > 0 && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{avgRating} ({reviews.length} reviews)</span>
                </span>
              )}
              {event.isTeamEvent && (
                <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold uppercase tracking-wider">
                  Team Event ({event.teamSize?.min || 2}-{event.teamSize?.max || 5} members)
                </span>
              )}
              {event.departments &&
                event.departments.map((dept, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-full bg-stone-100 text-stone-700 text-xs font-medium"
                  >
                    {dept}
                  </span>
                ))}
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading text-stone-900 leading-tight">
              {event.name}
            </h1>

            <div className="py-6 border-t border-b border-olive-100 text-stone-700 text-base leading-relaxed whitespace-pre-line">
              {event.description}
            </div>

            {/* Organiser Card */}
            <div className="bg-white p-6 rounded-2xl border border-olive-100 shadow-soft flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-olive-50 border border-olive-200 flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-olive-700" />
              </div>
              <div>
                <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                  Hosted By
                </div>
                <div className="text-base font-bold text-stone-900">
                  {event.organiser?.name || "Campus Society Organiser"}
                </div>
                <div className="text-xs text-olive-700 font-medium">
                  {event.organiser?.email || "verified@univenty.edu"}
                </div>
              </div>
            </div>

            {/* Student Reviews Section */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-olive-100 shadow-soft space-y-6">
              <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <h3 className="text-xl font-bold font-heading text-stone-900">
                  Attendee Reviews ({reviews.length})
                </h3>
                {avgRating > 0 && (
                  <div className="flex items-center gap-1.5 text-stone-800 font-bold">
                    <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                    <span>{avgRating} / 5</span>
                  </div>
                )}
              </div>

              {/* Review submit form */}
              {isAuthenticated && isStudent && (
                <form onSubmit={handleReviewSubmit} className="space-y-3 bg-stone-50 p-4 rounded-xl border border-stone-200">
                  <h4 className="text-xs font-bold text-stone-700 uppercase">Write a Review (Attendees Only)</h4>
                  {reviewError && (
                    <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                      {reviewError}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-stone-600 font-medium">Your Rating:</span>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className="text-stone-300 hover:text-amber-400 transition-colors"
                      >
                        <Star className={`w-5 h-5 ${star <= reviewRating ? "fill-amber-400 text-amber-400" : ""}`} />
                      </button>
                    ))}
                  </div>
                  <textarea
                    rows={2}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Share your experience at this event..."
                    className="w-full p-2.5 rounded-lg border border-stone-200 text-xs text-stone-800 bg-white focus:outline-none focus:ring-1 focus:ring-olive-500"
                  />
                  <button
                    type="submit"
                    disabled={reviewSubmitting}
                    className="px-4 py-1.5 rounded-lg bg-olive-600 hover:bg-olive-700 text-white text-xs font-bold transition-all disabled:opacity-50"
                  >
                    {reviewSubmitting ? "Posting..." : "Submit Review"}
                  </button>
                </form>
              )}

              {/* Reviews list */}
              {reviews.length === 0 ? (
                <p className="text-stone-400 text-sm italic">No reviews yet for this event.</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((r) => (
                    <div key={r._id} className="border-b border-stone-100 pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-bold text-stone-800">{r.student?.name || "Student"}</span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < r.rating ? "fill-amber-400 text-amber-400" : "text-stone-200"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-stone-600">{r.comment}</p>
                      <span className="text-[10px] text-stone-400 mt-1 block">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Registration Sidebar */}
          <div className="lg:col-span-4 sticky top-28 bg-white p-6 sm:p-8 rounded-2xl border border-olive-100 shadow-soft space-y-6">
            <h3 className="text-xl font-bold font-heading text-stone-900 pb-3 border-b border-stone-100">
              Event Details
            </h3>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-olive-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold text-stone-500 uppercase">Date</div>
                  <div className="text-sm font-bold text-stone-900">
                    {new Date(event.eventDate).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-olive-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold text-stone-500 uppercase">Time</div>
                  <div className="text-sm font-bold text-stone-900">{event.eventTime}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-olive-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold text-stone-500 uppercase">Location</div>
                  <div className="text-sm font-bold text-stone-900">{event.eventLocation}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-olive-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold text-stone-500 uppercase">Seat Availability</div>
                  <div
                    className={`text-sm font-bold ${
                      remaining > 0 ? "text-olive-700" : "text-amber-600"
                    }`}
                  >
                    {remaining > 0
                      ? `${remaining} / ${event.totalSeats} seats remaining`
                      : event.hasWaitlist
                      ? "Full — Waitlist Open"
                      : "Fully Booked"}
                  </div>
                </div>
              </div>
            </div>

            {/* Registration action */}
            {successMsg ? (
              <div className="p-5 rounded-xl bg-olive-50 border border-olive-200 text-center space-y-3">
                <CheckCircle className="w-8 h-8 text-olive-600 mx-auto" />
                <h4 className="text-base font-bold text-olive-800">Request Submitted!</h4>
                <p className="text-xs text-stone-600 leading-relaxed">{successMsg}</p>
                <Link
                  to="/student/registrations"
                  className="block w-full text-center py-2 px-4 rounded-xl bg-white border border-olive-300 text-olive-800 text-xs font-bold hover:bg-olive-100 transition-all shadow-sm"
                >
                  View in My Registrations
                </Link>
              </div>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4 pt-2">
                {error && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                    {error}
                  </div>
                )}

                {/* Custom Form Fields if configured */}
                {isAuthenticated && isStudent && event.customFields && event.customFields.length > 0 && (
                  <div className="space-y-3 pt-2 border-t border-stone-100">
                    <span className="text-xs font-bold text-stone-700 uppercase">Event Questions</span>
                    {event.customFields.map((field, idx) => (
                      <div key={idx}>
                        <label className="block text-xs font-medium text-stone-600 mb-1">
                          {field.label} {field.required && <span className="text-red-500">*</span>}
                        </label>
                        {field.type === "select" ? (
                          <select
                            required={field.required}
                            value={customAnswers[field.label] || ""}
                            onChange={(e) =>
                              setCustomAnswers({ ...customAnswers, [field.label]: e.target.value })
                            }
                            className="w-full p-2.5 rounded-xl border border-stone-200 text-xs text-stone-800 bg-white"
                          >
                            <option value="">Select an option</option>
                            {field.options?.map((opt, oIdx) => (
                              <option key={oIdx} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            required={field.required}
                            value={customAnswers[field.label] || ""}
                            onChange={(e) =>
                              setCustomAnswers({ ...customAnswers, [field.label]: e.target.value })
                            }
                            className="w-full p-2.5 rounded-xl border border-stone-200 text-xs text-stone-800"
                            placeholder="Your answer..."
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {isAuthenticated && isStudent && (
                  <div>
                    <label className="block text-xs font-bold text-stone-600 uppercase mb-1.5">
                      Note for Organiser (Optional)
                    </label>
                    <textarea
                      rows={2}
                      className="w-full p-3 rounded-xl border border-stone-200 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-olive-500/20 focus:border-olive-600 shadow-sm transition-all"
                      placeholder="e.g. dietary constraints, team partner name..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                )}

                {remaining <= 0 && !event.hasWaitlist ? (
                  <button
                    type="button"
                    disabled
                    className="w-full py-3 rounded-xl bg-stone-100 text-stone-400 font-bold text-sm cursor-not-allowed border border-stone-200"
                  >
                    Event Full (Closed)
                  </button>
                ) : !isAuthenticated ? (
                  <Link
                    to="/login"
                    className="block w-full text-center py-3 rounded-xl bg-olive-600 hover:bg-olive-700 text-white font-semibold text-sm shadow-soft hover:shadow-soft-hover transition-all"
                  >
                    Log in to Register
                  </Link>
                ) : isStudent ? (
                  <button
                    type="submit"
                    disabled={registering}
                    className="w-full py-3 rounded-xl bg-olive-600 hover:bg-olive-700 text-white font-semibold text-sm shadow-soft hover:shadow-soft-hover transition-all disabled:opacity-50"
                  >
                    {registering
                      ? "Submitting..."
                      : remaining <= 0 && event.hasWaitlist
                      ? "Join Waitlist"
                      : "Request to Register"}
                  </button>
                ) : (
                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-center text-xs text-stone-600">
                    Logged in as {user?.category}. Student accounts are required to register for campus events.
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
