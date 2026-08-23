export type FantasyDraftScoring = 'ppr' | 'halfPpr' | 'standard';
export type FantasySeasonMarketKey = 'passingYards' | 'passingTouchdowns' | 'rushingYards' | 'rushingTouchdowns' | 'receivingYards' | 'receivingTouchdowns';
export type FantasyMarketCategory = 'subtotal' | 'yards' | 'touchdowns';

export interface FantasySeasonMarketObservation { line: number; over: number | null; under: number | null; observedAt: number; }
export interface FantasyMarketComponent { key: FantasySeasonMarketKey; label: string; value: number; weight: number; }
export interface FantasyMarketScore { score: number; components: FantasyMarketComponent[]; }

export function priceAdjustedFantasyLine(row: FantasySeasonMarketObservation): number {
  const over = americanOddsProbability(row.over);
  const under = americanOddsProbability(row.under);
  const probability = over !== null && under !== null ? over / (over + under) : over ?? (under === null ? .5 : 1 - under);
  return row.line + probability - .5;
}

const fantasyMarketComponents: Record<string, Array<{ key: FantasySeasonMarketKey; label: string; weight: number }>> = {
  QB: [
    { key: 'passingYards', label: 'Passing yards', weight: .04 },
    { key: 'passingTouchdowns', label: 'Passing TD', weight: 4 },
    { key: 'rushingYards', label: 'Rushing yards', weight: .1 },
    { key: 'rushingTouchdowns', label: 'Rushing TD', weight: 6 },
  ],
  RB: [
    { key: 'rushingYards', label: 'Rushing yards', weight: .1 },
    { key: 'rushingTouchdowns', label: 'Rushing TD', weight: 6 },
    { key: 'receivingYards', label: 'Receiving yards', weight: .1 },
    { key: 'receivingTouchdowns', label: 'Receiving TD', weight: 6 },
  ],
  WR: [
    { key: 'receivingYards', label: 'Receiving yards', weight: .1 },
    { key: 'receivingTouchdowns', label: 'Receiving TD', weight: 6 },
    { key: 'rushingYards', label: 'Rushing yards', weight: .1 },
    { key: 'rushingTouchdowns', label: 'Rushing TD', weight: 6 },
  ],
  TE: [
    { key: 'receivingYards', label: 'Receiving yards', weight: .1 },
    { key: 'receivingTouchdowns', label: 'Receiving TD', weight: 6 },
  ],
};

export function completeFantasyMarketScore(
  position: string,
  markets: Partial<Record<FantasySeasonMarketKey, FantasySeasonMarketObservation>>,
  category: FantasyMarketCategory,
): FantasyMarketScore | null {
  const required = (fantasyMarketComponents[position] || []).filter((component) =>
    category === 'subtotal' || (category === 'yards' ? component.key.endsWith('Yards') : component.key.endsWith('Touchdowns')),
  );
  if (!required.length || required.some((component) => !markets[component.key])) return null;
  const components = required.map((component) => ({ ...component, value: priceAdjustedFantasyLine(markets[component.key]!) }));
  return {
    components,
    score: components.reduce((sum, component) => sum + component.value * (category === 'subtotal' ? component.weight : 1), 0),
  };
}

function americanOddsProbability(price: number | null): number | null {
  if (price === null) return null;
  return price < 0 ? -price / (-price + 100) : 100 / (price + 100);
}

export interface FantasyDraftPlayerModel {
  id: string;
  playerId: string | null;
  name: string;
  team: string;
  position: string;
  overallRank: number | null;
  positionRank: number | null;
  adp: Record<FantasyDraftScoring, number | null>;
  adpPositionRank: Record<FantasyDraftScoring, number | null>;
  seasonMarkets: Partial<Record<FantasySeasonMarketKey, FantasySeasonMarketObservation>>;
  projection: Record<string, number>;
  points: Record<FantasyDraftScoring, number>;
  pointRanks: Record<FantasyDraftScoring, number>;
  headshotUrl: string | null;
}

export interface FantasyDraftModel {
  generatedAt: number;
  season: number;
  coverage: {
    entities: number;
    players: number;
    defenses: number;
    ranked: number;
    adp: Record<FantasyDraftScoring, number>;
    seasonMarkets: Record<FantasySeasonMarketKey, number>;
    truncated: boolean;
  };
  positions: string[];
  teams: string[];
  players: FantasyDraftPlayerModel[];
}

export function isFantasyDraftRank(value: unknown): boolean {
  return value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value));
}

