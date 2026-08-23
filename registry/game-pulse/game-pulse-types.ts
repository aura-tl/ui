import {
  auraLiveScoreboardResumeCursor,
  toAuraLiveScoreboardViewModel,
  type AuraLiveScoreboardClient,
  type AuraLiveScoreboardFrame,
  type AuraLiveScoreboardGame,
  type AuraLiveScoreboardStreamEvent,
  type AuraScoreboardViewModel,
} from '@/lib/aura/live-scoreboard-types';

export type AuraGamePulseMode = 'fixture' | 'replay' | 'live';
export type AuraGamePulseStatus =
  | 'connecting'
  | 'live'
  | 'stale'
  | 'final'
  | 'replay'
  | 'unavailable'
  | 'error';

export interface AuraGamePulsePoint {
  observedAt: number;
  value: number;
}

export interface AuraGamePulseBand {
  id: string;
  label: string;
  startAt: number;
  endAt: number;
}

export interface AuraGamePulseModel {
  id: string;
  gameId: string;
  mode: AuraGamePulseMode;
  scoreboard: AuraScoreboardViewModel;
  startAt: number;
  endAt: number;
  cursor: string | null;
  probability: {
    home: AuraGamePulsePoint[];
    away: AuraGamePulsePoint[];
    unavailable: string | null;
  };
  score: {
    home: AuraGamePulsePoint[];
    away: AuraGamePulsePoint[];
  };
  margin: {
    points: AuraGamePulsePoint[];
    unit: 'runs' | 'points';
    unavailable: string | null;
  };
  periods: AuraGamePulseBand[];
  periodState: Array<{
    observedAt: number;
    number?: number;
    state?: string;
  }>;
  periodUnavailable: string | null;
  complete: boolean;
  missing: string[];
}

export interface AuraGamePulseControllerState {
  status: AuraGamePulseStatus;
  model: AuraGamePulseModel | null;
  error: string | null;
  reconnectAttempt: number;
}

export interface AuraGamePulseSnapshot {
  game: AuraLiveScoreboardGame;
  frame: AuraLiveScoreboardFrame;
  model: AuraGamePulseModel;
}

type MetricSeries = {
  metric: string;
  definitionId?: string | null;
  points: Array<{ observedAt: number; value: unknown }>;
};

const DEFINITIONS = [
  'sport.game.win_probability',
  'sport.game.score',
  'baseball.game.inning_number',
  'baseball.game.inning_state',
  'basketball.game.period_number',
];

export async function loadAuraGamePulseSnapshot(
  client: AuraLiveScoreboardClient,
  gameId: string,
  mode?: Exclude<AuraGamePulseMode, 'fixture'>
): Promise<AuraGamePulseSnapshot> {
  const [game, frame, catalog] = await Promise.all([
    client.getGame(gameId, { view: 'research' }),
    client.getGameFrame(gameId),
    client.listGameMetrics(gameId),
  ]);
  const presentDefinitions = [
    ...new Set(
      catalog.metrics
        .map((metric) => metric.definitionId)
        .filter(
          (definitionId): definitionId is string =>
            typeof definitionId === 'string' &&
            DEFINITIONS.includes(definitionId)
        )
    ),
  ];
  const { series, complete } = await loadCompleteSeries(
    client,
    gameId,
    presentDefinitions
  );
  return {
    game,
    frame,
    model: buildModel(game, frame, series, complete, mode),
  };
}

