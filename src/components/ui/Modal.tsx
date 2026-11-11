"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types & Sizes ────────────────────────────────────────────────────────────

export type ModalSize = "sm" | "md" | "lg" | "full";

const sizeClasses: Record<ModalSize, string> = {
  sm: "max-w-md w-full",
  md: "max-w-lg w-full",
  lg: "max-w-2xl w-full",
  full: "max-w-5xl w-full",
};

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  size?: ModalSize;
  className?: string;
}

// ─── Modal Component ──────────────────────────────────────────────────────────

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  className,
}: ModalProps) {
  const [mounted, setMounted] = React.useState(false);
  const [animating, setAnimating] = React.useState(false);
  const modalRef = React.useRef<HTMLDivElement>(null);

  // Mount/Unmount handling for CSS animation
  React.useEffect(() => {
    if (isOpen) {
      setMounted(true);
      const timer = requestAnimationFrame(() => {
        setAnimating(true);
      });
      return () => cancelAnimationFrame(timer);
    } else {
      setAnimating(false);
      const timer = setTimeout(() => {
        setMounted(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Escape key handler
  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Focus trap & Body scroll lock
  React.useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Focus first focusable element inside modal
    const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusableElements && focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !modalRef.current) return;

      const focusables = modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length === 0) return;

      const firstElement = focusables[0];
      const lastElement = focusables[focusables.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    window.addEventListener("keydown", handleTabKey);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleTabKey);
    };
  }, [isOpen]);

  if (!mounted) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200",
          animating ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Panel */}
      <div
        ref={modalRef}
        className={cn(
          "relative z-10 bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto flex flex-col p-6 border border-slate-100",
          "transform transition-all duration-200 ease-out",
          animating ? "scale-100 opacity-100" : "scale-95 opacity-0",
          sizeClasses[size],
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          {title ? (
            <h3 className="text-lg font-semibold text-slate-900 leading-none">
              {title}
            </h3>
          ) : (
            <div />
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-lg p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
