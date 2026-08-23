// Real retained production data, captured verbatim on 2026-08-14 (UTC).
// Source: prod ezbase `game_frame_heads/d28a234140589eb6c3c9b5ab` projected through GET /api/games/{gameId}/frame; game via GET /api/games/{gameId} (research view).
// Game: d28a234140589eb6c3c9b5ab — Milwaukee Brewers 2 @ Los Angeles Dodgers 0, in progress, 2026-08-13.
// Never fabricate fixture data — recapture from a real board instead.
import {
  toAuraLiveScoreboardViewModel,
  type AuraLiveScoreboardControllerState,
} from '@/lib/aura/live-scoreboard-types';

const game = {
  "id": "d28a234140589eb6c3c9b5ab",
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
};
const frame = {
  "gameId": "d28a234140589eb6c3c9b5ab",
  "updatedAt": 1786677024397,
  "scoreboard": {
    "id": "d28a234140589eb6c3c9b5ab",
    "away": {
      "id": "mlb:team:MIL",
      "name": "Milwaukee Brewers",
      "color": "#13294b",
      "score": 2,
      "record": null,
      "abbreviation": "MIL"
    },
    "home": {
      "id": "mlb:team:LAD",
      "name": "Los Angeles Dodgers",
      "color": "#005a9c",
      "score": 0,
      "record": null,
      "abbreviation": "LAD"
    },
    "phase": "in_progress",
    "sport": "MLB",
    "league": "MLB",
    "status": "Middle 4th",
    "startsAt": 1786673400000,
    "updatedAt": 1786677024397
  },
  "state": {
    "surface": "diamond",
    "label": "Mid 4th",
    "possessionTeamId": null,
    "situation": null,
    "coordinates": null
  },
  "latestPlay": {
    "id": "4018165150699990058",
    "text": "Middle of the 4th inning",
    "type": "End Inning",
    "clock": null,
    "period": 4,
    "scoring": false,
    "sequence": null,
    "awayScore": 2,
    "homeScore": 0,
    "observedAt": 1786677024397,
    "occurredAt": 1786676974000,
    "coordinates": null,
    "participantIds": []
  },
  "featuredPlayer": null
};

export const auraLiveScoreboardFixture: AuraLiveScoreboardControllerState = {
  status: 'live',
  error: null,
  reconnectAttempt: 0,
  // `now` is pinned to the frame's own capture instant so the fixture stays deterministic.
  model: toAuraLiveScoreboardViewModel(game, frame, { now: 1786677024397 }),
};
