import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Leaf, Sparkles } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative pt-16 pb-20 overflow-hidden bg-canvas">
      {/* Decorative background glow */}
      <div className="absolute -top-24 left-1/4 w-96 h-96 bg-olive-100/60 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-80 h-80 bg-gold-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-olive-50 border border-olive-200 text-olive-800 text-xs font-bold tracking-wide uppercase shadow-sm">
              <Leaf className="w-3.5 h-3.5 text-olive-600" />
              <span>Campus Events Portal &bull; Spring Term 2026</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-stone-900 leading-[1.15]">
              Where Campus Life Meets{" "}
              <span className="text-olive-700 italic font-serif">Opportunity</span>
            </h1>

            <p className="text-lg text-stone-600 max-w-xl leading-relaxed">
              Discover student hackathons, vibrant cultural festivals, sports tournaments, and professional workshops. Connect with university peers and register in seconds.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/events"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-olive-600 hover:bg-olive-700 text-white font-semibold shadow-soft hover:shadow-soft-hover hover:-translate-y-0.5 transition-all"
              >
                <span>Explore Events</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white hover:bg-olive-50 border border-stone-200 hover:border-olive-300 text-stone-800 font-semibold shadow-sm transition-all"
              >
                <span>Join Univenty</span>
              </Link>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-olive-100/80">
              <div>
                <div className="font-heading text-3xl font-bold text-olive-800">50+</div>
                <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider mt-1">Events Per Term</div>
              </div>
              <div>
                <div className="font-heading text-3xl font-bold text-olive-800">100%</div>
                <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider mt-1">Admin Verified</div>
              </div>
              <div>
                <div className="font-heading text-3xl font-bold text-olive-800">3,200+</div>
                <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider mt-1">Active Students</div>
              </div>
            </div>
          </div>

          {/* Right Image Container */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border border-olive-100 shadow-soft bg-white p-2">
              <div className="relative h-96 rounded-xl overflow-hidden">
                <img
                  src="/collegeimg2.png"
                  alt="University Life"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-olive-600/90 text-[11px] font-bold uppercase tracking-wider mb-2">
                    Campus Live
                  </span>
                  <h3 className="text-xl font-bold font-heading text-white mb-1">
                    Annual Univenty Fest & Hackathon
                  </h3>
                  <p className="text-xs text-stone-200">
                    Registration open across all faculties and societies
                  </p>
                </div>
              </div>
            </div>

            {/* Floating campus badge */}
            <div className="absolute -top-4 -right-4 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-olive-200/80 shadow-soft flex items-center gap-3">
              <img src="/campus.png" alt="Campus" className="w-11 h-11 rounded-xl object-cover" />
              <div>
                <div className="text-xs font-bold text-stone-900">Vibrant Campus</div>
                <div className="text-[11px] font-semibold text-olive-700">Spring Term Hub</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
