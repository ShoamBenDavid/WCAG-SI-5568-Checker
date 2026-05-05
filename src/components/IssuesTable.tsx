import { Fragment, useState } from "react";
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import type {
  AccessibilityIssue,
  ScannerStandard,
  ScanScope,
  Severity,
  StandardRefs,
  UserType,
} from "../types";
import { useTranslation } from "../hooks/useTranslation";
import { pickIssueText } from "../lib/issueText";

const BADGE: Record<Severity, { bg: string; text: string }> = {
  critical: { bg: "bg-red-100", text: "text-red-700" },
  serious: { bg: "bg-orange-100", text: "text-orange-700" },
  moderate: { bg: "bg-amber-100", text: "text-amber-700" },
  minor: { bg: "bg-blue-100", text: "text-blue-700" },
};

const SEVERITY_RANK: Record<Severity, number> = {
  critical: 4,
  serious: 3,
  moderate: 2,
  minor: 1,
};

const SEVERITY_LABEL_KEY: Record<Severity, string> = {
  critical: "severity_critical",
  serious: "severity_serious",
  moderate: "severity_moderate",
  minor: "severity_minor",
};

type IssuesTableProps = {
  issues: AccessibilityIssue[];
  userType: UserType;
  scanScope: ScanScope;
  standard: ScannerStandard;
  standardLabel: string;
};

const PAGE_SIZE = 10;

type SortField = "severity" | "affectedElements";
type SortDir = "asc" | "desc";

function ariaSortValue(active: boolean, dir: SortDir): "ascending" | "descending" | "none" {
  if (!active) return "none";
  return dir === "asc" ? "ascending" : "descending";
}

function renderStandardRefs(refs: StandardRefs | undefined): string[] {
  if (!refs) return [];
  const out: string[] = [];
  if (refs.wcag22) out.push(`WCAG 2.2 ${refs.wcag22.criterion}${refs.wcag22.level ? ` (${refs.wcag22.level})` : ""}`);
  else if (refs.wcag21) out.push(`WCAG 2.1 ${refs.wcag21.criterion}${refs.wcag21.level ? ` (${refs.wcag21.level})` : ""}`);
  else if (refs.wcag20) out.push(`WCAG 2.0 ${refs.wcag20.criterion}${refs.wcag20.level ? ` (${refs.wcag20.level})` : ""}`);
  if (refs.si5568) {
    out.push(
      `SI 5568 — ${refs.si5568.clause || `criterion ${refs.si5568.criterion}`}${
        refs.si5568.level ? ` (${refs.si5568.level})` : ""
      }`
    );
  }
  return out;
}

