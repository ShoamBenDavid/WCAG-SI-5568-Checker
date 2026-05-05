/**
 * Resolve the rendered text for an issue or coverage row, given the active
 * compliance standard and the user's preferred language.
 *
 * Decision tree:
 *   - if standard === "si5568" and the rule has si5568 metadata, use the
 *     SI 5568 source quote in `language` and append a citation footer.
 *   - in either case, the title / description / whyItMatters / recommendation
 *     come from `i18n[language]` when present, otherwise fall back to the
 *     scanner-emitted English fields.
 */
import type {
  AccessibilityIssue,
  Language,
  RuleI18n,
  ScannerStandard,
  Si5568Meta,
  WcagCheckStat,
} from "../types";

export type ResolvedIssueText = {
  title: string;
  description: string;
  whyItMatters?: string;
  recommendation?: string;
  /** Full quoted text from the SI 5568 PDF (only set when SI 5568 is active). */
  si5568Quote?: string;
  /** Plain-text citation line, e.g. 'מקור: ת"י 5568 חלק 2, סעיף 1.1.1, רמה A'. */
  si5568Citation?: string;
  /** Annex D override label, e.g. 'תוקן בנספח ד׳ ל-AA'. */
  annexDOverrideLabel?: string;
};

type IssueLike = Pick<
  AccessibilityIssue,
  "title" | "description" | "whyItMatters" | "recommendation"
> & {
  i18n?: RuleI18n;
  si5568?: Si5568Meta;
};

const HE = (s: string | undefined): string | undefined => s;

function formatCitation(meta: Si5568Meta, lang: Language): string {
  if (lang === "he") {
    const partLabel = `ת"י 5568 חלק ${meta.part}`;
    const clausePart = meta.clause ? `, סעיף ${meta.clause}` : "";
    const levelPart = meta.level ? `, רמת תאימות ${meta.level}` : "";
    const base = `מקור: ${partLabel}${clausePart}${levelPart}`;
    return base;
  }
  const partLabel = `SI 5568 Part ${meta.part}`;
  const clausePart = meta.clause ? `, criterion ${meta.clause}` : "";
  const levelPart = meta.level ? `, level ${meta.level}` : "";
  return `Source: ${partLabel}${clausePart}${levelPart}`;
}

function formatAnnexDOverride(meta: Si5568Meta, lang: Language): string | undefined {
  if (!meta.annexDOverride) return undefined;
  if (lang === "he") {
    return `נספח ד׳ של חלק 1 מעלה את רמת התאימות ל-${meta.annexDOverride}`;
  }
  return `Annex D of Part 1 raises conformance level to ${meta.annexDOverride}`;
}

export function pickIssueText(
  issue: IssueLike,
  standard: ScannerStandard,
  language: Language
): ResolvedIssueText {
  const lang: Language = language === "he" ? "he" : "en";
  const localized = issue.i18n?.[lang];
  const si = standard === "si5568" ? issue.si5568 : undefined;

  const out: ResolvedIssueText = {
    title: localized?.title ?? issue.title,
    description: localized?.description ?? issue.description,
    whyItMatters: localized?.whyItMatters ?? issue.whyItMatters,
    recommendation: localized?.recommendation ?? issue.recommendation,
  };

  if (si) {
    out.si5568Quote = HE(si.sourceQuote?.[lang]);
    out.si5568Citation = formatCitation(si, lang);
    out.annexDOverrideLabel = formatAnnexDOverride(si, lang);
  }

  return out;
}

/**
 * Smaller helper for the coverage table where we mainly need the Hebrew
 * title and the SI clause / level reference.
 */
export type ResolvedStatText = {
  title: string;
  reference?: string;
  annexDOverrideLabel?: string;
};

type StatLike = Pick<WcagCheckStat, "title" | "wcagReference" | "standardReference"> & {
  i18n?: RuleI18n;
  si5568?: Si5568Meta;
};

export function pickStatText(
  stat: StatLike,
  standard: ScannerStandard,
  language: Language
): ResolvedStatText {
  const lang: Language = language === "he" ? "he" : "en";
  const localizedTitle = stat.i18n?.[lang]?.title;
  const out: ResolvedStatText = { title: localizedTitle ?? stat.title };

  if (standard === "si5568" && stat.si5568) {
    const meta = stat.si5568;
    if (lang === "he") {
      out.reference = `ת"י 5568 חלק ${meta.part}, סעיף ${meta.clause}, רמה ${meta.level}`;
    } else {
      out.reference = `SI 5568 Part ${meta.part}, ${meta.clause}, level ${meta.level}`;
    }
    out.annexDOverrideLabel = formatAnnexDOverride(meta, lang);
  } else if (stat.standardReference) {
    out.reference = stat.standardReference;
  } else if (stat.wcagReference) {
    out.reference = `WCAG ${stat.wcagReference}`;
  }

  return out;
}
