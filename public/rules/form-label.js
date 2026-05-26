(function () {
  const a11y = window.__a11y;
  if (!a11y || !a11y.register) return;

  a11y.register({
    id: "form-label",
    title: "Form controls must have labels",
    description:
      "Every form control (input, select, textarea) must have a programmatic label so assistive technologies can announce its purpose.",
    whyItMatters:
      "Without labels, screen reader users hear 'edit' or 'combo box' with no indication of what to type. Labels also create larger click targets, which helps users with motor impairments.",
    severity: "critical",
    recommendation:
      "Use a <label for='id'>, wrap the control in a <label>, or add aria-label / aria-labelledby. Placeholders are not a substitute for a label.",
    disabilities: ["visual", "cognitive", "motor"],
    selectorHint: "input, select, textarea",
    standards: {
      wcag20: { criterion: "1.3.1", level: "A" },
      wcag21: { criterion: "1.3.1", level: "A" },
      wcag22: { criterion: "1.3.1", level: "A" },
      si5568: { criterion: "1.3.1", clause: 'SI 5568 Part 2 §4 (1.3.1)', level: "A" },
    },
    i18n: {
      en: {
        title: "Form controls must have labels",
        description:
          "Every form control (input, select, textarea) must have a programmatic label so assistive technology can announce its purpose.",
        whyItMatters:
          "Without a label, screen reader users hear only the control type ('edit', 'combo box') with no idea what to enter. Labels also enlarge the click target for motor-impaired users.",
        recommendation:
          "Use <label for='id'>, wrap the control in <label>, or set aria-label / aria-labelledby. Placeholders alone are not a substitute for a label.",
      },
      he: {
        title: 'פקדי טופס חייבים בתווית',
        description:
          'לכל פקד טופס (input, select, textarea) חייבת להיות תווית הניתנת לזיהוי על-ידי תוכנה, כך שטכנולוגיה מסייעת תוכל להכריז על תפקיד הפקד.',
        whyItMatters:
          'ללא תווית, משתמשי קוראי מסך שומעים רק את סוג הפקד ("שדה עריכה", "תיבת בחירה") בלי לדעת מה לכתוב. תווית גם מגדילה את אזור הלחיצה ועוזרת לבעלי מוגבלות מוטורית.',
        recommendation:
          'השתמשו ב-<label for="id">, עטפו את הפקד בתוך <label>, או הוסיפו aria-label / aria-labelledby. טקסט placeholder אינו תחליף לתווית.',
      },
    },
    si5568: {
      coveredByPdf: true,
      part: 2,
      clause: "1.3.1",
      level: "A",
      annexDOverride: null,
      sourceQuote: {
        en: 'SI 5568 Part 2, criterion 1.3.1 — information, structure, and relationships conveyed through presentation must be programmatically determinable. Headings, labels, and list structure must use semantic tagging so assistive technology can identify them.',
        he: 'ת"י 5568 חלק 2, סעיף 1.3.1 — המידע, המבנה והקשרים המוצגים למשתמש ניתנים לזיהוי באמצעות תוכנה או שהם זמינים כטקסט. כותרות, תוויות (labels) ורשימות יתויגו בתיוג סמנטי כדי שטכנולוגיה מסייעת תזהה את תפקידן.',
      },
    },
    run(doc) {
      const controls = a11y
        .toArray(doc.querySelectorAll("input, select, textarea"))
        .filter((el) => !a11y.isElementHidden(el))
        // Hidden inputs require no label.
        .filter((el) => {
          if (!(el instanceof HTMLInputElement)) return true;
          const t = (el.getAttribute("type") || "text").toLowerCase();
          return t !== "hidden";
        });

      const failedNodes = controls.filter((field) => {
        const name = a11y.getAccessibleName(field);
        // Empty name OR placeholder-only is treated as missing label here. The
        // placeholder-only-label rule handles the warning-level finding.
        return !name || name === "__skip__";
      });

      return { total: controls.length, failedNodes };
    },
  });
})();
