export type Team = {
  id?: string;
  abbreviation?: string;
  displayName?: string;
  score?: number | null;
};

export type Game = {
  gameId: string;
  sport: string;
  league: string;
  phase: string;
  statusText?: string;
  statusDetail?: string;
  startsAtMs: number;
  teams: { away: Team; home: Team };
};

export type Outcome = {
  side?: string;
  label?: string;
  line?: number | null;
  price?: number;
  probability?: number;
};

export type Odds = {
  marketType?: string;
  sourceCount?: number;
  consensus?: {
    line?: number | null;
    prices?: Record<string, number>;
    probabilities?: Record<string, number>;
    status?: string | null;
  } | null;
};

export type MarketSelection = {
  id: string;
  gameId: string;
  game: string;
  market: string;
  side: string;
  label: string;
  price?: number;
};

export type Prop = {
  id?: string;
  player?: { displayName?: string; name?: string };
  definition?: { displayName?: string; label?: string };
  line?: number | null;
  outcomes?: Outcome[];
  status?: string;
};

export type Scoring = "standard" | "halfPpr" | "ppr";
export type DraftRow = {
  entityId: string;
  entityType?: string;
  name?: string;
  position?: string;
  teamId?: string;
  projection?: Record<string, number>;
  draft?: {
    adp?: Partial<Record<Scoring | "twoQb", number>>;
    overallRank?: number;
    positionRank?: number;
  };
  fantasy?: {
    pprPoints?: number;
    halfPprPoints?: number;
    standardPoints?: number;
  };
};

export type GameDetail = {
  plays: Array<{
    id?: string;
    text?: string;
    inning?: number;
    period?: number;
    clock?: string;
  }>;
  boxscore: BoxTable[];
  moneyline: Odds | null;
  props: Prop[];
};

export type BoxTable = {
  team: string;
  kind: string;
  columns: string[];
  rows: Array<{
    name: string;
    position: string;
    values: Array<string | number | undefined>;
  }>;
};

type BoxScorePlayer = {
  person?: { fullName?: string };
  position?: { abbreviation?: string };
  battingOrder?: string;
  stats?: {
    batting?: Record<string, string | number>;
    pitching?: Record<string, string | number>;
  };
};

