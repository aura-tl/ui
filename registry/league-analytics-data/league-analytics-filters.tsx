'use client';
import * as React from 'react';
import type { AuraLeagueLandscapeQuery, AuraLeagueLandscapeState } from '@/lib/aura/league-analytics-types';

export interface AuraAnalyticsMetricOption { id: string; label: string; group?: string; entityType?: 'team'|'player'; sports?: string[] }
export type AuraAnalyticsFilterSource =
  | { kind: 'fixture' }
  | { kind: 'connected'; status: AuraLeagueLandscapeState['status']; detail?: string };

const QUERY_KEYS = ['entityType', 'x', 'y', 'size', 'color', 'sport', 'league', 'phase', 'cohort', 'aggregate', 'from', 'to', 'limit', 'xDirection', 'yDirection'] as const;
const DIMENSION_KEYS = ['xDimensions', 'yDimensions', 'sizeDimensions', 'colorDimensions'] as const;
const PHASES = [['final', 'Final'], ['in_progress', 'Live']] as const;
const AGGREGATIONS = ['latest', 'mean', 'sum', 'min', 'max'] as const;

/** The exact bounded search string GET /api/analytics/landscape accepts. */
export function auraLandscapeSearch(query: AuraLeagueLandscapeQuery): string {
  const params = new URLSearchParams();
  for (const key of QUERY_KEYS) {
    const value = query[key];
    if (value !== undefined && value !== '') params.set(key, String(value));
  }
  for (const key of DIMENSION_KEYS) {
    const value = query[key];
    if (value) params.set(key, JSON.stringify(value));
  }
  return params.toString();
}

export function AuraAnalyticsFilters({ value, onChange, metricOptions, sportOptions = [], source, disabled = false, requestPath = '/api/analytics/landscape' }: {
  value: AuraLeagueLandscapeQuery;
  onChange: (next: AuraLeagueLandscapeQuery) => void;
  /** Real Aura metric definition IDs only; the filter surface never invents metrics. */
  metricOptions: AuraAnalyticsMetricOption[];
  sportOptions?: Array<{ id: string; label: string }>;
  source: AuraAnalyticsFilterSource;
  disabled?: boolean;
  /** Request path shown beside the serialized query. */
  requestPath?: string;
}) {
  const cohort = parseCohort(value.cohort);
  const [cohortKind, setCohortKind] = React.useState(cohort.kind);
  const [cohortText, setCohortText] = React.useState(cohort.text);
  const set = (patch: Partial<AuraLeagueLandscapeQuery>) => onChange({ ...value, ...patch });
  const phases = new Set((value.phase || '').split(',').filter(Boolean));
  const badge = sourceBadge(source);
  const controlsDisabled = disabled || source.kind === 'fixture';
  const compatibleMetrics = filterMetricOptions(metricOptions, value.entityType, value.sport);
  React.useEffect(() => { const next = parseCohort(value.cohort); setCohortKind(next.kind); setCohortText(next.text); }, [value.cohort]);
  const setScope = (patch: Pick<AuraLeagueLandscapeQuery, 'entityType'|'sport'> & Partial<Pick<AuraLeagueLandscapeQuery, 'cohort'>>) => {
    const next = { ...value, ...patch };
    const options = filterMetricOptions(metricOptions, next.entityType, next.sport);
    if (!options.length) return;
    const ids = new Set(options.map((option) => option.id));
    if (!ids.has(next.x)) next.x = options[0].id;
    if (!ids.has(next.y)) next.y = options.find((option) => option.id !== next.x)?.id || next.x;
    onChange(next);
  };
  const pushCohort = (kind: typeof cohortKind, text: string) => {
    setCohortKind(kind);
    setCohortText(text);
    set({ cohort: kind !== 'none' && text.trim() ? `${kind}:${text.trim()}` : undefined });
  };
  return <form className="aura-analytics-filters" aria-label="Landscape query filters" onSubmit={(event) => event.preventDefault()}>
    <div className="aura-analytics-filters__grid">
      <fieldset className="aura-analytics-filters__field aura-analytics-filters__segment" disabled={controlsDisabled}>
        <legend>Entities</legend>
        {(['player', 'team'] as const).map((entityType) => <button key={entityType} type="button" aria-pressed={value.entityType === entityType} disabled={controlsDisabled || !filterMetricOptions(metricOptions, entityType, value.sport).length} onClick={() => {
          if (value.entityType === entityType) return;
          if (entityType === 'team' && cohortKind === 'position') { setCohortKind('none'); setCohortText(''); setScope({ entityType, sport: value.sport, cohort: undefined }); return; }
          setScope({ entityType, sport: value.sport });
        }}>{entityType === 'player' ? 'Players' : 'Teams'}</button>)}
      </fieldset>
      {sportOptions.length ? <label className="aura-analytics-filters__field">
        <span>League</span>
        <select value={value.sport || ''} disabled={controlsDisabled} onChange={(event) => setScope({ entityType: value.entityType, sport: event.target.value || undefined })}>
          <option value="">All</option>
          {sportOptions.map((sport) => <option key={sport.id} value={sport.id} disabled={!filterMetricOptions(metricOptions, value.entityType, sport.id).length}>{sport.label}</option>)}
        </select>
      </label> : null}
      {(['x', 'y'] as const).map((axis) => <label key={axis} className="aura-analytics-filters__field">
        <span>{axis.toUpperCase()} metric</span>
        <select value={value[axis]} disabled={controlsDisabled} onChange={(event) => set({ [axis]: event.target.value })}>
          {metricGroups(compatibleMetrics).map((entry) => entry.group
            ? <optgroup key={entry.group} label={entry.group}>{entry.options.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}</optgroup>
            : entry.options.map((option) => <option key={option.id} value={option.id}>{option.label}</option>))}
        </select>
      </label>)}
      <label className="aura-analytics-filters__field">
        <span>Aggregation</span>
        <select value={value.aggregate || 'latest'} disabled={controlsDisabled} onChange={(event) => set({ aggregate: event.target.value as AuraLeagueLandscapeQuery['aggregate'] })}>
          {AGGREGATIONS.map((aggregation) => <option key={aggregation} value={aggregation}>{aggregation}</option>)}
        </select>
      </label>
      <fieldset className="aura-analytics-filters__field aura-analytics-filters__chips" disabled={controlsDisabled}>
        <legend>Game phase</legend>
        {PHASES.map(([id, label]) => <button key={id} type="button" aria-pressed={phases.has(id)} onClick={() => {
          const next = new Set(phases);
          next.has(id) ? next.delete(id) : next.add(id);
          set({ phase: PHASES.map(([phase]) => phase).filter((phase) => next.has(phase)).join(',') || undefined });
        }}>{label}</button>)}
      </fieldset>
      <div className="aura-analytics-filters__field aura-analytics-filters__cohort" role="group" aria-label="Player filter">
        <span>Player filter</span>
        <div>
          <select aria-label="Cohort kind" value={cohortKind} disabled={controlsDisabled} onChange={(event) => pushCohort(event.target.value as typeof cohortKind, cohortText)}>
            <option value="none">All</option>
            <option value="team">Team</option>
            {value.entityType === 'player' ? <option value="position">Position</option> : null}
          </select>
          <input type="text" aria-label={cohortKind === 'position' ? 'Position code' : 'Team abbreviation'} placeholder={cohortKind === 'position' ? 'e.g. 1B' : teamPlaceholder(value.sport)} value={cohortText} disabled={controlsDisabled || cohortKind === 'none'} onChange={(event) => pushCohort(cohortKind, event.target.value)} />
        </div>
      </div>
      <label className="aura-analytics-filters__field">
        <span>Observed from (UTC)</span>
        <input type="date" value={dateValue(value.from)} disabled={controlsDisabled} onChange={(event) => set({ from: event.target.value ? Date.parse(`${event.target.value}T00:00:00.000Z`) : undefined })} />
      </label>
      <label className="aura-analytics-filters__field">
        <span>Through (UTC)</span>
        <input type="date" value={dateValue(value.to)} disabled={controlsDisabled} onChange={(event) => set({ to: event.target.value ? Date.parse(`${event.target.value}T23:59:59.999Z`) : undefined })} />
      </label>
      <label className="aura-analytics-filters__field">
        <span>Entity limit</span>
        <input type="number" min={1} max={100} step={1} value={value.limit ?? ''} placeholder="36" disabled={controlsDisabled} onChange={(event) => {
          if (event.target.value === '') return set({ limit: undefined });
          const parsed = Math.round(Number(event.target.value));
          if (Number.isFinite(parsed)) set({ limit: Math.max(1, Math.min(100, parsed)) });
        }} />
      </label>
    </div>
    <footer className="aura-analytics-filters__footer">
      <span className={`aura-analytics-filters__badge is-${badge.tone}`} role="status"><i aria-hidden="true" /> {badge.label}{badge.detail ? <small>{badge.detail}</small> : null}</span>
      <code className="aura-analytics-filters__request" aria-label="Exact Aura request">GET {requestPath}?{auraLandscapeSearch(value)}</code>
    </footer>
  </form>;
}