export function applyAuraGamePulseFrame(
  model: AuraGamePulseModel,
  game: AuraLiveScoreboardGame,
  frame: AuraLiveScoreboardFrame
): AuraGamePulseModel {
  const scoreboard = withLegiblePulseColors(
    toAuraLiveScoreboardViewModel(game, frame).scoreboard
  );
  const homeProbability = [...model.probability.home];
  const awayProbability = [...model.probability.away];
  const homeScore = [...model.score.home];
  const awayScore = [...model.score.away];
  const periodPoints: Array<{ observedAt: number; number?: number; state?: string }> =
    [...model.periodState];

  for (const delta of Array.isArray(frame.metricDeltas)
    ? frame.metricDeltas as Array<Record<string, unknown>>
    : []) {
    const point = numericPoint(frame.observedAt, delta.value);
    const metric = String(delta.metric || '');
    if (point && metric === 'game.winProbability.home') {
      appendPoint(homeProbability, point);
    } else if (point && metric === 'game.winProbability.away') {
      appendPoint(awayProbability, point);
    } else if (point && metric === 'game.score.home') {
      appendPoint(homeScore, point);
    } else if (point && metric === 'game.score.away') {
      appendPoint(awayScore, point);
    } else if (point && metric === 'game.period.number') {
      periodPoints.push({ observedAt: point.observedAt, number: point.value });
    } else if (point && metric === 'game.inning.number') {
      periodPoints.push({ observedAt: point.observedAt, number: point.value });
    } else if (metric === 'game.inning.state') {
      periodPoints.push({
        observedAt: frame.observedAt,
        state: String(delta.value || ''),
      });
    }
  }

  const endAt = Math.max(
    model.endAt,
    frame.observedAt,
    ...homeProbability.map((point) => point.observedAt),
    ...awayProbability.map((point) => point.observedAt)
  );
  return {
    ...model,
    mode:
      scoreboard.phase.toLowerCase() === 'in_progress'
        ? 'live'
        : model.mode,
    scoreboard,
    endAt,
    cursor: frame.cursor,
    probability: pairedProbability(homeProbability, awayProbability),
    score: {
      home: homeScore,
      away: awayScore,
    },
    margin: {
      ...model.margin,
      points: mergeMargin(homeScore, awayScore),
      unavailable:
        homeScore.length && awayScore.length
          ? null
          : 'Score margin is unavailable because one team has no retained score series.',
    },
    periods: buildPeriodBands(
      periodPoints,
      scoreboard.sport,
      model.startAt,
      endAt
    ),
    periodState: periodPoints,
  };
}

export function auraGamePulseResumeCursor(
  event: AuraLiveScoreboardStreamEvent
): string | null {
  return auraLiveScoreboardResumeCursor(event);
}

export function auraGamePulseValueAt(
  points: AuraGamePulsePoint[],
  observedAt: number,
  interpolation: 'linear' | 'step' = 'step'
): number | null {
  if (!points.length) return null;
  if (observedAt <= points[0].observedAt) return points[0].value;
  const last = points[points.length - 1];
  if (observedAt >= last.observedAt) return last.value;
  for (let index = 1; index < points.length; index += 1) {
    const right = points[index];
    if (right.observedAt < observedAt) continue;
    const left = points[index - 1];
    if (interpolation === 'step') return left.value;
    const progress =
      (observedAt - left.observedAt) /
      Math.max(1, right.observedAt - left.observedAt);
    return left.value + (right.value - left.value) * progress;
  }
  return last.value;
}

