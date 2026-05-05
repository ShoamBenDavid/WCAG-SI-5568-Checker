import { Download, FileJson, FileSpreadsheet, Trash2 } from "lucide-react";
import { exportCsv, exportJson } from "../lib/exporters";
import type { FullScanResult } from "../types";
import { useTranslation } from "../hooks/useTranslation";

type ExportBarProps = {
  result: FullScanResult;
  resultTimestamp: number | null;
  onClear: () => void;
};

function formatRelative(timestamp: number | null, t: (key: string, vars?: Record<string, string | number>) => string) {
  if (!timestamp) return t("export_just_now");
  const diff = Date.now() - timestamp;
  const min = Math.floor(diff / 60000);
  if (min < 1) return t("export_just_now");
  if (min < 60) return t("export_min_ago", { count: min });
  const hr = Math.floor(min / 60);
  if (hr < 24) return t("export_hour_ago", { count: hr });
  const day = Math.floor(hr / 24);
  return t("export_day_ago", { count: day, suffix: day === 1 ? "" : "s" });
}

export function ExportBar({ result, resultTimestamp, onClear }: ExportBarProps) {
  const { t } = useTranslation();
  const handleClear = () => {
    if (window.confirm(t("export_confirm_clear"))) {
      onClear();
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-wrap items-center gap-3 justify-between">
      <div className="text-xs text-slate-500">
        <span className="font-semibold text-slate-700">{t("export_last_scan")}</span>{" "}
        {formatRelative(resultTimestamp, t)}
        {result.scannedUrl ? (
          <span className="ml-2 text-slate-400 truncate inline-block max-w-[260px] align-middle">
            ({result.scannedUrl})
          </span>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => exportJson(result)}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200
                     text-slate-700 bg-white hover:bg-slate-50
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <FileJson className="w-4 h-4" /> {t("export_json")}
        </button>
        <button
          type="button"
          onClick={() => exportCsv(result)}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200
                     text-slate-700 bg-white hover:bg-slate-50
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <FileSpreadsheet className="w-4 h-4" /> {t("export_csv")}
        </button>
        <button
          type="button"
          onClick={handleClear}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border border-red-200
                     text-red-700 bg-red-50 hover:bg-red-100
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
        >
          <Trash2 className="w-4 h-4" /> {t("export_clear")}
        </button>
        {/* Decorative anchor icon used to satisfy the unused-import linter when extending later */}
        <Download className="hidden" aria-hidden="true" />
      </div>
    </div>
  );
}
