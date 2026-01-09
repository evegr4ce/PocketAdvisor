"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { auth } from "@/lib/firebase/config";
import { signOut } from "firebase/auth";

const navItems = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Action Plan", href: "/action-plan" },
  { name: "Subscriptions", href: "/subscriptions" },
  { name: "Affordability", href: "/affordability" },
  { name: "Advisor", href: "/chat" },
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
    <nav className="fixed left-0 top-0 h-screen w-64 flex flex-col border-r border-gray-200 bg-[#eeeefb] p-6">
      {/* Logo */}
      <div className="mb-8 flex items-center justify-center">
        <img
          src="/pocket_logo.png"
          alt="PocketAdvisor Logo"
          className="h-16 w-auto"
        />
      </div>

      <div className="flex flex-col gap-4 flex-1">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`text-sm font-medium text-gray-600 px-4 py-3 rounded-lg transition border-b-2 ${
              pathname === item.href
                ? "border-b-2 border-black"
                : "border-b-2 border-transparent hover:text-black"
            }`}
          >
            {item.name}
          </Link>
        ))}
      </div>
      <button
        onClick={handleLogout}
        className="text-sm font-medium text-gray-600 hover:text-black transition-colors px-4 py-2 rounded-lg hover:bg-gray-200 w-full text-left"
      >
        Logout
      </button>
    </nav>
  );
}
