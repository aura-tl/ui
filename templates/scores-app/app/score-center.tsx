'use client';

import * as React from 'react';
import {
  getAuraGameDetail,
  listAuraGames,
  type AuraBoxScore,
  type AuraBoxScorePlayer,
  type AuraGame,
  type AuraGameDetail,
  type AuraOdds,
  type AuraPlay,
  type AuraProps,
} from '../lib/aura';

const sports = ['MLB', 'WNBA', 'NFL'] as const;
const phaseOrder: Record<string, number> = { in_progress: 0, scheduled: 1, final: 2 };

export function ScoreCenter() {
  const [sport, setSport] = React.useState<(typeof sports)[number]>('MLB');
  const [date, setDate] = React.useState(() => calendarDate(new Date()));
  const [games, setGames] = React.useState<AuraGame[]>([]);
  const [selectedGameId, setSelectedGameId] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = React.useState('');
  const [updatedAt, setUpdatedAt] = React.useState<number | null>(null);
  const [changed, setChanged] = React.useState<Set<string>>(new Set());
  const previousGames = React.useRef<Map<string, string>>(new Map());

  React.useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let changeTimer: ReturnType<typeof setTimeout> | undefined;
    let request: AbortController | undefined;

    const refresh = async () => {
      if (document.visibilityState !== 'visible') return;
      if (timer) clearTimeout(timer);
      request?.abort();
      const controller = new AbortController();
      request = controller;
      try {
        const next = sortGames(await listAuraGames(sport, date, controller.signal));
        if (!active) return;
        const nextChanged = changedGameIds(previousGames.current, next);
        previousGames.current = new Map(next.map((game) => [game.gameId, gameFingerprint(game)]));
        setGames(next);
        setChanged(nextChanged);
        setUpdatedAt(Date.now());
        setStatus('ready');
        setError('');
        if (changeTimer) clearTimeout(changeTimer);
        if (nextChanged.size) changeTimer = setTimeout(() => setChanged(new Set()), 1_600);
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
        if (timer) clearTimeout(timer);
      }
    };
    previousGames.current = new Map();
    setSelectedGameId(null);
    void refresh();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      active = false;
      request?.abort();
      if (timer) clearTimeout(timer);
      if (changeTimer) clearTimeout(changeTimer);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [sport, date]);

  const selectedGame = games.find((game) => game.gameId === selectedGameId) || null;
  const live = games.filter((game) => game.phase === 'in_progress').length;
  return (
    <section className="score-center">
      {selectedGame ? (
        <GameDetail game={selectedGame} changed={changed.has(selectedGame.gameId)} onBack={() => setSelectedGameId(null)} />
      ) : (
        <>
          <header className="score-center__hero">
            <div><small>Live sports</small><h1>Scores</h1></div>
            <span className={live ? 'is-live' : ''}>{live ? `${live} live` : 'Latest'}</span>
          </header>
          <nav className="score-center__sports" aria-label="Sports">
            {sports.map((value) => (
              <button key={value} aria-pressed={value === sport} onClick={() => setSport(value)}>{value}</button>
            ))}
          </nav>
          <div className="score-center__date">
            <button aria-label="Previous day" onClick={() => setDate(moveDate(date, -1))}>←</button>
            <strong suppressHydrationWarning>{formatDate(date)}</strong>
            <button aria-label="Next day" onClick={() => setDate(moveDate(date, 1))}>→</button>
          </div>
          <div className="score-center__games" aria-live="polite">
            {status === 'loading' && <Message>Loading the slate…</Message>}
            {status === 'error' && <Message>{error}</Message>}
            {status === 'ready' && games.length === 0 && <Message>No {sport} games on this date.</Message>}
            {status === 'ready' && games.map((game) => (
              <GameRow key={game.gameId} game={game} changed={changed.has(game.gameId)} onOpen={() => setSelectedGameId(game.gameId)} />
            ))}
          </div>
          <footer>{updatedAt ? `Updated ${formatClock(updatedAt)} · ` : ''}REST polling pauses when this tab is hidden.</footer>
        </>
      )}
    </section>
  );
}

