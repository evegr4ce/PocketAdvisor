"use client";

import { useState, useEffect, useMemo } from "react";
import Navbar from "@/components/navbar";
import "@/components/loader.css";
import { auth, db } from "@/lib/firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";

type Mode = "housing" | "auto" | "vacation";

type UserData = {
  monthlyIncome: number;
  essentialExpenses: number;
};

type Account = {
  id: string;
  type: "checking" | "savings";
  balance: number;
  name: string;
};

type Transaction = {
  amount: number;
  category?: string;
};

export default function AffordabilityPage() {
  const [mode, setMode] = useState<Mode>("housing");
  const [userData, setUserData] = useState<UserData | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Fetch user data
        const userRef = collection(db, "users");
        const userQuery = query(userRef, where("uid", "==", user.uid));
        const userSnap = await getDocs(userQuery);

        if (!userSnap.empty) {
          const data = userSnap.docs[0].data();
          setUserData({
            monthlyIncome: data.monthlyIncome || 0,
            essentialExpenses: data.essentialExpenses || 0,
          });
        }

        // Fetch accounts
        const accountsRef = collection(db, "accounts");
        const accountsQuery = query(accountsRef, where("userId", "==", user.uid));
        const accountsSnap = await getDocs(accountsQuery);

        const accountsList = accountsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Account[];

        setAccounts(accountsList);

        // Fetch transactions
        const transRef = collection(db, "transactions");
        const transQuery = query(transRef, where("userId", "==", user.uid));
        const transSnap = await getDocs(transQuery);

        const transList = transSnap.docs.map((doc) => doc.data() as Transaction);
        setTransactions(transList);
      } catch (error) {
        console.error("Error fetching affordability data:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Calculate realistic spending from actual transactions
  const actualMonthlySpending = useMemo(() => {
    return transactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  }, [transactions]);

  // Calculations
  const monthlyIncome = userData?.monthlyIncome || 0;
  const essentialExpenses = userData?.essentialExpenses || 0;
  
  // Discretionary = after essentials are paid
  const discretionary = monthlyIncome - essentialExpenses;
  
  // Safe to spend per financial guidelines
  const safeToSpend = monthlyIncome * 0.5; // 50% of income
  const actualDiscretionary = safeToSpend - essentialExpenses;
  
  // Account balances
  const totalSavings = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const savingsBalance = accounts.find((a) => a.type === "savings")?.balance || 0;
  const checkingBalance = accounts.find((a) => a.type === "checking")?.balance || 0;

  // Housing: 35% of gross income (30-35% rule)
  const housingCap = monthlyIncome * 0.35;
  const recommendedHousing = housingCap;
  const housingHeadroom = housingCap;

  // Auto: 10-15% of gross income
  const autoCap = monthlyIncome * 0.12;
  const autoHeadroom = autoCap;

  // Vacation: 10% of discretionary after essentials
  const vacationMonthly = discretionary * 0.1;
  const vacationTotal = vacationMonthly * 6;

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
          <h1 className="text-3xl font-semibold text-slate-900">
            Affordability
          </h1>
          <p className="text-slate-500 mt-1">
            Understand what you can safely afford for housing, cars, and vacations
          </p>
        </div>

        {/* Account Summary */}
        {accounts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <p className="text-sm text-slate-500">Checking Balance</p>
              <p className="text-2xl font-semibold text-slate-900 mt-1">
                ${checkingBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <p className="text-sm text-slate-500">Savings Balance</p>
              <p className="text-2xl font-semibold text-emerald-600 mt-1">
                ${savingsBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <p className="text-sm text-slate-500">Total Assets</p>
              <p className="text-2xl font-semibold text-slate-900 mt-1">
                ${totalSavings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex justify-center">
          <div className="flex bg-white rounded-xl p-1 border border-slate-200 shadow-sm w-fit">
            {["housing", "auto", "vacation"].map((tab) => (
              <button
                key={tab}
                onClick={() => setMode(tab as Mode)}
                className={`px-5 py-2 text-sm font-medium rounded-lg transition ${
                  mode === tab
                    ? "bg-blue-600 text-white"
                    : "text-slate-600 hover:text-black"
                }`}
              >
                {tab === "housing" && "Housing"}
                {tab === "auto" && "Auto"}
                {tab === "vacation" && "Vacation"}
              </button>
            ))}
          </div>
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
                  Based on 35% of your gross income ($${monthlyIncome.toLocaleString()}/month)
                </p>
              </div>
              <span className={`text-sm px-3 py-1 rounded-full ${
                housingCap >= recommendedHousing
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-red-50 text-red-700"
              }`}>
                Guideline: $0 - ${housingCap.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </span>
            </div>

            {/* Progress */}
            <div>
              <div className="flex justify-between text-sm text-slate-600 mb-1">
                <span>Safe housing budget</span>
                <span>${recommendedHousing.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{ width: `${Math.min((recommendedHousing / housingCap) * 100, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>100% guideline</span>
                <span>Cap: ${housingCap.toFixed(0)}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-50 rounded-xl p-6">
                <p className="text-sm text-slate-500">Safe monthly cap (35%)</p>
                <p className="text-3xl font-semibold text-slate-900">
                  ${housingCap.toFixed(0)}
                </p>
              </div>

              <div className="bg-slate-50 rounded-xl p-6">
                <p className="text-sm text-slate-500">Monthly income</p>
                <p className="text-3xl font-semibold text-slate-900">
                  ${monthlyIncome.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-800">
                <strong>💡 Tip:</strong> Aim to keep housing costs to 30-35% of your gross income. This leaves room for other expenses and savings.
              </p>
            </div>
          </div>
        )}

        {mode === "auto" && (
          <div className="rounded-3xl bg-white p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Auto Affordability
                </h2>
                <p className="text-sm text-slate-500">
                  Based on 12% of your gross income
                </p>
              </div>
              <span className={`text-sm px-3 py-1 rounded-full ${
                autoCap > 0
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-red-50 text-red-700"
              }`}>
                Guideline: $0 - ${autoCap.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </span>
            </div>

            <div>
              <div className="flex justify-between text-sm text-slate-600 mb-1">
                <span>Safe auto budget</span>
                <span>${autoCap.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${Math.min((autoCap / (monthlyIncome * 0.15)) * 100, 100)}%` }}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-50 rounded-xl p-6">
                <p className="text-sm text-slate-500">Safe monthly cap (12%)</p>
                <p className="text-3xl font-semibold text-slate-900">
                  ${autoCap.toFixed(0)}
                </p>
              </div>

              <div className="bg-slate-50 rounded-xl p-6">
                <p className="text-sm text-slate-500">Discretionary available</p>
                <p className="text-3xl font-semibold text-emerald-600">
                  ${actualDiscretionary.toFixed(0)}
                </p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-800">
                <strong>💡 Tip:</strong> Keep car payments to 10-15% of your gross income, including insurance and maintenance. Don't forget about depreciation!
              </p>
            </div>
          </div>
        )}

        {mode === "vacation" && (
          <div className="rounded-3xl bg-white p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Vacation Planning
                </h2>
                <p className="text-sm text-slate-500">
                  Build a vacation fund over 6 months
                </p>
              </div>
              <span className={`text-sm px-3 py-1 rounded-full ${
                vacationTotal > 0
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-yellow-50 text-yellow-700"
              }`}>
                6-month goal: ${vacationTotal.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </span>
            </div>

            <div>
              <div className="flex justify-between text-sm text-slate-600 mb-1">
                <span>Monthly savings goal</span>
                <span>${vacationMonthly.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all"
                  style={{ width: `${Math.min((vacationMonthly / discretionary) * 100, 100)}%` }}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-50 rounded-xl p-6">
                <p className="text-sm text-slate-500">Monthly budget</p>
                <p className="text-3xl font-semibold text-slate-900">
                  ${vacationMonthly.toFixed(0)}
                </p>
              </div>

              <div className="bg-slate-50 rounded-xl p-6">
                <p className="text-sm text-slate-500">6-month total</p>
                <p className="text-3xl font-semibold text-amber-600">
                  ${vacationTotal.toFixed(0)}
                </p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-800">
                <strong>💡 Tip:</strong> Save ${vacationMonthly.toFixed(0)}/month consistently. In 6 months you'll have ${vacationTotal.toFixed(0)} for your dream vacation!
              </p>
            </div>
          </div>
        )}

          </div>
        )}\n      </div>
    </>
  );
}
