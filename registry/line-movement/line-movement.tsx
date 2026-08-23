import * as React from 'react';
import type { AuraLineMovementModel, AuraLineMovementState } from '@/lib/aura/line-movement-types';
import './line-movement.css';

export function AuraLineMovement({ state, className = '' }: { state: AuraLineMovementState; className?: string }) {
  return state.status === 'ready' && state.model
    ? <AuraLineMovementView model={state.model} className={className} />
    : <section className={`aura-line-movement ${className}`}><p className="aura-line-empty">{state.error || 'Line history unavailable.'}</p></section>;
}

export function AuraLineMovementView({ model, className = '' }: { model: AuraLineMovementModel; className?: string }) {
  const values = model.series.flatMap((series) => series.values.map((point) => point.value));
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 1);
  const changes = Math.max(0, ...model.series.map((series) => series.values.length - 1));
  return <section className={`aura-line-movement ${className}`.trim()}>
    <header><div><span>Opening → current</span><h3>{label(model.marketType)} movement</h3></div><small>{changes} retained changes</small></header>
    <svg viewBox="0 0 640 190" role="img" aria-label={`${label(model.marketType)} movement`}>
      <line x1="20" x2="620" y1="95" y2="95" />
      {model.series.map((series, index) => <path key={series.side} d={path(series.values.map((point) => point.value), min, max)} className={`series-${index + 1}`} />)}
    </svg>
    <footer>{model.series.map((series, index) => <span key={series.side}><i className={`series-${index + 1}`} />{series.label}<b>{format(series.values[series.values.length - 1]?.value ?? null)}</b></span>)}</footer>
  </section>;
}

function label(value: AuraLineMovementModel['marketType']) { return value === 'moneyline' ? 'Moneyline' : value === 'spread' ? 'Spread' : 'Total'; }
function format(value: number | null) { return value === null ? '—' : value > 0 ? `+${value}` : String(value); }
function path(values: number[], min: number, max: number) { const spread = Math.max(1, max - min); return values.map((value, index) => { const x = 20 + index / Math.max(1, values.length - 1) * 600; const y = 18 + (1 - (value - min) / spread) * 154; return `${index ? 'L' : 'M'} ${x.toFixed(1)} ${y.toFixed(1)}`; }).join(' '); }
