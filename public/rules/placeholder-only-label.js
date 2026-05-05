(function () {
  const a11y = window.__a11y;
  if (!a11y || !a11y.register) return;

  a11y.register({
    id: "placeholder-only-label",
    title: "Placeholder is not a substitute for a label",
    description:
      "Form fields that rely solely on placeholder text as their label disappear when the user starts typing and may not be exposed to assistive technology.",
    whyItMatters:
      "Placeholder text is not announced reliably by all screen readers and disappears once the user types, leaving cognitive-impaired users without context.",
    severity: "moderate",
    recommendation:
      "Add a real <label>, aria-label, or aria-labelledby in addition to (or instead of) the placeholder.",
    disabilities: ["cognitive", "visual"],
    selectorHint: "input[placeholder], textarea[placeholder]",
    standards: {
      wcag20: { criterion: "3.3.2", level: "A" },
      wcag21: { criterion: "3.3.2", level: "A" },
      wcag22: { criterion: "3.3.2", level: "A" },
      si5568: { criterion: "2.4.6", clause: 'SI 5568 Part 2 §5 (2.4.6 Headings and Labels)', level: "AA" },
    },
    i18n: {
      en: {
        title: "Placeholder is not a substitute for a label",
        description:
          "A form field that uses only its placeholder as a label loses that label as soon as the user starts typing, and not all assistive technologies expose placeholders.",
        whyItMatters:
          "Placeholders are unreliable: they are sometimes ignored by screen readers, often have insufficient contrast, and they disappear once the user types — leaving cognitive-impaired users without orientation.",
        recommendation:
          "Provide a real <label>, aria-label, or aria-labelledby alongside the placeholder. Use the placeholder for example input only.",
      },
      he: {
        title: 'placeholder אינו תחליף לתווית',
        description:
          'שדה טופס המשתמש בטקסט placeholder בלבד כתווית מאבד את התווית ברגע שהמשתמש מתחיל להקליד, ולא כל טכנולוגיה מסייעת מזהה placeholder.',
        whyItMatters:
          'placeholder לא מוקרא באופן אחיד בכל קוראי המסך, נעלם ברגע ההקלדה ולעיתים בעל ניגודיות נמוכה — ולכן בעלי מוגבלות קוגניטיבית או ראייה נשארים בלי הקשר.',
        recommendation:
          'הוסיפו <label>, aria-label או aria-labelledby בנוסף ל-placeholder. ה-placeholder ישמש להמחשת דוגמה בלבד, לא כתווית.',
      },
    },
    si5568: {
      coveredByPdf: true,
      part: 2,
      clause: "2.4.6",
      level: "AA",
      annexDOverride: null,
      sourceQuote: {
        en: 'SI 5568 Part 2, criterion 2.4.6 — headings and labels must describe topic or purpose. A paragraph or sentence that does not define the topic or purpose of the content that follows must not be marked as a heading or used as a label.',
        he: 'ת"י 5568 חלק 2, סעיף 2.4.6 — כותרות (headings) ותוויות (labels) משמשות לתיאור הנושא או התכלית. טקסט (לדוגמה, פסקה או משפט) שאינו משמש להגדרת הנושא או מטרת התוכן שיבוא אחריו, אין לסמנו ככותרת או להשתמש בו כתווית.',
      },
    },
    run(doc) {
      const all = a11y
        .toArray(doc.querySelectorAll("input[placeholder], textarea[placeholder]"))
        .filter((el) => {
          if (!(el instanceof HTMLInputElement)) return true;
          const t = (el.getAttribute("type") || "text").toLowerCase();
          return t !== "hidden" && t !== "submit" && t !== "button" && t !== "reset";
        });
      const failedNodes = all.filter((el) => a11y.hasPlaceholderOnly(el));
      return { total: all.length, failedNodes };
    },
  });
})();
