import {
  AlertTriangle,
  FileSearch,
  Gauge,
  ShieldAlert,
  AlertCircle,
} from 'lucide-react';
import { KpiCard } from './KpiCard';
import { SeverityBar } from './SeverityBar';
import {
  ScoreTrendChart,
  SeverityDistributionChart,
  CategoryBreakdownChart,
} from './AnalyticsChart';
import { IssuesTable } from './IssuesTable';
import { WcagChecksStats } from './WcagChecksStats';
import { ExportBar } from './ExportBar';
import type { FullScanResult } from '../types';
import { useTranslation } from '../hooks/useTranslation';

type DashboardProps = {
  result: FullScanResult;
  resultTimestamp: number | null;
  onClear: () => void;
};

function scoreLabel(score: number, t: (k: string) => string) {
  if (score >= 90) return t('dashboard_score_good');
  if (score >= 70) return t('dashboard_score_improve');
  return t('dashboard_score_poor');
}

export function Dashboard({
  result,
  resultTimestamp,
  onClear,
}: DashboardProps) {
  const { t } = useTranslation();
  const multiPage = result.pages.length > 1;
  const failedPages = result.failedPages || [];
  const isDeveloper = result.userType === 'developer';
  const isSiteOwner = result.userType === 'site-owner';
  const isEndUser = result.userType === 'end-user';

  const showKpi = isSiteOwner || isEndUser;
  const showCoverageTable = isSiteOwner || isEndUser;
  const showIssuesTable = isDeveloper;
  const showCharts = isSiteOwner || isEndUser;

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <ExportBar
        result={result}
        resultTimestamp={resultTimestamp}
        onClear={onClear}
      />

      {/* KPI cards */}
      {showKpi && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <KpiCard
            label={t('dashboard_total_issues')}
            value={result.totalIssues}
            icon={AlertTriangle}
            iconBgClass="bg-red-50"
            iconColorClass="text-red-500"
            subtitle={t('dashboard_across_pages', {
              count: result.totalPagesScanned,
              suffix: result.totalPagesScanned !== 1 ? 's' : '',
            })}
          />
          <KpiCard
            label={t('dashboard_pages_scanned')}
            value={result.totalPagesScanned}
            icon={FileSearch}
            iconBgClass="bg-blue-50"
            iconColorClass="text-blue-500"
            subtitle={
              result.scanScope === 'full-site'
                ? t('dashboard_full_crawl')
                : t('dashboard_single_page')
            }
          />
          <KpiCard
            label={t('dashboard_score')}
            value={`${result.accessibilityScore}/100`}
            icon={Gauge}
            iconBgClass="bg-emerald-50"
            iconColorClass="text-emerald-500"
            subtitle={scoreLabel(result.accessibilityScore, t)}
          />
          <KpiCard
            label={t('dashboard_critical_issues')}
            value={result.criticalIssues}
            icon={ShieldAlert}
            iconBgClass="bg-amber-50"
            iconColorClass="text-amber-600"
            subtitle={t('dashboard_critical_subtitle')}
          />
        </div>
      )}

      {/* Severity distribution strip */}
      {showKpi && (
        <SeverityBar
          critical={result.criticalIssues}
          serious={result.seriousIssues}
          moderate={result.moderateIssues}
          minor={result.minorIssues}
          total={result.totalIssues}
        />
      )}

      {showKpi && (
        <section className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-indigo-50 p-2">
              <Gauge className="h-5 w-5 text-indigo-600" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-slate-800">
                {t('dashboard_score_method_title')}
              </h3>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                {t('dashboard_score_method_intro')}
              </p>
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ['bg-red-100 text-red-700', t('dashboard_score_method_critical')],
                  ['bg-orange-100 text-orange-700', t('dashboard_score_method_serious')],
                  ['bg-amber-100 text-amber-700', t('dashboard_score_method_moderate')],
                  ['bg-blue-100 text-blue-700', t('dashboard_score_method_minor')],
                ].map(([className, label]) => (
                  <span
                    key={label}
                    className={`rounded-md px-3 py-2 text-xs font-semibold ${className}`}
                  >
                    {label}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-500">
                {t('dashboard_score_method_note')}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Crawl-failure summary */}
      {failedPages.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm">
          <div className="flex items-center gap-2 font-semibold text-amber-900">
            <AlertCircle className="w-4 h-4" />
            {t('dashboard_failed_pages', {
              count: failedPages.length,
              suffix: failedPages.length === 1 ? '' : 's',
            })}
          </div>
          <ul className="mt-2 max-h-32 overflow-y-auto space-y-1 text-amber-900/90">
            {failedPages.map((p) => (
              <li key={p.url} className="text-xs">
                <span className="font-medium">{p.url}</span>
                <span className="text-amber-700/80"> — {p.error}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Charts */}
      {showCharts && multiPage && <ScoreTrendChart pages={result.pages} />}

      {showCharts && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SeverityDistributionChart
            critical={result.criticalIssues}
            serious={result.seriousIssues}
            moderate={result.moderateIssues}
            minor={result.minorIssues}
          />
          <CategoryBreakdownChart issues={result.issues} />
        </div>
      )}

      {showCoverageTable && (
        <WcagChecksStats
          stats={result.wcagCheckStats}
          standard={result.standard}
          standardLabel={result.standardLabel}
        />
      )}

      {showIssuesTable && (
        <IssuesTable
          issues={result.issues}
          userType={result.userType}
          scanScope={result.scanScope}
          standard={result.standard}
          standardLabel={result.standardLabel}
        />
      )}
    </div>
  );
}
