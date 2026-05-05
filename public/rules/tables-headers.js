(function () {
  const a11y = window.__a11y;
  if (!a11y || !a11y.register) return;

  a11y.register({
    id: "tables-headers",
    title: "Data tables must declare headers",
    description:
      "Data tables (≥ 2 rows × 2 columns) must include at least one <th> (or role=columnheader/rowheader) and a <caption> or aria-label.",
    whyItMatters:
      "Without <th> and a caption, screen readers cannot announce row/column relationships. Users hear values stripped of their context.",
    severity: "serious",
    recommendation:
      "Add <th scope='col'> for column headers, <th scope='row'> for row headers, and a <caption> or aria-label that names the table.",
    disabilities: ["visual", "cognitive"],
    selectorHint: "table",
    standards: {
      wcag20: { criterion: "1.3.1", level: "A" },
      wcag21: { criterion: "1.3.1", level: "A" },
      wcag22: { criterion: "1.3.1", level: "A" },
      si5568: { criterion: "1.3.1", clause: "SI 5568 Part 2 §4 (1.3.1)", level: "A" },
    },
    i18n: {
      en: {
        title: "Data tables must declare headers",
        description:
          "Tables containing data (≥ 2 rows × 2 columns) must mark header cells with <th> and provide a <caption> or aria-label.",
        whyItMatters:
          "Screen readers rely on <th> and scope to announce 'row 3, column Total: 1500'. Without them, users hear bare numbers.",
        recommendation:
          "Use <th scope='col'> on column headers, <th scope='row'> on row headers, and add a <caption> describing the table's topic.",
      },
      he: {
        title: 'בטבלאות נתונים יש להצהיר על תאי כותרת',
        description:
          'טבלאות המכילות נתונים (לפחות 2 שורות × 2 עמודות) חייבות לכלול תאי כותרת <th> וכותרת <caption> או aria-label.',
        whyItMatters:
          'קוראי מסך מסתמכים על <th> ועל scope כדי להכריז "שורה 3, עמודה סה״כ: 1500". בלעדיהם, המשתמשים שומעים מספרים חשופים מהקשר.',
        recommendation:
          'השתמשו ב-<th scope="col"> לכותרות עמודה, ב-<th scope="row"> לכותרות שורה, והוסיפו <caption> שמתאר את נושא הטבלה.',
      },
    },
    si5568: {
      coveredByPdf: true,
      part: 2,
      clause: "1.3.1",
      level: "A",
      annexDOverride: null,
      sourceQuote: {
        en: 'SI 5568 Part 2, criterion 1.3.1 — information, structure, and relationships conveyed through presentation must be programmatically determinable. For tables this means using semantic header cells so that the relationship between header and data is exposed to assistive technology.',
        he: 'ת"י 5568 חלק 2, סעיף 1.3.1 — המידע, המבנה והקשרים המוצגים למשתמש ניתנים לזיהוי באמצעות תוכנה. בטבלאות הדבר מחייב שימוש בתאי כותרת סמנטיים, כך שהקשר בין כותרת לנתון יהיה גלוי לטכנולוגיה מסייעת.',
      },
    },
    run(doc) {
      const tables = a11y.toArray(doc.querySelectorAll("table"));
      const failedNodes = tables.filter((t) => {
        const rows = t.rows ? t.rows.length : 0;
        const cols = t.rows && t.rows[0] ? t.rows[0].cells.length : 0;
        if (rows < 2 || cols < 2) return false; // layout / single-cell table
        const role = (t.getAttribute("role") || "").toLowerCase();
        if (role === "presentation" || role === "none") return false;
        const hasTh = Boolean(
          t.querySelector("th, [role='columnheader'], [role='rowheader']")
        );
        const hasCaption =
          Boolean(t.querySelector("caption")) ||
          t.hasAttribute("aria-label") ||
          t.hasAttribute("aria-labelledby");
        return !hasTh || !hasCaption;
      });
      return { total: tables.length, failedNodes };
    },
  });
})();
