import type {
  AuraLiveScoreboardClient,
  AuraLiveScoreboardFrame,
  AuraLiveScoreboardGame,
  AuraLiveScoreboardStreamEvent,
  AuraScoreboardViewModel,
} from '@/lib/aura/live-scoreboard-types';
import {
  auraLiveScoreboardError,
  auraLiveScoreboardResumeCursor,
  auraLiveScoreboardRetryAfterMs,
  auraLiveScoreboardShouldResetCursor,
  toAuraLiveScoreboardViewModel,
} from '@/lib/aura/live-scoreboard-types';

export type AuraGamecastMode = 'fixture' | 'replay' | 'live';
export type AuraGamecastSurface = 'diamond' | 'court' | 'field';
export type AuraGamecastStatus =
  | 'connecting'
  | 'live'
  | 'stale'
  | 'final'
  | 'replay'
  | 'unavailable'
  | 'error';

export interface AuraGamecastStat {
  key: string;
  label: string;
  value: string;
  delta?: string;
}

export interface AuraGamecastPlayer {
  id: string;
  name: string;
  team: string | null;
  role: string | null;
  headshotUrl: string | null;
  stats: AuraGamecastStat[];
  statsAsOf: number | null;
  statsMode: 'at_frame' | 'latest';
  statsComplete: boolean;
}

export interface AuraGamecastPlay {
  id: string;
  sequence: number;
  occurredAt: number;
  observedAt: number;
  text: string;
  type: string;
  scoring: boolean;
  period: number | null;
  clock: string | null;
  awayScore: number;
  homeScore: number;
  coordinates: { x: number; y: number } | null;
  participantIds: string[];
  participantRoles: Record<string, string>;
}

export interface AuraGamecastFrame {
  cursor: string;
  revision: number;
  gameId: string;
  observedAt: number;
  publishedAt?: number;
  scoreboard: AuraScoreboardViewModel;
  state: {
    surface: AuraGamecastSurface;
    label: string;
    possessionTeamId: string | null;
    coordinates: { x: number; y: number } | null;
  };
  play: AuraGamecastPlay;
  featuredPlayer: AuraGamecastPlayer | null;
  freshness: {
    dataAsOf: number;
    ageMs: number;
    complete: boolean;
    missing: string[];
  };
  changes: {
    score: boolean;
    featuredPlayer: boolean;
    position: boolean;
  };
}

export interface AuraGamecastModel {
  id: string;
  mode: AuraGamecastMode;
  sport: string;
  surface: AuraGamecastSurface;
  scoreboard: AuraScoreboardViewModel;
  frames: AuraGamecastFrame[];
}

export interface AuraGamecastControllerState {
  status: AuraGamecastStatus;
  model: AuraGamecastModel | null;
  error: string | null;
  reconnectAttempt: number;
}

export interface AuraGamecastStream {
  url: string;
  close(): void;
}

export type AuraGamecastClient = AuraLiveScoreboardClient;
export {
  auraLiveScoreboardError as auraGamecastError,
  auraLiveScoreboardResumeCursor as auraGamecastResumeCursor,
  auraLiveScoreboardRetryAfterMs as auraGamecastRetryAfterMs,
  auraLiveScoreboardShouldResetCursor as auraGamecastShouldResetCursor,
};

export function auraGamecastFrameAt(
  model: AuraGamecastModel,
  index: number
): AuraGamecastFrame {
  if (!model.frames.length) throw new Error('Aura gamecast has no frames.');
  return model.frames[
    Math.max(0, Math.min(model.frames.length - 1, Math.floor(index)))
  ];
}

export function toAuraLiveGamecastModel(
  game: AuraLiveScoreboardGame,
  frame: AuraLiveScoreboardFrame,
  previousFrames: AuraGamecastFrame[] = []
): AuraGamecastModel {
  const scoreboard = toAuraLiveScoreboardViewModel(game, frame).scoreboard;
  const normalized = normalizePublishedFrame(frame, scoreboard);
  const frames = mergeFrames(previousFrames, normalized);
  return {
    id: frame.gameId,
    mode: scoreboard.phase === 'final' ? 'replay' : 'live',
    sport: scoreboard.sport,
    surface: normalized.state.surface,
    scoreboard,
    frames,
  };
}

