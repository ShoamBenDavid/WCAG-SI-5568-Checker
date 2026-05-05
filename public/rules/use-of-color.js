(function () {
  const a11y = window.__a11y;
  if (!a11y || !a11y.register) return;

  a11y.register({
    id: "use-of-color",
    title: "Inline links should not rely on color alone",
    description:
      "Inline <a> elements inside flowing text whose only visual distinction is color (no underline, not bold) cannot be distinguished by users who can't perceive that color.",
    whyItMatters:
      "Color-blind users and users in high-contrast modes will not see the colored text and will not realise it is a link.",
    severity: "moderate",
    recommendation:
      "Restore the default underline on inline links, or make them visibly bold, or pair the colour with a non-color indicator (icon, underline on hover/focus).",
    disabilities: ["visual", "cognitive"],
    selectorHint: "a[href]",
    standards: {
      wcag20: { criterion: "1.4.1", level: "A" },
      wcag21: { criterion: "1.4.1", level: "A" },
      wcag22: { criterion: "1.4.1", level: "A" },
      si5568: { criterion: "1.4.1", clause: "SI 5568 Part 2 §4 (1.4.1)", level: "A" },
    },
    i18n: {
      en: {
        title: "Inline links should not rely on color alone",
        description:
          "Inline <a> elements inside flowing text whose only visual distinction is color (no underline, not bold) cannot be distinguished by users who can't perceive that color.",
        whyItMatters:
          "Color-blind users and users in high-contrast modes will not see the colored text and will not realise it is a link.",
        recommendation:
          "Restore the default underline, make inline links visibly bold, or pair the colour with a non-color indicator (icon, underline).",
      },
      he: {
        title: 'אסור להבחין קישורים מובלעים בטקסט באמצעות צבע בלבד',
        description:
          'תגיות <a> המשולבות בטקסט שזורם, שהיחיד שמבחין אותן הוא הצבע (ללא קו תחתי וללא הדגשה), אינן ניתנות לזיהוי על ידי מי שלא מבחין באותו צבע.',
        whyItMatters:
          'משתמשים עם עיוורון צבעים, או במצב ניגודיות גבוהה, לא יראו את הצבע ולא יבינו שמדובר בקישור.',
        recommendation:
          'החזירו את הקו התחתון לקישורים מובלעים, הציגו אותם בהדגשה (bold), או צרפו סימון נוסף שאינו תלוי צבע (אייקון, מסגרת ב-hover).',
      },
    },
    si5568: {
      coveredByPdf: true,
      part: 2,
      clause: "1.4.1",
      level: "A",
      annexDOverride: null,
      sourceQuote: {
        en: 'SI 5568 Part 2, criterion 1.4.1 — color must not be the sole visual means of conveying information, indicating an action, prompting a response, or distinguishing a visual element. For inline hyperlinks this means an additional cue (underline, weight) is required so the link is identifiable without colour perception.',
        he: 'ת"י 5568 חלק 2, סעיף 1.4.1 — אין להשתמש בצבע כאמצעי הוויזואלי היחיד למסירת מידע, לציון פעולה, לקבלת תגובה, או להבחנה בין רכיב חזותי לאחר. עבור קישורים המשולבים בתוך טקסט, יש להוסיף סימון נוסף (קו תחתי, הדגשה) כך שהקישור יזוהה גם ללא זיהוי הצבע.',
      },
    },
    run(doc) {
      // Look at <a> inside <p>/<li>/<span> with surrounding text.
      const candidates = a11y
        .toArray(doc.querySelectorAll("p a[href], li a[href], span a[href]"))
        .slice(0, 300);
      const failedNodes = candidates.filter((a) => {
        const style = window.getComputedStyle(a);
        if (!a11y.isVisible(a, style)) return false;
        const decoration = (style.textDecorationLine || style.textDecoration || "").toLowerCase();
        if (decoration && decoration !== "none" && decoration !== "initial") return false;
        const weight = Number.parseInt(style.fontWeight, 10);
        if (Number.isFinite(weight) && weight >= 600) return false;
        // Must have non-empty text and surrounding text in the parent.
        const parent = a.parentElement;
        if (!parent) return false;
        const parentText = (parent.textContent || "").replace(/\s+/g, " ").trim();
        const linkText = (a.textContent || "").replace(/\s+/g, " ").trim();
        if (!linkText || parentText.length <= linkText.length + 5) return false;
        return true;
      });
      return { total: candidates.length, failedNodes };
    },
  });
})();
