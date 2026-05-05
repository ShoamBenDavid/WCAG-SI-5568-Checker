/**
 * Accessible-name resolution for the scanner.
 *
 * Order roughly matches the HTML AAM:
 *   1. aria-labelledby
 *   2. aria-label
 *   3. <label> (for form controls)
 *   4. value attribute (for input[type=submit|button|reset|image])
 *   5. alt (for input[type=image])
 *   6. title
 *   7. visible text content
 *
 * Returns a non-empty trimmed string when a name can be resolved, or "" when
 * no accessible name is found. The special return value "__skip__" marks
 * elements that should be excluded from form-label-style rules entirely
 * (e.g. <input type="hidden">).
 */
(function () {
  const a11y = (window.__a11y = window.__a11y || {});

  function resolveLabelledBy(element) {
    const labelledBy = element.getAttribute("aria-labelledby");
    if (!labelledBy) return "";
    const texts = labelledBy
      .split(/\s+/)
      .map((id) => document.getElementById(id))
      .filter(Boolean)
      .map((node) => (node.textContent || "").trim())
      .filter(Boolean);
    return texts.join(" ").trim();
  }

  a11y.getAccessibleName = function getAccessibleName(element) {
    if (!element || !(element instanceof Element)) return "";

    // 1. aria-labelledby
    const labelledByText = resolveLabelledBy(element);
    if (labelledByText) return labelledByText;

    // 2. aria-label
    const ariaLabel = element.getAttribute("aria-label");
    if (ariaLabel && ariaLabel.trim()) return ariaLabel.trim();

    // 3a. <input> special handling
    if (element instanceof HTMLInputElement) {
      const type = (element.getAttribute("type") || "text").toLowerCase();

      if (type === "hidden") return "__skip__";

      // Submit/button/reset use value as their accessible name (HTML-AAM).
      if (["submit", "button", "reset"].includes(type)) {
        const v = (element.getAttribute("value") || "").trim();
        if (v) return v;
        // Native default labels per the HTML spec.
        if (type === "submit") return "Submit";
        if (type === "reset") return "Reset";
      }

      // Image inputs use alt then value.
      if (type === "image") {
        const alt = (element.getAttribute("alt") || "").trim();
        if (alt) return alt;
        const v = (element.getAttribute("value") || "").trim();
        if (v) return v;
      }
    }

    // 3b. <label> elements (for input/select/textarea)
    if (
      element instanceof HTMLInputElement ||
      element instanceof HTMLSelectElement ||
      element instanceof HTMLTextAreaElement
    ) {
      const labels = a11y.toArray(element.labels || []);
      const labelText = labels
        .map((l) => (l.textContent || "").trim())
        .join(" ")
        .trim();
      if (labelText) return labelText;
    }

    // 4. <button> uses its text content as accessible name.
    if (element instanceof HTMLButtonElement) {
      const text = (element.textContent || "").trim();
      if (text) return text;
    }

    // 5. <img> alt
    if (element instanceof HTMLImageElement) {
      const alt = (element.getAttribute("alt") || "").trim();
      if (alt) return alt;
    }

    // 6. title attribute
    const title = element.getAttribute("title");
    if (title && title.trim()) return title.trim();

    // 7. visible text content (last resort for links etc.)
    const text = (element.textContent || "").trim();
    return text || "";
  };

  /**
   * Returns true when the element has a `placeholder` and no accessible name
   * from any of the other channels. Used by `placeholder-only-label` rule.
   */
  a11y.hasPlaceholderOnly = function hasPlaceholderOnly(element) {
    if (!(element instanceof HTMLInputElement) && !(element instanceof HTMLTextAreaElement)) {
      return false;
    }
    const ph = (element.getAttribute("placeholder") || "").trim();
    if (!ph) return false;
    // Temporarily strip placeholder to see if anything else provides a name.
    const original = element.getAttribute("placeholder");
    element.removeAttribute("placeholder");
    const name = a11y.getAccessibleName(element);
    if (original !== null) element.setAttribute("placeholder", original);
    return !name || name === "__skip__";
  };
})();
