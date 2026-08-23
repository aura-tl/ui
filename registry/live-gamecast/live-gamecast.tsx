'use client';

import * as React from 'react';
import {
  auraGamecastFrameAt,
  type AuraGamecastControllerState,
  type AuraGamecastFrame,
  type AuraGamecastModel,
} from '@/lib/aura/live-gamecast-types';

export interface AuraLiveGamecastProps {
  state: AuraGamecastControllerState;
  autoplay?: boolean;
  intervalMs?: number;
}

export function AuraLiveGamecast({
  state,
  autoplay = true,
  intervalMs = 2_400,
}: AuraLiveGamecastProps) {
  if (!state.model) {
    return (
      <article
        className="aura-gamecast aura-gamecast-empty"
        data-state={state.status}
        aria-live="polite"
      >
        <span>AURA / GAMECAST</span>
        <strong>
          {state.status === 'connecting'
            ? 'Connecting to the game…'
            : state.status === 'unavailable'
              ? 'Gamecast is not available yet.'
              : 'Gamecast could not load.'}
        </strong>
        {state.error ? <small>{state.error}</small> : null}
      </article>
    );
  }
  return (
    <AuraGamecast
      model={state.model}
      autoplay={autoplay}
      intervalMs={intervalMs}
      connectionState={state.status}
    />
  );
}

export interface AuraGamecastProps {
  model: AuraGamecastModel;
  autoplay?: boolean;
  intervalMs?: number;
  connectionState?: AuraGamecastControllerState['status'];
}

