import React from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 bg-canvas text-center">
      <div className="max-w-md w-full bg-white p-10 rounded-3xl border border-olive-100 shadow-soft space-y-4">
        <AlertTriangle className="w-12 h-12 text-olive-600 mx-auto" />
        <h1 className="text-3xl font-bold font-heading text-stone-900">Page Not Found</h1>
        <p className="text-sm text-stone-500 max-w-xs mx-auto">
          The university resource or page you are trying to visit does not exist or has been relocated.
        </p>
        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-olive-600 hover:bg-olive-700 text-white font-semibold text-sm shadow-soft transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
