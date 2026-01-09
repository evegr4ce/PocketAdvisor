"use client";

import React, { useState, Dispatch, SetStateAction } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase/config";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function Signup() {
  const [step, setStep] = useState(1);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [income, setIncome] = useState(0);
  const [payFrequency, setPayFrequency] = useState("monthly");

  const [rent, setRent] = useState(1450);
  const [utilities, setUtilities] = useState(180);
  const [groceries, setGroceries] = useState(450);
  const [insurance, setInsurance] = useState(220);
  const [debt, setDebt] = useState(350);

  const expenses: [string, number, Dispatch<SetStateAction<number>>][] = [
    ["Rent / Mortgage", rent, setRent],
    ["Utilities", utilities, setUtilities],
    ["Groceries", groceries, setGroceries],
    ["Insurance", insurance, setInsurance],
    ["Minimum debt payments", debt, setDebt],
  ];

  const [mode, setMode] = useState<"save" | "earn" | "">("");
  const handleSubmit = async () => {
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const uid = userCredential.user.uid;

      // Save user data to Firestore
      const userDocRef = doc(db, "users", uid);
      await setDoc(userDocRef, {
        uid,
        email,
        monthlyIncome: income,
        payFrequency,
        mode,
        essentialExpenses: {
          rent,
          utilities,
          groceries,
          insurance,
          debt,
        },
        createdAt: new Date(),
      });

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to create account");
      console.error("Signup error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-[#efeffcff] min-h-screen">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto min-h-screen">
        <img
          src="/pocket_logo.png"
          alt="Pocket Advisor logo"
          className="h-40 w-auto mb-1"
        />
        <h1 className="mb-8 text-3xl font-semibold text-slate-900">
          PocketAdvisor
        </h1>

        <div className="w-full bg-white rounded-lg shadow-lg border border-slate-200 sm:max-w-md">
          <div className="p-8 space-y-4 sm:p-8 text-center">
            {step === 1 && (
              <>
                <h2 className="text-xl font-bold text-slate-900 mb-4">
                  Create your account
                </h2>

                {error && (
                  <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm mb-4">
                    {error}
                  </div>
                )}

                <div className="space-y-4 text-left">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-slate-700">
                      Email
                    </label>
                    <input
                      type="email"
                      className="w-full p-2.5 border rounded-lg bg-slate-50 text-slate-900 border-slate-300"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-slate-700">
                      Password
                    </label>
                    <input
                      type="password"
                      className="w-full p-2.5 border rounded-lg bg-slate-50 text-slate-900 border-slate-300"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  onClick={() => setStep(2)}
                  className="w-full bg-[#282880] text-white hover:bg-blue-900 rounded-lg py-2.5"
                >
                  Continue
                </button>

                <p className="text-sm font-light text-slate-500">
                  Go back to{" "}
                  <a
                    href="/"
                    className="font-bold text-[#282880] hover:underline"
                  >
                    Log In
                  </a>
                </p>
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="text-xl font-bold text-slate-900 mb-2">
                  Your income
                </h2>

                <p className="text-sm text-slate-500 mb-4">
                  Enter your take-home pay after taxes.
                </p>

                <div className="space-y-4 text-left">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-slate-700">
                      Net monthly income
                    </label>
                    <div className="flex items-center">
                      <span className="mr-2 text-slate-500">$</span>
                      <input
                        type="number"
                        className="w-full p-2.5 border rounded-lg bg-slate-50 text-slate-900 border-slate-300"
                        value={income}
                        onChange={(e) =>
                          setIncome(
                            e.target.value === "" ? 0 : Number(e.target.value)
                          )
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-slate-700">
                      Pay frequency
                    </label>
                    <select
                      className="w-full p-2.5 border rounded-lg bg-slate-50 text-slate-900 border-slate-300"
                      value={payFrequency}
                      onChange={(e) => setPayFrequency(e.target.value)}
                    >
                      <option value="weekly">Weekly</option>
                      <option value="biweekly">Biweekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-4 mt-6">
                  <button
                    onClick={() => setStep(1)}
                    className="w-full border border-slate-300 text-slate-700 rounded-lg py-2.5 hover:bg-slate-100"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="w-full bg-[#282880] text-white hover:bg-blue-900 rounded-lg py-2.5"
                  >
                    Continue
                  </button>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <h2 className="text-xl font-bold text-slate-900 mb-2">
                  Essential expenses
                </h2>

                <p className="text-sm text-slate-500 mb-4">
                  Monthly costs you can&apos;t avoid.
                </p>

                <div className="space-y-4">
                  {expenses.map(([label, value, setter]) => (
                    <div key={label}>
                      <label className="block mb-2 text-sm font-medium text-slate-700">
                        {label}
                      </label>
                      <div className="flex items-center">
                        <span className="mr-2 text-slate-500">$</span>
                        <input
                          type="number"
                          className="w-full p-2.5 border rounded-lg bg-slate-50 text-slate-900 border-slate-300"
                          value={value}
                          onChange={(e) =>
                            setter(
                              e.target.value === "" ? 0 : Number(e.target.value)
                            )
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-4 mt-6">
                  <button
                    onClick={() => setStep(2)}
                    className="w-full border border-slate-300 text-slate-700 rounded-lg py-2.5 hover:bg-slate-100"
                  >
                    Back
                  </button>
                  <button
                    className="w-full bg-[#282880] text-white hover:bg-blue-900 rounded-lg py-2.5"
                    onClick={() => setStep(4)}
                  >
                    Continue
                  </button>
                </div>
              </>
            )}

            {step === 4 && (
              <>
                <h2 className="text-xl font-bold text-slate-900 mb-2">
                  Choose your mode
                </h2>

                <p className="text-sm text-slate-500 mb-6">
                  Would you like to save or make more money?
                </p>

                <div className="flex flex-col gap-3 mb-6">
                  <button
                    onClick={() => setMode("save")}
                    className={`w-full p-3 rounded-lg border ${
                      mode === "save"
                        ? "bg-[#282880] text-white border-[#282880]"
                        : "bg-slate-50 text-slate-900 border-slate-300"
                    }`}
                  >
                    Save Money
                  </button>

                  <button
                    onClick={() => setMode("earn")}
                    className={`w-full p-3 rounded-lg border ${
                      mode === "earn"
                        ? "bg-[#282880] text-white border-[#282880]"
                        : "bg-slate-50 text-slate-900 border-slate-300"
                    }`}
                  >
                    Make More Money
                  </button>
                </div>

                <div className="flex gap-4 mt-6">
                  <button
                    onClick={() => setStep(3)}
                    className="w-full border border-slate-300 text-slate-700 rounded-lg py-2.5 hover:bg-slate-100"
                  >
                    Back
                  </button>

                  <button
                    className="w-full bg-[#282880] text-white hover:bg-blue-900 rounded-lg py-2.5 disabled:bg-slate-400"
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? "Creating account..." : "Submit"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
