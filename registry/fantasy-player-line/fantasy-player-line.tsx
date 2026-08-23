import * as React from 'react';
import type { AuraFantasyPlayerLineModel, AuraFantasyPlayerLineState } from '@/lib/aura/fantasy-player-line-types';
import './fantasy-player-line.css';

export function AuraFantasyPlayerLine({ state, className = '' }: { state: AuraFantasyPlayerLineState; className?: string }) {
  return state.model
    ? <AuraFantasyPlayerLineView model={state.model} className={className} />
    : <article className={`aura-fantasy-line ${className}`}><p className="aura-fantasy-empty">{state.error || 'Player stat line unavailable.'}</p></article>;
}

export function AuraFantasyPlayerLineView({ model, className = '' }: { model: AuraFantasyPlayerLineModel; className?: string }) {
  return <article className={`aura-fantasy-line ${className}`.trim()}>
    <header><div><span>{model.team} · {model.position}</span><h3>{model.name}</h3></div><small>{model.status}</small></header>
    <div className="aura-fantasy-line__points"><strong>{model.points.toFixed(1)}</strong><span>{model.scoringLabel} points</span></div>
    <dl>{model.stats.map((stat) => <div key={stat.key}><dt>{stat.label}</dt><dd>{stat.value}</dd></div>)}</dl>
    {model.opponent ? <footer>vs {model.opponent}</footer> : null}
  </article>;
}
