(function () {
  const a11y = window.__a11y;
  if (!a11y || !a11y.register) return;

  // Heuristic: <img> whose alt is unusually long and contains sentence
  // punctuation is probably a screenshot of text. Real text should be HTML.
  const SENTENCE = /[.!?,;:][\s$]/;

  a11y.register({
    id: "images-of-text",
    title: "Avoid images of text",
    description:
      "When the image's alt text is itself a long sentence with punctuation, the image is probably a rasterised piece of text — which cannot be resized, restyled, or translated.",
    whyItMatters:
      "Images of text don't scale gracefully, can't be re-styled by user CSS, and pixelate when zoomed. Low-vision and cognitive users lose information.",
    severity: "minor",
    recommendation:
      "Replace the image with HTML text. Where a logo / brand-mark is the only exception, keep the image but use SVG so it scales.",
    disabilities: ["visual", "cognitive"],
    selectorHint: "img[alt]",
    standards: {
      wcag20: { criterion: "1.4.5", level: "AA" },
      wcag21: { criterion: "1.4.5", level: "AA" },
      wcag22: { criterion: "1.4.5", level: "AA" },
      si5568: { criterion: "1.4.5", clause: "SI 5568 Part 2 §4 (1.4.5)", level: "AA" },
    },
    i18n: {
      en: {
        title: "Avoid images of text",
        description:
          "When the image's alt text is a long sentence with punctuation, the image is likely rasterised text and cannot be resized or re-styled by the user.",
        whyItMatters:
          "Images of text pixelate when zoomed and ignore user style overrides — both blocking for low-vision users.",
        recommendation:
          "Replace the image with HTML text. Where logos/brand-marks are unavoidable, use SVG so the text remains crisp at any zoom level.",
      },
      he: {
        title: 'יש להימנע מתמונות של טקסט',
        description:
          'כאשר המאפיין alt של תמונה הוא משפט ארוך עם סימני פיסוק, סביר שהתמונה היא טקסט מרוסטר — וכזה אי אפשר להגדיל, לעצב מחדש או לתרגם.',
        whyItMatters:
          'תמונות של טקסט מתפקסלות בזום ומתעלמות מהגדרות העיצוב של המשתמש — שני דברים שחוסמים לקויי ראייה.',
        recommendation:
          'החליפו את התמונה בטקסט HTML. במקרים שאי אפשר אחרת (לוגו/סמל מותג) — השתמשו ב-SVG כדי שהטקסט יישאר חד בכל רמת זום.',
      },
    },
    si5568: {
      coveredByPdf: true,
      part: 2,
      clause: "1.4.5",
      level: "AA",
      annexDOverride: null,
      sourceQuote: {
        en: 'SI 5568 Part 2, criterion 1.4.5 — if the technologies being used can achieve the visual presentation, text is used to convey information rather than images of text. Exceptions are limited to logotypes and cases where a particular presentation of text is essential.',
        he: 'ת"י 5568 חלק 2, סעיף 1.4.5 — אם הטכנולוגיות שבשימוש מאפשרות זאת מבחינה חזותית, יש למסור מידע באמצעות טקסט ולא באמצעות תמונה של טקסט. החריגים מוגבלים ללוגוטיפים ולמקרים שבהם הצגה חזותית מסוימת של הטקסט היא חיונית.',
      },
    },
    run(doc) {
      const imgs = a11y.toArray(doc.querySelectorAll("img[alt]"));
      const failedNodes = imgs.filter((img) => {
        const alt = (img.getAttribute("alt") || "").trim();
        if (alt.length < 80) return false;
        return SENTENCE.test(alt);
      });
      return { total: imgs.length, failedNodes };
    },
  });
})();
