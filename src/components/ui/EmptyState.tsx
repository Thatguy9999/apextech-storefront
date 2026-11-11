import * as React from "react";
import Link from "next/link";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    href: string;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 sm:p-12",
        className
      )}
    >
      {Icon && (
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4 text-slate-600">
          <Icon className="w-8 h-8 text-slate-500" strokeWidth={1.5} />
        </div>
      )}

      <h3 className="text-lg font-bold text-slate-900 mb-1">{title}</h3>

      {description && (
        <p className="text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">
          {description}
        </p>
      )}

      {action && (
        <Link href={action.href}>
          <Button variant="primary" size="md">
            {action.label}
          </Button>
        </Link>
      )}
    </div>
  );
}

export default EmptyState;
