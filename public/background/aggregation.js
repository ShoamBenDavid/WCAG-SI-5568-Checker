/**
 * Result aggregation helpers.
 *
 * - computePageSummary: per-page roll-up of issues and stats into the shape
 *   the dashboard's KPI cards expect.
 * - aggregateWcagCheckStats: merges per-page stats into a single coverage
 *   table for full-site mode.
 * - aggregateFullResult: combines pages into the FullScanResult.
 */

const STANDARD_META = {
  wcag20: { label: "WCAG 2.0" },
  wcag21: { label: "WCAG 2.1" },
  wcag22: { label: "WCAG 2.2" },
  si5568: { label: "Israeli Standard SI 5568" },
};

export function normalizeComplianceStandard(standard) {
  // Accept both `is5568` (popup-facing legacy value) and `si5568` (scanner key).
  if (standard === "si5568" || standard === "is5568") return "si5568";
  if (standard === "wcag20" || standard === "wcag22") return standard;
  return "wcag21";
}

export function getStandardLabel(standard) {
  const s = normalizeComplianceStandard(standard);
  return (STANDARD_META[s] && STANDARD_META[s].label) || "WCAG";
}

export function aggregateWcagCheckStats(statsList) {
  const merged = new Map();
  (statsList || []).forEach((stat) => {
    if (!stat?.ruleId) return;
    const existing = merged.get(stat.ruleId) || {
      ruleId: stat.ruleId,
      title: stat.title || stat.ruleId,
      severity: stat.severity || "minor",
      disabilities: stat.disabilities,
      standardRefs: stat.standardRefs,
      i18n: stat.i18n,
      si5568: stat.si5568,
      wcagReference: stat.wcagReference,
      standardReference: stat.standardReference,
      totalElements: 0,
      failedElements: 0,
      passedElements: 0,
      passRate: 100,
    };

    existing.totalElements += Number(stat.totalElements || 0);
    existing.failedElements += Number(stat.failedElements || 0);
    existing.passedElements += Number(stat.passedElements || 0);
    if (!existing.standardRefs && stat.standardRefs) existing.standardRefs = stat.standardRefs;
    if (!existing.i18n && stat.i18n) existing.i18n = stat.i18n;
    if (!existing.si5568 && stat.si5568) existing.si5568 = stat.si5568;
    if (!existing.wcagReference && stat.wcagReference) existing.wcagReference = stat.wcagReference;
    if (!existing.standardReference && stat.standardReference) {
      existing.standardReference = stat.standardReference;
    }
    if (!existing.disabilities && stat.disabilities) existing.disabilities = stat.disabilities;

    merged.set(stat.ruleId, existing);
  });

  return Array.from(merged.values())
    .map((stat) => ({
      ...stat,
      passRate:
        stat.totalElements === 0
          ? 100
          : Number(((stat.passedElements / stat.totalElements) * 100).toFixed(1)),
    }))
    .sort((a, b) => {
      if (a.failedElements !== b.failedElements) return b.failedElements - a.failedElements;
      return (a.title || "").localeCompare(b.title || "");
    });
}

export function computePageSummary(pageUrl, issues, wcagCheckStats = []) {
  const criticalIssues = issues.filter((i) => i.severity === "critical").length;
  const seriousIssues = issues.filter((i) => i.severity === "serious").length;
  const moderateIssues = issues.filter((i) => i.severity === "moderate").length;
  const minorIssues = issues.filter((i) => i.severity === "minor").length;
  const totalIssues = issues.length;

  const penalty =
    criticalIssues * 8 + seriousIssues * 5 + moderateIssues * 3 + minorIssues;
  const accessibilityScore = Math.max(0, Math.min(100, 100 - penalty));

  return {
    pageUrl,
    accessibilityScore,
    totalIssues,
    criticalIssues,
    seriousIssues,
    moderateIssues,
    minorIssues,
    issues,
    wcagCheckStats,
  };
}

export function normalizeIssues(issues, fallbackUrl) {
  return (issues || []).map((issue, index) => ({
    ...issue,
    id: issue.id || `${issue.ruleId || "issue"}-${Date.now()}-${index}`,
    pageUrl: issue.pageUrl || fallbackUrl,
  }));
}

export function aggregateFullResult(config, pages, failedPages = []) {
  const standard = normalizeComplianceStandard(config.standard);
  const issues = pages.flatMap((page) => page.issues);
  const issueCountByRule = new Map();
  issues.forEach((issue) => {
    if (!issue?.ruleId) return;
    issueCountByRule.set(issue.ruleId, (issueCountByRule.get(issue.ruleId) || 0) + 1);
  });
  const wcagCheckStats = aggregateWcagCheckStats(
    pages.flatMap((page) => page.wcagCheckStats || [])
  )
    .map((stat) => {
      const checkedPages = pages.length;
      const failedChecks = Math.min(checkedPages, issueCountByRule.get(stat.ruleId) || 0);
      const passedChecks = Math.max(0, checkedPages - failedChecks);
      return {
        ...stat,
        checkedPages,
        failedChecks,
        passedChecks,
        checkPassRate:
          checkedPages === 0
            ? 100
            : Number(((passedChecks / checkedPages) * 100).toFixed(1)),
      };
    })
    .sort((a, b) => {
      if (a.failedChecks !== b.failedChecks) return b.failedChecks - a.failedChecks;
      return (a.title || "").localeCompare(b.title || "");
    });
  const criticalIssues = issues.filter((i) => i.severity === "critical").length;
  const seriousIssues = issues.filter((i) => i.severity === "serious").length;
  const moderateIssues = issues.filter((i) => i.severity === "moderate").length;
  const minorIssues = issues.filter((i) => i.severity === "minor").length;
  const totalIssues = issues.length;
  const avgScore =
    pages.length === 0
      ? 100
      : Math.round(pages.reduce((acc, p) => acc + p.accessibilityScore, 0) / pages.length);

  return {
    scannedUrl: config.url,
    scanScope: config.scope,
    standard,
    standardLabel: getStandardLabel(standard),
    userType: config.userType,
    totalPagesScanned: pages.length,
    totalIssues,
    accessibilityScore: avgScore,
    criticalIssues,
    seriousIssues,
    moderateIssues,
    minorIssues,
    pages,
    issues,
    wcagCheckStats,
    failedPages,
    scannedAt: new Date().toISOString(),
  };
}