export function toFantasyDraftModel(payload: Record<string, any>): FantasyDraftModel {
  const players = (Array.isArray(payload.items) ? payload.items : []).flatMap((row: Record<string, any>) => {
    const id = String(row.entityId || '');
    const name = String(row.name || '');
    const position = String(row.position || '').toUpperCase();
    if (!id || !name || !position) return [];
    const playerId = typeof row.playerId === 'string' && row.playerId ? row.playerId : null;
    return [{
      id,
      playerId,
      name,
      team: String(row.teamId || '').split(':').pop() || '—',
      position,
      overallRank: finite(row.draft?.overallRank),
      positionRank: finite(row.draft?.positionRank),
      adp: {
        ppr: finite(row.draft?.adp?.ppr),
        halfPpr: finite(row.draft?.adp?.halfPpr),
        standard: finite(row.draft?.adp?.standard),
      },
      adpPositionRank: {
        ppr: finite(row.draft?.adpPositionRank?.ppr),
        halfPpr: finite(row.draft?.adpPositionRank?.halfPpr),
        standard: finite(row.draft?.adpPositionRank?.standard),
      },
      seasonMarkets: seasonMarkets(row.market?.season),
      projection: numericRecord(row.projection),
      points: {
        ppr: finite(row.fantasy?.pprPoints) ?? 0,
        halfPpr: finite(row.fantasy?.halfPprPoints) ?? 0,
        standard: finite(row.fantasy?.standardPoints) ?? 0,
      },
      pointRanks: { ppr: 0, halfPpr: 0, standard: 0 },
      headshotUrl: playerId ? `/api/aura/api/players/${encodeURIComponent(playerId)}/headshot` : null,
    }];
  });
  for (const scoring of ['ppr', 'halfPpr', 'standard'] as const) {
    for (const position of new Set(players.map((player) => player.position))) {
      players
        .filter((player) => player.position === position)
        .sort((left, right) => right.points[scoring] - left.points[scoring] || left.name.localeCompare(right.name))
        .forEach((player, index) => { player.pointRanks[scoring] = index + 1; });
    }
  }
  const coverage = payload.coverage || {};
  return {
    generatedAt: finite(payload.generatedAt) ?? 0,
    season: finite(payload.season) ?? 0,
    coverage: {
      entities: finite(coverage.entities) ?? players.length,
      players: finite(coverage.players) ?? players.filter((player) => player.playerId).length,
      defenses: finite(coverage.defenses) ?? players.filter((player) => !player.playerId).length,
      ranked: finite(coverage.ranked) ?? players.filter((player) => player.overallRank !== null).length,
      adp: {
        ppr: finite(coverage.adp?.ppr) ?? players.filter((player) => player.adp.ppr !== null).length,
        halfPpr: finite(coverage.adp?.halfPpr) ?? players.filter((player) => player.adp.halfPpr !== null).length,
        standard: finite(coverage.adp?.standard) ?? players.filter((player) => player.adp.standard !== null).length,
      },
      seasonMarkets: {
        passingYards: finite(coverage.seasonMarkets?.passingYards) ?? 0,
        passingTouchdowns: finite(coverage.seasonMarkets?.passingTouchdowns) ?? 0,
        rushingYards: finite(coverage.seasonMarkets?.rushingYards) ?? 0,
        rushingTouchdowns: finite(coverage.seasonMarkets?.rushingTouchdowns) ?? 0,
        receivingYards: finite(coverage.seasonMarkets?.receivingYards) ?? 0,
        receivingTouchdowns: finite(coverage.seasonMarkets?.receivingTouchdowns) ?? 0,
      },
      truncated: coverage.truncated === undefined ? Boolean(payload.page?.hasMore) : Boolean(coverage.truncated),
    },
    positions: [...new Set(players.map((player) => player.position))].sort(positionSort),
    teams: [...new Set(players.map((player) => player.team))].sort(),
    players,
  };
}

function seasonMarkets(value: unknown): Partial<Record<FantasySeasonMarketKey, FantasySeasonMarketObservation>> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const result: Partial<Record<FantasySeasonMarketKey, FantasySeasonMarketObservation>> = {};
  for (const key of ['passingYards', 'passingTouchdowns', 'rushingYards', 'rushingTouchdowns', 'receivingYards', 'receivingTouchdowns'] as const) {
    const row = (value as Record<string, any>)[key]; const line = finite(row?.line); if (line === null) continue;
    result[key] = { line, over: finite(row.over), under: finite(row.under), observedAt: finite(row.observedAt) ?? 0 };
  }
  return result;
}

function numericRecord(value: unknown): Record<string, number> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).flatMap(([key, entry]) => {
    const number = finite(entry);
    return number === null ? [] : [[key, number]];
  }));
}

function finite(value: unknown): number | null {
  if (!isFantasyDraftRank(value)) return null;
  const number = Number(value);
  return number;
}

function positionSort(left: string, right: string): number {
  const order = ['QB', 'RB', 'WR', 'TE', 'DST'];
  return order.indexOf(left) - order.indexOf(right);
}
