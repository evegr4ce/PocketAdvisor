"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase/config";
import { signInWithEmailAndPassword } from "firebase/auth";
import Loader from "@/components/loader";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to sign in");
      console.error("Login error:", err);
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-[#efeffcff]">
      <section className="flex items-start justify-center min-h-screen px-6 py-12">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Left Side - Branding & Message */}
          <div className="flex flex-col justify-start space-y-6 hidden lg:flex pt-32">
            <div>
              <img
                src="/pocket_logo.png"
                alt="Pocket Advisor logo"
                className="h-48 w-auto mb-2"
              />
              <h2 className="text-4xl font-bold text-slate-900 mb-2">
                PocketAdvisor
              </h2>
              <p className="text-xl text-slate-600 leading-relaxed">
                Take control of your finances with intelligent insights and
                personalized recommendations.
              </p>
            </div>
            <div className="space-y-4">
              {/* Feature 1 */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-[#282880] bg-opacity-10">
                    <img
                      src="/bulb.png"
                      alt="Smart Budget Analysis"
                      className="h-5 w-5 object-contain"
                    />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Smart Budget Analysis
                  </h3>
                  <p className="text-slate-600 mt-1">
                    Understand where your money goes
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-[#282880] bg-opacity-10">
                    <img
                      src="/chart-histogram.png"
                      alt="AI-Powered Advisor"
                      className="h-5 w-5 object-contain"
                    />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    AI-Powered Advisor
                  </h3>
                  <p className="text-slate-600 mt-1">
                    Get personalized financial guidance
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-[#282880] bg-opacity-10">
                    <img
                      src="/comment.png"
                      alt="Real-time Insights"
                      className="h-5 w-5 object-contain"
                    />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Real-time Insights
                  </h3>
                  <p className="text-slate-600 mt-1">
                    Monitor your financial health instantly
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="flex flex-col justify-start pt-32">
            <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10">
              <div className="mb-2 lg:hidden flex justify-center mb-6">
                <img
                  src="/pocket_logo.png"
                  alt="Pocket Advisor logo"
                  className="h-20 w-auto"
                />
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                Welcome Back
              </h1>
              <p className="text-slate-600 mb-8">
                Sign in to your account to continue
              </p>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
              )}

              <form className="space-y-6" onSubmit={handleLogin}>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-slate-900 mb-3"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#282880] focus:ring-offset-2 focus:border-transparent transition"
                    placeholder="you@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-slate-900 mb-3"
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    id="password"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#282880] focus:ring-offset-2 focus:border-transparent transition"
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-[#282880] text-white font-semibold rounded-lg hover:bg-blue-900 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#282880] focus:ring-offset-2"
                >
                  {loading ? "Signing in..." : "Sign In"}
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-3 bg-white text-slate-600">
                      New to PocketAdvisor?
                    </span>
                  </div>
                </div>

                <div className="flex items-center">
                <a
                  href="/signup"
                  className="w-full py-3 px-4 border-2 border-[#282880] text-[#282880] font-semibold rounded-lg hover:bg-slate-50 transition-colors duration-200 text-center"
                >
                  Create Account
                </a>
                </div>
              </form>
            </div>

            <p className="text-center text-slate-600 text-sm mt-8">
              © 2025 PocketAdvisor. All rights reserved.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
