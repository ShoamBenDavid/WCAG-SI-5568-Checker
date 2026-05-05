(function () {
  const a11y = window.__a11y;
  if (!a11y || !a11y.register) return;

  function relativeLuminance(rgb) {
    const c = rgb.map((v) => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }

  function contrastRatio(a, b) {
    const la = relativeLuminance(a);
    const lb = relativeLuminance(b);
    const [hi, lo] = la > lb ? [la, lb] : [lb, la];
    return (hi + 0.05) / (lo + 0.05);
  }

  function parseRgb(str) {
    if (!str) return null;
    const m = str.match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/i);
    if (!m) return null;
    return [Number(m[1]), Number(m[2]), Number(m[3])];
  }

  function effectiveBg(el) {
    while (el && el.nodeType === 1) {
      const style = window.getComputedStyle(el);
      const bg = parseRgb(style.backgroundColor);
      const alpha =
        style.backgroundColor && /rgba\([^)]+,\s*([^)]+)\)/.test(style.backgroundColor)
          ? Number(style.backgroundColor.match(/rgba\([^)]+,\s*([^)]+)\)/)[1])
          : bg
            ? 1
            : 0;
      if (bg && alpha > 0) return bg;
      el = el.parentElement;
    }
    return [255, 255, 255];
  }

  a11y.register({
    id: "non-text-contrast",
    title: "UI controls and graphical elements need 3:1 contrast",
    description:
      "Borders of focusable form controls (and meaningful graphical elements) must have a contrast ratio of at least 3:1 against their adjacent background.",
    whyItMatters:
      "Users with low vision rely on the visual edge of inputs to find them. Faint borders are invisible against the page background.",
    severity: "serious",
    recommendation:
      "Increase the border-color contrast on <input>, <select>, <textarea>, and <button>, and on icon SVG fills, to meet the 3:1 ratio.",
    disabilities: ["visual"],
    selectorHint: "input, select, textarea, button",
    standards: {
      // 1.4.11 is new in WCAG 2.1 — no WCAG 2.0 / SI 5568 mapping.
      wcag21: { criterion: "1.4.11", level: "AA" },
      wcag22: { criterion: "1.4.11", level: "AA" },
    },
    run(doc) {
      const candidates = a11y
        .toArray(
          doc.querySelectorAll(
            "input:not([type='hidden']), select, textarea, button"
          )
        )
        .slice(0, 300);

      const failedNodes = candidates.filter((el) => {
        const style = window.getComputedStyle(el);
        if (!a11y.isVisible(el, style)) return false;
        const borderColor = parseRgb(style.borderColor || style.borderTopColor);
        const borderWidth = Number.parseFloat(style.borderTopWidth || "0");
        if (!borderColor || borderWidth < 1) return false; // no visible border
        const bg = effectiveBg(el.parentElement || el);
        const ratio = contrastRatio(borderColor, bg);
        return ratio < 3;
      });

      return { total: candidates.length, failedNodes };
    },
  });
})();
