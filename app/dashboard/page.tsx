"use client";

import Navbar from "@/components/navbar";
import { useState, useMemo, useEffect } from "react";
import { auth, db } from "@/lib/firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";

const SAFE_SPEND_RATIO = 0.5;

export default function Dashboard() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const userDocRef = collection(db, "users");
        const q = query(userDocRef, where("uid", "==", user.uid));
        const userSnap = await getDocs(q);

        if (!userSnap.empty) {
          const userData = userSnap.docs[0].data();
          setMonthlyIncome(userData.monthlyIncome || 0);
        }

        const transactionsRef = collection(db, "transactions");
        const transQuery = query(transactionsRef, where("userId", "==", user.uid));
        const transSnap = await getDocs(transQuery);

        const transactionsList = transSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setTransactions(transactionsList);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const totalSpent = useMemo(
    () =>
      transactions
        .filter((t) => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0),
    [transactions]
  );

  const safeToSpend = useMemo(
    () => monthlyIncome * SAFE_SPEND_RATIO - totalSpent,
    [totalSpent, monthlyIncome]
  );

  const spendingByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    transactions
      .filter((t) => t.amount < 0)
      .forEach((t) => {
        map[t.category] = (map[t.category] || 0) + Math.abs(t.amount);
      });
    return map;
  }, [transactions]);

  const wellnessScore = useMemo(() => {
    const ratio = monthlyIncome > 0 ? totalSpent / monthlyIncome : 0;
    if (ratio < 0.4) return 90;
    if (ratio < 0.6) return 75;
    if (ratio < 0.8) return 55;
    return 35;
  }, [totalSpent, monthlyIncome]);

  const circumference = 2 * Math.PI * 45;
  const dashOffset = circumference * (1 - wellnessScore / 100);

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-black">
      <Navbar />

      <div className="max-w-6xl mx-auto p-6 space-y-10">
        <div>
          <h1 className="text-3xl font-semibold">Hello, you</h1>
          <p className="text-gray-500 mt-1">Here’s a snapshot of your finances</p>
        </div>

        {loading ? (
          <div className="text-center text-gray-500">Loading your data...</div>
        ) : (
          <>
            {/* 2x2 Metric Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Metric title="Month-to-date Spend" value={`$${totalSpent.toLocaleString()}`} />
              <Metric title="Safe to Spend" value={`$${Math.max(safeToSpend, 0).toLocaleString()}`} highlight />
              <Metric title="Monthly Income" value={`$${monthlyIncome.toLocaleString()}`} />

              {/* Wellness Ring */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border">
                <div className="flex items-center gap-6">
                  <div className="relative w-24 h-24">
                    <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="8"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="#22c55e"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={dashOffset}
                        className="transition-all duration-700"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xl font-semibold">{wellnessScore}</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Wellness Score</p>
                    <p className="text-lg font-semibold text-green-600">
                      {wellnessScore >= 80 ? "Excellent" : "Needs attention"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Spending by Category (Compact & Visual) */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <h2 className="text-lg font-semibold mb-4">Spending by Category</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(spendingByCategory).map(([category, amount]) => {
                  const percent = (amount / totalSpent) * 100;
                  return (
                    <div key={category} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium capitalize">{category}</p>
                        <p className="text-xs text-gray-500">${amount.toFixed(2)}</p>
                      </div>

                      <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full transition-all"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* Reusable Metric Card */
function Metric({
  title,
  value,
  highlight = false,
}: {
  title: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border">
      <p className="text-sm text-gray-500">{title}</p>
      <p className={`text-2xl font-semibold ${highlight ? "text-green-600" : ""}`}>
        {value}
      </p>
    </div>
  );
}