export async function loadAuraGamecastReplay(
  client: AuraGamecastClient,
  gameId: string
): Promise<AuraGamecastModel> {
  const [game, latestFrame, playerStats, rawPlays] = await Promise.all([
    client.getGame(gameId, { view: 'card' }),
    client.getGameFrame(gameId),
    client.listPlayerStats(gameId).catch(() => []),
    loadCompletePlayArchive(client, gameId),
  ]);
  const scoreboard = toAuraLiveScoreboardViewModel(
    game,
    latestFrame,
    { mode: 'replay' }
  ).scoreboard;
  const plays = rawPlays
    .map(toPlay)
    .filter((play): play is AuraGamecastPlay => Boolean(play))
    .sort(
      (left, right) =>
        left.occurredAt - right.occurredAt || left.id.localeCompare(right.id)
    )
    .map((play, index) => ({ ...play, sequence: index + 1 }));
  if (!plays.length) throw new Error(`No retained plays for ${gameId}.`);

  const actorIds = [
    ...new Set(plays.flatMap((play) => play.participantIds)),
  ].slice(0, 80);
  const entities = await Promise.all(
    actorIds.map(async (sourcePlayerId) => {
      const canonicalId =
        `${scoreboard.sport.toLowerCase()}:multi_source:player:${sourcePlayerId}`;
      try {
        return [
          sourcePlayerId,
          await client.getPlayer(canonicalId),
        ] as const;
      } catch {
        return [sourcePlayerId, null] as const;
      }
    })
  );
  const entityBySourceId = new Map(entities);
  const statsBySourceId = new Map(
    playerStats.map((row) => [
      sourceId(row.canonicalPlayerId || row.id),
      row,
    ])
  );
  const surface = surfaceForSport(scoreboard.sport);
  let previous: AuraGamecastFrame | null = null;
  const frames = plays.map((play, index) => {
    const featuredId = chooseFeaturedPlayer(
      play,
      entityBySourceId,
      statsBySourceId
    );
    const featuredPlayer = featuredId
      ? toFeaturedPlayer(
          featuredId,
          scoreboard.sport,
          entityBySourceId.get(featuredId),
          statsBySourceId.get(featuredId),
          play.observedAt
        )
      : null;
    const missing = [
      ...(featuredPlayer ? [] : ['featuredPlayer']),
      ...(play.coordinates ? [] : ['coordinates']),
      ...(featuredPlayer ? ['historicalPlayerLine'] : []),
    ];
    const frame: AuraGamecastFrame = {
      cursor: `${gameId}:${play.id}`,
      revision: index + 1,
      gameId,
      observedAt: play.observedAt,
      scoreboard: {
        ...scoreboard,
        updatedAt: play.observedAt,
        status: play.period
          ? `${periodLabel(scoreboard.sport, play.period)}${
              play.clock ? ` · ${play.clock}` : ''
            }`
          : scoreboard.status,
        away: { ...scoreboard.away, score: play.awayScore },
        home: { ...scoreboard.home, score: play.homeScore },
      },
      state: {
        surface,
        label: play.period
          ? periodLabel(scoreboard.sport, play.period)
          : scoreboard.status,
        possessionTeamId: null,
        coordinates: normalizeCoordinates(play.coordinates, surface),
      },
      play,
      featuredPlayer,
      freshness: {
        dataAsOf: play.observedAt,
        ageMs: Math.max(0, Date.now() - play.observedAt),
        complete: missing.length === 0,
        missing,
      },
      changes: {
        score:
          !previous ||
          play.awayScore !== previous.play.awayScore ||
          play.homeScore !== previous.play.homeScore,
        featuredPlayer:
          !previous ||
          featuredPlayer?.id !== previous.featuredPlayer?.id,
        position:
          !previous ||
          play.coordinates?.x !== previous.play.coordinates?.x ||
          play.coordinates?.y !== previous.play.coordinates?.y,
      },
    };
    previous = frame;
    return frame;
  });
  return {
    id: gameId,
    mode: 'replay',
    sport: scoreboard.sport,
    surface,
    scoreboard,
    frames,
  };
}

async function loadCompletePlayArchive(
  client: AuraGamecastClient,
  gameId: string
): Promise<Record<string, unknown>[]> {
  const plays: Record<string, unknown>[] = [];
  const seenIds = new Set<string>();
  const seenCursors = new Set<string>();
  let cursor: string | undefined;
  for (let pageNumber = 0; pageNumber < 50; pageNumber += 1) {
    const page = await client.listGamePlayPage(gameId, {
      pageSize: 250,
      cursor,
    });
    for (const play of page.items || []) {
      const id = String(play.id || '');
      if (!id || seenIds.has(id)) continue;
      seenIds.add(id);
      plays.push(play);
    }
    if (!page.hasMore) return plays;
    if (!page.nextCursor || seenCursors.has(page.nextCursor)) {
      throw new Error(`Aura replay pagination stalled for ${gameId}.`);
    }
    seenCursors.add(page.nextCursor);
    cursor = page.nextCursor;
  }
  throw new Error(`Aura replay pagination exceeded 50 pages for ${gameId}.`);
}

