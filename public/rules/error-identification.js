(function () {
  const a11y = window.__a11y;
  if (!a11y || !a11y.register) return;

  function describedByText(el) {
    const ids = (el.getAttribute("aria-describedby") || "").trim().split(/\s+/);
    return ids
      .map((id) => (id ? el.ownerDocument.getElementById(id) : null))
      .filter(Boolean)
      .map((node) => (node.textContent || "").trim())
      .filter(Boolean)
      .join(" ");
  }

  a11y.register({
    id: "error-identification",
    title: "Invalid form fields must announce the error",
    description:
      "An [aria-invalid='true'] field must point at a non-empty error message via aria-describedby, or have a sibling role='alert' / aria-live region describing the error.",
    whyItMatters:
      "Without the connection to a textual error, screen-reader users hear that the field is invalid but never learn what is wrong with their input.",
    severity: "serious",
    recommendation:
      "When marking a field invalid, set aria-describedby to the id of a visible message (or render a role='alert' near the field).",
    disabilities: ["visual", "cognitive", "motor"],
    selectorHint: "[aria-invalid='true']",
    standards: {
      wcag20: { criterion: "3.3.1", level: "A" },
      wcag21: { criterion: "3.3.1", level: "A" },
      wcag22: { criterion: "3.3.1", level: "A" },
      si5568: { criterion: "3.3.1", clause: "SI 5568 Part 1 (3.3.1)", level: "A" },
    },
    run(doc) {
      const candidates = a11y.toArray(doc.querySelectorAll("[aria-invalid='true']"));
      const failedNodes = candidates.filter((el) => {
        const txt = describedByText(el);
        if (txt) return false;
        // Fallback: a role='alert' sibling/ancestor close by.
        const parent = el.closest("form, fieldset, label, .field, .form-field, div");
        const sibling =
          parent && parent.querySelector("[role='alert'], [aria-live='assertive']");
        if (sibling && (sibling.textContent || "").trim()) return false;
        return true;
      });
      return { total: candidates.length, failedNodes };
    },
  });
})();