function buildModel(
  game: AuraLiveScoreboardGame,
  frame: AuraLiveScoreboardFrame,
  series: MetricSeries[],
  complete: boolean,
  requestedMode?: Exclude<AuraGamePulseMode, 'fixture'>
): AuraGamePulseModel {
  const scoreboard = withLegiblePulseColors(
    toAuraLiveScoreboardViewModel(game, frame, {
      mode: requestedMode,
    }).scoreboard
  );
  const homeProbability = pointsFor(series, 'game.winProbability.home');
  const awayProbability = pointsFor(series, 'game.winProbability.away');
  const homeScore = pointsFor(series, 'game.score.home');
  const awayScore = pointsFor(series, 'game.score.away');
  const periodNumber = pointsFor(
    series,
    scoreboard.sport === 'MLB'
      ? 'game.inning.number'
      : 'game.period.number'
  );
  const inningState = rawPointsFor(series, 'game.inning.state');
  const allPoints = [
    ...homeProbability,
    ...awayProbability,
    ...homeScore,
    ...awayScore,
    ...periodNumber,
  ];
  const fallback = frame.observedAt || scoreboard.updatedAt || Date.now();
  const startAt = allPoints.length
    ? Math.min(...allPoints.map((point) => point.observedAt))
    : fallback;
  const endAt = allPoints.length
    ? Math.max(...allPoints.map((point) => point.observedAt))
    : fallback;
  const periodPoints = [
    ...periodNumber.map((point) => ({
      observedAt: point.observedAt,
      number: point.value,
    })),
    ...inningState.map((point) => ({
      observedAt: point.observedAt,
      state: String(point.value || ''),
    })),
  ];
  const periods = buildPeriodBands(
    periodPoints,
    scoreboard.sport,
    startAt,
    endAt
  );
  const missing = [
    ...(homeProbability.length && awayProbability.length
      ? []
      : ['win_probability']),
    ...(homeScore.length && awayScore.length ? [] : ['score_margin']),
    ...(periods.length ? [] : ['period_state']),
    ...(complete ? [] : ['metric_series_tail']),
  ];
  return {
    id: `game-pulse:${frame.gameId}`,
    gameId: frame.gameId,
    mode:
      requestedMode ||
      (scoreboard.phase.toLowerCase() === 'in_progress'
        ? 'live'
        : 'replay'),
    scoreboard,
    startAt,
    endAt,
    cursor: frame.cursor,
    probability: pairedProbability(homeProbability, awayProbability),
    score: {
      home: homeScore,
      away: awayScore,
    },
    margin: {
      points: mergeMargin(homeScore, awayScore),
      unit: scoreboard.sport === 'MLB' ? 'runs' : 'points',
      unavailable:
        homeScore.length && awayScore.length
          ? null
          : 'Score margin is unavailable because one team has no retained score series.',
    },
    periods,
    periodState: periodPoints,
    periodUnavailable: periods.length
      ? null
      : 'No sport-native period history was retained for this game.',
    complete,
    missing,
  };
}

async function loadCompleteSeries(
  client: AuraLiveScoreboardClient,
  gameId: string,
  definitionIds: string[]
): Promise<{ series: MetricSeries[]; complete: boolean }> {
  if (!definitionIds.length) return { series: [], complete: true };
  const pages = [];
  let cursor: string | undefined;
  for (let page = 0; page < 20; page += 1) {
    const response = await client.listGameMetricSeries(gameId, {
      definitionId: definitionIds.join(','),
      limit: 500,
      cursor,
    });
    pages.push(response);
    if (response.complete || !response.nextCursor) {
      return {
        series: mergeSeries(pages.flatMap((entry) => entry.series)),
        complete: response.complete,
      };
    }
    if (response.nextCursor === cursor) break;
    cursor = response.nextCursor;
  }
  return {
    series: mergeSeries(pages.flatMap((entry) => entry.series)),
    complete: false,
  };
}

function mergeSeries(input: MetricSeries[]): MetricSeries[] {
  const merged = new Map<string, MetricSeries>();
  for (const series of input) {
    const current = merged.get(series.metric);
    merged.set(series.metric, {
      ...current,
      ...series,
      points: [
        ...(current?.points || []),
        ...(Array.isArray(series.points) ? series.points : []),
      ].sort((left, right) => left.observedAt - right.observedAt),
    });
  }
  return [...merged.values()];
}

function pointsFor(
  series: MetricSeries[],
  metric: string
): AuraGamePulsePoint[] {
  return rawPointsFor(series, metric)
    .flatMap((point) => {
      const value = Number(point.value);
      return Number.isFinite(value)
        ? [{ observedAt: point.observedAt, value }]
        : [];
    });
}

function rawPointsFor(
  series: MetricSeries[],
  metric: string
): Array<{ observedAt: number; value: unknown }> {
  return (series.find((entry) => entry.metric === metric)?.points || [])
    .filter((point) => Number.isFinite(Number(point.observedAt)))
    .sort((left, right) => left.observedAt - right.observedAt);
}

function pairedProbability(
  home: AuraGamePulsePoint[],
  away: AuraGamePulsePoint[]
): AuraGamePulseModel['probability'] {
  return {
    home,
    away,
    unavailable:
      home.length && away.length
        ? null
        : 'Both teams must have retained probability. Aura will not synthesize the missing side.',
  };
}

