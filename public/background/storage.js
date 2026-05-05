/* global chrome */
/**
 * Persistence helpers backed by chrome.storage.local.
 *
 * We store ONLY the most recent scan result and a single timestamp. There is
 * no scan history (out of scope per plan), and we never grow without bound.
 */

const KEY_LAST_SCAN = "lastScan";
const KEY_LAST_SCAN_AT = "lastScanAt";

export async function saveLastScan(result) {
  try {
    await chrome.storage.local.set({
      [KEY_LAST_SCAN]: result,
      [KEY_LAST_SCAN_AT]: Date.now(),
    });
  } catch (err) {
    // Storage may be unavailable on some pages or in incognito strict mode.
    // We swallow the error rather than fail the scan.
    console.warn("[a11y] Failed to persist last scan:", err);
  }
}

export async function getLastScan() {
  try {
    const data = await chrome.storage.local.get([KEY_LAST_SCAN, KEY_LAST_SCAN_AT]);
    return {
      result: data[KEY_LAST_SCAN] || null,
      timestamp: data[KEY_LAST_SCAN_AT] || null,
    };
  } catch {
    return { result: null, timestamp: null };
  }
}

export async function clearLastScan() {
  try {
    await chrome.storage.local.remove([KEY_LAST_SCAN, KEY_LAST_SCAN_AT]);
  } catch (err) {
    console.warn("[a11y] Failed to clear last scan:", err);
  }
}
