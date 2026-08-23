// Real retained production data, captured verbatim on 2026-08-14 (UTC).
// Source: prod ezbase `games` + `market_snapshots` projected through GET /api/games/{gameId} (research view) and /odds/timeline?marketType=spread.
// Game: d28a234140589eb6c3c9b5ab — MIL @ LAD, in progress, 2026-08-13.
// Never fabricate fixture data — recapture from a real board instead.
import type { AuraOddsTimeline } from '@/lib/aura/live-scoreboard-types';
import { toAuraGameMarketBoardModel, type AuraGameMarketBoardState } from '@/lib/aura/game-market-board-types';

const game = {
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
};
const timeline: AuraOddsTimeline = {
  "kind": "aura.game.odds-timeline",
  "contractVersion": "1.0.0",
  "gameId": "d28a234140589eb6c3c9b5ab",
  "marketType": "spread",
  "points": [
    {
      "observedAt": 1786676774397,
      "outcomes": [
        {
          "side": "home",
          "line": 1.5,
          "price": -212
        },
        {
          "side": "away",
          "line": -1.5,
          "price": 160
        }
      ]
    },
    {
      "observedAt": 1786676825166,
      "outcomes": [
        {
          "side": "home",
          "line": -1.5,
          "price": 143
        },
        {
          "side": "away",
          "line": 1.5,
          "price": -174
        }
      ]
    },
    {
      "observedAt": 1786676874724,
      "outcomes": [
        {
          "side": "home",
          "line": 1.5,
          "price": -212
        },
        {
          "side": "away",
          "line": -1.5,
          "price": 160
        }
      ]
    },
    {
      "observedAt": 1786676890164,
      "outcomes": [
        {
          "side": "home",
          "line": -1.5,
          "price": 143
        },
        {
          "side": "away",
          "line": 1.5,
          "price": -174
        }
      ]
    },
    {
      "observedAt": 1786676907135,
      "outcomes": [
        {
          "side": "home",
          "line": 1.5,
          "price": -212
        },
        {
          "side": "away",
          "line": -1.5,
          "price": 160
        }
      ]
    },
    {
      "observedAt": 1786676940764,
      "outcomes": [
        {
          "side": "home",
          "line": -1.5,
          "price": 143
        },
        {
          "side": "away",
          "line": 1.5,
          "price": -174
        }
      ]
    },
    {
      "observedAt": 1786676989587,
      "outcomes": [
        {
          "side": "home",
          "line": 1.5,
          "price": -212
        },
        {
          "side": "away",
          "line": -1.5,
          "price": 160
        }
      ]
    },
    {
      "observedAt": 1786677041899,
      "outcomes": [
        {
          "side": "home",
          "line": -1.5,
          "price": 143
        },
        {
          "side": "away",
          "line": 1.5,
          "price": -174
        }
      ]
    }
  ]
};

export const auraGameMarketBoardFixture: AuraGameMarketBoardState = {
  status: 'ready',
  error: null,
  model: toAuraGameMarketBoardModel(game, timeline),
};
