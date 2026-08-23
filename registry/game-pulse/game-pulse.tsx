'use client';

import * as React from 'react';
import {
  auraGamePulseValueAt,
  type AuraGamePulseControllerState,
  type AuraGamePulseModel,
  type AuraGamePulsePoint,
} from '@/lib/aura/game-pulse-types';

export interface AuraGamePulseProps {
  state: AuraGamePulseControllerState;
  className?: string;
}

export function AuraGamePulse({
  state,
  className = '',
}: AuraGamePulseProps) {
  if (!state.model) {
    return (
      <section
        className={`aura-copy-pulse is-${state.status} ${className}`}
        data-state={state.status}
      >
        <p className="aura-copy-pulse__empty">
          {state.status === 'connecting'
            ? 'Connecting to Aura game flow…'
            : state.status === 'unavailable'
              ? 'Game flow is unavailable for this game.'
              : state.error || 'Aura could not load this game.'}
        </p>
      </section>
    );
  }

  return (
    <PulseReady
      model={state.model}
      status={state.status}
      error={state.error}
      className={className}
    />
  );
}

function PulseReady({
  model,
  status,
  error,
  className,
}: {
  model: AuraGamePulseModel;
  status: AuraGamePulseControllerState['status'];
  error: string | null;
  className: string;
}) {
  const [cursor, setCursor] = React.useState(model.endAt);
  React.useEffect(() => setCursor(model.endAt), [model.id, model.endAt]);
  const homeProbability = auraGamePulseValueAt(
    model.probability.home,
    cursor,
    'linear'
  );
  const awayProbability = auraGamePulseValueAt(
    model.probability.away,
    cursor,
    'linear'
  );
  const margin = auraGamePulseValueAt(model.margin.points, cursor);
  const progress =
    ((cursor - model.startAt) /
      Math.max(1, model.endAt - model.startAt)) *
    100;

  return (
    <article
      className={`aura-copy-pulse is-${status} ${className}`}
      data-state={status}
      data-complete={model.complete}
      aria-label={`${model.scoreboard.away.name} at ${model.scoreboard.home.name} Game Pulse`}
    >
      <header className="aura-copy-pulse__header">
        <div>
          <span>AURA GAME PULSE</span>
          <h2>
            {model.scoreboard.away.abbreviation}{' '}
            <b>{model.scoreboard.away.score ?? '—'}</b>
            <i>at</i>
            {model.scoreboard.home.abbreviation}{' '}
            <b>{model.scoreboard.home.score ?? '—'}</b>
          </h2>
          <p>{model.scoreboard.status}</p>
        </div>
        <strong className="aura-copy-pulse__status">
          <i />
          {status === 'final'
            ? 'FINAL'
            : status === 'replay'
              ? 'REPLAY'
              : status.toUpperCase()}
        </strong>
      </header>

      <section className="aura-copy-pulse__probability">
        <header>
          <div style={{ color: model.scoreboard.away.color }}>
            <span>{model.scoreboard.away.abbreviation}</span>
            <strong>
              {awayProbability === null
                ? '—'
                : `${(awayProbability * 100).toFixed(1)}%`}
            </strong>
          </div>
          <p>
            WIN PROBABILITY
            <small>BOTH TEAMS · FIXED 50% MIDPOINT</small>
          </p>
          <div
            className="is-home"
            style={{ color: model.scoreboard.home.color }}
          >
            <span>{model.scoreboard.home.abbreviation}</span>
            <strong>
              {homeProbability === null
                ? '—'
                : `${(homeProbability * 100).toFixed(1)}%`}
            </strong>
          </div>
        </header>
        {model.probability.unavailable ? (
          <Unavailable>{model.probability.unavailable}</Unavailable>
        ) : (
          <ProbabilityChart model={model} cursor={cursor} />
        )}
      </section>

      <section className="aura-copy-pulse__flow">
        <header>
          <span>SCORE FLOW</span>
          <strong>
            {margin === null
              ? '—'
              : margin === 0
                ? 'TIED'
                : `${margin > 0 ? model.scoreboard.home.abbreviation : model.scoreboard.away.abbreviation} +${Math.abs(margin)}`}
          </strong>
        </header>
        {model.margin.unavailable ? (
          <Unavailable>{model.margin.unavailable}</Unavailable>
        ) : (
          <MarginChart model={model} cursor={cursor} />
        )}
      </section>

      {model.periods.length ? (
        <div className="aura-copy-pulse__periods" aria-label="Game periods">
          {model.periods.map((period) => (
            <button
              key={period.id}
              type="button"
              style={{
                width: `${((period.endAt - period.startAt) / Math.max(1, model.endAt - model.startAt)) * 100}%`,
              }}
              onClick={() => setCursor(period.startAt)}
            >
              {period.label}
            </button>
          ))}
        </div>
      ) : (
        <Unavailable>{model.periodUnavailable || 'Period history unavailable.'}</Unavailable>
      )}

      <div className="aura-copy-pulse__transport">
        <input
          type="range"
          aria-label="Synchronized game cursor"
          min={model.startAt}
          max={Math.max(model.startAt + 1, model.endAt)}
          value={cursor}
          onChange={(event) => setCursor(Number(event.currentTarget.value))}
          style={{ '--pulse-progress': `${progress}%` } as React.CSSProperties}
        />
        <div>
          <span>{formatElapsed(cursor - model.startAt)}</span>
          <strong>{Math.round(progress)}% THROUGH RETAINED GAME</strong>
          <button type="button" onClick={() => setCursor(model.endAt)}>
            {model.mode === 'live' ? 'NOW' : 'END'}
          </button>
        </div>
      </div>

      {(error || model.missing.length > 0) && (
        <footer>
          {error || `Unavailable: ${model.missing.join(', ')}`}
        </footer>
      )}
    </article>
  );
}

