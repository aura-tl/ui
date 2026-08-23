import type { AuraGamePlayPage } from '@/lib/aura/live-scoreboard-types';
export interface AuraPlayItem { id: string; sequence: number; label: string; text: string; score: string | null; scoring: boolean; situation: string | null; }
export interface AuraPlayByPlayModel { gameId: string; league: string; title: string; status: string; items: AuraPlayItem[]; hasMore: boolean; nextCursor: string | null; }
export interface AuraPlayByPlayState { status: 'loading' | 'ready' | 'unavailable' | 'error'; model: AuraPlayByPlayModel | null; error: string | null; }

export function toAuraPlayByPlayModel(page: AuraGamePlayPage, context: { league?: string; title?: string; status?: string } = {}): AuraPlayByPlayModel {
  return { gameId: page.gameId, league: context.league || 'Game', title: context.title || 'Play by play', status: context.status || 'Latest', hasMore: page.hasMore, nextCursor: page.nextCursor,
    items: page.items.map((input, index) => { const play = object(input); const situation = object(play.situation); const away = number(play.awayScore); const home = number(play.homeScore); return { id: String(play.id || `${page.gameId}:${index}`), sequence: number(play.sequence) ?? index, label: String(play.clock || play.inning || play.period || '—'), text: String(play.text || 'Play unavailable'), score: away !== null || home !== null ? `${away ?? '—'} · ${home ?? '—'}` : null, scoring: play.scoringPlay === true, situation: situationText(situation) }; }).reverse() };
}
function situationText(value: Record<string, unknown>): string | null { return [value.shortDownDistanceText, value.possessionText, value.halfInning && value.inning ? `${value.halfInning} ${value.inning}` : null, value.balls !== undefined ? `${value.balls}-${value.strikes} · ${value.outs} out` : null].filter(Boolean).map(String).join(' · ') || null; }
function object(value: unknown): Record<string, unknown> { return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}; }
function number(value: unknown): number | null { const parsed = typeof value === 'number' ? value : Number(value); return Number.isFinite(parsed) ? parsed : null; }
