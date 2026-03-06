import type { ReactNode } from "react";

type BadgeVariant =
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info";
type BadgeSize = "sm" | "md";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  pulse?: boolean;
  glow?: boolean;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: `
    bg-white/5
    text-[var(--foreground-muted)]
    border border-white/10
  `,
  primary: `
    bg-[var(--drip-cyan)]/10
    text-[var(--drip-cyan)]
    border border-[var(--drip-cyan)]/20
  `,
  success: `
    bg-emerald-500/10
    text-emerald-400
    border border-emerald-500/20
  `,
  warning: `
    bg-amber-500/10
    text-amber-400
    border border-amber-500/20
  `,
  danger: `
    bg-red-500/10
    text-red-400
    border border-red-500/20
  `,
  info: `
    bg-[var(--drip-purple)]/10
    text-[var(--drip-pink)]
    border border-[var(--drip-purple)]/20
  `,
};

const pulseColors: Record<BadgeVariant, { ping: string; dot: string }> = {
  default: { ping: "bg-gray-400", dot: "bg-gray-500" },
  primary: { ping: "bg-[var(--drip-cyan)]", dot: "bg-[var(--drip-cyan)]" },
  success: { ping: "bg-emerald-400", dot: "bg-emerald-500" },
  warning: { ping: "bg-amber-400", dot: "bg-amber-500" },
  danger: { ping: "bg-red-400", dot: "bg-red-500" },
  info: { ping: "bg-[var(--drip-pink)]", dot: "bg-[var(--drip-pink)]" },
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-sm",
};

export function Badge({
  children,
  variant = "default",
  size = "sm",
  pulse = false,
  glow = false,
  className = "",
}: BadgeProps) {
  const colors = pulseColors[variant];

  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        rounded-full font-medium
        transition-all duration-200
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${glow ? "shadow-[0_0_10px_currentColor]" : ""}
        ${className}
      `}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span
            className={`
              absolute inline-flex h-full w-full
              animate-ping rounded-full opacity-75
              ${colors.ping}
            `}
          />
          <span
            className={`
              relative inline-flex h-2 w-2 rounded-full
              ${colors.dot}
            `}
          />
        </span>
      )}
      {children}
    </span>
  );
}
