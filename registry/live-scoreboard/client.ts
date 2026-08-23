import type {
  AuraLiveScoreboardClient,
  AuraLiveScoreboardFrame,
  AuraGameBoxScore,
  AuraGameReplay,
  AuraOddsTimelineField,
  AuraLiveScoreboardStreamEvent,
} from './live-scoreboard-types';

export interface AuraLiveScoreboardClientOptions {
  /**
   * Browser-safe, same-origin Aura route. Do not put an Aura or RapidAPI key
   * here; the copied server route owns the credential.
   */
  baseUrl?: string;
  fetchImpl?: typeof fetch;
}

export function createAuraLiveScoreboardClient(
  options: AuraLiveScoreboardClientOptions = {}
): AuraLiveScoreboardClient {
  const baseUrl = (options.baseUrl || '/api/aura').replace(/\/$/, '');
  const fetchImpl = options.fetchImpl || globalThis.fetch.bind(globalThis);
  const requestUrl = (path: string) =>
    new URL(
      `${baseUrl}${path}`,
      globalThis.location?.origin || 'http://aura.local'
    );

  const get = async <T>(
    path: string,
    query: Record<string, string | number | undefined> = {}
  ): Promise<T> => {
    const url = requestUrl(path);
    for (const [name, value] of Object.entries(query)) {
      if (value !== undefined) url.searchParams.set(name, String(value));
    }
    const response = await fetchImpl(url, {
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`Aura request failed: ${response.status} ${path}`);
    }
    return response.json() as Promise<T>;
  };

  return {
    getNflDraft: (query) => get('/api/stats/nfl/draft', query),
    listScoreboard: (date, query = {}) =>
      get('/api/games', { date, view: 'scoreboard', ...query }),
    getGame: (id, query = { view: 'card' }) =>
      get(`/api/games/${encodeURIComponent(id)}`, query),
    getGameFrame: (id) =>
      get(`/api/games/${encodeURIComponent(id)}/frame`),
    getGameReplay: (id, query = {}) =>
      get<AuraGameReplay>(`/api/games/${encodeURIComponent(id)}/replay`, {
        at: query.at,
        limit: query.limit,
        includeBoxscore:
          query.includeBoxscore === undefined
            ? undefined
            : String(query.includeBoxscore),
      }),
    listGamePlayPage: (id, query) =>
      get(`/api/games/${encodeURIComponent(id)}/plays/page`, query),
    listPlayerStats: (id) =>
      get(`/api/games/${encodeURIComponent(id)}/player-stats`),
    getGameBoxScore: (id, query = {}) =>
      get<AuraGameBoxScore>(`/api/games/${encodeURIComponent(id)}/boxscore`, {
        fields: Array.isArray(query.fields) ? query.fields.join(',') : query.fields,
      }),
    getPlayer: (id) =>
      get(`/api/players/${encodeURIComponent(id)}`, { view: 'card' }),
    listGameMetrics: (id, query) =>
      get(`/api/games/${encodeURIComponent(id)}/metrics`, query),
    listGameMetricSeries: (id, query) =>
      get(`/api/games/${encodeURIComponent(id)}/metric-series`, {
        ...query,
        fields: Array.isArray(query.fields) ? query.fields.join(',') : query.fields,
      }),
    getPlayerProps: (id, options = {}) =>
      get(`/api/games/${encodeURIComponent(id)}/props`, {
        category: options.category,
        playerId: options.playerId,
      }),
    getOddsTimeline: (id, marketType = 'moneyline', options: { fields?: AuraOddsTimelineField[] | string } = {}) =>
      get(`/api/games/${encodeURIComponent(id)}/odds/timeline`, {
        marketType,
        fields: Array.isArray(options.fields) ? options.fields.join(',') : options.fields,
      }),
    getLeagueLandscape: (query) =>
      get('/api/analytics/landscape', {
        ...query,
        fields: Array.isArray(query.fields) ? query.fields.join(',') : query.fields,
      }),
    streamGameFrames: (id, streamOptions) => {
      const controller = new AbortController();
      const url = requestUrl('/api/events/stream');
      url.searchParams.set('type', 'game.frame');
      url.searchParams.set('gameId', id);
      if (streamOptions.since !== undefined) {
        url.searchParams.set('since', String(streamOptions.since));
      }

      const run = async () => {
        try {
          const response = await fetchImpl(url, {
            headers: { Accept: 'text/event-stream' },
            signal: controller.signal,
          });
          if (!response.ok) {
            throw new Error(`Aura stream failed: ${response.status}`);
          }
          if (!response.body) {
            throw new Error('Aura stream response has no body');
          }
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';
          while (!controller.signal.aborted) {
            const { value, done } = await reader.read();
            if (done) {
              if (!controller.signal.aborted) {
                streamOptions.onError?.(
                  new Error('Aura stream ended before it was closed')
                );
              }
              return;
            }
            buffer += decoder
              .decode(value, { stream: true })
              .replace(/\r\n/g, '\n');
            let boundary = buffer.indexOf('\n\n');
            while (boundary >= 0) {
              const raw = buffer.slice(0, boundary);
              buffer = buffer.slice(boundary + 2);
              const terminal = emitAuraFrame(
                raw,
                id,
                streamOptions.onFrame,
                streamOptions.onError
              );
              if (terminal) {
                controller.abort();
                return;
              }
              boundary = buffer.indexOf('\n\n');
            }
          }
        } catch (error) {
          if (!controller.signal.aborted) streamOptions.onError?.(error);
        }
      };
      void run();
      return {
        url: url.toString(),
        close: () => controller.abort(),
      };
    },
  };
}

function emitAuraFrame(
  raw: string,
  gameId: string,
  onFrame?: (
    frame: AuraLiveScoreboardFrame,
    event: AuraLiveScoreboardStreamEvent
  ) => void,
  onError?: (error: unknown) => void
): boolean {
  if (!raw || raw.startsWith(':')) return false;
  const eventName = raw
    .split('\n')
    .find((line) => line.startsWith('event:'))
    ?.slice(6)
    .trim();
  const data = raw
    .split('\n')
    .filter((line) => line.startsWith('data:'))
    .map((line) => line.slice(5).trimStart())
    .join('\n');
  if (!data) return false;
  try {
    if (eventName === 'aura.error') {
      const payload = JSON.parse(data) as {
        message?: string;
        code?: string;
        recoverable?: boolean;
        resetCursor?: boolean;
        recovery?: string;
        retryAfterMs?: number;
      };
      onError?.(
        Object.assign(
          new Error(payload.message || 'Aura stream reported an error'),
          {
            code: payload.code,
            recoverable: payload.recoverable,
            resetCursor: payload.resetCursor,
            recovery: payload.recovery,
            retryAfterMs: payload.retryAfterMs,
          }
        )
      );
      return true;
    }
    const event = JSON.parse(data) as AuraLiveScoreboardStreamEvent & {
      type?: string;
      payload?: AuraLiveScoreboardFrame;
    };
    const frame = event.payload;
    if (
      event.type !== 'game.frame' ||
      !frame ||
      frame.gameId !== gameId ||
      !frame.cursor
    ) {
      return false;
    }
    onFrame?.(frame, event);
    return false;
  } catch (error) {
    onError?.(error);
    return false;
  }
}
