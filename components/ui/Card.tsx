import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
  glow?: boolean;
  gradient?: boolean;
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

interface CardBodyProps {
  children: ReactNode;
  className?: string;
}

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

const paddingStyles = {
  none: "",
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
};

export function Card({
  children,
  className = "",
  padding = "md",
  hover = false,
  glow = false,
  gradient = false,
}: CardProps) {
  const baseStyles = `
    relative rounded-xl
    bg-[var(--background-elevated)]
    border border-white/[0.06]
    transition-all duration-300 ease-out
  `;

  const hoverStyles = hover
    ? `hover:border-[var(--drip-cyan)]/30 hover:shadow-[0_0_30px_rgba(0,212,255,0.1)] hover:-translate-y-0.5`
    : "";

  const glowStyles = glow
    ? `shadow-[0_0_20px_rgba(0,212,255,0.15)]`
    : "";

  const gradientStyles = gradient
    ? `border-gradient`
    : "";

  return (
    <div
      className={`
        ${baseStyles}
        ${hoverStyles}
        ${glowStyles}
        ${gradientStyles}
        ${paddingStyles[padding]}
        ${className}
      `}
    >
      {/* Subtle top highlight for depth */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-xl"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
        }}
      />
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }: CardHeaderProps) {
  return (
    <div
      className={`
        border-b border-white/[0.06] px-4 py-3
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export function CardBody({ children, className = "" }: CardBodyProps) {
  return <div className={`px-4 py-4 ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = "" }: CardFooterProps) {
  return (
    <div
      className={`
        border-t border-white/[0.06] px-4 py-3
        ${className}
      `}
    >
      {children}
    </div>
  );
}
