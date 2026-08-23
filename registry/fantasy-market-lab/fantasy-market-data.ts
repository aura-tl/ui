export const fantasyMarketFields = [
  'playerId',
  'teamId',
  'name',
  'position',
  'updatedAt',
  'draft.adp.ppr',
  'draft.adp.halfPpr',
  'draft.adp.standard',
  'draft.adpPositionRank.ppr',
  'draft.adpPositionRank.halfPpr',
  'draft.adpPositionRank.standard',
  'draft.overallRank',
  'draft.positionRank',
] as const;

export function defineAuraData<const T>(definition: T): T { return definition; }

export const fantasyMarketData = defineAuraData({
  version: 1,
  operation: 'stats.nfl.draft',
  variables: {
    season: { type: 'integer', default: 2026 },
    scoring: { type: 'string', default: 'ppr' },
    limit: { type: 'integer', default: 250, min: 1, max: 250 },
  },
  params: {
    season: '$season',
    scoring: '$scoring',
    view: 'market',
    limit: '$limit',
    fields: fantasyMarketFields.join(','),
  },
  fields: fantasyMarketFields,
  delivery: { primary: 'fetch' },
} as const);
