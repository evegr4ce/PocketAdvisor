"use client";

import { useState } from "react";
import Navbar from "@/components/navbar";

type Subscription = {
  id: string;
  merchant: string;
  category: string;
  monthly: number;
  daysUsed: number;
  status: "active" | "flagged" | "canceled";
};

const userName = "You";

const demoSubs: Subscription[] = [
  { id: "1", merchant: "Netflix", category: "Entertainment", monthly: 15.99, daysUsed: 18, status: "active" },
  { id: "2", merchant: "Spotify Premium", category: "Entertainment", monthly: 10.99, daysUsed: 25, status: "active" },
  { id: "3", merchant: "Amazon Prime", category: "Shopping", monthly: 14.99, daysUsed: 8, status: "active" },
  { id: "4", merchant: "Adobe Creative Cloud", category: "Software", monthly: 54.99, daysUsed: 3, status: "active" },
  { id: "5", merchant: "Planet Fitness", category: "Health", monthly: 24.99, daysUsed: 2, status: "active" },
  { id: "6", merchant: "Hulu", category: "Entertainment", monthly: 17.99, daysUsed: 4, status: "active" },
];

export default function SubscriptionsPage() {
  const [subs, setSubs] = useState<Subscription[]>(demoSubs);
  const [showOptimize, setShowOptimize] = useState(false);

  const lowUsage = subs.filter(s => s.daysUsed <= 4 && s.status === "active");
  const suggested = lowUsage.slice(0, 3);

  const monthlySavings = suggested.reduce((sum, s) => sum + s.monthly, 0);
  const yearlySavings = monthlySavings * 12;

  const cancelSuggested = () => {
    setSubs(prev =>
      prev.map(s =>
        suggested.some(c => c.id === s.id)
          ? { ...s, status: "canceled" }
          : s
      )
    );
    setShowOptimize(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="mx-auto max-w-6xl px-6 py-10 space-y-10">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-semibold text-[#0a2540]">Subscriptions</h1>
          <p className="text-slate-500 mt-1">Track, optimize, and reduce recurring expenses.</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <p className="text-sm text-slate-500">Active subscriptions</p>
            <p className="text-3xl font-semibold text-[#0a2540] mt-1">
              ${subs.filter(s => s.status === "active").reduce((s, a) => s + a.monthly, 0).toFixed(2)}
              <span className="text-base text-slate-500"> /mo</span>
            </p>
            <p className="text-sm text-slate-500 mt-1">{subs.length} services</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <p className="text-sm text-slate-500">Low usage detected</p>
            <p className="text-3xl font-semibold text-[#d92d2d] mt-1">{lowUsage.length}</p>
            <p className="text-sm text-slate-500 mt-1">
              ${monthlySavings.toFixed(2)}/mo wasted
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <p className="text-sm text-slate-500">Smart optimize</p>
              <p className="text-sm text-slate-600 mt-1">Cut low-usage, high-cost subscriptions</p>
            </div>
            <button
              onClick={() => setShowOptimize(true)}
              className="mt-4 w-full rounded-lg bg-[#0050c8] py-2 text-white font-medium hover:bg-[#003b95]"
            >
              ✨ Optimize Now
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-100 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-600">Merchant</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-600">Monthly</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-600">Usage</th>
              </tr>
            </thead>
            <tbody>
              {subs.map(sub => (
                <tr key={sub.id} className="border-t border-slate-200">
                  <td className="px-6 py-4">
                    <p className="font-medium text-[#0a2540]">{sub.merchant}</p>
                    <p className="text-sm text-slate-500">{sub.category}</p>
                  </td>


                  <td className={`px-6 py-4 font-semibold ${
                    sub.daysUsed <= 4 ? "text-[#d92d2d]" : "text-[#0a2540]"
                  }`}>
                    ${sub.monthly.toFixed(2)}
                  </td>

                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      sub.daysUsed <= 4
                        ? "bg-red-100 text-[#d92d2d]"
                        : "bg-emerald-100 text-emerald-700"
                    }`}>
                      {sub.daysUsed} days
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Optimize Panel */}
        {showOptimize && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-2xl rounded-2xl p-6 shadow-xl relative">

              <button
                onClick={() => setShowOptimize(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>

              <h2 className="text-xl font-semibold text-[#0a2540] mb-1">Smart Optimization</h2>
              <p className="text-sm text-slate-500 mb-6">
                Based on your usage, we recommend canceling these subscriptions:
              </p>

              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {suggested.map(sub => (
                  <div key={sub.id} className="border border-slate-200 rounded-xl p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-[#0a2540]">{sub.merchant}</p>
                        <p className="text-sm text-slate-500">{sub.category}</p>
                        <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-red-100 text-[#d92d2d]">
                          {sub.daysUsed} days used
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-[#d92d2d]">${sub.monthly.toFixed(2)}/mo</p>
                        <p className="text-sm text-slate-500">${(sub.monthly * 12).toFixed(2)}/yr</p>
                      </div>
                    </div>

                    <div className="mt-3 bg-slate-50 rounded-lg p-3 text-sm text-slate-600">
                      <p className="font-medium text-slate-700 mb-1">AI alternatives:</p>
                      <ul className="space-y-1">
                        <li>→ Switch to free options</li>
                        <li>→ Downgrade to a cheaper plan</li>
                        <li>→ Share with family</li>
                      </ul>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 border-t border-slate-200 pt-4">
                <p className="text-lg font-semibold text-[#0050c8]">
                  {userName}, this saves you ${monthlySavings.toFixed(2)}/mo (${yearlySavings.toFixed(2)}/yr)
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  That’s about 3 weeks of groceries or $500 toward emergency savings in 4 months.
                </p>

                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => setShowOptimize(false)}
                    className="flex-1 border border-slate-300 rounded-lg py-2 text-slate-700 hover:bg-slate-100"
                  >
                    Keep subscriptions
                  </button>
                  <button
                    onClick={cancelSuggested}
                    className="flex-1 rounded-lg bg-[#d92d2d] text-white py-2 hover:bg-[#b42323]"
                  >
                    Cancel {suggested.length} subscriptions
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
