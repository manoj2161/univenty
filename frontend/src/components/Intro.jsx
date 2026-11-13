import React from "react";
import { CheckCircle2, ShieldCheck, Compass, Zap } from "lucide-react";

export default function Intro() {
  return (
    <section className="py-20 bg-canvas">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="text-xs font-bold text-olive-700 tracking-wider uppercase">
              Why Univenty
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold font-heading text-stone-900 leading-tight">
              A Transparent, Student-First Platform for University Events
            </h2>
            <p className="text-base text-stone-600 leading-relaxed">
              Univenty eliminates chaotic group chats and buried posters. Every university initiative is strictly verified by administrators, easy to discover, and backed by a transparent seat reservation pipeline.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-olive-100 text-olive-700 flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-stone-900 mb-1">Verified Events</h4>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Only authentic organisers approved by university admins.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-olive-100 text-olive-700 flex-shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-stone-900 mb-1">Seat Transparency</h4>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Real-time seat count decrements and instant request tracking.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-gold-400/20 text-gold-600 flex-shrink-0">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-stone-900 mb-1">Faculty Filtering</h4>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Discover events tailored specifically to your faculty.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-olive-100 text-olive-700 flex-shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-stone-900 mb-1">Organiser Suite</h4>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Student attendance roster, approvals, and event management.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-2xl overflow-hidden border border-olive-100 shadow-soft bg-white p-2">
              <img
                src="/public.png"
                alt="Univenty Community"
                className="w-full h-96 object-cover rounded-xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
