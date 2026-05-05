/* global chrome */
/**
 * Same-origin BFS crawler used by the full-site scan mode.
 *
 * Improvements over the original:
 *   - Hidden pages are loaded into a separate minimized window (not the
 *     user's current window), avoiding tab-strip flicker.
 *   - Per-page errors are captured into `failedPages` and reported back to
 *     the popup instead of being silently swallowed.
 *   - `maxPages` is configurable from the popup (1-25, default 10).
 */

import {
  computePageSummary,
  normalizeIssues,
  aggregateFullResult,
  normalizeComplianceStandard,
} from "./aggregation.js";
import { applyDisabilityFilter, normalizeDisabilityFilters } from "./disability.js";

const TAB_LOAD_TIMEOUT_MS = 20000;
const SCRIPT_INJECTION_SETTLE_MS = 120;
const DEFAULT_MAX_PAGES = 10;
const HARD_MAX_PAGES = 25;

// Mirrors manifest content_scripts[0].js so we can re-inject in the same
// order on hidden tabs. KEEP IN SYNC with public/manifest.json.
const SCANNER_FILES = [
  "scanner/domUtils.js",
  "scanner/accessibleName.js",
  "scanner/contrast.js",
  "rules/ruleRegistry.js",
  "rules/image-alt.js",
  "rules/form-label.js",
  "rules/placeholder-only-label.js",
  "rules/interactive-name.js",
  "rules/html-lang.js",
  "rules/document-title.js",
  "rules/heading-order.js",
  "rules/duplicate-id.js",
  "rules/tabindex-positive.js",
  "rules/keyboard-handler.js",
  "rules/iframe-title.js",
  "rules/video-captions.js",
  "rules/audio-text-alt.js",
  "rules/color-contrast.js",
  "rules/main-landmark.js",
  "rules/skip-link.js",
  "rules/aria-misuse.js",
  "rules/focus-visible.js",
  "rules/hebrew-rtl.js",
  "rules/accessibility-statement.js",
  "content.js",
];

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function emitScanProgress(scanId, payload) {
  if (!scanId) return;
  chrome.runtime
    .sendMessage({ type: "SCAN_PROGRESS", scanId, payload })
    .catch(() => {
      /* popup closed */
    });
}

function isScannableUrl(url) {
  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

function toErrorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}

function normalizeUrl(url) {
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) return null;
    parsed.hash = "";
    return parsed.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

function getCrawlPageKey(url) {
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) return null;
    const hostname = parsed.hostname.toLowerCase();
    let pathname = parsed.pathname || "/";
    pathname = pathname.replace(/\/+$/, "") || "/";
    if (pathname.endsWith("/index.html")) pathname = pathname.slice(0, -11) || "/";
    if (pathname.endsWith("/index.htm")) pathname = pathname.slice(0, -10) || "/";
    return `${parsed.protocol}//${hostname}${pathname}`;
  } catch {
    return null;
  }
}

function sameOriginWithOrigin(origin, candidateUrl) {
  try {
    return new URL(candidateUrl).origin === origin;
  } catch {
    return false;
  }
}

async function waitForTabComplete(tabId, timeoutMs = TAB_LOAD_TIMEOUT_MS) {
  const existing = await chrome.tabs.get(tabId);
  if (existing.status === "complete") return;

  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      chrome.tabs.onUpdated.removeListener(onUpdated);
      reject(new Error(`Tab load timeout for tab ${tabId}`));
    }, timeoutMs);

    function onUpdated(updatedTabId, changeInfo) {
      if (updatedTabId === tabId && changeInfo.status === "complete") {
        clearTimeout(timeout);
        chrome.tabs.onUpdated.removeListener(onUpdated);
        resolve(undefined);
      }
    }
    chrome.tabs.onUpdated.addListener(onUpdated);
  });
}