function mergeMargin(
  home: AuraGamePulsePoint[],
  away: AuraGamePulsePoint[]
): AuraGamePulsePoint[] {
  const times = [
    ...new Set([
      ...home.map((point) => point.observedAt),
      ...away.map((point) => point.observedAt),
    ]),
  ].sort((left, right) => left - right);
  return times.flatMap((observedAt) => {
    const homeValue = auraGamePulseValueAt(home, observedAt);
    const awayValue = auraGamePulseValueAt(away, observedAt);
    return homeValue === null || awayValue === null
      ? []
      : [{ observedAt, value: homeValue - awayValue }];
  });
}

function buildPeriodBands(
  input: Array<{ observedAt: number; number?: number; state?: string }>,
  sport: string,
  startAt: number,
  endAt: number
): AuraGamePulseBand[] {
  const sorted = [...input].sort(
    (left, right) => left.observedAt - right.observedAt
  );
  let number: number | null = null;
  let state = '';
  const starts: Array<{ observedAt: number; label: string }> = [];
  for (const point of sorted) {
    if (Number.isFinite(Number(point.number))) number = Number(point.number);
    if (point.state) state = point.state;
    if (number === null) continue;
    const label =
      sport === 'MLB'
        ? baseballPeriodLabel(number, state)
        : number <= 4
          ? `Q${number}`
          : `OT${number - 4}`;
    if (!label) continue;
    if (starts.at(-1)?.label !== label) {
      starts.push({ observedAt: point.observedAt, label });
    }
  }
  return starts.map((point, index) => ({
    id: `period:${point.label}:${point.observedAt}`,
    label: point.label,
    startAt: Math.max(startAt, point.observedAt),
    endAt: Math.max(
      point.observedAt,
      starts[index + 1]?.observedAt ?? endAt
    ),
  }));
}

function baseballPeriodLabel(number: number, state: string): string | null {
  const normalized = state.toLowerCase();
  if (normalized.includes('top')) return `T${number}`;
  if (normalized.includes('bottom')) return `B${number}`;
  return null;
}

function numericPoint(
  observedAt: number,
  value: unknown
): AuraGamePulsePoint | null {
  const number = Number(value);
  return Number.isFinite(number) && Number.isFinite(observedAt)
    ? { observedAt, value: number }
    : null;
}

function appendPoint(
  points: AuraGamePulsePoint[],
  point: AuraGamePulsePoint
) {
  const previous = points.at(-1);
  if (
    previous &&
    previous.observedAt === point.observedAt &&
    previous.value === point.value
  ) {
    return;
  }
  points.push(point);
  points.sort((left, right) => left.observedAt - right.observedAt);
}

function withLegiblePulseColors(
  scoreboard: AuraScoreboardViewModel
): AuraScoreboardViewModel {
  return {
    ...scoreboard,
    away: {
      ...scoreboard.away,
      color: legiblePulseColor(scoreboard.away.color),
    },
    home: {
      ...scoreboard.home,
      color: legiblePulseColor(scoreboard.home.color),
    },
  };
}

function legiblePulseColor(input: string): string {
  const match = String(input).match(/^#?([0-9a-f]{6})$/i);
  if (!match) return '#8cf6b5';
  let rgb = [0, 2, 4].map((offset) =>
    Number.parseInt(match[1].slice(offset, offset + 2), 16)
  );
  const canvas = [10, 13, 11];
  for (let attempt = 0; attempt < 8; attempt += 1) {
    if (contrast(rgb, canvas) >= 4.5) break;
    rgb = rgb.map((channel) =>
      Math.round(channel + (255 - channel) * 0.18)
    );
  }
  return `#${rgb
    .map((channel) => channel.toString(16).padStart(2, '0'))
    .join('')}`;
}

function contrast(left: number[], right: number[]): number {
  const leftLuminance = luminance(left);
  const rightLuminance = luminance(right);
  return (
    (Math.max(leftLuminance, rightLuminance) + 0.05) /
    (Math.min(leftLuminance, rightLuminance) + 0.05)
  );
}

function luminance(rgb: number[]): number {
  const [red, green, blue] = rgb.map((channel) => {
    const value = channel / 255;
    return value <= 0.03928
      ? value / 12.92
      : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}
