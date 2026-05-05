(function () {
  const a11y = window.__a11y;
  if (!a11y || !a11y.register) return;

  a11y.register({
    id: "viewport-resize",
    title: "Viewport must allow zoom and resize",
    description:
      "<meta name='viewport'> must not disable user zoom (user-scalable=no) and must allow zooming to at least 200% (maximum-scale ≥ 2).",
    whyItMatters:
      "Disabling pinch-zoom blocks low-vision users on mobile from enlarging text. Users who depend on resizing text up to 200% cannot read the page.",
    severity: "serious",
    recommendation:
      'Use <meta name="viewport" content="width=device-width, initial-scale=1">. Do not include user-scalable=no or maximum-scale=1.',
    disabilities: ["visual", "cognitive"],
    selectorHint: "meta[name='viewport']",
    standards: {
      wcag20: { criterion: "1.4.4", level: "AA" },
      wcag21: { criterion: "1.4.4", level: "AA" },
      wcag22: { criterion: "1.4.4", level: "AA" },
      si5568: { criterion: "1.4.4", clause: "SI 5568 Part 1 (1.4.4)", level: "AA" },
    },
    run(doc) {
      const meta = doc.querySelector("meta[name='viewport' i]");
      if (!meta) return { total: 1, failedNodes: [] };
      const content = (meta.getAttribute("content") || "").toLowerCase();
      const blocksZoom = /user-scalable\s*=\s*(0|no)/.test(content);
      const lowMaxScale = (() => {
        const m = content.match(/maximum-scale\s*=\s*([0-9.]+)/);
        if (!m) return false;
        return Number(m[1]) < 2;
      })();
      const failed = blocksZoom || lowMaxScale;
      return { total: 1, failedNodes: failed ? [meta] : [] };
    },
  });
})();
