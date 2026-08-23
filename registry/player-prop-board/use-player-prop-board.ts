'use client';
import * as React from 'react';
import type { AuraLiveScoreboardClient } from '@/lib/aura/live-scoreboard-types';
import { toAuraPlayerPropBoardModel, type AuraPlayerPropBoardState } from '@/lib/aura/player-prop-board-types';

/**
 * Polls the linked player-prop board for one game. Props change on retained
 * consensus updates, so a relaxed interval is the right default; the request
 * is metered like any other.
 */
export function useAuraPlayerPropBoard(
  client: AuraLiveScoreboardClient,
  gameId: string,
  options: { category?: string; pollMs?: number } = {}
): AuraPlayerPropBoardState {
  const [state, setState] = React.useState<AuraPlayerPropBoardState>({
    status: 'loading',
    model: null,
    error: null,
  });

  React.useEffect(() => {
    let active = true;
    let timer: number | undefined;

    const refresh = async () => {
      try {
        const board = await client.getPlayerProps(gameId, { category: options.category });
        if (!active) return;
        const model = toAuraPlayerPropBoardModel(board);
        setState({ status: model.propCount ? 'ready' : 'unavailable', model, error: null });
        timer = window.setTimeout(refresh, Math.max(30000, options.pollMs || 120000));
      } catch (error) {
        if (!active) return;
        setState({
          status: /404|not found/i.test(String(error)) ? 'unavailable' : 'error',
          model: null,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    };

    void refresh();
    return () => {
      active = false;
      if (timer) window.clearTimeout(timer);
    };
  }, [client, gameId, options.category, options.pollMs]);

  return state;
}
