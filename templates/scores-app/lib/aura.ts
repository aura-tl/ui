export type AuraGame = {
  gameId: string;
  sport: string;
  league: string;
  phase: 'scheduled' | 'in_progress' | 'final' | string;
  statusText?: string;
  statusDetail?: string;
  startsAtMs: number;
  updatedAt?: number;
  teams: { away: AuraTeam; home: AuraTeam };
};

export type AuraTeam = {
  id?: string;
  abbreviation?: string;
  displayName?: string;
  score?: number | null;
};

export type AuraPlay = {
  id: string;
  text?: string;
  type?: string;
  inning?: string;
  period?: number;
  clock?: string;
  scoringPlay?: boolean;
  awayScore?: number;
  homeScore?: number;
  observedAt?: number;
};

export type AuraPlayPage = { items: AuraPlay[] };

export type AuraBoxScore = {
  observedAt?: number;
  players?: Array<{
    team?: { abbreviation?: string; displayName?: string };
    statistics?: Array<{
      type?: string;
      labels?: string[];
      names?: string[];
      athletes?: Array<{
        stats?: Array<string | number>;
        athlete?: { displayName?: string; shortName?: string };
        position?: { abbreviation?: string };
      }>;
    }>;
  }>;
};

export type AuraOdds = {
  marketType?: string;
  generatedAt?: number;
  stale?: boolean;
  sourceCount?: number;
  consensus?: {
    prices?: Record<string, number>;
    probabilities?: Record<string, number>;
    confidence?: number;
    status?: string;
    asOf?: number;
  } | null;
};

export type AuraProps = {
  props?: Array<{
    id?: string;
    player?: { name?: string; displayName?: string };
    definition?: { displayName?: string; label?: string };
    line?: number;
    outcomes?: Array<{ side?: string; price?: number }>;
  }>;
};

export type AuraGameDetail = {
  boxscore?: AuraBoxScore | null;
  plays?: AuraPlayPage | null;
  odds?: AuraOdds | null;
  props?: AuraProps | null;
};

const scoreboardFields = [
  'gameId', 'sport', 'league', 'phase', 'statusText', 'statusDetail',
  'startsAtMs', 'updatedAt',
  'teams.away.id', 'teams.away.abbreviation', 'teams.away.displayName', 'teams.away.score',
  'teams.home.id', 'teams.home.abbreviation', 'teams.home.displayName', 'teams.home.score',
].join(',');

export async function listAuraGames(
  sport: string,
  date: string,
  signal?: AbortSignal
): Promise<AuraGame[]> {
  return auraJson<AuraGame[]>('/api/games', {
    sport,
    date,
    view: 'scoreboard',
    limit: '100',
    fields: scoreboardFields,
  }, signal);
}

export async function getAuraGameDetail(
  gameId: string,
  view: 'plays' | 'boxscore' | 'markets',
  signal?: AbortSignal
): Promise<AuraGameDetail> {
  const id = encodeURIComponent(gameId);
  if (view === 'plays') {
    const plays = await auraOptional<AuraPlayPage>(`/api/games/${id}/plays/page`, {
      pageSize: '40',
      order: 'desc',
      fields: 'items.id,items.text,items.type,items.inning,items.period,items.clock,items.scoringPlay,items.awayScore,items.homeScore,items.observedAt',
    }, signal);
    return { plays };
  }
  if (view === 'boxscore') {
    return { boxscore: await auraOptional<AuraBoxScore>(`/api/games/${id}/boxscore`, {}, signal) };
  }
  const [odds, props] = await Promise.all([
    auraOptional<AuraOdds>(`/api/games/${id}/odds`, { marketType: 'moneyline', limit: '10' }, signal),
    auraOptional<AuraProps>(`/api/games/${id}/props`, { limit: '20' }, signal),
  ]);
  return { odds, props };
}

async function auraOptional<T>(
  path: string,
  params: Record<string, string>,
  signal?: AbortSignal
): Promise<T | null> {
  try {
    return await auraJson<T>(path, params, signal);
  } catch (error) {
    if (error instanceof AuraResponseError && error.status === 404) return null;
    throw error;
  }
}

async function auraJson<T>(
  path: string,
  params: Record<string, string>,
  signal?: AbortSignal
): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_AURA_API_URL || 'https://aura.tl';
  const publicKey = process.env.NEXT_PUBLIC_AURA_PUBLIC_KEY;
  if (!publicKey?.startsWith('aura_public_')) {
    throw new Error('Add your Aura public key to .env.local.');
  }
  const url = new URL(path, baseUrl);
  for (const [name, value] of Object.entries(params)) url.searchParams.set(name, value);
  const response = await fetch(url, {
    headers: { Accept: 'application/json', 'x-api-key': publicKey },
    cache: 'no-store',
    signal,
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null) as { message?: string; error?: string } | null;
    throw new AuraResponseError(response.status, body?.message || body?.error || `Aura returned ${response.status}.`);
  }
  return response.json() as Promise<T>;
}

class AuraResponseError extends Error {
  constructor(readonly status: number, message: string) {
    super(message);
  }
}
