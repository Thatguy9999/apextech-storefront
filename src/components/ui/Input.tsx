import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      label,
      error,
      hint,
      startIcon,
      endIcon,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            {label}
          </label>
        )}

        <div className="relative rounded-lg shadow-sm">
          {startIcon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              {startIcon}
            </div>
          )}

          <input
            id={inputId}
            type={type}
            ref={ref}
            disabled={disabled}
            aria-invalid={error ? "true" : undefined}
            aria-describedby={
              error
                ? `${inputId}-error`
                : hint
                ? `${inputId}-hint`
                : undefined
            }
            className={cn(
              "block w-full rounded-lg text-sm bg-white text-slate-900 transition duration-150 ease-in-out border py-2.5 px-3.5",
              "focus:outline-none focus:ring-2 focus:ring-offset-0",
              startIcon && "pl-10",
              endIcon && "pr-10",
              error
                ? "border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500"
                : "border-slate-300 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500",
              disabled &&
                "bg-slate-50 text-slate-500 cursor-not-allowed border-slate-200 shadow-none",
              className
            )}
            {...props}
          />

          {endIcon && (
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
              {endIcon}
            </div>
          )}
        </div>

        {error ? (
          <p id={`${inputId}-error`} className="text-xs text-red-600 mt-1">
            {error}
          </p>
        ) : hint ? (
          <p id={`${inputId}-hint`} className="text-xs text-slate-500 mt-1">
            {hint}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
