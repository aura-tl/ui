// Real retained production data, captured verbatim on 2026-08-14 (UTC).
// Source: prod ezbase `games/d28a234140589eb6c3c9b5ab` projected through GET /api/games/{gameId} (research view).
// Game: d28a234140589eb6c3c9b5ab — Milwaukee Brewers @ Los Angeles Dodgers, in progress (Middle 4th), 2026-08-13.
// Never fabricate fixture data — recapture from a real board instead.
import { toAuraGameCardModel, type AuraGameCardState } from '@/lib/aura/game-card-types';

export const auraGameCardFixture: AuraGameCardState = {
  status: 'ready',
  error: null,
  model: toAuraGameCardModel({
  "gameId": "d28a234140589eb6c3c9b5ab",
  "sport": "MLB",
  "league": "MLB",
  "phase": "in_progress",
  "startsAtMs": 1786673400000,
  "updatedAt": 1786677077926,
  "teams": {
    "away": {
      "id": "mlb:team:MIL",
      "abbreviation": "MIL",
      "displayName": "Milwaukee Brewers",
      "score": 2,
      "shortName": null,
      "name": "Brewers",
      "color": "13294b",
      "record": null
    },
    "home": {
      "id": "mlb:team:LAD",
      "abbreviation": "LAD",
      "displayName": "Los Angeles Dodgers",
      "score": 0,
      "shortName": null,
      "name": "Dodgers",
      "color": "005a9c",
      "record": null
    }
  },
  "statusText": "In Progress",
  "statusDetail": "Middle 4th"
}),
};
