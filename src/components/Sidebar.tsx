import {
  LayoutDashboard,
  Accessibility,
  Globe,
  Play,
  Loader2,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Languages,
  Search,
} from 'lucide-react';
import { useState } from 'react';
import { DISABILITY_TYPES } from '../types';
import type {
  ComplianceStandard,
  DisabilityType,
  ScanScope,
  UserType,
} from '../types';
import { useTranslation } from '../hooks/useTranslation';

const NAV_ITEMS = [{ id: 'dashboard', icon: LayoutDashboard }] as const;

type SidebarProps = {
  activeView: string;
  onNavigate: (view: string) => void;
  url: string;
  onUrlChange: (url: string) => void;
  scope: ScanScope;
  onScopeChange: (scope: ScanScope) => void;
  standard: ComplianceStandard;
  onStandardChange: (standard: ComplianceStandard) => void;
  userType: UserType;
  onUserTypeChange: (type: UserType) => void;
  disabilityFilters: DisabilityType[];
  onToggleDisabilityFilter: (type: DisabilityType) => void;
  onSetAllDisabilityFilters: (enabled: boolean) => void;
  maxPages: number;
  onMaxPagesChange: (max: number) => void;
  onScan: () => void;
  onRescan: () => void;
  hasResult: boolean;
  isScanning: boolean;
};

