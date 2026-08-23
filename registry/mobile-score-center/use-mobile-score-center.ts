'use client';
import * as React from 'react';
import type { AuraLiveScoreboardClient } from '@/lib/aura/live-scoreboard-types';
import { toAuraMobileScoreCenterModel, type AuraMobileScoreCenterState } from '@/lib/aura/mobile-score-center-types';

export function useAuraMobileScoreCenter(client: AuraLiveScoreboardClient, date: string, options: { sport?: string; sports?: string[]; pollMs?: number } = {}): AuraMobileScoreCenterState {
  const [state, setState] = React.useState<AuraMobileScoreCenterState>({ status: 'loading', model: null, error: null });
  React.useEffect(() => {
    let active = true; let timer: number | undefined;
    const refresh = async () => { try { const games = await client.listScoreboard(date, { sport: options.sport || 'NFL', limit: 50 }); if (!active) return; const model = toAuraMobileScoreCenterModel(date, options.sport || 'NFL', games, options.sports); setState({ status: games.length ? 'ready' : 'empty', model, error: null }); if (games.some((game) => game.phase === 'in_progress')) timer = window.setTimeout(refresh, Math.max(10_000, options.pollMs || 30_000)); } catch (error) { if (active) setState({ status: 'error', model: null, error: error instanceof Error ? error.message : String(error) }); } };
    void refresh(); return () => { active = false; if (timer) window.clearTimeout(timer); };
  }, [client, date, options.sport, options.sports, options.pollMs]);
  return state;
}
