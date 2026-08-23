import {
  toAuraPlayerPropBoardModel,
  type AuraPlayerPropModel,
  type AuraPlayerPropSide,
} from '@/lib/aura/player-prop-board-types';

export type PlayerPropSide = AuraPlayerPropSide;
export type PlayerPropModel = AuraPlayerPropModel;

export interface PropBoardCardModel {
  id: string;
  sport: string;
  gameId: string;
  gameLabel: string;
  startsAt: number;
  playerId: string;
  playerName: string;
  team: string;
  headshotUrl: string;
  prop: PlayerPropModel;
}

export interface PropSlateModel {
  generatedAt: number;
  window: { from: number; to: number };
  coverage: { games: number; props: number; truncated: boolean };
  sports: string[];
  categories: string[];
  cards: PropBoardCardModel[];
}

export function toPropSlateModel(payload: Record<string, any>): PropSlateModel {
  const cards: PropBoardCardModel[] = [];
  const sports = new Set<string>();
  const categories = new Set<string>();
  for (const entry of Array.isArray(payload?.boards) ? payload.boards : []) {
    const game = entry?.game && typeof entry.game === 'object' ? entry.game : {};
    const board = toAuraPlayerPropBoardModel(entry?.board || {});
    const sport = String(game.sport || game.league || 'SPORT');
    const away = game?.teams?.away || {};
    const home = game?.teams?.home || {};
    const gameLabel = `${String(away.abbreviation || 'AWAY')} @ ${String(home.abbreviation || 'HOME')}`;
    const startsAt = Number(game.startsAtMs) || 0;
    sports.add(sport);
    for (const player of board.players) {
      const team = teamLabel(player.teamId, away, home);
      for (const prop of player.props) {
        categories.add(prop.category);
        cards.push({
          id: `${board.gameId}:${player.playerId}:${prop.definitionId}`,
          sport,
          gameId: board.gameId,
          gameLabel,
          startsAt,
          playerId: player.playerId,
          playerName: player.playerName,
          team,
          headshotUrl: `/api/aura/players/${encodeURIComponent(player.playerId)}/headshot`,
          prop,
        });
      }
    }
  }
  cards.sort((left, right) => left.startsAt - right.startsAt || left.playerName.localeCompare(right.playerName));
  return {
    generatedAt: Number(payload?.generatedAt) || 0,
    window: { from: Number(payload?.window?.from) || 0, to: Number(payload?.window?.to) || 0 },
    coverage: {
      games: Number(payload?.coverage?.games) || 0,
      props: Number(payload?.coverage?.props) || 0,
      truncated: payload?.coverage?.truncated === true,
    },
    sports: [...sports].sort(),
    categories: [...categories].sort(),
    cards,
  };
}

function teamLabel(teamId: string | null, away: Record<string, any>, home: Record<string, any>): string {
  if (teamId && teamId === String(away.id || away.canonicalId || '')) return String(away.abbreviation || '');
  if (teamId && teamId === String(home.id || home.canonicalId || '')) return String(home.abbreviation || '');
  return teamId ? (teamId.split(':').pop() || '').toUpperCase() : '';
}