export function Sidebar({
  activeView,
  onNavigate,
  url,
  onUrlChange,
  scope,
  onScopeChange,
  standard,
  onStandardChange,
  userType,
  onUserTypeChange,
  disabilityFilters,
  onToggleDisabilityFilter,
  onSetAllDisabilityFilters,
  maxPages,
  onMaxPagesChange,
  onScan,
  onRescan,
  hasResult,
  isScanning,
}: SidebarProps) {
  const { t, language, direction, setLanguage } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);
  const allChecked = disabilityFilters.length === DISABILITY_TYPES.length;
  const noFiltersSelected = disabilityFilters.length === 0;

  const disabilityLabels: Record<DisabilityType, string> = {
    visual: t('disability_visual'),
    hearing: t('disability_hearing'),
    motor: t('disability_motor'),
    cognitive: t('disability_cognitive'),
  };

  return (
    <aside
      className={`${
        collapsed ? 'w-16' : 'w-80'
      } bg-slate-900 text-white flex flex-col shrink-0 overflow-y-auto transition-all duration-200`}
      aria-label={t('sidebar_scan_controls')}
    >
      <div className="flex items-center gap-3 px-4 h-16 border-b border-slate-700/60">
        <Accessibility
          className="w-7 h-7 text-indigo-400 shrink-0"
          aria-hidden="true"
        />
        {!collapsed && (
          <span className="font-semibold text-[14px] tracking-tight whitespace-nowrap">
            {t('sidebar_title')}
          </span>
        )}
      </div>

      <nav
        className="py-3 space-y-0.5 border-b border-slate-700/60"
        aria-label={t('sidebar_views')}
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
                ${
                  active
                    ? 'bg-indigo-600/20 text-indigo-300 border-r-2 border-indigo-400'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className="w-[18px] h-[18px] shrink-0" aria-hidden="true" />
              {!collapsed && <span>{t('sidebar_dashboard')}</span>}
            </button>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="p-4 space-y-4">
          <div>
            <label
              className="block text-xs font-medium text-slate-400 mb-1"
              htmlFor="scan-url"
            >
              {t('sidebar_website_url')}
            </label>
            <div className="relative">
              <Globe
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
                aria-hidden="true"
              />
              <input
                id="scan-url"
                type="url"
                value={url}
                onChange={(e) => onUrlChange(e.target.value)}
                placeholder="https://example.com"
                disabled={isScanning}
                className="w-full pl-10 pr-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-sm
                           focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus:border-indigo-500
                           disabled:opacity-60"
              />
            </div>
          </div>

          <div>
            <p
              className="text-xs font-medium text-slate-400 mb-1"
              id="scope-label"
            >
              {t('sidebar_scope')}
            </p>
            <div
              className="grid grid-cols-2 rounded-lg border border-slate-700 overflow-hidden"
              role="radiogroup"
              aria-labelledby="scope-label"
            >
              {(['single-page', 'full-site'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  role="radio"
                  aria-checked={scope === s}
                  onClick={() => onScopeChange(s)}
                  disabled={isScanning}
                  className={`px-2 py-2 text-xs font-medium transition-colors
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
                    ${
                      scope === s
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    } disabled:opacity-60`}
                >
                  {s === 'single-page'
                    ? t('sidebar_single_page')
                    : t('sidebar_entire_site')}
                </button>
              ))}
            </div>
          </div>

          {scope === 'full-site' && (
            <div>
              <label
                className="block text-xs font-medium text-slate-400 mb-1"
                htmlFor="max-pages"
              >
                {t('sidebar_max_pages')}
              </label>
              <input
                id="max-pages"
                type="number"
                min={1}
                max={25}
                value={maxPages}
                onChange={(e) => onMaxPagesChange(Number(e.target.value))}
                disabled={isScanning}
                className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-sm
                           focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
                           disabled:opacity-60"
              />
            </div>
          )}

          <div>
            <label
              className="block text-xs font-medium text-slate-400 mb-1"
              htmlFor="standard"
            >
              {t('sidebar_standard')}
            </label>
            <select
              id="standard"
              value={standard}
              onChange={(e) =>
                onStandardChange(e.target.value as ComplianceStandard)
              }
              disabled={isScanning}
              className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-sm
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-60"
            >
              <option value="wcag20">WCAG 2.0</option>
              <option value="wcag21">WCAG 2.1</option>
              <option value="wcag22">WCAG 2.2</option>
              <option value="is5568">{t('sidebar_standard_is')}</option>
            </select>
            <p className="text-[11px] leading-snug text-slate-500 mt-1">
              {t('sidebar_standard_note')}
            </p>
          </div>

          <div>
            <label
              className="block text-xs font-medium text-slate-400 mb-1"
              htmlFor="user-type"
            >
              {t('sidebar_user_type')}
            </label>
            <select
              id="user-type"
              value={userType}
              onChange={(e) => onUserTypeChange(e.target.value as UserType)}
              disabled={isScanning}
              className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-sm
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-60"
            >
              <option value="end-user">{t('sidebar_end_user')}</option>
              <option value="developer">{t('sidebar_developer')}</option>
              <option value="site-owner">{t('sidebar_site_owner')}</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onScan}
              disabled={isScanning || !url.trim() || noFiltersSelected}
              className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg
                         font-medium text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed
                         transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
            >
              {isScanning ? (
                <>
                  <Loader2
                    className="w-4 h-4 animate-spin"
                    aria-hidden="true"
                  />
                  {t('sidebar_scanning')}
                </>
              ) : (
                <>
                  <Search size={18} strokeWidth={2.4} />
                  {t('sidebar_run_scan')}
                </>
              )}
            </button>
            {hasResult && !isScanning && (
              <button
                type="button"
                onClick={onRescan}
                aria-label={t('sidebar_rescan_current')}
                title={t('sidebar_rescan_current')}
                className="inline-flex items-center justify-center px-3 py-2 bg-slate-800 border border-slate-700 text-slate-200 rounded-lg
                           font-medium text-sm hover:bg-slate-700
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <RotateCw className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      )}

      {!collapsed && (
        <div className="border-t border-slate-700/60 p-4 pb-5">
          <div className="flex items-center justify-between gap-2 mb-2">
            <p className="text-xs font-medium text-slate-400">
              {t('sidebar_disability_filter')}
            </p>
            <button
              type="button"
              onClick={() => onSetAllDisabilityFilters(!allChecked)}
              disabled={isScanning}
              className="text-xs text-indigo-300 hover:text-indigo-200 disabled:opacity-50
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
            >
              {allChecked ? t('sidebar_uncheck_all') : t('sidebar_check_all')}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {DISABILITY_TYPES.map((type) => {
              const checked = disabilityFilters.includes(type);
              return (
                <label
                  key={type}
                  className={`inline-flex items-center gap-2 rounded-lg border px-2 py-1.5 text-xs font-medium cursor-pointer transition-colors ${
                    checked
                      ? 'border-indigo-400/50 bg-indigo-500/20 text-indigo-200'
                      : 'border-slate-700 bg-slate-800 text-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggleDisabilityFilter(type)}
                    disabled={isScanning}
                    className="h-3.5 w-3.5 rounded border-slate-500 text-indigo-500 focus:ring-indigo-400"
                  />
                  {disabilityLabels[type]}
                </label>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-700/60">
            <p className="text-xs font-medium text-slate-400 mb-1.5">
              {t('sidebar_preferred_language')}
            </p>
            <div className="grid grid-cols-2 rounded-lg border border-slate-700 overflow-hidden">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2 py-1.5 text-xs font-medium transition-colors flex items-center justify-center gap-1
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                    language === 'en'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                aria-pressed={language === 'en'}
              >
                <Languages className="w-3 h-3" aria-hidden="true" />
                {t('lang_english')}
              </button>
              <button
                type="button"
                onClick={() => setLanguage('he')}
                className={`px-2 py-1.5 text-xs font-medium transition-colors flex items-center justify-center gap-1
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                    language === 'he'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                aria-pressed={language === 'he'}
              >
                <Languages className="w-3 h-3" aria-hidden="true" />
                {t('lang_hebrew')}
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setCollapsed((prev) => !prev)}
        className="mt-auto flex items-center justify-center py-3 border-t border-slate-700/60 text-slate-400 hover:text-white transition-colors
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        aria-label={collapsed ? t('sidebar_expand') : t('sidebar_minimize')}
      >
        {collapsed ? (
          direction === 'rtl' ? (
            <ChevronLeft className="w-5 h-5" aria-hidden="true" />
          ) : (
            <ChevronRight className="w-5 h-5" aria-hidden="true" />
          )
        ) : direction === 'rtl' ? (
          <ChevronRight className="w-5 h-5" aria-hidden="true" />
        ) : (
          <ChevronLeft className="w-5 h-5" aria-hidden="true" />
        )}
      </button>
    </aside>
  );
}
