import type {
  FullScanResult,
  ScanConfig,
  ScanProgress,
  StoredScan,
} from "../types";

type RuntimeMessageResponse<T> = {
  ok: boolean;
  result?: T;
  url?: string;
  error?: string;
};

type StoredScanResponse = {
  ok: boolean;
  result?: FullScanResult | null;
  timestamp?: number | null;
  error?: string;
};

type ScanProgressMessage = {
  type: "SCAN_PROGRESS";
  scanId: string;
  payload: ScanProgress;
};

function getChromeApi(): any | null {
  return (globalThis as any).chrome ?? null;
}

export function isExtensionRuntimeAvailable(): boolean {
  const chromeApi = getChromeApi();
  return Boolean(chromeApi?.runtime?.id && chromeApi?.runtime?.sendMessage);
}

function sendRuntimeMessage<T>(message: Record<string, unknown>): Promise<T> {
  return new Promise((resolve, reject) => {
    const chromeApi = getChromeApi();
    if (!chromeApi?.runtime?.sendMessage) {
      reject(new Error("Chrome runtime API is not available."));
      return;
    }

    chromeApi.runtime.sendMessage(message, (response: T) => {
      const lastError = chromeApi.runtime.lastError;
      if (lastError) {
        reject(new Error(lastError.message));
        return;
      }
      resolve(response);
    });
  });
}

export async function getActiveTabUrl(): Promise<string> {
  const response = await sendRuntimeMessage<RuntimeMessageResponse<never>>({
    type: "GET_ACTIVE_TAB_URL",
  });
  if (!response.ok) {
    throw new Error(response.error || "Failed to read current tab URL.");
  }
  return response.url ?? "";
}

export async function getStoredScan(): Promise<StoredScan> {
  if (!isExtensionRuntimeAvailable()) return { result: null, timestamp: null };
  const response = await sendRuntimeMessage<StoredScanResponse>({
    type: "GET_LAST_SCAN",
  });
  if (!response.ok) return { result: null, timestamp: null };
  return {
    result: response.result || null,
    timestamp: response.timestamp || null,
  };
}

export async function clearStoredScan(): Promise<void> {
  if (!isExtensionRuntimeAvailable()) return;
  await sendRuntimeMessage<{ ok: boolean; error?: string }>({
    type: "CLEAR_LAST_SCAN",
  });
}

function createScanId(): string {
  const cryptoApi = (globalThis as any).crypto;
  if (cryptoApi?.randomUUID) return cryptoApi.randomUUID();
  return `scan-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function runExtensionScan(
  config: ScanConfig,
  onProgress?: (progress: ScanProgress) => void
): Promise<FullScanResult> {
  const chromeApi = getChromeApi();
  const scanId = createScanId();

  const progressListener = (message: ScanProgressMessage) => {
    if (message?.type !== "SCAN_PROGRESS" || message.scanId !== scanId) return;
    onProgress?.(message.payload);
  };

  if (chromeApi?.runtime?.onMessage?.addListener) {
    chromeApi.runtime.onMessage.addListener(progressListener);
  }

  let response: RuntimeMessageResponse<FullScanResult>;
  try {
    response = await sendRuntimeMessage<RuntimeMessageResponse<FullScanResult>>({
      type: "RUN_SCAN",
      payload: config,
      scanId,
    });
  } finally {
    if (chromeApi?.runtime?.onMessage?.removeListener) {
      chromeApi.runtime.onMessage.removeListener(progressListener);
    }
  }

  if (!response.ok || !response.result) {
    throw new Error(response.error || "Extension scan failed.");
  }

  return response.result;
}
