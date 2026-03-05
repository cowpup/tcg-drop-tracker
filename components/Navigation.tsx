"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SignInButton,
  UserButton,
  Show,
} from "@clerk/nextjs";
import { Button } from "@/components/ui";

const navLinks = [
  { href: "/", label: "Drops" },
  { href: "/calendar", label: "Calendar" },
  { href: "/shows", label: "Trade Shows" },
  { href: "/retailers", label: "Retailers" },
];

const authLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/webhooks", label: "Webhooks" },
];

export function Navigation() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  const AuthLinks = () => (
    <>
      {authLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`
            rounded-md px-3 py-2 text-sm font-medium transition-colors
            ${
              isActive(link.href)
                ? "bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
            }
          `}
        >
          {link.label}
        </Link>
      ))}
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <svg
              className="h-5 w-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            TCG Drop Tracker
          </span>
        </Link>

        {/* Primary Nav */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`
                rounded-md px-3 py-2 text-sm font-medium transition-colors
                ${
                  isActive(link.href)
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                }
              `}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Auth Section */}
        <div className="flex items-center gap-3">
          <Show when="signed-in">
            <div className="hidden items-center gap-1 md:flex">
              <AuthLinks />
            </div>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-8 w-8",
                },
              }}
            />
          </Show>

          <Show when="signed-out">
            <SignInButton mode="modal">
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </SignInButton>
          </Show>
        </div>
      </nav>

      {/* Mobile Nav */}
      <div className="flex gap-1 overflow-x-auto border-t border-gray-200 px-4 py-2 md:hidden dark:border-gray-800">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`
              whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors
              ${
                isActive(link.href)
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              }
            `}
          >
            {link.label}
          </Link>
        ))}
        <Show when="signed-in">
          {authLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`
                whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors
                ${
                  isActive(link.href)
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                }
              `}
            >
              {link.label}
            </Link>
          ))}
        </Show>
      </div>
    </header>
  );
}
