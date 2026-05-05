/**
 * Disability filter helpers.
 *
 * Issues and stats now carry their own `disabilities` array (set by each rule
 * in the registry), so we no longer need a hardcoded ruleId -> disability
 * map. Both arrays are filtered consistently here.
 */

export const ALL_DISABILITY_FILTERS = ["visual", "hearing", "motor", "cognitive"];

export function normalizeDisabilityFilters(filters) {
  if (!Array.isArray(filters)) return [...ALL_DISABILITY_FILTERS];
  const normalized = filters.filter((item) => ALL_DISABILITY_FILTERS.includes(item));
  return Array.from(new Set(normalized));
}

function rowMatchesFilters(row, selected) {
  const rowDis =
    Array.isArray(row?.disabilities) && row.disabilities.length > 0
      ? row.disabilities
      : ALL_DISABILITY_FILTERS;
  return rowDis.some((d) => selected.includes(d));
}

/**
 * Apply the disability filter to BOTH issues and per-rule stats so the
 * dashboard, score, and coverage table stay consistent. Returns new arrays
 * (no mutation).
 */
export function applyDisabilityFilter(issues, stats, selected) {
  const filters = normalizeDisabilityFilters(selected);
  if (filters.length === 0) {
    return { issues: [], stats: [] };
  }
  if (filters.length === ALL_DISABILITY_FILTERS.length) {
    return { issues: [...(issues || [])], stats: [...(stats || [])] };
  }
  return {
    issues: (issues || []).filter((i) => rowMatchesFilters(i, filters)),
    stats: (stats || []).filter((s) => rowMatchesFilters(s, filters)),
  };
}
