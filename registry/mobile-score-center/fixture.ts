// Real retained production data, captured verbatim on 2026-08-14 (UTC).
// Source: prod ezbase `games` (2026-08-13 MLB slate) projected through GET /api/games?sport=MLB (scoreboard view).
// Games: tonight's real MLB slate; sports list mirrors GET /api/coverage (MLB, WNBA, NFL).
// Never fabricate fixture data — recapture from a real board instead.
import { toAuraMobileScoreCenterModel, type AuraMobileScoreCenterState } from '@/lib/aura/mobile-score-center-types';

const games = [
  {
    "gameId": "da822ff2c8f8bfe6be87bc10",
    "sport": "MLB",
    "teams": {
      "away": {
        "id": "mlb:team:CLE",
        "abbreviation": "CLE",
        "displayName": "Cleveland Guardians",
        "score": 0
      },
      "home": {
        "id": "mlb:team:DET",
        "abbreviation": "DET",
        "displayName": "Detroit Tigers",
        "score": 3
      }
    },
    "league": "MLB",
    "phase": "final",
    "statusText": "Final",
    "statusDetail": "Final",
    "startsAtMs": 1786641000000,
    "updatedAt": 1786662660046
  },
  {
    "gameId": "e9dbdf99ab0d15dba60c1c06",
    "sport": "MLB",
    "teams": {
      "away": {
        "id": "mlb:team:BOS",
        "abbreviation": "BOS",
        "displayName": "Boston Red Sox",
        "score": 7
      },
      "home": {
        "id": "mlb:team:TOR",
        "abbreviation": "TOR",
        "displayName": "Toronto Blue Jays",
        "score": 0
      }
    },
    "league": "MLB",
    "phase": "final",
    "statusText": "Final",
    "statusDetail": "Final",
    "startsAtMs": 1786648020000,
    "updatedAt": 1786669757104
  },
  {
    "gameId": "afb3f977e5553d2d9be2ae3e",
    "sport": "MLB",
    "teams": {
      "away": {
        "id": "mlb:team:CHC",
        "abbreviation": "CHC",
        "displayName": "Chicago Cubs",
        "score": 0
      },
      "home": {
        "id": "mlb:team:WSH",
        "abbreviation": "WSH",
        "displayName": "Washington Nationals",
        "score": 7
      }
    },
    "league": "MLB",
    "phase": "final",
    "statusText": "Final",
    "statusDetail": "Final",
    "startsAtMs": 1786651500000,
    "updatedAt": 1786673153357
  },
  {
    "gameId": "50988fa3ff66120dceb25bac",
    "sport": "MLB",
    "teams": {
      "away": {
        "id": "mlb:team:PHI",
        "abbreviation": "PHI",
        "displayName": "Philadelphia Phillies",
        "score": 7
      },
      "home": {
        "id": "mlb:team:MIN",
        "abbreviation": "MIN",
        "displayName": "Minnesota Twins",
        "score": 1
      }
    },
    "league": "MLB",
    "phase": "final",
    "statusText": "Final",
    "statusDetail": "Final",
    "startsAtMs": 1786663800000,
    "updatedAt": 1786677079057
  },
  {
    "gameId": "e4d6bd29b5e93af2cba25103",
    "sport": "MLB",
    "teams": {
      "away": {
        "id": "mlb:team:TEX",
        "abbreviation": "TEX",
        "displayName": "Texas Rangers",
        "score": 0
      },
      "home": {
        "id": "mlb:team:LAA",
        "abbreviation": "LAA",
        "displayName": "Los Angeles Angels",
        "score": 2
      }
    },
    "league": "MLB",
    "phase": "in_progress",
    "statusText": "In Progress",
    "statusDetail": "Top 4th",
    "startsAtMs": 1786673220000,
    "updatedAt": 1786677070696
  },
  {
    "gameId": "d28a234140589eb6c3c9b5ab",
    "sport": "MLB",
    "teams": {
      "away": {
        "id": "mlb:team:MIL",
        "abbreviation": "MIL",
        "displayName": "Milwaukee Brewers",
        "score": 2
      },
      "home": {
        "id": "mlb:team:LAD",
        "abbreviation": "LAD",
        "displayName": "Los Angeles Dodgers",
        "score": 0
      }
    },
    "league": "MLB",
    "phase": "in_progress",
    "statusText": "In Progress",
    "statusDetail": "Middle 4th",
    "startsAtMs": 1786673400000,
    "updatedAt": 1786677077926
  }
];

export const auraMobileScoreCenterFixture: AuraMobileScoreCenterState = {
  status: 'ready',
  error: null,
  model: toAuraMobileScoreCenterModel('2026-08-13', 'MLB', games, ['MLB', 'WNBA', 'NFL']),
};