type BoxScore = {
  teams?: Array<{
    away?: {
      team?: { name?: string };
      players?: Record<string, BoxScorePlayer>;
    };
    home?: {
      team?: { name?: string };
      players?: Record<string, BoxScorePlayer>;
    };
  }>;
  players?: Array<{
    team?: { abbreviation?: string; displayName?: string };
    statistics?: Array<{
      type?: string;
      name?: string;
      text?: string;
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

const gameFields = [
  "gameId",
  "sport",
  "league",
  "phase",
  "statusText",
  "statusDetail",
  "startsAtMs",
  "teams.away.id",
  "teams.away.abbreviation",
  "teams.away.displayName",
  "teams.away.score",
  "teams.home.id",
  "teams.home.abbreviation",
  "teams.home.displayName",
  "teams.home.score",
].join(",");

export function today() {
  return new Date().toLocaleDateString("en-CA");
}

export function gameName(game: Game) {
  const away =
    game.teams.away.abbreviation || game.teams.away.displayName || "Away";
  const home =
    game.teams.home.abbreviation || game.teams.home.displayName || "Home";
  return `${away} @ ${home}`;
}

export async function games(sport: string, signal?: AbortSignal) {
  return aura<Game[]>(
    "/api/games",
    {
      sport,
      date: today(),
      view: "scoreboard",
      limit: "50",
      fields: gameFields,
    },
    signal,
  );
}

export async function odds(
  gameId: string,
  marketType: string,
  signal?: AbortSignal,
) {
  return optional<Odds>(
    `/api/games/${encodeURIComponent(gameId)}/odds`,
    {
      marketType,
      limit: "20",
    },
    signal,
  );
}

export async function props(gameId: string, signal?: AbortSignal) {
  return optional<{ props?: Prop[] }>(
    `/api/games/${encodeURIComponent(gameId)}/props`,
    {
      limit: "100",
    },
    signal,
  );
}

export async function draft(signal?: AbortSignal) {
  return aura<{ items?: DraftRow[] }>(
    "/api/stats/nfl/draft",
    {
      season: "2026",
      scoring: "ppr",
      view: "projection",
      limit: "250",
    },
    signal,
  );
}

export async function gameDetail(
  gameId: string,
  signal?: AbortSignal,
): Promise<GameDetail> {
  const id = encodeURIComponent(gameId);
  const [playPage, boxscore, moneyline, propBoard] = await Promise.all([
    optional<{ items?: GameDetail["plays"] }>(
      `/api/games/${id}/plays/page`,
      {
        pageSize: "12",
        order: "desc",
        fields: "items.id,items.text,items.inning,items.period,items.clock",
      },
      signal,
    ),
    optional<BoxScore>(`/api/games/${id}/boxscore`, {}, signal),
    odds(gameId, "moneyline", signal),
    props(gameId, signal),
  ]);
  return {
    plays: playPage?.items || [],
    boxscore: boxScoreTables(boxscore),
    moneyline,
    props: propBoard?.props || [],
  };
}

export function marketOutcomes(value: Odds | null | undefined): Outcome[] {
  const prices = value?.consensus?.prices || {};
  const probabilities = value?.consensus?.probabilities || {};
  return Object.entries(prices).map(([side, amount]) => ({
    side,
    label: side,
    price: amount,
    probability: probabilities[side],
  }));
}

export function reconcileMarketSelections(
  gameId: string,
  game: string,
  markets: Record<string, Odds | null>,
  selections: MarketSelection[],
) {
  const available = new Map<string, MarketSelection>();
  for (const [market, value] of Object.entries(markets)) {
    for (const outcome of marketOutcomes(value)) {
      const side = outcome.side || outcome.label;
      if (!side) continue;
      const id = `${gameId}:${market}:${side}`;
      available.set(id, {
        id,
        gameId,
        game,
        market,
        side,
        label: outcome.label || side,
        price: outcome.price,
      });
    }
  }
  return selections.flatMap((selection) => {
    const current = available.get(selection.id);
    return current ? [current] : [];
  });
}

export function reconcilePropSelections(rows: Prop[], selections: string[]) {
  const available = new Set<string>();
  rows.forEach((row, rowIndex) => {
    const id = row.id || String(rowIndex);
    (row.outcomes || []).slice(0, 2).forEach((outcome, outcomeIndex) => {
      available.add(`${id}:${outcome.side || outcome.label || outcomeIndex}`);
    });
  });
  return selections.filter((selection) => available.has(selection));
}

export function consensusPercentage(
  value: Odds | null | undefined,
): number | null {
  const outcomes = marketOutcomes(value);
  if (outcomes.length !== 2) return null;
  const probabilities = outcomes.map((outcome) => outcome.probability);
  if (probabilities.some((value) => !Number.isFinite(value))) return null;
  return (probabilities[0]! + probabilities[1]!) * 100;
}

export function adp(row: DraftRow, scoring: Scoring): number | null {
  const value = row.draft?.adp?.[scoring];
  return Number.isFinite(value) ? value! : null;
}

export function currentGameValue<T>(
  selectedGameId: string | null,
  state: { gameId: string; value: T } | null,
  unavailable: T,
): T {
  return selectedGameId && state?.gameId === selectedGameId
    ? state.value
    : unavailable;
}

export function price(value?: number) {
  if (!Number.isFinite(value)) return "—";
  return value! > 0 ? `+${value}` : String(value);
}

export function scoreProjection(row: DraftRow, reception = 1) {
  const p = row.projection || {};
  return round(
    (p.passingYards || 0) * 0.04 +
      (p.passingTouchdowns || 0) * 4 -
      (p.interceptions || 0) * 2 +
      (p.rushingYards || 0) * 0.1 +
      (p.rushingTouchdowns || 0) * 6 +
      (p.receivingYards || 0) * 0.1 +
      (p.receivingTouchdowns || 0) * 6 +
      (p.receptions || 0) * reception -
      (p.fumblesLost || 0) * 2,
  );
}

export function addLineupPlayer(
  lineup: Record<string, DraftRow>,
  row: DraftRow,
  slots: string[],
) {
  if (Object.values(lineup).some((player) => player.entityId === row.entityId))
    return lineup;
  const slot = slots.find(
    (name) =>
      !lineup[name] &&
      (name.startsWith(row.position || "") ||
        (name === "FLEX" && ["RB", "WR", "TE"].includes(row.position || ""))),
  );
  return slot ? { ...lineup, [slot]: row } : lineup;
}

export function boxScoreTables(boxscore: BoxScore | null): BoxTable[] {
  const retainedTeams = boxscore?.teams?.[0];
  if (retainedTeams?.away || retainedTeams?.home) {
    return [retainedTeams.away, retainedTeams.home].flatMap((team) => {
      if (!team) return [];
      const players = Object.values(team.players || {});
      return [
        retainedPlayerTable(team.team?.name || "Team", "Batting", players, [
          ["AB", "atBats"],
          ["R", "runs"],
          ["H", "hits"],
          ["RBI", "rbi"],
          ["BB", "baseOnBalls"],
          ["K", "strikeOuts"],
        ]),
        retainedPlayerTable(team.team?.name || "Team", "Pitching", players, [
          ["IP", "inningsPitched"],
          ["H", "hits"],
          ["R", "runs"],
          ["ER", "earnedRuns"],
          ["BB", "baseOnBalls"],
          ["K", "strikeOuts"],
        ]),
      ].filter((table): table is BoxTable => Boolean(table));
    });
  }
  return (boxscore?.players || []).flatMap((group) =>
    (group.statistics || []).flatMap((table) => {
      const labels = table.labels || table.names || [];
      const columns = usefulColumns(labels);
      const rows = (table.athletes || [])
        .filter((player) => player.athlete?.displayName)
        .map((player) => ({
          name:
            player.athlete?.shortName ||
            player.athlete?.displayName ||
            "Player",
          position: player.position?.abbreviation || "",
          values: columns.map((column) => player.stats?.[column.index]),
        }));
      if (!rows.length) return [];
      return [
        {
          team: group.team?.displayName || group.team?.abbreviation || "Team",
          kind: table.type || table.name || table.text || "Players",
          columns: columns.map((column) => column.label),
          rows,
        },
      ];
    }),
  );
}

function retainedPlayerTable(
  team: string,
  kind: "Batting" | "Pitching",
  players: BoxScorePlayer[],
  columns: Array<[string, string]>,
): BoxTable | null {
  const statKey = kind === "Batting" ? "batting" : "pitching";
  const rows = players
    .filter((player) => Object.keys(player.stats?.[statKey] || {}).length > 0)
    .sort(
      (left, right) =>
        Number(left.battingOrder || "9999") -
        Number(right.battingOrder || "9999"),
    )
    .map((player) => ({
      name: player.person?.fullName || "Player",
      position: player.position?.abbreviation || "",
      values: columns.map(([, key]) => player.stats?.[statKey]?.[key]),
    }));
  return rows.length
    ? { team, kind, columns: columns.map(([label]) => label), rows }
    : null;
}

function usefulColumns(labels: string[]) {
  const preferred = ["AB", "R", "H", "RBI", "HR", "BB", "K", "IP", "ER"];
  const selected = preferred.flatMap((label) => {
    const index = labels.indexOf(label);
    return index === -1 ? [] : [{ index, label }];
  });
  return selected.length
    ? selected.slice(0, 6)
    : labels.slice(0, 6).map((label, index) => ({ index, label }));
}

function round(value: number) {
  return Math.round(value * 10) / 10;
}

async function optional<T>(
  path: string,
  params: Record<string, string>,
  signal?: AbortSignal,
) {
  try {
    return await aura<T>(path, params, signal);
  } catch (error) {
    if (error instanceof AuraError && error.status === 404) return null;
    throw error;
  }
}

async function aura<T>(
  path: string,
  params: Record<string, string>,
  signal?: AbortSignal,
): Promise<T> {
  const key = process.env.NEXT_PUBLIC_AURA_PUBLIC_KEY;
  if (!key?.startsWith("aura_public_")) {
    throw new Error("Add an Aura public key to .env.local.");
  }
  const url = new URL(
    path,
    process.env.NEXT_PUBLIC_AURA_API_URL || "https://aura.tl",
  );
  Object.entries(params).forEach(([name, value]) =>
    url.searchParams.set(name, value),
  );
  const response = await fetch(url, {
    headers: { Accept: "application/json", "x-api-key": key },
    cache: "no-store",
    signal,
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      message?: string;
      error?: string;
    } | null;
    throw new AuraError(
      response.status,
      body?.message || body?.error || `Aura returned ${response.status}.`,
    );
  }
  return response.json() as Promise<T>;
}

class AuraError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}
