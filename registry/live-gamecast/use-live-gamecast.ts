'use client';

import * as React from 'react';
import {
  auraGamecastError,
  auraGamecastResumeCursor,
  auraGamecastRetryAfterMs,
  auraGamecastShouldResetCursor,
  loadAuraGamecastReplay,
  toAuraLiveGamecastModel,
  type AuraGamecastClient,
  type AuraGamecastControllerState,
  type AuraGamecastFrame,
} from '@/lib/aura/live-gamecast-types';
import type {
  AuraLiveScoreboardFrame,
  AuraLiveScoreboardGame,
} from '@/lib/aura/live-scoreboard-types';

export interface UseAuraLiveGamecastOptions {
  client: AuraGamecastClient;
  gameId: string;
  mode?: 'live' | 'replay';
  staleAfterMs?: number;
  retryBaseMs?: number;
}

export function useAuraLiveGamecast({
  client,
  gameId,
  mode = 'live',
  staleAfterMs = 45_000,
  retryBaseMs = 1_000,
}: UseAuraLiveGamecastOptions): AuraGamecastControllerState {
  const [state, setState] = React.useState<AuraGamecastControllerState>({
    status: 'connecting',
    model: null,
    error: null,
    reconnectAttempt: 0,
  });

  React.useEffect(() => {
    let disposed = false;
    let stream: ReturnType<
      AuraGamecastClient['streamGameFrames']
    > | null = null;
    let retryTimer: number | null = null;
    let freshnessTimer: number | null = null;
    let reconnectAttempt = 0;
    let eventCursor: string | null = null;
    let game: AuraLiveScoreboardGame | null = null;
    let latestPublishedFrame: AuraLiveScoreboardFrame | null = null;
    let frames: AuraGamecastFrame[] = [];

    const closeStream = () => {
      stream?.close();
      stream = null;
    };

    const publish = (
      nextGame: AuraLiveScoreboardGame,
      nextFrame: AuraLiveScoreboardFrame
    ) => {
      game = nextGame;
      latestPublishedFrame = nextFrame;
      const model = toAuraLiveGamecastModel(nextGame, nextFrame, frames);
      frames = model.frames;
      reconnectAttempt = 0;
      const phase = model.scoreboard.phase.toLowerCase();
      const latest = frames[frames.length - 1];
      const stale = Date.now() - latest.freshness.dataAsOf > staleAfterMs;
      const status =
        phase === 'final' ? 'final' : stale ? 'stale' : 'live';
      setState({
        status,
        model,
        error: null,
        reconnectAttempt,
      });
      if (status === 'final') closeStream();
    };

    const fail = (error: unknown) => {
      if (disposed) return;
      closeStream();
      if (auraGamecastShouldResetCursor(error)) {
        eventCursor = null;
      }
      reconnectAttempt += 1;
      const message = auraGamecastError(error);
      setState((previous) => ({
        ...previous,
        status: previous.model
          ? 'stale'
          : /\b404\b|not found|unavailable|no retained plays/i.test(message)
            ? 'unavailable'
            : 'error',
        error: message,
        reconnectAttempt,
      }));
      if (mode === 'replay') return;
      retryTimer = window.setTimeout(
        connect,
        auraGamecastRetryAfterMs(error) ??
          Math.min(
            10_000,
            Math.max(250, retryBaseMs) *
              2 ** Math.min(4, reconnectAttempt - 1)
          )
      );
    };

    const subscribe = (
      nextGame: AuraLiveScoreboardGame,
      frame: AuraLiveScoreboardFrame
    ) => {
      closeStream();
      stream = client.streamGameFrames(gameId, {
        since:
          eventCursor || frame.publishedAt || frame.observedAt,
        onFrame: (nextFrame, event) => {
          if (disposed) return;
          eventCursor =
            auraGamecastResumeCursor(event) || eventCursor;
          publish(nextGame, nextFrame);
        },
        onError: fail,
      });
    };

    async function connect() {
      if (disposed) return;
      if (!latestPublishedFrame) {
        setState({
          status: 'connecting',
          model: null,
          error: null,
          reconnectAttempt,
        });
      }
      try {
        if (mode === 'replay') {
          const model = await loadAuraGamecastReplay(client, gameId);
          if (disposed) return;
          frames = model.frames;
          setState({
            status: 'replay',
            model,
            error: null,
            reconnectAttempt: 0,
          });
          return;
        }
        const [nextGame, frame] = await Promise.all([
          client.getGame(gameId, { view: 'card' }),
          client.getGameFrame(gameId),
        ]);
        if (disposed) return;
        publish(nextGame, frame);
        if (String(nextGame.phase || '').toLowerCase() !== 'final') {
          subscribe(nextGame, frame);
        }
      } catch (error) {
        fail(error);
      }
    }

    freshnessTimer = window.setInterval(() => {
      if (disposed || !game || !latestPublishedFrame) return;
      const latest = frames[frames.length - 1];
      if (
        latest &&
        Date.now() - latest.freshness.dataAsOf > staleAfterMs
      ) {
        setState((previous) => ({
          ...previous,
          status:
            previous.status === 'final' ||
            previous.status === 'replay'
              ? previous.status
              : 'stale',
        }));
      }
    }, Math.min(5_000, Math.max(1_000, Math.floor(staleAfterMs / 3))));

    void connect();
    return () => {
      disposed = true;
      closeStream();
      if (retryTimer !== null) window.clearTimeout(retryTimer);
      if (freshnessTimer !== null) window.clearInterval(freshnessTimer);
    };
  }, [client, gameId, mode, retryBaseMs, staleAfterMs]);

  return state;
}