function GameRow({ game, changed, onOpen }: { game: AuraGame; changed: boolean; onOpen: () => void }) {
  return (
    <button className={`game-row ${changed ? 'is-updated' : ''}`} data-phase={game.phase} onClick={onOpen}>
      <div className="game-row__status"><strong>{gameStatus(game)}</strong><span>{game.league}</span></div>
      <div className="game-row__teams"><Team team={game.teams.away} /><Team team={game.teams.home} /></div>
      <time>{game.phase === 'scheduled' ? formatTime(game.startsAtMs) : game.phase === 'final' ? 'Final' : 'Live'}</time>
      <span className="game-row__open" aria-hidden="true">›</span>
    </button>
  );
}

function GameDetail({ game, changed, onBack }: { game: AuraGame; changed: boolean; onBack: () => void }) {
  const [detail, setDetail] = React.useState<AuraGameDetail | null>(null);
  const [status, setStatus] = React.useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = React.useState('');
  const [tab, setTab] = React.useState<'plays' | 'boxscore' | 'markets'>('plays');
  const [updatedAt, setUpdatedAt] = React.useState<number | null>(null);
  const [pulse, setPulse] = React.useState(false);
  const previousFingerprints = React.useRef<Record<string, string>>({});

  React.useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let pulseTimer: ReturnType<typeof setTimeout> | undefined;
    let request: AbortController | undefined;
    const refresh = async () => {
      if (document.visibilityState !== 'visible') return;
      if (timer) clearTimeout(timer);
      request?.abort();
      const controller = new AbortController();
      request = controller;
      try {
        const next = await getAuraGameDetail(game.gameId, tab, controller.signal);
        if (!active) return;
        const fingerprint = detailFingerprint(next, tab);
        const previous = previousFingerprints.current[tab];
        if (previous && previous !== fingerprint) {
          setPulse(true);
          if (pulseTimer) clearTimeout(pulseTimer);
          pulseTimer = setTimeout(() => setPulse(false), 1_600);
        }
        previousFingerprints.current[tab] = fingerprint;
        setDetail((current) => ({ ...current, ...next }));
        setUpdatedAt(Date.now());
        setStatus('ready');
        setError('');
        if (game.phase === 'in_progress') timer = setTimeout(refresh, tab === 'boxscore' ? 30_000 : 15_000);
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
        if (timer) clearTimeout(timer);
      }
    };
    setStatus('loading');
    void refresh();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      active = false;
      request?.abort();
      if (timer) clearTimeout(timer);
      if (pulseTimer) clearTimeout(pulseTimer);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [game.gameId, game.phase, tab]);

  const plays = detail?.plays?.items || [];
  return (
    <section className={`game-detail ${changed || pulse ? 'is-updated' : ''}`}>
      <header className="game-detail__header">
        <button onClick={onBack}>← Scores</button>
        <span className={game.phase === 'in_progress' ? 'is-live' : ''}>{gameStatus(game)}</span>
      </header>
      <div className="game-detail__score">
        <DetailTeam team={game.teams.away} />
        <div><strong>{game.teams.away.score ?? '—'}<i>–</i>{game.teams.home.score ?? '—'}</strong><small>{game.league}</small></div>
        <DetailTeam team={game.teams.home} home />
      </div>
      <nav className="game-detail__tabs" aria-label="Game detail">
        <button aria-pressed={tab === 'plays'} onClick={() => setTab('plays')}>Plays <b>{plays.length || ''}</b></button>
        <button aria-pressed={tab === 'boxscore'} onClick={() => setTab('boxscore')}>Box score</button>
        <button aria-pressed={tab === 'markets'} onClick={() => setTab('markets')}>Markets</button>
      </nav>
      <div className="game-detail__body" aria-live="polite">
        {status === 'loading' && <Message>Loading the game story…</Message>}
        {status === 'error' && <Message>{error}</Message>}
        {status === 'ready' && tab === 'plays' && <Plays plays={plays} />}
        {status === 'ready' && tab === 'boxscore' && <BoxScore boxscore={detail?.boxscore || null} />}
        {status === 'ready' && tab === 'markets' && <Markets odds={detail?.odds || null} props={detail?.props || null} game={game} />}
      </div>
      <footer>{updatedAt ? `Updated ${formatClock(updatedAt)}` : 'Loading'}{game.phase === 'in_progress' ? ` · Live REST every ${tab === 'boxscore' ? 30 : 15} seconds` : ''}</footer>
    </section>
  );
}

