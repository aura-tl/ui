// Real retained production data, captured verbatim on 2026-08-14 (UTC).
// Source: prod ezbase `game_events` (canonical timeline) projected through GET /api/games/{gameId}/plays/page.
// Game: wnba:game:401857141 — Los Angeles Sparks 81 @ New York Liberty 85, Final, 2026-08-13. Final 12 plays.
// Never fabricate fixture data — recapture from a real board instead.
import { toAuraPlayByPlayModel, type AuraPlayByPlayState } from '@/lib/aura/play-by-play-types';

const page = {
  "gameId": "wnba:game:401857141",
  "order": {
    "field": "gameSequence",
    "direction": "asc",
    "semantics": "game_chronology"
  },
  "pageSize": 12,
  "items": [
    {
      "id": "aura:play:8fee0ed3d97101dfedb9e680",
      "gameId": "wnba:game:401857141",
      "text": "Ariel Atkins misses 24-foot three point jumper",
      "scoringPlay": false,
      "participants": {
        "actor": "wnba:multi_source:player:3146151"
      },
      "sequence": 9,
      "type": "Jump Shot",
      "inning": "4th Quarter",
      "period": 4,
      "clock": "10.7",
      "wallclock": "2026-08-14T02:13:08Z",
      "awayScore": 81,
      "homeScore": 84,
      "observedAt": 1786674700009,
      "coordinates": {
        "x": 4,
        "y": 12
      }
    },
    {
      "id": "aura:play:482c5c0e06088fce11d304ea",
      "gameId": "wnba:game:401857141",
      "text": "Liberty defensive team rebound",
      "scoringPlay": false,
      "participants": {},
      "sequence": 8,
      "type": "Defensive Rebound",
      "inning": "4th Quarter",
      "period": 4,
      "clock": "7.2",
      "wallclock": "2026-08-14T02:13:12Z",
      "awayScore": 81,
      "homeScore": 84,
      "observedAt": 1786674700009,
      "coordinates": {
        "x": 4,
        "y": 12
      }
    },
    {
      "id": "aura:play:24751195b53c19134f91a8db",
      "gameId": "wnba:game:401857141",
      "text": "Liberty Reset Timeout",
      "scoringPlay": false,
      "participants": {},
      "sequence": 7,
      "type": "Reset Timeout",
      "inning": "4th Quarter",
      "period": 4,
      "clock": "7.2",
      "wallclock": "2026-08-14T02:13:38Z",
      "awayScore": 81,
      "homeScore": 84,
      "observedAt": 1786674700009
    },
    {
      "id": "aura:play:5248aeba22dd03b72cbf1d1a",
      "gameId": "wnba:game:401857141",
      "text": "Marine Johannes enters the game for Rebecca Allen",
      "scoringPlay": false,
      "participants": {
        "actor": "wnba:multi_source:player:4038379",
        "actor:2": "wnba:multi_source:player:3102133"
      },
      "sequence": 6,
      "type": "Substitution",
      "inning": "4th Quarter",
      "period": 4,
      "clock": "7.2",
      "wallclock": "2026-08-14T02:13:43Z",
      "awayScore": 81,
      "homeScore": 84,
      "observedAt": 1786674700009
    },
    {
      "id": "aura:play:57f2af33db981b7b49a0b837",
      "gameId": "wnba:game:401857141",
      "text": "Ariel Atkins personal take foul",
      "scoringPlay": false,
      "participants": {
        "actor": "wnba:multi_source:player:3146151"
      },
      "sequence": 5,
      "type": "Personal Take Foul",
      "inning": "4th Quarter",
      "period": 4,
      "clock": "3.2",
      "wallclock": "2026-08-14T02:14:07Z",
      "awayScore": 81,
      "homeScore": 84,
      "observedAt": 1786674700009,
      "coordinates": {
        "x": 28,
        "y": 36
      }
    },
    {
      "id": "aura:play:a54ea7904c847e0f15dc1b4a",
      "gameId": "wnba:game:401857141",
      "text": "Sabrina Ionescu misses free throw 1 of 2",
      "scoringPlay": false,
      "participants": {
        "actor": "wnba:multi_source:player:4066533"
      },
      "sequence": 4,
      "type": "Free Throw - 1 of 2",
      "inning": "4th Quarter",
      "period": 4,
      "clock": "3.2",
      "wallclock": "2026-08-14T02:14:35Z",
      "awayScore": 81,
      "homeScore": 84,
      "observedAt": 1786674700009
    },
    {
      "id": "aura:play:2ebbc8f06b06dc439a70c58b",
      "gameId": "wnba:game:401857141",
      "text": "Liberty offensive team rebound",
      "scoringPlay": false,
      "participants": {},
      "sequence": 3,
      "type": "Offensive Rebound",
      "inning": "4th Quarter",
      "period": 4,
      "clock": "3.2",
      "wallclock": "2026-08-14T02:14:35Z",
      "awayScore": 81,
      "homeScore": 84,
      "observedAt": 1786674700009
    },
    {
      "id": "aura:play:f7cc03c069d7f2a228ea0ac3",
      "gameId": "wnba:game:401857141",
      "text": "Sabrina Ionescu makes free throw 2 of 2",
      "scoringPlay": true,
      "participants": {
        "actor": "wnba:multi_source:player:4066533"
      },
      "sequence": 2,
      "type": "Free Throw - 2 of 2",
      "inning": "4th Quarter",
      "period": 4,
      "clock": "3.2",
      "wallclock": "2026-08-14T02:14:49Z",
      "awayScore": 81,
      "homeScore": 85,
      "observedAt": 1786674700009
    },
    {
      "id": "aura:play:093eb593961d7cb11eb14662",
      "gameId": "wnba:game:401857141",
      "text": "Erica Wheeler misses 38-foot three point pullup jump shot",
      "scoringPlay": false,
      "participants": {
        "actor": "wnba:multi_source:player:2491214"
      },
      "sequence": 3,
      "type": "Pullup Jump Shot",
      "inning": "4th Quarter",
      "period": 4,
      "clock": "0.1",
      "wallclock": "2026-08-14T02:14:55Z",
      "awayScore": 81,
      "homeScore": 85,
      "observedAt": 1786673786427,
      "coordinates": {
        "x": 43,
        "y": 34
      }
    },
    {
      "id": "aura:play:6802a3e9b97a5186c8ba7e66",
      "gameId": "wnba:game:401857141",
      "text": "Sparks offensive team rebound",
      "scoringPlay": false,
      "participants": {},
      "sequence": 2,
      "type": "Offensive Rebound",
      "inning": "4th Quarter",
      "period": 4,
      "clock": "0.1",
      "wallclock": "2026-08-14T02:14:55Z",
      "awayScore": 81,
      "homeScore": 85,
      "observedAt": 1786674022054,
      "coordinates": {
        "x": 43,
        "y": 34
      }
    },
    {
      "id": "aura:play:3ae77a9644201814a7886053",
      "gameId": "wnba:game:401857141",
      "text": "End of the 4th Quarter",
      "scoringPlay": false,
      "participants": {},
      "sequence": 1,
      "type": "End Period",
      "inning": "4th Quarter",
      "period": 4,
      "clock": "0.0",
      "wallclock": "2026-08-14T02:15:00Z",
      "awayScore": 81,
      "homeScore": 85,
      "observedAt": 1786674700009
    },
    {
      "id": "aura:play:a256cfe8976affecab1c8d37",
      "gameId": "wnba:game:401857141",
      "text": "End of Game",
      "scoringPlay": false,
      "participants": {},
      "sequence": 0,
      "type": "End Game",
      "inning": "4th Quarter",
      "period": 4,
      "clock": "0.0",
      "wallclock": "2026-08-14T02:15:04Z",
      "awayScore": 81,
      "homeScore": 85,
      "observedAt": 1786674700009
    }
  ],
  "hasMore": false,
  "nextCursor": null
};

export const auraPlayByPlayFixture: AuraPlayByPlayState = {
  status: 'ready',
  error: null,
  model: toAuraPlayByPlayModel(page, { league: 'WNBA', title: 'Sparks at Liberty', status: 'Final' }),
};
