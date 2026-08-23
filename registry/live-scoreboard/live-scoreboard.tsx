import type {
  AuraLiveScoreboardControllerState,
  AuraLiveScoreboardStatus,
  AuraTeamViewModel,
} from '@/lib/aura/live-scoreboard-types';

export interface AuraLiveScoreboardProps {
  state: AuraLiveScoreboardControllerState;
}

/**
 * This markup is copied into your app. Move teams, add logos, replace the
 * typography, or animate revisions—the Aura controller contract stays intact.
 */
export function AuraLiveScoreboard({
  state,
}: AuraLiveScoreboardProps) {
  const model = state.model;
  if (!model) {
    return (
      <article
        className={`aura-live-scoreboard is-${state.status}`}
        data-state={state.status}
      >
        <header className="aura-live-scoreboard-status">
          <StateIndicator status={state.status} />
          <span>{emptyStateLabel(state.status)}</span>
        </header>
        <div className="aura-live-scoreboard-empty">
          <strong>
            {state.status === 'connecting'
              ? 'Connecting to Aura game state'
              : 'Live frame unavailable'}
          </strong>
          <span>
            {state.error ||
              'Waiting for the first complete render frame.'}
          </span>
        </div>
      </article>
    );
  }

  return (
    <article
      className={`aura-live-scoreboard is-${state.status}`}
      aria-label={`${model.scoreboard.away.name} at ${model.scoreboard.home.name} live scoreboard`}
      data-state={state.status}
    >
      <header className="aura-live-scoreboard-status">
        <StateIndicator status={state.status} />
        <span>{model.scoreboard.league}</span>
        <strong>{scoreboardStatus(model.scoreboard.status, state.status)}</strong>
      </header>
      <div className="aura-live-scoreboard-teams">
        <ScoreTeam side="away" team={model.scoreboard.away} />
        <div className="aura-live-scoreboard-divider">
          <span>
            {state.status === 'final'
              ? 'FINAL'
              : state.status === 'replay'
                ? 'REPLAY'
                : 'LIVE'}
          </span>
        </div>
        <ScoreTeam side="home" team={model.scoreboard.home} />
      </div>
      <footer className="aura-live-scoreboard-freshness">
        <span>{state.status === 'final' ? 'Final' : `Updated ${formatAge(model.freshness.ageMs)}`}</span>
        {!model.freshness.complete ? <span>Some data unavailable</span> : null}
        {state.reconnectAttempt > 0 ? (
          <strong>Reconnecting</strong>
        ) : null}
      </footer>
    </article>
  );
}

function ScoreTeam({
  side,
  team,
}: {
  side: 'away' | 'home';
  team: AuraTeamViewModel;
}) {
  return (
    <section
      className={`aura-live-scoreboard-team is-${side}`}
    >
      <i style={{ background: team.color }} aria-hidden="true" />
      <div>
        <span>{side.toUpperCase()}</span>
        <strong>{team.abbreviation}</strong>
        <small>{team.name}</small>
      </div>
      <b>{team.score ?? '—'}</b>
    </section>
  );
}

function StateIndicator({
  status,
}: {
  status: AuraLiveScoreboardStatus;
}) {
  return (
    <i
      className="aura-live-scoreboard-indicator"
      aria-label={status}
    />
  );
}

function emptyStateLabel(
  status: AuraLiveScoreboardStatus
): string {
  if (status === 'connecting') return 'CONNECTING';
  if (status === 'unavailable') return 'UNAVAILABLE';
  return 'CONNECTION ERROR';
}

function formatAge(ageMs: number): string {
  if (ageMs < 1_000) return 'just now';
  if (ageMs < 60_000) return `${Math.floor(ageMs / 1_000)}s ago`;
  return `${Math.floor(ageMs / 60_000)}m ago`;
}

function scoreboardStatus(value: string, status: AuraLiveScoreboardStatus): string {
  if (status === 'final') return 'Final';
  if (status === 'replay') return 'Replay';
  if (status === 'live' || status === 'stale') {
    return /^(in_progress|live)$/i.test(value) ? 'Live' : value;
  }
  return value.replace(/_/g, ' ');
}
