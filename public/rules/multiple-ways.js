(function () {
  const a11y = window.__a11y;
  if (!a11y || !a11y.register) return;

  a11y.register({
    id: "multiple-ways",
    title: "Pages should provide multiple ways to find content",
    description:
      "A site should offer at least two of: a navigation menu, a search input, a sitemap link, or a table of contents.",
    whyItMatters:
      "Users with cognitive impairments or unfamiliar with the site need alternative ways to locate content beyond a single linear path.",
    severity: "minor",
    recommendation:
      "Add a <nav> region, an accessible site-search box, or a link to a sitemap page. At least two should be present.",
    disabilities: ["cognitive", "motor", "visual"],
    selectorHint: "nav, [role='navigation'], input[type='search']",
    standards: {
      wcag20: { criterion: "2.4.5", level: "AA" },
      wcag21: { criterion: "2.4.5", level: "AA" },
      wcag22: { criterion: "2.4.5", level: "AA" },
      si5568: { criterion: "2.4.5", clause: "SI 5568 Part 1 (2.4.5)", level: "AA" },
    },
    run(doc) {
      const hasNav = Boolean(doc.querySelector("nav, [role='navigation']"));
      const hasSearch = Boolean(
        doc.querySelector(
          "input[type='search'], [role='search'], form[role='search']"
        )
      );
      const hasSitemap = Boolean(
        a11y
          .toArray(doc.querySelectorAll("a[href]"))
          .some((a) => /sitemap|מפת אתר/i.test((a.textContent || "") + " " + (a.getAttribute("href") || "")))
      );
      const hasToc = Boolean(
        doc.querySelector("[role='doc-toc'], nav[aria-label*='contents' i]")
      );
      const ways = [hasNav, hasSearch, hasSitemap, hasToc].filter(Boolean).length;
      const failed = ways < 2;
      return { total: 1, failedNodes: failed ? [doc.body || doc.documentElement] : [] };
    },
  });
})();
