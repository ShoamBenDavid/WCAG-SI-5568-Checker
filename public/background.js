/* global chrome */
/**
 * Background service worker (MV3, type=module).
 *
 * Routes runtime messages from the popup to the appropriate handler. Heavy
 * lifting is implemented in the modules under /background/.
 */

import { runSinglePageScan, runFullSiteScan, getActiveTab } from "./background/crawler.js";
import { saveLastScan, getLastScan, clearLastScan } from "./background/storage.js";

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  void _sender;
  if (!message || typeof message !== "object") return undefined;

  if (message.type === "GET_ACTIVE_TAB_URL") {
    getActiveTab()
      .then((tab) => sendResponse({ ok: true, url: tab?.url || "" }))
      .catch((error) =>
        sendResponse({
          ok: false,
          error: error instanceof Error ? error.message : "Failed to read active tab URL.",
        })
      );
    return true;
  }

  if (message.type === "GET_LAST_SCAN") {
    getLastScan()
      .then((data) => sendResponse({ ok: true, ...data }))
      .catch((error) =>
        sendResponse({
          ok: false,
          error: error instanceof Error ? error.message : "Failed to read stored scan.",
        })
      );
    return true;
  }

  if (message.type === "CLEAR_LAST_SCAN") {
    clearLastScan()
      .then(() => sendResponse({ ok: true }))
      .catch((error) =>
        sendResponse({
          ok: false,
          error: error instanceof Error ? error.message : "Failed to clear stored scan.",
        })
      );
    return true;
  }

  if (message.type === "RUN_SCAN") {
    const config = message.payload;
    const scanId = message.scanId;
    if (!config?.url || !config?.scope || !config?.userType || !config?.standard) {
      sendResponse({ ok: false, error: "Invalid scan request payload." });
      return true;
    }

    const runner = config.scope === "full-site" ? runFullSiteScan : runSinglePageScan;

    runner(config, scanId)
      .then(async (result) => {
        // Persist the most-recent scan for popup re-open.
        await saveLastScan(result);
        sendResponse({ ok: true, result });
      })
      .catch((error) =>
        sendResponse({
          ok: false,
          error: error instanceof Error ? error.message : "Scan failed.",
        })
      );
    return true;
  }

  return undefined;
});
