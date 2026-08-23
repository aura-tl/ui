'use client';
import * as React from 'react';
import type { AuraLiveScoreboardClient } from '@/lib/aura/live-scoreboard-types';
import { toPropSlateModel, type PropSlateModel } from '@/lib/aura/prop-board-types';

export type AuraPropBoardState =
  | { status: 'loading'; model: null; error: null }
  | { status: 'ready'; model: PropSlateModel; error: string | null }
  | { status: 'unavailable'; model: PropSlateModel | null; error: null }
  | { status: 'error'; model: null; error: string };

/**
 * Builds one cross-sport day board from Aura's metered REST contract. Keep the
 * date stable and poll gently: each refresh requests the slate, then only the
 * linked prop board for each returned game.
 */
export function useAuraPropBoard(
  client: AuraLiveScoreboardClient,
  date: string,
  options: { pollMs?: number } = {}
): AuraPropBoardState {
  const [state, setState] = React.useState<AuraPropBoardState>({ status: 'loading', model: null, error: null });

  React.useEffect(() => {
    let active = true;
    let timer: number | undefined;
    const refresh = async () => {
      try {
        const games = await client.listScoreboard(date, { limit: 100 });
        const boards: Array<{ game: Record<string, unknown>; board: Record<string, unknown> }> = [];
        for (let index = 0; index < games.length; index += 6) {
          const batch = await Promise.all(games.slice(index, index + 6).map(async (game) => {
            try {
              const board = await client.getPlayerProps(game.gameId);
              return board.props?.length ? { game, board } : null;
            } catch (error) {
              if (/404|not found/i.test(String(error))) return null;
              throw error;
            }
          }));
          for (const entry of batch) if (entry) boards.push(entry);
        }
        if (!active) return;
        const start = new Date(`${date}T00:00:00`).getTime();
        const payload = {
          generatedAt: Date.now(),
          window: { from: start, to: start + 86_400_000 - 1 },
          coverage: {
            games: boards.length,
            props: boards.reduce((total, entry) => total + Number((entry.board as any).props?.length || 0), 0),
            truncated: games.length === 100,
          },
          boards,
        };
        const model = toPropSlateModel(payload);
        setState({ status: model.cards.length ? 'ready' : 'unavailable', model, error: null });
        timer = window.setTimeout(refresh, Math.max(30_000, options.pollMs || 120_000));
      } catch (error) {
        if (!active) return;
        const message = error instanceof Error ? error.message : String(error);
        setState((current) => current.model
          ? { status: 'ready', model: current.model, error: message }
          : { status: 'error', model: null, error: message });
        timer = window.setTimeout(refresh, Math.max(30_000, options.pollMs || 120_000));
      }
    };
    void refresh();
    return () => {
      active = false;
      if (timer) window.clearTimeout(timer);
    };
  }, [client, date, options.pollMs]);

  return state;
}
