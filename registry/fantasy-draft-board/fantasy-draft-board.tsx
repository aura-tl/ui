'use client';
import * as React from 'react';
import type { FantasyDraftModel, FantasyDraftPlayerModel, FantasyDraftScoring } from '@/lib/aura/fantasy-draft-types';

export interface FantasyDraftBoardProps {
  model: FantasyDraftModel;
  roster?: FantasyDraftPlayerModel[];
  onRosterChange?: (players: FantasyDraftPlayerModel[]) => void;
}

type Sort = 'consensus' | 'points' | 'position' | 'value' | 'player';

export function FantasyDraftBoard({ model, roster: controlledRoster, onRosterChange }: FantasyDraftBoardProps) {
  const [scoring, setScoring] = React.useState<FantasyDraftScoring>('ppr');
  const [position, setPosition] = React.useState('all');
  const [team, setTeam] = React.useState('all');
  const [search, setSearch] = React.useState('');
  const [sort, setSort] = React.useState<Sort>('consensus');
  const [internalRoster, setInternalRoster] = React.useState<FantasyDraftPlayerModel[]>([]);
  const [failedImages, setFailedImages] = React.useState<Set<string>>(new Set());
  const roster = controlledRoster ?? internalRoster;

  const filtered = React.useMemo(() => {
    const needle = search.trim().toLowerCase();
    return model.players
      .filter((player) => position === 'all' || player.position === position)
      .filter((player) => team === 'all' || player.team === team)
      .filter((player) => !needle || `${player.name} ${player.team} ${player.position}`.toLowerCase().includes(needle))
      .sort((left, right) => sortPlayers(left, right, sort, scoring));
  }, [model.players, position, team, search, sort, scoring]);

  const updateRoster = (next: FantasyDraftPlayerModel[]) => {
    if (controlledRoster === undefined) setInternalRoster(next);
    onRosterChange?.(next);
  };
  const togglePlayer = (player: FantasyDraftPlayerModel) => {
    updateRoster(roster.some((entry) => entry.id === player.id)
      ? roster.filter((entry) => entry.id !== player.id)
      : [...roster, player]);
  };

  return (
    <section className="aura-draft-app" aria-label={`${model.season} fantasy draft projections`}>
      <header className="aura-draft-app__topbar">
        <div><span>Fantasy draft lab</span><h2>Build your board.</h2><p>{model.coverage.entities} retained projections · {model.positions.length} positions · {model.teams.length} teams</p></div>
        <div className="aura-draft-app__freshness"><i /><span>Updated {formatDate(model.generatedAt)}</span></div>
      </header>

      <div className="aura-draft-app__scoring" role="group" aria-label="Fantasy scoring">
        {(['ppr', 'halfPpr', 'standard'] as const).map((option) => <button key={option} type="button" aria-pressed={scoring === option} onClick={() => setScoring(option)}>{scoringLabel(option)}</button>)}
      </div>

      <div className="aura-draft-app__positions" role="group" aria-label="Position filter">
        {['all', ...model.positions].map((option) => <button key={option} type="button" aria-pressed={position === option} onClick={() => setPosition(option)}>{option === 'all' ? 'All positions' : option}</button>)}
      </div>

      <div className="aura-draft-app__tools">
        <label className="aura-draft-app__search"><span>Search players or teams</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search the board" /></label>
        <label><span>Team</span><select value={team} onChange={(event) => setTeam(event.target.value)}><option value="all">All teams</option>{model.teams.map((option) => <option key={option}>{option}</option>)}</select></label>
        <label><span>Sort</span><select value={sort} onChange={(event) => setSort(event.target.value as Sort)}><option value="consensus">Consensus rank</option><option value="points">Projected points</option><option value="position">Position rank</option><option value="value">Projection edge</option><option value="player">Player</option></select></label>
      </div>

      <p className="aura-draft-app__notice">Current acquired coverage includes {model.coverage.entities} retained entities across {model.positions.length} positions. Every displayed rank and projection is real; missing depth is not filled in.</p>

      <div className="aura-draft-app__layout">
        <div className="aura-draft-app__results">
          <header><strong>{filtered.length} draftable entities</strong><span>{position === 'all' ? 'All positions' : position} · {team === 'all' ? scoringLabel(scoring) : team}</span></header>
          {filtered.length ? <ol className="aura-draft-board">
            {filtered.map((player) => {
              const selected = roster.some((entry) => entry.id === player.id);
              const edge = projectionEdge(player, scoring);
              return <li key={player.id}>
                <b className="aura-draft-board__rank">{rankLabel(player.overallRank)}</b>
                <div className="aura-draft-board__portrait">{player.headshotUrl && !failedImages.has(player.id) ? <img src={player.headshotUrl} alt="" loading="lazy" onError={() => setFailedImages((current) => new Set(current).add(player.id))} /> : <span>{initials(player.name)}</span>}</div>
                <div className="aura-draft-board__player"><span>{player.position} · {player.team}</span><h3>{player.name}</h3><small>{player.position} consensus {rank(player.positionRank)} · projection {rank(player.pointRanks[scoring])}</small></div>
                <div className="aura-draft-board__stats">{keyStats(player).map((stat) => <span key={stat.label}><small>{stat.label}</small><b>{stat.value}</b></span>)}</div>
                <div className="aura-draft-board__points"><strong>{player.points[scoring].toFixed(1)}</strong><span>{scoringLabel(scoring)} pts</span>{edge > 0 ? <em>+{edge.toFixed(1)} edge</em> : edge < 0 ? <em data-negative>{edge.toFixed(1)} edge</em> : null}</div>
                <button className="aura-draft-board__add" type="button" aria-pressed={selected} onClick={() => togglePlayer(player)}>{selected ? 'Queued' : '+ Queue'}</button>
              </li>;
            })}
          </ol> : <div className="aura-draft-app__empty"><strong>No players match that board.</strong><span>Clear a filter or try another team.</span></div>}
        </div>

        <aside className="aura-draft-room" aria-label="Draft queue" data-empty={roster.length === 0 || undefined}>
          <header><div><span>Your draft room</span><strong>{roster.length} queued</strong></div>{roster.length ? <button type="button" onClick={() => updateRoster([])}>Clear</button> : null}</header>
          {roster.length ? <ol>{roster.map((player, index) => <li key={player.id}><b>{index + 1}</b><div><strong>{player.name}</strong><span>{player.position} · {player.team}</span></div><em>{player.points[scoring].toFixed(1)}</em><button type="button" aria-label={`Remove ${player.name}`} onClick={() => togglePlayer(player)}>×</button></li>)}</ol> : <div className="aura-draft-room__empty"><b>Build a shortlist.</b><span>Queue players while you compare ranks and projections.</span></div>}
          <footer><span>Local draft state</span><small>Connect onRosterChange to your own roster or draft room.</small></footer>
        </aside>
      </div>
    </section>
  );
}

