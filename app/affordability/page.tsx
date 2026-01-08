"use client";

import { useState } from "react";
import Navbar from "@/components/navbar";

type Mode = "housing" | "auto" | "vacation";

const demo = {
  name: "Daniel",
  netIncome: 5200,
  discretionary: 2329.17,
  rent: 1450,
};

export default function AffordabilityPage() {
  const [mode, setMode] = useState<Mode>("housing");

  // Calculations
  const housingCap = demo.netIncome * 0.35;
  const housingPercent = Math.min((demo.rent / housingCap) * 100, 100);
  const housingHeadroom = housingCap - demo.rent;

  const autoCap = Math.min(demo.netIncome * 0.1, demo.discretionary * 0.35);

  const vacationMonthly = demo.discretionary * 0.2;
  const vacationTotal = vacationMonthly * 6;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">
            Affordability
          </h1>
          <p className="text-slate-500 mt-1">
            Understand what you can safely afford for housing, cars, and vacations
          </p>
        </div>

        {/* Tabs */}
        <div className="flex bg-white rounded-xl p-1 border border-slate-200 shadow-sm w-fit">
          {["housing", "auto", "vacation"].map((tab) => (
            <button
              key={tab}
              onClick={() => setMode(tab as Mode)}
              className={`px-5 py-2 text-sm font-medium rounded-lg transition ${
                mode === tab
                  ? "bg-black text-white"
                  : "text-slate-600 hover:text-black"
              }`}
            >
              {tab === "housing" && "Housing"}
              {tab === "auto" && "Auto"}
              {tab === "vacation" && "Vacation"}
            </button>
          ))}
        </div>

        {/* Content */}
        {mode === "housing" && (
          <div className="rounded-3xl bg-white p-8 border border-slate-200 shadow-sm space-y-6">

            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Housing Affordability
                </h2>
                <p className="text-sm text-slate-500">
                  Based on 35% of your net income
                </p>
              </div>
              <span className={`text-sm px-3 py-1 rounded-full ${
                housingHeadroom >= 0
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-red-50 text-red-700"
              }`}>
                {housingHeadroom >= 0 ? "Within cap" : "Over cap"}
              </span>
            </div>

            {/* Progress */}
            <div>
              <div className="flex justify-between text-sm text-slate-600 mb-1">
                <span>Current rent</span>
                <span>${demo.rent.toLocaleString()}</span>
              </div>
              <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{ width: `${housingPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>{Math.round(housingPercent)}% of cap</span>
                <span>Cap: ${housingCap.toFixed(0)}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-50 rounded-xl p-6">
                <p className="text-sm text-slate-500">Safe monthly cap</p>
                <p className="text-3xl font-semibold text-slate-900">
                  ${housingCap.toFixed(0)}
                </p>
              </div>

              <div className="bg-slate-50 rounded-xl p-6">
                <p className="text-sm text-slate-500">Available headroom</p>
                <p className={`text-3xl font-semibold ${
                  housingHeadroom >= 0 ? "text-emerald-600" : "text-red-600"
                }`}>
                  ${housingHeadroom.toFixed(0)}
                </p>
              </div>
            </div>
          </div>
        )}

        {mode === "auto" && (
          <div className="rounded-3xl bg-white p-8 border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-xl font-semibold text-slate-900">
              Auto Payment Affordability
            </h2>
            <p className="text-sm text-slate-500">
              Your recommended payment is the lower of:
              <br />• 10% of income
              <br />• 35% of discretionary spending
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-50 rounded-xl p-6">
                <p className="text-sm text-slate-500">10% of income</p>
                <p className="text-3xl font-semibold text-slate-900">
                  ${(demo.netIncome * 0.1).toFixed(0)}
                </p>
              </div>

              <div className="bg-slate-50 rounded-xl p-6">
                <p className="text-sm text-slate-500">35% of discretionary</p>
                <p className="text-3xl font-semibold text-slate-900">
                  ${(demo.discretionary * 0.35).toFixed(0)}
                </p>
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
              <p className="text-sm text-emerald-700">Your safe auto payment</p>
              <p className="text-3xl font-semibold text-emerald-700">
                ${autoCap.toFixed(0)}
              </p>
            </div>
          </div>
        )}

        {mode === "vacation" && (
          <div className="rounded-3xl bg-white p-8 border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-xl font-semibold text-slate-900">
              Vacation Planning
            </h2>
            <p className="text-sm text-slate-500">
              You can safely allocate 20% of discretionary income toward travel.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-50 rounded-xl p-6">
                <p className="text-sm text-slate-500">Monthly savings</p>
                <p className="text-3xl font-semibold text-slate-900">
                  ${vacationMonthly.toFixed(2)}
                </p>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
                <p className="text-sm text-emerald-700">6-month trip budget</p>
                <p className="text-3xl font-semibold text-emerald-700">
                  ${vacationTotal.toFixed(0)}
                </p>
              </div>
            </div>

            {/* Timeline */}
            <div>
              <h3 className="font-medium text-slate-900 mb-4">
                6-Month Savings Timeline
              </h3>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5, 6].map((m) => {
                  const amount = vacationMonthly * m;
                  return (
                    <div key={m} className="flex items-center gap-4">
                      <div className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-sm">
                        {m}
                      </div>
                      <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500"
                          style={{ width: `${(m / 6) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-slate-700">
                        ${amount.toFixed(0)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
