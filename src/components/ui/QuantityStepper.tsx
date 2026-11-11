"use client";

import * as React from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface QuantityStepperProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (n: number) => void;
  disabled?: boolean;
  className?: string;
}

export function QuantityStepper({
  value,
  min = 1,
  max = 99,
  onChange,
  disabled = false,
  className,
}: QuantityStepperProps) {
  const [isChanging, setIsChanging] = React.useState(false);

  const canDecrease = !disabled && value > min;
  const canIncrease = !disabled && value < max;

  const handleDecrease = () => {
    if (!canDecrease) return;
    triggerAnimation();
    onChange(value - 1);
  };

  const handleIncrease = () => {
    if (!canIncrease) return;
    triggerAnimation();
    onChange(value + 1);
  };

  const triggerAnimation = () => {
    setIsChanging(true);
    setTimeout(() => {
      setIsChanging(false);
    }, 150);
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 select-none",
        disabled && "opacity-50 pointer-events-none",
        className
      )}
    >
      <button
        type="button"
        onClick={handleDecrease}
        disabled={!canDecrease}
        aria-label="Decrease quantity"
        className={cn(
          "w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-700 bg-white transition-colors duration-150",
          canDecrease
            ? "hover:bg-slate-50 hover:border-slate-300 active:scale-95"
            : "opacity-40 cursor-not-allowed border-slate-100"
        )}
      >
        <Minus className="w-3.5 h-3.5" />
      </button>

      <span
        aria-live="polite"
        className={cn(
          "min-w-8 text-center text-sm font-semibold text-slate-900 inline-block transition-transform duration-150",
          isChanging ? "scale-110 text-blue-600" : "scale-100"
        )}
      >
        {value}
      </span>

      <button
        type="button"
        onClick={handleIncrease}
        disabled={!canIncrease}
        aria-label="Increase quantity"
        className={cn(
          "w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-700 bg-white transition-colors duration-150",
          canIncrease
            ? "hover:bg-slate-50 hover:border-slate-300 active:scale-95"
            : "opacity-40 cursor-not-allowed border-slate-100"
        )}
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export default QuantityStepper;
