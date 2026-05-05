(function () {
  const a11y = window.__a11y;
  if (!a11y || !a11y.register) return;

  const PURPOSE_TOKENS = new Set([
    "name", "honorific-prefix", "given-name", "additional-name", "family-name",
    "honorific-suffix", "nickname", "email", "username", "new-password",
    "current-password", "one-time-code", "organization-title", "organization",
    "street-address", "address-line1", "address-line2", "address-line3",
    "address-level1", "address-level2", "address-level3", "address-level4",
    "country", "country-name", "postal-code", "cc-name", "cc-given-name",
    "cc-additional-name", "cc-family-name", "cc-number", "cc-exp",
    "cc-exp-month", "cc-exp-year", "cc-csc", "cc-type", "transaction-currency",
    "transaction-amount", "language", "bday", "bday-day", "bday-month",
    "bday-year", "sex", "tel", "tel-country-code", "tel-national",
    "tel-area-code", "tel-local", "tel-extension", "url", "photo",
  ]);

  // Heuristic — controls whose name/id strongly imply one of the WCAG 2.1
  // input purposes. Only those should require autocomplete; we don't want to
  // flag every <input> on the page.
  const NAME_HINTS = /(email|name|tel|phone|address|country|postal|zip|password|user(name)?|bday|birthday|fname|lname|mname)/i;

  a11y.register({
    id: "input-purpose",
    title: "Common inputs should declare autocomplete",
    description:
      "Inputs collecting common personal data (name, email, address, phone, payment) must use the autocomplete attribute so user-agents and assistive tech can pre-fill or describe them.",
    whyItMatters:
      "Autocomplete is what lets password managers, browsers, and accessibility tools recognise that a field is a phone number, an email, or a credit-card number. Without it, cognitively-impaired users have to manually re-identify each field every time.",
    severity: "moderate",
    recommendation:
      'Add an autocomplete token from the WCAG list of 53 purposes (e.g. autocomplete="email", autocomplete="given-name", autocomplete="cc-number").',
    disabilities: ["cognitive", "motor", "visual"],
    selectorHint: "input",
    standards: {
      // 1.3.5 was added in WCAG 2.1 — no WCAG 2.0 / SI 5568 mapping.
      wcag21: { criterion: "1.3.5", level: "AA" },
      wcag22: { criterion: "1.3.5", level: "AA" },
    },
    run(doc) {
      const inputs = a11y.toArray(doc.querySelectorAll("input")).filter((el) => {
        const t = (el.getAttribute("type") || "text").toLowerCase();
        return ["text", "email", "tel", "url", "password", "search", "number"].includes(t);
      });
      const candidates = inputs.filter((el) => {
        const handle = ((el.getAttribute("name") || "") + " " + (el.id || "")).trim();
        const t = (el.getAttribute("type") || "").toLowerCase();
        return t === "email" || t === "tel" || t === "url" || t === "password" || NAME_HINTS.test(handle);
      });
      const failedNodes = candidates.filter((el) => {
        const ac = (el.getAttribute("autocomplete") || "").trim().toLowerCase();
        if (!ac || ac === "off") return true;
        const tokens = ac.split(/\s+/);
        return !tokens.some((tok) => PURPOSE_TOKENS.has(tok));
      });
      return { total: candidates.length, failedNodes };
    },
  });
})();
