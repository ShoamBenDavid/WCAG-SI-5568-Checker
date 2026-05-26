import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

type Language = "en" | "he";
type Direction = "ltr" | "rtl";

type Dict = Record<string, string>;

type TranslationContextValue = {
  language: Language;
  direction: Direction;
  setLanguage: (lang: Language) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
};

const translations: Record<Language, Dict> = {
  en: {
    app_runtime_missing:
      "Chrome extension runtime is not available. Load this app as an unpacked extension to run accessibility scans.",
    app_scanning_fallback: "Scanning",
    app_percent: "percent",
    app_scan_complete: "Scan complete. Found {{count}} issue{{suffix}}.",
    app_unknown_error: "unknown error",
    app_scan_failed: "Scan failed: {{error}}",
    app_overlay_scanning: "Scanning in progress...",
    app_overlay_initializing: "Initializing scan...",
    app_progress_label: "Scan progress",

    sidebar_scan_controls: "Scan controls",
    sidebar_title: "WCAG & SI 5568 Checker",
    sidebar_views: "Views",
    sidebar_dashboard: "Dashboard",
    sidebar_website_url: "Website URL",
    sidebar_scope: "Scan Scope",
    sidebar_single_page: "Single Page",
    sidebar_entire_site: "Entire Site",
    sidebar_max_pages: "Max pages (1-25)",
    sidebar_standard: "Compliance Standard",
    sidebar_standard_is: "Israeli Standard SI 5568 (with Hebrew checks)",
    sidebar_standard_note:
      "SI 5568 mode runs every WCAG 2.0 check (Israel adopted WCAG 2.0 verbatim in Part 1) plus Israeli-specific checks (Hebrew language/RTL, accessibility statement). Rules whose criteria are explicitly described in SI 5568 Parts 1 & 2 also include the original Hebrew source text from the standard. Automated screening only — not a substitute for a manual audit.",
    sidebar_user_type: "User Type",
    sidebar_end_user: "End User",
    sidebar_developer: "Developer",
    sidebar_site_owner: "Site Owner / Manager",
    sidebar_scanning: "Scanning...",
    sidebar_run_scan: "Run Scan",
    sidebar_rescan_current: "Re-scan current page",
    sidebar_disability_filter: "Disability Filter",
    sidebar_uncheck_all: "Uncheck all",
    sidebar_check_all: "Check all",
    disability_visual: "Visual",
    disability_hearing: "Hearing",
    disability_motor: "Motor",
    disability_cognitive: "Cognitive",
    sidebar_preferred_language: "Preferred Language",
    lang_english: "English",
    lang_hebrew: "עברית",
    sidebar_expand: "Expand sidebar",
    sidebar_minimize: "Minimize sidebar",

    empty_scanning_title: "Scanning in progress…",
    empty_scanning_desc:
      "Running automated WCAG-based accessibility checks. SI 5568 mode also adds Hebrew/RTL and accessibility-statement checks. This is automated screening only and does not replace a manual audit.",
    empty_failed: "Scan Failed",
    empty_unexpected_error: "An unexpected error occurred while scanning.",
    empty_try_again: "Try Again",
    empty_ready: "Ready to Scan",
    empty_ready_desc:
      "WCAG-based accessibility checker with selected Israeli SI 5568-related checks. Enter a website URL above and click",
    empty_run_scan: "Run Scan",
    empty_ready_desc_end: "to start automated screening.",
    empty_note:
      "Note: this tool provides automated screening only. It does not replace a full manual accessibility audit and does not certify SI 5568 compliance.",

    export_last_scan: "Last scan:",
    export_just_now: "Just now",
    export_min_ago: "{{count}} min ago",
    export_hour_ago: "{{count}} h ago",
    export_day_ago: "{{count}} day{{suffix}} ago",
    export_confirm_clear: "Discard the current scan results?",
    export_json: "Export JSON",
    export_csv: "Export CSV",
    export_clear: "Clear results",

    dashboard_total_issues: "Total Issues",
    dashboard_across_pages: "Across {{count}} page{{suffix}}",
    dashboard_pages_scanned: "Pages Scanned",
    dashboard_full_crawl: "Full site crawl",
    dashboard_single_page: "Single page",
    dashboard_score: "Accessibility Score",
    dashboard_score_good: "Good",
    dashboard_score_improve: "Needs improvement",
    dashboard_score_poor: "Poor",
    dashboard_critical_issues: "Critical Issues",
    dashboard_critical_subtitle: "Require immediate attention",
    dashboard_failed_pages: "{{count}} page{{suffix}} could not be scanned",

    severity_distribution_title: "Issue Distribution",
    severity_critical: "Critical",
    severity_serious: "Serious",
    severity_moderate: "Moderate",
    severity_minor: "Minor",

    chart_score_by_page: "Accessibility Score by Page",
    chart_score_label: "Score",
    chart_severity_distribution: "Severity Distribution",
    chart_category_breakdown: "WCAG Category Breakdown",
    chart_issues: "Issues",
    principle_perceivable: "Perceivable",
    principle_operable: "Operable",
    principle_understandable: "Understandable",
    principle_robust: "Robust",
    principle_other: "Other",

    wcag_checks_coverage: "{{standard}} Checks Coverage",
    wcag_check: "Check",
    wcag_severity: "Severity",
    wcag_passed: "Passed",
    wcag_failed: "Failed",
    wcag_total: "Total",
    wcag_pass_rate: "Pass Rate",

    issues_detected: "Detected Issues",
    issues_issue: "Issue",
    issues_severity: "Severity",
    issues_affected: "Affected",
    issues_selector: "Selector",
    issues_page: "Page",
    issues_expand_row: "Expand row",
    issues_collapse_row: "Collapse row",
    issues_description: "Description:",
    issues_why: "Why it matters:",
    issues_recommendation: "Recommendation:",
    issues_affected_users: "Affected users:",
    issues_reference: "{{standard}} Reference:",
    issues_open_wcag: "Open WCAG 2.1 Understanding",
    issues_url: "Issue URL:",
    issues_location: "HTML Location:",
    issues_locations: "Affected DOM elements:",
    issues_locations_help:
      "Copy a selector, open Chrome DevTools Elements, press Ctrl+F, and paste it to locate the affected element.",
    issues_search_locations: "Search affected elements",
    issues_copy_selector: "Copy selector",
    issues_selector_copied: "Selector copied",
    issues_no_selector: "No selector available.",
    issues_scanned_at: "Scanned at {{time}}",
    issues_no_issues: "No issues found.",
    issues_showing: "Showing {{from}}–{{to}} of {{total}}",
    issues_previous: "Previous",
    issues_next: "Next",

    issues_standard_text: "Standard text:",
    issues_si_source: "Source:",
    issues_annex_d_badge: "Annex D → AA",
    wcag_si5568_part1: "SI 5568 Part 1",
    wcag_si5568_part2: "SI 5568 Part 2",
  },
  he: {
    app_runtime_missing:
      "סביבת Chrome Extension אינה זמינה. יש לטעון את האפליקציה כהרחבה לא ארוזה כדי להריץ סריקות נגישות.",
    app_scanning_fallback: "סורק",
    app_percent: "אחוז",
    app_scan_complete: "הסריקה הושלמה. נמצאו {{count}} ליקוי{{suffix}}.",
    app_unknown_error: "שגיאה לא ידועה",
    app_scan_failed: "הסריקה נכשלה: {{error}}",
    app_overlay_scanning: "הסריקה מתבצעת...",
    app_overlay_initializing: "מאתחל סריקה...",
    app_progress_label: "התקדמות סריקה",

    sidebar_scan_controls: "בקרי סריקה",
    sidebar_title: "בודק WCAG ו־SI 5568",
    sidebar_views: "תצוגות",
    sidebar_dashboard: "לוח מחוונים",
    sidebar_website_url: "כתובת אתר",
    sidebar_scope: "טווח סריקה",
    sidebar_single_page: "עמוד יחיד",
    sidebar_entire_site: "אתר שלם",
    sidebar_max_pages: "מקסימום עמודים (1-25)",
    sidebar_standard: "תקן תאימות",
    sidebar_standard_is: "תקן ישראלי SI 5568 (כולל בדיקות עברית)",
    sidebar_standard_note:
      "מצב SI 5568 מריץ את כל בדיקות WCAG 2.0 (חלק 1 של התקן הישראלי מאמץ את WCAG 2.0 כלשונו), בתוספת בדיקות ייעודיות לישראל (שפה וכיוון עברי, הצהרת נגישות). לכללים שהקריטריון שלהם מתואר במפורש ב-SI 5568 חלקים 1 ו-2 מוצג גם המקור העברי מהתקן. הבדיקה אוטומטית בלבד ואינה מחליפה ביקורת ידנית.",
    sidebar_user_type: "סוג משתמש",
    sidebar_end_user: "משתמש קצה",
    sidebar_developer: "מפתח",
    sidebar_site_owner: "בעל/מנהל אתר",
    sidebar_scanning: "סורק...",
    sidebar_run_scan: "הפעל סריקה",
    sidebar_rescan_current: "סרוק שוב את העמוד הנוכחי",
    sidebar_disability_filter: "סינון לפי מוגבלות",
    sidebar_uncheck_all: "בטל הכול",
    sidebar_check_all: "סמן הכול",
    disability_visual: "חזותית",
    disability_hearing: "שמיעה",
    disability_motor: "מוטורית",
    disability_cognitive: "קוגניטיבית",
    sidebar_preferred_language: "שפה מועדפת",
    lang_english: "English",
    lang_hebrew: "עברית",
    sidebar_expand: "הרחב סרגל צד",
    sidebar_minimize: "מזער סרגל צד",

    empty_scanning_title: "הסריקה מתבצעת…",
    empty_scanning_desc:
      "מתבצעת בדיקת נגישות אוטומטית מבוססת WCAG. מצב SI 5568 מוסיף גם בדיקות עברית/RTL והצהרת נגישות. זהו סינון אוטומטי בלבד ואינו מחליף ביקורת ידנית.",
    empty_failed: "הסריקה נכשלה",
    empty_unexpected_error: "אירעה שגיאה בלתי צפויה בזמן הסריקה.",
    empty_try_again: "נסה שוב",
    empty_ready: "מוכן לסריקה",
    empty_ready_desc:
      "בודק נגישות מבוסס WCAG עם בדיקות נבחרות הקשורות ל־SI 5568. הזן כתובת אתר ולחץ על",
    empty_run_scan: "הפעל סריקה",
    empty_ready_desc_end: "כדי להתחיל סינון אוטומטי.",
    empty_note:
      "הערה: הכלי מספק סינון אוטומטי בלבד. הוא אינו מחליף ביקורת נגישות ידנית מלאה ואינו מאשר תאימות SI 5568.",

    export_last_scan: "סריקה אחרונה:",
    export_just_now: "כרגע",
    export_min_ago: "לפני {{count}} דק׳",
    export_hour_ago: "לפני {{count}} שע׳",
    export_day_ago: "לפני {{count}} יום{{suffix}}",
    export_confirm_clear: "למחוק את תוצאות הסריקה הנוכחיות?",
    export_json: "יצוא JSON",
    export_csv: "יצוא CSV",
    export_clear: "נקה תוצאות",

    dashboard_total_issues: "סה״כ ליקויים",
    dashboard_across_pages: "על פני {{count}} עמוד{{suffix}}",
    dashboard_pages_scanned: "עמודים שנסרקו",
    dashboard_full_crawl: "סריקה מלאה של האתר",
    dashboard_single_page: "עמוד יחיד",
    dashboard_score: "ציון נגישות",
    dashboard_score_good: "טוב",
    dashboard_score_improve: "דורש שיפור",
    dashboard_score_poor: "נמוך",
    dashboard_critical_issues: "ליקויים קריטיים",
    dashboard_critical_subtitle: "דורשים טיפול מיידי",
    dashboard_failed_pages: "לא ניתן היה לסרוק {{count}} עמוד{{suffix}}",

    severity_distribution_title: "התפלגות ליקויים",
    severity_critical: "קריטי",
    severity_serious: "חמור",
    severity_moderate: "בינוני",
    severity_minor: "קל",

    chart_score_by_page: "ציון נגישות לפי עמוד",
    chart_score_label: "ציון",
    chart_severity_distribution: "התפלגות חומרה",
    chart_category_breakdown: "פילוח קטגוריות WCAG",
    chart_issues: "ליקויים",
    principle_perceivable: "נתפס",
    principle_operable: "ניתן לתפעול",
    principle_understandable: "מובן",
    principle_robust: "יציב",
    principle_other: "אחר",

    wcag_checks_coverage: "כיסוי בדיקות {{standard}}",
    wcag_check: "בדיקה",
    wcag_severity: "חומרה",
    wcag_passed: "עבר",
    wcag_failed: "נכשל",
    wcag_total: "סה״כ",
    wcag_pass_rate: "אחוז מעבר",

    issues_detected: "ליקויים שזוהו",
    issues_issue: "ליקוי",
    issues_severity: "חומרה",
    issues_affected: "מושפעים",
    issues_selector: "סלקטור",
    issues_page: "עמוד",
    issues_expand_row: "הרחב שורה",
    issues_collapse_row: "כווץ שורה",
    issues_description: "תיאור:",
    issues_why: "למה זה חשוב:",
    issues_recommendation: "המלצה:",
    issues_affected_users: "משתמשים מושפעים:",
    issues_reference: "אסמכתת {{standard}}:",
    issues_open_wcag: "פתח הסבר WCAG 2.1",
    issues_url: "כתובת הליקוי:",
    issues_location: "מיקום HTML:",
    issues_locations: "רכיבי DOM מושפעים:",
    issues_locations_help:
      "העתיקו סלקטור, פתחו את Elements ב-Chrome DevTools, לחצו Ctrl+F והדביקו כדי לאתר את הרכיב המושפע.",
    issues_search_locations: "חיפוש ברכיבים המושפעים",
    issues_copy_selector: "העתק סלקטור",
    issues_selector_copied: "הסלקטור הועתק",
    issues_no_selector: "אין סלקטור זמין.",
    issues_scanned_at: "נסרק ב־{{time}}",
    issues_no_issues: "לא נמצאו ליקויים.",
    issues_showing: "מציג {{from}}–{{to}} מתוך {{total}}",
    issues_previous: "הקודם",
    issues_next: "הבא",

    issues_standard_text: "ציטוט מהתקן:",
    issues_si_source: "מקור:",
    issues_annex_d_badge: "נספח ד׳ → AA",
    wcag_si5568_part1: "ת״י 5568 חלק 1",
    wcag_si5568_part2: "ת״י 5568 חלק 2",
  },
};

