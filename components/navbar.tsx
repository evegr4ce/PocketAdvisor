"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Action Plan", href: "/action-plan" },
  { name: "Subscriptions", href: "/subscriptions" },
  { name: "Affordability", href: "/affordability" },
  { name: "Advisor", href: "/chat" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="w-full flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-[#eeeefb]">
      <div className="flex items-center gap-3">
        <img
          src="/pocket_logo.png"
          alt="Pocket Advisor Logo"
          className="h-15 w-13"
        />
        <h1
          className="text-3xl font-semibold text-black"
          style={{ fontFamily: "Arial, serif" }}
        >
          Pocket Advisor
        </h1>
      </div>
      <div className="flex gap-6">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`text-sm font-medium pb-1 ${
              pathname === item.href
                ? "text-black border-b-2 border-black"
                : "text-gray-500 hover:text-black"
            }`}
          >
            {item.name}
          </Link>
        ))}
      </div>
    </nav>
  );
}
