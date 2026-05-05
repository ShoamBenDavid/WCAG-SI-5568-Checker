(function () {
  const a11y = window.__a11y;
  if (!a11y || !a11y.register) return;

  a11y.register({
    id: "document-title",
    title: "Page must have a non-empty <title>",
    description: "Every page needs a meaningful <title> in <head> that identifies its content.",
    whyItMatters:
      "Browser tabs, bookmarks, history, and screen-reader announcements all rely on the page title. A missing or generic title makes orientation impossible.",
    severity: "serious",
    recommendation:
      "Add <title>Descriptive page name</title> inside <head>, e.g. 'Settings — My App'. Avoid duplicate or empty titles.",
    disabilities: ["visual", "cognitive"],
    selectorHint: "head > title",
    standards: {
      wcag20: { criterion: "2.4.2", level: "A" },
      wcag21: { criterion: "2.4.2", level: "A" },
      wcag22: { criterion: "2.4.2", level: "A" },
      si5568: { criterion: "2.4.2", clause: "SI 5568 Part 2 §5 (2.4.2)", level: "A" },
    },
    i18n: {
      en: {
        title: "Page must have a non-empty <title>",
        description: "Every page must include a meaningful <title> in <head> that describes its topic or purpose.",
        whyItMatters:
          "Browser tabs, bookmarks, history entries, and screen-reader page announcements all rely on <title>. A missing or generic title makes orientation impossible.",
        recommendation:
          'Add <title>Descriptive page name</title> in <head>, e.g. "Settings — My App". Avoid duplicate or empty titles.',
      },
      he: {
        title: 'לדף חייב להיות תג <title> שאינו ריק',
        description:
          'בכל דף יש להגדיר תג <title> בעל משמעות בתוך <head>, המתאר את נושא הדף או מטרתו.',
        whyItMatters:
          'לשונית הדפדפן, מועדפים, היסטוריה והכרזות קוראי המסך מסתמכים על <title>. כותרת חסרה או גנרית מקשה על התמצאות.',
        recommendation:
          'הוסיפו <title>שם דף תיאורי</title> בתוך <head>, לדוגמה "הגדרות — אפליקציה שלי". יש להימנע מכותרות ריקות או כפולות.',
      },
    },
    si5568: {
      coveredByPdf: true,
      part: 2,
      clause: "2.4.2",
      level: "A",
      annexDOverride: null,
      sourceQuote: {
        en: 'SI 5568 Part 2, criterion 2.4.2 — documents must have a name or title that describes their topic or purpose. The title must be meaningful; it can be implemented via the file name or a heading.',
        he: 'ת"י 5568 חלק 2, סעיף 2.4.2 — המסמכים יהיו בעלי שם או כותרת (title) המתארים את נושא המסמך או את מטרתו. שם המסמך יהיה בעל משמעות; ניתן לממש זאת באמצעות שם הקובץ או באמצעות כותרת.',
      },
    },
    run(doc) {
      const titleEl = doc.querySelector("head > title");
      const text = titleEl ? (titleEl.textContent || "").trim() : "";
      if (!titleEl || !text) {
        // Use head as the failure node so the developer view shows useful context.
        const target = titleEl || doc.head || doc.documentElement;
        return { total: 1, failedNodes: [target] };
      }
      return { total: 1, failedNodes: [] };
    },
  });
})();
