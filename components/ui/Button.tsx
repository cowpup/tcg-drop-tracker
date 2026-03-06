"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  glow?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: `
    bg-gradient-to-r from-[var(--drip-cyan)] via-[var(--drip-teal)] to-[var(--drip-blue)]
    text-white font-semibold
    shadow-[0_0_20px_rgba(0,212,255,0.3)]
    hover:shadow-[0_0_30px_rgba(0,212,255,0.5)]
    hover:brightness-110
    active:scale-[0.98]
  `,
  secondary: `
    bg-[var(--background-elevated)]
    text-[var(--foreground)]
    border border-white/10
    hover:border-[var(--drip-cyan)]/30
    hover:bg-[var(--background-secondary)]
  `,
  outline: `
    bg-transparent
    text-[var(--foreground)]
    border border-white/10
    hover:border-[var(--drip-cyan)]/50
    hover:bg-[var(--drip-cyan)]/5
    hover:text-[var(--drip-cyan)]
  `,
  ghost: `
    bg-transparent
    text-[var(--foreground-muted)]
    hover:text-[var(--foreground)]
    hover:bg-white/5
  `,
  danger: `
    bg-gradient-to-r from-red-600 to-red-500
    text-white font-semibold
    shadow-[0_0_20px_rgba(239,68,68,0.3)]
    hover:shadow-[0_0_30px_rgba(239,68,68,0.5)]
    hover:brightness-110
    active:scale-[0.98]
  `,
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm gap-1.5",
  md: "px-4 py-2 text-sm gap-2",
  lg: "px-6 py-3 text-base gap-2",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = "",
      variant = "primary",
      size = "md",
      loading = false,
      glow = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={`
          relative inline-flex items-center justify-center
          rounded-lg font-medium
          transition-all duration-200 ease-out
          disabled:cursor-not-allowed disabled:opacity-40
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--drip-cyan)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${glow ? "animate-[pulse-glow_2s_ease-in-out_infinite]" : ""}
          ${className}
        `}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
