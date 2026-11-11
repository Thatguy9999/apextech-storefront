import * as React from "react";
import { cn } from "@/lib/utils";

// ─── Variants ─────────────────────────────────────────────────────────────────

const variantClasses = {
  default: "bg-slate-100 text-slate-700 border-slate-200",
  blue: "bg-blue-50 text-blue-700 border-blue-200",
  green: "bg-green-50 text-green-700 border-green-200",
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  red: "bg-red-50 text-red-700 border-red-200",
} as const;

export type BadgeVariant = keyof typeof variantClasses;

// ─── Props ────────────────────────────────────────────────────────────────────

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  className?: string;
  children: React.ReactNode;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Badge({
  variant = "default",
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5",
        "rounded-full border text-xs font-medium leading-none",
        "transition-colors duration-150",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export default Badge;
