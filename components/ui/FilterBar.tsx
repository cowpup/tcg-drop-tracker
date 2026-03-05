"use client";

import { type ReactNode } from "react";

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
        flex flex-wrap items-center gap-3 rounded-lg border border-gray-200
        bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/50
        ${className}
      `}
    >
      {children}
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
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm
          focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500
          dark:border-gray-600 dark:bg-gray-700 dark:text-white
        "
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
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
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
        {label}
      </label>
      <div className="flex flex-wrap gap-1">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => toggleValue(option.value)}
            className={`
              rounded-full px-2.5 py-1 text-xs font-medium transition-colors
              ${
                values.includes(option.value)
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              }
            `}
          >
            {option.label}
          </button>
        ))}
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
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="date"
          value={startDate}
          onChange={(e) => onStartChange(e.target.value)}
          className="
            rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm
            focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500
            dark:border-gray-600 dark:bg-gray-700 dark:text-white
          "
        />
        <span className="text-gray-400">to</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => onEndChange(e.target.value)}
          className="
            rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm
            focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500
            dark:border-gray-600 dark:bg-gray-700 dark:text-white
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
        ml-auto rounded-md px-3 py-1.5 text-sm font-medium text-gray-500
        hover:bg-gray-200 hover:text-gray-700
        dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200
      "
    >
      Clear filters
    </button>
  );
}
