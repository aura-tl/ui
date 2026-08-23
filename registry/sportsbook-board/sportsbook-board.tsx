'use client';
import * as React from 'react';
import { reconcileSportsbookSelections, type SportsbookGameModel, type SportsbookMarketModel, type SportsbookMarketType, type SportsbookModel, type SportsbookOutcomeModel, type SportsbookSelectionModel } from '@/lib/aura/sportsbook-types';

export interface SportsbookBoardProps {
  model: SportsbookModel;
  selections?: SportsbookSelectionModel[];
  onSelectionsChange?: (selections: SportsbookSelectionModel[]) => void;
}

type Phase = 'all' | 'in_progress' | 'scheduled';
type Movement = 'up' | 'down';

export function SportsbookBoard({ model, selections: controlledSelections, onSelectionsChange }: SportsbookBoardProps) {
  const [sport, setSport] = React.useState('all');
  const [phase, setPhase] = React.useState<Phase>('all');
  const [search, setSearch] = React.useState('');
  const [internalSelections, setInternalSelections] = React.useState<SportsbookSelectionModel[]>([]);
  const [movements, setMovements] = React.useState<Record<string, Movement>>({});
  const previousPrices = React.useRef<Record<string, number>>({});
  const selections = controlledSelections ?? internalSelections;

  React.useEffect(() => {
    const next = priceMap(model);
    const changed: Record<string, Movement> = {};
    for (const [id, price] of Object.entries(next)) {
      const previous = previousPrices.current[id];
      if (previous !== undefined && previous !== price) changed[id] = price > previous ? 'up' : 'down';
    }
    previousPrices.current = next;
    if (!Object.keys(changed).length) return;
    setMovements(changed);
    const timer = window.setTimeout(() => setMovements({}), 4_000);
    return () => window.clearTimeout(timer);
  }, [model]);

  React.useEffect(() => {
    if (!selections.length) return;
    const next = reconcileSportsbookSelections(model, selections);
    if (sameSelections(selections, next)) return;
    if (controlledSelections === undefined) setInternalSelections(next);
    onSelectionsChange?.(next);
  }, [model]);

  const filtered = React.useMemo(() => {
    const needle = search.trim().toLowerCase();
    return model.games.filter((game) => sport === 'all' || game.sport === sport)
      .filter((game) => phase === 'all' || game.phase === phase)
      .filter((game) => !needle || `${game.away.name} ${game.away.abbreviation} ${game.home.name} ${game.home.abbreviation} ${game.sport} ${game.league}`.toLowerCase().includes(needle));
  }, [model.games, sport, phase, search]);
  const sections = model.sports.flatMap((name) => {
    const games = filtered.filter((game) => game.sport === name);
    return games.length ? [{ name, games }] : [];
  });

  const updateSelections = (next: SportsbookSelectionModel[]) => {
    if (controlledSelections === undefined) setInternalSelections(next);
    onSelectionsChange?.(next);
  };
  const toggle = (game: SportsbookGameModel, market: SportsbookMarketModel, outcome: SportsbookOutcomeModel) => {
    if (outcome.price === null) return;
    const existing = selections.find((selection) => selection.id === outcome.id);
    const withoutMarket = selections.filter((selection) => selection.marketId !== market.id);
    updateSelections(existing ? withoutMarket : [...withoutMarket, {
      id: outcome.id,
      marketId: market.id,
      gameId: game.id,
      sport: game.sport,
      matchup: `${game.away.abbreviation} @ ${game.home.abbreviation}`,
      marketType: market.type,
      side: outcome.side,
      label: outcome.label,
      line: outcome.line,
      price: outcome.price,
    }]);
  };

  return <section className="aura-sportsbook" aria-label="Aura sportsbook market board">
    <header className="aura-sportsbook__hero">
      <div><span>Live market board</span><h2>Browse the whole board.</h2><p>{model.coverage.games} open games · {model.coverage.markets} retained markets · {model.coverage.sports} sports</p></div>
      <div className="aura-sportsbook__fresh"><i /><span>Auto-refreshing</span><small>{relativeTime(model.generatedAt)}</small></div>
    </header>

    <nav className="aura-sportsbook__sports" aria-label="Sports">
      <button type="button" aria-pressed={sport === 'all'} onClick={() => setSport('all')}>All sports <small>{model.coverage.games}</small></button>
      {model.sports.map((name) => <button key={name} type="button" aria-pressed={sport === name} onClick={() => setSport(name)}>{sportLabel(name)} <small>{model.games.filter((game) => game.sport === name).length}</small></button>)}
    </nav>

    <div className="aura-sportsbook__tools">
      <div role="group" aria-label="Game status">
        {([['all', 'All events'], ['in_progress', `Live ${model.coverage.liveGames}`], ['scheduled', 'Upcoming']] as const).map(([value, label]) => <button key={value} type="button" aria-pressed={phase === value} onClick={() => setPhase(value)}>{label}</button>)}
      </div>
      <label><span>Search teams or leagues</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search the board" /></label>
    </div>

    <p className="aura-sportsbook__notice">Showing {filtered.length} open games from current acquired coverage. Missing markets stay empty; prices and movement are never filled in.</p>

    <div className="aura-sportsbook__layout">
      <div className="aura-sportsbook__board">
        {sections.length ? sections.map((section) => <section className="aura-sportsbook__league" key={section.name}>
          <header><div><i>{sportGlyph(section.name)}</i><span><strong>{sportLabel(section.name)}</strong><small>{section.games.length} open game{section.games.length === 1 ? '' : 's'}</small></span></div><button type="button" onClick={() => setSport(section.name)}>View {sportLabel(section.name)}</button></header>
          <div className="aura-sportsbook__columns" aria-hidden="true"><span>Game</span><span>Moneyline</span><span>Spread</span><span>Total</span></div>
          <div>{section.games.map((game) => <GameRow key={game.id} game={game} selections={selections} movements={movements} onToggle={toggle} />)}</div>
        </section>) : <div className="aura-sportsbook__empty"><strong>No open markets match.</strong><span>Clear a filter or try another sport.</span></div>}
      </div>
      <SportsbookSlip selections={selections} onRemove={(id) => updateSelections(selections.filter((selection) => selection.id !== id))} onClear={() => updateSelections([])} />
    </div>
  </section>;
}

