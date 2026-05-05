export type Severity = "critical" | "serious" | "moderate" | "minor";
export type ScanScope = "single-page" | "full-site";
export type UserType = "end-user" | "developer" | "site-owner";
export type DisabilityType = "visual" | "hearing" | "motor" | "cognitive";

/**
 * Compliance standard the user picked from the popup. The scanner runs only
 * the rules that have a definition for the selected standard.
 */
export type ComplianceStandard = "wcag20" | "wcag21" | "wcag22" | "is5568";

/**
 * Internal alias the scanner uses for the Israeli standard. The popup type
 * remains "is5568" for backwards compatibility, but the rule engine and
 * background normalize it to "si5568" before look-up.
 */
export type ScannerStandard = "wcag20" | "wcag21" | "wcag22" | "si5568";

export const DISABILITY_TYPES: DisabilityType[] = [
  "visual",
  "hearing",
  "motor",
  "cognitive",
];

export type StandardRef = {
  criterion: string;
  level?: "A" | "AA" | "AAA";
  clause?: string;
  israelOnly?: boolean;
};

export type StandardRefs = Partial<Record<ScannerStandard, StandardRef>>;

export type Language = "en" | "he";

/**
 * Localized text block per rule. Each language version supplies the four
 * fields the dashboard renders for an issue (title, description, why it
 * matters, recommendation).
 */
export type RuleLocaleText = {
  title: string;
  description: string;
  whyItMatters: string;
  recommendation: string;
};

export type RuleI18n = {
  en: RuleLocaleText;
  he: RuleLocaleText;
};

/**
 * SI 5568-specific metadata, sourced from the published Israeli standard:
 *   - Part 1 (March 2013): WCAG 2.0 + Annex D level overrides for 1.2.1,
 *     1.2.2, 1.2.3, 2.4.10.
 *   - Part 2 (May 2020): explicit Hebrew descriptions of criteria 1.1.1,
 *     1.3.1, 1.3.2, 1.3.3, 1.4.1, 1.4.3, 1.4.5, 2.4.2, 2.4.4, 2.4.6.
 *
 * `coveredByPdf=false` is used for Israeli regulatory checks (Hebrew/RTL,
 * accessibility statement) that complement SI 5568 but are not transcribed
 * verbatim from the standard's PDFs.
 */
export type Si5568Meta = {
  coveredByPdf: boolean;
  part: 1 | 2;
  clause: string;
  level: "A" | "AA" | "AAA";
  /** "AA" when SI 5568 Part 1 Annex D promotes the WCAG 2.0 level. */
  annexDOverride?: "AA" | null;
  sourceQuote: {
    en: string;
    he: string;
  };
};

export type AccessibilityIssue = {
  id: string;
  ruleId: string;
  title: string;
  description: string;
  whyItMatters?: string;
  severity: Severity;
  recommendation?: string;
  disabilities: DisabilityType[];

  /**
   * Convenience for the dashboard — derived from the ACTIVE standard.
   */
  wcagReference?: string;
  standardReference?: string;

  /**
   * Full mapping for the developer view, so the UI can display every
   * applicable standard reference (e.g. WCAG 2.1 + SI 5568) for one issue.
   */
  standardRefs: StandardRefs;

  /** Optional localized copy. The popup picks based on preferred language. */
  i18n?: RuleI18n;

  /** Optional SI 5568 metadata (only for the 10 SI 5568-covered rules). */
  si5568?: Si5568Meta;

  affectedElements: number;
  passedElements?: number;
  impactPercentage?: number;
  pageUrl: string;
  scannedAt?: string;
  selector?: string;
  htmlSnippet?: string;
};

export type WcagCheckStat = {
  ruleId: string;
  title: string;
  severity: Severity;
  disabilities?: DisabilityType[];
  standardRefs?: StandardRefs;
  i18n?: RuleI18n;
  si5568?: Si5568Meta;
  wcagReference?: string;
  standardReference?: string;
  totalElements: number;
  failedElements: number;
  passedElements: number;
  passRate: number;
};

export type FailedPage = {
  url: string;
  error: string;
};

export type PageScanResult = {
  pageUrl: string;
  accessibilityScore: number;
  totalIssues: number;
  criticalIssues: number;
  seriousIssues: number;
  moderateIssues: number;
  minorIssues: number;
  issues: AccessibilityIssue[];
  wcagCheckStats: WcagCheckStat[];
};

export type FullScanResult = {
  scannedUrl: string;
  scanScope: ScanScope;
  standard: ScannerStandard;
  standardLabel: string;
  userType: UserType;
  totalPagesScanned: number;
  totalIssues: number;
  accessibilityScore: number;
  criticalIssues: number;
  seriousIssues: number;
  moderateIssues: number;
  minorIssues: number;
  pages: PageScanResult[];
  issues: AccessibilityIssue[];
  wcagCheckStats: WcagCheckStat[];
  failedPages?: FailedPage[];
  scannedAt?: string;
};

export type StoredScan = {
  result: FullScanResult | null;
  timestamp: number | null;
};

export type ScanStatus = "idle" | "scanning" | "complete" | "error";

export type ScanProgress = {
  scope: ScanScope;
  current: number;
  total: number;
  percent: number;
  label: string;
};

export type ScanConfig = {
  url: string;
  scope: ScanScope;
  standard: ComplianceStandard;
  userType: UserType;
  disabilityFilters: DisabilityType[];
  /** Optional, full-site mode only. 1-25, default 10. */
  maxPages?: number;
};
