import { Search, Loader2, AlertTriangle } from "lucide-react";
import type { ScanStatus } from "../types";
import { useTranslation } from "../hooks/useTranslation";

type EmptyStateProps = {
  status: ScanStatus;
  error?: string | null;
  onRetry?: () => void;
};

export function EmptyState({ status, error, onRetry }: EmptyStateProps) {
  const { t } = useTranslation();
  if (status === "scanning") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 text-center px-6">
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-full bg-indigo-100 animate-ping opacity-30" />
          <Loader2
            className="w-14 h-14 text-indigo-500 animate-spin relative"
            aria-hidden="true"
          />
        </div>
        <h2 className="text-xl font-semibold text-slate-800 mb-2">
          {t("empty_scanning_title")}
        </h2>
        <p className="text-slate-500 max-w-md text-sm leading-relaxed">
          {t("empty_scanning_desc")}
        </p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 text-center px-6">
        <AlertTriangle className="w-14 h-14 text-red-400 mb-6" aria-hidden="true" />
        <h2 className="text-xl font-semibold text-slate-800 mb-2">{t("empty_failed")}</h2>
        <p className="text-slate-500 max-w-md text-sm mb-5">
          {error || t("empty_unexpected_error")}
        </p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm
                       font-medium hover:bg-indigo-700 transition-colors
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            {t("empty_try_again")}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-20 text-center px-6">
      <Search className="w-14 h-14 text-slate-300 mb-6" aria-hidden="true" />
      <h2 className="text-xl font-semibold text-slate-800 mb-2">{t("empty_ready")}</h2>
      <p className="text-slate-500 max-w-md text-sm leading-relaxed">
        {t("empty_ready_desc")}{" "}
        <span className="font-medium text-indigo-600">{t("empty_run_scan")}</span>{" "}
        {t("empty_ready_desc_end")}
      </p>
      <p className="text-slate-400 max-w-md text-xs mt-3 leading-snug">
        {t("empty_note")}
      </p>
    </div>
  );
}
