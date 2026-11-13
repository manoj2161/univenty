import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchEventRegistrations, checkInByQR, getCSVExportUrl } from "../api/registrationApi";
import { reviewRegistrationStatus } from "../api/registrationApi";
import { issueCertificates } from "../api/adminApi";
import { useAuth } from "../context/AuthContext";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Download,
  QrCode,
  Users,
  Award,
} from "lucide-react";

// Simple QR scanner using html5-qrcode
let Html5QrcodeScanner;
try {
  Html5QrcodeScanner = (await import("html5-qrcode")).Html5QrcodeScanner;
} catch (e) {}

export default function OrganiserRegistrationRequests() {
  const { eventId } = useParams();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("requests");
  const [reviewingId, setReviewingId] = useState(null);

  // Check-in state
  const [qrInput, setQrInput] = useState("");
  const [checkInResult, setCheckInResult] = useState(null);
  const [checkInError, setCheckInError] = useState("");
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef(null);

  const csvUrl = getCSVExportUrl(eventId);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetchEventRegistrations(eventId);
      if (res.success) {
        setEvent(res.event);
        setRegistrations(res.registrations || []);
      } else {
        setError(res.message || "Failed to load");
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [eventId]);

  const handleReview = async (id, status) => {
    setReviewingId(id);
    try {
      const res = await reviewRegistrationStatus(id, status);
      if (res.success) {
        setRegistrations((prev) =>
          prev.map((r) => (r._id === id ? { ...r, status } : r))
        );
      } else {
        alert(res.message || "Failed");
      }
    } catch (e) {
      alert(e.message);
    } finally {
      setReviewingId(null);
    }
  };

  const handleManualCheckIn = async (e) => {
    e.preventDefault();
    setCheckInResult(null);
    setCheckInError("");
    try {
      const res = await checkInByQR(qrInput.trim());
      if (res.success) {
        setCheckInResult(res.registration);
        setQrInput("");
        load();
      } else {
        setCheckInError(res.message || "Check-in failed");
      }
    } catch (e) {
      setCheckInError(e.message);
    }
  };

  const handleIssueCerts = async () => {
    if (!window.confirm("Issue certificates for all approved attendees?")) return;
    try {
      const res = await issueCertificates(eventId);
      alert(res.message || "Certificates issued");
    } catch (e) {
      alert(e.message);
    }
  };

  const exportCSV = () => {
    const token = localStorage.getItem("univenty_token");
    // Build URL with token as query param for file download
    const url = `${csvUrl}`;
    const a = document.createElement("a");
    a.href = url;
    // The auth header won't work with direct link; use fetch instead
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.blob())
      .then((blob) => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `attendees-${eventId}.csv`;
        link.click();
      })
      .catch((e) => alert("Export failed: " + e.message));
  };

  const statusColor = (s) =>
    s === "Approved"
      ? "bg-green-100 text-green-800"
      : s === "Pending"
      ? "bg-amber-100 text-amber-800"
      : s === "Waitlisted"
      ? "bg-blue-100 text-blue-700"
      : "bg-red-100 text-red-800";

  return (
    <div className="py-12 bg-canvas min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        <Link
          to="/organiser/dashboard"
          className="inline-flex items-center gap-2 text-stone-500 hover:text-olive-700 text-sm font-semibold mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        {event && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold font-heading text-stone-900">{event.name}</h1>
            <p className="text-stone-500 text-sm mt-1">
              {new Date(event.eventDate).toLocaleDateString()} · {event.eventLocation} ·{" "}
              <span className="font-semibold text-olive-700">
                {event.bookedSeats || 0}/{event.totalSeats} seats
              </span>
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 border-b border-olive-100 mb-6 overflow-x-auto">
          {[
            { id: "requests", label: "Registration Requests", icon: Users },
            { id: "checkin", label: "Check-In", icon: QrCode },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-olive-600 text-olive-700 bg-olive-50/50"
                    : "border-transparent text-stone-500 hover:text-stone-800"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm mb-6">{error}</div>
        )}

        {/* TAB 1: REQUESTS */}
        {activeTab === "requests" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <p className="text-stone-500 text-sm">{registrations.length} total requests</p>
              <div className="flex gap-2">
                <button
                  onClick={exportCSV}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm font-semibold transition-all"
                >
                  <Download className="w-4 h-4" /> Export CSV
                </button>
                <button
                  onClick={handleIssueCerts}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-olive-600 hover:bg-olive-700 text-white text-sm font-semibold transition-all shadow-sm"
                >
                  <Award className="w-4 h-4" /> Issue Certificates
                </button>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-20 text-stone-500">Loading...</div>
            ) : registrations.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-olive-200">
                <Users className="w-10 h-10 text-olive-300 mx-auto mb-3" />
                <p className="text-stone-500 text-sm">No registration requests yet.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-olive-100 shadow-soft overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-olive-50/60 border-b border-olive-100 text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                        <th className="py-4 px-5">Student</th>
                        <th className="py-4 px-5">Department</th>
                        <th className="py-4 px-5">Status</th>
                        <th className="py-4 px-5">Checked In</th>
                        <th className="py-4 px-5">Notes</th>
                        <th className="py-4 px-5">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 text-sm">
                      {registrations.map((reg) => (
                        <tr key={reg._id} className="hover:bg-olive-50/30 transition-colors">
                          <td className="py-4 px-5">
                            <div className="font-semibold text-stone-900">{reg.student?.name}</div>
                            <div className="text-xs text-stone-500">{reg.student?.email}</div>
                            {reg.student?.rollNumber && (
                              <div className="text-xs text-stone-400">{reg.student.rollNumber}</div>
                            )}
                          </td>
                          <td className="py-4 px-5 text-stone-600 text-xs">{reg.student?.department || "—"}</td>
                          <td className="py-4 px-5">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${statusColor(reg.status)}`}>
                              {reg.status}
                            </span>
                            {reg.status === "Waitlisted" && reg.waitlistPosition && (
                              <div className="text-[10px] text-blue-600 mt-0.5">Position #{reg.waitlistPosition}</div>
                            )}
                          </td>
                          <td className="py-4 px-5">
                            <span className={`text-xs font-bold ${reg.checkedIn ? "text-green-600" : "text-stone-400"}`}>
                              {reg.checkedIn ? "✓ Yes" : "No"}
                            </span>
                          </td>
                          <td className="py-4 px-5 text-xs text-stone-500 max-w-[180px] truncate">
                            {reg.notes || "—"}
                          </td>
                          <td className="py-4 px-5">
                            {reg.status === "Pending" && (
                              <div className="flex gap-1.5">
                                <button
                                  onClick={() => handleReview(reg._id, "Approved")}
                                  disabled={reviewingId === reg._id}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-olive-600 hover:bg-olive-700 text-white text-xs font-bold transition-all disabled:opacity-50"
                                >
                                  <CheckCircle className="w-3 h-3" /> Approve
                                </button>
                                <button
                                  onClick={() => handleReview(reg._id, "Rejected")}
                                  disabled={reviewingId === reg._id}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-all disabled:opacity-50"
                                >
                                  <XCircle className="w-3 h-3" /> Reject
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CHECK-IN */}
        {activeTab === "checkin" && (
          <div className="max-w-xl">
            <div className="bg-white rounded-2xl border border-olive-100 shadow-soft p-6 mb-6">
              <h2 className="text-lg font-bold font-heading text-stone-900 mb-1">Manual QR Check-In</h2>
              <p className="text-xs text-stone-500 mb-4">
                Enter or scan the student's QR code token to check them in.
              </p>
              <form onSubmit={handleManualCheckIn} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Paste QR token here (UNIVENTY-...)"
                  value={qrInput}
                  onChange={(e) => setQrInput(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-olive-500/20 focus:border-olive-600"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-olive-600 hover:bg-olive-700 text-white text-sm font-bold transition-all"
                >
                  Check In
                </button>
              </form>

              {checkInError && (
                <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                  {checkInError}
                </div>
              )}

              {checkInResult && (
                <div className="mt-3 p-4 rounded-xl bg-green-50 border border-green-200">
                  <div className="flex items-center gap-2 text-green-700 font-bold text-sm mb-1">
                    <CheckCircle className="w-4 h-4" /> Checked In Successfully!
                  </div>
                  <div className="text-sm text-green-800">
                    <strong>{checkInResult.student?.name}</strong> — {checkInResult.student?.email}
                  </div>
                  {checkInResult.student?.department && (
                    <div className="text-xs text-green-700 mt-0.5">{checkInResult.student.department}</div>
                  )}
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-olive-100 shadow-soft text-center">
                <div className="text-2xl font-bold font-heading text-olive-700">
                  {registrations.filter((r) => r.checkedIn).length}
                </div>
                <div className="text-xs text-stone-500 font-medium mt-1">Checked In</div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-olive-100 shadow-soft text-center">
                <div className="text-2xl font-bold font-heading text-stone-900">
                  {registrations.filter((r) => r.status === "Approved" && !r.checkedIn).length}
                </div>
                <div className="text-xs text-stone-500 font-medium mt-1">Not Yet Checked In</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
