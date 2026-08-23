export type SportsbookMarketType = 'moneyline' | 'spread' | 'total';
export type SportsbookOutcomeSide = 'away' | 'home' | 'over' | 'under';

export interface SportsbookOutcomeModel {
  id: string;
  side: SportsbookOutcomeSide;
  label: string;
  line: number | null;
  price: number | null;
}

export interface SportsbookMarketModel {
  id: string;
  type: SportsbookMarketType;
  asOf: number;
  outcomes: SportsbookOutcomeModel[];
}

export interface SportsbookTeamModel {
  id: string;
  abbreviation: string;
  name: string;
  score: number | null;
  color: string | null;
}

export interface SportsbookGameModel {
  id: string;
  sport: string;
  league: string;
  phase: 'scheduled' | 'in_progress';
  status: string;
  startsAt: number;
  away: SportsbookTeamModel;
  home: SportsbookTeamModel;
  markets: Partial<Record<SportsbookMarketType, SportsbookMarketModel>>;
}

export interface SportsbookModel {
  generatedAt: number;
  coverage: {
    games: number;
    markets: number;
    sports: number;
    liveGames: number;
    scheduledGames: number;
    truncated: boolean;
  };
  sports: string[];
  games: SportsbookGameModel[];
}

export interface SportsbookSelectionModel {
  id: string;
  marketId: string;
  gameId: string;
  sport: string;
  matchup: string;
  marketType: SportsbookMarketType;
  side: SportsbookOutcomeSide;
  label: string;
  line: number | null;
  price: number;
}

export function toSportsbookModel(payload: Record<string, any>): SportsbookModel {
  const games = (Array.isArray(payload.boards) ? payload.boards : []).flatMap((entry: Record<string, any>) => {
    const raw = object(entry.game);
    const id = string(raw.id);
    const phase = raw.phase === 'in_progress' ? 'in_progress' : raw.phase === 'scheduled' ? 'scheduled' : null;
    const teams = object(raw.teams);
    const away = team(object(teams.away));
    const home = team(object(teams.home));
    if (!id || !phase || !away || !home) return [];
    const game: SportsbookGameModel = {
      id,
      sport: string(raw.sport) || string(raw.league) || 'Other',
      league: string(raw.league) || string(raw.sport) || 'Other',
      phase,
      status: string(raw.statusDetail) || (phase === 'in_progress' ? 'Live' : 'Scheduled'),
      startsAt: finite(raw.startsAtMs) ?? 0,
      away,
      home,
      markets: {},
    };
    for (const rawMarket of Array.isArray(entry.markets) ? entry.markets : []) {
      const market = object(rawMarket);
      const type = marketType(market.marketType);
      if (!type) continue;
      const outcomes = (Array.isArray(market.outcomes) ? market.outcomes : []).flatMap((rawOutcome: unknown) => {
        const outcome = object(rawOutcome);
        const side = outcomeSide(outcome.side);
        const price = finite(outcome.price);
        if (!side || price === null) return [];
        return [{
          id: `${id}:${type}:${side}`,
          side,
          label: side === 'away' ? away.abbreviation : side === 'home' ? home.abbreviation : side === 'over' ? 'Over' : 'Under',
          line: finite(outcome.line),
          price,
        }];
      });
      if (!outcomes.length) continue;
      game.markets[type] = { id: `${id}:${type}`, type, asOf: finite(market.asOf) ?? 0, outcomes };
    }
    return Object.keys(game.markets).length ? [game] : [];
  });
  const coverage = object(payload.coverage);
  const sports = [...new Set(games.map((game) => game.sport))];
  return {
    generatedAt: finite(payload.generatedAt) ?? 0,
    coverage: {
      games: finite(coverage.games) ?? games.length,
      markets: finite(coverage.markets) ?? games.reduce((total, game) => total + Object.keys(game.markets).length, 0),
      sports: finite(coverage.sports) ?? sports.length,
      liveGames: finite(coverage.liveGames) ?? games.filter((game) => game.phase === 'in_progress').length,
      scheduledGames: finite(coverage.scheduledGames) ?? games.filter((game) => game.phase === 'scheduled').length,
      truncated: Boolean(coverage.truncated),
    },
    sports,
    games,
  };
}

export function reconcileSportsbookSelections(model: SportsbookModel, selections: SportsbookSelectionModel[]): SportsbookSelectionModel[] {
  const current = new Map<string, SportsbookSelectionModel>();
  for (const game of model.games) {
    for (const market of Object.values(game.markets)) {
      if (!market) continue;
      for (const outcome of market.outcomes) {
        if (outcome.price === null) continue;
        current.set(outcome.id, {
          id: outcome.id,
          marketId: market.id,
          gameId: game.id,
          sport: game.sport,
          matchup: `${game.away.abbreviation} @ ${game.home.abbreviation}`,
          marketType: market.type,
          side: outcome.side,
          label: outcome.label,
          line: outcome.line,
          price: outcome.price,
        });
      }
    }
  }
  return selections.flatMap((selection) => {
    const retained = current.get(selection.id);
    return retained ? [retained] : [];
  });
}

function team(value: Record<string, any>): SportsbookTeamModel | null {
  const id = string(value.id);
  const abbreviation = string(value.abbreviation);
  const name = string(value.displayName) || string(value.name);
  if (!id || !abbreviation || !name) return null;
  const color = string(value.color).replace(/^#/, '');
  return { id, abbreviation, name, score: finite(value.score), color: /^[0-9a-f]{6}$/i.test(color) ? `#${color}` : null };
}
function marketType(value: unknown): SportsbookMarketType | null { return value === 'moneyline' || value === 'spread' || value === 'total' ? value : null; }
function outcomeSide(value: unknown): SportsbookOutcomeSide | null { return value === 'away' || value === 'home' || value === 'over' || value === 'under' ? value : null; }
function object(value: unknown): Record<string, any> { return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, any> : {}; }
function string(value: unknown): string { return typeof value === 'string' ? value.trim() : ''; }
function finite(value: unknown): number | null { if (value === null || value === undefined || value === '') return null; const number = Number(value); return Number.isFinite(number) ? number : null; }
