import type { AuraGameBoxScore } from '@/lib/aura/live-scoreboard-types';

export type AuraFantasyStat = 'passingYards' | 'passingTouchdowns' | 'interceptions' | 'rushingYards' | 'rushingTouchdowns' | 'receivingYards' | 'receptions' | 'receivingTouchdowns' | 'fumblesLost';
export type AuraFantasyScoring = Partial<Record<AuraFantasyStat, number>>;
export interface AuraFantasyPlayerSelector { playerId?: string; playerName?: string; }
export interface AuraFantasyPlayerLineModel { playerId: string; name: string; team: string; position: string; opponent: string | null; status: string; points: number; scoringLabel: string; stats: Array<{ key: AuraFantasyStat; label: string; value: number; }>; }
export interface AuraFantasyPlayerLineState { status: 'loading' | 'ready' | 'unavailable' | 'error'; model: AuraFantasyPlayerLineModel | null; error: string | null; }
type AuraFantasyPlayerRow = { id: string; name: string; teamId: string; position: string; stats: Partial<Record<AuraFantasyStat, number>>; };

export const auraPprScoring: Required<AuraFantasyScoring> = { passingYards: .04, passingTouchdowns: 4, interceptions: -2, rushingYards: .1, rushingTouchdowns: 6, receivingYards: .1, receptions: 1, receivingTouchdowns: 6, fumblesLost: -2 };

const statLabels: Record<AuraFantasyStat, string> = { passingYards: 'Pass Yds', passingTouchdowns: 'Pass TD', interceptions: 'INT', rushingYards: 'Rush Yds', rushingTouchdowns: 'Rush TD', receivingYards: 'Rec Yds', receptions: 'REC', receivingTouchdowns: 'Rec TD', fumblesLost: 'Fum Lost' };

export function toAuraFantasyPlayerLineModel(input: AuraGameBoxScore, selector: AuraFantasyPlayerSelector, scoring: AuraFantasyScoring = auraPprScoring): AuraFantasyPlayerLineModel | null {
  const players = playerRows(input);
  const selected = players.find((player) => selector.playerId && player.id === selector.playerId)
    || players.find((player) => selector.playerName && normalize(player.name) === normalize(selector.playerName));
  if (!selected) return null;
  return playerModel(input, selected, scoring);
}

function playerModel(input: AuraGameBoxScore, selected: AuraFantasyPlayerRow, scoring: AuraFantasyScoring): AuraFantasyPlayerLineModel {
  const applied = { ...auraPprScoring, ...scoring };
  const stats = (Object.keys(statLabels) as AuraFantasyStat[]).flatMap((key) => typeof selected.stats[key] === 'number' ? [{ key, label: statLabels[key], value: selected.stats[key] as number }] : []);
  const teams = teamRows(input);
  const own = teams.find((team) => team.id === selected.teamId || team.abbreviation === selected.teamId);
  const opponent = teams.find((team) => team !== own);
  return {
    playerId: selected.id,
    name: selected.name,
    team: own?.abbreviation || selected.teamId || '—',
    position: selected.position || 'Player',
    opponent: opponent?.abbreviation || null,
    status: String(input.phase || 'Latest'),
    points: stats.reduce((total, stat) => total + stat.value * applied[stat.key], 0),
    scoringLabel: scoring === auraPprScoring ? 'PPR' : 'Custom',
    stats,
  };
}

export function toAuraFantasyLeaderModels(input: AuraGameBoxScore, scoring: AuraFantasyScoring = auraPprScoring, limit = 10): AuraFantasyPlayerLineModel[] {
  return playerRows(input)
    .map((player) => playerModel(input, player, scoring))
    .filter((player) => player.stats.length > 0)
    .sort((left, right) => right.points - left.points || left.name.localeCompare(right.name))
    .slice(0, Math.max(1, limit));
}

function playerRows(input: AuraGameBoxScore): AuraFantasyPlayerRow[] {
  return (Array.isArray(input.players) ? input.players : []).flatMap((raw, index) => {
    const row = object(raw);
    if (Array.isArray(row.statistics)) {
      const identity = object(row.team);
      const teamId = String(row.teamId || identity.id || identity.abbreviation || '');
      return row.statistics.flatMap((rawGroup) => {
        const group = object(rawGroup);
        const labels = array(group.labels).map(String);
        const context = String(group.name || group.displayName || '');
        return array(group.athletes).map((rawAthlete, athleteIndex) => {
          const athlete = object(rawAthlete);
          const person = object(athlete.athlete);
          const rawStats = Object.fromEntries(labels.map((label, statIndex) => [`${context} ${label}`, array(athlete.stats)[statIndex]]));
          return normalizedPlayer({ ...athlete, ...person, teamId, stats: rawStats }, `${index}-${athleteIndex}`);
        });
      });
    }
    return [normalizedPlayer(row, String(index))];
  });
}

function normalizedPlayer(row: Record<string, unknown>, fallback: string) {
  const rawStats = object(row.stats);
  const stats: Partial<Record<AuraFantasyStat, number>> = {};
  for (const [rawKey, rawValue] of Object.entries(rawStats)) {
    const key = fantasyKey(rawKey);
    const value = numeric(rawValue);
    if (key && value !== null) stats[key] = value;
  }
  const name = String(row.displayName || row.fullName || row.playerName || row.name || `Player ${fallback}`);
  return { id: String(row.canonicalPlayerId || row.playerId || row.id || normalize(name)), name, teamId: String(row.teamId || ''), position: String(object(row.position).abbreviation || row.positionAbbreviation || row.position || ''), stats };
}

function teamRows(input: AuraGameBoxScore) {
  const teams = Array.isArray(input.teams) ? input.teams : Object.values(object(input.teams));
  return teams.map((raw, index) => { const row = object(raw); const identity = object(row.team); return { id: String(row.teamId || identity.id || row.id || index), abbreviation: String(row.abbreviation || identity.abbreviation || `T${index + 1}`) }; });
}

function fantasyKey(value: string): AuraFantasyStat | null {
  const key = normalize(value);
  if ((key.includes('passing') || key.startsWith('pass')) && key.includes('yd')) return 'passingYards';
  if ((key.includes('passing') || key.startsWith('pass')) && key.includes('td')) return 'passingTouchdowns';
  if (key === 'int' || key.includes('interception')) return 'interceptions';
  if ((key.includes('rushing') || key.startsWith('rush')) && key.includes('yd')) return 'rushingYards';
  if ((key.includes('rushing') || key.startsWith('rush')) && key.includes('td')) return 'rushingTouchdowns';
  if ((key.includes('receiving') || key.startsWith('rec')) && key.includes('yd')) return 'receivingYards';
  if (key === 'rec' || key.includes('reception') || (key.startsWith('receiving') && key.endsWith('rec'))) return 'receptions';
  if ((key.includes('receiving') || key.startsWith('rec')) && key.includes('td')) return 'receivingTouchdowns';
  if (key.includes('fumble') && key.includes('lost')) return 'fumblesLost';
  return null;
}

function normalize(value: string) { return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); }
function object(value: unknown): Record<string, unknown> { return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}; }
function array(value: unknown): unknown[] { return Array.isArray(value) ? value : []; }
function numeric(value: unknown): number | null { const match = String(value ?? '').match(/-?\d+(?:\.\d+)?/); const parsed = typeof value === 'number' ? value : match ? Number(match[0]) : NaN; return Number.isFinite(parsed) ? parsed : null; }
