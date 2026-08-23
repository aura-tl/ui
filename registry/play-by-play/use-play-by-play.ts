'use client';
import * as React from 'react';
import type { AuraLiveScoreboardClient } from '@/lib/aura/live-scoreboard-types';
import { toAuraPlayByPlayModel, type AuraPlayByPlayState } from '@/lib/aura/play-by-play-types';
export function useAuraPlayByPlay(client: AuraLiveScoreboardClient, gameId: string, options: { pageSize?: number; pollMs?: number } = {}): AuraPlayByPlayState {
  const [state, setState] = React.useState<AuraPlayByPlayState>({ status: 'loading', model: null, error: null });
  React.useEffect(() => { let active = true; let timer: number | undefined; const refresh = async () => { try { const [game, page] = await Promise.all([client.getGame(gameId, { view: 'card' }), client.listGamePlayPage(gameId, { pageSize: options.pageSize || 30, fields: 'items.sequence,items.text,items.scoringPlay,items.clock,items.period,items.inning,items.awayScore,items.homeScore,items.situation' })]); if (!active) return; const teams = game.teams as Record<string, Record<string, unknown>> | undefined; const away = String(teams?.away?.abbreviation || 'Away'); const home = String(teams?.home?.abbreviation || 'Home'); setState({ status: page.items.length ? 'ready' : 'unavailable', model: toAuraPlayByPlayModel(page, { league: String(game.league || game.sport || 'Game'), title: `${away} at ${home}`, status: String(game.statusDetail || game.statusText || game.phase || 'Latest') }), error: null }); timer = window.setTimeout(refresh, Math.max(5000, options.pollMs || 15000)); } catch (error) { if (active) setState({ status: 'error', model: null, error: error instanceof Error ? error.message : String(error) }); } }; void refresh(); return () => { active = false; if (timer) window.clearTimeout(timer); }; }, [client, gameId, options.pageSize, options.pollMs]);
  return state;
}
