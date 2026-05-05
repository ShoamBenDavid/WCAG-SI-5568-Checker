(function () {
  const a11y = window.__a11y;
  if (!a11y || !a11y.register) return;

  function dominantScript(text) {
    if (!text) return null;
    const hebrew = (text.match(/[\u0590-\u05FF]/g) || []).length;
    const arabic = (text.match(/[\u0600-\u06FF]/g) || []).length;
    const latin = (text.match(/[A-Za-z]/g) || []).length;
    const total = hebrew + arabic + latin;
    if (total < 20) return null; // not enough content to judge
    if (hebrew / total > 0.7) return "he";
    if (arabic / total > 0.7) return "ar";
    if (latin / total > 0.7) return "latin";
    return null;
  }

  function declaredLang(el) {
    while (el && el !== el.ownerDocument.documentElement) {
      const v = (el.getAttribute && el.getAttribute("lang")) || "";
      if (v) return v.toLowerCase();
      el = el.parentElement;
    }
    return null;
  }

  a11y.register({
    id: "language-of-parts",
    title: "Foreign-language sections should declare lang",
    description:
      "Block-level elements whose dominant text is in a different script from <html lang> must declare their own lang attribute.",
    whyItMatters:
      "Without an inline lang attribute, screen readers pronounce foreign text using the page's default voice — Hebrew is read with English phonemes, or vice versa.",
    severity: "moderate",
    recommendation:
      'Wrap foreign-language passages in an element with lang, e.g. <span lang="en">English text</span> inside a Hebrew page.',
    disabilities: ["visual", "cognitive"],
    selectorHint: "p, blockquote, article, section, div",
    standards: {
      wcag20: { criterion: "3.1.2", level: "AA" },
      wcag21: { criterion: "3.1.2", level: "AA" },
      wcag22: { criterion: "3.1.2", level: "AA" },
      si5568: { criterion: "3.1.2", clause: "SI 5568 Part 1 (3.1.2)", level: "AA" },
    },
    run(doc) {
      const root = doc.documentElement;
      const pageLang = (root.getAttribute("lang") || "").toLowerCase();
      const pageBucket = pageLang.startsWith("he")
        ? "he"
        : pageLang.startsWith("ar")
          ? "ar"
          : /^([a-z]{2})/i.test(pageLang)
            ? "latin"
            : null;

      // Scan a bounded sample of block-level elements.
      const blocks = a11y
        .toArray(doc.querySelectorAll("p, blockquote, article, section, li"))
        .slice(0, 400);

      const failedNodes = blocks.filter((el) => {
        const text = (el.textContent || "").trim();
        const bucket = dominantScript(text);
        if (!bucket || !pageBucket) return false;
        if (bucket === pageBucket) return false;
        const declared = declaredLang(el);
        if (!declared) return true;
        // If a parent declared lang, accept it.
        if (bucket === "he" && declared.startsWith("he")) return false;
        if (bucket === "ar" && declared.startsWith("ar")) return false;
        if (bucket === "latin" && /^[a-z]{2}/i.test(declared) && !declared.startsWith("he") && !declared.startsWith("ar")) return false;
        return true;
      });

      return { total: blocks.length || 1, failedNodes };
    },
  });
})();
