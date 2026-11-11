import * as React from "react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SpinnerSize = "sm" | "md" | "lg";
export type SpinnerColor = "blue" | "white" | "slate";

export interface LoadingSpinnerProps {
  size?: SpinnerSize;
  color?: SpinnerColor;
  className?: string;
}

// ─── Maps ─────────────────────────────────────────────────────────────────────

const sizeClasses: Record<SpinnerSize, string> = {
  sm: "w-4 h-4 border-2",
  md: "w-6 h-6 border-2",
  lg: "w-8 h-8 border-[3px]",
};

const colorClasses: Record<SpinnerColor, string> = {
  blue: "border-blue-600 border-t-transparent",
  white: "border-white border-t-transparent",
  slate: "border-slate-400 border-t-transparent",
};

// ─── Component ────────────────────────────────────────────────────────────────

export function LoadingSpinner({
  size = "md",
  color = "blue",
  className,
}: LoadingSpinnerProps) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        "inline-block animate-spin rounded-full",
        sizeClasses[size],
        colorClasses[color],
        className
      )}
    />
  );
}

export default LoadingSpinner;