async function ensureContentScriptInjected(tabId, tabUrl) {
  if (!isScannableUrl(tabUrl)) {
    throw new Error("This page cannot be scanned. Open a regular http/https page and try again.");
  }
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: SCANNER_FILES,
    });
    await delay(SCRIPT_INJECTION_SETTLE_MS);
  } catch (error) {
    const message = toErrorMessage(error);
    if (
      message.includes("Cannot access contents of the page") ||
      message.includes("Missing host permission")
    ) {
      throw new Error(
        "Chrome blocked access to this page. Open a standard website tab (not chrome:// or extension pages) and retry."
      );
    }
    throw new Error(`Cannot inject scanner into tab ${tabId}: ${message}`);
  }
}

async function sendScanMessageToTab(tabId, tabUrl, standard, scanId) {
  const normalizedStandard = normalizeComplianceStandard(standard);
  try {
    return await chrome.tabs.sendMessage(tabId, {
      type: "RUN_PAGE_SCAN",
      standard: normalizedStandard,
      scanId,
    });
  } catch (error) {
    const message = toErrorMessage(error);
    const noReceiver =
      message.includes("Receiving end does not exist") ||
      message.includes("Could not establish connection");

    if (noReceiver) {
      await ensureContentScriptInjected(tabId, tabUrl);
      try {
        return await chrome.tabs.sendMessage(tabId, {
          type: "RUN_PAGE_SCAN",
          standard: normalizedStandard,
          scanId,
        });
      } catch (retryError) {
        throw new Error(`Cannot scan tab ${tabId}: ${toErrorMessage(retryError)}`);
      }
    }

    throw new Error(`Cannot scan tab ${tabId}: ${message}`);
  }
}

export async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab ?? null;
}

export async function runSinglePageScan(config, scanId, ruleCountHint = 22) {
  const tab = await getActiveTab();
  if (!tab || !tab.id || !tab.url) {
    throw new Error("Unable to access active tab.");
  }
  if (!isScannableUrl(tab.url)) {
    throw new Error("Active tab cannot be scanned. Please open an http/https page and retry.");
  }

  await waitForTabComplete(tab.id);
  emitScanProgress(scanId, {
    scope: "single-page",
    current: 0,
    total: ruleCountHint,
    percent: 0,
    label: "Starting checks",
  });

  const response = await sendScanMessageToTab(tab.id, tab.url, config.standard, scanId);
  if (!response?.ok) {
    throw new Error(response?.error || "Scan failed in content script.");
  }

  const selectedFilters = normalizeDisabilityFilters(config.disabilityFilters);
  const normalizedIssues = normalizeIssues(response.issues, tab.url);
  const { issues: filteredIssues, stats: filteredStats } = applyDisabilityFilter(
    normalizedIssues,
    response.wcagCheckStats || [],
    selectedFilters
  );

  const pageSummary = computePageSummary(tab.url, filteredIssues, filteredStats);
  return aggregateFullResult(config, [pageSummary]);
}

/**
 * Open the URL in a freshly created minimized popup window so the user does
 * not see flickering tabs in the active window. Falls back to a regular
 * background tab if windows API is unavailable.
 */
async function openHiddenScanWindow(url) {
  if (chrome.windows && typeof chrome.windows.create === "function") {
    try {
      const win = await chrome.windows.create({
        url,
        focused: false,
        state: "minimized",
        type: "popup",
      });
      const tab = win.tabs && win.tabs[0];
      if (tab && tab.id) return { windowId: win.id, tab };
    } catch (err) {
      console.warn("[a11y] windows.create failed, falling back to tabs.create:", err);
    }
  }
  const tab = await chrome.tabs.create({ url, active: false });
  return { windowId: null, tab };
}

async function closeHiddenScanWindow(windowId, tabId) {
  if (windowId !== null && chrome.windows && typeof chrome.windows.remove === "function") {
    await chrome.windows.remove(windowId).catch(() => {});
    return;
  }
  if (tabId) await chrome.tabs.remove(tabId).catch(() => {});
}

