'use client';
import * as React from 'react';
import type {
  PlayerPropModel,
  PlayerPropSide,
  PropBoardCardModel,
  PropSlateModel,
} from '@/lib/aura/prop-board-types';

export interface PropBoardPick {
  key: string;
  cardId: string;
  propId: string;
  side: PlayerPropSide;
  playerName: string;
  label: string;
  line: number | null;
  price: number;
  priceLabel: string;
  gameLabel: string;
}

export interface PropBoardProps {
  model: PropSlateModel;
  picks?: PropBoardPick[];
  onPicksChange?: (picks: PropBoardPick[]) => void;
  onPick?: (pick: PropBoardPick) => void;
}

type Sort = 'start' | 'player' | 'line' | 'price';

export function PropBoard({ model, picks: controlledPicks, onPicksChange, onPick }: PropBoardProps) {
  const [sport, setSport] = React.useState('all');
  const [game, setGame] = React.useState('all');
  const [category, setCategory] = React.useState('all');
  const [search, setSearch] = React.useState('');
  const [sort, setSort] = React.useState<Sort>('start');
  const [visible, setVisible] = React.useState(48);
  const [internalPicks, setInternalPicks] = React.useState<PropBoardPick[]>([]);
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set());
  const [failedImages, setFailedImages] = React.useState<Set<string>>(new Set());
  const [changed, setChanged] = React.useState<Set<string>>(new Set());
  const signatures = React.useRef<Map<string, string>>(new Map());
  const picks = controlledPicks ?? internalPicks;
  const livePicks = React.useMemo(() => {
    const props = new Map(model.cards.map((card) => [card.prop.id, card.prop]));
    return picks.map((pick) => {
      const prop = props.get(pick.propId);
      const outcome = prop?.outcomes.find((entry) => entry.side === pick.side);
      return prop && outcome
        ? { ...pick, line: prop.line, price: outcome.price, priceLabel: outcome.priceLabel }
        : pick;
    });
  }, [model.cards, picks]);

  React.useEffect(() => {
    const next = new Map(model.cards.map((card) => [card.id, cardSignature(card)]));
    const moved = model.cards
      .filter((card) => signatures.current.has(card.id) && signatures.current.get(card.id) !== next.get(card.id))
      .map((card) => card.id);
    signatures.current = next;
    if (moved.length === 0) return;
    setChanged(new Set(moved));
    const timer = window.setTimeout(() => setChanged(new Set()), 1600);
    return () => window.clearTimeout(timer);
  }, [model]);

  React.useEffect(() => setVisible(48), [sport, game, category, search, sort]);

  const games = React.useMemo(() => {
    const values = new Map<string, { id: string; label: string; startsAt: number }>();
    for (const card of model.cards) {
      if (sport !== 'all' && card.sport !== sport) continue;
      values.set(card.gameId, { id: card.gameId, label: card.gameLabel, startsAt: card.startsAt });
    }
    return [...values.values()].sort((left, right) => left.startsAt - right.startsAt || left.label.localeCompare(right.label));
  }, [model.cards, sport]);

  React.useEffect(() => {
    if (game !== 'all' && !games.some((option) => option.id === game)) setGame('all');
  }, [game, games]);

  const categories = React.useMemo(() => {
    const values = new Set<string>();
    for (const card of model.cards) if (sport === 'all' || card.sport === sport) values.add(card.prop.category);
    return [...values].sort();
  }, [model.cards, sport]);

  React.useEffect(() => {
    if (category !== 'all' && !categories.includes(category)) setCategory('all');
  }, [categories, category]);

  const filtered = React.useMemo(() => {
    const needle = search.trim().toLowerCase();
    const cards = model.cards.filter((card) => {
      if (sport !== 'all' && card.sport !== sport) return false;
      if (game !== 'all' && card.gameId !== game) return false;
      if (category !== 'all' && card.prop.category !== category) return false;
      return !needle || `${card.playerName} ${card.team} ${card.gameLabel} ${card.prop.label}`.toLowerCase().includes(needle);
    });
    return cards.sort((left, right) => sortCards(left, right, sort));
  }, [model.cards, sport, game, category, search, sort]);

  const updatePicks = (next: PropBoardPick[]) => {
    if (controlledPicks === undefined) setInternalPicks(next);
    onPicksChange?.(next);
  };

  const select = (card: PropBoardCardModel, outcome: PlayerPropModel['outcomes'][number]) => {
    const pick: PropBoardPick = {
      key: `${card.prop.id}:${outcome.side}`,
      cardId: card.id,
      propId: card.prop.id,
      side: outcome.side,
      playerName: card.playerName,
      label: card.prop.label,
      line: card.prop.line,
      price: outcome.price,
      priceLabel: outcome.priceLabel,
      gameLabel: card.gameLabel,
    };
    const sameProp = picks.filter((entry) => entry.propId !== card.prop.id);
    const selected = picks.some((entry) => entry.key === pick.key);
    const next = selected ? sameProp : [...sameProp, pick];
    updatePicks(next);
    if (!selected) onPick?.(pick);
  };

  const toggleLines = (id: string) => {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <section className="aura-prop-app" aria-label="Today's player props">
      <header className="aura-prop-app__topbar">
        <div>
          <span className="aura-prop-app__eyebrow">Today’s board</span>
          <h2>Find your line.</h2>
          <p>{model.coverage.games} games · {model.cards.length.toLocaleString()} main props</p>
        </div>
        <div className="aura-prop-app__freshness" aria-live="polite">
          <i />
          <span>Updated {formatTime(model.generatedAt)}</span>
        </div>
      </header>

      <div className="aura-prop-app__sports" role="group" aria-label="Sport filter">
        {['all', ...model.sports].map((option) => (
          <button key={option} type="button" aria-pressed={option === sport} onClick={() => setSport(option)}>
            {option === 'all' ? 'All sports' : option}
          </button>
        ))}
      </div>

      <div className="aura-prop-app__tools">
        <label className="aura-prop-app__search">
          <span>Search players, teams, or props</span>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search the board" />
        </label>
        <label className="aura-prop-app__game">
          <span>Game</span>
          <select value={game} onChange={(event) => setGame(event.target.value)}>
            <option value="all">All games</option>
            {games.map((option) => <option key={option.id} value={option.id}>{option.label} · {formatStart(option.startsAt)}</option>)}
          </select>
        </label>
        <label>
          <span>Market</span>
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="all">All markets</option>
            {categories.map((option) => <option key={option} value={option}>{titleCase(option)}</option>)}
          </select>
        </label>
        <label>
          <span>Sort</span>
          <select value={sort} onChange={(event) => setSort(event.target.value as Sort)}>
            <option value="start">Game time</option>
            <option value="player">Player</option>
            <option value="line">Line</option>
            <option value="price">Best price</option>
          </select>
        </label>
      </div>

      {model.coverage.truncated ? (
        <p className="aura-prop-app__notice">The retained board reached this starter’s bounded read limit. Filters still cover every returned prop.</p>
      ) : null}

      <div className="aura-prop-app__layout">
        <div className="aura-prop-app__results">
          <header>
            <strong>{filtered.length.toLocaleString()} props</strong>
            <span>{game === 'all' ? (sport === 'all' ? 'Every available sport' : sport) : games.find((option) => option.id === game)?.label} · {category === 'all' ? 'All markets' : titleCase(category)}</span>
          </header>
          {filtered.length === 0 ? (
            <div className="aura-prop-app__empty"><strong>No props match that view.</strong><span>Clear a filter or try another player.</span></div>
          ) : (
            <div className="aura-prop-app__grid">
              {filtered.slice(0, visible).map((card) => (
                <article key={card.id} className="aura-prop-card" data-changed={changed.has(card.id) || undefined}>
                  <header>
                    <div className="aura-prop-card__portrait">
                      {!failedImages.has(card.playerId) ? (
                        <img
                          src={card.headshotUrl}
                          alt=""
                          loading="lazy"
                          onError={() => setFailedImages((current) => new Set(current).add(card.playerId))}
                        />
                      ) : <span>{initials(card.playerName)}</span>}
                    </div>
                    <div>
                      <span>{card.sport} · {card.team}</span>
                      <h3>{card.playerName}</h3>
                      <small>{card.gameLabel} · {formatStart(card.startsAt)}</small>
                    </div>
                    {changed.has(card.id) ? <em>Moved</em> : null}
                  </header>
                  <div className="aura-prop-card__line">
                    <span>{card.prop.label}</span>
                    <strong>{card.prop.line ?? 'Yes / No'}</strong>
                    <small>{card.prop.status === 'live' ? 'Live line' : card.prop.alternates.length ? `Main line · ${card.prop.alternates.length} alternate${card.prop.alternates.length === 1 ? '' : 's'}` : 'Main line'}</small>
                  </div>
                  <div className="aura-prop-card__choices">
                    {card.prop.outcomes.map((outcome) => {
                      const key = `${card.prop.id}:${outcome.side}`;
                      const selected = picks.some((entry) => entry.key === key);
                      return (
                        <button
                          key={outcome.side}
                          type="button"
                          aria-pressed={selected}
                          aria-label={`${sideLabel(outcome.side)} ${card.prop.line ?? ''} for ${card.playerName}, ${outcome.priceLabel}`}
                          onClick={() => select(card, outcome)}
                        >
                          <span>{sideLabel(outcome.side)}</span>
                          <b>{outcome.priceLabel}</b>
                        </button>
                      );
                    })}
                  </div>
                  {card.prop.alternates.length > 0 ? (
                    <div className="aura-prop-card__alternates">
                      <button type="button" aria-expanded={expanded.has(card.id)} onClick={() => toggleLines(card.id)}>
                        {expanded.has(card.id) ? 'Hide alternate lines' : `View ${card.prop.alternates.length} alternate line${card.prop.alternates.length === 1 ? '' : 's'}`}
                      </button>
                      {expanded.has(card.id) ? (
                        <ul>
                          {card.prop.alternates.map((alternate) => (
                            <li key={alternate.id}>
                              <strong>{alternate.line ?? 'Yes / No'}</strong>
                              <span>{alternate.outcomes.map((outcome) => `${sideLabel(outcome.side)} ${outcome.priceLabel}`).join(' · ')}</span>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          )}
          {visible < filtered.length ? (
            <button className="aura-prop-app__more" type="button" onClick={() => setVisible((count) => count + 48)}>
              Show 48 more
            </button>
          ) : null}
        </div>

        <aside className="aura-prop-slip" aria-label="Selected props" data-empty={picks.length === 0 || undefined}>
          <header><div><span>Your card</span><strong>{picks.length} {picks.length === 1 ? 'pick' : 'picks'}</strong></div>{picks.length ? <button type="button" onClick={() => updatePicks([])}>Clear</button> : null}</header>
          {picks.length === 0 ? (
            <div className="aura-prop-slip__empty"><b>Tap a side to start.</b><span>Your selections stay here while you browse the board.</span></div>
          ) : (
            <ol>
              {livePicks.map((pick) => (
                <li key={pick.key}>
                  <div><strong>{pick.playerName}</strong><span>{pick.label} · {sideLabel(pick.side)} {pick.line ?? ''}</span><small>{pick.gameLabel}</small></div>
                  <b>{pick.priceLabel}</b>
                  <button type="button" aria-label={`Remove ${pick.playerName} ${pick.label}`} onClick={() => updatePicks(picks.filter((entry) => entry.key !== pick.key))}>×</button>
                </li>
              ))}
            </ol>
          )}
          <footer><span>Selections only</span><small>Connect your own entry flow with onPicksChange.</small></footer>
        </aside>
      </div>
    </section>
  );
}

function cardSignature(card: PropBoardCardModel): string {
  return `${card.prop.line}|${card.prop.outcomes.map((outcome) => `${outcome.side}:${outcome.price}`).join('|')}`;
}

function sortCards(left: PropBoardCardModel, right: PropBoardCardModel, sort: Sort): number {
  if (sort === 'player') return left.playerName.localeCompare(right.playerName) || left.startsAt - right.startsAt;
  if (sort === 'line') return (right.prop.line ?? -Infinity) - (left.prop.line ?? -Infinity);
  if (sort === 'price') return bestPrice(right.prop) - bestPrice(left.prop);
  return left.startsAt - right.startsAt || left.playerName.localeCompare(right.playerName);
}

function bestPrice(prop: PlayerPropModel): number {
  return Math.max(...prop.outcomes.map((outcome) => outcome.price));
}

function sideLabel(side: PlayerPropSide): string {
  if (side === 'over') return 'More';
  if (side === 'under') return 'Less';
  return side === 'yes' ? 'Yes' : 'No';
}

function titleCase(value: string): string {
  return value.replace(/[_-]/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function initials(name: string): string {
  return name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase();
}

function formatTime(value: number): string {
  return value ? new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(value) : 'now';
}

function formatStart(value: number): string {
  return value ? new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(value) : 'Time TBD';
}
