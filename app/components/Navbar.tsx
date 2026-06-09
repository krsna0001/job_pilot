'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { title: "Dashboard", href: "/dashboard" },
  { title: "Find Jobs", href: "/find-jobs" },
  { title: "Saved Jobs", href: "/saved-jobs" },
  { title: "Profile", href: "/profile" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-6 text-sm font-medium">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`transition-colors duration-200 hover:text-accent ${
              isActive ? "text-accent font-semibold" : "text-text-secondary"
            }`}
          >
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}
