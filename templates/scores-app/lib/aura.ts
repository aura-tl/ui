export type AuraGame = {
  gameId: string;
  sport: string;
  league: string;
  phase: 'scheduled' | 'in_progress' | 'final' | string;
  statusText?: string;
  statusDetail?: string;
  startsAtMs: number;
  updatedAt?: number;
  teams: {
    away: AuraTeam;
    home: AuraTeam;
  };
};

type AuraTeam = {
  id?: string;
  abbreviation?: string;
  displayName?: string;
  score?: number | null;
};

const fields = [
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
  const baseUrl = process.env.NEXT_PUBLIC_AURA_API_URL || 'https://aura.tl';
  const publicKey = process.env.NEXT_PUBLIC_AURA_PUBLIC_KEY;
  if (!publicKey?.startsWith('aura_public_')) {
    throw new Error('Add your Aura public key to .env.local.');
  }
  const url = new URL('/api/games', baseUrl);
  url.searchParams.set('sport', sport);
  url.searchParams.set('date', date);
  url.searchParams.set('view', 'scoreboard');
  url.searchParams.set('limit', '100');
  url.searchParams.set('fields', fields);
  const response = await fetch(url, {
    headers: { Accept: 'application/json', 'x-api-key': publicKey },
    cache: 'no-store',
    signal,
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null) as { message?: string; error?: string } | null;
    throw new Error(body?.message || body?.error || `Aura returned ${response.status}.`);
  }
  return response.json() as Promise<AuraGame[]>;
}
