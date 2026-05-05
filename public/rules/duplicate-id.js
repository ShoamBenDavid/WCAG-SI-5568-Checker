(function () {
  const a11y = window.__a11y;
  if (!a11y || !a11y.register) return;

  a11y.register({
    id: "duplicate-id",
    title: "IDs must be unique within the document",
    description:
      "Duplicate IDs break label/for, aria-labelledby, aria-describedby, and JavaScript that targets elements by ID.",
    whyItMatters:
      "Assistive technologies rely on ID references to associate a label or description with a control. When IDs repeat, the wrong element may be announced or the association may silently fail.",
    severity: "moderate",
    recommendation: "Ensure every id value is unique across the page. Use classes for shared styling instead.",
    disabilities: ["visual", "cognitive"],
    selectorHint: "[id]",
    standards: {
      wcag20: { criterion: "4.1.1", level: "A" },
      wcag21: { criterion: "4.1.1", level: "A" },
      // WCAG 2.2 removed 4.1.1 Parsing as a requirement, but we still flag it.
      si5568: { criterion: "4.1.1", clause: "Annex A 4.1.1", level: "A" },
    },
    run(doc) {
      const idElements = a11y.toArray(doc.querySelectorAll("[id]"));
      const map = new Map();
      idElements.forEach((el) => {
        const id = el.getAttribute("id");
        if (!id) return;
        const existing = map.get(id) || [];
        existing.push(el);
        map.set(id, existing);
      });

      const failedNodes = [];
      let uniqueIds = 0;
      map.forEach((nodes) => {
        uniqueIds += 1;
        if (nodes.length > 1) {
          // Report only the duplicate occurrences (skip the first which is
          // legitimate). This stops the failed count from exceeding the total.
          for (let i = 1; i < nodes.length; i += 1) failedNodes.push(nodes[i]);
        }
      });

      return { total: uniqueIds || 1, failedNodes };
    },
  });
})();
