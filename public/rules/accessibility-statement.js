(function () {
  const a11y = window.__a11y;
  if (!a11y || !a11y.register) return;

  /**
   * The Israeli 'Equal Rights for Persons with Disabilities Regulations'
   * (5773-2013, regulation 35) requires Israeli service providers to publish
   * an accessibility statement (הצהרת נגישות) and link to it from every page
   * of the website.
   *
   * Only registered for the SI 5568 standard (israelOnly: true).
   */
  const PATTERNS = [
    /הצהרת\s*נגישות/i,
    /הצהרה\s*של\s*נגישות/i,
    /^נגישות$/i,
    /^accessibility\s*statement$/i,
    /^accessibility$/i,
    /^a11y$/i,
  ];

  a11y.register({
    id: "accessibility-statement",
    title: "Page must link to an accessibility statement",
    description:
      "Israeli accessibility regulations require a link to the site's accessibility statement (הצהרת נגישות) from every page.",
    whyItMatters:
      "An accessibility statement is the user's primary route to report barriers and obtain alternative formats. It is a regulatory requirement under the Equal Rights for Persons with Disabilities Regulations 5773-2013.",
    severity: "serious",
    recommendation:
      'Add a link with text "הצהרת נגישות" or "Accessibility Statement" pointing to the published statement page.',
    disabilities: ["visual", "cognitive", "motor", "hearing"],
    selectorHint: "a",
    standards: {
      si5568: {
        criterion: "—",
        clause: "Israeli Equal Rights Reg. 35 (Accessibility Statement)",
        level: "A",
        israelOnly: true,
      },
    },
    i18n: {
      en: {
        title: "Page must link to an accessibility statement",
        description:
          "Israeli accessibility regulations require every page on a service provider's site to link to the site's published accessibility statement (הצהרת נגישות).",
        whyItMatters:
          "The accessibility statement is the user's primary route to report barriers, request alternative formats, and contact the accessibility coordinator. It is a regulatory requirement under the Equal Rights for Persons with Disabilities Regulations 5773-2013, regulation 35.",
        recommendation:
          'Add a visible link in the header or footer whose text is "הצהרת נגישות" or "Accessibility Statement", pointing to the published statement page.',
      },
      he: {
        title: 'בכל דף יש לקשר להצהרת הנגישות של האתר',
        description:
          'תקנות הנגישות הישראליות דורשות מספק שירות לקשר מכל דף באתר לעמוד הצהרת הנגישות הפורמלית של האתר.',
        whyItMatters:
          'הצהרת הנגישות היא הדרך העיקרית של המשתמש לדווח על חסמים, לבקש חלופות נגישות וליצור קשר עם רכז הנגישות. מדובר בדרישה רגולטורית מתוקף תקנות שוויון זכויות לאנשים עם מוגבלות (התאמות נגישות לשירות), התשע"ג-2013, תקנה 35.',
        recommendation:
          'הוסיפו קישור גלוי בכותרת או בכותרת התחתונה של הדף, שמלל הקישור הוא "הצהרת נגישות" (או "Accessibility Statement"), המוביל לעמוד ההצהרה הפורמלי.',
      },
    },
    si5568: {
      coveredByPdf: false, // External Israeli regulation, not a verbatim PDF clause
      part: 1,
      clause: "Equal Rights Regulations 5773-2013, regulation 35",
      level: "A",
      annexDOverride: null,
      sourceQuote: {
        en: 'Israeli Equal Rights for Persons with Disabilities Regulations (5773-2013), regulation 35 — service providers operating on the internet must publish an accessibility statement and link to it from every page of the site. This complements SI 5568 and is enforced separately.',
        he: 'תקנות שוויון זכויות לאנשים עם מוגבלות (התאמות נגישות לשירות), התשע"ג-2013, תקנה 35 — מי שמספק שירות באמצעות האינטרנט יפרסם הצהרת נגישות ויקשר אליה מכל דף באתר. מדובר בהשלמה לת"י 5568 ובדרישה רגולטורית נפרדת.',
      },
    },
    run(doc) {
      const links = a11y.toArray(doc.querySelectorAll("a[href]"));
      const found = links.some((a) => {
        const text = (a.textContent || "").trim();
        const aria = (a.getAttribute("aria-label") || "").trim();
        const candidate = text || aria;
        if (!candidate) return false;
        return PATTERNS.some((p) => p.test(candidate));
      });

      const target = doc.body || doc.documentElement;
      return { total: 1, failedNodes: found ? [] : [target] };
    },
  });
})();
