'use client';

import * as React from 'react';
import {
  auraLiveScoreboardRetryAfterMs,
  auraLiveScoreboardShouldResetCursor,
  type AuraLiveScoreboardClient,
} from '@/lib/aura/live-scoreboard-types';
import {
  applyAuraGamePulseFrame,
  auraGamePulseResumeCursor,
  loadAuraGamePulseSnapshot,
  type AuraGamePulseControllerState,
} from '@/lib/aura/game-pulse-types';

export interface UseAuraGamePulseOptions {
  client: AuraLiveScoreboardClient;
  gameId: string;
  mode?: 'live' | 'replay';
  retryBaseMs?: number;
}

export function useAuraGamePulse({
  client,
  gameId,
  mode = 'live',
  retryBaseMs = 1_000,
}: UseAuraGamePulseOptions): AuraGamePulseControllerState {
  const [state, setState] = React.useState<AuraGamePulseControllerState>({
    status: 'connecting',
    model: null,
    error: null,
    reconnectAttempt: 0,
  });

  React.useEffect(() => {
    let disposed = false;
    let retryTimer: number | null = null;
    let stream: ReturnType<
      AuraLiveScoreboardClient['streamGameFrames']
    > | null = null;
    let reconnectAttempt = 0;
    let eventCursor: string | null = null;

    const close = () => {
      stream?.close();
      stream = null;
    };

    const fail = (error: unknown) => {
      if (disposed) return;
      close();
      if (auraLiveScoreboardShouldResetCursor(error)) {
        eventCursor = null;
      }
      reconnectAttempt += 1;
      const message =
        error instanceof Error ? error.message : String(error);
      setState((previous) => ({
        ...previous,
        status: previous.model
          ? 'stale'
          : /\b404\b|not found|unavailable|no granular metrics/i.test(message)
            ? 'unavailable'
            : 'error',
        error: message,
        reconnectAttempt,
      }));
      if (mode === 'replay') return;
      retryTimer = window.setTimeout(
        connect,
        auraLiveScoreboardRetryAfterMs(error) ??
          Math.min(
            10_000,
            Math.max(250, retryBaseMs) *
              2 ** Math.min(4, reconnectAttempt - 1)
          )
      );
    };

    async function connect() {
      if (disposed) return;
      try {
        const snapshot = await loadAuraGamePulseSnapshot(
          client,
          gameId,
          mode
        );
        if (disposed) return;
        reconnectAttempt = 0;
        const final =
          snapshot.model.scoreboard.phase.toLowerCase() === 'final';
        setState({
          status:
            mode === 'replay' ? 'replay' : final ? 'final' : 'live',
          model: snapshot.model,
          error: null,
          reconnectAttempt: 0,
        });
        if (mode === 'replay' || final) return;

        close();
        stream = client.streamGameFrames(gameId, {
          since:
            eventCursor ||
            snapshot.frame.publishedAt ||
            snapshot.frame.observedAt,
          onFrame: (frame, event) => {
            if (disposed) return;
            eventCursor =
              auraGamePulseResumeCursor(event) || eventCursor;
            setState((previous) => {
              if (!previous.model) return previous;
              const model = applyAuraGamePulseFrame(
                previous.model,
                snapshot.game,
                frame
              );
              const nextFinal =
                model.scoreboard.phase.toLowerCase() === 'final';
              if (nextFinal) close();
              return {
                status: nextFinal ? 'final' : 'live',
                model,
                error: null,
                reconnectAttempt: 0,
              };
            });
          },
          onError: fail,
        });
      } catch (error) {
        fail(error);
      }
    }

    setState({
      status: 'connecting',
      model: null,
      error: null,
      reconnectAttempt: 0,
    });
    void connect();
    return () => {
      disposed = true;
      close();
      if (retryTimer !== null) window.clearTimeout(retryTimer);
    };
  }, [client, gameId, mode, retryBaseMs]);

  return state;
}
