export type AuraLiveScoreboardStatus =
  | 'connecting'
  | 'live'
  | 'stale'
  | 'final'
  | 'replay'
  | 'unavailable'
  | 'error';

export interface AuraTeamViewModel {
  id: string;
  abbreviation: string;
  name: string;
  score: number | null;
  color: string;
  record: string | null;
}

export interface AuraScoreboardViewModel {
  id: string;
  sport: string;
  league: string;
  phase: string;
  status: string;
  startsAt: number | null;
  updatedAt: number | null;
  away: AuraTeamViewModel;
  home: AuraTeamViewModel;
}

export interface AuraLiveScoreboardGame {
  gameId: string;
  sport?: string;
  league?: string;
  phase?: string;
  startsAtMs?: number;
  updatedAt?: number;
  teams?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface AuraGameScoreboard extends AuraLiveScoreboardGame {
  statusText?: string;
  statusDetail?: string;
}

export interface AuraLiveScoreboardFrame {
  gameId: string;
  updatedAt?: number | null;
  cursor?: string;
  revision?: number;
  observedAt?: number;
  publishedAt?: number;
  scoreboard: Record<string, unknown>;
  state?: Record<string, unknown>;
  latestPlay?: Record<string, unknown> | null;
  featuredPlayer?: Record<string, unknown> | null;
  freshness?: Record<string, unknown>;
  confidence?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface AuraLiveScoreboardStreamEvent {
  id: string;
  createdAt?: number;
  created?: number;
  observedAt?: number;
  [key: string]: unknown;
}

export interface AuraLiveScoreboardStream {
  url: string;
  close(): void;
}

export interface AuraGamePlayPage {
  gameId: string;
  pageSize: number;
  items: Record<string, unknown>[];
  hasMore: boolean;
  nextCursor: string | null;
}

export interface AuraGameBoxScore {
  id?: string;
  gameId: string;
  sport?: string;
  league?: string;
  phase?: string;
  teams?: unknown[] | Record<string, unknown>;
  players?: unknown[];
  [key: string]: unknown;
}

export type AuraBoxScoreField =
  | 'id'
  | 'gameId'
  | 'contractVersion'
  | 'sport'
  | 'league'
  | 'season'
  | 'seasonType'
  | 'captureClass'
  | 'phase'
  | 'observedAt'
  | 'completeness'
  | 'boxscoreVersion'
  | 'teams'
  | 'players';

export interface AuraGameReplay {
  gameId: string;
  requestedAt: number;
  replayAt: number;
  timeline?: {
    earliestObservedAt: number | null;
    latestObservedAt: number | null;
    hasPrevious: boolean;
    hasNext: boolean;
  };
  game: AuraLiveScoreboardGame;
  observation: AuraLiveScoreboardFrame;
  plays?: Record<string, unknown>[];
  [key: string]: unknown;
}

export interface AuraGameMetricCatalog {
  gameId: string;
  generatedAt: number;
  observedAt: number | null;
  metricCount: number;
  metrics: Array<{
    metric: string;
    definitionId?: string | null;
    entityId?: string | null;
    entityType?: string | null;
    label?: string;
    unit?: string | null;
    changeCount?: number;
    [key: string]: unknown;
  }>;
}

export interface AuraGameMetricSeriesPage {
  gameId: string;
  complete: boolean;
  hasMore: boolean;
  nextCursor: string | null;
  series: Array<{
    metric: string;
    definitionId: string | null;
    points: Array<{
      observedAt: number;
      value: unknown;
    }>;
  }>;
}

export type AuraGameMetricSeriesField =
  | 'gameId'
  | 'complete'
  | 'hasMore'
  | 'nextCursor'
  | 'series'
  | 'series.metric'
  | 'series.definitionId'
  | 'series.points'
  | 'series.points.observedAt'
  | 'series.points.value';

export interface AuraOddsTimeline {
  kind: 'aura.game.odds-timeline';
  contractVersion: '1.0.0';
  gameId: string;
  marketType: 'moneyline' | 'spread' | 'total';
  points: Array<{
    observedAt: number;
    outcomes: Array<{
      side: 'home' | 'away' | 'over' | 'under';
      line: number | null;
      price: number | null;
    }>;
  }>;
}

export type AuraOddsTimelineField =
  | 'kind'
  | 'contractVersion'
  | 'gameId'
  | 'marketType'
  | 'points'
  | 'points.observedAt'
  | 'points.outcomes'
  | 'points.outcomes.side'
  | 'points.outcomes.line'
  | 'points.outcomes.price';

export interface AuraLiveScoreboardClient {
  getNflDraft(options: { season: number; scoring: string; limit: number; view?: 'projection' | 'market'; position?: string; fields?: string }): Promise<Record<string, any>>;
  listScoreboard(
    date: string,
    options?: { sport?: string; status?: string; limit?: number; fields?: string }
  ): Promise<AuraGameScoreboard[]>;
  getGame(
    gameId: string,
    options?: { view?: 'card' | 'research' }
  ): Promise<AuraLiveScoreboardGame>;
  getGameFrame(gameId: string): Promise<AuraLiveScoreboardFrame>;
  getPlayerProps(
    gameId: string,
    options?: { category?: string; playerId?: string }
  ): Promise<AuraGamePlayerProps>;
  getGameReplay(
    gameId: string,
    options?: { at?: number; limit?: number; includeBoxscore?: boolean }
  ): Promise<AuraGameReplay>;
  listGamePlayPage(
    gameId: string,
    options?: { pageSize?: number; cursor?: string; fields?: string }
  ): Promise<AuraGamePlayPage>;
  listPlayerStats(gameId: string): Promise<Record<string, unknown>[]>;
  getGameBoxScore(gameId: string, options?: { fields?: AuraBoxScoreField[] | string }): Promise<AuraGameBoxScore>;
  getPlayer(id: string): Promise<Record<string, unknown>>;
  listGameMetrics(
    gameId: string,
    options?: {
      category?: string;
      entityType?: string;
      definitionId?: string;
    }
  ): Promise<AuraGameMetricCatalog>;
  listGameMetricSeries(
    gameId: string,
    options: {
      entityId?: string;
      definitionId?: string;
      limit?: number;
      cursor?: string;
      fields?: AuraGameMetricSeriesField[] | string;
    }
  ): Promise<AuraGameMetricSeriesPage>;
  getOddsTimeline(
    gameId: string,
    marketType?: 'moneyline' | 'spread' | 'runline' | 'total',
    options?: { fields?: AuraOddsTimelineField[] | string }
  ): Promise<AuraOddsTimeline>;
  getLeagueLandscape(
    options: Record<string, string | number | undefined>
  ): Promise<Record<string, unknown>>;
  streamGameFrames(
    gameId: string,
    options: {
      since?: number | string;
      onFrame?: (
        frame: AuraLiveScoreboardFrame,
        event: AuraLiveScoreboardStreamEvent
      ) => void;
      onError?: (error: unknown) => void;
    }
  ): AuraLiveScoreboardStream;
}

export interface AuraLiveScoreboardViewModel {
  id: string;
  gameId: string;
  status: Exclude<AuraLiveScoreboardStatus, 'connecting' | 'error'>;
  scoreboard: AuraScoreboardViewModel;
  cursor: string;
  revision: number;
  observedAt: number;
  publishedAt: number | null;
  freshness: {
    dataAsOf: number;
    ageMs: number;
    staleAfterMs: number;
    complete: boolean;
    missing: string[];
  };
  confidence: {
    score: number | null;
    band: string;
    reasons: string[];
  };
}

export interface AuraLiveScoreboardControllerState {
  status: AuraLiveScoreboardStatus;
  model: AuraLiveScoreboardViewModel | null;
  error: string | null;
  reconnectAttempt: number;
}

export function toAuraLiveScoreboardViewModel(
  game: AuraLiveScoreboardGame,
  frame: AuraLiveScoreboardFrame,
  options: {
    mode?: 'live' | 'replay';
    now?: number;
    staleAfterMs?: number;
  } = {}
): AuraLiveScoreboardViewModel {
  const now = options.now ?? Date.now();
  const staleAfterMs = Math.max(1_000, options.staleAfterMs ?? 45_000);
  const input = {
    ...game,
    ...frame.scoreboard,
    id: frame.gameId || game.gameId,
    sport: frame.scoreboard.sport || game.sport,
    league: frame.scoreboard.league || game.league,
    phase: frame.scoreboard.phase || game.phase,
    startsAt: frame.scoreboard.startsAt || game.startsAtMs,
    updatedAt: frame.scoreboard.updatedAt || frame.observedAt || game.updatedAt,
    teams: {
      away:
        (frame.scoreboard.away as Record<string, unknown> | undefined) ||
        (game.teams?.away as Record<string, unknown> | undefined),
      home:
        (frame.scoreboard.home as Record<string, unknown> | undefined) ||
        (game.teams?.home as Record<string, unknown> | undefined),
    },
  };
  const teams = input.teams || {};
  const scoreboard: AuraScoreboardViewModel = {
    id: String(input.id || ''),
    sport: String(input.sport || 'SPORT'),
    league: String(input.league || input.sport || ''),
    phase: String(input.phase || 'scheduled'),
    status: String(
      (input as Record<string, unknown>).statusDetail ||
        (input as Record<string, unknown>).statusText ||
        input.phase ||
        'Scheduled'
    ),
    startsAt: epoch(input.startsAt),
    updatedAt: epoch(input.updatedAt),
    away: teamViewModel(
      (teams.away as Record<string, unknown> | undefined) || {},
      'away'
    ),
    home: teamViewModel(
      (teams.home as Record<string, unknown> | undefined) || {},
      'home'
    ),
  };
  const freshness = frame.freshness || {};
  const confidence = frame.confidence || {};
  const dataAsOf = numeric(freshness.dataAsOf)
    ?? numeric(frame.updatedAt)
    ?? numeric(frame.observedAt)
    ?? numeric(game.updatedAt)
    ?? now;
  const ageMs = Math.max(0, now - dataAsOf);
  const phase = scoreboard.phase.toLowerCase();
  const status: AuraLiveScoreboardViewModel['status'] =
    options.mode === 'replay'
      ? 'replay'
      : phase === 'final'
        ? 'final'
        : phase === 'in_progress'
          ? freshness.state === 'stale' || ageMs > staleAfterMs
            ? 'stale'
            : 'live'
          : 'unavailable';

  return {
    id: `live-scoreboard:${frame.gameId}`,
    gameId: frame.gameId,
    status,
    scoreboard,
    cursor: frame.cursor || `snapshot:${frame.gameId}:${dataAsOf}`,
    revision: numeric(frame.revision) ?? 0,
    observedAt: numeric(frame.observedAt) ?? dataAsOf,
    publishedAt: numeric(frame.publishedAt),
    freshness: {
      dataAsOf,
      ageMs,
      staleAfterMs,
      complete: freshness.complete === undefined ? true : freshness.complete === true,
      missing: Array.isArray(freshness.missing)
        ? freshness.missing.map(String)
        : [],
    },
    confidence: {
      score: numeric(confidence.score),
      band: String(confidence.band || 'unavailable'),
      reasons: Array.isArray(confidence.reasons)
        ? confidence.reasons.map(String)
        : [],
    },
  };
}

export function auraLiveScoreboardResumeCursor(
  event: AuraLiveScoreboardStreamEvent
): string | null {
  const time =
    numeric(event.createdAt) ??
    numeric(event.created) ??
    numeric(event.observedAt);
  if (time === null) return null;
  return event.id ? `${time}:${event.id}` : String(time);
}

export function auraLiveScoreboardError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function auraLiveScoreboardShouldResetCursor(
  error: unknown
): boolean {
  return (
    error instanceof Error &&
    (error as Error & { resetCursor?: boolean }).resetCursor === true
  );
}

export function auraLiveScoreboardRetryAfterMs(
  error: unknown
): number | null {
  if (!(error instanceof Error)) return null;
  const raw =
    (error as Error & { retryAfterMs?: number }).retryAfterMs;
  if (typeof raw !== 'number') return null;
  const retryAfterMs = Number(raw);
  return Number.isFinite(retryAfterMs) && retryAfterMs >= 0
    ? retryAfterMs
    : null;
}

function teamViewModel(
  input: Record<string, unknown>,
  fallbackId: string
): AuraTeamViewModel {
  return {
    id: String(input.id || fallbackId),
    abbreviation: String(
      input.abbreviation || input.shortName || fallbackId
    ).toUpperCase(),
    name: String(
      input.displayName || input.name || input.abbreviation || fallbackId
    ),
    score: numeric(input.score),
    color: teamColor(input.color),
    record: input.record ? String(input.record) : null,
  };
}

function teamColor(value: unknown): string {
  const text = String(value || '').replace(/^#/, '');
  return /^[0-9a-f]{6}$/i.test(text) ? `#${text}` : '#82908a';
}

function epoch(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function numeric(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export interface AuraGamePlayerPropOutcome {
  side: 'over' | 'under' | 'yes' | 'no';
  price: number;
}

export interface AuraGamePlayerProp {
  id: string;
  definition: { id: string; label: string; category: string; unit: string };
  player: { id: string; name: string; teamId?: string };
  line: number | null;
  outcomes: AuraGamePlayerPropOutcome[];
  status: 'open' | 'live' | 'closed';
  observedAt: number;
  settlement?: {
    result: number;
    outcome: 'over' | 'under' | 'push' | 'yes' | 'no' | 'void';
    status: 'final' | 'corrected';
    settledAt: number;
  };
}

export interface AuraGamePropConsensusPoint {
  line: number;
  overPrice?: number;
  underPrice?: number;
  overProbability?: number;
  underProbability?: number;
  sourceCount: number;
  oneSided?: boolean;
}

/** The reconciled multi-source consensus per player+prop: the full quoted line
 *  ladder with the elected main line. Sources are counted, never named. */
export interface AuraGamePropConsensus {
  playerId: string;
  definitionId: string;
  mainLine: number | null;
  sourceCount: number;
  reconciliation: 'confirmed' | 'single_source';
  lines: AuraGamePropConsensusPoint[];
  asOf: number;
}

export interface AuraGamePlayerProps {
  kind: 'aura.game.player-props';
  contractVersion: '1.0.0';
  gameId: string;
  generatedAt: number;
  props: AuraGamePlayerProp[];
  consensus?: AuraGamePropConsensus[];
}