export function IssuesTable({
  issues,
  userType,
  scanScope,
  standard,
  standardLabel,
}: IssuesTableProps) {
  const { t, language } = useTranslation();
  const [sortField, setSortField] = useState<SortField>("severity");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  const sorted = [...issues].sort((a, b) => {
    const cmp =
      sortField === "severity"
        ? SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity]
        : a.affectedElements - b.affectedElements;
    return sortDir === "desc" ? -cmp : cmp;
  });

  const totalPages = Math.ceil(issues.length / PAGE_SIZE);
  const paged = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const onHeaderKey = (field: SortField, e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleSort(field);
    }
  };

  const showSelector = userType === "developer";
  const colSpan = showSelector ? 7 : 6;
  void scanScope;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-200">
        <h3 className="text-sm font-semibold text-slate-700">
          {t("issues_detected")}{" "}
          <span className="text-slate-400 font-normal">({issues.length})</span>
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-left">
              <th scope="col" className="px-5 py-3 text-slate-500 font-medium">
                {t("issues_issue")}
              </th>
              <th
                scope="col"
                aria-sort={ariaSortValue(sortField === "severity", sortDir)}
                className="px-5 py-3 text-slate-500 font-medium"
              >
                <button
                  type="button"
                  onClick={() => toggleSort("severity")}
                  onKeyDown={(e) => onHeaderKey("severity", e)}
                  className="inline-flex items-center gap-1 font-medium uppercase text-slate-500
                             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
                >
                  {t("issues_severity")}
                  <span aria-hidden="true">
                    {sortField === "severity" && (sortDir === "desc" ? "↓" : "↑")}
                  </span>
                </button>
              </th>
              <th
                scope="col"
                aria-sort={ariaSortValue(sortField === "affectedElements", sortDir)}
                className="px-5 py-3 text-slate-500 font-medium"
              >
                <button
                  type="button"
                  onClick={() => toggleSort("affectedElements")}
                  onKeyDown={(e) => onHeaderKey("affectedElements", e)}
                  className="inline-flex items-center gap-1 font-medium uppercase text-slate-500
                             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
                >
                  {t("issues_affected")}
                  <span aria-hidden="true">
                    {sortField === "affectedElements" && (sortDir === "desc" ? "↓" : "↑")}
                  </span>
                </button>
              </th>
              {showSelector && (
                <th scope="col" className="px-5 py-3 text-slate-500 font-medium">
                  {t("issues_selector")}
                </th>
              )}
              <th scope="col" className="px-5 py-3 text-slate-500 font-medium">
                {t("issues_page")}
              </th>
              <th scope="col" className="px-5 py-3 w-10">
                <span className="sr-only">{t("issues_expand_row")}</span>
              </th>
            </tr>
          </thead>

          <tbody>
            {paged.map((issue) => {
              const badge = BADGE[issue.severity];
              const expanded = expandedId === issue.id;
              const refLines = renderStandardRefs(issue.standardRefs);
              const text = pickIssueText(issue, standard, language);
              const showSiSection = standard === "si5568" && Boolean(text.si5568Quote);
              return (
                <Fragment key={issue.id}>
                  <tr className="border-t border-slate-100 hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3 max-w-[280px]">
                      <p className="font-medium text-slate-800 truncate">
                        {text.title}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {issue.ruleId}
                        {issue.standardReference
                          ? ` · ${issue.standardReference}`
                          : issue.wcagReference
                            ? ` · ${standard === "si5568" ? `SI 5568 criterion ${issue.wcagReference}` : `WCAG ${issue.wcagReference}`}`
                            : ""}
                        {text.annexDOverrideLabel ? ` · ${t("issues_annex_d_badge")}` : ""}
                      </p>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${badge.bg} ${badge.text}`}
                      >
                        {t(SEVERITY_LABEL_KEY[issue.severity])}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {issue.affectedElements}
                    </td>
                    {showSelector && (
                      <td className="px-5 py-3 max-w-[180px]">
                        <code className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600 truncate block">
                          {issue.selector || "—"}
                        </code>
                      </td>
                    )}
                    <td className="px-5 py-3 text-xs text-slate-500 max-w-[180px] truncate">
                      {issue.pageUrl}
                    </td>
                    <td className="px-5 py-3">
                      <button
                        type="button"
                        onClick={() => setExpandedId(expanded ? null : issue.id)}
                        className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded
                                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                        aria-expanded={expanded}
                        aria-label={expanded ? t("issues_collapse_row") : t("issues_expand_row")}
                      >
                        {expanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                  </tr>

                  {expanded && (
                    <tr className="bg-slate-50/80">
                      <td colSpan={colSpan} className="px-5 py-4">
                        <div className="space-y-2 text-sm max-w-3xl">
                          <p className="text-slate-600">
                            <span className="font-medium text-slate-700">{t("issues_description")}</span>{" "}
                            {text.description}
                          </p>
                          {showSiSection && (
                            <div className="border-l-4 border-indigo-300 bg-indigo-50/60 px-3 py-2 rounded">
                              <p className="text-xs font-semibold text-indigo-700 mb-1">
                                {t("issues_standard_text")}
                              </p>
                              <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                                {text.si5568Quote}
                              </p>
                              {text.si5568Citation && (
                                <p className="text-xs text-indigo-700 mt-1">
                                  {text.si5568Citation}
                                  {text.annexDOverrideLabel ? ` · ${text.annexDOverrideLabel}` : ""}
                                </p>
                              )}
                            </div>
                          )}
                          {text.whyItMatters && (
                            <p className="text-slate-600">
                              <span className="font-medium text-slate-700">{t("issues_why")}</span>{" "}
                              {text.whyItMatters}
                            </p>
                          )}
                          {text.recommendation && (
                            <p className="text-slate-600">
                              <span className="font-medium text-slate-700">{t("issues_recommendation")}</span>{" "}
                              {text.recommendation}
                            </p>
                          )}
                          {issue.disabilities && issue.disabilities.length > 0 && (
                            <p className="text-slate-600">
                              <span className="font-medium text-slate-700">{t("issues_affected_users")}</span>{" "}
                              {issue.disabilities.join(", ")}
                            </p>
                          )}
                          {refLines.length > 0 && (
                            <div className="text-slate-600">
                              <span className="font-medium text-slate-700">
                                {t("issues_reference", { standard: standardLabel })}
                              </span>
                              <ul className="ml-4 list-disc text-xs space-y-0.5 mt-1">
                                {refLines.map((line) => (
                                  <li key={line}>{line}</li>
                                ))}
                              </ul>
                              {standard === "wcag21" && issue.wcagReference && (
                                <a
                                  href={`https://www.w3.org/WAI/WCAG21/Understanding/`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-indigo-600 hover:underline inline-flex items-center gap-1 mt-1
                                             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
                                >
                                  {t("issues_open_wcag")}{" "}
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          )}
                          {showSelector && (
                            <div className="space-y-1 text-slate-600">
                              <p>
                                <span className="font-medium text-slate-700">{t("issues_url")}</span>{" "}
                                <a
                                  href={issue.pageUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-indigo-600 hover:underline inline-flex items-center gap-1
                                             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
                                >
                                  {issue.pageUrl}
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </p>
                              <p>
                                <span className="font-medium text-slate-700">{t("issues_location")}</span>{" "}
                                {issue.selector ? (
                                  <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                                    {issue.selector}
                                  </code>
                                ) : (
                                  t("issues_no_selector")
                                )}
                              </p>
                              {issue.htmlSnippet && (
                                <pre className="text-xs bg-slate-100 text-slate-700 p-2 rounded overflow-x-auto">
                                  <code>{issue.htmlSnippet}</code>
                                </pre>
                              )}
                              {issue.scannedAt && (
                                <p className="text-xs text-slate-400">
                                  {t("issues_scanned_at", {
                                    time: new Date(issue.scannedAt).toLocaleString(),
                                  })}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}

            {paged.length === 0 && (
              <tr>
                <td colSpan={colSpan} className="px-5 py-10 text-center text-slate-400">
                  {t("issues_no_issues")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 bg-slate-50/50">
          <p className="text-xs text-slate-500">
            {t("issues_showing", {
              from: page * PAGE_SIZE + 1,
              to: Math.min((page + 1) * PAGE_SIZE, issues.length),
              total: issues.length,
            })}
          </p>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1 text-xs rounded border border-slate-300 text-slate-600
                         hover:bg-white disabled:opacity-40 transition-colors
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              {t("issues_previous")}
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-1 text-xs rounded border border-slate-300 text-slate-600
                         hover:bg-white disabled:opacity-40 transition-colors
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              {t("issues_next")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
