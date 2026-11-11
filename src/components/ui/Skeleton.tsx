import * as React from "react";
import { cn } from "@/lib/utils";

// ─── Props ────────────────────────────────────────────────────────────────────

export type SkeletonVariant = "rect" | "circle" | "text";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: SkeletonVariant;
  className?: string;
}

// ─── Variant Styles ───────────────────────────────────────────────────────────

const variantClasses: Record<SkeletonVariant, string> = {
  rect: "rounded-lg",
  circle: "rounded-full",
  text: "rounded h-4 w-full",
};

// ─── Component ────────────────────────────────────────────────────────────────

export function Skeleton({
  variant = "rect",
  className,
  ...props
}: SkeletonProps) {
  return (
    <div
      role="status"
      aria-label="Loading..."
      className={cn(
        "animate-pulse bg-slate-200",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}

// ─── Composite helpers ────────────────────────────────────────────────────────

/** Pre-built card skeleton matching <ProductCard> dimensions */
export function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 space-y-3">
      <Skeleton variant="rect" className="h-48 w-full" />
      <Skeleton variant="text" className="h-4 w-3/4" />
      <Skeleton variant="text" className="h-4 w-1/2" />
      <div className="flex items-center justify-between pt-1">
        <Skeleton variant="text" className="h-6 w-20" />
        <Skeleton variant="rect" className="h-9 w-24 rounded-lg" />
      </div>
    </div>
  );
}

export default Skeleton;
