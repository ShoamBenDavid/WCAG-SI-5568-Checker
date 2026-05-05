/**
 * Color-contrast utilities.
 *
 * Critical fix vs. the original implementation: the previous version read
 * `getComputedStyle(el).backgroundColor` directly and treated transparent
 * backgrounds (rgba(0,0,0,0)) as solid black. Most real pages produce
 * transparent backgrounds on inline text elements because background-color
 * is not an inherited CSS property. The new code walks the ancestor chain
 * until it finds an opaque background and falls back to white.
 */
(function () {
  const a11y = (window.__a11y = window.__a11y || {});

  function parseRgba(color) {
    if (!color) return null;
    const m = color.match(/-?\d+(\.\d+)?/g);
    if (!m || m.length < 3) return null;
    const r = Number(m[0]);
    const g = Number(m[1]);
    const b = Number(m[2]);
    const alpha = m.length >= 4 ? Number(m[3]) : 1;
    if ([r, g, b].some((v) => Number.isNaN(v))) return null;
    return [r, g, b, Number.isNaN(alpha) ? 1 : alpha];
  }

  function compositeOver(fg, bg) {
    // Standard alpha composite of fg over bg (assumes bg is opaque).
    const a = fg[3];
    return [
      fg[0] * a + bg[0] * (1 - a),
      fg[1] * a + bg[1] * (1 - a),
      fg[2] * a + bg[2] * (1 - a),
      1,
    ];
  }

  function luminance([r, g, b]) {
    const norm = [r, g, b].map((v) => {
      const x = v / 255;
      return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * norm[0] + 0.7152 * norm[1] + 0.0722 * norm[2];
  }

  function contrastRatio(fg, bg) {
    const l1 = luminance(fg);
    const l2 = luminance(bg);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * Walk ancestors for the first opaque background-color. If we hit the
   * documentElement without finding one, default to white.
   */
  function getEffectiveBackground(el) {
    let cur = el;
    while (cur && cur.nodeType === 1) {
      const c = parseRgba(window.getComputedStyle(cur).backgroundColor);
      if (c && c[3] >= 0.99) return [c[0], c[1], c[2]];
      cur = cur.parentElement;
    }
    const docBg = parseRgba(window.getComputedStyle(document.documentElement).backgroundColor);
    if (docBg && docBg[3] >= 0.99) return [docBg[0], docBg[1], docBg[2]];
    return [255, 255, 255];
  }

  /**
   * WCAG large-text definition: >= 18pt (approx 24px) regular, OR
   * >= 14pt (approx 18.6667px) bold.
   */
  function isLargeText(style) {
    const px = Number.parseFloat(style.fontSize) || 16;
    const weightStr = String(style.fontWeight || "");
    const weightNum = Number.parseInt(weightStr, 10);
    const isBold =
      (Number.isFinite(weightNum) && weightNum >= 700) ||
      /bold/i.test(weightStr) ||
      weightStr === "bolder";
    return px >= 24 || (isBold && px >= 18.6667);
  }

  /**
   * Find text-bearing elements that fail the WCAG 1.4.3 contrast minimums.
   * Caps the work to `max` failures and `MAX_TESTED` total elements so very
   * large pages still complete quickly.
   */
  a11y.findTextContrastFailures = function findTextContrastFailures(max = 200) {
    const MAX_TESTED = 1000;
    const candidates = a11y.toArray(
      document.querySelectorAll(
        "p, span, a, li, td, th, button, label, h1, h2, h3, h4, h5, h6, " +
          "div, dt, dd, blockquote, figcaption, summary, strong, em, small"
      )
    );

    const failures = [];
    let tested = 0;

    for (const el of candidates) {
      if (failures.length >= max || tested >= MAX_TESTED) break;
      if (a11y.isSkippableTag(el)) continue;

      // Only consider elements that have direct text (not just descendant text)
      // to avoid double-counting. We require at least a few visible characters.
      const directText = a11y
        .toArray(el.childNodes)
        .filter((n) => n.nodeType === 3)
        .map((n) => (n.textContent || "").trim())
        .join("")
        .trim();
      if (directText.length < 2) continue;

      const style = window.getComputedStyle(el);
      if (!a11y.isVisible(el, style)) continue;

      const fgRaw = parseRgba(style.color);
      if (!fgRaw) continue;

      const bg = getEffectiveBackground(el.parentElement || el);
      // If the foreground itself has alpha, composite over the resolved bg.
      const fg = fgRaw[3] < 0.99 ? compositeOver(fgRaw, [...bg, 1]).slice(0, 3) : fgRaw.slice(0, 3);

      tested += 1;
      const ratio = contrastRatio(fg, bg);
      const min = isLargeText(style) ? 3 : 4.5;
      if (ratio + 0.01 < min) {
        failures.push({
          element: el,
          ratio: Number(ratio.toFixed(2)),
          required: min,
          fg,
          bg,
        });
      }
    }

    return { failures, testedCount: tested };
  };

  // Expose internals for unit-style testing.
  a11y._contrast = { parseRgba, getEffectiveBackground, isLargeText, contrastRatio };
})();
