"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SignInButton,
  UserButton,
  Show,
  useAuth,
} from "@clerk/nextjs";
import { Button } from "@/components/ui";
import { Shield } from "lucide-react";

const navLinks = [
  { href: "/", label: "Drops" },
  { href: "/calendar", label: "Calendar" },
  { href: "/shows", label: "Trade Shows" },
  { href: "/retailers", label: "Retailer Radar" },
];

const authLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/webhooks", label: "Server Alerts" },
];

// Water droplet logo SVG
function DripLogo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="dropGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00d4ff" />
          <stop offset="50%" stopColor="#0077b6" />
          <stop offset="100%" stopColor="#7b2cbf" />
        </linearGradient>
        <linearGradient id="shineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.6)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>
      {/* Main droplet */}
      <path
        d="M16 2C16 2 6 14 6 20C6 25.5228 10.4772 30 16 30C21.5228 30 26 25.5228 26 20C26 14 16 2 16 2Z"
        fill="url(#dropGradient)"
      />
      {/* Shine highlight */}
      <ellipse
        cx="12"
        cy="18"
        rx="3"
        ry="4"
        fill="url(#shineGradient)"
        opacity="0.6"
      />
      {/* Small shine dot */}
      <circle cx="11" cy="16" r="1.5" fill="white" opacity="0.8" />
    </svg>
  );
}

export function Navigation() {
  const pathname = usePathname();
  const { isSignedIn } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (isSignedIn) {
      fetch("/api/users/me")
        .then((res) => res.json())
        .then((data) => {
          if (data.data?.isAdmin) {
            setIsAdmin(true);
          }
        })
        .catch(() => {});
    } else {
      setIsAdmin(false);
    }
  }, [isSignedIn]);

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  const NavLink = ({ href, label }: { href: string; label: string }) => (
    <Link
      href={href}
      className={`
        relative px-3 py-2 text-sm font-medium transition-all duration-200
        ${
          isActive(href)
            ? "text-[var(--drip-cyan)]"
            : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
        }
      `}
    >
      {label}
      {isActive(href) && (
        <span
          className="absolute inset-x-1 -bottom-px h-px"
          style={{
            background: "linear-gradient(90deg, transparent, var(--drip-cyan), transparent)",
          }}
        />
      )}
    </Link>
  );

  const AuthLinks = () => (
    <>
      {authLinks.map((link) => (
        <NavLink key={link.href} href={link.href} label={link.label} />
      ))}
    </>
  );

  return (
    <header
      className="sticky top-0 z-40 border-b border-white/[0.06]"
      style={{
        background: "rgba(10, 14, 20, 0.8)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative">
            <DripLogo className="h-8 w-8 transition-transform duration-300 group-hover:scale-110" />
            {/* Glow effect on hover */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-lg"
              style={{
                background: "radial-gradient(circle, rgba(0,212,255,0.4) 0%, transparent 70%)",
              }}
            />
          </div>
          <span className="text-lg font-bold text-gradient">
            Drip Drop
          </span>
        </Link>

        {/* Primary Nav */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <NavLink key={link.href} href={link.href} label={link.label} />
          ))}
        </div>

        {/* Auth Section */}
        <div className="flex items-center gap-3">
          <Show when="signed-in">
            <div className="hidden items-center gap-1 md:flex">
              <AuthLinks />
              {isAdmin && (
                <Link
                  href="/admin"
                  className={`
                    flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-all duration-200
                    ${
                      isActive("/admin")
                        ? "text-amber-400"
                        : "text-amber-400/70 hover:text-amber-400"
                    }
                  `}
                >
                  <Shield className="h-4 w-4" />
                  Admin
                </Link>
              )}
            </div>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-8 w-8 ring-2 ring-white/10 ring-offset-2 ring-offset-[var(--background)]",
                },
              }}
            />
          </Show>

          <Show when="signed-out">
            <SignInButton mode="modal">
              <Button variant="primary" size="sm">
                Sign In
              </Button>
            </SignInButton>
          </Show>
        </div>
      </nav>

      {/* Mobile Nav */}
      <div className="flex gap-1 overflow-x-auto border-t border-white/[0.06] px-4 py-2 md:hidden">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`
              whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200
              ${
                isActive(link.href)
                  ? "bg-[var(--drip-cyan)]/10 text-[var(--drip-cyan)]"
                  : "text-[var(--foreground-muted)] hover:bg-white/5 hover:text-[var(--foreground)]"
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
                whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200
                ${
                  isActive(link.href)
                    ? "bg-[var(--drip-cyan)]/10 text-[var(--drip-cyan)]"
                    : "text-[var(--foreground-muted)] hover:bg-white/5 hover:text-[var(--foreground)]"
                }
              `}
            >
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              href="/admin"
              className={`
                flex items-center gap-1 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200
                ${
                  isActive("/admin")
                    ? "bg-amber-400/10 text-amber-400"
                    : "text-amber-400/70 hover:bg-amber-400/10 hover:text-amber-400"
                }
              `}
            >
              <Shield className="h-3.5 w-3.5" />
              Admin
            </Link>
          )}
        </Show>
      </div>
    </header>
  );
}