function metricGroups(options: AuraAnalyticsMetricOption[]) {
  const groups: Array<{ group: string; options: AuraAnalyticsMetricOption[] }> = [];
  for (const option of options) {
    const existing = groups.find((entry) => entry.group === (option.group || ''));
    if (existing) existing.options.push(option);
    else groups.push({ group: option.group || '', options: [option] });
  }
  return groups;
}

function filterMetricOptions(options: AuraAnalyticsMetricOption[], entityType: 'team'|'player', sport?: string) {
  return options.filter((option) => (!option.entityType || option.entityType === entityType) && (!sport || !option.sports?.length || option.sports.includes(sport)));
}

function parseCohort(cohort?: string): { kind: 'none' | 'team' | 'position'; text: string } {
  const separator = cohort ? cohort.indexOf(':') : -1;
  const kind = cohort ? cohort.slice(0, separator) : '';
  if (kind !== 'team' && kind !== 'position') return { kind: 'none', text: '' };
  return { kind, text: cohort ? cohort.slice(separator + 1) : '' };
}

function dateValue(ms?: number) {
  return ms === undefined ? '' : new Date(ms).toISOString().slice(0, 10);
}

function teamPlaceholder(sport?: string) {
  if (sport === 'MLB') return 'e.g. NYY';
  if (sport === 'NFL') return 'e.g. KC';
  return 'e.g. GSW';
}

function sourceBadge(source: AuraAnalyticsFilterSource): { tone: string; label: string; detail?: string } {
  if (source.kind === 'fixture') return { tone: 'fixture', label: 'Example data' };
  const labels = {
    loading: { tone: 'loading', label: 'Loading Aura data…' },
    ready: { tone: 'ready', label: 'Live Aura data' },
    unavailable: { tone: 'unavailable', label: 'No data for this selection' },
    error: { tone: 'error', label: 'Request rejected' },
  } as const;
  return { ...labels[source.status], detail: source.detail };
}