export function AuraGamecast({
  model,
  autoplay = true,
  intervalMs = 2_400,
  connectionState,
}: AuraGamecastProps) {
  const [frameIndex, setFrameIndex] = React.useState(
    model.mode === 'live' ? Math.max(0, model.frames.length - 1) : 0
  );
  const [playing, setPlaying] = React.useState(autoplay);

  React.useEffect(() => {
    setFrameIndex(
      model.mode === 'live' ? Math.max(0, model.frames.length - 1) : 0
    );
    setPlaying(autoplay);
  }, [model.id, model.mode, autoplay]);

  React.useEffect(() => {
    if (model.mode === 'live' && playing) {
      setFrameIndex(Math.max(0, model.frames.length - 1));
    }
  }, [model.mode, model.frames.length, playing]);

  React.useEffect(() => {
    if (!playing || model.mode === 'live' || model.frames.length < 2) {
      return;
    }
    const timer = window.setInterval(() => {
      setFrameIndex((current) =>
        current >= model.frames.length - 1 ? 0 : current + 1
      );
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [playing, intervalMs, model.mode, model.frames.length]);

  const frame = auraGamecastFrameAt(model, frameIndex);
  const progress =
    model.frames.length < 2
      ? 100
      : (frameIndex / (model.frames.length - 1)) * 100;

  return (
    <article
      className={`aura-gamecast is-${frame.state.surface}`}
      aria-label={`${frame.scoreboard.away.name} at ${frame.scoreboard.home.name} gamecast`}
      data-mode={model.mode}
      data-state={connectionState || model.mode}
    >
      <Scoreboard frame={frame} />

      <div className="aura-gamecast-stage">
        <section
          className="aura-gamecast-surface"
          aria-label={`${frame.state.surface} play location`}
        >
          <SportSurface frame={frame} />
          <div
            key={`marker:${frame.cursor}`}
            className={`aura-gamecast-marker ${
              frame.changes.position ? 'is-changed' : ''
            }`}
            style={
              frame.state.coordinates
                ? {
                    left: `${frame.state.coordinates.x}%`,
                    top: `${frame.state.coordinates.y}%`,
                  }
                : undefined
            }
            data-has-coordinates={Boolean(frame.state.coordinates)}
            aria-hidden="true"
          >
            <i />
            <span>{frame.play.scoring ? 'SCORE' : 'PLAY'}</span>
          </div>
          <div className="aura-gamecast-surface-meta">
            <span>{frame.state.label}</span>
            <strong>{frame.play.type.replace(/_/g, ' ')}</strong>
          </div>
        </section>

        <section className="aura-gamecast-callout" aria-live="polite">
          <span className="aura-gamecast-eyebrow">
            LATEST PLAY / {String(frame.play.sequence).padStart(3, '0')}
          </span>
          <p key={`play:${frame.cursor}`}>{frame.play.text}</p>
          <FeaturedPlayer frame={frame} />
        </section>
      </div>

      <footer className="aura-gamecast-transport">
        <button
          type="button"
          onClick={() => setPlaying((value) => !value)}
          aria-label={
            playing
              ? model.mode === 'live'
                ? 'Pause live follow'
                : 'Pause replay'
              : model.mode === 'live'
                ? 'Resume live follow'
                : 'Play replay'
          }
        >
          {playing ? (model.mode === 'live' ? '●' : 'Ⅱ') : '▶'}
        </button>
        <button
          type="button"
          onClick={() =>
            setFrameIndex((value) => Math.max(0, value - 1))
          }
          aria-label="Previous play"
        >
          ←
        </button>
        <input
          type="range"
          min="0"
          max={Math.max(0, model.frames.length - 1)}
          value={frameIndex}
          onChange={(event) => {
            setFrameIndex(Number(event.currentTarget.value));
            setPlaying(false);
          }}
          aria-label="Play-by-play cursor"
          style={
            {
              '--aura-gamecast-progress': `${progress}%`,
            } as React.CSSProperties
          }
        />
        <button
          type="button"
          onClick={() =>
            setFrameIndex((value) =>
              Math.min(model.frames.length - 1, value + 1)
            )
          }
          aria-label="Next play"
        >
          →
        </button>
        <div>
          <strong>
            {frameIndex + 1} / {model.frames.length}
          </strong>
          <span>
            {formatAge(frame.freshness.ageMs)} ·{' '}
            {frame.freshness.complete
              ? 'COMPLETE FRAME'
              : `MISSING ${frame.freshness.missing.join(', ')}`}
          </span>
        </div>
      </footer>
    </article>
  );
}

function Scoreboard({ frame }: { frame: AuraGamecastFrame }) {
  return (
    <header className="aura-gamecast-scoreboard">
      <div className="aura-gamecast-brand">
        <span>AURA</span>
        <strong>GAMECAST</strong>
        <small
          className={
            frame.scoreboard.phase === 'in_progress' ? 'is-live' : ''
          }
        >
          {frame.scoreboard.phase === 'in_progress'
            ? 'LIVE'
            : frame.scoreboard.phase.toUpperCase()}
        </small>
      </div>
      <Team score={frame.play.awayScore} team={frame.scoreboard.away} />
      <div className="aura-gamecast-state">
        <strong>{frame.scoreboard.status}</strong>
        <span>
          {new Date(frame.observedAt).toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit',
            second: '2-digit',
          })}
        </span>
      </div>
      <Team
        score={frame.play.homeScore}
        team={frame.scoreboard.home}
        home
      />
    </header>
  );
}

function Team({
  team,
  score,
  home = false,
}: {
  team: AuraGamecastFrame['scoreboard']['home'];
  score: number;
  home?: boolean;
}) {
  return (
    <section className={`aura-gamecast-team ${home ? 'is-home' : ''}`}>
      <i style={{ background: team.color }} />
      <div>
        <span>{home ? 'HOME' : 'AWAY'}</span>
        <strong>{team.abbreviation}</strong>
      </div>
      <b>{score}</b>
    </section>
  );
}

function FeaturedPlayer({ frame }: { frame: AuraGamecastFrame }) {
  const player = frame.featuredPlayer;
  if (!player) {
    return (
      <div className="aura-gamecast-player is-missing">
        <span>PLAYER IDENTITY PENDING</span>
      </div>
    );
  }
  return (
    <div
      key={`player:${frame.cursor}`}
      className="aura-gamecast-player"
      data-player-id={player.id}
    >
      <div className="aura-gamecast-headshot">
        {player.headshotUrl ? (
          <img src={player.headshotUrl} alt="" />
        ) : (
          <span aria-hidden="true">{initials(player.name)}</span>
        )}
      </div>
      <div className="aura-gamecast-player-name">
        <span>
          {[player.team, player.role].filter(Boolean).join(' · ') ||
            'FEATURED PLAYER'}
        </span>
        <strong>{player.name}</strong>
        <small>
          {player.statsAsOf
            ? `${
                player.statsMode === 'at_frame'
                  ? 'GAME LINE'
                  : 'LATEST RETAINED LINE'
              } AS OF ${new Date(player.statsAsOf).toLocaleTimeString([], {
                hour: 'numeric',
                minute: '2-digit',
              })}`
            : 'GAME LINE'}
        </small>
      </div>
      <div className="aura-gamecast-player-stats">
        {player.stats.length ? (
          player.stats.map((stat) => (
            <div
              key={stat.key}
              className={stat.delta ? 'is-changed' : ''}
            >
              <span>
                {stat.label}
                {stat.delta ? <em>{stat.delta}</em> : null}
              </span>
              <strong>{stat.value}</strong>
            </div>
          ))
        ) : (
          <div>
            <span>LINE</span>
            <strong>—</strong>
          </div>
        )}
      </div>
    </div>
  );
}

function SportSurface({ frame }: { frame: AuraGamecastFrame }) {
  if (frame.state.surface === 'court') {
    return (
      <svg viewBox="0 0 940 500" role="img" aria-label="Basketball court">
        <rect x="10" y="10" width="920" height="480" rx="6" />
        <line x1="470" y1="10" x2="470" y2="490" />
        <circle cx="470" cy="250" r="62" />
        <path d="M 10 90 H 180 V 410 H 10 M 930 90 H 760 V 410 H 930" />
        <path d="M 10 48 A 205 205 0 0 1 10 452 M 930 48 A 205 205 0 0 0 930 452" />
        <circle cx="180" cy="250" r="62" />
        <circle cx="760" cy="250" r="62" />
      </svg>
    );
  }
  if (frame.state.surface === 'diamond') {
    return (
      <svg viewBox="0 0 940 500" role="img" aria-label="Baseball diamond">
        <path d="M470 462 L230 250 L470 38 L710 250 Z" />
        <path d="M470 462 L470 250 L230 250 M470 250 L470 38 M470 250 L710 250" />
        <circle cx="470" cy="250" r="16" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 940 500" role="img" aria-label="Playing field">
      <rect x="10" y="10" width="920" height="480" rx="6" />
      {Array.from({ length: 9 }, (_, index) => (
        <line
          key={index}
          x1={104 + index * 91}
          y1="10"
          x2={104 + index * 91}
          y2="490"
        />
      ))}
    </svg>
  );
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function formatAge(ageMs: number): string {
  if (ageMs < 60_000) return `${Math.floor(ageMs / 1_000)}S OLD`;
  if (ageMs < 3_600_000) {
    return `${Math.floor(ageMs / 60_000)}M OLD`;
  }
  return 'RETAINED REPLAY';
}
