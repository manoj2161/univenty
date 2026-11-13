import React, { useState, useEffect } from "react";
import { X, Info, AlertTriangle, CheckCircle, Zap } from "lucide-react";
import { fetchAnnouncements } from "../api/announcementApi";

const typeConfig = {
  info: {
    bg: "bg-blue-50 border-blue-200",
    text: "text-blue-800",
    icon: Info,
    iconColor: "text-blue-500",
  },
  warning: {
    bg: "bg-amber-50 border-amber-200",
    text: "text-amber-800",
    icon: AlertTriangle,
    iconColor: "text-amber-500",
  },
  success: {
    bg: "bg-green-50 border-green-200",
    text: "text-green-800",
    icon: CheckCircle,
    iconColor: "text-green-500",
  },
  urgent: {
    bg: "bg-red-50 border-red-200",
    text: "text-red-800",
    icon: Zap,
    iconColor: "text-red-500",
  },
};

export default function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState([]);
  const [dismissed, setDismissed] = useState(new Set());

  useEffect(() => {
    fetchAnnouncements()
      .then((res) => {
        if (res.success) setAnnouncements(res.announcements || []);
      })
      .catch(() => {});
  }, []);

  const visible = announcements.filter((a) => !dismissed.has(a._id));
  if (visible.length === 0) return null;

  return (
    <div className="space-y-1">
      {visible.map((ann) => {
        const cfg = typeConfig[ann.type] || typeConfig.info;
        const Icon = cfg.icon;
        return (
          <div
            key={ann._id}
            className={`flex items-center gap-3 px-6 py-2.5 border-b text-sm ${cfg.bg} ${cfg.text}`}
          >
            <Icon className={`w-4 h-4 flex-shrink-0 ${cfg.iconColor}`} />
            <div className="flex-1 min-w-0">
              <span className="font-bold mr-2">{ann.title}:</span>
              <span>{ann.message}</span>
            </div>
            <button
              onClick={() => setDismissed((prev) => new Set([...prev, ann._id]))}
              className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