function normalizePublishedFrame(
  input: AuraLiveScoreboardFrame,
  scoreboard: AuraScoreboardViewModel
): AuraGamecastFrame {
  const raw = input as Record<string, any>;
  const observedAt = numeric(input.updatedAt) || numeric(input.observedAt) || Date.now();
  const cursor = input.cursor || `snapshot:${input.gameId}:${observedAt}`;
  const revision = numeric(input.revision) || 0;
  const rawPlay = raw.latestPlay || raw.play || {};
  const play = toPlay({
    ...rawPlay,
    id: rawPlay.id || cursor,
    observedAt: rawPlay.observedAt || observedAt,
    awayScore: rawPlay.awayScore ?? scoreboard.away.score,
    homeScore: rawPlay.homeScore ?? scoreboard.home.score,
  }) || {
    id: cursor,
    sequence: revision,
    occurredAt: observedAt,
    observedAt,
    text: 'Game update',
    type: 'update',
    scoring: false,
    period: null,
    clock: null,
    awayScore: scoreboard.away.score || 0,
    homeScore: scoreboard.home.score || 0,
    coordinates: null,
    participantIds: [],
    participantRoles: {},
  };
  const rawState = raw.state || {};
  const rawFreshness = raw.freshness || {};
  return {
    cursor,
    revision,
    gameId: input.gameId,
    observedAt,
    publishedAt: numeric(input.publishedAt) || undefined,
    scoreboard,
    state: {
      surface: validSurface(rawState.surface)
        ? rawState.surface
        : surfaceForSport(scoreboard.sport),
      label: String(rawState.label || scoreboard.status),
      possessionTeamId: rawState.possessionTeamId
        ? String(rawState.possessionTeamId)
        : null,
      coordinates: toCoordinates(rawState.coordinates || play.coordinates),
    },
    play,
    featuredPlayer: raw.featuredPlayer
      ? normalizePlayer(raw.featuredPlayer)
      : null,
    freshness: {
      dataAsOf:
        numeric(rawFreshness.dataAsOf) || observedAt,
      ageMs: Math.max(
        0,
        numeric(rawFreshness.ageMs) ||
          Date.now() -
            (numeric(rawFreshness.dataAsOf) || observedAt)
      ),
      complete: rawFreshness.complete === undefined ? true : rawFreshness.complete === true,
      missing: Array.isArray(rawFreshness.missing)
        ? rawFreshness.missing.map(String)
        : [],
    },
    changes: {
      score: raw.changes?.score === true,
      featuredPlayer: raw.changes?.featuredPlayer === true,
      position: raw.changes?.position === true,
    },
  };
}

function mergeFrames(
  frames: AuraGamecastFrame[],
  frame: AuraGamecastFrame
): AuraGamecastFrame[] {
  const existing = frames.findIndex(
    (candidate) => candidate.cursor === frame.cursor
  );
  if (existing >= 0) {
    const next = [...frames];
    next[existing] = frame;
    return next;
  }
  return [...frames, frame]
    .sort(
      (left, right) =>
        left.observedAt - right.observedAt ||
        left.revision - right.revision
    )
    .slice(-250);
}

function toPlay(input: Record<string, any>): AuraGamecastPlay | null {
  const id = String(input.id || '');
  if (!id) return null;
  const participantRoles = Object.fromEntries(
    Object.entries(input.participants || input.participantRoles || {}).map(
      ([role, participantId]) => [role, sourceId(participantId)]
    )
  );
  const participantIds = [
    ...new Set(
      (
        Array.isArray(input.participantIds)
          ? input.participantIds.map(sourceId)
          : Object.values(participantRoles)
      ).filter(Boolean)
    ),
  ];
  const wallclock = Date.parse(String(input.wallclock || ''));
  const observedAt =
    numeric(input.observedAt || input.updated) ||
    (Number.isFinite(wallclock) ? wallclock : Date.now());
  return {
    id,
    sequence: numeric(input.sequence) || 0,
    occurredAt: Number.isFinite(wallclock)
      ? wallclock
      : numeric(input.occurredAt) || observedAt,
    observedAt,
    text: String(input.text || 'Play update'),
    type: String(input.type || 'play'),
    scoring: Boolean(input.scoringPlay ?? input.scoring),
    period: numeric(input.period),
    clock: input.clock ? String(input.clock) : null,
    awayScore: numeric(input.awayScore) || 0,
    homeScore: numeric(input.homeScore) || 0,
    coordinates: toCoordinates(input.coordinates),
    participantIds,
    participantRoles,
  };
}

