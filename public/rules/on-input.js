(function () {
  const a11y = window.__a11y;
  if (!a11y || !a11y.register) return;

  const SUSPECT = /(submit\s*\(|location\s*[.=]|window\.open|history\.(push|replace|go)\s*\()/;

  a11y.register({
    id: "on-input",
    title: "Changing a control must not trigger a context change",
    description:
      "Selecting a value or typing in a control should not auto-submit a form or navigate the page without warning.",
    whyItMatters:
      "Users with cognitive impairments may inadvertently submit forms when they are still exploring the options. Auto-submit on change is unpredictable.",
    severity: "moderate",
    recommendation:
      "Require an explicit submit / confirm action. Warn the user in advance if changing a value will trigger navigation.",
    disabilities: ["cognitive", "motor"],
    selectorHint: "select[onchange], input[onchange]",
    standards: {
      wcag20: { criterion: "3.2.2", level: "A" },
      wcag21: { criterion: "3.2.2", level: "A" },
      wcag22: { criterion: "3.2.2", level: "A" },
      si5568: { criterion: "3.2.2", clause: "SI 5568 Part 1 (3.2.2)", level: "A" },
    },
    run(doc) {
      const candidates = a11y.toArray(
        doc.querySelectorAll("select[onchange], input[onchange], textarea[onchange]")
      );
      const failedNodes = candidates.filter((el) =>
        SUSPECT.test(el.getAttribute("onchange") || "")
      );
      return { total: candidates.length, failedNodes };
    },
  });
})();
