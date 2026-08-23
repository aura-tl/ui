import type { AuraGameBoxScore } from '@/lib/aura/live-scoreboard-types';

export interface AuraBoxScorePlayer { id: string; name: string; detail: string | null; values: string[]; leader: boolean; }
export interface AuraBoxScoreTeam { id: string; abbreviation: string; name: string; score: number | null; columns: string[]; players: AuraBoxScorePlayer[]; }
export interface AuraBoxScoreModel { gameId: string; league: string; status: string; teams: AuraBoxScoreTeam[]; }
export interface AuraBoxScoreState { status: 'loading' | 'ready' | 'unavailable' | 'error'; model: AuraBoxScoreModel | null; error: string | null; }

export function toAuraBoxScoreModel(input: AuraGameBoxScore): AuraBoxScoreModel {
  const rawTeams = Array.isArray(input.teams) ? input.teams : Object.values(object(input.teams));
  const playerGroups = Array.isArray(input.players) ? input.players.map(object) : [];
  return {
    gameId: input.gameId,
    league: String(input.league || input.sport || 'Box score'),
    status: String(input.phase || 'Latest'),
    teams: rawTeams.map((value, index) => team(object(value), playerGroups, index)),
  };
}

function team(value: Record<string, unknown>, playerGroups: Record<string, unknown>[], index: number): AuraBoxScoreTeam {
  const identity = object(value.team);
  const id = String(value.teamId || identity.id || value.id || `team-${index + 1}`);
  const abbreviation = String(value.abbreviation || identity.abbreviation || `T${index + 1}`);
  const matching = playerGroups.filter((group) => matchesTeam(group, id, abbreviation));
  const nestedGroups = matching.flatMap((group) => Array.isArray(group.statistics) ? group.statistics.map(object) : []);
  const directPlayers = matching.filter((group) => !Array.isArray(group.statistics));
  const playerGroup = nestedGroups.find((group) => Array.isArray(group.athletes));

  if (playerGroup) {
    const columns = stringArray(playerGroup.labels).slice(0, 6);
    return {
      id,
      abbreviation,
      name: String(value.displayName || identity.displayName || identity.name || abbreviation),
      score: numeric(value.score),
      columns,
      players: (Array.isArray(playerGroup.athletes) ? playerGroup.athletes : []).map((raw, playerIndex) => groupedPlayer(object(raw), columns, playerIndex)),
    };
  }

  const statColumns = Array.from(new Set(directPlayers.flatMap((player) => Object.keys(object(player.stats))))).slice(0, 6);
  return {
    id,
    abbreviation,
    name: String(value.displayName || identity.displayName || identity.name || abbreviation),
    score: numeric(value.score),
    columns: statColumns.map(shortLabel),
    players: directPlayers.map((player, playerIndex) => flatPlayer(player, statColumns, playerIndex)),
  };
}

function groupedPlayer(row: Record<string, unknown>, columns: string[], index: number): AuraBoxScorePlayer {
  const person = object(row.athlete);
  return {
    id: String(row.playerId || person.id || `${person.displayName || 'player'}-${index}`),
    name: String(person.displayName || person.fullName || row.displayName || `Player ${index + 1}`),
    detail: [object(person.position).abbreviation, row.starter === true ? 'Starter' : null].filter(Boolean).join(' · ') || null,
    values: (Array.isArray(row.stats) ? row.stats : []).map(String).slice(0, columns.length),
    leader: index === 0,
  };
}

function flatPlayer(row: Record<string, unknown>, columns: string[], index: number): AuraBoxScorePlayer {
  const stats = object(row.stats);
  return {
    id: String(row.canonicalPlayerId || row.playerId || row.id || `${row.displayName || row.playerName || 'player'}-${index}`),
    name: String(row.displayName || row.playerName || row.name || `Player ${index + 1}`),
    detail: String(row.position || row.positionAbbreviation || '') || null,
    values: columns.map((column) => display(stats[column])),
    leader: index === 0,
  };
}

function matchesTeam(group: Record<string, unknown>, id: string, abbreviation: string): boolean {
  const identity = object(group.team);
  const groupId = String(group.teamId || identity.id || '');
  const groupAbbreviation = String(group.abbreviation || identity.abbreviation || '');
  return groupId === id || groupAbbreviation === abbreviation;
}

function object(value: unknown): Record<string, unknown> { return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}; }
function stringArray(value: unknown): string[] { return Array.isArray(value) ? value.map(String) : []; }
function numeric(value: unknown): number | null { const parsed = typeof value === 'number' ? value : Number(value); return Number.isFinite(parsed) ? parsed : null; }
function display(value: unknown): string { return value === null || value === undefined ? '—' : String(value); }
function shortLabel(value: string): string { return value.replace(/([a-z])([A-Z])/g, '$1 $2').split(' ').map((part) => part[0] || '').join('').toUpperCase().slice(0, 5); }