function chooseFeaturedPlayer(
  play: AuraGamecastPlay,
  entities: Map<string, Record<string, any> | null>,
  stats: Map<string, Record<string, any>>
): string | undefined {
  const text = normalizeName(play.text);
  const named = play.participantIds.find((id) => {
    const name = normalizeName(
      entities.get(id)?.name?.display || stats.get(id)?.playerName || ''
    );
    const last = name.split(' ').filter(Boolean).pop() || '';
    return Boolean(name && (text.startsWith(name) || text.startsWith(last)));
  });
  if (named) return named;
  const priorities = [
    'batter',
    'scorer',
    'shooter',
    'actor',
    'runner',
    'pitcher',
  ];
  for (const priority of priorities) {
    const match = Object.entries(play.participantRoles).find(
      ([role, id]) =>
        role.split(':')[0].toLowerCase() === priority && Boolean(id)
    );
    if (match) return match[1];
  }
  return play.participantIds[0];
}

function toFeaturedPlayer(
  sourcePlayerId: string,
  sport: string,
  entity: Record<string, any> | null | undefined,
  statRow: Record<string, any> | undefined,
  observedAt: number
): AuraGamecastPlayer {
  const preferred =
    sport.toUpperCase() === 'WNBA'
      ? [
          ['points', 'PTS'],
          ['rebounds', 'REB'],
          ['assists', 'AST'],
          ['steals', 'STL'],
        ]
      : [
          ['hits', 'H'],
          ['runs', 'R'],
          ['RBIs', 'RBI'],
          ['homeRuns', 'HR'],
        ];
  const values = statRow?.stats || {};
  return {
    id: String(
      entity?.id ||
        statRow?.canonicalPlayerId ||
        `${sport.toLowerCase()}:multi_source:player:${sourcePlayerId}`
    ),
    name: String(
      entity?.name?.display || statRow?.playerName || 'Player update'
    ),
    team: statRow?.teamName
      ? String(statRow.teamName)
      : entity?.currentTeam?.abbreviation || null,
    role: entity?.position?.abbreviation || statRow?.position || null,
    headshotUrl: entity?.media?.headshot
      ? String(entity.media.headshot)
      : null,
    stats: preferred.flatMap(([key, label]) =>
      values[key] === undefined || values[key] === null
        ? []
        : [{ key, label, value: String(values[key]) }]
    ),
    statsAsOf:
      numeric(statRow?.observedAt || statRow?.updated) || observedAt,
    statsMode: 'latest',
    statsComplete: false,
  };
}

function normalizePlayer(input: Record<string, any>): AuraGamecastPlayer {
  return {
    id: String(input.id || 'player'),
    name: String(input.name || 'Player update'),
    team: input.team ? String(input.team) : null,
    role: input.role ? String(input.role) : null,
    headshotUrl: input.headshotUrl ? String(input.headshotUrl) : null,
    stats: Array.isArray(input.stats)
      ? input.stats.map((stat: Record<string, unknown>) => ({
          key: String(stat.key || stat.label || 'stat'),
          label: String(stat.label || stat.key || 'STAT'),
          value: String(stat.value ?? '—'),
          ...(stat.delta ? { delta: String(stat.delta) } : {}),
        }))
      : [],
    statsAsOf: numeric(input.statsAsOf),
    statsMode: input.statsMode === 'at_frame' ? 'at_frame' : 'latest',
    statsComplete: input.statsComplete === true,
  };
}

function normalizeName(value: unknown): string {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function sourceId(value: unknown): string {
  return String(value || '').split(':').pop() || '';
}

function numeric(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function toCoordinates(
  value: unknown
): { x: number; y: number } | null {
  if (!value || typeof value !== 'object') return null;
  const x = numeric((value as Record<string, unknown>).x);
  const y = numeric((value as Record<string, unknown>).y);
  if (x === null || y === null) return null;
  return { x, y };
}

function normalizeCoordinates(
  value: { x: number; y: number } | null,
  surface: AuraGamecastSurface
): { x: number; y: number } | null {
  if (!value) return null;
  return {
    x: Math.max(0, Math.min(100, surface === 'court' ? value.x * 2 : value.x)),
    y: Math.max(0, Math.min(100, value.y)),
  };
}

function validSurface(value: unknown): value is AuraGamecastSurface {
  return value === 'court' || value === 'diamond' || value === 'field';
}

function surfaceForSport(sport: string): AuraGamecastSurface {
  if (sport.toUpperCase() === 'MLB') return 'diamond';
  if (sport.toUpperCase() === 'WNBA') return 'court';
  return 'field';
}

function periodLabel(sport: string, period: number): string {
  const suffix =
    period % 100 >= 11 && period % 100 <= 13
      ? 'th'
      : period % 10 === 1
        ? 'st'
        : period % 10 === 2
          ? 'nd'
          : period % 10 === 3
            ? 'rd'
            : 'th';
  return sport.toUpperCase() === 'MLB'
    ? `${period}${suffix} inning`
    : `${period}${suffix} quarter`;
}

export type AuraGamecastStreamEvent = AuraLiveScoreboardStreamEvent;
