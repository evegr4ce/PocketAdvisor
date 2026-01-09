"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/navbar";
import "@/components/loader.css";
import { auth, db } from "@/lib/firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, getDocs, updateDoc, doc, where } from "firebase/firestore";

type Subscription = {
  id: string;
  merchant: string;
  category: string;
  amount: number;
  daysUsed: number;
  status: "active" | "flagged" | "canceled";
};

export default function SubscriptionsPage() {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOptimize, setShowOptimize] = useState(false);
  const [selectedToCancel, setSelectedToCancel] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Fetch subscriptions from top-level collection filtered by userId
        const subsRef = collection(db, "subscriptions");
        const q = query(subsRef, where("userId", "==", user.uid));
        const subsSnap = await getDocs(q);
        
        const subscriptionsList = subsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Subscription[];
        
        // Filter out canceled subscriptions
        setSubs(subscriptionsList.filter(s => s.status !== "canceled"));
      } catch (error) {
        console.error("Error fetching subscriptions:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const lowUsage = subs.filter(s => s.daysUsed <= 4 && s.status === "active");
  const suggested = lowUsage.slice(0, 3);

  const totalMonthlySavings = suggested.reduce((sum, s) => sum + s.amount, 0);
  const selectedMonthlySavings = suggested.filter(s => selectedToCancel.includes(s.id)).reduce((sum, s) => sum + s.amount, 0);
  const email = auth.currentUser?.email?.split("@")[0] || "You";
  const userName = email.charAt(0).toUpperCase() + email.slice(1).toLowerCase();

  const cancelSuggested = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      // Update each selected subscription to "canceled"
      for (const subId of selectedToCancel) {
        const subRef = doc(db, "subscriptions", subId);
        await updateDoc(subRef, { status: "canceled" });
      }

      // Remove canceled subscriptions from local state
      setSubs(prev =>
        prev.filter(s => !selectedToCancel.includes(s.id))
      );
      setShowOptimize(false);
      setSelectedToCancel([]);
    } catch (error) {
      console.error("Error canceling subscriptions:", error);
    }
  };

  const toggleSubCancel = (subId: string) => {
    setSelectedToCancel(prev =>
      prev.includes(subId) ? prev.filter(id => id !== subId) : [...prev, subId]
    );
  };

  return (
    <>
      <Navbar />
      <div className="ml-64 min-h-screen bg-[#efeffcff] px-6 py-10">
        {loading ? (
          <div className="flex items-center justify-center h-[70vh]">
            <div className="loader"></div>
          </div>
        ) : (
          <div className="mx-auto max-w-6xl space-y-10">

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
              ${subs.filter(s => s.status === "active").reduce((s, a) => s + a.amount, 0).toFixed(2)}
              <span className="text-base text-slate-500"> /mo</span>
            </p>
            <p className="text-sm text-slate-500 mt-1">{subs.length} services</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <p className="text-sm text-slate-500">Low usage detected</p>
            <p className="text-3xl font-semibold text-[#d92d2d] mt-1">{lowUsage.length}</p>
            <p className="text-sm text-slate-500 mt-1">
              ${totalMonthlySavings.toFixed(2)}/mo wasted
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
              Optimize Now
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
                    ${sub.amount.toFixed(2)}
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
                    <div className="flex gap-4">
                      <input
                        type="checkbox"
                        checked={selectedToCancel.includes(sub.id)}
                        onChange={() => toggleSubCancel(sub.id)}
                        className="mt-1 w-5 h-5 cursor-pointer accent-[#d92d2d]"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold text-[#0a2540]">{sub.merchant}</p>
                            <p className="text-sm text-slate-500">{sub.category}</p>
                            <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-red-100 text-[#d92d2d]">
                              {sub.daysUsed} days used
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-semibold text-[#d92d2d]">${sub.amount.toFixed(2)}/mo</p>
                            <p className="text-sm text-slate-500">${(sub.amount * 12).toFixed(2)}/yr</p>
                          </div>
                        </div>

                        <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-600">
                          <p className="font-medium text-slate-700 mb-1">Alternatives:</p>
                          <ul className="space-y-1">
                            <li>→ Switch to free options</li>
                            <li>→ Downgrade to a cheaper plan</li>
                            <li>→ Share with family</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 border-t border-slate-200 pt-4">
                {selectedToCancel.length > 0 ? (
                  <>
                    <p className="text-lg font-semibold text-[#0050c8]">
                      {userName}, this saves you ${selectedMonthlySavings.toFixed(2)}/mo (${(selectedMonthlySavings * 12).toFixed(2)}/yr)
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                      That's about {Math.round(selectedMonthlySavings / (250 / 4.33))} week{Math.round(selectedMonthlySavings / (250 / 4.33)) !== 1 ? 's' : ''} of groceries or $500 toward emergency savings in {Math.ceil(500 / (selectedMonthlySavings || 1))} month{Math.ceil(500 / (selectedMonthlySavings || 1)) !== 1 ? 's' : ''}.
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-slate-500">Select subscriptions above to see potential savings</p>
                )}

                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => setShowOptimize(false)}
                    className="flex-1 border border-slate-300 rounded-lg py-2 text-slate-700 hover:bg-slate-100"
                  >
                    I'll Pass
                  </button>
                  <button
                    onClick={cancelSuggested}
                    disabled={selectedToCancel.length === 0}
                    className={`flex-1 rounded-lg text-white py-2 ${
                      selectedToCancel.length > 0
                        ? 'bg-[#d92d2d] hover:bg-[#b42323]'
                        : 'bg-slate-300 cursor-not-allowed'
                    }`}
                  >
                    I've canceled {selectedToCancel.length} subscription{selectedToCancel.length !== 1 ? 's' : ''}
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        </div>
        )}
      </div>
    </>
  );
}