const TranslationContext = createContext<TranslationContextValue | null>(null);

function interpolate(template: string, vars?: Record<string, string | number>) {
  if (!vars) return template;
  return template.replace(/\{\{(.*?)\}\}/g, (_m, key) => {
    const v = vars[key.trim()];
    return v === undefined ? "" : String(v);
  });
}

function getInitialLanguage(): Language {
  if (typeof window === "undefined") return "en";
  const stored = window.localStorage.getItem("preferredLanguage");
  if (stored === "en" || stored === "he") return stored;
  return /^he/i.test(window.navigator.language || "") ? "he" : "en";
}

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  const direction: Direction = language === "he" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.dir = direction;
    document.documentElement.lang = language === "he" ? "he" : "en";
    window.localStorage.setItem("preferredLanguage", language);
  }, [language, direction]);

  const t = useMemo(() => {
    return (key: string, vars?: Record<string, string | number>) => {
      const dict = translations[language];
      const fallback = translations.en;
      const raw = dict[key] ?? fallback[key] ?? key;
      return interpolate(raw, vars);
    };
  }, [language]);

  const value = useMemo<TranslationContextValue>(
    () => ({
      language,
      direction,
      setLanguage: (lang: Language) => setLanguageState(lang),
      t,
    }),
    [language, direction, t]
  );

  return <TranslationContext.Provider value={value}>{children}</TranslationContext.Provider>;
}

export function useTranslation() {
  const ctx = useContext(TranslationContext);
  if (!ctx) {
    throw new Error("useTranslation must be used within TranslationProvider");
  }
  return ctx;
}
