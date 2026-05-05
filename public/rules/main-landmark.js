(function () {
  const a11y = window.__a11y;
  if (!a11y || !a11y.register) return;

  a11y.register({
    id: "main-landmark",
    title: "Page should include a main landmark",
    description: "Every page should have exactly one <main> element (or an element with role='main').",
    whyItMatters:
      "Screen-reader users use landmarks to jump straight to the main content of the page, bypassing repeated navigation.",
    severity: "minor",
    recommendation: "Wrap the page's primary content in a <main> element.",
    disabilities: ["visual", "cognitive"],
    selectorHint: "main, [role='main']",
    standards: {
      wcag20: { criterion: "2.4.1", level: "A" },
      wcag21: { criterion: "2.4.1", level: "A" },
      wcag22: { criterion: "2.4.1", level: "A" },
      si5568: { criterion: "2.4.1", clause: "Annex A 2.4.1", level: "A" },
    },
    run(doc) {
      const mains = a11y.toArray(doc.querySelectorAll("main, [role='main']"));
      const root = doc.documentElement;
      if (mains.length === 0) {
        return { total: 1, failedNodes: [doc.body || root] };
      }
      // Multiple mains is a real failure too — only one should be present.
      if (mains.length > 1) {
        return { total: 1, failedNodes: mains.slice(1) };
      }
      return { total: 1, failedNodes: [] };
    },
  });
})();
