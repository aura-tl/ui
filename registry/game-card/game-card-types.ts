import type { AuraLiveScoreboardGame } from '@/lib/aura/live-scoreboard-types';

export interface AuraGameCardTeam {
  id: string; abbreviation: string; name: string; score: number | null;
  record: string | null; color: string;
}
export interface AuraGameCardModel {
  id: string; league: string; phase: string; status: string; startsAt: number | null;
  away: AuraGameCardTeam; home: AuraGameCardTeam; note: string | null;
}
export interface AuraGameCardState {
  status: 'loading' | 'ready' | 'unavailable' | 'error';
  model: AuraGameCardModel | null; error: string | null;
}

export function toAuraGameCardModel(game: AuraLiveScoreboardGame): AuraGameCardModel {
  const teams = object(game.teams);
  return {
    id: String(game.gameId || ''),
    league: String(game.league || game.sport || 'Sport'),
    phase: String(game.phase || 'scheduled'),
    status: String(game.statusDetail || game.statusText || game.phase || 'Scheduled'),
    startsAt: number(game.startsAtMs),
    away: team(object(teams.away), 'away'),
    home: team(object(teams.home), 'home'),
    note: text(game.note) || null,
  };
}
function team(value: Record<string, unknown>, side: string): AuraGameCardTeam {
  return {
    id: String(value.id || side), abbreviation: String(value.abbreviation || side.slice(0, 3).toUpperCase()),
    name: String(value.displayName || value.shortName || value.name || side), score: number(value.score),
    record: text(value.record), color: String(value.color || '#a8a197'),
  };
}
function object(value: unknown): Record<string, unknown> { return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}; }
function number(value: unknown): number | null { const parsed = typeof value === 'number' ? value : Number(value); return Number.isFinite(parsed) ? parsed : null; }
function text(value: unknown): string | null { return typeof value === 'string' && value.trim() ? value : null; }
