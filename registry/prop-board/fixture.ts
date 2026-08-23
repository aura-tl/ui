// Derived only from the real retained TEX @ LAA production capture in the
// installed player-prop-board fixture (2026-08-14). No values are fabricated.
import { auraPlayerPropBoardFixture } from '@/fixtures/aura/player-prop-board';
import type { PropSlateModel } from '@/lib/aura/prop-board-types';

const cards = auraPlayerPropBoardFixture.players.flatMap((player) =>
  player.props.map((prop) => ({
    id: `${auraPlayerPropBoardFixture.gameId}:${player.playerId}:${prop.definitionId}`,
    sport: 'MLB',
    gameId: auraPlayerPropBoardFixture.gameId,
    gameLabel: 'TEX @ LAA',
    startsAt: 1786586400000,
    playerId: player.playerId,
    playerName: player.playerName,
    team: (player.teamId?.split(':').pop() || '').toUpperCase(),
    headshotUrl: `/api/aura/players/${encodeURIComponent(player.playerId)}/headshot`,
    prop,
  }))
);

export const auraPropBoardFixture: PropSlateModel = {
  generatedAt: auraPlayerPropBoardFixture.generatedAt,
  window: { from: 1786510800000, to: 1786597199999 },
  coverage: { games: 1, props: cards.length, truncated: false },
  sports: ['MLB'],
  categories: [...new Set(cards.map((card) => card.prop.category))].sort(),
  cards,
};