function GameRow({ game, selections, movements, onToggle }: { game: SportsbookGameModel; selections: SportsbookSelectionModel[]; movements: Record<string, Movement>; onToggle: (game: SportsbookGameModel, market: SportsbookMarketModel, outcome: SportsbookOutcomeModel) => void }) {
  return <article className="aura-sportsbook-game" data-live={game.phase === 'in_progress' || undefined}>
    <div className="aura-sportsbook-game__matchup">
      <time>{game.phase === 'in_progress' ? <><b>Live</b><span>{game.status}</span></> : shortTime(game.startsAt)}</time>
      <div><Team game={game} side="away" /><Team game={game} side="home" /></div>
    </div>
    {(['moneyline', 'spread', 'total'] as const).map((type) => <MarketCell key={type} game={game} type={type} market={game.markets[type]} selections={selections} movements={movements} onToggle={onToggle} />)}
  </article>;
}

function Team({ game, side }: { game: SportsbookGameModel; side: 'away' | 'home' }) {
  const team = game[side];
  return <span><i style={{ background: team.color || '#aaa49a' }}>{team.abbreviation.slice(0, 1)}</i><strong>{team.name}</strong><small>{team.abbreviation}</small>{game.phase === 'in_progress' ? <b>{team.score ?? '—'}</b> : null}</span>;
}

function MarketCell({ game, type, market, selections, movements, onToggle }: { game: SportsbookGameModel; type: SportsbookMarketType; market?: SportsbookMarketModel; selections: SportsbookSelectionModel[]; movements: Record<string, Movement>; onToggle: (game: SportsbookGameModel, market: SportsbookMarketModel, outcome: SportsbookOutcomeModel) => void }) {
  return <div className="aura-sportsbook-market" data-market={type}>
    <label>{marketLabel(type)}</label>
    {market ? market.outcomes.map((outcome) => {
      const active = selections.some((selection) => selection.id === outcome.id);
      const movement = movements[outcome.id];
      return <button key={outcome.id} type="button" aria-pressed={active} data-changed={movement || undefined} onClick={() => onToggle(game, market, outcome)}>
        <span>{outcome.label}{outcome.line === null ? '' : ` ${formatLine(outcome.line)}`}</span><strong>{formatPrice(outcome.price)}</strong>{movement ? <i>{movement === 'up' ? '↑' : '↓'}</i> : null}
      </button>;
    }) : <span className="aura-sportsbook-market__missing">Not retained</span>}
  </div>;
}

