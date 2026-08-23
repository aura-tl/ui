// Real retained production data, captured verbatim on 2026-08-14 (UTC).
// Source: prod ezbase `boxscores/wnba:game:401857141` projected through GET /api/games/{gameId}/boxscore.
// Game: wnba:game:401857141 — Los Angeles Sparks 81 @ New York Liberty 85, Final, 2026-08-13.
// Never fabricate fixture data — recapture from a real board instead.
import { toAuraBoxScoreModel, type AuraBoxScoreState } from '@/lib/aura/box-score-types';

export const auraBoxScoreFixture: AuraBoxScoreState = {
  status: 'ready',
  error: null,
  model: toAuraBoxScoreModel({
  "id": "wnba:game:401857141",
  "gameId": "wnba:game:401857141",
  "sport": "WNBA",
  "league": "WNBA",
  "phase": "final",
  "observedAt": 1786674700009,
  "teams": [
    {
      "homeAway": "away",
      "team": {
        "name": "Sparks",
        "slug": "los-angeles-sparks",
        "color": "552583",
        "location": "Los Angeles",
        "displayName": "Los Angeles Sparks",
        "abbreviation": "LA",
        "alternateColor": "fdb927",
        "shortDisplayName": "Sparks"
      }
    },
    {
      "homeAway": "home",
      "team": {
        "name": "Liberty",
        "slug": "new-york-liberty",
        "color": "86cebc",
        "location": "New York",
        "displayName": "New York Liberty",
        "abbreviation": "NY",
        "alternateColor": "000000",
        "shortDisplayName": "Liberty"
      }
    }
  ],
  "players": [
    {
      "team": {
        "abbreviation": "LA",
        "displayName": "Los Angeles Sparks"
      },
      "statistics": [
        {
          "labels": [
            "MIN",
            "PTS",
            "FG",
            "3PT",
            "FT",
            "REB",
            "AST",
            "TO",
            "STL",
            "BLK",
            "OREB",
            "DREB",
            "PF",
            "+/-"
          ],
          "athletes": [
            {
              "stats": [
                "31",
                "10",
                "4-11",
                "0-2",
                "2-3",
                "11",
                "4",
                "1",
                "1",
                "0",
                "3",
                "8",
                "4",
                "+2"
              ],
              "active": true,
              "reason": "COACH'S DECISION",
              "athlete": {
                "links": [
                  {
                    "rel": [
                      "playercard",
                      "desktop",
                      "athlete"
                    ],
                    "text": "Player Card"
                  }
                ],
                "jersey": "30",
                "position": {
                  "name": "Forward",
                  "displayName": "Forward",
                  "abbreviation": "F"
                },
                "shortName": "N. Ogwumike",
                "displayName": "Nneka Ogwumike"
              },
              "ejected": false,
              "starter": true,
              "didNotPlay": false
            },
            {
              "stats": [
                "30",
                "16",
                "7-11",
                "0-0",
                "2-5",
                "4",
                "3",
                "0",
                "1",
                "0",
                "2",
                "2",
                "3",
                "-15"
              ],
              "active": true,
              "reason": "COACH'S DECISION",
              "athlete": {
                "links": [
                  {
                    "rel": [
                      "playercard",
                      "desktop",
                      "athlete"
                    ],
                    "text": "Player Card"
                  }
                ],
                "jersey": "5",
                "position": {
                  "name": "Forward",
                  "displayName": "Forward",
                  "abbreviation": "F"
                },
                "shortName": "D. Hamby",
                "displayName": "Dearica Hamby"
              },
              "ejected": false,
              "starter": true,
              "didNotPlay": false
            },
            {
              "stats": [
                "29",
                "6",
                "3-8",
                "0-4",
                "0-0",
                "4",
                "6",
                "4",
                "0",
                "0",
                "0",
                "4",
                "3",
                "+6"
              ],
              "active": true,
              "reason": "COACH'S DECISION",
              "athlete": {
                "links": [
                  {
                    "rel": [
                      "playercard",
                      "desktop",
                      "athlete"
                    ],
                    "text": "Player Card"
                  }
                ],
                "jersey": "17",
                "position": {
                  "name": "Guard",
                  "displayName": "Guard",
                  "abbreviation": "G"
                },
                "shortName": "E. Wheeler",
                "displayName": "Erica Wheeler"
              },
              "ejected": false,
              "starter": true,
              "didNotPlay": false
            },
            {
              "stats": [
                "28",
                "3",
                "1-5",
                "1-3",
                "0-0",
                "4",
                "2",
                "2",
                "3",
                "1",
                "2",
                "2",
                "5",
                "-20"
              ],
              "active": true,
              "reason": "COACH'S DECISION",
              "athlete": {
                "links": [
                  {
                    "rel": [
                      "playercard",
                      "desktop",
                      "athlete"
                    ],
                    "text": "Player Card"
                  }
                ],
                "jersey": "7",
                "position": {
                  "name": "Guard",
                  "displayName": "Guard",
                  "abbreviation": "G"
                },
                "shortName": "A. Atkins",
                "displayName": "Ariel Atkins"
              },
              "ejected": false,
              "starter": true,
              "didNotPlay": false
            },
            {
              "stats": [
                "33",
                "28",
                "10-19",
                "5-10",
                "3-5",
                "3",
                "3",
                "4",
                "1",
                "1",
                "1",
                "2",
                "0",
                "+9"
              ],
              "active": true,
              "reason": "COACH'S DECISION",
              "athlete": {
                "links": [
                  {
                    "rel": [
                      "playercard",
                      "desktop",
                      "athlete"
                    ],
                    "text": "Player Card"
                  }
                ],
                "jersey": "12",
                "position": {
                  "name": "Guard",
                  "displayName": "Guard",
                  "abbreviation": "G"
                },
                "shortName": "R. Burrell",
                "displayName": "Rae Burrell"
              },
              "ejected": false,
              "starter": true,
              "didNotPlay": false
            }
          ]
        }
      ]
    },
    {
      "team": {
        "abbreviation": "NY",
        "displayName": "New York Liberty"
      },
      "statistics": [
        {
          "labels": [
            "MIN",
            "PTS",
            "FG",
            "3PT",
            "FT",
            "REB",
            "AST",
            "TO",
            "STL",
            "BLK",
            "OREB",
            "DREB",
            "PF",
            "+/-"
          ],
          "athletes": [
            {
              "stats": [
                "31",
                "11",
                "5-13",
                "0-3",
                "1-2",
                "6",
                "5",
                "2",
                "2",
                "0",
                "1",
                "5",
                "2",
                "-9"
              ],
              "active": true,
              "reason": "COACH'S DECISION",
              "athlete": {
                "links": [
                  {
                    "rel": [
                      "playercard",
                      "desktop",
                      "athlete"
                    ],
                    "text": "Player Card"
                  }
                ],
                "jersey": "30",
                "position": {
                  "name": "Forward",
                  "displayName": "Forward",
                  "abbreviation": "F"
                },
                "shortName": "B. Stewart",
                "displayName": "Breanna Stewart"
              },
              "ejected": false,
              "starter": true,
              "didNotPlay": false
            },
            {
              "stats": [
                "33",
                "11",
                "5-10",
                "0-1",
                "1-2",
                "18",
                "4",
                "1",
                "1",
                "1",
                "6",
                "12",
                "1",
                "+14"
              ],
              "active": true,
              "reason": "COACH'S DECISION",
              "athlete": {
                "links": [
                  {
                    "rel": [
                      "playercard",
                      "desktop",
                      "athlete"
                    ],
                    "text": "Player Card"
                  }
                ],
                "jersey": "35",
                "position": {
                  "name": "Center",
                  "displayName": "Center",
                  "abbreviation": "C"
                },
                "shortName": "J. Jones",
                "displayName": "Jonquel Jones"
              },
              "ejected": false,
              "starter": true,
              "didNotPlay": false
            },
            {
              "stats": [
                "26",
                "13",
                "5-10",
                "3-5",
                "0-0",
                "1",
                "1",
                "0",
                "2",
                "0",
                "0",
                "1",
                "3",
                "+2"
              ],
              "active": false,
              "reason": "COACH'S DECISION",
              "athlete": {
                "links": [
                  {
                    "rel": [
                      "playercard",
                      "desktop",
                      "athlete"
                    ],
                    "text": "Player Card"
                  }
                ],
                "jersey": "9",
                "position": {
                  "name": "Guard",
                  "displayName": "Guard",
                  "abbreviation": "G"
                },
                "shortName": "R. Allen",
                "displayName": "Rebecca Allen"
              },
              "ejected": false,
              "starter": true,
              "didNotPlay": false
            },
            {
              "stats": [
                "33",
                "20",
                "6-17",
                "1-9",
                "7-9",
                "3",
                "4",
                "4",
                "2",
                "0",
                "1",
                "2",
                "3",
                "-1"
              ],
              "active": true,
              "reason": "COACH'S DECISION",
              "athlete": {
                "links": [
                  {
                    "rel": [
                      "playercard",
                      "desktop",
                      "athlete"
                    ],
                    "text": "Player Card"
                  }
                ],
                "jersey": "20",
                "position": {
                  "name": "Guard",
                  "displayName": "Guard",
                  "abbreviation": "G"
                },
                "shortName": "S. Ionescu",
                "displayName": "Sabrina Ionescu"
              },
              "ejected": false,
              "starter": true,
              "didNotPlay": false
            },
            {
              "stats": [
                "17",
                "7",
                "3-5",
                "0-1",
                "1-1",
                "2",
                "5",
                "2",
                "2",
                "0",
                "0",
                "2",
                "5",
                "+8"
              ],
              "active": true,
              "reason": "COACH'S DECISION",
              "athlete": {
                "links": [
                  {
                    "rel": [
                      "playercard",
                      "desktop",
                      "athlete"
                    ],
                    "text": "Player Card"
                  }
                ],
                "jersey": "18",
                "position": {
                  "name": "Guard",
                  "displayName": "Guard",
                  "abbreviation": "G"
                },
                "shortName": "P. Astier",
                "displayName": "Pauline Astier"
              },
              "ejected": false,
              "starter": true,
              "didNotPlay": false
            }
          ]
        }
      ]
    }
  ]
}),
};
