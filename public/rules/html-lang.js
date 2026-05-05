(function () {
  const a11y = window.__a11y;
  if (!a11y || !a11y.register) return;

  a11y.register({
    id: "html-lang",
    title: "Document must define a valid page language",
    description:
      "The <html> element must include a non-empty lang attribute set to a valid BCP-47 language code.",
    whyItMatters:
      "Screen readers use the document language to choose pronunciation. A wrong or missing language causes nonsensical speech, especially for non-English content.",
    severity: "serious",
    recommendation: 'Set <html lang="en"> (or the appropriate code such as "he" for Hebrew, "ar" for Arabic).',
    disabilities: ["cognitive", "visual"],
    selectorHint: "html",
    standards: {
      wcag20: { criterion: "3.1.1", level: "A" },
      wcag21: { criterion: "3.1.1", level: "A" },
      wcag22: { criterion: "3.1.1", level: "A" },
      si5568: { criterion: "3.1.1", clause: "Annex A 3.1.1", level: "A" },
    },
    run(doc) {
      const root = doc.documentElement;
      const lang = (root.getAttribute("lang") || "").trim();
      // BCP-47 language codes start with at least 2 letters, optionally
      // followed by - and additional subtags. Empty or whitespace-only is bad.
      const valid = /^[a-zA-Z]{2,3}(-[A-Za-z0-9]{2,8})*$/.test(lang);
      const failed = !valid;
      return { total: 1, failedNodes: failed ? [root] : [] };
    },
  });
})();
