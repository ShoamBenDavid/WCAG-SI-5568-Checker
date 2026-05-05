(function () {
  const a11y = window.__a11y;
  if (!a11y || !a11y.register) return;

  a11y.register({
    id: "orientation-lock",
    title: "Page must not lock screen orientation",
    description:
      "The page must not restrict its content to one screen orientation (portrait or landscape) unless absolutely essential.",
    whyItMatters:
      "Users with mobility devices that mount their phones or tablets in a specific orientation cannot rotate physically. Locking orientation excludes them.",
    severity: "moderate",
    recommendation:
      "Avoid CSS that forces a 90-degree rotation on <html>/<body>. Avoid screen.orientation.lock() and the @viewport orientation rule.",
    disabilities: ["motor", "cognitive", "visual"],
    selectorHint: "html, body",
    standards: {
      // 1.3.4 is new in WCAG 2.1 — no WCAG 2.0 / SI 5568 mapping.
      wcag21: { criterion: "1.3.4", level: "AA" },
      wcag22: { criterion: "1.3.4", level: "AA" },
    },
    run(doc) {
      const root = doc.documentElement;
      const body = doc.body;
      const failed = [];

      [root, body].forEach((el) => {
        if (!el) return;
        const style = window.getComputedStyle(el);
        const transform = style && style.transform ? style.transform : "";
        // matrix(... 0,1,-1,0 ...) corresponds to a 90° rotation; we just look
        // for any non-identity rotation that is hard-coded on the root.
        if (transform && transform !== "none" && /rotate|matrix\(/i.test(transform)) {
          // Identity matrices contain `1, 0, 0, 1`. Anything else is suspect.
          if (!/matrix\(\s*1\s*,\s*0\s*,\s*0\s*,\s*1\s*,/.test(transform)) {
            failed.push(el);
          }
        }
      });

      // Older but still seen: <meta name="screen-orientation" content="portrait">
      const orientationMeta = doc.querySelector(
        "meta[name='screen-orientation' i], meta[name='x5-orientation' i]"
      );
      if (orientationMeta) {
        const content = (orientationMeta.getAttribute("content") || "").toLowerCase();
        if (/portrait|landscape/.test(content)) failed.push(orientationMeta);
      }

      return { total: 1, failedNodes: failed };
    },
  });
})();
