import { useState, useCallback, useEffect } from "react";
import { DISABILITY_TYPES } from "../types";
import type {
  ScanScope,
  UserType,
  ComplianceStandard,
  DisabilityType,
  ScanStatus,
  ScanProgress,
  ScanConfig,
  FullScanResult,
} from "../types";
import {
  clearStoredScan,
  getStoredScan,
  isExtensionRuntimeAvailable,
} from "../lib/extensionBridge";

export type ScanState = {
  status: ScanStatus;
  config: ScanConfig;
  result: FullScanResult | null;
  resultTimestamp: number | null;
  error: string | null;
  progress: ScanProgress | null;
  activeView: string;
};

const initialState: ScanState = {
  status: "idle",
  config: {
    url: "",
    scope: "single-page",
    standard: "wcag21",
    userType: "developer",
    disabilityFilters: [...DISABILITY_TYPES],
    maxPages: 10,
  },
  result: null,
  resultTimestamp: null,
  error: null,
  progress: null,
  activeView: "dashboard",
};

export function useScanState() {
  const [state, setState] = useState<ScanState>(initialState);

  // Hydrate the last persisted scan when the popup re-opens.
  useEffect(() => {
    if (!isExtensionRuntimeAvailable()) return;
    let cancelled = false;
    getStoredScan()
      .then((data) => {
        if (cancelled || !data.result) return;
        setState((prev) => ({
          ...prev,
          status: "complete",
          result: data.result,
          resultTimestamp: data.timestamp,
          // Restore the standard / scope / URL so the user sees the matching settings.
          config: {
            ...prev.config,
            scope: data.result?.scanScope || prev.config.scope,
            standard:
              (data.result?.standard === "si5568" ? "is5568" : data.result?.standard) ||
              prev.config.standard,
            userType: data.result?.userType || prev.config.userType,
          },
        }));
      })
      .catch(() => {
        /* hydration is best effort */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const setUrl = useCallback((url: string) => {
    setState((prev) => ({ ...prev, config: { ...prev.config, url } }));
  }, []);

  const setScope = useCallback((scope: ScanScope) => {
    setState((prev) => ({ ...prev, config: { ...prev.config, scope } }));
  }, []);

  const setUserType = useCallback((userType: UserType) => {
    setState((prev) => ({ ...prev, config: { ...prev.config, userType } }));
  }, []);

  const setStandard = useCallback((standard: ComplianceStandard) => {
    setState((prev) => ({ ...prev, config: { ...prev.config, standard } }));
  }, []);

  const setMaxPages = useCallback((maxPages: number) => {
    const safe = Math.max(1, Math.min(25, Number(maxPages) || 10));
    setState((prev) => ({ ...prev, config: { ...prev.config, maxPages: safe } }));
  }, []);

  const toggleDisabilityFilter = useCallback((type: DisabilityType) => {
    setState((prev) => {
      const exists = prev.config.disabilityFilters.includes(type);
      return {
        ...prev,
        config: {
          ...prev.config,
          disabilityFilters: exists
            ? prev.config.disabilityFilters.filter((item) => item !== type)
            : [...prev.config.disabilityFilters, type],
        },
      };
    });
  }, []);

  const setAllDisabilityFilters = useCallback((enabled: boolean) => {
    setState((prev) => ({
      ...prev,
      config: {
        ...prev.config,
        disabilityFilters: enabled ? [...DISABILITY_TYPES] : [],
      },
    }));
  }, []);

  const setActiveView = useCallback((activeView: string) => {
    setState((prev) => ({ ...prev, activeView }));
  }, []);

  const startScan = useCallback(
    async (
      scanFn: (
        config: ScanConfig,
        onProgress: (progress: ScanProgress) => void
      ) => Promise<FullScanResult>
    ) => {
      setState((prev) => ({ ...prev, status: "scanning", error: null, progress: null }));
      try {
        const result = await scanFn(state.config, (progress) => {
          setState((prev) => ({ ...prev, progress }));
        });
        setState((prev) => ({
          ...prev,
          status: "complete",
          result,
          resultTimestamp: Date.now(),
          progress: null,
        }));
      } catch (err) {
        setState((prev) => ({
          ...prev,
          status: "error",
          progress: null,
          error: err instanceof Error ? err.message : "Scan failed",
        }));
      }
    },
    [state.config]
  );

  const resetScan = useCallback(() => {
    setState((prev) => ({
      ...prev,
      status: "idle",
      result: null,
      resultTimestamp: null,
      error: null,
      progress: null,
      config: {
        ...prev.config,
        url: "",
      },
    }));
  }, []);

  const clearResults = useCallback(async () => {
    await clearStoredScan().catch(() => {});
    setState((prev) => ({
      ...prev,
      status: "idle",
      result: null,
      resultTimestamp: null,
      error: null,
      progress: null,
      config: {
        ...prev.config,
        url: "",
      },
    }));
  }, []);

  return {
    ...state,
    setUrl,
    setScope,
    setUserType,
    setStandard,
    setMaxPages,
    toggleDisabilityFilter,
    setAllDisabilityFilters,
    setActiveView,
    startScan,
    resetScan,
    clearResults,
  };
}
