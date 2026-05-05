/* global chrome */
/**
 * Content-script orchestrator.
 *
 * All scanning logic now lives in window.__a11y, populated by the helper and
 * rule scripts that run before this file (see manifest.json content_scripts).
 * This file's only responsibilities:
 *   1. Listen for RUN_PAGE_SCAN.
 *   2. Call window.__a11y.runScan(standard, scanId).
 *   3. Send the result back to the background service worker.
 */
(function () {
  if (window.__a11y_listener_installed) return;
  window.__a11y_listener_installed = true;

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    void _sender;
    if (!message || message.type !== "RUN_PAGE_SCAN") return undefined;

    try {
      if (!window.__a11y || typeof window.__a11y.runScan !== "function") {
        sendResponse({
          ok: false,
          error:
            "Accessibility scanner is not initialized. The page may have blocked content scripts.",
        });
        return true;
      }

      const result = window.__a11y.runScan(message.standard, message.scanId);
      sendResponse({ ok: true, ...result });
    } catch (error) {
      sendResponse({
        ok: false,
        error: error instanceof Error ? error.message : "Scan failed in content script",
      });
    }
    return true;
  });
})();
