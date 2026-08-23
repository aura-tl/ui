import * as React from 'react';
import type { CSSProperties } from 'react';
import type { AuraBoxScoreModel, AuraBoxScoreState } from '@/lib/aura/box-score-types';
import './box-score.css';

export function AuraBoxScore({ state, className = '' }: { state: AuraBoxScoreState; className?: string }) {
  return state.model
    ? <AuraBoxScoreView model={state.model} className={className} />
    : <article className={`aura-box-ledger ${className}`}><p className="aura-box-ledger__empty">{state.error || 'Box score unavailable.'}</p></article>;
}

export function AuraBoxScoreView({ model, className = '' }: { model: AuraBoxScoreModel; className?: string }) {
  const [selected, setSelected] = React.useState(model.teams[0]?.id || '');
  const team = model.teams.find((item) => item.id === selected) || model.teams[0];
  return (
    <article className={`aura-box-ledger ${className}`.trim()}>
      <header><div><span>{model.league} · Box score</span><h3>{team?.name || 'Box score'}</h3></div><strong>{model.status}</strong></header>
      <nav aria-label="Teams">
        {model.teams.map((item) => <button key={item.id} type="button" aria-pressed={item.id === team?.id} onClick={() => setSelected(item.id)}><span>{item.abbreviation}</span><b>{item.score ?? '—'}</b></button>)}
      </nav>
      {team ? (
        <div className="aura-box-ledger__table" role="table" style={{ '--aura-box-columns': team.columns.length } as CSSProperties}>
          <div role="row" className="aura-box-ledger__head"><span>Player</span>{team.columns.map((column) => <b key={column}>{column}</b>)}</div>
          {team.players.map((player) => <div role="row" key={player.id} className={player.leader ? 'is-leader' : undefined}><span><strong>{player.name}</strong><small>{player.detail}</small></span>{player.values.map((value, index) => <b key={`${player.id}:${index}`}>{value}</b>)}</div>)}
        </div>
      ) : null}
    </article>
  );
}
