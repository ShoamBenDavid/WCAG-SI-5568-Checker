(function () {
  const a11y = window.__a11y;
  if (!a11y || !a11y.register) return;

  /**
   * Israeli SI 5568-relevant check.
   *
   * If the page contains substantial Hebrew content (>= 20 Hebrew chars), we
   * expect:
   *   - <html lang> to start with "he"
   *   - <html dir="rtl"> or <body dir="rtl">
   *
   * This rule is registered ONLY for the SI 5568 standard. It does not have a
   * direct WCAG criterion mapping (it's an Israeli accessibility regulation
   * concern more than a strict WCAG one), so we set israelOnly: true.
   */
  a11y.register({
    id: "hebrew-rtl",
    title: "Hebrew pages must declare lang='he' and dir='rtl'",
    description:
      "When the page content is primarily in Hebrew, the document language and direction must be set so screen readers and browsers render text correctly.",
    whyItMatters:
      "Without lang='he', Hebrew screen readers may pronounce text in the wrong language. Without dir='rtl', mixed Hebrew/English content layout breaks for sighted readers.",
    severity: "serious",
    recommendation: 'Set <html lang="he" dir="rtl"> on Hebrew-language pages.',
    disabilities: ["visual", "cognitive"],
    selectorHint: "html",
    standards: {
      si5568: {
        criterion: "10.2",
        clause: "SI 5568 Hebrew language tagging (Israeli regulation requirement)",
        level: "A",
        israelOnly: true,
      },
    },
    i18n: {
      en: {
        title: "Hebrew pages must declare lang='he' and dir='rtl'",
        description:
          "When the page content is primarily in Hebrew, both the document language (lang='he') and direction (dir='rtl') must be set so screen readers, browsers, and search engines render the text correctly.",
        whyItMatters:
          "Without lang='he', Hebrew screen readers (NVDA + Hebrew voice, JAWS, VoiceOver) may pronounce the text in the wrong language. Without dir='rtl', mixed Hebrew/English layout breaks (punctuation, numbers, line breaks) for sighted readers as well.",
        recommendation:
          'Set <html lang="he" dir="rtl"> at the top of every Hebrew page. Mark inline foreign-language sections with their own lang="en" / dir="ltr" attributes.',
      },
      he: {
        title: 'דפים בעברית חייבים להכריז lang="he" ו-dir="rtl"',
        description:
          'כאשר תוכן הדף הוא בעברית, יש להגדיר גם את שפת המסמך (lang="he") וגם את כיוון הקריאה (dir="rtl"), כדי שקוראי מסך, דפדפנים ומנועי חיפוש יציגו את הטקסט נכון.',
        whyItMatters:
          'ללא lang="he", קוראי מסך בעברית עלולים להגות את הטקסט בשפה השגויה. ללא dir="rtl", שילוב של עברית ואנגלית נשבר ויזואלית (סימני פיסוק, מספרים, שבירת שורות) גם עבור משתמשים רואים.',
        recommendation:
          'קבעו <html lang="he" dir="rtl"> בראש כל דף בעברית. סמנו מקטעי שפה זרה בתוך הדף בתכונות lang="en" / dir="ltr" משלהם.',
      },
    },
    si5568: {
      coveredByPdf: false, // Israeli regulation, not a verbatim PDF clause
      part: 1,
      clause: "Israeli regulation – Hebrew language tagging",
      level: "A",
      annexDOverride: null,
      sourceQuote: {
        en: 'Israeli accessibility practice: pages whose primary content is Hebrew must declare lang="he" and use RTL directionality so assistive technology can identify the language and reading order. This requirement is implicit in SI 5568 alongside the broader Equal Rights for Persons with Disabilities Regulations.',
        he: 'נוהג הנגישות הישראלי: דפים שתכניהם בעיקר בעברית חייבים להכריז lang="he" ולהשתמש בכיוון RTL, כדי שטכנולוגיות מסייעות יזהו את השפה ואת סדר הקריאה. דרישה זו נגזרת ברוח ת"י 5568 ומתקנות שוויון זכויות לאנשים עם מוגבלות.',
      },
    },
    run(doc) {
      // Quick exit if no Hebrew content present.
      const text = (doc.body && doc.body.innerText) || "";
      if (!a11y.containsSubstantialHebrew(text)) {
        return { total: 1, failedNodes: [] };
      }

      const root = doc.documentElement;
      const body = doc.body;
      const lang = (root.getAttribute("lang") || "").toLowerCase();
      const dirRoot = (root.getAttribute("dir") || "").toLowerCase();
      const dirBody = body ? (body.getAttribute("dir") || "").toLowerCase() : "";
      const langOk = lang.startsWith("he");
      const dirOk = dirRoot === "rtl" || dirBody === "rtl";
      const failed = !langOk || !dirOk;
      return { total: 1, failedNodes: failed ? [root] : [] };
    },
  });
})();
