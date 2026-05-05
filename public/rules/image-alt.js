(function () {
  const a11y = window.__a11y;
  if (!a11y || !a11y.register) return;

  a11y.register({
    id: "image-alt",
    title: "Images must have alternate text",
    description: "Every <img> element must declare an alt attribute (alt='' for purely decorative images).",
    whyItMatters:
      "Screen reader users cannot perceive informative images without text alternatives. Missing alt text is one of the most common WCAG failures and breaks comprehension for blind users.",
    severity: "critical",
    recommendation:
      'Add descriptive `alt` text to informative images, and `alt=""` to decorative ones. Avoid file names like "image.png" as alt text.',
    disabilities: ["visual"],
    selectorHint: "img:not([alt])",
    standards: {
      wcag20: { criterion: "1.1.1", level: "A" },
      wcag21: { criterion: "1.1.1", level: "A" },
      wcag22: { criterion: "1.1.1", level: "A" },
      si5568: { criterion: "1.1.1", clause: 'SI 5568 Part 2 §4 (1.1.1)', level: "A" },
    },
    i18n: {
      en: {
        title: "Images must have alternate text",
        description:
          "Every <img> element must declare an alt attribute. Decorative images use alt='', informative images describe what the image conveys, and image-links describe the link target.",
        whyItMatters:
          "Screen reader users cannot perceive informative images without a text alternative. Missing alt text is the single most common automated finding and breaks comprehension for blind users.",
        recommendation:
          'Add a meaningful alt for informative images, alt="" for decoration, and alt that describes the link target on image-links.',
      },
      he: {
        title: 'תמונות חייבות לכלול טקסט חלופי',
        description:
          'לכל תגית <img> יש להוסיף תכונת alt. תמונה אינפורמטיבית תקבל טקסט חלופי המתאר את המידע, תמונה לקישוט תקבל alt="", ותמונת קישור תתאר את יעד הקישור.',
        whyItMatters:
          'משתמשי קוראי מסך לא קולטים תמונות ללא טקסט חלופי. חסר alt הוא הליקוי הנפוץ ביותר באודיטים אוטומטיים ופוגע בהבנת הדף עבור עיוורים ולקויי ראייה.',
        recommendation:
          'הוסיפו alt בעל משמעות לתמונות אינפורמטיביות; alt="" לתמונות קישוט; ובתמונות-קישור — alt המתאר את יעד הקישור.',
      },
    },
    si5568: {
      coveredByPdf: true,
      part: 2,
      clause: "1.1.1",
      level: "A",
      annexDOverride: null,
      sourceQuote: {
        en: 'SI 5568 Part 2, criterion 1.1.1 — every non-text element shown to the user must have a text alternative serving the same purpose. Decorative images must be marked so assistive technology can ignore them; image-links must have a short alt explaining where the link leads; charts and diagrams must be accompanied by a textual description of the essential information they convey.',
        he: 'ת"י 5568 חלק 2, סעיף 1.1.1 — אם תמונה מעבירה מידע או מסר שאינו מוצג בגוף הטקסט, יוסף לה טקסט חלופי (text alternative) שיתאר את המידע ואת המסר של התמונה. לתמונות בעלות קישור יוסף טקסט חלופי המבהיר בקצרה לאן מפנה הקישור. אם תמונה מיועדת לקישוט (pure decoration), היא תוגדר באופן שהמשתמשים יוכלו להתעלם ממנה באמצעות טכנולוגיה מסייעת. תמונות של תרשימים ואיורים: אם הן מספקות מידע חיוני, ילוו בטקסט חלופי שיתאר את התרשים או האיור כך שאדם עם מוגבלות ראייה יבין במה מדובר.',
      },
    },
    run(doc) {
      const images = a11y.toArray(doc.querySelectorAll("img"));
      const failedNodes = images.filter((img) => !img.hasAttribute("alt"));
      return { total: images.length, failedNodes };
    },
  });
})();
