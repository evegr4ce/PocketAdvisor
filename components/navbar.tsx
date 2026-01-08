"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Action Plan", href: "/action-plan" },
  { name: "Subscriptions", href: "/subscriptions" },
  { name: "Chatbot", href: "/chat" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b bg-white">
      <div className="flex gap-6">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`text-sm font-medium ${
              pathname === item.href
                ? "text-black border-b-2 border-black"
                : "text-gray-500 hover:text-black"
            }`}
          >
            {item.name}
          </Link>
        ))}
      </div>

      <div className="text-sm text-gray-600">
        Profile
      </div>
    </nav>
  );
}
