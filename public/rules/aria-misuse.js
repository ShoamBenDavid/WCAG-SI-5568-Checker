(function () {
  const a11y = window.__a11y;
  if (!a11y || !a11y.register) return;

  // Subset of valid ARIA roles. Not exhaustive, but covers the practical set.
  const VALID_ROLES = new Set([
    "alert", "alertdialog", "application", "article", "banner", "button",
    "cell", "checkbox", "columnheader", "combobox", "complementary",
    "contentinfo", "definition", "dialog", "directory", "document", "feed",
    "figure", "form", "grid", "gridcell", "group", "heading", "img", "link",
    "list", "listbox", "listitem", "log", "main", "marquee", "math", "menu",
    "menubar", "menuitem", "menuitemcheckbox", "menuitemradio", "navigation",
    "none", "note", "option", "presentation", "progressbar", "radio",
    "radiogroup", "region", "row", "rowgroup", "rowheader", "scrollbar",
    "search", "searchbox", "separator", "slider", "spinbutton", "status",
    "switch", "tab", "table", "tablist", "tabpanel", "term", "textbox",
    "timer", "toolbar", "tooltip", "tree", "treegrid", "treeitem",
    // ARIA 1.2 extras
    "blockquote", "caption", "code", "deletion", "emphasis", "generic",
    "insertion", "mark", "meter", "paragraph", "strong", "subscript",
    "superscript", "suggestion", "time",
  ]);

  function isFocusable(el) {
    return a11y.isKeyboardFocusable(el);
  }

  a11y.register({
    id: "aria-misuse",
    title: "ARIA attributes must be valid",
    description:
      "Roles must come from the ARIA spec, ID references in aria-labelledby / aria-describedby must resolve, and aria-hidden must not hide focusable elements.",
    whyItMatters:
      "Invalid or broken ARIA produces silent failures: assistive tech may ignore the element, announce the wrong name, or trap users on hidden focusable controls.",
    severity: "serious",
    recommendation:
      "Validate role names against the ARIA spec. Make sure all aria-labelledby and aria-describedby IDs exist. Never put aria-hidden='true' on focusable elements.",
    disabilities: ["visual", "cognitive"],
    selectorHint: "[role], [aria-labelledby], [aria-describedby], [aria-hidden]",
    standards: {
      wcag20: { criterion: "4.1.2", level: "A" },
      wcag21: { criterion: "4.1.2", level: "A" },
      wcag22: { criterion: "4.1.2", level: "A" },
      si5568: { criterion: "4.1.2", clause: "Annex A 4.1.2", level: "A" },
    },
    run(doc) {
      const failed = new Set();

      // Invalid role names.
      a11y.toArray(doc.querySelectorAll("[role]")).forEach((el) => {
        const role = (el.getAttribute("role") || "").trim().toLowerCase();
        if (!role) return;
        // Multiple roles space-separated — at least one must be valid.
        const tokens = role.split(/\s+/);
        if (!tokens.some((t) => VALID_ROLES.has(t))) failed.add(el);
      });

      // Dangling aria-labelledby / aria-describedby.
      ["aria-labelledby", "aria-describedby"].forEach((attr) => {
        a11y.toArray(doc.querySelectorAll(`[${attr}]`)).forEach((el) => {
          const ids = (el.getAttribute(attr) || "").split(/\s+/).filter(Boolean);
          const broken = ids.some((id) => !doc.getElementById(id));
          if (broken) failed.add(el);
        });
      });

      // aria-hidden='true' on focusable elements.
      a11y.toArray(doc.querySelectorAll("[aria-hidden='true']")).forEach((el) => {
        if (isFocusable(el)) failed.add(el);
        // Also flag if any descendant is focusable.
        const focusableDesc = a11y
          .toArray(el.querySelectorAll("a[href], button, input, select, textarea, summary, iframe, [tabindex]"))
          .some((node) => isFocusable(node));
        if (focusableDesc) failed.add(el);
      });

      const totalChecked =
        doc.querySelectorAll("[role], [aria-labelledby], [aria-describedby], [aria-hidden]").length;
      return { total: totalChecked || 1, failedNodes: Array.from(failed) };
    },
  });
})();
