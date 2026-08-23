'use client';
import * as React from 'react';
import type { AuraLiveScoreboardClient } from '@/lib/aura/live-scoreboard-types';
import { toAuraFantasyPlayerLineModel, type AuraFantasyPlayerLineState, type AuraFantasyPlayerSelector, type AuraFantasyScoring } from '@/lib/aura/fantasy-player-line-types';

export function useAuraFantasyPlayerLine(client: AuraLiveScoreboardClient, gameId: string, selector: AuraFantasyPlayerSelector, options: { scoring?: AuraFantasyScoring; pollMs?: number } = {}): AuraFantasyPlayerLineState {
  const [state, setState] = React.useState<AuraFantasyPlayerLineState>({ status: 'loading', model: null, error: null });
  React.useEffect(() => {
    let active = true;
    let timer: number | undefined;
    const refresh = async () => {
      try {
        const boxScore = await client.getGameBoxScore(gameId);
        if (!active) return;
        const model = toAuraFantasyPlayerLineModel(boxScore, selector, options.scoring);
        setState({ status: model ? 'ready' : 'unavailable', model, error: null });
        if (String(boxScore.phase).toLowerCase() !== 'final') timer = window.setTimeout(refresh, Math.max(10_000, options.pollMs || 30_000));
      } catch (error) {
        if (active) setState({ status: 'error', model: null, error: error instanceof Error ? error.message : String(error) });
      }
    };
    void refresh();
    return () => { active = false; if (timer) window.clearTimeout(timer); };
  }, [client, gameId, selector.playerId, selector.playerName, options.scoring, options.pollMs]);
  return state;
}
