
"use client";
import { useState} from "react";
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  return (
    <div>
      <section className="bg-white min-h-screen">
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto min-h-screen">

          {/* ADD LOGOO HERE */}
          <img
              src="/pocket_logo.png"
              alt="Pocket Advisor logo"
              className="h-[230px] w-auto"
            />



          <h1 className="flex items-center mb-6 text-3xl font-semibold text-black">
            PocketAdvisor
          </h1>

          <div className="w-full bg-white rounded-lg shadow-lg border border-gray-200 sm:max-w-md xl:p-0">
            <div className="p-6 space-y-4 md:space-y-6 sm:p-8">



              <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
                Sign in to your account
              </h1>

              <form className="space-y-4 md:space-y-6" action="#">

                <div>
                  <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900">
                    Your email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                    placeholder="name@company.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    id="password"
                    placeholder="••••••••"
                    className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-800 text-white hover:bg-blue-900 cursor-pointer focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-colors"
                >
                  Sign in
                </button>

                <p className="text-sm font-light text-gray-500">
                  Don&apos;t have an account yet?{" "}
                  <a href="/signup" className="font-medium text-primary-600 hover:underline">
                    Sign up
                  </a>
                </p>

              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
