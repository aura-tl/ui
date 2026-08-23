import * as React from 'react';
import type { AuraGameCardModel, AuraGameCardState, AuraGameCardTeam } from '@/lib/aura/game-card-types';
import './game-card.css';

export function AuraGameCard({ state, className = '' }: { state: AuraGameCardState; className?: string }) {
  if (!state.model) return <article className={`aura-game-card ${className}`.trim()}><p className="aura-game-card__empty">{state.error || 'Loading game…'}</p></article>;
  return <AuraGameCardView model={state.model} className={className} />;
}
export function AuraGameCardView({ model, className = '' }: { model: AuraGameCardModel; className?: string }) {
  return (
    <article className={`aura-game-card ${className}`.trim()} aria-label={`${model.away.name} at ${model.home.name}`}>
      <header><span>{model.league}</span><strong data-phase={model.phase}>{model.status}</strong></header>
      <div className="aura-game-card__matchup"><Team team={model.away} /><div className="aura-game-card__divider"><span>at</span></div><Team team={model.home} /></div>
      <footer><time>{model.startsAt ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(model.startsAt) : 'Time TBD'}</time>{model.note ? <span>{model.note}</span> : null}</footer>
    </article>
  );
}
function Team({ team }: { team: AuraGameCardTeam }) {
  return <section className="aura-game-card__team"><i style={{ background: team.color }}>{team.abbreviation.slice(0, 1)}</i><div><strong>{team.abbreviation}</strong><span>{team.name}</span></div><b>{team.score ?? '—'}</b>{team.record ? <small>{team.record}</small> : null}</section>;
}
