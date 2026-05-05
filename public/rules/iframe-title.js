(function () {
  const a11y = window.__a11y;
  if (!a11y || !a11y.register) return;

  a11y.register({
    id: "iframe-title",
    title: "Iframes must have a descriptive title",
    description: "Each <iframe> needs a non-empty title attribute that describes its embedded content.",
    whyItMatters:
      "Screen-reader users navigate by frame and rely on the title to know what's inside before entering it. Untitled iframes are announced as 'frame' with no further context.",
    severity: "serious",
    recommendation: "Add a meaningful title attribute, e.g. <iframe title='YouTube tutorial video'>",
    disabilities: ["visual", "cognitive"],
    selectorHint: "iframe",
    standards: {
      wcag20: { criterion: "4.1.2", level: "A" },
      wcag21: { criterion: "4.1.2", level: "A" },
      wcag22: { criterion: "4.1.2", level: "A" },
      si5568: { criterion: "4.1.2", clause: "Annex A 4.1.2", level: "A" },
    },
    run(doc) {
      const iframes = a11y.toArray(doc.querySelectorAll("iframe"));
      const failedNodes = iframes.filter((iframe) => {
        const title = (iframe.getAttribute("title") || "").trim();
        const ariaLabel = (iframe.getAttribute("aria-label") || "").trim();
        return !title && !ariaLabel;
      });
      return { total: iframes.length, failedNodes };
    },
  });
})();
