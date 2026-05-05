/* global chrome */
/**
 * Rule registry.
 *
 * Each rule file calls window.__a11y.register({ ... }) at content-script load
 * time. window.__a11y.runScan(standard, scanId) executes every rule that has
 * a definition for the requested standard, emits progress messages, and
 * returns a structured result that the background service worker forwards to
 * the popup.
 *
 * Rule shape:
 *   {
 *     id: string,                       // stable kebab-case id
 *     title: string,                    // short human title
 *     description: string,              // one-sentence problem description
 *     whyItMatters?: string,            // explanation for the report
 *     severity: "critical"|"serious"|"moderate"|"minor",
 *     recommendation: string,
 *     disabilities: string[],           // subset of ["visual","hearing","motor","cognitive"]
 *     selectorHint?: string,            // generic CSS selector when no specific node
 *     standards: {                      // which standards reference this rule
 *       wcag20?: { criterion, level, clause? },
 *       wcag21?: { criterion, level, clause? },
 *       wcag22?: { criterion, level, clause? },
 *       si5568?: { criterion, level, clause?, israelOnly? }
 *     },
 *     run(doc): { total, failedNodes, perElementInfo? }
 *   }
 */
(function () {
  const a11y = (window.__a11y = window.__a11y || {});

  if (a11y.RULES) return; // re-injection: keep existing registrations.

  a11y.RULES = [];

  // SI 5568 Part 1 (March 2013) adopts WCAG 2.0 verbatim with national
  // amendments documented in Annex D. SI 5568 mode therefore runs every rule
  // that declares standards.si5568 — i.e. every WCAG-2.0-mapped rule plus the
  // Israel-specific rules (hebrew-rtl, accessibility-statement). The 10 rules
  // whose criteria are explicitly described in SI 5568 Parts 1 & 2 also carry
  // a top-level si5568 metadata block with the original Hebrew source text;
  // the popup picks that up via src/lib/issueText.ts.

  a11y.register = function register(rule) {
    if (!rule || !rule.id) return;
    // Deduplicate when the script is re-injected on the same page.
    a11y.RULES = a11y.RULES.filter((r) => r.id !== rule.id);
    a11y.RULES.push(rule);
  };

  function appliesToStandard(rule, standard) {
    return Boolean(rule.standards && rule.standards[standard]);
  }

  function formatStandardReference(rule, standard) {
    const ref = rule.standards && rule.standards[standard];
    if (!ref) return undefined;
    if (standard === "si5568") {
      // Prefer the SI 5568 metadata block (set by PDF-covered rules) so the
      // label reflects the part of the standard the rule was sourced from.
      const meta = rule.si5568;
      if (meta && meta.coveredByPdf) {
        const partLabel = `SI 5568 Part ${meta.part}`;
        const clauseLabel = meta.clause ? ` §${meta.clause}` : "";
        const level = meta.annexDOverride || meta.level;
        return `${partLabel}${clauseLabel}${level ? ` (Level ${level})` : ""}`;
      }
      return `SI 5568 ${ref.clause || `criterion ${ref.criterion}`}${
        ref.level ? ` (Level ${ref.level})` : ""
      }`;
    }
    const label = a11y.STANDARD_LABELS[standard] || "WCAG";
    return `${label} ${ref.criterion}${ref.level ? ` (Level ${ref.level})` : ""}`;
  }

  function emitProgress(scanId, current, total, label) {
    if (!scanId) return;
    try {
      chrome.runtime
        .sendMessage({
          type: "SCAN_PROGRESS",
          scanId,
          payload: {
            scope: "single-page",
            current,
            total,
            percent: Math.round((current / total) * 100),
            label,
          },
        })
        .catch(() => {
          /* popup may be closed */
        });
    } catch {
      /* runtime gone */
    }
  }

  function buildIssue(rule, standard, failedNode, totalElements, failedCount, scannedAt) {
    const passedElements = Math.max(0, totalElements - failedCount);
    const impactPercentage =
      totalElements === 0
        ? 0
        : Number(a11y.clamp((failedCount / totalElements) * 100, 0, 100).toFixed(1));

    const selector =
      a11y.cssPath(failedNode) || rule.selectorHint || rule.selectorFallback || "";
    const snippet = a11y.htmlSnippet(failedNode);

    return {
      id: `${rule.id}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      ruleId: rule.id,
      title: rule.title,
      description: rule.description,
      whyItMatters: rule.whyItMatters,
      severity: rule.severity,
      recommendation: rule.recommendation,
      disabilities: rule.disabilities || a11y.DEFAULT_DISABILITIES,
      pageUrl: window.location.href,
      scannedAt,
      // Standards mapping — every applicable standard is included so the UI
      // can show e.g. WCAG 2.1 AND SI 5568 references in the developer view.
      standardRefs: rule.standards || {},
      // Localized copy (en/he) — the popup picks the right one based on the
      // user's preferred language. Optional; missing rules fall back to the
      // top-level English fields above.
      i18n: rule.i18n,
      // SI 5568-specific metadata sourced from the PDFs (Part 1 / Part 2),
      // including the original Hebrew quote and the Annex D level override
      // when applicable. Only present on the 10 SI 5568-covered rules.
      si5568: rule.si5568,
      // Convenience fields keyed to the *active* standard — what the dashboard
      // primarily renders.
      wcagReference: rule.standards && rule.standards[standard]
        ? rule.standards[standard].criterion
        : undefined,
      standardReference: formatStandardReference(rule, standard),
      affectedElements: failedCount,
      impactPercentage,
      passedElements,
      selector,
      htmlSnippet: snippet,
    };
  }

  function buildStat(rule, standard, totalElements, failedCount) {
    const safeTotal = Math.max(0, totalElements);
    const safeFailed = a11y.clamp(failedCount, 0, safeTotal);
    const passedElements = safeTotal - safeFailed;
    const passRate =
      safeTotal === 0 ? 100 : Number(((passedElements / safeTotal) * 100).toFixed(1));

    return {
      ruleId: rule.id,
      title: rule.title,
      severity: rule.severity,
      disabilities: rule.disabilities || a11y.DEFAULT_DISABILITIES,
      standardRefs: rule.standards || {},
      i18n: rule.i18n,
      si5568: rule.si5568,
      wcagReference: rule.standards && rule.standards[standard]
        ? rule.standards[standard].criterion
        : undefined,
      standardReference: formatStandardReference(rule, standard),
      totalElements: safeTotal,
      failedElements: safeFailed,
      passedElements,
      passRate,
    };
  }

  /**
   * Run every rule applicable to the chosen standard. Returns the same shape
   * the background expects (issues + per-rule stats + crawl hints).
   */
  a11y.runScan = function runScan(standard, scanId) {
    let normalized;
    if (standard === "si5568" || standard === "is5568") normalized = "si5568";
    else if (standard === "wcag20" || standard === "wcag22") normalized = standard;
    else normalized = "wcag21";

    const applicable = a11y.RULES.filter((r) => appliesToStandard(r, normalized));
    const total = applicable.length;
    const issues = [];
    const stats = [];
    const scannedAt = new Date().toISOString();

    let completed = 0;
    for (const rule of applicable) {
      let result;
      try {
        result = rule.run(document) || { total: 0, failedNodes: [] };
      } catch (err) {
        completed += 1;
        emitProgress(scanId, completed, total, `Skipped: ${rule.title}`);
        // Surface the engine error as a minor issue so the user is aware.
        issues.push({
          id: `engine-error-${rule.id}-${Date.now()}`,
          ruleId: `${rule.id}-error`,
          title: `Rule failed to execute: ${rule.title}`,
          description: err && err.message ? err.message : "Unknown rule failure",
          severity: "minor",
          recommendation: "Internal scanner error — please report this rule id.",
          disabilities: rule.disabilities || a11y.DEFAULT_DISABILITIES,
          pageUrl: window.location.href,
          scannedAt,
          standardRefs: rule.standards || {},
          i18n: rule.i18n,
          si5568: rule.si5568,
          affectedElements: 0,
          impactPercentage: 0,
          selector: rule.selectorHint || "",
          htmlSnippet: undefined,
        });
        continue;
      }

      const totalElements = Math.max(0, Number(result.total) || 0);
      const failedNodes = Array.isArray(result.failedNodes) ? result.failedNodes : [];
      const failedCount = failedNodes.length;

      stats.push(buildStat(rule, normalized, totalElements, failedCount));

      if (failedCount > 0) {
        issues.push(
          buildIssue(rule, normalized, failedNodes[0], totalElements, failedCount, scannedAt)
        );
      }

      completed += 1;
      emitProgress(scanId, completed, total, rule.title);
    }

    return {
      issues,
      wcagCheckStats: stats,
      standard: normalized,
      standardLabel: a11y.STANDARD_LABELS[normalized],
      discoveredLinks: a11y.getInternalLinks(),
      scannedAt,
      ruleCount: total,
    };
  };

  void chrome;
})();
