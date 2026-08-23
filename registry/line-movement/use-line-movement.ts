'use client';
import * as React from 'react';
import type { AuraLiveScoreboardClient } from '@/lib/aura/live-scoreboard-types';
import type { AuraOddsMarketType } from '@/lib/aura/odds-strip-types';
import { toAuraLineMovementModel, type AuraLineMovementState } from '@/lib/aura/line-movement-types';

export function useAuraLineMovement(client: AuraLiveScoreboardClient, gameId: string, options: { marketType?: AuraOddsMarketType; pollMs?: number } = {}): AuraLineMovementState {
  const [state, setState] = React.useState<AuraLineMovementState>({ status: 'loading', model: null, error: null });
  React.useEffect(() => {
    let active = true;
    let timer: number | undefined;
    const refresh = async () => {
      try {
        const [game, timeline] = await Promise.all([client.getGame(gameId, { view: 'card' }), client.getOddsTimeline(gameId, options.marketType || 'spread', { fields: 'points.observedAt,points.outcomes.side,points.outcomes.line,points.outcomes.price' })]);
        if (!active) return;
        const model = toAuraLineMovementModel(timeline, game);
        setState({ status: model.series.some((series) => series.values.length > 1) ? 'ready' : 'unavailable', model, error: null });
        timer = window.setTimeout(refresh, Math.max(15_000, options.pollMs || 60_000));
      } catch (error) {
        if (active) setState({ status: 'error', model: null, error: error instanceof Error ? error.message : String(error) });
      }
    };
    void refresh();
    return () => { active = false; if (timer) window.clearTimeout(timer); };
  }, [client, gameId, options.marketType, options.pollMs]);
  return state;
}
