(function () {
  const a11y = window.__a11y;
  if (!a11y || !a11y.register) return;

  a11y.register({
    id: "meta-refresh",
    title: "Page must not auto-refresh or auto-redirect",
    description: 'A <meta http-equiv="refresh"> with a positive timer redirects or reloads the page without user warning.',
    whyItMatters:
      "Users who read or interact slowly lose their place when the page reloads automatically. Cognitive-impaired and motor-impaired users may never be able to finish a task before the timer fires.",
    severity: "serious",
    recommendation:
      "Remove the meta refresh, perform the redirect on the server, or give the user a control to extend / cancel the timer.",
    disabilities: ["cognitive", "motor", "visual"],
    selectorHint: "meta[http-equiv='refresh']",
    standards: {
      wcag20: { criterion: "2.2.1", level: "A" },
      wcag21: { criterion: "2.2.1", level: "A" },
      wcag22: { criterion: "2.2.1", level: "A" },
      si5568: { criterion: "2.2.1", clause: "SI 5568 Part 1 (2.2.1)", level: "A" },
    },
    run(doc) {
      const metas = a11y.toArray(doc.querySelectorAll('meta[http-equiv="refresh" i]'));
      const failedNodes = metas.filter((m) => {
        const content = (m.getAttribute("content") || "").trim();
        const seconds = Number(content.split(";")[0]);
        return Number.isFinite(seconds) && seconds > 0;
      });
      return { total: 1, failedNodes };
    },
  });
})();
