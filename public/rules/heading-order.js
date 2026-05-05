(function () {
  const a11y = window.__a11y;
  if (!a11y || !a11y.register) return;

  a11y.register({
    id: "heading-order",
    title: "Headings must follow a logical, complete outline",
    description:
      "Heading levels should not skip, must not be empty, and the page should declare exactly one <h1>.",
    whyItMatters:
      "Heading levels create the page outline that screen-reader users rely on for navigation. Skipped or empty headings break that outline and confuse users.",
    severity: "moderate",
    recommendation:
      "Start with <h1>, never skip levels (h1 → h3), avoid empty headings, and use only one <h1> per page.",
    disabilities: ["cognitive", "visual"],
    selectorHint: "h1, h2, h3, h4, h5, h6",
    standards: {
      wcag20: { criterion: "1.3.1", level: "A" },
      wcag21: { criterion: "1.3.1", level: "A" },
      wcag22: { criterion: "1.3.1", level: "A" },
      // Annex D in Part 1 raises 2.4.10 from AAA → AA, and Part 2 §4 covers 1.3.1.
      si5568: {
        criterion: "1.3.1",
        clause: "SI 5568 Part 2 §4 (1.3.1) + Part 1 Annex D (2.4.10 → AA)",
        level: "A",
      },
    },
    i18n: {
      en: {
        title: "Headings must follow a logical, complete outline",
        description:
          "Headings must use semantic tagging (<h1>–<h6>), follow a hierarchical order without skipping levels, must not be empty, and the page should expose exactly one <h1>.",
        whyItMatters:
          "Screen reader users rely on the heading outline to skim a page. Skipped, empty, or missing headings break that outline and disorient assistive-technology users.",
        recommendation:
          "Begin the page with a single <h1>. Never skip levels (e.g. <h2> followed directly by <h4>). Remove or fill empty headings. Avoid using headings purely for visual styling.",
      },
      he: {
        title: 'כותרות חייבות לבנות מבנה היררכי תקין ומלא',
        description:
          'יש לסמן כותרות בתגיות סמנטיות (<h1>–<h6>), בסדר היררכי רציף ללא דילוגי רמה, ללא כותרת ריקה, ובדף יחיד יוצג <h1> אחד.',
        whyItMatters:
          'משתמשי קוראי מסך מסתמכים על מבנה הכותרות לצורך ניווט מהיר בדף. דילוגי רמה, כותרות ריקות או היעדר <h1> שוברים את המבנה ופוגעים בהתמצאות.',
        recommendation:
          'פתחו ב-<h1> יחיד, אל תדלגו על רמות, מלאו או הסירו כותרות ריקות, ואל תשתמשו בכותרות לעיצוב חזותי בלבד.',
      },
    },
    si5568: {
      coveredByPdf: true,
      part: 2,
      clause: "1.3.1 + 2.4.10",
      level: "A",
      annexDOverride: "AA", // Annex D promotes 2.4.10 from AAA → AA
      sourceQuote: {
        en: 'SI 5568 Part 2, criterion 1.3.1 — text shown as a heading must be tagged semantically. In a document with multiple heading levels, headings must be tagged in the appropriate hierarchy (heading 1–6). SI 5568 Part 1, Annex D, raises criterion 2.4.10 (Section Headings) from AAA to AA: every web page that has hierarchical textual content must use H tags for its section headings.',
        he: 'ת"י 5568 חלק 2, סעיף 1.3.1 — טקסט המוצג ככותרת יתויג בתיוג סמנטי. במסמך שיש בו כמה רמות כותרת (לדוגמה, כותרת ראשית ומשנית), יש לתייג את הכותרות בהיררכייה המתאימה (heading 1–6). בנוסף, נספח ד׳ של ת"י 5568 חלק 1 מעלה את סעיף 2.4.10 (Section Headings) מ-AAA ל-AA: בכל דף רשת שיש בו תוכן טקסטואלי בעל מבנה היררכי, יצוינו כותרות בתגית H.',
      },
    },
    run(doc) {
      const headings = a11y.toArray(doc.querySelectorAll("h1, h2, h3, h4, h5, h6"));
      const failed = [];
      let last = 0;
      const h1s = headings.filter((h) => h.tagName === "H1");

      headings.forEach((h) => {
        const level = Number(h.tagName.replace("H", ""));
        // Skipped level (e.g. h2 -> h4)
        if (last !== 0 && level > last + 1) failed.push(h);
        // Empty heading text
        const text = (h.textContent || "").replace(/\s+/g, " ").trim();
        if (!text) failed.push(h);
        last = level;
      });

      // Missing <h1> — flag the documentElement as the offending node.
      if (h1s.length === 0 && headings.length > 0) {
        failed.push(doc.documentElement);
      }
      // Multiple <h1>s — informational only, but include them in the count
      // so the report mentions it.
      if (h1s.length > 1) {
        for (let i = 1; i < h1s.length; i += 1) failed.push(h1s[i]);
      }

      // Total count covers headings + the structural h1 check.
      const total = Math.max(headings.length, 1);
      return { total, failedNodes: failed };
    },
  });
})();