function Plays({ plays }: { plays: AuraPlay[] }) {
  if (!plays.length) return <Message>No play archive is available for this game yet.</Message>;
  return <ol className="play-list">{plays.slice(0, 24).map((play, index) => (
    <li key={play.id} className={`${play.scoringPlay ? 'is-scoring' : ''} ${index === 0 ? 'is-latest' : ''}`}>
      <div><strong>{play.inning || (play.period ? `Period ${play.period}` : play.type || 'Play')}</strong><span>{play.clock || ''}</span></div>
      <p>{play.text || play.type || 'Play recorded'}</p>
      {(play.awayScore !== undefined || play.homeScore !== undefined) && <b>{play.awayScore ?? '—'}–{play.homeScore ?? '—'}</b>}
    </li>
  ))}</ol>;
}

function BoxScore({ boxscore }: { boxscore: AuraBoxScore | null }) {
  const tables = boxScoreTables(boxscore);
  if (!tables.length) return <Message>No box score is available for this game yet.</Message>;
  return <div className="boxscore">{tables.map((table, tableIndex) => (
      <section key={`${table.team}:${table.kind}:${tableIndex}`}>
        <header><strong>{table.team}</strong><span>{table.kind}</span></header>
        <div role="table">
          <div role="row" className="boxscore__head"><span>Player</span>{table.columns.map((column) => <b key={column}>{column}</b>)}</div>
          {table.rows.slice(0, 12).map((player, index) => (
            <div role="row" key={`${player.name}:${index}`}>
              <span><strong>{player.name}</strong><small>{player.position}</small></span>
              {player.values.map((value, valueIndex) => <b key={valueIndex}>{value ?? '—'}</b>)}
            </div>
          ))}
        </div>
      </section>
  ))}</div>;
}

function Markets({ odds, props, game }: { odds: AuraOdds | null; props: AuraProps | null; game: AuraGame }) {
  const prices = odds?.consensus?.prices || {};
  const probabilities = odds?.consensus?.probabilities || {};
  const propRows = props?.props || [];
  return (
    <div className="markets">
      <section>
        <header><div><small>Current market</small><strong>Moneyline consensus</strong></div><span>{odds ? `${odds.sourceCount || 0} source${odds.sourceCount === 1 ? '' : 's'}` : 'Unavailable'}</span></header>
        {odds ? <div className="market-prices"><MarketSide team={game.teams.away} price={prices.away} probability={probabilities.away} /><MarketSide team={game.teams.home} price={prices.home} probability={probabilities.home} /></div> : <p>No retained moneyline is available for this game.</p>}
      </section>
      <section>
        <header><div><small>Player markets</small><strong>Available props</strong></div><span>{propRows.length || 'None'}</span></header>
        {propRows.length ? <div className="prop-list">{propRows.slice(0, 8).map((prop, index) => <article key={prop.id || index}><div><strong>{prop.player?.displayName || prop.player?.name || 'Player'}</strong><span>{prop.definition?.displayName || prop.definition?.label || 'Player prop'}</span></div><b>{prop.line ?? '—'}</b></article>)}</div> : <p>No player props are retained for this game right now.</p>}
      </section>
    </div>
  );
}

function MarketSide({ team, price, probability }: { team: AuraGame['teams']['away']; price?: number; probability?: number }) {
  return <article><span>{team.abbreviation || team.displayName || 'Team'}</span><strong>{formatPrice(price)}</strong><small>{probability === undefined ? '—' : `${Math.round(probability * 100)}%`}</small></article>;
}

function DetailTeam({ team, home = false }: { team: AuraGame['teams']['away']; home?: boolean }) {
  return <section className={home ? 'is-home' : ''}><i>{team.abbreviation?.slice(0, 1) || '—'}</i><strong>{team.abbreviation || '—'}</strong><span>{team.displayName || 'Team unavailable'}</span></section>;
}

function Team({ team }: { team: AuraGame['teams']['away'] }) {
  return <div><strong>{team.abbreviation || '—'}</strong><span>{team.displayName || 'Team unavailable'}</span><b>{team.score ?? '—'}</b></div>;
}

function Message({ children }: { children: React.ReactNode }) {
  return <p className="score-center__message">{children}</p>;
}

function sortGames(games: AuraGame[]) {
  return [...games].sort((left, right) => (phaseOrder[left.phase] ?? 3) - (phaseOrder[right.phase] ?? 3) || left.startsAtMs - right.startsAtMs);
}

