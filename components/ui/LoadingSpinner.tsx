interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeStyles = {
  sm: { container: "h-4 w-4", ring: "h-4 w-4" },
  md: { container: "h-8 w-8", ring: "h-8 w-8" },
  lg: { container: "h-12 w-12", ring: "h-12 w-12" },
};

export function LoadingSpinner({
  size = "md",
  className = "",
}: LoadingSpinnerProps) {
  const sizes = sizeStyles[size];

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`relative ${sizes.container}`}>
        {/* Outer ring */}
        <div
          className={`absolute inset-0 rounded-full animate-spin ${sizes.ring}`}
          style={{
            background: "conic-gradient(from 0deg, transparent, var(--drip-cyan), var(--drip-purple), transparent)",
            mask: "radial-gradient(farthest-side, transparent calc(100% - 3px), #fff calc(100% - 2px))",
            WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 3px), #fff calc(100% - 2px))",
          }}
        />
        {/* Center glow */}
        <div
          className="absolute inset-2 rounded-full animate-pulse"
          style={{
            background: "radial-gradient(circle, rgba(0,212,255,0.3) 0%, transparent 70%)",
          }}
        />
      </div>
    </div>
  );
}

export function LoadingPage() {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
      <LoadingSpinner size="lg" />
      <p className="text-sm text-[var(--foreground-muted)] animate-pulse">
        Loading...
      </p>
    </div>
  );
}
