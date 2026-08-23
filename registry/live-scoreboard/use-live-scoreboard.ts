'use client';

import * as React from 'react';
import {
  auraLiveScoreboardError,
  auraLiveScoreboardResumeCursor,
  auraLiveScoreboardRetryAfterMs,
  auraLiveScoreboardShouldResetCursor,
  toAuraLiveScoreboardViewModel,
  type AuraLiveScoreboardClient,
  type AuraLiveScoreboardControllerState,
  type AuraLiveScoreboardFrame,
  type AuraLiveScoreboardGame,
} from '@/lib/aura/live-scoreboard-types';

export interface UseAuraLiveScoreboardOptions {
  client: AuraLiveScoreboardClient;
  gameId: string;
  mode?: 'live' | 'replay';
  staleAfterMs?: number;
  retryBaseMs?: number;
}

export function useAuraLiveScoreboard({
  client,
  gameId,
  mode = 'live',
  staleAfterMs = 45_000,
  retryBaseMs = 1_000,
}: UseAuraLiveScoreboardOptions): AuraLiveScoreboardControllerState {
  const [state, setState] =
    React.useState<AuraLiveScoreboardControllerState>({
      status: 'connecting',
      model: null,
      error: null,
      reconnectAttempt: 0,
    });

  React.useEffect(() => {
    let disposed = false;
    let stream: ReturnType<
      AuraLiveScoreboardClient['streamGameFrames']
    > | null = null;
    let retryTimer: number | null = null;
    let freshnessTimer: number | null = null;
    let reconnectAttempt = 0;
    let eventCursor: string | null = null;
    let currentGame: AuraLiveScoreboardGame | null = null;
    let currentFrame: AuraLiveScoreboardFrame | null = null;

    const clearStream = () => {
      stream?.close();
      stream = null;
    };

    const publishFrame = (
      game: AuraLiveScoreboardGame,
      frame: AuraLiveScoreboardFrame
    ) => {
      currentGame = game;
      currentFrame = frame;
      const model = toAuraLiveScoreboardViewModel(game, frame, {
        mode,
        staleAfterMs,
      });
      reconnectAttempt = 0;
      setState({
        status: model.status,
        model,
        error: null,
        reconnectAttempt,
      });
      return model;
    };

    const handleConnectionError = (error: unknown) => {
      if (disposed) return;
      clearStream();
      if (auraLiveScoreboardShouldResetCursor(error)) {
        eventCursor = null;
      }
      reconnectAttempt += 1;
      const message = auraLiveScoreboardError(error);
      setState((previous) => ({
        ...previous,
        status: previous.model
          ? 'stale'
          : /\b404\b|not found|unavailable/i.test(message)
            ? 'unavailable'
            : 'error',
        error: message,
        reconnectAttempt,
      }));
      if (mode === 'replay') return;
      const waitMs =
        auraLiveScoreboardRetryAfterMs(error) ??
        Math.min(
          10_000,
          Math.max(250, retryBaseMs) *
            2 ** Math.min(4, reconnectAttempt - 1)
        );
      retryTimer = window.setTimeout(connect, waitMs);
    };

    const subscribe = (
      game: AuraLiveScoreboardGame,
      frame: AuraLiveScoreboardFrame
    ) => {
      clearStream();
      stream = client.streamGameFrames(gameId, {
        since: eventCursor || frame.publishedAt || frame.observedAt,
        onFrame: (nextFrame, event) => {
          if (disposed) return;
          eventCursor =
            auraLiveScoreboardResumeCursor(event) || eventCursor;
          const model = publishFrame(game, nextFrame);
          if (model.status === 'final') clearStream();
        },
        onError: handleConnectionError,
      });
    };

    async function connect() {
      if (disposed) return;
      if (!currentFrame) {
        setState({
          status: 'connecting',
          model: null,
          error: null,
          reconnectAttempt,
        });
      }
      try {
        const [game, frame] = await Promise.all([
          client.getGame(gameId, { view: 'card' }),
          client.getGameFrame(gameId),
        ]);
        if (disposed) return;
        const model = publishFrame(game, frame);
        if (mode === 'live' && model.status !== 'final') {
          subscribe(game, frame);
        }
      } catch (error) {
        handleConnectionError(error);
      }
    }

    freshnessTimer = window.setInterval(() => {
      if (disposed || !currentGame || !currentFrame) return;
      const model = toAuraLiveScoreboardViewModel(
        currentGame,
        currentFrame,
        { mode, staleAfterMs }
      );
      setState((previous) => ({
        ...previous,
        status: model.status,
        model,
      }));
    }, Math.min(5_000, Math.max(1_000, Math.floor(staleAfterMs / 3))));

    void connect();
    return () => {
      disposed = true;
      clearStream();
      if (retryTimer !== null) window.clearTimeout(retryTimer);
      if (freshnessTimer !== null) window.clearInterval(freshnessTimer);
    };
  }, [client, gameId, mode, retryBaseMs, staleAfterMs]);

  return state;
}
