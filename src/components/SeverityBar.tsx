import type { Severity } from "../types";
import { useTranslation } from "../hooks/useTranslation";

type SeverityBarProps = {
  critical: number;
  serious: number;
  moderate: number;
  minor: number;
  total: number;
};

const CONFIG: Record<Severity, { labelKey: string; bar: string; dot: string }> = {
  critical: { labelKey: "severity_critical", bar: "bg-red-500", dot: "bg-red-500" },
  serious: { labelKey: "severity_serious", bar: "bg-orange-500", dot: "bg-orange-500" },
  moderate: { labelKey: "severity_moderate", bar: "bg-amber-400", dot: "bg-amber-400" },
  minor: { labelKey: "severity_minor", bar: "bg-blue-400", dot: "bg-blue-400" },
};

export function SeverityBar({
  critical,
  serious,
  moderate,
  minor,
  total,
}: SeverityBarProps) {
  const { t, direction } = useTranslation();
  if (total === 0) return null;

  const items: { key: Severity; count: number }[] = [
    { key: "critical", count: critical },
    { key: "serious", count: serious },
    { key: "moderate", count: moderate },
    { key: "minor", count: minor },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">
        {t("severity_distribution_title")}
      </h3>

      {/* Proportional bar */}
      <div
        className={`flex rounded-full overflow-hidden h-3 mb-5 ${
          direction === "rtl" ? "flex-row-reverse" : ""
        }`}
      >
        {items.map(({ key, count }) => {
          const pct = (count / total) * 100;
          if (pct === 0) return null;
          return (
            <div
              key={key}
              className={`${CONFIG[key].bar} transition-all duration-500`}
              style={{ width: `${pct}%` }}
              title={`${t(CONFIG[key].labelKey)}: ${count}`}
            />
          );
        })}
      </div>

      {/* Legend */}
      <div
        className={`flex flex-wrap gap-x-6 gap-y-2 ${
          direction === "rtl" ? "justify-end" : ""
        }`}
      >
        {items.map(({ key, count }) => {
          const pct = total > 0 ? ((count / total) * 100).toFixed(1) : "0";
          const cfg = CONFIG[key];
          return (
            <div key={key} className="flex items-center gap-2 text-sm">
              <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
              <span className="text-slate-600">
                {t(cfg.labelKey)}:{" "}
                <span className="font-semibold text-slate-800">{count}</span>
                <span className="text-slate-400 ml-1">({pct}%)</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
