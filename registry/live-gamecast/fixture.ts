// Real retained production data, captured verbatim on 2026-08-14 (UTC).
// Source: prod ezbase `game_events` + `player_game_stats` + `players` + `game_frame_heads`, replayed through the component's own loadAuraGamecastReplay.
// Game: wnba:game:401857141 — Los Angeles Sparks 81 @ New York Liberty 85, Final, 2026-08-13. Final 12 retained plays.
// Never fabricate fixture data — recapture from a real board instead.
import type {
  AuraGamecastControllerState,
  AuraGamecastModel,
} from '@/lib/aura/live-gamecast-types';

export const auraGamecastFixtureModel: AuraGamecastModel = {
  "id": "wnba:game:401857141",
  "mode": "replay",
  "sport": "WNBA",
  "surface": "court",
  "scoreboard": {
    "id": "wnba:game:401857141",
    "sport": "WNBA",
    "league": "WNBA",
    "phase": "final",
    "status": "final",
    "startsAt": 1786665600000,
    "updatedAt": 1786674176595,
    "away": {
      "id": "wnba:team:LA",
      "abbreviation": "LA",
      "name": "Los Angeles Sparks",
      "score": 81,
      "color": "#552583",
      "record": null
    },
    "home": {
      "id": "wnba:team:NY",
      "abbreviation": "NY",
      "name": "New York Liberty",
      "score": 85,
      "color": "#86cebc",
      "record": null
    }
  },
  "frames": [
    {
      "cursor": "wnba:game:401857141:aura:play:8fee0ed3d97101dfedb9e680",
      "revision": 1,
      "gameId": "wnba:game:401857141",
      "observedAt": 1786674700009,
      "scoreboard": {
        "id": "wnba:game:401857141",
        "sport": "WNBA",
        "league": "WNBA",
        "phase": "final",
        "status": "4th quarter · 10.7",
        "startsAt": 1786665600000,
        "updatedAt": 1786674700009,
        "away": {
          "id": "wnba:team:LA",
          "abbreviation": "LA",
          "name": "Los Angeles Sparks",
          "score": 81,
          "color": "#552583",
          "record": null
        },
        "home": {
          "id": "wnba:team:NY",
          "abbreviation": "NY",
          "name": "New York Liberty",
          "score": 84,
          "color": "#86cebc",
          "record": null
        }
      },
      "state": {
        "surface": "court",
        "label": "4th quarter",
        "possessionTeamId": null,
        "coordinates": {
          "x": 8,
          "y": 12
        }
      },
      "play": {
        "id": "aura:play:8fee0ed3d97101dfedb9e680",
        "sequence": 1,
        "occurredAt": 1786673588000,
        "observedAt": 1786674700009,
        "text": "Ariel Atkins misses 24-foot three point jumper",
        "type": "Jump Shot",
        "scoring": false,
        "period": 4,
        "clock": "10.7",
        "awayScore": 81,
        "homeScore": 84,
        "coordinates": {
          "x": 4,
          "y": 12
        },
        "participantIds": [
          "3146151"
        ],
        "participantRoles": {
          "actor": "3146151"
        }
      },
      "featuredPlayer": {
        "id": "wnba:multi_source:player:3146151",
        "name": "Ariel Atkins",
        "team": "Los Angeles Sparks",
        "role": "G",
        "headshotUrl": "/api/players/wnba%3Amulti_source%3Aplayer%3A3146151/headshot",
        "stats": [
          {
            "key": "points",
            "label": "PTS",
            "value": "3"
          },
          {
            "key": "rebounds",
            "label": "REB",
            "value": "4"
          },
          {
            "key": "assists",
            "label": "AST",
            "value": "2"
          },
          {
            "key": "steals",
            "label": "STL",
            "value": "3"
          }
        ],
        "statsAsOf": 1786673738284,
        "statsMode": "latest",
        "statsComplete": false
      },
      "freshness": {
        "dataAsOf": 1786674700009,
        "ageMs": 4015819,
        "complete": false,
        "missing": [
          "historicalPlayerLine"
        ]
      },
      "changes": {
        "score": true,
        "featuredPlayer": true,
        "position": true
      }
    },
    {
      "cursor": "wnba:game:401857141:aura:play:482c5c0e06088fce11d304ea",
      "revision": 2,
      "gameId": "wnba:game:401857141",
      "observedAt": 1786674700009,
      "scoreboard": {
        "id": "wnba:game:401857141",
        "sport": "WNBA",
        "league": "WNBA",
        "phase": "final",
        "status": "4th quarter · 7.2",
        "startsAt": 1786665600000,
        "updatedAt": 1786674700009,
        "away": {
          "id": "wnba:team:LA",
          "abbreviation": "LA",
          "name": "Los Angeles Sparks",
          "score": 81,
          "color": "#552583",
          "record": null
        },
        "home": {
          "id": "wnba:team:NY",
          "abbreviation": "NY",
          "name": "New York Liberty",
          "score": 84,
          "color": "#86cebc",
          "record": null
        }
      },
      "state": {
        "surface": "court",
        "label": "4th quarter",
        "possessionTeamId": null,
        "coordinates": {
          "x": 8,
          "y": 12
        }
      },
      "play": {
        "id": "aura:play:482c5c0e06088fce11d304ea",
        "sequence": 2,
        "occurredAt": 1786673592000,
        "observedAt": 1786674700009,
        "text": "Liberty defensive team rebound",
        "type": "Defensive Rebound",
        "scoring": false,
        "period": 4,
        "clock": "7.2",
        "awayScore": 81,
        "homeScore": 84,
        "coordinates": {
          "x": 4,
          "y": 12
        },
        "participantIds": [],
        "participantRoles": {}
      },
      "featuredPlayer": null,
      "freshness": {
        "dataAsOf": 1786674700009,
        "ageMs": 4015819,
        "complete": false,
        "missing": [
          "featuredPlayer"
        ]
      },
      "changes": {
        "score": false,
        "featuredPlayer": true,
        "position": false
      }
    },
    {
      "cursor": "wnba:game:401857141:aura:play:24751195b53c19134f91a8db",
      "revision": 3,
      "gameId": "wnba:game:401857141",
      "observedAt": 1786674700009,
      "scoreboard": {
        "id": "wnba:game:401857141",
        "sport": "WNBA",
        "league": "WNBA",
        "phase": "final",
        "status": "4th quarter · 7.2",
        "startsAt": 1786665600000,
        "updatedAt": 1786674700009,
        "away": {
          "id": "wnba:team:LA",
          "abbreviation": "LA",
          "name": "Los Angeles Sparks",
          "score": 81,
          "color": "#552583",
          "record": null
        },
        "home": {
          "id": "wnba:team:NY",
          "abbreviation": "NY",
          "name": "New York Liberty",
          "score": 84,
          "color": "#86cebc",
          "record": null
        }
      },
      "state": {
        "surface": "court",
        "label": "4th quarter",
        "possessionTeamId": null,
        "coordinates": null
      },
      "play": {
        "id": "aura:play:24751195b53c19134f91a8db",
        "sequence": 3,
        "occurredAt": 1786673618000,
        "observedAt": 1786674700009,
        "text": "Liberty Reset Timeout",
        "type": "Reset Timeout",
        "scoring": false,
        "period": 4,
        "clock": "7.2",
        "awayScore": 81,
        "homeScore": 84,
        "coordinates": null,
        "participantIds": [],
        "participantRoles": {}
      },
      "featuredPlayer": null,
      "freshness": {
        "dataAsOf": 1786674700009,
        "ageMs": 4015819,
        "complete": false,
        "missing": [
          "featuredPlayer",
          "coordinates"
        ]
      },
      "changes": {
        "score": false,
        "featuredPlayer": false,
        "position": true
      }
    },
    {
      "cursor": "wnba:game:401857141:aura:play:5248aeba22dd03b72cbf1d1a",
      "revision": 4,
      "gameId": "wnba:game:401857141",
      "observedAt": 1786674700009,
      "scoreboard": {
        "id": "wnba:game:401857141",
        "sport": "WNBA",
        "league": "WNBA",
        "phase": "final",
        "status": "4th quarter · 7.2",
        "startsAt": 1786665600000,
        "updatedAt": 1786674700009,
        "away": {
          "id": "wnba:team:LA",
          "abbreviation": "LA",
          "name": "Los Angeles Sparks",
          "score": 81,
          "color": "#552583",
          "record": null
        },
        "home": {
          "id": "wnba:team:NY",
          "abbreviation": "NY",
          "name": "New York Liberty",
          "score": 84,
          "color": "#86cebc",
          "record": null
        }
      },
      "state": {
        "surface": "court",
        "label": "4th quarter",
        "possessionTeamId": null,
        "coordinates": null
      },
      "play": {
        "id": "aura:play:5248aeba22dd03b72cbf1d1a",
        "sequence": 4,
        "occurredAt": 1786673623000,
        "observedAt": 1786674700009,
        "text": "Marine Johannes enters the game for Rebecca Allen",
        "type": "Substitution",
        "scoring": false,
        "period": 4,
        "clock": "7.2",
        "awayScore": 81,
        "homeScore": 84,
        "coordinates": null,
        "participantIds": [
          "4038379",
          "3102133"
        ],
        "participantRoles": {
          "actor": "4038379",
          "actor:2": "3102133"
        }
      },
      "featuredPlayer": {
        "id": "wnba:multi_source:player:4038379",
        "name": "Marine Johannes",
        "team": "New York Liberty",
        "role": "G",
        "headshotUrl": "/api/players/wnba%3Amulti_source%3Aplayer%3A4038379/headshot",
        "stats": [
          {
            "key": "points",
            "label": "PTS",
            "value": "10"
          },
          {
            "key": "rebounds",
            "label": "REB",
            "value": "2"
          },
          {
            "key": "assists",
            "label": "AST",
            "value": "1"
          },
          {
            "key": "steals",
            "label": "STL",
            "value": "2"
          }
        ],
        "statsAsOf": 1786673738284,
        "statsMode": "latest",
        "statsComplete": false
      },
      "freshness": {
        "dataAsOf": 1786674700009,
        "ageMs": 4015819,
        "complete": false,
        "missing": [
          "coordinates",
          "historicalPlayerLine"
        ]
      },
      "changes": {
        "score": false,
        "featuredPlayer": true,
        "position": false
      }
    },
    {
      "cursor": "wnba:game:401857141:aura:play:57f2af33db981b7b49a0b837",
      "revision": 5,
      "gameId": "wnba:game:401857141",
      "observedAt": 1786674700009,
      "scoreboard": {
        "id": "wnba:game:401857141",
        "sport": "WNBA",
        "league": "WNBA",
        "phase": "final",
        "status": "4th quarter · 3.2",
        "startsAt": 1786665600000,
        "updatedAt": 1786674700009,
        "away": {
          "id": "wnba:team:LA",
          "abbreviation": "LA",
          "name": "Los Angeles Sparks",
          "score": 81,
          "color": "#552583",
          "record": null
        },
        "home": {
          "id": "wnba:team:NY",
          "abbreviation": "NY",
          "name": "New York Liberty",
          "score": 84,
          "color": "#86cebc",
          "record": null
        }
      },
      "state": {
        "surface": "court",
        "label": "4th quarter",
        "possessionTeamId": null,
        "coordinates": {
          "x": 56,
          "y": 36
        }
      },
      "play": {
        "id": "aura:play:57f2af33db981b7b49a0b837",
        "sequence": 5,
        "occurredAt": 1786673647000,
        "observedAt": 1786674700009,
        "text": "Ariel Atkins personal take foul",
        "type": "Personal Take Foul",
        "scoring": false,
        "period": 4,
        "clock": "3.2",
        "awayScore": 81,
        "homeScore": 84,
        "coordinates": {
          "x": 28,
          "y": 36
        },
        "participantIds": [
          "3146151"
        ],
        "participantRoles": {
          "actor": "3146151"
        }
      },
      "featuredPlayer": {
        "id": "wnba:multi_source:player:3146151",
        "name": "Ariel Atkins",
        "team": "Los Angeles Sparks",
        "role": "G",
        "headshotUrl": "/api/players/wnba%3Amulti_source%3Aplayer%3A3146151/headshot",
        "stats": [
          {
            "key": "points",
            "label": "PTS",
            "value": "3"
          },
          {
            "key": "rebounds",
            "label": "REB",
            "value": "4"
          },
          {
            "key": "assists",
            "label": "AST",
            "value": "2"
          },
          {
            "key": "steals",
            "label": "STL",
            "value": "3"
          }
        ],
        "statsAsOf": 1786673738284,
        "statsMode": "latest",
        "statsComplete": false
      },
      "freshness": {
        "dataAsOf": 1786674700009,
        "ageMs": 4015819,
        "complete": false,
        "missing": [
          "historicalPlayerLine"
        ]
      },
      "changes": {
        "score": false,
        "featuredPlayer": true,
        "position": true
      }
    },
    {
      "cursor": "wnba:game:401857141:aura:play:2ebbc8f06b06dc439a70c58b",
      "revision": 6,
      "gameId": "wnba:game:401857141",
      "observedAt": 1786674700009,
      "scoreboard": {
        "id": "wnba:game:401857141",
        "sport": "WNBA",
        "league": "WNBA",
        "phase": "final",
        "status": "4th quarter · 3.2",
        "startsAt": 1786665600000,
        "updatedAt": 1786674700009,
        "away": {
          "id": "wnba:team:LA",
          "abbreviation": "LA",
          "name": "Los Angeles Sparks",
          "score": 81,
          "color": "#552583",
          "record": null
        },
        "home": {
          "id": "wnba:team:NY",
          "abbreviation": "NY",
          "name": "New York Liberty",
          "score": 84,
          "color": "#86cebc",
          "record": null
        }
      },
      "state": {
        "surface": "court",
        "label": "4th quarter",
        "possessionTeamId": null,
        "coordinates": null
      },
      "play": {
        "id": "aura:play:2ebbc8f06b06dc439a70c58b",
        "sequence": 6,
        "occurredAt": 1786673675000,
        "observedAt": 1786674700009,
        "text": "Liberty offensive team rebound",
        "type": "Offensive Rebound",
        "scoring": false,
        "period": 4,
        "clock": "3.2",
        "awayScore": 81,
        "homeScore": 84,
        "coordinates": null,
        "participantIds": [],
        "participantRoles": {}
      },
      "featuredPlayer": null,
      "freshness": {
        "dataAsOf": 1786674700009,
        "ageMs": 4015819,
        "complete": false,
        "missing": [
          "featuredPlayer",
          "coordinates"
        ]
      },
      "changes": {
        "score": false,
        "featuredPlayer": true,
        "position": true
      }
    },
    {
      "cursor": "wnba:game:401857141:aura:play:a54ea7904c847e0f15dc1b4a",
      "revision": 7,
      "gameId": "wnba:game:401857141",
      "observedAt": 1786674700009,
      "scoreboard": {
        "id": "wnba:game:401857141",
        "sport": "WNBA",
        "league": "WNBA",
        "phase": "final",
        "status": "4th quarter · 3.2",
        "startsAt": 1786665600000,
        "updatedAt": 1786674700009,
        "away": {
          "id": "wnba:team:LA",
          "abbreviation": "LA",
          "name": "Los Angeles Sparks",
          "score": 81,
          "color": "#552583",
          "record": null
        },
        "home": {
          "id": "wnba:team:NY",
          "abbreviation": "NY",
          "name": "New York Liberty",
          "score": 84,
          "color": "#86cebc",
          "record": null
        }
      },
      "state": {
        "surface": "court",
        "label": "4th quarter",
        "possessionTeamId": null,
        "coordinates": null
      },
      "play": {
        "id": "aura:play:a54ea7904c847e0f15dc1b4a",
        "sequence": 7,
        "occurredAt": 1786673675000,
        "observedAt": 1786674700009,
        "text": "Sabrina Ionescu misses free throw 1 of 2",
        "type": "Free Throw - 1 of 2",
        "scoring": false,
        "period": 4,
        "clock": "3.2",
        "awayScore": 81,
        "homeScore": 84,
        "coordinates": null,
        "participantIds": [
          "4066533"
        ],
        "participantRoles": {
          "actor": "4066533"
        }
      },
      "featuredPlayer": {
        "id": "wnba:multi_source:player:4066533",
        "name": "Sabrina Ionescu",
        "team": "New York Liberty",
        "role": "G",
        "headshotUrl": "/api/players/wnba%3Amulti_source%3Aplayer%3A4066533/headshot",
        "stats": [
          {
            "key": "points",
            "label": "PTS",
            "value": "20"
          },
          {
            "key": "rebounds",
            "label": "REB",
            "value": "3"
          },
          {
            "key": "assists",
            "label": "AST",
            "value": "4"
          },
          {
            "key": "steals",
            "label": "STL",
            "value": "2"
          }
        ],
        "statsAsOf": 1786673722244,
        "statsMode": "latest",
        "statsComplete": false
      },
      "freshness": {
        "dataAsOf": 1786674700009,
        "ageMs": 4015819,
        "complete": false,
        "missing": [
          "coordinates",
          "historicalPlayerLine"
        ]
      },
      "changes": {
        "score": false,
        "featuredPlayer": true,
        "position": false
      }
    },
    {
      "cursor": "wnba:game:401857141:aura:play:f7cc03c069d7f2a228ea0ac3",
      "revision": 8,
      "gameId": "wnba:game:401857141",
      "observedAt": 1786674700009,
      "scoreboard": {
        "id": "wnba:game:401857141",
        "sport": "WNBA",
        "league": "WNBA",
        "phase": "final",
        "status": "4th quarter · 3.2",
        "startsAt": 1786665600000,
        "updatedAt": 1786674700009,
        "away": {
          "id": "wnba:team:LA",
          "abbreviation": "LA",
          "name": "Los Angeles Sparks",
          "score": 81,
          "color": "#552583",
          "record": null
        },
        "home": {
          "id": "wnba:team:NY",
          "abbreviation": "NY",
          "name": "New York Liberty",
          "score": 85,
          "color": "#86cebc",
          "record": null
        }
      },
      "state": {
        "surface": "court",
        "label": "4th quarter",
        "possessionTeamId": null,
        "coordinates": null
      },
      "play": {
        "id": "aura:play:f7cc03c069d7f2a228ea0ac3",
        "sequence": 8,
        "occurredAt": 1786673689000,
        "observedAt": 1786674700009,
        "text": "Sabrina Ionescu makes free throw 2 of 2",
        "type": "Free Throw - 2 of 2",
        "scoring": true,
        "period": 4,
        "clock": "3.2",
        "awayScore": 81,
        "homeScore": 85,
        "coordinates": null,
        "participantIds": [
          "4066533"
        ],
        "participantRoles": {
          "actor": "4066533"
        }
      },
      "featuredPlayer": {
        "id": "wnba:multi_source:player:4066533",
        "name": "Sabrina Ionescu",
        "team": "New York Liberty",
        "role": "G",
        "headshotUrl": "/api/players/wnba%3Amulti_source%3Aplayer%3A4066533/headshot",
        "stats": [
          {
            "key": "points",
            "label": "PTS",
            "value": "20"
          },
          {
            "key": "rebounds",
            "label": "REB",
            "value": "3"
          },
          {
            "key": "assists",
            "label": "AST",
            "value": "4"
          },
          {
            "key": "steals",
            "label": "STL",
            "value": "2"
          }
        ],
        "statsAsOf": 1786673722244,
        "statsMode": "latest",
        "statsComplete": false
      },
      "freshness": {
        "dataAsOf": 1786674700009,
        "ageMs": 4015819,
        "complete": false,
        "missing": [
          "coordinates",
          "historicalPlayerLine"
        ]
      },
      "changes": {
        "score": true,
        "featuredPlayer": false,
        "position": false
      }
    },
    {
      "cursor": "wnba:game:401857141:aura:play:093eb593961d7cb11eb14662",
      "revision": 9,
      "gameId": "wnba:game:401857141",
      "observedAt": 1786673786427,
      "scoreboard": {
        "id": "wnba:game:401857141",
        "sport": "WNBA",
        "league": "WNBA",
        "phase": "final",
        "status": "4th quarter · 0.1",
        "startsAt": 1786665600000,
        "updatedAt": 1786673786427,
        "away": {
          "id": "wnba:team:LA",
          "abbreviation": "LA",
          "name": "Los Angeles Sparks",
          "score": 81,
          "color": "#552583",
          "record": null
        },
        "home": {
          "id": "wnba:team:NY",
          "abbreviation": "NY",
          "name": "New York Liberty",
          "score": 85,
          "color": "#86cebc",
          "record": null
        }
      },
      "state": {
        "surface": "court",
        "label": "4th quarter",
        "possessionTeamId": null,
        "coordinates": {
          "x": 86,
          "y": 34
        }
      },
      "play": {
        "id": "aura:play:093eb593961d7cb11eb14662",
        "sequence": 9,
        "occurredAt": 1786673695000,
        "observedAt": 1786673786427,
        "text": "Erica Wheeler misses 38-foot three point pullup jump shot",
        "type": "Pullup Jump Shot",
        "scoring": false,
        "period": 4,
        "clock": "0.1",
        "awayScore": 81,
        "homeScore": 85,
        "coordinates": {
          "x": 43,
          "y": 34
        },
        "participantIds": [
          "2491214"
        ],
        "participantRoles": {
          "actor": "2491214"
        }
      },
      "featuredPlayer": {
        "id": "wnba:multi_source:player:2491214",
        "name": "Erica Wheeler",
        "team": "Los Angeles Sparks",
        "role": "G",
        "headshotUrl": "/api/players/wnba%3Amulti_source%3Aplayer%3A2491214/headshot",
        "stats": [
          {
            "key": "points",
            "label": "PTS",
            "value": "6"
          },
          {
            "key": "rebounds",
            "label": "REB",
            "value": "4"
          },
          {
            "key": "assists",
            "label": "AST",
            "value": "6"
          },
          {
            "key": "steals",
            "label": "STL",
            "value": "0"
          }
        ],
        "statsAsOf": 1786674176604,
        "statsMode": "latest",
        "statsComplete": false
      },
      "freshness": {
        "dataAsOf": 1786673786427,
        "ageMs": 4929401,
        "complete": false,
        "missing": [
          "historicalPlayerLine"
        ]
      },
      "changes": {
        "score": false,
        "featuredPlayer": true,
        "position": true
      }
    },
    {
      "cursor": "wnba:game:401857141:aura:play:6802a3e9b97a5186c8ba7e66",
      "revision": 10,
      "gameId": "wnba:game:401857141",
      "observedAt": 1786674022054,
      "scoreboard": {
        "id": "wnba:game:401857141",
        "sport": "WNBA",
        "league": "WNBA",
        "phase": "final",
        "status": "4th quarter · 0.1",
        "startsAt": 1786665600000,
        "updatedAt": 1786674022054,
        "away": {
          "id": "wnba:team:LA",
          "abbreviation": "LA",
          "name": "Los Angeles Sparks",
          "score": 81,
          "color": "#552583",
          "record": null
        },
        "home": {
          "id": "wnba:team:NY",
          "abbreviation": "NY",
          "name": "New York Liberty",
          "score": 85,
          "color": "#86cebc",
          "record": null
        }
      },
      "state": {
        "surface": "court",
        "label": "4th quarter",
        "possessionTeamId": null,
        "coordinates": {
          "x": 86,
          "y": 34
        }
      },
      "play": {
        "id": "aura:play:6802a3e9b97a5186c8ba7e66",
        "sequence": 10,
        "occurredAt": 1786673695000,
        "observedAt": 1786674022054,
        "text": "Sparks offensive team rebound",
        "type": "Offensive Rebound",
        "scoring": false,
        "period": 4,
        "clock": "0.1",
        "awayScore": 81,
        "homeScore": 85,
        "coordinates": {
          "x": 43,
          "y": 34
        },
        "participantIds": [],
        "participantRoles": {}
      },
      "featuredPlayer": null,
      "freshness": {
        "dataAsOf": 1786674022054,
        "ageMs": 4693774,
        "complete": false,
        "missing": [
          "featuredPlayer"
        ]
      },
      "changes": {
        "score": false,
        "featuredPlayer": true,
        "position": false
      }
    },
    {
      "cursor": "wnba:game:401857141:aura:play:3ae77a9644201814a7886053",
      "revision": 11,
      "gameId": "wnba:game:401857141",
      "observedAt": 1786674700009,
      "scoreboard": {
        "id": "wnba:game:401857141",
        "sport": "WNBA",
        "league": "WNBA",
        "phase": "final",
        "status": "4th quarter · 0.0",
        "startsAt": 1786665600000,
        "updatedAt": 1786674700009,
        "away": {
          "id": "wnba:team:LA",
          "abbreviation": "LA",
          "name": "Los Angeles Sparks",
          "score": 81,
          "color": "#552583",
          "record": null
        },
        "home": {
          "id": "wnba:team:NY",
          "abbreviation": "NY",
          "name": "New York Liberty",
          "score": 85,
          "color": "#86cebc",
          "record": null
        }
      },
      "state": {
        "surface": "court",
        "label": "4th quarter",
        "possessionTeamId": null,
        "coordinates": null
      },
      "play": {
        "id": "aura:play:3ae77a9644201814a7886053",
        "sequence": 11,
        "occurredAt": 1786673700000,
        "observedAt": 1786674700009,
        "text": "End of the 4th Quarter",
        "type": "End Period",
        "scoring": false,
        "period": 4,
        "clock": "0.0",
        "awayScore": 81,
        "homeScore": 85,
        "coordinates": null,
        "participantIds": [],
        "participantRoles": {}
      },
      "featuredPlayer": null,
      "freshness": {
        "dataAsOf": 1786674700009,
        "ageMs": 4015819,
        "complete": false,
        "missing": [
          "featuredPlayer",
          "coordinates"
        ]
      },
      "changes": {
        "score": false,
        "featuredPlayer": false,
        "position": true
      }
    },
    {
      "cursor": "wnba:game:401857141:aura:play:a256cfe8976affecab1c8d37",
      "revision": 12,
      "gameId": "wnba:game:401857141",
      "observedAt": 1786674700009,
      "scoreboard": {
        "id": "wnba:game:401857141",
        "sport": "WNBA",
        "league": "WNBA",
        "phase": "final",
        "status": "4th quarter · 0.0",
        "startsAt": 1786665600000,
        "updatedAt": 1786674700009,
        "away": {
          "id": "wnba:team:LA",
          "abbreviation": "LA",
          "name": "Los Angeles Sparks",
          "score": 81,
          "color": "#552583",
          "record": null
        },
        "home": {
          "id": "wnba:team:NY",
          "abbreviation": "NY",
          "name": "New York Liberty",
          "score": 85,
          "color": "#86cebc",
          "record": null
        }
      },
      "state": {
        "surface": "court",
        "label": "4th quarter",
        "possessionTeamId": null,
        "coordinates": null
      },
      "play": {
        "id": "aura:play:a256cfe8976affecab1c8d37",
        "sequence": 12,
        "occurredAt": 1786673704000,
        "observedAt": 1786674700009,
        "text": "End of Game",
        "type": "End Game",
        "scoring": false,
        "period": 4,
        "clock": "0.0",
        "awayScore": 81,
        "homeScore": 85,
        "coordinates": null,
        "participantIds": [],
        "participantRoles": {}
      },
      "featuredPlayer": null,
      "freshness": {
        "dataAsOf": 1786674700009,
        "ageMs": 4015819,
        "complete": false,
        "missing": [
          "featuredPlayer",
          "coordinates"
        ]
      },
      "changes": {
        "score": false,
        "featuredPlayer": false,
        "position": false
      }
    }
  ]
};

export const auraGamecastFixture: AuraGamecastControllerState = {
  status: 'replay',
  model: auraGamecastFixtureModel,
  error: null,
  reconnectAttempt: 0,
};
