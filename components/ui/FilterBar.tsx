"use client";

import { type ReactNode } from "react";
import { X, SlidersHorizontal } from "lucide-react";

interface FilterOption {
  value: string;
  label: string;
}

interface SelectFilterProps {
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
  placeholder?: string;
}

interface FilterBarProps {
  children: ReactNode;
  className?: string;
}

export function FilterBar({ children, className = "" }: FilterBarProps) {
  return (
    <div
      className={`
        flex flex-wrap items-center gap-4
        p-4 rounded-2xl
        bg-white/[0.02] border border-white/[0.06]
        backdrop-blur-sm
        ${className}
      `}
    >
      <div className="flex items-center gap-2 text-[var(--foreground-muted)]">
        <SlidersHorizontal className="h-4 w-4" />
        <span className="text-sm font-medium">Filter</span>
      </div>
      <div className="h-6 w-px bg-white/10 hidden sm:block" />
      <div className="flex flex-wrap items-center gap-3">
        {children}
      </div>
    </div>
  );
}

export function SelectFilter({
  label,
  value,
  options,
  onChange,
  placeholder = "All",
}: SelectFilterProps) {
  const isActive = value !== "";

  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`
          appearance-none cursor-pointer
          pl-3 pr-8 py-2 rounded-xl text-sm font-medium
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-[var(--drip-cyan)]/50
          ${
            isActive
              ? "bg-[var(--drip-cyan)]/10 text-[var(--drip-cyan)] border border-[var(--drip-cyan)]/30"
              : "bg-white/5 text-[var(--foreground-muted)] border border-white/10 hover:bg-white/10 hover:text-[var(--foreground)]"
          }
        `}
      >
        <option value="" className="bg-[var(--background-elevated)] text-[var(--foreground)]">
          {label}: {placeholder}
        </option>
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="bg-[var(--background-elevated)] text-[var(--foreground)]"
          >
            {option.label}
          </option>
        ))}
      </select>

      {/* Custom dropdown arrow */}
      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg
          className={`h-4 w-4 transition-colors ${isActive ? "text-[var(--drip-cyan)]" : "text-[var(--foreground-muted)]"}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}

interface MultiSelectFilterProps {
  label: string;
  values: string[];
  options: FilterOption[];
  onChange: (values: string[]) => void;
}

export function MultiSelectFilter({
  label,
  values,
  options,
  onChange,
}: MultiSelectFilterProps) {
  const toggleValue = (value: string) => {
    if (values.includes(value)) {
      onChange(values.filter((v) => v !== value));
    } else {
      onChange([...values, value]);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-medium text-[var(--foreground-muted)]">
        {label}
      </label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = values.includes(option.value);
          return (
            <button
              key={option.value}
              onClick={() => toggleValue(option.value)}
              className={`
                px-3 py-1.5 rounded-xl text-sm font-medium
                transition-all duration-200
                ${
                  isSelected
                    ? "bg-[var(--drip-cyan)]/20 text-[var(--drip-cyan)] border border-[var(--drip-cyan)]/30"
                    : "bg-white/5 text-[var(--foreground-muted)] border border-white/10 hover:bg-white/10"
                }
              `}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface DateRangeFilterProps {
  label: string;
  startDate: string;
  endDate: string;
  onStartChange: (date: string) => void;
  onEndChange: (date: string) => void;
}

export function DateRangeFilter({
  label,
  startDate,
  endDate,
  onStartChange,
  onEndChange,
}: DateRangeFilterProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-medium text-[var(--foreground-muted)]">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="date"
          value={startDate}
          onChange={(e) => onStartChange(e.target.value)}
          className="
            px-3 py-2 rounded-xl text-sm
            bg-white/5 border border-white/10
            text-[var(--foreground)]
            focus:outline-none focus:ring-2 focus:ring-[var(--drip-cyan)]/50 focus:border-[var(--drip-cyan)]/30
            transition-all duration-200
          "
        />
        <span className="text-[var(--foreground-muted)]">→</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => onEndChange(e.target.value)}
          className="
            px-3 py-2 rounded-xl text-sm
            bg-white/5 border border-white/10
            text-[var(--foreground)]
            focus:outline-none focus:ring-2 focus:ring-[var(--drip-cyan)]/50 focus:border-[var(--drip-cyan)]/30
            transition-all duration-200
          "
        />
      </div>
    </div>
  );
}

export function ClearFiltersButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="
        ml-auto flex items-center gap-1.5
        px-3 py-2 rounded-xl text-sm font-medium
        text-[var(--foreground-muted)]
        hover:text-red-400 hover:bg-red-400/10
        transition-all duration-200
      "
    >
      <X className="h-4 w-4" />
      Clear
    </button>
  );
}
