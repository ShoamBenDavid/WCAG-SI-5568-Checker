(function () {
  const a11y = window.__a11y;
  if (!a11y || !a11y.register) return;

  a11y.register({
    id: "skip-link",
    title: "Page should provide a skip-navigation link",
    description: "A 'Skip to main content' link as the first focusable element lets keyboard users bypass repeated navigation blocks.",
    whyItMatters:
      "Without a skip link, keyboard and screen-reader users must tab through dozens of menu items on every page just to reach the main content.",
    severity: "minor",
    recommendation:
      "Add a visible-on-focus <a href='#main'>Skip to main content</a> as the first link in the page, and ensure the target id exists.",
    disabilities: ["motor", "visual", "cognitive"],
    selectorHint: "a[href^='#']",
    standards: {
      wcag20: { criterion: "2.4.1", level: "A" },
      wcag21: { criterion: "2.4.1", level: "A" },
      wcag22: { criterion: "2.4.1", level: "A" },
      si5568: { criterion: "2.4.1", clause: "Annex A 2.4.1", level: "A" },
    },
    run(doc) {
      const candidates = a11y
        .toArray(doc.querySelectorAll("a[href^='#']"))
        .filter((a) => /skip|content|main|נגישות|דלג/i.test((a.textContent || "").trim()));

      const root = doc.documentElement;
      if (candidates.length === 0) {
        return { total: 1, failedNodes: [doc.body || root] };
      }

      // Validate the target exists.
      const broken = candidates.filter((a) => {
        const href = a.getAttribute("href") || "";
        const id = href.slice(1);
        return id && !doc.getElementById(id);
      });
      return { total: 1, failedNodes: broken };
    },
  });
})();
