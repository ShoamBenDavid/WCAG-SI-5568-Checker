(function () {
  const a11y = window.__a11y;
  if (!a11y || !a11y.register) return;

  a11y.register({
    id: "pause-stop-hide",
    title: "Moving or auto-updating content must be pausable",
    description:
      "Content that auto-plays, loops, scrolls, or animates for more than 5 seconds must offer a pause / stop / hide control.",
    whyItMatters:
      "Persistent motion distracts cognitive-impaired users and can trigger vestibular reactions. Without a pause control there is no way to stop it.",
    severity: "serious",
    recommendation:
      "Add a pause/stop button to autoplaying carousels, deprecate <marquee>/<blink>, and respect the prefers-reduced-motion media query.",
    disabilities: ["cognitive", "motor", "visual"],
    selectorHint: "video[autoplay][loop], marquee, blink",
    standards: {
      wcag20: { criterion: "2.2.2", level: "A" },
      wcag21: { criterion: "2.2.2", level: "A" },
      wcag22: { criterion: "2.2.2", level: "A" },
      si5568: { criterion: "2.2.2", clause: "SI 5568 Part 1 (2.2.2)", level: "A" },
    },
    run(doc) {
      const failed = new Set();
      // Auto-playing looping video without controls.
      a11y
        .toArray(doc.querySelectorAll("video[autoplay][loop]"))
        .forEach((v) => {
          if (!v.hasAttribute("controls")) failed.add(v);
        });
      // Legacy marquee / blink.
      a11y.toArray(doc.querySelectorAll("marquee, blink")).forEach((el) => failed.add(el));

      // Best-effort detection of CSS infinite animations on visible elements.
      const candidates = a11y.toArray(doc.querySelectorAll("body *")).slice(0, 500);
      candidates.forEach((el) => {
        if (a11y.isSkippableTag(el)) return;
        const style = window.getComputedStyle(el);
        if (!a11y.isVisible(el, style)) return;
        if (style.animationIterationCount && /infinite/i.test(style.animationIterationCount)) {
          // Allow if there is a pause control nearby.
          const root = el.closest("section, figure, div, article") || el.parentElement;
          const hasPauseCtrl = Boolean(
            root && root.querySelector(
              "button[aria-label*='pause' i], button[aria-label*='stop' i], button[aria-label*='השהיה' i], button[aria-label*='עצור' i]"
            )
          );
          if (!hasPauseCtrl) failed.add(el);
        }
      });

      const total = candidates.length || 1;
      return { total, failedNodes: Array.from(failed) };
    },
  });
})();
