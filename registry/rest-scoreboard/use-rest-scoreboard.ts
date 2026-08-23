'use client';

import * as React from 'react';
import type { AuraLiveScoreboardClient } from '@/lib/aura/live-scoreboard-types';
import {
  auraRestScoreboardError,
  loadAuraRestScoreboardReplay,
  toAuraRestScoreboardModel,
  type AuraRestScoreboardControllerState,
} from '@/lib/aura/rest-scoreboard-types';

export interface UseAuraRestScoreboardOptions {
  client: AuraLiveScoreboardClient;
  gameId: string;
  mode?: 'poll' | 'replay';
  pollMs?: number;
  replayAt?: number;
}

export function useAuraRestScoreboard({
  client,
  gameId,
  mode = 'poll',
  pollMs = 15_000,
  replayAt,
}: UseAuraRestScoreboardOptions): AuraRestScoreboardControllerState {
  const [state, setState] =
    React.useState<AuraRestScoreboardControllerState>({
      status: 'connecting',
      model: null,
      error: null,
      pollCount: 0,
    });

  React.useEffect(() => {
    let disposed = false;
    let timer: number | null = null;
    let pollCount = 0;
    const interval = Math.max(5_000, pollMs);

    const fail = (error: unknown) => {
      if (disposed) return;
      const message = auraRestScoreboardError(error);
      setState((previous) => ({
        ...previous,
        status: previous.model ? 'stale' : /\b404\b|not found|unavailable/i.test(message)
          ? 'unavailable'
          : 'error',
        error: message,
      }));
    };

    const schedule = () => {
      if (disposed || mode !== 'poll') return;
      timer = window.setTimeout(() => void refresh(), interval);
    };

    async function refresh() {
      if (disposed) return;
      try {
        const [game, frame] = await Promise.all([
          client.getGame(gameId, { view: 'card' }),
          client.getGameFrame(gameId),
        ]);
        if (disposed) return;
        pollCount += 1;
        const model = toAuraRestScoreboardModel(game, frame, { mode });
        const final = model.view.scoreboard.phase.toLowerCase() === 'final';
        setState({
          status: final ? 'final' : 'polling',
          model,
          error: null,
          pollCount,
        });
        if (!final) schedule();
      } catch (error) {
        fail(error);
        schedule();
      }
    }

    async function connect() {
      if (disposed) return;
      setState((previous) => ({ ...previous, status: 'connecting', error: null }));
      try {
        if (mode === 'replay') {
          const model = await loadAuraRestScoreboardReplay(client, gameId, replayAt);
          if (disposed) return;
          setState({ status: 'replay', model, error: null, pollCount: 0 });
          return;
        }
        await refresh();
      } catch (error) {
        fail(error);
      }
    }

    void connect();
    return () => {
      disposed = true;
      if (timer !== null) window.clearTimeout(timer);
    };
  }, [client, gameId, mode, pollMs, replayAt]);

  return state;
}
