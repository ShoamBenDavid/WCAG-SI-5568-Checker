(function () {
  const a11y = window.__a11y;
  if (!a11y || !a11y.register) return;

  a11y.register({
    id: "target-size-minimum",
    title: "Tap targets must be at least 24×24 CSS pixels",
    description:
      "Buttons, links, and other pointer targets must measure at least 24 by 24 CSS pixels (WCAG 2.2 minimum).",
    whyItMatters:
      "Tiny targets are unusable for users with motor impairments and on touch devices. Missing the target by a few pixels means the action does not happen.",
    severity: "moderate",
    recommendation:
      "Increase the visible size of the target, or add padding so the hit area is ≥ 24 × 24 CSS px. Inline targets in body text are exempt.",
    disabilities: ["motor"],
    selectorHint: "a, button, [role='button']",
    standards: {
      // 2.5.8 is new in WCAG 2.2 only.
      wcag22: { criterion: "2.5.8", level: "AA" },
    },
    run(doc) {
      const elems = a11y.toArray(
        doc.querySelectorAll(
          "a[href], button, input[type='button'], input[type='submit'], input[type='reset'], input[type='checkbox'], input[type='radio'], [role='button'], [role='link'], [role='checkbox'], [role='radio']"
        )
      );
      const failedNodes = elems.filter((el) => {
        if (a11y.isElementHidden(el) || a11y.isDisabled(el)) return false;
        if (!a11y.isNativeInteractiveElement(el) && a11y.isInsideNativeInteractiveElement(el)) {
          return false;
        }
        const style = window.getComputedStyle(el);
        if (!a11y.isVisible(el, style)) return false;
        // Inline targets sitting inside flowing text are exempt per WCAG 2.5.8
        // exception ("Inline" / "Essential" / "User agent control"). Skip <a>
        // elements whose parent is inline-displayed text.
        if (el.tagName.toLowerCase() === "a") {
          const parent = el.parentElement;
          if (parent) {
            const ps = window.getComputedStyle(parent);
            if (ps.display === "inline" || ps.display === "inline-block") {
              const text = (parent.textContent || "").replace(/\s+/g, " ").trim();
              const own = (el.textContent || "").replace(/\s+/g, " ").trim();
              if (text.length > own.length + 5) return false; // surrounding text exists
            }
          }
        }
        const r = el.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) return false; // not laid out yet
        return r.width < 24 || r.height < 24;
      });
      return { total: elems.length, failedNodes };
    },
  });
})();
