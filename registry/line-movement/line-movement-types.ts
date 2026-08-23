import type { AuraLiveScoreboardGame, AuraOddsTimeline } from '@/lib/aura/live-scoreboard-types';
import type { AuraOddsMarketType } from '@/lib/aura/odds-strip-types';

export interface AuraLineMovementPoint { observedAt: number; value: number; }
export interface AuraLineMovementSeries { side: string; label: string; values: AuraLineMovementPoint[]; }
export interface AuraLineMovementModel { gameId: string; marketType: AuraOddsMarketType; series: AuraLineMovementSeries[]; }
export interface AuraLineMovementState { status: 'loading' | 'ready' | 'unavailable' | 'error'; model: AuraLineMovementModel | null; error: string | null; }

export function toAuraLineMovementModel(timeline: AuraOddsTimeline, game?: AuraLiveScoreboardGame): AuraLineMovementModel {
  const teams = object(game?.teams);
  const sides = Array.from(new Set(timeline.points.flatMap((point) => point.outcomes.map((outcome) => outcome.side))));
  return {
    gameId: timeline.gameId,
    marketType: timeline.marketType,
    series: sides.map((side) => ({
      side,
      label: side === 'home' || side === 'away' ? teamLabel(object(teams[side]), side) : side[0].toUpperCase() + side.slice(1),
      values: timeline.points.flatMap((point) => {
        const outcome = point.outcomes.find((candidate) => candidate.side === side);
        const value = timeline.marketType === 'moneyline' ? outcome?.price : outcome?.line;
        return typeof value === 'number' ? [{ observedAt: point.observedAt, value }] : [];
      }),
    })).filter((series) => series.values.length > 0),
  };
}

function teamLabel(team: Record<string, unknown>, side: string) { return String(team.abbreviation || team.shortName || side[0].toUpperCase() + side.slice(1)); }
function object(value: unknown): Record<string, unknown> { return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}; }
