import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";

export default function Community() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="relative bg-canvas border border-olive-200/80 rounded-3xl p-8 sm:p-12 lg:p-14 shadow-soft overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-olive-100 text-olive-800 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Campus Societies & Student Clubs</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold font-heading text-stone-900 leading-tight">
                Ready to Host Your Next Campus Event?
              </h2>
              <p className="text-base text-stone-600 leading-relaxed max-w-lg">
                Join Univenty as an organiser to bring your hackathons, cultural festivals, tech workshops, and sports tournaments directly to thousands of verified students.
              </p>
              <div className="pt-2">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-olive-600 hover:bg-olive-700 text-white font-semibold shadow-soft hover:shadow-soft-hover transition-all"
                >
                  <span>Register as Organiser</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 flex justify-center">
              <div className="p-2 bg-white rounded-2xl border border-olive-100 shadow-sm w-full max-w-sm">
                <img
                  src="/campus.png"
                  alt="Campus Event"
                  className="w-full h-56 object-cover rounded-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