function ProbabilityChart({
  model,
  cursor,
}: {
  model: AuraGamePulseModel;
  cursor: number;
}) {
  const gradientId = `aura-pulse-pair-${React.useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const width = 1000;
  const height = 190;
  const x = xScale(model, width);
  const y = (value: number) => height - value * height;
  const cursorX = x(cursor);
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      role="img"
      aria-label="Both teams' win probability over retained game time"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop
            offset="0%"
            stopColor={model.scoreboard.home.color}
            stopOpacity=".34"
          />
          <stop offset="50%" stopColor="#ffffff" stopOpacity=".04" />
          <stop
            offset="100%"
            stopColor={model.scoreboard.away.color}
            stopOpacity=".34"
          />
        </linearGradient>
      </defs>
      <rect width={width} height={height} fill={`url(#${gradientId})`} />
      <line className="is-midpoint" x1="0" x2={width} y1={height / 2} y2={height / 2} />
      <path
        d={path(model.probability.away, x, y, 'linear')}
        stroke={model.scoreboard.away.color}
      />
      <path
        d={path(model.probability.home, x, y, 'linear')}
        stroke={model.scoreboard.home.color}
      />
      <line className="is-cursor" x1={cursorX} x2={cursorX} y1="0" y2={height} />
    </svg>
  );
}

function MarginChart({
  model,
  cursor,
}: {
  model: AuraGamePulseModel;
  cursor: number;
}) {
  const width = 1000;
  const height = 110;
  const x = xScale(model, width);
  const magnitude = Math.max(
    1,
    ...model.margin.points.map((point) => Math.abs(point.value))
  );
  const y = (value: number) =>
    height / 2 - (value / magnitude) * (height / 2 - 5);
  const cursorX = x(cursor);
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      role="img"
      aria-label={`Score margin over retained game time in ${model.margin.unit}`}
    >
      <line className="is-midpoint" x1="0" x2={width} y1={height / 2} y2={height / 2} />
      <path
        d={path(model.margin.points, x, y, 'step')}
        stroke="currentColor"
      />
      <line className="is-cursor" x1={cursorX} x2={cursorX} y1="0" y2={height} />
    </svg>
  );
}

function Unavailable({ children }: { children: React.ReactNode }) {
  return <p className="aura-copy-pulse__unavailable">{children}</p>;
}

function xScale(model: AuraGamePulseModel, width: number) {
  return (observedAt: number) =>
    ((observedAt - model.startAt) /
      Math.max(1, model.endAt - model.startAt)) *
    width;
}

function path(
  points: AuraGamePulsePoint[],
  x: (observedAt: number) => number,
  y: (value: number) => number,
  interpolation: 'linear' | 'step'
) {
  return points
    .flatMap((point, index) => {
      const next = `${x(point.observedAt).toFixed(1)} ${y(point.value).toFixed(1)}`;
      if (index === 0) return [`M ${next}`];
      return [
        interpolation === 'step'
          ? `H ${x(point.observedAt).toFixed(1)} V ${y(point.value).toFixed(1)}`
          : `L ${next}`,
      ];
    })
    .join(' ');
}

function formatElapsed(duration: number) {
  const totalSeconds = Math.max(0, Math.round(duration / 1_000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}
