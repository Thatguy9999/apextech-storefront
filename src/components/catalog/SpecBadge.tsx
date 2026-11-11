import { cn } from "@/lib/utils";

interface SpecBadgeProps {
  label: string;
  value: string | number;
  unit?: string;
  highlight?: boolean;
}

export default function SpecBadge({ label, value, unit, highlight = false }: SpecBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium",
        highlight
          ? "border border-blue-200 bg-blue-50 text-blue-700"
          : "bg-slate-100 text-slate-700"
      )}
      title={label}
    >
      <span className="font-semibold">{value}</span>
      {unit && <span className="opacity-75">{unit}</span>}
    </span>
  );
}
