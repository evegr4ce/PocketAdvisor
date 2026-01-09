"use client";

import Navbar from "@/components/navbar";
import MetricCard from "../../components/metricCard";

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
        // Fetch user data to get income
        const userDocRef = collection(db, "users");
        const q = query(userDocRef, where("uid", "==", user.uid));
        const userSnap = await getDocs(q);

        if (!userSnap.empty) {
          const userData = userSnap.docs[0].data();
          setMonthlyIncome(userData.monthlyIncome || 0);
        }

        // Fetch transactions
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

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Navbar stays at normal size */}
      <Navbar />

      {/* Page content gets padding instead */}
      <div className="p-6">
        <h1 className="text-3xl font-semibold mb-6">Financial Dashboard</h1>

        {loading ? (
          <div className="text-center text-gray-500">Loading your data...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <MetricCard
                title="Month-to-date Spend"
                value={`$${totalSpent.toLocaleString()}`}
              />
              <MetricCard
                title="Safe to Spend"
                value={`$${Math.max(safeToSpend, 0).toLocaleString()}`}
              />
              <MetricCard
                title="Monthly Income"
                value={`$${monthlyIncome.toLocaleString()}`}
              />
              <MetricCard
                title="Wellness Score"
                value={`${wellnessScore}/100`}
              />
            </div>

            <div className="bg-white shadow-xl rounded-2xl p-6">
              <h2 className="text-xl font-medium mb-4">Spending by Category</h2>
              <div className="space-y-3">
                {Object.entries(spendingByCategory).map(([category, amount]) => {
                  const percent = (amount / totalSpent) * 100;
                  return (
                    <div key={category}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{category}</span>
                        <span>${amount}</span>
                      </div>
                      <div className="w-full h-2 bg-gray-300 rounded">
                        <div
                          className="h-2 bg-green-500 rounded"
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
