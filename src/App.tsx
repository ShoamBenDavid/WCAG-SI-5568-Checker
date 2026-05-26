import { useEffect, useRef } from "react";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./components/Dashboard";
import { EmptyState } from "./components/EmptyState";
import { useScanState } from "./hooks/useScanState";
import { useTranslation } from "./hooks/useTranslation";
import {
  getActiveTabUrl,
  isExtensionRuntimeAvailable,
  runExtensionScan,
} from "./lib/extensionBridge";

/**
 * Root application shell.
 *
 * Pipeline:
 *   popup -> background service worker -> content scan -> normalized result
 *
 * The popup also hydrates from chrome.storage.local on mount (handled inside
 * useScanState) so that closing and re-opening the popup preserves the last
 * scan result.
 */
export default function App() {
  const isExtensionPopup = isExtensionRuntimeAvailable();
  const { t } = useTranslation();
  const didAutofillUrl = useRef(false);

  const {
    status,
    config,
    result,
    resultTimestamp,
    error,
    progress,
    activeView,
    setUrl,
    setScope,
    setStandard,
    setUserType,
    setMaxPages,
    toggleDisabilityFilter,
    setAllDisabilityFilters,
    setActiveView,
    startScan,
    resetScan,
    clearResults,
  } = useScanState();

  useEffect(() => {
    if (!isExtensionRuntimeAvailable()) return;
    if (didAutofillUrl.current) return;
    didAutofillUrl.current = true;
    // Fill the search field from the active tab once; after that it is user-controlled.
    if (config.url) return;
    getActiveTabUrl()
      .then((url) => {
        if (url) setUrl(url);
      })
      .catch(() => {
        /* manual entry fallback */
      });
  }, [setUrl, config.url]);

  const handleScan = () => {
    startScan(async (cfg, onProgress) => {
      if (!isExtensionRuntimeAvailable()) {
        throw new Error(
          t("app_runtime_missing")
        );
      }
      return runExtensionScan(cfg, onProgress);
    });
  };

  const isScanning = status === "scanning";

  const renderMainContent = () => {
    if (!result) {
      return <EmptyState status={status} error={error} onRetry={resetScan} />;
    }
    return (
      <Dashboard
        result={result}
        resultTimestamp={resultTimestamp}
        onClear={clearResults}
      />
    );
  };

  return (
    <div
      className={`flex bg-slate-100 overflow-hidden ${
        isExtensionPopup ? "w-[780px] h-[560px]" : "min-h-screen w-full"
      }`}
    >
      <Sidebar
        activeView={activeView}
        onNavigate={setActiveView}
        url={config.url}
        onUrlChange={setUrl}
        scope={config.scope}
        onScopeChange={setScope}
        standard={config.standard}
        onStandardChange={setStandard}
        userType={config.userType}
        onUserTypeChange={setUserType}
        disabilityFilters={config.disabilityFilters}
        onToggleDisabilityFilter={toggleDisabilityFilter}
        onSetAllDisabilityFilters={setAllDisabilityFilters}
        maxPages={config.maxPages ?? 10}
        onMaxPagesChange={setMaxPages}
        onScan={handleScan}
        onRescan={handleScan}
        hasResult={Boolean(result)}
        isScanning={isScanning}
      />

      <div className="flex-1 flex flex-col min-w-0 relative">
        {renderMainContent()}

        {/* Polite live region for assistive tech — announces scan progress. */}
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        >
          {isScanning
            ? `${progress?.label || t("app_scanning_fallback")} — ${
                progress?.percent ?? 0
              } ${t("app_percent")}`
            : status === "complete" && result
              ? t("app_scan_complete", {
                  count: result.totalIssues,
                  suffix: result.totalIssues === 1 ? "" : "s",
                })
              : status === "error"
                ? t("app_scan_failed", { error: error || t("app_unknown_error") })
                : ""}
        </div>

        {isScanning && (
          <div className="absolute inset-0 z-10 bg-slate-900/20 backdrop-blur-[1px] flex items-center justify-center">
            <div className="bg-white/95 border border-slate-200 rounded-xl px-5 py-4 shadow-sm min-w-[320px]">
              <p className="text-sm font-medium text-slate-700">{t("app_overlay_scanning")}</p>
              <div
                className="mt-3 h-2 w-full bg-slate-200 rounded-full overflow-hidden"
                role="progressbar"
                aria-valuenow={progress?.percent ?? 0}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={t("app_progress_label")}
              >
                <div
                  className="h-full bg-indigo-500 transition-all duration-300"
                  style={{
                    width: `${Math.max(5, Math.min(100, progress?.percent ?? 15))}%`,
                  }}
                />
              </div>
              <p className="mt-2 text-xs text-slate-500">
                {progress ? progress.label : t("app_overlay_initializing")}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