async function scanUrlInHiddenTab(url, selectedFilters, standard) {
  const { windowId, tab } = await openHiddenScanWindow(url);
  if (!tab.id) throw new Error(`Unable to create scan tab for ${url}`);

  try {
    await waitForTabComplete(tab.id);
    const loadedTab = await chrome.tabs.get(tab.id);
    const scanUrl = loadedTab?.url || url;
    const response = await sendScanMessageToTab(tab.id, scanUrl, standard);
    if (!response?.ok) throw new Error(response?.error || `Scan failed for ${url}`);

    const { issues: filteredIssues, stats: filteredStats } = applyDisabilityFilter(
      normalizeIssues(response.issues, scanUrl),
      response.wcagCheckStats || [],
      selectedFilters
    );
    const pageSummary = computePageSummary(scanUrl, filteredIssues, filteredStats);
    const discoveredLinks = Array.isArray(response.discoveredLinks) ? response.discoveredLinks : [];
    return { pageSummary, discoveredLinks };
  } finally {
    await closeHiddenScanWindow(windowId, tab.id);
  }
}

export async function runFullSiteScan(config, scanId) {
  const startUrl = normalizeUrl(config.url);
  if (!startUrl) throw new Error("Invalid URL for full-site scan.");

  const maxPages = Math.max(
    1,
    Math.min(HARD_MAX_PAGES, Number(config.maxPages) || DEFAULT_MAX_PAGES)
  );

  const selectedFilters = normalizeDisabilityFilters(config.disabilityFilters);
  const queue = [startUrl];
  const startKey = getCrawlPageKey(startUrl);
  const queuedKeys = new Set(startKey ? [startKey] : []);
  const visitedKeys = new Set();
  const pages = [];
  const failedPages = [];
  let scanAttempts = 0;
  let crawlOrigin = new URL(startUrl).origin;

  emitScanProgress(scanId, {
    scope: "full-site",
    current: 0,
    total: maxPages,
    percent: 0,
    label: "Starting site crawl",
  });

  while (queue.length > 0 && scanAttempts < maxPages) {
    const nextUrl = queue.shift();
    const nextKey = nextUrl ? getCrawlPageKey(nextUrl) : null;
    if (nextKey) queuedKeys.delete(nextKey);
    if (!nextUrl || !nextKey || visitedKeys.has(nextKey)) continue;
    if (!sameOriginWithOrigin(crawlOrigin, nextUrl)) continue;

    visitedKeys.add(nextKey);
    scanAttempts += 1;

    try {
      const { pageSummary, discoveredLinks } = await scanUrlInHiddenTab(
        nextUrl,
        selectedFilters,
        config.standard
      );
      pages.push(pageSummary);
      emitScanProgress(scanId, {
        scope: "full-site",
        current: scanAttempts,
        total: maxPages,
        percent: Math.round((scanAttempts / maxPages) * 100),
        label: `Checked: ${pageSummary.pageUrl}`,
      });

      if (pages.length === 1) {
        try {
          crawlOrigin = new URL(pageSummary.pageUrl).origin;
        } catch {
          crawlOrigin = new URL(startUrl).origin;
        }
      }

      discoveredLinks.forEach((link) => {
        const normalized = normalizeUrl(link);
        const linkKey = normalized ? getCrawlPageKey(normalized) : null;
        if (
          normalized &&
          linkKey &&
          sameOriginWithOrigin(crawlOrigin, normalized) &&
          !visitedKeys.has(linkKey) &&
          !queuedKeys.has(linkKey)
        ) {
          queue.push(normalized);
          queuedKeys.add(linkKey);
        }
      });
    } catch (error) {
      const errMsg = toErrorMessage(error);
      failedPages.push({ url: nextUrl, error: errMsg });
      emitScanProgress(scanId, {
        scope: "full-site",
        current: scanAttempts,
        total: maxPages,
        percent: Math.round((scanAttempts / maxPages) * 100),
        label: `Skipped: ${nextUrl}`,
      });
    }
  }

  if (pages.length === 0) {
    const lastErr = failedPages[failedPages.length - 1];
    throw new Error(
      lastErr
        ? `Unable to scan pages for this site. Last error: ${lastErr.error}`
        : "Unable to scan pages for this site."
    );
  }

  const result = aggregateFullResult(config, pages, failedPages);
  emitScanProgress(scanId, {
    scope: "full-site",
    current: scanAttempts,
    total: maxPages,
    percent: 100,
    label: "Crawl complete",
  });
  return { ...result, scanScope: "full-site", scannedUrl: pages[0].pageUrl || startUrl };
}
