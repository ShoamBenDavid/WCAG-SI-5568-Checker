import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import type { PageScanResult, AccessibilityIssue } from "../types";
import { useTranslation } from "../hooks/useTranslation";

const SEVERITY_COLORS: Record<string, string> = {
  critical: "#ef4444",
  serious: "#f97316",
  moderate: "#eab308",
  minor: "#3b82f6",
};

const WCAG_PRINCIPLE_KEYS: Record<string, string> = {
  "1": "principle_perceivable",
  "2": "principle_operable",
  "3": "principle_understandable",
  "4": "principle_robust",
};

const WCAG_PRINCIPLES_EN: Record<string, string> = {
  "1": "Perceivable",
  "2": "Operable",
  "3": "Understandable",
  "4": "Robust",
};

/* ------------------------------------------------------------------ */
/*  Score by page (bar chart)                                         */
/* ------------------------------------------------------------------ */

type ScoreTrendChartProps = { pages: PageScanResult[] };

export function ScoreTrendChart({ pages }: ScoreTrendChartProps) {
  const { t, direction } = useTranslation();
  const data = pages.map((p) => {
    let label: string;
    try {
      label = new URL(p.pageUrl).pathname || "/";
    } catch {
      label = p.pageUrl;
    }
    if (label.length > 22) label = "…" + label.slice(-20);
    return { name: label, score: p.accessibilityScore };
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">
        {t("chart_score_by_page")}
      </h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#94a3b8" />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 12 }}
            stroke="#94a3b8"
            orientation={direction === "rtl" ? "right" : "left"}
          />
          <Tooltip
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              fontSize: 13,
            }}
          />
          <Bar
            dataKey="score"
            fill="#6366f1"
            radius={[4, 4, 0, 0]}
            name={t("chart_score_label")}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Severity distribution (donut chart)                               */
/* ------------------------------------------------------------------ */

type SeverityDistributionChartProps = {
  critical: number;
  serious: number;
  moderate: number;
  minor: number;
};

export function SeverityDistributionChart({
  critical,
  serious,
  moderate,
  minor,
}: SeverityDistributionChartProps) {
  const { t } = useTranslation();
  const data = [
    { key: "critical", name: t("severity_critical"), value: critical },
    { key: "serious", name: t("severity_serious"), value: serious },
    { key: "moderate", name: t("severity_moderate"), value: moderate },
    { key: "minor", name: t("severity_minor"), value: minor },
  ].filter((d) => d.value > 0);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">
        {t("chart_severity_distribution")}
      </h3>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            label={false}
            labelLine={false}
          >
            {data.map((entry) => (
              <Cell
                key={entry.key}
                fill={SEVERITY_COLORS[entry.key]}
                stroke="none"
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              fontSize: 13,
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-600">
        {data.map((entry) => (
          <span key={entry.key} className="inline-flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: SEVERITY_COLORS[entry.key] }}
            />
            {entry.name} ({entry.value})
          </span>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Category breakdown (horizontal bar chart)                         */
/* ------------------------------------------------------------------ */

type CategoryBreakdownChartProps = { issues: AccessibilityIssue[] };

export function CategoryBreakdownChart({
  issues,
}: CategoryBreakdownChartProps) {
  const counts = new Map<string, number>();
  for (const issue of issues) {
    const principleKey = issue.wcagReference?.charAt(0) ?? "";
    const name = WCAG_PRINCIPLES_EN[principleKey] || "Other";
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }

  const data = Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm" dir="ltr">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">
        WCAG Category Breakdown
      </h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            type="number"
            tick={{ fontSize: 12 }}
            stroke="#94a3b8"
            reversed={false}
          />
          <YAxis
            dataKey="name"
            type="category"
            width={100}
            tick={{ fontSize: 12 }}
            stroke="#94a3b8"
            orientation="left"
          />
          <Tooltip
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              fontSize: 13,
            }}
          />
          <Bar
            dataKey="count"
            fill="#8b5cf6"
            radius={[0, 4, 4, 0]}
            name="Issues"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
