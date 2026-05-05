import type { LucideIcon } from "lucide-react";

type KpiCardProps = {
  label: string;
  value: number | string;
  icon: LucideIcon;
  iconBgClass: string;
  iconColorClass: string;
  subtitle?: string;
};

export function KpiCard({
  label,
  value,
  icon: Icon,
  iconBgClass,
  iconColorClass,
  subtitle,
}: KpiCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-start gap-4 shadow-sm">
      <div className={`${iconBgClass} rounded-lg p-3`}>
        <Icon className={`w-5 h-5 ${iconColorClass}`} />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-slate-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-slate-900 mt-0.5">{value}</p>
        {subtitle && (
          <p className="text-xs text-slate-400 mt-1 truncate">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
