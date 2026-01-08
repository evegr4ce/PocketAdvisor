"use client";

import React, { useState, Dispatch, SetStateAction } from "react";

export default function Signup() {
  const [step, setStep] = useState(1);

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

  return (
    <section className="bg-white min-h-screen">

      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto min-h-screen">
        <img
              src="/pocket_logo.png"
              alt="Pocket Advisor logo"
              className=" translate-y-13 ml-2 h-[230px] w-auto"
            />
        <h1 className="mb-6 text-3xl font-semibold text-black">
          PocketAdvisor
        </h1>

        <div className="w-full bg-white rounded-lg shadow-lg border border-gray-200 sm:max-w-md">
          <div className="p-6 space-y-6 sm:p-8">

            {step === 1 && (
              <>
                <h2 className="text-xl font-bold text-gray-900">
                  Create your account
                </h2>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-800">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full p-2.5 border rounded-lg bg-gray-50 text-gray-900"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-800">
                    Password
                  </label>
                  <input
                    type="password"
                    className="w-full p-2.5 border rounded-lg bg-gray-50 text-gray-900"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <button
                  onClick={() => setStep(2)}
                  className="w-full bg-blue-800 text-white hover:bg-blue-900 rounded-lg py-2.5"
                >
                  Continue
                </button>

                <p className="text-sm font-light text-gray-500">
                  Go back to{" "}
                  <a href="/" className="font-bold text-primary-600 hover:underline">
                     Log In
                  </a>
                </p>
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="text-xl font-bold text-gray-900">
                  Your income
                </h2>

                <p className="text-sm text-gray-500">
                  Enter your take-home pay after taxes.
                </p>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-800">
                    Net monthly income
                  </label>
                  <div className="flex items-center">
                    <span className="mr-2 text-gray-500">$</span>
                    <input
                      type="number"
                      className="w-full p-2.5 border rounded-lg bg-gray-50 text-gray-900"
                      value={income}
                      onChange={(e) =>
                        setIncome(e.target.value === "" ? 0 : Number(e.target.value))
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-800">
                    Pay frequency
                  </label>
                  <select
                    className="w-full p-2.5 border rounded-lg bg-gray-50 text-gray-900"
                    value={payFrequency}
                    onChange={(e) => setPayFrequency(e.target.value)}
                  >
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Biweekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setStep(1)}
                    className="w-full border border-gray-700 text-gray-700 rounded-lg py-2.5 hover:bg-gray-100"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="w-full bg-blue-800 text-white hover:bg-blue-900 rounded-lg py-2.5"
                  >
                    Continue
                  </button>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <h2 className="text-xl font-bold text-gray-900">
                  Essential expenses
                </h2>

                <p className="text-sm text-gray-500">
                  Monthly costs you can&apos;t avoid.
                </p>

                {expenses.map(([label, value, setter]) => (
                  <div key={label}>
                    <label className="block mb-2 text-sm font-medium text-gray-800">
                      {label}
                    </label>
                    <div className="flex items-center">
                      <span className="mr-2 text-gray-500">$</span>
                      <input
                        type="number"
                        className="w-full p-2.5 border rounded-lg bg-gray-50 text-gray-900"
                        value={value}
                        onChange={(e) =>
                          setter(e.target.value === "" ? 0 : Number(e.target.value))
                        }
                      />
                    </div>
                  </div>
                ))}

                <div className="flex gap-4">
                  <button
                    onClick={() => setStep(2)}
                    className="w-full border border-gray-700 text-gray-700 rounded-lg py-2.5 hover:bg-gray-100"
                  >
                    Back
                  </button>
                  <button
                    className="w-full bg-blue-800 text-white hover:bg-blue-900 rounded-lg py-2.5"
                    onClick={() => setStep(4)}
                  >
                    Continue
                  </button>
                </div>
              </>
            )}

            {step === 4 && (
                <>
                    <h2 className="text-xl font-bold text-gray-900">
                    Choose your mode
                    </h2>

                    <p className="text-sm text-gray-500 mb-4">
                    Would you like to save money or get more money?
                    </p>

                    <div className="flex flex-col gap-4">
                    <button
                        onClick={() => setMode("save")}
                        className={`w-full p-3 rounded-lg border ${
                        mode === "save" ? "bg-blue-800 text-white" : "bg-gray-50 text-gray-900"
                        }`}
                    >
                        Save Money
                    </button>

                    <button
                        onClick={() => setMode("earn")}
                        className={`w-full p-3 rounded-lg border ${
                        mode === "earn" ? "bg-blue-800 text-white" : "bg-gray-50 text-gray-900"
                        }`}
                    >
                        Get More Money
                    </button>
                    </div>

                    <div className="flex gap-4 mt-6">
                    <button
                        onClick={() => setStep(3)}
                        className="w-full border border-gray-700 text-gray-700 rounded-lg py-2.5 hover:bg-gray-100"
                    >
                        Back
                    </button>

                    <button
                        onClick={() => console.log({ email, password, income, payFrequency, rent, utilities, groceries, insurance, debt, mode })}
                        className="w-full bg-blue-800 text-white hover:bg-blue-900 rounded-lg py-2.5"
                    >
                        Submit
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
