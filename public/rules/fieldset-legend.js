(function () {
  const a11y = window.__a11y;
  if (!a11y || !a11y.register) return;

  a11y.register({
    id: "fieldset-legend",
    title: "Radio and checkbox groups must use fieldset + legend",
    description:
      "Groups of related radio buttons or checkboxes (≥ 2 controls sharing the same name) must be wrapped in a <fieldset> with a non-empty <legend>.",
    whyItMatters:
      "Screen readers announce the legend alongside each option in the group, so users know which question they are answering. Without it the choices are read out individually with no overarching question.",
    severity: "moderate",
    recommendation:
      "Wrap the group in <fieldset><legend>...</legend>...</fieldset>, or if visual layout requires, use role='group' / role='radiogroup' with aria-labelledby.",
    disabilities: ["visual", "cognitive", "motor"],
    selectorHint: "input[type='radio'], input[type='checkbox']",
    standards: {
      wcag20: { criterion: "1.3.1", level: "A" },
      wcag21: { criterion: "1.3.1", level: "A" },
      wcag22: { criterion: "1.3.1", level: "A" },
      si5568: { criterion: "1.3.1", clause: "SI 5568 Part 2 §4 (1.3.1)", level: "A" },
    },
    i18n: {
      en: {
        title: "Radio and checkbox groups must use fieldset + legend",
        description:
          "Groups of related radio buttons or checkboxes (≥ 2 controls sharing the same name) must be wrapped in <fieldset> with a non-empty <legend>.",
        whyItMatters:
          "Screen readers announce the legend with each option, so users always know which question the option belongs to. Without it the radios are read in isolation.",
        recommendation:
          "Wrap the group in <fieldset><legend>Question</legend>...</fieldset> or, if styling is restrictive, use role='group'/'radiogroup' with aria-labelledby.",
      },
      he: {
        title: 'קבוצות רדיו וצ׳קבוקס חייבות fieldset + legend',
        description:
          'קבוצות של כפתורי רדיו או תיבות סימון (לפחות שני פקדים שחולקים את אותו name) חייבות להיות עטופות ב-<fieldset> עם <legend> שאינו ריק.',
        whyItMatters:
          'קוראי מסך מכריזים את ה-legend לצד כל אפשרות בקבוצה, כך שהמשתמש יודע על איזו שאלה הוא משיב. ללא legend, האפשרויות נקראות בלי הקשר לשאלה הראשית.',
        recommendation:
          'עטפו את הקבוצה ב-<fieldset><legend>שאלה</legend>...</fieldset>, או אם העיצוב מגביל — השתמשו ב-role="group"/"radiogroup" יחד עם aria-labelledby.',
      },
    },
    si5568: {
      coveredByPdf: true,
      part: 2,
      clause: "1.3.1",
      level: "A",
      annexDOverride: null,
      sourceQuote: {
        en: 'SI 5568 Part 2, criterion 1.3.1 — information, structure, and relationships conveyed through presentation must be programmatically determinable. For groups of related form controls (radios, checkboxes) this means semantic grouping so the screen reader can announce the group label with each option.',
        he: 'ת"י 5568 חלק 2, סעיף 1.3.1 — המידע, המבנה והקשרים המוצגים למשתמש ניתנים לזיהוי באמצעות תוכנה. עבור קבוצות פקדים קשורות (רדיו, צ׳קבוקס) הדבר מחייב קיבוץ סמנטי כך שקורא המסך יוכל להכריז את תווית הקבוצה לצד כל אפשרות.',
      },
    },
    run(doc) {
      // Build name -> [elements] map for radios and checkboxes that share a
      // name and aren't already grouped via fieldset/role=group.
      const all = a11y.toArray(
        doc.querySelectorAll("input[type='radio'], input[type='checkbox']")
      );
      const byName = new Map();
      all.forEach((el) => {
        const name = el.getAttribute("name");
        if (!name) return;
        const arr = byName.get(name) || [];
        arr.push(el);
        byName.set(name, arr);
      });

      const failedNodes = [];
      let groupCount = 0;
      byName.forEach((nodes) => {
        if (nodes.length < 2) return;
        groupCount += 1;
        const inFieldset = nodes.every((n) => n.closest("fieldset"));
        if (inFieldset) {
          const fs = nodes[0].closest("fieldset");
          const legend = fs ? fs.querySelector(":scope > legend") : null;
          const legendText = legend ? (legend.textContent || "").trim() : "";
          if (legendText) return;
        }
        // Allow ARIA grouping with a non-empty accessible name.
        const grouped = nodes[0].closest("[role='group'], [role='radiogroup']");
        if (grouped) {
          const groupName = (a11y.getAccessibleName(grouped) || "").trim();
          if (groupName) return;
        }
        // Report the first member of the group as the failure node.
        failedNodes.push(nodes[0]);
      });

      return { total: groupCount || 1, failedNodes };
    },
  });
})();
