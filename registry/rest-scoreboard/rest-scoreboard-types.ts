import type {
  AuraGameReplay,
  AuraLiveScoreboardClient,
  AuraLiveScoreboardFrame,
  AuraLiveScoreboardGame,
  AuraLiveScoreboardViewModel,
} from '@/lib/aura/live-scoreboard-types';
import { toAuraLiveScoreboardViewModel } from '@/lib/aura/live-scoreboard-types';
import {
  canonicalAuraFields,
  restScoreboardData,
  type AuraRestScoreboardField,
} from '@/lib/aura/rest-scoreboard-data';

export const AURA_REST_SCOREBOARD_DATA = restScoreboardData;

export function canonicalRestScoreboardFields(
  fields?: readonly AuraRestScoreboardField[],
): string {
  return canonicalAuraFields(restScoreboardData.fields, fields);
}

export type AuraRestScoreboardStatus =
  | 'connecting'
  | 'polling'
  | 'stale'
  | 'final'
  | 'replay'
  | 'unavailable'
  | 'error';

export interface AuraRestScoreboardModel {
  mode: 'poll' | 'replay';
  view: AuraLiveScoreboardViewModel;
  replayAt: number | null;
  replayComplete: boolean;
  playCount: number;
}

export interface AuraRestScoreboardControllerState {
  status: AuraRestScoreboardStatus;
  model: AuraRestScoreboardModel | null;
  error: string | null;
  pollCount: number;
}

export function toAuraRestScoreboardModel(
  game: AuraLiveScoreboardGame,
  frame: AuraLiveScoreboardFrame,
  options: { mode?: 'poll' | 'replay'; replay?: AuraGameReplay } = {}
): AuraRestScoreboardModel {
  const mode = options.mode || 'poll';
  return {
    mode,
    view: toAuraLiveScoreboardViewModel(game, frame, {
      mode: mode === 'replay' ? 'replay' : undefined,
    }),
    replayAt: options.replay?.replayAt ?? null,
    replayComplete: mode === 'poll' || Boolean(options.replay),
    playCount: options.replay?.plays?.length ?? 0,
  };
}

export async function loadAuraRestScoreboardReplay(
  client: AuraLiveScoreboardClient,
  gameId: string,
  at?: number
): Promise<AuraRestScoreboardModel> {
  const replay = await client.getGameReplay(gameId, {
    at,
    limit: 250,
  });
  const replayFrame: AuraLiveScoreboardFrame = {
    gameId: replay.gameId || gameId,
    cursor: `replay:${replay.gameId || gameId}:${replay.replayAt}`,
    revision: 0,
    observedAt: replay.replayAt,
    publishedAt: replay.replayAt,
    scoreboard: replay.game,
    freshness: {
      dataAsOf: replay.replayAt,
      state: 'replay',
      complete: true,
      missing: [],
    },
  };
  return toAuraRestScoreboardModel(replay.game, replayFrame, {
    mode: 'replay',
    replay,
  });
}

export function auraRestScoreboardError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
