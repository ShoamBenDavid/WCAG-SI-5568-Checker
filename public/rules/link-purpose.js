(function () {
  const a11y = window.__a11y;
  if (!a11y || !a11y.register) return;

  const VAGUE = /^(click here|here|more|read more|learn more|details|info|click|link|לחץ כאן|כאן|עוד|קראו עוד|פרטים|לחצו כאן|לחץ|המשך)$/i;

  a11y.register({
    id: "link-purpose",
    title: "Link text must describe its destination",
    description:
      'Links whose accessible name is a generic phrase like "click here", "more", or "read more" do not describe the destination.',
    whyItMatters:
      "Screen-reader users navigate by pulling up the page's list of links out of context. Generic link text in that list is meaningless and forces users to follow the link to find out where it leads.",
    severity: "moderate",
    recommendation:
      'Replace generic text with a descriptive phrase ("Read the privacy policy") or augment the link with an aria-label / aria-labelledby that gives context.',
    disabilities: ["visual", "cognitive"],
    selectorHint: "a[href]",
    standards: {
      wcag20: { criterion: "2.4.4", level: "A" },
      wcag21: { criterion: "2.4.4", level: "A" },
      wcag22: { criterion: "2.4.4", level: "A" },
      si5568: { criterion: "2.4.4", clause: "SI 5568 Part 2 §5 (2.4.4)", level: "A" },
    },
    i18n: {
      en: {
        title: "Link text must describe its destination",
        description:
          'Links whose accessible name is a generic phrase like "click here", "more", or "read more" do not describe the destination.',
        whyItMatters:
          "Screen-reader users navigate by pulling up the page's list of links out of context. Generic link text in that list is meaningless and forces users to follow the link to find out where it leads.",
        recommendation:
          'Replace generic text with a descriptive phrase ("Read the privacy policy") or augment the link with an aria-label / aria-labelledby that gives context.',
      },
      he: {
        title: 'מלל הקישור חייב לתאר את יעד הקישור',
        description:
          'קישור שמלל הנגיש שלו הוא ביטוי גנרי כמו "לחץ כאן", "כאן", "קרא עוד" או "עוד" — אינו מתאר את היעד.',
        whyItMatters:
          'משתמשי קוראי מסך מנווטים לעיתים על ידי שליפת רשימת הקישורים בדף, מחוץ להקשרם. מלל גנרי ברשימה הזו חסר משמעות ומאלץ את המשתמש לעקוב אחר הקישור רק כדי לדעת לאן הוא מוביל.',
        recommendation:
          'החליפו מלל גנרי בביטוי תיאורי ("קראו את מדיניות הפרטיות"), או הוסיפו aria-label / aria-labelledby שמספק את ההקשר החסר.',
      },
    },
    si5568: {
      coveredByPdf: true,
      part: 2,
      clause: "2.4.4",
      level: "A",
      annexDOverride: null,
      sourceQuote: {
        en: 'SI 5568 Part 2, criterion 2.4.4 — the purpose of every link must be clear from its text or from the surrounding text and context. Link text embedded in a sentence that includes phrases like "click here" or "continue reading" satisfies this criterion only when the surrounding sentence makes the destination clear.',
        he: 'ת"י 5568 חלק 2, סעיף 2.4.4 — תכליתו של כל קישור תהיה ברורה מטקסט הקישור או מהטקסט המלווה אותו ומההקשר שהוא נתון בו. הבהרה: טקסט קישור המשולב בפסקה או במשפט והכולל מילים כגון "לחץ כאן", "המשך לקרוא" — מקיים את דרישות קריטריון זה רק אם הסעיף המלווה מבהיר את היעד.',
      },
    },
    run(doc) {
      const links = a11y.toArray(doc.querySelectorAll("a[href]"));
      const failedNodes = links.filter((a) => {
        if (a.getAttribute("aria-hidden") === "true") return false;
        const name = (a11y.getAccessibleName(a) || "").trim();
        return name && VAGUE.test(name);
      });
      return { total: links.length, failedNodes };
    },
  });
})();
