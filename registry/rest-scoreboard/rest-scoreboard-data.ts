/**
 * The copied REST scoreboard keeps its data hookup beside the editable source.
 * It is deliberately a small manifest, not a query language: one named Aura
 * operation, bounded variables, an allowlisted field catalog, and one delivery
 * policy that a consumer can read without a visual-builder runtime.
 */

export type AuraDataDelivery = 'fetch' | 'poll' | 'replay';

export type AuraDataVariable =
  | {
      readonly type: 'string' | 'sport' | 'date';
      readonly default: string;
      readonly description?: string;
    }
  | {
      readonly type: 'integer';
      readonly default: number;
      readonly min?: number;
      readonly max?: number;
      readonly description?: string;
    }
  | {
      readonly type: 'boolean';
      readonly default: boolean;
      readonly description?: string;
    };

export type AuraDataVariables = Record<string, AuraDataVariable>;

export interface AuraDataManifest<
  Variables extends AuraDataVariables,
  Fields extends readonly string[],
> {
  readonly version: 1;
  readonly operation: string;
  readonly variables: Variables;
  readonly params: Readonly<Record<string, string | number | boolean>>;
  readonly fields: Fields;
  readonly delivery: {
    readonly primary: AuraDataDelivery;
    readonly poll?: {
      readonly everyMs: number | `$${Extract<keyof Variables, string>}`;
      readonly while: 'live' | 'not-final' | 'always';
    };
    readonly replay?: string;
  };
}

export function defineAuraData<
  const Variables extends AuraDataVariables,
  const Fields extends readonly string[],
>(
  manifest: AuraDataManifest<Variables, Fields>,
): AuraDataManifest<Variables, Fields> {
  return manifest;
}

export type AuraRestScoreboardField =
  | 'id'
  | 'sport'
  | 'league'
  | 'phase'
  | 'startsAtMs'
  | 'updatedAt'
  | 'teams.away.abbreviation'
  | 'teams.away.displayName'
  | 'teams.away.score'
  | 'teams.home.abbreviation'
  | 'teams.home.displayName'
  | 'teams.home.score'
  | 'cursor'
  | 'revision'
  | 'gameId'
  | 'observedAt'
  | 'publishedAt'
  | 'scoreboard.phase'
  | 'scoreboard.statusText'
  | 'scoreboard.statusDetail'
  | 'scoreboard.away.abbreviation'
  | 'scoreboard.away.displayName'
  | 'scoreboard.away.score'
  | 'scoreboard.home.abbreviation'
  | 'scoreboard.home.displayName'
  | 'scoreboard.home.score'
  | 'freshness.dataAsOf'
  | 'freshness.state'
  | 'freshness.complete'
  | 'freshness.missing'
  | 'gameId'
  | 'replayAt'
  | 'game'
  | 'observation'
  | 'plays[]';

export const AURA_REST_SCOREBOARD_FIELDS = [
  'id',
  'sport',
  'league',
  'phase',
  'startsAtMs',
  'updatedAt',
  'teams.away.abbreviation',
  'teams.away.displayName',
  'teams.away.score',
  'teams.home.abbreviation',
  'teams.home.displayName',
  'teams.home.score',
  'cursor',
  'revision',
  'gameId',
  'observedAt',
  'publishedAt',
  'scoreboard.phase',
  'scoreboard.statusText',
  'scoreboard.statusDetail',
  'scoreboard.away.abbreviation',
  'scoreboard.away.displayName',
  'scoreboard.away.score',
  'scoreboard.home.abbreviation',
  'scoreboard.home.displayName',
  'scoreboard.home.score',
  'freshness.dataAsOf',
  'freshness.state',
  'freshness.complete',
  'freshness.missing',
  'gameId',
  'replayAt',
  'game',
  'observation',
  'plays[]',
] as const satisfies readonly AuraRestScoreboardField[];

export const restScoreboardData = defineAuraData({
  version: 1,
  operation: 'games.game-frame',
  variables: {
    gameId: {
      type: 'string',
      default: 'mlb:game:fixture',
      description: 'The Aura game id used by the named operation.',
    },
    pollMs: {
      type: 'integer',
      default: 15_000,
      min: 5_000,
      max: 60_000,
      description: 'Polling interval for non-final games.',
    },
  },
  params: { gameId: '$gameId' },
  fields: AURA_REST_SCOREBOARD_FIELDS,
  delivery: {
    primary: 'poll',
    poll: { everyMs: '$pollMs', while: 'not-final' },
    replay: 'One bounded point-in-time request; never substitute a fixture for missing retained observations.',
  },
});

/**
 * Normalize a selected field list into the stable order used by a REST URL
 * and cache key. Unknown and duplicate fields fail instead of being ignored.
 * The generic overload keeps copied component code type-safe while the
 * implementation remains defensive at the request boundary.
 */
export function canonicalAuraFields<AllowedField extends string>(
  allowed: readonly AllowedField[],
  requested?: readonly AllowedField[],
): string;
export function canonicalAuraFields(
  allowed: readonly string[],
  requested: readonly string[] = allowed,
): string {
  const allowedSet = new Set(allowed);
  const normalized = requested.map((field) => field.trim()).filter(Boolean);
  const unsupported = normalized.filter((field) => !allowedSet.has(field));
  if (unsupported.length > 0) {
    throw new Error(`Unsupported Aura fields: ${unsupported.join(', ')}`);
  }
  const seen = new Set<string>();
  const duplicate = normalized.find((field) => {
    if (seen.has(field)) return true;
    seen.add(field);
    return false;
  });
  if (duplicate) throw new Error(`Duplicate Aura field: ${duplicate}`);
  return [...normalized].sort().join(',');
}