function changedGameIds(previous: Map<string, string>, games: AuraGame[]) {
  const changed = new Set<string>();
  for (const game of games) {
    const before = previous.get(game.gameId);
    if (before && before !== gameFingerprint(game)) changed.add(game.gameId);
  }
  return changed;
}

function gameFingerprint(game: AuraGame) {
  return [game.phase, game.statusText, game.statusDetail, game.teams.away.score, game.teams.home.score].join(':');
}

function detailFingerprint(detail: AuraGameDetail, tab: 'plays' | 'boxscore' | 'markets') {
  if (tab === 'plays') return detail.plays?.items[0]?.id || '';
  if (tab === 'boxscore') return String(detail.boxscore?.observedAt || '');
  return JSON.stringify({
    odds: detail.odds?.consensus,
    props: detail.props?.props?.map((prop) => [prop.id, prop.line, prop.outcomes]),
  });
}

function usefulColumns(labels: string[]) {
  const preferred = ['AB', 'R', 'H', 'RBI', 'HR', 'BB', 'K', 'IP', 'ER'];
  const selected = preferred.flatMap((label) => {
    const index = labels.indexOf(label);
    return index === -1 ? [] : [{ index, label }];
  });
  if (selected.length) return selected.slice(0, 6);
  return labels.slice(0, 6).map((label, index) => ({ index, label }));
}

type BoxTable = {
  team: string;
  kind: string;
  columns: string[];
  rows: Array<{ name: string; position: string; values: Array<string | number | undefined> }>;
};

function boxScoreTables(boxscore: AuraBoxScore | null): BoxTable[] {
  const retainedTeams = boxscore?.teams?.[0];
  if (retainedTeams?.away || retainedTeams?.home) {
    return [retainedTeams.away, retainedTeams.home].flatMap((team) => {
      if (!team) return [];
      const players = Object.values(team.players || {});
      return [
        retainedPlayerTable(team.team?.name || 'Away', 'Batting', players, [
          ['AB', 'atBats'], ['R', 'runs'], ['H', 'hits'], ['RBI', 'rbi'], ['BB', 'baseOnBalls'], ['K', 'strikeOuts'],
        ]),
        retainedPlayerTable(team.team?.name || 'Home', 'Pitching', players, [
          ['IP', 'inningsPitched'], ['H', 'hits'], ['R', 'runs'], ['ER', 'earnedRuns'], ['BB', 'baseOnBalls'], ['K', 'strikeOuts'],
        ]),
      ].filter((table): table is BoxTable => Boolean(table));
    });
  }
  return (boxscore?.players || []).flatMap((group) => (group.statistics || []).flatMap((table) => {
    const labels = table?.labels || table?.names || [];
    const columns = usefulColumns(labels);
    const rows = (table?.athletes || []).filter((player) => player.athlete?.displayName).map((player) => ({
      name: player.athlete?.shortName || player.athlete?.displayName || 'Player',
      position: player.position?.abbreviation || '',
      values: columns.map((column) => player.stats?.[column.index]),
    }));
    if (!rows.length) return [];
    return [{
      team: group.team?.displayName || group.team?.abbreviation || 'Team',
      kind: table?.type || table?.name || table?.text || 'Players',
      columns: columns.map((column) => column.label),
      rows,
    }];
  }));
}

function retainedPlayerTable(
  team: string,
  kind: 'Batting' | 'Pitching',
  players: AuraBoxScorePlayer[],
  columns: Array<[string, string]>
): BoxTable | null {
  const statKey = kind === 'Batting' ? 'batting' : 'pitching';
  const rows = players
    .filter((player) => Object.keys(player.stats?.[statKey] || {}).length > 0)
    .sort((left, right) => Number(left.battingOrder || '9999') - Number(right.battingOrder || '9999'))
    .map((player) => ({
      name: player.person?.fullName || 'Player',
      position: player.position?.abbreviation || '',
      values: columns.map(([, key]) => player.stats?.[statKey]?.[key]),
    }));
  return rows.length ? { team, kind, columns: columns.map(([label]) => label), rows } : null;
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

function formatClock(value: number) {
  return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' }).format(new Date(value));
}

function formatPrice(value?: number) {
  if (value === undefined) return '—';
  return value > 0 ? `+${Math.round(value)}` : String(Math.round(value));
}
