import type { ScannerStandard, WcagCheckStat } from "../types";
import { useTranslation } from "../hooks/useTranslation";
import { pickStatText } from "../lib/issueText";

type WcagChecksStatsProps = {
  stats: WcagCheckStat[];
  standard: ScannerStandard;
  standardLabel: string;
};

const SEVERITY_STYLES: Record<string, string> = {
  critical: "text-red-700 bg-red-100",
  serious: "text-orange-700 bg-orange-100",
  moderate: "text-amber-700 bg-amber-100",
  minor: "text-blue-700 bg-blue-100",
};

const SEVERITY_LABEL_KEY: Record<string, string> = {
  critical: "severity_critical",
  serious: "severity_serious",
  moderate: "severity_moderate",
  minor: "severity_minor",
};

export function WcagChecksStats({
  stats,
  standard,
  standardLabel,
}: WcagChecksStatsProps) {
  const { t, language } = useTranslation();
  if (!stats.length) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-200">
        <h3 className="text-sm font-semibold text-slate-700">
          {t("wcag_checks_coverage", { standard: standardLabel })}
          <span className="text-slate-400 font-normal ml-2">({stats.length})</span>
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-left">
              <th className="px-5 py-3 text-slate-500 font-medium">{t("wcag_check")}</th>
              <th className="px-5 py-3 text-slate-500 font-medium">{t("wcag_severity")}</th>
              <th className="px-5 py-3 text-slate-500 font-medium">{t("wcag_passed")}</th>
              <th className="px-5 py-3 text-slate-500 font-medium">{t("wcag_failed")}</th>
              <th className="px-5 py-3 text-slate-500 font-medium">{t("wcag_total")}</th>
              <th className="px-5 py-3 text-slate-500 font-medium">{t("wcag_pass_rate")}</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((stat) => {
              const resolved = pickStatText(stat, standard, language);
              return (
              <tr key={stat.ruleId} className="border-t border-slate-100">
                <td className="px-5 py-3">
                  <p className="font-medium text-slate-800">{resolved.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {stat.ruleId}
                    {resolved.reference ? ` · ${resolved.reference}` : ""}
                    {resolved.annexDOverrideLabel ? (
                      <span className="ml-2 inline-block px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 text-[10px] font-semibold">
                        {t("issues_annex_d_badge")}
                      </span>
                    ) : null}
                  </p>
                </td>
                <td className="px-5 py-3">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                      SEVERITY_STYLES[stat.severity] || SEVERITY_STYLES.minor
                    }`}
                  >
                    {t(SEVERITY_LABEL_KEY[stat.severity] || "severity_minor")}
                  </span>
                </td>
                <td className="px-5 py-3 text-emerald-700 font-medium">{stat.passedElements}</td>
                <td className="px-5 py-3 text-red-700 font-medium">{stat.failedElements}</td>
                <td className="px-5 py-3 text-slate-700">{stat.totalElements}</td>
                <td className="px-5 py-3 min-w-[180px]">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500"
                        style={{ width: `${stat.passRate}%` }}
                      />
                    </div>
                    <span className="text-slate-700 font-medium min-w-[3.2rem]">
                      {stat.passRate}%
                    </span>
                  </div>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
