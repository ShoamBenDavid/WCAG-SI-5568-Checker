(function () {
  const a11y = window.__a11y;
  if (!a11y || !a11y.register) return;

  a11y.register({
    id: "color-contrast",
    title: "Text contrast must meet WCAG minimum ratios",
    description:
      "Body text must have at least a 4.5:1 contrast ratio against its effective background. Large text (18pt or 14pt bold) needs 3:1.",
    whyItMatters:
      "Low contrast text is unreadable for users with low vision or in bright environments. This is one of the most-cited barriers in real accessibility audits.",
    severity: "serious",
    recommendation:
      "Increase contrast between text and its true background. Use a contrast checker that resolves the actual rendered colors, including transparency.",
    disabilities: ["visual"],
    selectorHint: "text-bearing elements",
    standards: {
      wcag20: { criterion: "1.4.3", level: "AA" },
      wcag21: { criterion: "1.4.3", level: "AA" },
      wcag22: { criterion: "1.4.3", level: "AA" },
      si5568: { criterion: "1.4.3", clause: "SI 5568 Part 2 §4 (1.4.3) — defs 3.6/3.7", level: "AA" },
    },
    i18n: {
      en: {
        title: "Text contrast must meet WCAG minimum ratios",
        description:
          "Body text must have at least a 4.5:1 contrast ratio against its effective background. Large text (18.5px or larger, or 14px bold or larger) requires at least 3:1.",
        whyItMatters:
          "Low-contrast text is unreadable for users with low vision, color-vision deficiency, or in bright environments. Contrast is one of the most-cited barriers in real accessibility audits.",
        recommendation:
          "Increase the contrast between text and its true (effective) background. Use a contrast checker that resolves the actual rendered colors, including transparency and ancestor backgrounds.",
      },
      he: {
        title: 'ניגודיות הטקסט חייבת לעמוד ביחסים המינימליים',
        description:
          'בטקסט רגיל יחס הניגודיות יהיה לפחות 4.5:1 מול הרקע האפקטיבי. בטקסט גדול (18.5px ומעלה, או 14px ומעלה במודגש) יספיק יחס של 3:1.',
        whyItMatters:
          'טקסט בניגודיות נמוכה אינו קריא עבור משתמשים עם ראייה לקויה, עיוורון צבעים, או בתאורה חזקה. ניגודיות היא אחד החסמים הנפוצים ביותר.',
        recommendation:
          'הגדילו את הניגודיות בין הטקסט לרקע האפקטיבי שלו. השתמשו בכלי בדיקה המחשב את הצבעים בפועל, כולל שקיפות וצבעי רכיבים-אב (ancestors).',
      },
    },
    si5568: {
      coveredByPdf: true,
      part: 2,
      clause: "1.4.3",
      level: "AA",
      annexDOverride: null,
      sourceQuote: {
        en: 'SI 5568 Part 2, criterion 1.4.3 — visual presentation of text and images of text has a contrast ratio of at least 4.5:1, except for large text (definition 3.6) which has at least 3:1. Per definition 3.6: large text on web pages is 18.5px or larger; bold large text is 14px or larger. Logo or brand text has no minimum contrast requirement.',
        he: 'ת"י 5568 חלק 2, סעיף 1.4.3 — בהצגה חזותית של טקסט ושל תמונות-טקסט מתקיים יחס ניגודיות של 4.5:1 לפחות, ובטקסט גדול (הגדרה 3.6) מתקיים יחס ניגודיות של 3:1 לפחות. לפי הגדרה 3.6: טקסט "גדול" בדפי אינטרנט הוא 18.5px ומעלה, וטקסט מודגש "גדול" הוא 14px ומעלה. בתמונות סמליל (לוגו) — עבור טקסט שהוא חלק מסמליל או משם מותג, אין דרישת מינימום ליחס ניגודיות.',
      },
    },
    run(doc) {
      void doc; // contrast util reads from window.document directly
      const { failures, testedCount } = a11y.findTextContrastFailures(200);
      const failedNodes = failures.map((f) => f.element);
      return { total: testedCount, failedNodes };
    },
  });
})();