function sortPlayers(left: FantasyDraftPlayerModel, right: FantasyDraftPlayerModel, sort: Sort, scoring: FantasyDraftScoring): number {
  if (sort === 'points') return right.points[scoring] - left.points[scoring] || left.name.localeCompare(right.name);
  if (sort === 'position') return (left.positionRank ?? Infinity) - (right.positionRank ?? Infinity) || left.name.localeCompare(right.name);
  if (sort === 'value') return projectionEdge(right, scoring) - projectionEdge(left, scoring) || left.name.localeCompare(right.name);
  if (sort === 'player') return left.name.localeCompare(right.name);
  return (left.overallRank ?? Infinity) - (right.overallRank ?? Infinity) || left.name.localeCompare(right.name);
}

function projectionEdge(player: FantasyDraftPlayerModel, scoring: FantasyDraftScoring): number {
  return player.positionRank === null ? 0 : player.positionRank - player.pointRanks[scoring];
}

function keyStats(player: FantasyDraftPlayerModel): Array<{ label: string; value: string }> {
  const p = player.projection;
  if (player.position === 'QB') return stats([['Pass yds', p.passingYards], ['Pass TD', p.passingTouchdowns], ['Rush yds', p.rushingYards]]);
  if (player.position === 'RB') return stats([['Rush yds', p.rushingYards], ['Rec', p.receptions], ['Total TD', (p.rushingTouchdowns || 0) + (p.receivingTouchdowns || 0)]]);
  if (player.position === 'WR' || player.position === 'TE') return stats([['Rec', p.receptions], ['Rec yds', p.receivingYards], ['Rec TD', p.receivingTouchdowns]]);
  return stats([['Sacks', p.sacks], ['INT', p.interceptions], ['TD', p.touchdowns]]);
}

function stats(entries: Array<[string, number | undefined]>): Array<{ label: string; value: string }> {
  return entries.map(([label, value]) => ({ label, value: Number.isFinite(value) ? Number(value).toFixed(value! >= 100 ? 0 : 1) : '—' }));
}
function rank(value: number | null): string { return value === null ? '—' : `#${Math.round(value)}`; }
function rankLabel(value: number | null): string { return value === null ? '—' : value.toFixed(1); }
function scoringLabel(value: FantasyDraftScoring): string { return value === 'halfPpr' ? 'Half PPR' : value === 'ppr' ? 'PPR' : 'Standard'; }
function initials(value: string): string { return value.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase(); }
function formatDate(value: number): string { return value ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(value) : 'retained snapshot'; }
