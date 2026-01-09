"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { auth } from "@/lib/firebase/config";
import { signOut } from "firebase/auth";

const navItems = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Advisor", href: "/chat" },
  { name: "Action Plan", href: "/action-plan" },
  { name: "Subscriptions", href: "/subscriptions" },
  { name: "Affordability", href: "/affordability" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <nav className="fixed left-0 top-0 h-screen w-64 flex flex-col border-r border-gray-200 bg-[#5a55d5ff] pt-4 pb-6 px-6">
      <div className="flex flex-col gap-2 mt-6">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`text-base text-white px-4 py-3 rounded-lg transition flex items-center gap-2 ${
              pathname === item.href
                ? "underline font-bold"
                : "no-underline hover:text-white font-medium"
            }`}
            style={
              pathname === item.href
                ? { textUnderlineOffset: "0.4em" }
                : undefined
            }
          >
            {item.name === "Dashboard" && <img src="/home.png" alt="Home" className="w-5 h-5" />}
            {item.name === "Advisor" && <img src="/comment.png" alt="Advisor" className="w-5 h-5" />}
            {item.name === "Action Plan" && <img src="/chart-histogram.png" alt="Action Plan" className="w-5 h-5" />}
            {item.name === "Subscriptions" && <img src="/bulb.png" alt="Subscriptions" className="w-5 h-5" />}
            {item.name === "Affordability" && <img src="/rocket-lunch.png" alt="Affordability" className="w-5 h-5" />}
            {item.name}
          </Link>
        ))}
      </div>
      <div className="flex-1" />
      <div className="mt-auto pt-3 -mb-6">
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-white hover:text-white transition-colors px-4 py-2 -mb-6 rounded-lg hover:bg-white/20 text-left"
          >
            Logout
          </button>
          <img
            src="/pocket_logo.png"
            alt="PocketAdvisor Logo"
            className="h-32 w-32 -mr-6"
          />
        </div>
      </div>
    </nav>
  );
}
