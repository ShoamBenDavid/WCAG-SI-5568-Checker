/* global chrome */
/**
 * Shared DOM utilities for the accessibility scanner.
 *
 * Every scanner script attaches to window.__a11y (a single shared object that
 * lives in the content-script isolated world, NOT the page's window).
 */
(function () {
  const a11y = (window.__a11y = window.__a11y || {});

  a11y.toArray = function toArray(nodeList) {
    return Array.from(nodeList || []);
  };

  a11y.clamp = function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  };

  /**
   * Generate a short CSS path that can be displayed in the report. We avoid
   * the full ancestry chain because long selectors look awful in the UI.
   */
  a11y.cssPath = function cssPath(element) {
    if (!element || !(element instanceof Element)) return undefined;
    if (element.id) return `#${CSS.escape(element.id)}`;
    const classes = a11y.toArray(element.classList).slice(0, 2).join(".");
    const classPart = classes ? `.${classes}` : "";
    const tag = element.tagName.toLowerCase();
    return `${tag}${classPart}`;
  };

  a11y.htmlSnippet = function htmlSnippet(element, maxLength = 260) {
    if (!element || !(element instanceof Element)) return undefined;
    const normalized = element.outerHTML.replace(/\s+/g, " ").trim();
    if (normalized.length <= maxLength) return normalized;
    return `${normalized.slice(0, maxLength)}...`;
  };

  /**
   * Element-level visibility check used by rules that should ignore offscreen
   * or display:none nodes (e.g. color contrast).
   */
  a11y.isVisible = function isVisible(el, style) {
    if (!el || !(el instanceof Element)) return false;
    const s = style || window.getComputedStyle(el);
    if (s.visibility === "hidden" || s.display === "none") return false;
    if (Number.parseFloat(s.opacity) === 0) return false;
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  };

  /**
   * Tags whose contents are not user-visible text (or where computed styles
   * are misleading) and that all rules should skip.
   */
  a11y.isSkippableTag = function isSkippableTag(el) {
    if (!el || !el.tagName) return true;
    const tag = el.tagName.toLowerCase();
    return (
      tag === "script" ||
      tag === "style" ||
      tag === "noscript" ||
      tag === "template" ||
      tag === "svg" ||
      tag === "path"
    );
  };

  a11y.normalizeUrl = function normalizeUrl(url) {
    try {
      const parsed = new URL(url, window.location.href);
      if (!["http:", "https:"].includes(parsed.protocol)) return null;
      parsed.hash = "";
      return parsed.toString().replace(/\/$/, "");
    } catch {
      return null;
    }
  };

  a11y.getInternalLinks = function getInternalLinks(max = 200) {
    const current = new URL(window.location.href);
    const links = new Set();
    a11y.toArray(document.querySelectorAll("a[href]")).forEach((link) => {
      const href = a11y.normalizeUrl(link.getAttribute("href"));
      if (!href) return;
      try {
        const parsed = new URL(href);
        if (parsed.origin === current.origin) {
          links.add(href);
        }
      } catch {
        /* ignore invalid URL */
      }
    });
    return Array.from(links).slice(0, max);
  };

  /**
   * Detect Hebrew content. We require >= 20 Hebrew characters to avoid
   * flagging stray words on otherwise English pages.
   */
  a11y.containsSubstantialHebrew = function containsSubstantialHebrew(text) {
    if (!text) return false;
    const matches = text.match(/[\u0590-\u05FF]/g);
    return matches !== null && matches.length >= 20;
  };

  a11y.STANDARD_LABELS = {
    wcag20: "WCAG 2.0",
    wcag21: "WCAG 2.1",
    wcag22: "WCAG 2.2",
    si5568: "Israeli Standard SI 5568",
  };

  a11y.DEFAULT_DISABILITIES = ["visual", "hearing", "motor", "cognitive"];

  void chrome;
})();
