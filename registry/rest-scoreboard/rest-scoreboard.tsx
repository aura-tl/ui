import * as React from 'react';
import type { AuraRestScoreboardControllerState } from '@/lib/aura/rest-scoreboard-types';
import './rest-scoreboard.css';

export interface AuraRestScoreboardProps {
  state: AuraRestScoreboardControllerState;
  className?: string;
}

export function AuraRestScoreboard({ state, className = '' }: AuraRestScoreboardProps) {
  const model = state.model;
  const view = model?.view;
  const label = state.status === 'polling'
    ? `Polling every request · ${state.pollCount} completed`
    : state.status === 'replay'
      ? `Replay · ${model?.playCount ?? 0} retained plays`
      : state.status;

  return (
    <section className={`aura-rest-scoreboard ${className}`.trim()} data-state={state.status}>
      <header className="aura-rest-scoreboard__header">
        <div>
          <p className="aura-rest-scoreboard__eyebrow">Aura REST starter</p>
          <h2>{view?.scoreboard.league || 'Scoreboard'}</h2>
        </div>
        <span className="aura-rest-scoreboard__status">{label}</span>
      </header>
      {view ? (
        <div className="aura-rest-scoreboard__teams">
          <Team team={view.scoreboard.away} />
          <div className="aura-rest-scoreboard__phase">
            <strong>{view.scoreboard.status}</strong>
            <span>{view.scoreboard.phase}</span>
          </div>
          <Team team={view.scoreboard.home} />
        </div>
      ) : (
        <p className="aura-rest-scoreboard__message">
          {state.error || 'Requesting the named Game and GameFrame contract…'}
        </p>
      )}
      {model?.replayAt ? (
        <footer className="aura-rest-scoreboard__footer">
          Replay as of {new Date(model.replayAt).toISOString()}
        </footer>
      ) : null}
    </section>
  );
}

function Team({ team }: { team: { abbreviation: string; name: string; score: number | null } }) {
  return (
    <div className="aura-rest-scoreboard__team">
      <span>{team.abbreviation}</span>
      <strong>{team.score ?? '—'}</strong>
      <small>{team.name}</small>
    </div>
  );
}
