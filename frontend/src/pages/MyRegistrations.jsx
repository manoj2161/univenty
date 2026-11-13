import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchMyRegistrations, cancelRegistration, getCertificateUrl } from "../api/registrationApi";
import { Calendar, XCircle, ArrowLeft, QrCode, Download, CheckCircle2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export default function MyRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState(null);
  const [activeTicket, setActiveTicket] = useState(null);

  useEffect(() => {
    loadRegistrations();
  }, []);

  const loadRegistrations = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchMyRegistrations();
      if (data.success) {
        setRegistrations(data.registrations || []);
      } else {
        setError(data.message || "Failed to load registrations");
      }
    } catch (err) {
      setError(err.message || "Could not retrieve your registrations");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this registration request?")) {
      return;
    }

    setCancellingId(id);
    try {
      const res = await cancelRegistration(id);
      if (res.success) {
        setRegistrations((prev) =>
          prev.map((r) => (r._id === id ? { ...r, status: "Cancelled" } : r))
        );
      } else {
        alert(res.message || "Failed to cancel registration");
      }
    } catch (err) {
      alert(err.message || "Error cancelling registration");
    } finally {
      setCancellingId(null);
    }
  };

  const downloadCert = async (regId, eventName) => {
    const token = localStorage.getItem("univenty_token");
    try {
      const res = await fetch(getCertificateUrl(regId), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Could not download certificate");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Certificate-${(eventName || "Event").replace(/\s+/g, "_")}.pdf`;
      a.click();
    } catch (err) {
      alert(err.message);
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
          <span>Back to Dashboard</span>
        </Link>

        <h1 className="text-3xl sm:text-4xl font-bold font-heading text-stone-900 mb-2">
          My Registrations & Tickets
        </h1>
        <p className="text-sm text-stone-500 mb-8">
          Track registration status, access entry QR code passes, and download participation certificates.
        </p>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-stone-500 font-medium">
            Loading registrations...
          </div>
        ) : registrations.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-olive-200 p-8 shadow-sm">
            <Calendar className="w-12 h-12 text-olive-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold font-heading text-stone-900 mb-2">No Registrations Yet</h3>
            <p className="text-sm text-stone-500 max-w-sm mx-auto mb-6">
              You haven't requested admission to any campus events yet.
            </p>
            <Link
              to="/events"
              className="inline-flex px-6 py-3 rounded-full bg-olive-600 hover:bg-olive-700 text-white font-semibold text-sm shadow-soft transition-all"
            >
              Browse Events Now
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-olive-100 shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-olive-50/60 border-b border-olive-100 text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                    <th className="py-4 px-6">Event Name</th>
                    <th className="py-4 px-6">Date & Schedule</th>
                    <th className="py-4 px-6">Location</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6">Pass / Certificate</th>
                    <th className="py-4 px-6">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-sm">
                  {registrations.map((reg) => {
                    const event = reg.event;
                    return (
                      <tr key={reg._id} className="hover:bg-olive-50/30 transition-colors">
                        <td className="py-4 px-6 font-semibold text-stone-900">
                          {event ? (
                            <Link to={`/events/${event._id}`} className="hover:text-olive-700">
                              {event.name}
                            </Link>
                          ) : (
                            <span className="text-stone-400">Deleted Event</span>
                          )}
                          {reg.notes && (
                            <div className="text-xs text-stone-500 mt-1 font-normal">
                              Note: {reg.notes}
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-6 text-stone-600">
                          {event
                            ? `${new Date(event.eventDate).toLocaleDateString()} at ${event.eventTime}`
                            : "-"}
                        </td>
                        <td className="py-4 px-6 text-stone-600">{event?.eventLocation || "-"}</td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                              reg.status === "Approved"
                                ? "bg-green-100 text-green-800"
                                : reg.status === "Pending"
                                ? "bg-amber-100 text-amber-800"
                                : reg.status === "Waitlisted"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {reg.status}
                          </span>
                          {reg.checkedIn && (
                            <div className="flex items-center gap-1 text-[11px] text-green-700 font-semibold mt-1">
                              <CheckCircle2 className="w-3 h-3" /> Checked in
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            {reg.status === "Approved" && reg.qrToken && (
                              <button
                                onClick={() => setActiveTicket(reg)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-olive-50 hover:bg-olive-100 text-olive-800 text-xs font-bold transition-all border border-olive-200"
                              >
                                <QrCode className="w-3.5 h-3.5" />
                                <span>View Ticket</span>
                              </button>
                            )}
                            {reg.status === "Approved" && reg.checkedIn && reg.certificateIssued && (
                              <button
                                onClick={() => downloadCert(reg._id, event?.name)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-all"
                                title="Download Certificate"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Cert</span>
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          {reg.status !== "Cancelled" && (
                            <button
                              onClick={() => handleCancel(reg._id)}
                              disabled={cancellingId === reg._id}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition-all disabled:opacity-50"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>{cancellingId === reg._id ? "Cancelling..." : "Cancel"}</span>
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
        )}

        {/* QR Code Ticket Modal */}
        {activeTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full border border-olive-100 shadow-2xl text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-olive-700 bg-olive-50 px-3 py-1 rounded-full border border-olive-200">
                Official Campus Entry Pass
              </span>
              <h3 className="text-xl font-bold font-heading text-stone-900 mt-4 mb-1">
                {activeTicket.event?.name}
              </h3>
              <p className="text-xs text-stone-500 mb-6">
                Scan at the entrance for verification and door check-in.
              </p>

              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 inline-block mb-4 shadow-inner">
                <QRCodeSVG value={activeTicket.qrToken || "UNIVENTY-TICKET"} size={180} />
              </div>

              <div className="bg-olive-50/70 p-3 rounded-xl border border-olive-100 text-xs text-stone-600 mb-6 font-mono break-all">
                {activeTicket.qrToken}
              </div>

              <button
                onClick={() => setActiveTicket(null)}
                className="w-full py-2.5 rounded-full bg-stone-900 text-white font-semibold text-sm hover:bg-stone-800 transition-all"
              >
                Close Pass
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
