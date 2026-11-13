import React from "react";
import Header from "./Header";
import AnnouncementBanner from "./AnnouncementBanner";

export default function AppLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-canvas">
      <Header />
      <AnnouncementBanner />
      <main className="flex-1">{children}</main>
      <footer className="bg-white border-t border-olive-100 py-10 mt-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="p-1.5">
              <img src="/univenty-logo.png" alt="Univenty" className="w-7 h-7 object-contain" />
            </div>
            <div>
              <div className="font-heading text-lg font-bold text-st one-900">Univenty</div>
              <div className="text-xs text-stone-500 font-medium">University Events Management Platform</div>
            </div>
          </div>
          <div className="text-sm text-stone-500">
            &copy; {new Date().getFullYear()} Univenty. Connected Campus Community.
          </div>
        </div>
      </footer>
    </div>
  );
}
