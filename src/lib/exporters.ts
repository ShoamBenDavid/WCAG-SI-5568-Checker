import type { AccessibilityIssue, FullScanResult } from "../types";

/**
 * Lightweight client-side exporters for scan reports.
 *
 * No third-party dependencies — we build a Blob in-memory and trigger the
 * browser's native download flow.
 */

function downloadBlob(content: BlobPart, mime: string, filename: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    a.remove();
    URL.revokeObjectURL(url);
  }, 0);
}

function timestampForFilename(): string {
  const d = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  return (
    `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}` +
    `-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`
  );
}

export function exportJson(result: FullScanResult) {
  const payload = {
    meta: {
      generatedAt: new Date().toISOString(),
      generator: "WCAG and Israeli SI 5568 Checker",
      generatorVersion: "1.1.0",
    },
    scan: result,
  };
  downloadBlob(
    JSON.stringify(payload, null, 2),
    "application/json",
    `a11y-report-${timestampForFilename()}.json`
  );
}

function escapeCsv(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (s.includes(",") || s.includes('"') || s.includes("\n") || s.includes("\r")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function flattenStandardRefs(issue: AccessibilityIssue): {
  wcag: string;
  si5568: string;
} {
  const refs = issue.standardRefs || {};
  const wcagPick = refs.wcag22 || refs.wcag21 || refs.wcag20;
  const wcag = wcagPick
    ? `${wcagPick.criterion}${wcagPick.level ? ` (${wcagPick.level})` : ""}`
    : issue.wcagReference || "";
  const si = refs.si5568;
  const si5568 = si ? si.clause || `criterion ${si.criterion}` : "";
  return { wcag, si5568 };
}

function flattenAffectedSelectors(issue: AccessibilityIssue): string {
  const details = issue.affectedElementDetails || [];
  if (details.length === 0) return issue.selector || "";
  return details.map((detail) => `#${detail.index}: ${detail.selector}`).join("\n");
}

function flattenAffectedSnippets(issue: AccessibilityIssue): string {
  const details = issue.affectedElementDetails || [];
  if (details.length === 0) return issue.htmlSnippet || "";
  return details
    .filter((detail) => detail.htmlSnippet)
    .map((detail) => `#${detail.index}: ${detail.htmlSnippet}`)
    .join("\n");
}

export function exportCsv(result: FullScanResult) {
  const headers = [
    "Page URL",
    "Issue ID",
    "Rule ID",
    "Rule Title",
    "Severity",
    "Affected Elements",
    "Impact %",
    "WCAG Reference",
    "SI 5568 Reference",
    "Disabilities",
    "Selector",
    "HTML Snippet",
    "Description",
    "Why It Matters",
    "Recommendation",
    "Scanned At",
  ];

  const rows = (result.issues || []).map((issue) => {
    const refs = flattenStandardRefs(issue);
    return [
      issue.pageUrl,
      issue.id,
      issue.ruleId,
      issue.title,
      issue.severity,
      issue.affectedElements,
      issue.impactPercentage ?? "",
      refs.wcag,
      refs.si5568,
      (issue.disabilities || []).join("|"),
      flattenAffectedSelectors(issue),
      flattenAffectedSnippets(issue),
      issue.description,
      issue.whyItMatters || "",
      issue.recommendation || "",
      issue.scannedAt || result.scannedAt || "",
    ]
      .map(escapeCsv)
      .join(",");
  });

  // Top of file: a small summary block as comment-style first lines so the
  // exported CSV is self-describing when opened in Excel/Sheets.
  const summary = [
    `# WCAG and SI 5568 Checker — accessibility report`,
    `# Scanned URL: ${result.scannedUrl}`,
    `# Scope: ${result.scanScope}`,
    `# Standard: ${result.standardLabel} (${result.standard})`,
    `# Generated: ${new Date().toISOString()}`,
    `# Score: ${result.accessibilityScore}/100`,
    `# Total issues: ${result.totalIssues} (critical=${result.criticalIssues}, serious=${result.seriousIssues}, moderate=${result.moderateIssues}, minor=${result.minorIssues})`,
    "",
  ].join("\n");

  const csv = `${summary}${headers.join(",")}\n${rows.join("\n")}\n`;
  downloadBlob(csv, "text/csv;charset=utf-8", `a11y-report-${timestampForFilename()}.csv`);
}
