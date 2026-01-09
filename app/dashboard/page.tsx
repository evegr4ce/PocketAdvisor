"use client";

import Navbar from "@/components/navbar";
import { useState, useMemo, useEffect } from "react";
import { auth, db } from "@/lib/firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";

// thresholds + visuals for wellness grade
function getGrade(score: number) {
  if (score >= 80) return { label: "Excellent", color: "text-green-600" };
  if (score >= 60) return { label: "Good", color: "text-green-600" };
  if (score >= 40) return { label: "Fair", color: "text-yellow-600" };
  return { label: "Needs Work", color: "text-red-600" };
}

const SAFE_SPEND_RATIO = 0.5;

export default function Dashboard() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [essentialExpenses, setEssentialExpenses] = useState(0);
  const [checkingBalance, setCheckingBalance] = useState(0);
  const [savingsBalance, setSavingsBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Fetch user to get income and essentials
        const userCol = collection(db, "users");
        const userQ = query(userCol, where("uid", "==", user.uid));
        const userSnap = await getDocs(userQ);

        if (!userSnap.empty) {
          const userData = userSnap.docs[0].data();
          setMonthlyIncome(userData.monthlyIncome || 0);
          setEssentialExpenses(userData.essentialExpenses || 0);
        }

        // Fetch transactions
        const transCol = collection(db, "transactions");
        const transQ = query(transCol, where("userId", "==", user.uid));
        const transSnap = await getDocs(transQ);

        const transList = transSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setTransactions(transList);

        // Fetch accounts
        const accountsCol = collection(db, "accounts");
        const accountsQ = query(accountsCol, where("userId", "==", user.uid));
        const accountsSnap = await getDocs(accountsQ);

        let checking = 0;
        let savings = 0;
        accountsSnap.docs.forEach((doc) => {
          const data = doc.data();
          if (data.type === "checking") {
            checking = data.balance || 0;
          } else if (data.type === "savings") {
            savings = data.balance || 0;
          }
        });
        setCheckingBalance(checking);
        setSavingsBalance(savings);
      } catch (err) {
        console.error("Error fetching user data:", err);
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
    () => Math.max(monthlyIncome * SAFE_SPEND_RATIO - totalSpent, 0),
    [monthlyIncome, totalSpent]
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

  // Consistent wellness score calculation (same as action plan)
  const wellnessScore = useMemo(() => {
    if (monthlyIncome === 0) return 50;

    const essentialsRatio = essentialExpenses / monthlyIncome;
    const discretionarySpent = totalSpent - essentialExpenses;
    const remainingBudget = monthlyIncome - totalSpent;

    let score = 100;
    if (essentialsRatio > 0.5) score -= 15; // Too much on essentials
    if (discretionarySpent > monthlyIncome * 0.3) score -= 20; // High discretionary
    if (remainingBudget < monthlyIncome * 0.1) score -= 15; // Poor savings rate

    return Math.max(20, Math.min(100, score));
  }, [totalSpent, monthlyIncome, essentialExpenses]);

  // order of categories: preferred first
  const categoryOrder = ["Groceries", "Entertainment", "Shopping"];
  const orderedCategories = useMemo(() => {
    const entries = Object.entries(spendingByCategory);
    // sort by preferred order then amount desc
    return entries
      .sort((a, b) => {
        const ia = categoryOrder.indexOf(a[0]);
        const ib = categoryOrder.indexOf(b[0]);
        if (ia !== ib) {
          // if not found, ia or ib is -1 => put found ones first
          if (ia === -1) return 1;
          if (ib === -1) return -1;
          return ia - ib;
        }
        // same category priority: larger amount first
        return b[1] - a[1];
      });
  }, [spendingByCategory]);

  // ring settings
  const size = 120;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (wellnessScore / 100) * circumference;

  const grade = getGrade(wellnessScore);

  return (
    <div className="min-h-screen bg-[#f8f9fc] text-black">
      <Navbar />

      <div className="p-6 max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-semibold">
            Hello, {auth.currentUser?.email?.split("@")[0] ? 
            auth.currentUser.email.split("@")[0].charAt(0).toUpperCase() + auth.currentUser.email.split("@")[0].slice(1) : 
            "You"}
          </h1>
          <p className="text-gray-600 mt-1">Here’s a snapshot of your finances</p>
        </div>

        {loading ? (
          <div className="text-center text-gray-500">Loading your data...</div>
        ) : (
          <>
            {/* top row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-gray-200 bg-white p-6">
                <h3 className="text-sm font-medium text-gray-500">Month-to-date Spend</h3>
                <p className="mt-2 text-xl font-semibold">
                  ${totalSpent.toLocaleString()}
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-6">
                <h3 className="text-sm font-medium text-gray-500">Safe to Spend</h3>
                <p className="mt-2 text-xl font-semibold text-green-600">
                  ${safeToSpend.toLocaleString()}
                </p>
              </div>
            </div>

            {/* bottom row: monthly income + accounts on left, wellness on right */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* left column: monthly income + checking/savings */}
              <div className="rounded-2xl border border-gray-200 bg-white p-4 h-[152px] flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Monthly Income</h3>
                  <p className="mt-1 text-lg font-semibold">
                    ${monthlyIncome.toLocaleString()}
                  </p>
                </div>

                {/* checking and savings side-by-side */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-xs font-medium text-gray-500">Checking</h3>
                    <p className="mt-1 text-sm font-semibold">
                      ${checkingBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xs font-medium text-gray-500">Savings</h3>
                    <p className="mt-1 text-sm font-semibold">
                      ${savingsBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>

              {/* right column: wellness score */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 h-[152px] flex items-center">
                <div className="relative w-[120px] h-[120px] flex-shrink-0">
                  <svg width={size} height={size} className="transform -rotate-90">
                    <circle
                      cx={size / 2}
                      cy={size / 2}
                      r={radius}
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth={strokeWidth}
                    />
                    <circle
                      cx={size / 2}
                      cy={size / 2}
                      r={radius}
                      fill="none"
                      stroke="#10b981"
                      strokeWidth={strokeWidth}
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={offset}
                      className="transition-all duration-700 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-semibold text-gray-900">
                      {wellnessScore}
                    </span>
                    <span className="text-xs text-gray-500">out of 100</span>
                  </div>
                </div>
                <div className="ml-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Wellness Score
                  </h3>
                  <p className={`${grade.color} font-medium mt-1`}>
                    {grade.label}
                  </p>
                </div>
              </div>
            </div>

            {/* spending by category */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="text-xl font-medium text-gray-900 mb-4">
                Spending by Category
              </h2>
              <div className="space-y-4">
                {orderedCategories.map(([category, amount]) => {
                  const percent =
                    totalSpent > 0 ? (amount / totalSpent) * 100 : 0;
                  // clamp width so very long categories don't overflow
                  return (
                    <div key={category} className="space-y-1">
                      <div className="flex justify-between text-sm text-gray-700">
                        <span>{category.charAt(0).toUpperCase() + category.slice(1).toLowerCase()}</span>
                        <span>${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full">
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
