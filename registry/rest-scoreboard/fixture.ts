// Real retained production data, captured verbatim on 2026-08-14 (UTC).
// Source: prod ezbase `game_frame_heads/wnba:game:401857142` projected through GET /api/games/{gameId}/frame; game via GET /api/games/{gameId} (research view).
// Game: wnba:game:401857142 — Washington Mystics 32 @ Las Vegas Aces 38, Halftime, 2026-08-13.
// Never fabricate fixture data — recapture from a real board instead.
import { toAuraLiveScoreboardViewModel } from '@/lib/aura/live-scoreboard-types';
import type { AuraRestScoreboardControllerState } from '@/lib/aura/rest-scoreboard-types';

const game = {
  "id": "wnba:game:401857142",
  "sport": "WNBA",
  "league": "WNBA",
  "phase": "in_progress",
  "startsAtMs": 1786672800000,
  "updatedAt": 1786677072630,
  "teams": {
    "away": {
      "id": "wnba:team:WSH",
      "abbreviation": "WSH",
      "displayName": "Washington Mystics",
      "score": 32,
      "shortName": null,
      "name": "Mystics",
      "color": "e03a3e",
      "record": null
    },
    "home": {
      "id": "wnba:team:LV",
      "abbreviation": "LV",
      "displayName": "Las Vegas Aces",
      "score": 38,
      "shortName": null,
      "name": "Aces",
      "color": "a7a8aa",
      "record": null
    }
  },
  "statusText": "Halftime",
  "statusDetail": "Halftime"
};
const frame = {
  "gameId": "wnba:game:401857142",
  "updatedAt": 1786676177348,
  "scoreboard": {
    "id": "wnba:game:401857142",
    "away": {
      "id": "wnba:team:WSH",
      "name": "Washington Mystics",
      "color": "#e03a3e",
      "score": 32,
      "record": null,
      "abbreviation": "WSH"
    },
    "home": {
      "id": "wnba:team:LV",
      "name": "Las Vegas Aces",
      "color": "#a7a8aa",
      "score": 38,
      "record": null,
      "abbreviation": "LV"
    },
    "phase": "in_progress",
    "sport": "WNBA",
    "league": "WNBA",
    "status": "Halftime",
    "startsAt": 1786672800000,
    "updatedAt": 1786676177348
  },
  "state": {
    "surface": "court",
    "label": "Halftime",
    "possessionTeamId": null,
    "situation": null,
    "coordinates": null
  },
  "latestPlay": {
    "id": "401857142288",
    "text": "End of the 2nd Quarter",
    "type": "End Period",
    "clock": "0.0",
    "period": 2,
    "scoring": false,
    "sequence": null,
    "awayScore": 32,
    "homeScore": 38,
    "observedAt": 1786676177348,
    "occurredAt": 1786676148000,
    "coordinates": null,
    "participantIds": []
  },
  "featuredPlayer": null
};

export const auraRestScoreboardFixture: AuraRestScoreboardControllerState = {
  status: 'polling',
  pollCount: 1,
  error: null,
  model: {
    mode: 'poll',
    replayAt: null,
    replayComplete: true,
    playCount: 0,
    // `now` is pinned to the frame's own capture instant so the fixture stays deterministic.
    view: toAuraLiveScoreboardViewModel(game, frame, { now: 1786676177348 }),
  },
};