function SportsbookSlip({ selections, onRemove, onClear }: { selections: SportsbookSelectionModel[]; onRemove: (id: string) => void; onClear: () => void }) {
  return <aside className="aura-sportsbook-slip" data-empty={selections.length === 0 || undefined} aria-label="Bet slip selections">
    <header><div><span>Bet slip</span><strong>{selections.length ? `${selections.length} selection${selections.length === 1 ? '' : 's'}` : 'Your picks'}</strong></div>{selections.length ? <button type="button" onClick={onClear}>Clear</button> : null}</header>
    {selections.length ? <ol>{selections.map((selection) => <li key={selection.id}><div><small>{selection.sport} · {selection.matchup}</small><strong>{selection.label} {selection.line === null ? '' : formatLine(selection.line)}</strong><span>{marketLabel(selection.marketType)}</span></div><b>{formatPrice(selection.price)}</b><button type="button" aria-label={`Remove ${selection.label} ${selection.matchup}`} onClick={() => onRemove(selection.id)}>×</button></li>)}</ol> : <div className="aura-sportsbook-slip__empty"><b>Build your card.</b><span>Tap any retained price to add it here.</span></div>}
    <footer><span>{selections.length ? 'Combined decimal' : 'Selection state only'}</span><strong>{selections.length ? `${combinedMultiplier(selections)}×` : 'No wager placed'}</strong><small>Aura provides market data. Connect this state to your own product flow.</small></footer>
  </aside>;
}

function priceMap(model: SportsbookModel): Record<string, number> { return Object.fromEntries(model.games.flatMap((game) => Object.values(game.markets).flatMap((market) => market?.outcomes.flatMap((outcome) => outcome.price === null ? [] : [[outcome.id, outcome.price] as const]) || []))); }
function sameSelections(left: SportsbookSelectionModel[], right: SportsbookSelectionModel[]): boolean { return left.length === right.length && left.every((selection, index) => { const other = right[index]; return Boolean(other) && selection.id === other.id && selection.marketId === other.marketId && selection.gameId === other.gameId && selection.sport === other.sport && selection.matchup === other.matchup && selection.marketType === other.marketType && selection.side === other.side && selection.label === other.label && selection.line === other.line && selection.price === other.price; }); }
function combinedMultiplier(selections: SportsbookSelectionModel[]): string { return selections.reduce((total, selection) => total * (selection.price > 0 ? 1 + selection.price / 100 : 1 + 100 / Math.abs(selection.price)), 1).toFixed(2); }
function marketLabel(type: SportsbookMarketType): string { return type === 'moneyline' ? 'Moneyline' : type === 'spread' ? 'Spread' : 'Total'; }
function formatPrice(value: number | null): string { return value === null ? '—' : value > 0 ? `+${Math.round(value)}` : String(Math.round(value)); }
function formatLine(value: number): string { return value > 0 ? `+${value}` : String(value); }
function shortTime(value: number): string { return value ? new Intl.DateTimeFormat('en-US', { weekday: 'short', hour: 'numeric', minute: '2-digit' }).format(value) : 'TBD'; }
function relativeTime(value: number): string { if (!value) return 'Retained snapshot'; const seconds = Math.max(0, Math.round((Date.now() - value) / 1000)); return seconds < 10 ? 'Just now' : seconds < 60 ? `${seconds}s ago` : `${Math.floor(seconds / 60)}m ago`; }
function sportLabel(value: string): string { return value.includes('_') ? value.split('_').map((part) => part ? part[0] + part.slice(1).toLowerCase() : '').join(' ') : value; }
function sportGlyph(value: string): string { return value === 'MLB' ? '◆' : value === 'NFL' ? '⬟' : value === 'WNBA' || value === 'NBA' ? '●' : '◇'; }
