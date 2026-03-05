import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
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
}: CardProps) {
  return (
    <div
      className={`
        rounded-lg border border-gray-200 bg-white shadow-sm
        dark:border-gray-700 dark:bg-gray-800
        ${hover ? "transition-shadow hover:shadow-md" : ""}
        ${paddingStyles[padding]}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }: CardHeaderProps) {
  return (
    <div
      className={`
        border-b border-gray-200 px-4 py-3
        dark:border-gray-700
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
        border-t border-gray-200 px-4 py-3
        dark:border-gray-700
        ${className}
      `}
    >
      {children}
    </div>
  );
}
