"use client";

import Navbar from "@/components/navbar";
import "@/components/loader.css";
import { useState, useMemo, useEffect } from "react";
import { auth, db } from "@/lib/firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";

// thresholds + visuals for wellness grade
function getGrade(score: number) {
  if (score >= 80) return { label: "Excellent", color: "text-[#282880]" };
  if (score >= 60) return { label: "Good", color: "text-[#282880]" };
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

  const totalSpent = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    return transactions
      .filter((t) => {
        if (t.amount >= 0) return false; // Only negative amounts (expenses)
        
        const transDate = t.timestamp?.toDate?.() || new Date(t.date);
        return transDate.getMonth() === currentMonth && transDate.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  }, [transactions]);

  // Total spending (all time) for wellness score calculation
  const totalSpentAllTime = useMemo(
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
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const map: Record<string, number> = {};
    transactions
      .filter((t) => {
        if (t.amount >= 0) return false;
        
        const transDate = t.timestamp?.toDate?.() || new Date(t.date);
        return transDate.getMonth() === currentMonth && transDate.getFullYear() === currentYear;
      })
      .forEach((t) => {
        map[t.category] = (map[t.category] || 0) + Math.abs(t.amount);
      });
    return map;
  }, [transactions]);

  // Estimate assets over the last 6 weeks using weekly net flows
  const assetsOverTime = useMemo(() => {
    const now = new Date();
    const weeks = Array.from({ length: 6 }, (_, idx) => {
      const offsetWeeks = 5 - idx; // 5 -> oldest week start
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      start.setDate(now.getDate() - offsetWeeks * 7);
      const label = `${start.getMonth() + 1}/${start.getDate()}`;
      return { label, start };
    });

    const weeklyNet = new Array(weeks.length).fill(0);

    transactions.forEach((t) => {
      const transDate = t.timestamp?.toDate?.() || new Date(t.date);
      transDate.setHours(0, 0, 0, 0);
      for (let i = 0; i < weeks.length; i++) {
        const start = weeks[i].start;
        const end = new Date(start);
        end.setDate(start.getDate() + 7);
        if (transDate >= start && transDate < end) {
          weeklyNet[i] += t.amount; // income positive, spend negative
          break;
        }
      }
    });

    // Reconstruct balances forward: derive starting balance then add weekly nets
    const currentTotal = checkingBalance + savingsBalance;
    const totalNet = weeklyNet.reduce((s, v) => s + v, 0);
    const startingBalance = currentTotal - totalNet;
    const balances = new Array(weeks.length).fill(0);
    let running = startingBalance;
    for (let i = 0; i < weeks.length; i++) {
      running += weeklyNet[i];
      balances[i] = running;
    }

    const points = weeks.map((w, idx) => ({ label: w.label, value: balances[idx] }));
    const values = points.map((p) => p.value);
    const max = Math.max(...values, 0);
    const min = Math.min(...values, 0);
    const range = Math.max(max - min, 1);

    return { points, min, range, max };
  }, [transactions, checkingBalance, savingsBalance]);

  // Consistent wellness score calculation (same as action plan)
  const wellnessScore = useMemo(() => {
    if (monthlyIncome === 0) return 50;

    const essentialsRatio = essentialExpenses / monthlyIncome;
    const discretionarySpent = totalSpentAllTime - essentialExpenses;
    const remainingBudget = monthlyIncome - totalSpentAllTime;

    let score = 100;
    if (essentialsRatio > 0.5) score -= 15; // Too much on essentials
    if (discretionarySpent > monthlyIncome * 0.3) score -= 20; // High discretionary
    if (remainingBudget < monthlyIncome * 0.1) score -= 15; // Poor savings rate

    return Math.max(20, Math.min(100, score));
  }, [totalSpentAllTime, monthlyIncome, essentialExpenses]);

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
    <>
      <Navbar />
      <div className="ml-64 min-h-screen bg-[#efeffcff] text-black px-6 py-12">
        {loading ? (
          <div className="flex items-center justify-center h-[70vh]">
            <div className="loader"></div>
          </div>
        ) : (
          <div className="flex gap-6 justify-center mx-auto">
            {/* Main Content */}
            <div className="w-full max-w-4xl space-y-8">
              <div>
                <h1 className="text-3xl font-semibold">
                  Hello, {auth.currentUser?.email?.split("@")[0] ? 
                  auth.currentUser.email.split("@")[0].charAt(0).toUpperCase() + auth.currentUser.email.split("@")[0].slice(1) : 
                  "You"}!
                </h1>
                <p className="text-gray-600 mt-1">Here's a snapshot of your finances</p>
              </div>

              {/* top row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-gray-200 bg-white p-6">
                <h3 className="text-sm font-medium text-gray-500">Month-to-date Spend</h3>
                <p className="mt-2 text-xl font-semibold">
                  ${totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-6">
                <h3 className="text-sm font-medium text-gray-500">Safe to Spend</h3>
                <p className="mt-2 text-xl font-semibold text-[#282880]">
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
                      stroke="#282880"
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

            {/* Assets over time */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="text-xl font-medium text-gray-900 mb-4">Assets Over Time</h2>
              {assetsOverTime.points.every((p) => p.value === 0) ? (
                <p className="text-sm text-gray-500">No asset data yet</p>
              ) : (
                <div className="h-64 w-full">
                  {(() => {
                    const width = 720;
                    const height = 240;
                    const padding = 24;
                    const pts = assetsOverTime.points;
                    const xStep = pts.length > 1 ? (width - padding * 2) / (pts.length - 1) : 0;
                    const yScale = assetsOverTime.range > 0 ? (height - padding * 2) / assetsOverTime.range : 1;
                    const yBase = height - padding;

                    const coords = pts.map((p, idx) => {
                      const x = padding + idx * xStep;
                      const y = yBase - (p.value - assetsOverTime.min) * yScale;
                      return { x, y, label: p.label, value: p.value };
                    });

                    const linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x},${c.y}`).join(' ');
                    const areaPath = `${coords.length ? 'M' + coords[0].x + ',' + yBase : ''} ` +
                      coords.map((c) => `L${c.x},${c.y}`).join(' ') +
                      (coords.length ? ` L${coords[coords.length - 1].x},${yBase} Z` : '');

                    return (
                      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Assets over time line chart" className="w-full h-full">
                        <defs>
                          <linearGradient id="assetsArea" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="#282880" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#282880" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        <path d={areaPath} fill="url(#assetsArea)" stroke="none" />
                        <path d={linePath} fill="none" stroke="#282880" strokeWidth="3" strokeLinecap="round" />
                        {coords.map((c) => (
                          <g key={c.label}>
                            <circle cx={c.x} cy={c.y} r={4} fill="#282880" />
                            <text x={c.x} y={c.y - 8} textAnchor="middle" className="text-[10px] fill-gray-700">
                              {c.value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </text>
                            <text x={c.x} y={height - 6} textAnchor="middle" className="text-[10px] fill-gray-600">{c.label}</text>
                          </g>
                        ))}
                      </svg>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* spending by category */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="text-xl font-medium text-gray-900 mb-4">
                Spending by Category
              </h2>
              <div className="space-y-4">
                {orderedCategories.map(([category, amount]) => {
                  const percent =
                    totalSpent > 0 ? Math.min((amount / totalSpent) * 100, 100) : 0;
                  return (
                    <div key={category} className="space-y-1">
                      <div className="flex justify-between text-sm text-gray-700">
                        <span>{category.charAt(0).toUpperCase() + category.slice(1).toLowerCase()}</span>
                        <span>${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#282880] rounded-full transition-all"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            </div>

            {/* Recent Transactions Sidebar */}
            <div className="w-80 bg-white rounded-2xl border border-gray-200 p-6 pr-2 self-start sticky top-20 flex-shrink-0">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 pr-4">Recent Transactions</h2>
              <div className="space-y-4 max-h-[calc(100vh-12rem)] overflow-y-auto pr-4">
                {transactions.length === 0 ? (
                  <p className="text-sm text-gray-500">No transactions yet</p>
                ) : (
                  (() => {
                    // Helper function to convert Firestore timestamp to Date
                    const toDate = (timestamp: any) => {
                      if (timestamp?.toDate) {
                        return timestamp.toDate();
                      }
                      return new Date(timestamp);
                    };

                    // Group transactions by date
                    const groupedByDate: Record<string, typeof transactions> = {};
                    transactions
                      .sort((a, b) => {
                        const dateA = toDate(a.timestamp);
                        const dateB = toDate(b.timestamp);
                        return dateB.getTime() - dateA.getTime();
                      })
                      .slice(0, 20)
                      .forEach((t) => {
                        const date = toDate(t.timestamp).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        });
                        if (!groupedByDate[date]) {
                          groupedByDate[date] = [];
                        }
                        groupedByDate[date].push(t);
                      });

                    return Object.entries(groupedByDate).map(([date, dayTransactions]) => (
                      <div key={date} className="space-y-2">
                        <p className="text-xs font-medium text-gray-500 uppercase">{date}</p>
                        {dayTransactions.map((t) => (
                          <div key={t.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{t.merchant || t.category}</p>
                              <p className="text-xs text-gray-500">{t.category}</p>
                            </div>
                            <p className={`text-sm font-semibold ${t.amount < 0 ? 'text-red-600' : 'text-[#282880]'}`}>
                              {t.amount < 0 ? '-' : '+'}${Math.abs(t.amount).toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>
                    ));
                  })()
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
