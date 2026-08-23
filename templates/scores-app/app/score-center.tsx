'use client';

import * as React from 'react';
import { listAuraGames, type AuraGame } from '../lib/aura';

const sports = ['MLB', 'WNBA', 'NFL'] as const;

export function ScoreCenter() {
  const [sport, setSport] = React.useState<(typeof sports)[number]>('MLB');
  const [date, setDate] = React.useState(() => calendarDate(new Date()));
  const [games, setGames] = React.useState<AuraGame[]>([]);
  const [status, setStatus] = React.useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let request: AbortController | undefined;

    const refresh = async () => {
      if (document.visibilityState !== 'visible') return;
      if (timer) {
        clearTimeout(timer);
        timer = undefined;
      }
      request?.abort();
      const controller = new AbortController();
      request = controller;
      try {
        const next = await listAuraGames(sport, date, controller.signal);
        if (!active) return;
        setGames(next);
        setStatus('ready');
        setError('');
        const delay = next.some((game) => game.phase === 'in_progress')
          ? 15_000
          : next.some((game) => game.phase === 'scheduled') ? 60_000 : 0;
        if (delay) timer = setTimeout(refresh, delay);
      } catch (reason) {
        if (!active || controller.signal.aborted) return;
        setStatus('error');
        setError(reason instanceof Error ? reason.message : 'Aura is unavailable.');
        timer = setTimeout(refresh, 30_000);
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === 'visible') void refresh();
      else {
        request?.abort();
        if (timer) {
          clearTimeout(timer);
          timer = undefined;
        }
      }
    };
    void refresh();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      active = false;
      request?.abort();
      if (timer) clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [sport, date]);

  const live = games.filter((game) => game.phase === 'in_progress').length;
  return (
    <section className="score-center">
      <header className="score-center__hero">
        <div><small>Powered by Aura</small><h1>Scores</h1></div>
        <span className={live ? 'is-live' : ''}>{live ? `${live} live` : 'Latest'}</span>
      </header>
      <nav className="score-center__sports" aria-label="Sports">
        {sports.map((value) => (
          <button key={value} aria-pressed={value === sport} onClick={() => setSport(value)}>{value}</button>
        ))}
      </nav>
      <div className="score-center__date">
        <button aria-label="Previous day" onClick={() => setDate(moveDate(date, -1))}>←</button>
        <strong>{formatDate(date)}</strong>
        <button aria-label="Next day" onClick={() => setDate(moveDate(date, 1))}>→</button>
      </div>
      <div className="score-center__games" aria-live="polite">
        {status === 'loading' && <Message>Loading the slate…</Message>}
        {status === 'error' && <Message>{error}</Message>}
        {status === 'ready' && games.length === 0 && <Message>No {sport} games on this date.</Message>}
        {status === 'ready' && games.map((game) => <GameRow key={game.gameId} game={game} />)}
      </div>
      <footer>REST polling pauses when this tab is hidden.</footer>
    </section>
  );
}

function GameRow({ game }: { game: AuraGame }) {
  return (
    <article className="game-row" data-phase={game.phase}>
      <div className="game-row__status"><strong>{gameStatus(game)}</strong><span>{game.league}</span></div>
      <div className="game-row__teams"><Team team={game.teams.away} /><Team team={game.teams.home} /></div>
      <time>{game.phase === 'scheduled' ? formatTime(game.startsAtMs) : game.phase === 'final' ? 'Final' : 'Live'}</time>
    </article>
  );
}

function Team({ team }: { team: AuraGame['teams']['away'] }) {
  return <div><strong>{team.abbreviation || '—'}</strong><span>{team.displayName || 'Team unavailable'}</span><b>{team.score ?? '—'}</b></div>;
}

function Message({ children }: { children: React.ReactNode }) {
  return <p className="score-center__message">{children}</p>;
}

function gameStatus(game: AuraGame) {
  return game.statusDetail || game.statusText || (game.phase === 'final' ? 'Final' : game.phase === 'in_progress' ? 'Live' : formatTime(game.startsAtMs));
}

function calendarDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function moveDate(value: string, days: number) {
  const date = new Date(`${value}T12:00:00`);
  date.setDate(date.getDate() + days);
  return calendarDate(date);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(new Date(`${value}T12:00:00`));
}

function formatTime(value: number) {
  return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(new Date(value));
}
