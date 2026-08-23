'use client';
import * as React from 'react';
import type { AuraLiveScoreboardClient } from '@/lib/aura/live-scoreboard-types';
import { toAuraGameCardModel, type AuraGameCardState } from '@/lib/aura/game-card-types';

export function useAuraGameCard(client: AuraLiveScoreboardClient, gameId: string): AuraGameCardState {
  const [state, setState] = React.useState<AuraGameCardState>({ status: 'loading', model: null, error: null });
  React.useEffect(() => {
    let active = true;
    client.getGame(gameId, { view: 'card' }).then((game) => {
      if (active) setState({ status: 'ready', model: toAuraGameCardModel(game), error: null });
    }).catch((error: unknown) => {
      if (!active) return;
      const message = error instanceof Error ? error.message : String(error);
      setState({ status: /404|not found/i.test(message) ? 'unavailable' : 'error', model: null, error: message });
    });
    return () => { active = false; };
  }, [client, gameId]);
  return state;
}
