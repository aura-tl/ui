import type { AuraGamePlayerProp, AuraGamePlayerProps } from '@/lib/aura/live-scoreboard-types';

export type AuraPlayerPropSide = 'over' | 'under' | 'yes' | 'no';

export interface AuraPlayerPropOutcomeModel {
  side: AuraPlayerPropSide;
  price: number;
  priceLabel: string;
}

export interface AuraPlayerPropModel {
  id: string;
  definitionId: string;
  label: string;
  category: string;
  unit: string;
  line: number | null;
  outcomes: AuraPlayerPropOutcomeModel[];
  status: 'open' | 'live' | 'closed';
  observedAt: number;
  settlement: AuraGamePlayerProp['settlement'] | null;
  /** Other quoted lines for the same player+prop. The card shows the main
   *  line; these render behind a disclosure, never as their own cards. */
  alternates: AuraPlayerPropModel[];
}

export interface AuraPlayerPropGroupModel {
  playerId: string;
  playerName: string;
  teamId: string | null;
  props: AuraPlayerPropModel[];
}

export interface AuraPlayerPropBoardModel {
  gameId: string;
  generatedAt: number;
  categories: string[];
  players: AuraPlayerPropGroupModel[];
  propCount: number;
  settledCount: number;
}

export interface AuraPlayerPropBoardState {
  status: 'loading' | 'ready' | 'unavailable' | 'error';
  model: AuraPlayerPropBoardModel | null;
  error: string | null;
}

export function toAuraPlayerPropBoardModel(board: AuraGamePlayerProps): AuraPlayerPropBoardModel {
  const groups = new Map<string, AuraPlayerPropGroupModel>();
  const categories = new Set<string>();
  const mainLines = consensusMainLines(board);
  let settledCount = 0;

  // One card per player+prop: every quoted line for the same underlying prop
  // collapses onto the main line's card, with the rest as alternates.
  const byProp = new Map<string, { playerId: string; playerName: string; teamId: string | null; rows: AuraPlayerPropModel[] }>();
  for (const raw of board.props || []) {
    const outcomes = (raw.outcomes || [])
      .filter((outcome) => Number.isFinite(outcome.price))
      .map((outcome) => ({ ...outcome, priceLabel: formatAmericanPrice(outcome.price) }));
    if (!raw.player?.id || !raw.player?.name || outcomes.length === 0) continue;
    categories.add(raw.definition.category);
    if (raw.settlement) settledCount += 1;

    const model: AuraPlayerPropModel = {
      id: raw.id,
      definitionId: raw.definition.id,
      label: raw.definition.label,
      category: raw.definition.category,
      unit: raw.definition.unit,
      line: raw.line,
      outcomes,
      status: raw.status,
      observedAt: raw.observedAt,
      settlement: raw.settlement ?? null,
      alternates: [],
    };
    const key = `${raw.player.id}\n${model.definitionId}`;
    const bucket = byProp.get(key) ?? {
      playerId: raw.player.id,
      playerName: raw.player.name,
      teamId: raw.player.teamId ?? null,
      rows: [],
    };
    bucket.rows.push(model);
    byProp.set(key, bucket);
  }

  for (const bucket of byProp.values()) {
    const model = electMainCard(bucket.rows, mainLines.get(`${bucket.playerId}\n${bucket.rows[0].definitionId}`));
    const existing = groups.get(bucket.playerId);
    if (existing) existing.props.push(model);
    else groups.set(bucket.playerId, {
      playerId: bucket.playerId,
      playerName: bucket.playerName,
      teamId: bucket.teamId,
      props: [model],
    });
  }

  const players = Array.from(groups.values()).sort((left, right) =>
    left.playerName.localeCompare(right.playerName)
  );
  for (const group of players) {
    group.props.sort((left, right) => left.label.localeCompare(right.label) || (left.line ?? 0) - (right.line ?? 0));
  }

  return {
    gameId: board.gameId,
    generatedAt: board.generatedAt,
    categories: Array.from(categories).sort(),
    players,
    propCount: players.reduce((total, group) => total + group.props.length, 0),
    settledCount,
  };
}

/** playerId+definitionId → the cortex-elected main line, when the API serves it. */
function consensusMainLines(board: AuraGamePlayerProps): Map<string, number> {
  const mains = new Map<string, number>();
  const consensus = (board as { consensus?: Array<Record<string, unknown>> }).consensus;
  if (!Array.isArray(consensus)) return mains;
  for (const entry of consensus) {
    const playerId = String(entry?.playerId || '');
    const definitionId = String(entry?.definitionId || '');
    const mainLine = Number(entry?.mainLine);
    if (playerId && definitionId && Number.isFinite(mainLine)) {
      mains.set(`${playerId}\n${definitionId}`, mainLine);
    }
  }
  return mains;
}

/**
 * Pick the card to show for one player+prop: the cortex-elected main line when
 * the board serves it, otherwise the most two-sided, most even-priced row.
 */
function electMainCard(rows: AuraPlayerPropModel[], consensusMain: number | undefined): AuraPlayerPropModel {
  const sorted = [...rows].sort((left, right) => (left.line ?? 0) - (right.line ?? 0));
  let main = consensusMain !== undefined
    ? sorted.find((row) => row.line === consensusMain)
    : undefined;
  if (!main) {
    main = sorted.reduce((best, row) => (mainScore(row) < mainScore(best) ? row : best));
  }
  return { ...main, alternates: sorted.filter((row) => row !== main) };
}

function mainScore(row: AuraPlayerPropModel): number {
  const over = row.outcomes.find((outcome) => outcome.side === 'over' || outcome.side === 'yes');
  const under = row.outcomes.find((outcome) => outcome.side === 'under' || outcome.side === 'no');
  if (over && under) {
    const overProbability = impliedProbability(over.price);
    const underProbability = impliedProbability(under.price);
    const fair = overProbability / (overProbability + underProbability);
    return Math.abs(fair - 0.5);
  }
  const only = over ?? under;
  return 1 + (only ? Math.abs(impliedProbability(only.price) - 0.5) : 10);
}

function impliedProbability(american: number): number {
  if (!Number.isFinite(american) || american === 0) return 0.5;
  return american > 0 ? 100 / (american + 100) : Math.abs(american) / (Math.abs(american) + 100);
}

export function formatAmericanPrice(price: number): string {
  if (!Number.isFinite(price)) return '—';
  const rounded = Math.round(price);
  return rounded > 0 ? `+${rounded}` : String(rounded);
}
