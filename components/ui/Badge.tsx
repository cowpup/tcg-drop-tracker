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
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
  primary: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  success: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  warning:
    "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  danger: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  info: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
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
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1 rounded-full font-medium
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span
            className={`
              absolute inline-flex h-full w-full animate-ping rounded-full opacity-75
              ${variant === "danger" ? "bg-red-400" : ""}
              ${variant === "warning" ? "bg-amber-400" : ""}
              ${variant === "success" ? "bg-green-400" : ""}
              ${variant === "primary" ? "bg-blue-400" : ""}
            `}
          />
          <span
            className={`
              relative inline-flex h-2 w-2 rounded-full
              ${variant === "danger" ? "bg-red-500" : ""}
              ${variant === "warning" ? "bg-amber-500" : ""}
              ${variant === "success" ? "bg-green-500" : ""}
              ${variant === "primary" ? "bg-blue-500" : ""}
            `}
          />
        </span>
      )}
      {children}
    </span>
  );
}
