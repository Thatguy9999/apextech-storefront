import * as React from "react";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "./LoadingSpinner";

// ─── Variants & Sizes ────────────────────────────────────────────────────────

const variantClasses = {
  primary:
    "bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md focus-visible:ring-blue-500",
  secondary:
    "bg-slate-900 hover:bg-slate-800 text-white shadow-sm focus-visible:ring-slate-700",
  outline:
    "border border-slate-300 hover:border-blue-600 text-slate-700 hover:text-blue-600 bg-white focus-visible:ring-blue-500",
  ghost:
    "text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus-visible:ring-slate-400",
  danger:
    "bg-red-500 hover:bg-red-600 text-white shadow-sm focus-visible:ring-red-500",
} as const;

const sizeClasses = {
  sm: "h-8 px-3 text-xs gap-1.5 rounded-md",
  md: "h-10 px-4 text-sm gap-2 rounded-lg",
  lg: "h-12 px-6 text-base gap-2.5 rounded-xl",
} as const;

export type ButtonVariant = keyof typeof variantClasses;
export type ButtonSize = keyof typeof sizeClasses;

// ─── Base Props ───────────────────────────────────────────────────────────────

interface ButtonBaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  asChild?: boolean;
}

// ─── Polymorphic Types ────────────────────────────────────────────────────────

type ButtonProps<T extends React.ElementType = "button"> = ButtonBaseProps &
  Omit<React.ComponentPropsWithRef<T>, keyof ButtonBaseProps | "as"> & {
    as?: T;
  };

// ─── Component ────────────────────────────────────────────────────────────────

function ButtonInner<T extends React.ElementType = "button">(
  {
    as,
    variant = "primary",
    size = "md",
    loading = false,
    disabled = false,
    asChild = false,
    className,
    children,
    ...props
  }: ButtonProps<T>,
  ref: React.ForwardedRef<React.ElementRef<T>>
) {
  const Tag: React.ElementType = as ?? "button";

  const isDisabled = disabled || loading;

  return (
    <Tag
      ref={ref}
      disabled={Tag === "button" ? isDisabled : undefined}
      aria-disabled={isDisabled}
      aria-busy={loading}
      className={cn(
        // Base
        "inline-flex items-center justify-center font-medium transition-all duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "select-none whitespace-nowrap",
        // Variant
        variantClasses[variant],
        // Size
        sizeClasses[size],
        // Disabled / Loading
        isDisabled &&
          "opacity-50 cursor-not-allowed pointer-events-none",
        className
      )}
      {...props}
    >
      {loading && (
        <LoadingSpinner
          size={size === "lg" ? "sm" : "sm"}
          color={
            variant === "outline" || variant === "ghost"
              ? "slate"
              : "white"
          }
        />
      )}
      {children}
    </Tag>
  );
}

export const Button = React.forwardRef(ButtonInner) as <
  T extends React.ElementType = "button"
>(
  props: ButtonProps<T> & { ref?: React.ForwardedRef<React.ElementRef<T>> }
) => React.ReactElement;

export default Button;
