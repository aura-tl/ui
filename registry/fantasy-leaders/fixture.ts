// Real retained production data, captured verbatim on 2026-08-14 (UTC).
// Source: prod ezbase `boxscores/nfl:game:401873272` projected through GET /api/games/{gameId}/boxscore.
// Game: nfl:game:401873272 — Detroit Lions 0 @ Cincinnati Bengals 10, live preseason (2nd quarter), 2026-08-13.
// Never fabricate fixture data — recapture from a real board instead.
import { toAuraFantasyLeadersModel, type AuraFantasyLeadersState } from '@/lib/aura/fantasy-leaders-types';

const boxScore = {
  "id": "nfl:game:401873272",
  "gameId": "nfl:game:401873272",
  "sport": "NFL",
  "league": "NFL",
  "phase": "in_progress",
  "observedAt": 1786666262608,
  "teams": [
    {},
    {}
  ],
  "players": [
    {
      "team": {
        "abbreviation": "DET",
        "displayName": "Detroit Lions"
      },
      "teamId": "DET",
      "statistics": [
        {
          "name": "passing",
          "labels": [
            "C/ATT",
            "YDS",
            "AVG",
            "TD",
            "INT",
            "SACKS",
            "RTG"
          ],
          "athletes": [
            {
              "stats": [
                "6/10",
                "69",
                "6.9",
                "0",
                "1",
                "0-0",
                "41.2"
              ],
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
                "jersey": "2O",
                "lastName": "Altmyer",
                "firstName": "Luke",
                "displayName": "Luke Altmyer"
              }
            },
            {
              "stats": [
                "1/3",
                "15",
                "5.0",
                "0",
                "0",
                "1-5",
                "50.7"
              ],
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
                "jersey": "6",
                "lastName": "Dobbs",
                "firstName": "Joshua",
                "displayName": "Joshua Dobbs"
              }
            }
          ]
        },
        {
          "name": "rushing",
          "labels": [
            "CAR",
            "YDS",
            "AVG",
            "TD",
            "LONG"
          ],
          "athletes": [
            {
              "stats": [
                "5",
                "23",
                "4.6",
                "0",
                "9"
              ],
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
                "jersey": "25",
                "lastName": "Saylors",
                "firstName": "Jacob",
                "displayName": "Jacob Saylors"
              }
            },
            {
              "stats": [
                "1",
                "9",
                "9.0",
                "0",
                "9"
              ],
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
                "jersey": "6",
                "lastName": "Dobbs",
                "firstName": "Joshua",
                "displayName": "Joshua Dobbs"
              }
            },
            {
              "stats": [
                "3",
                "4",
                "1.3",
                "0",
                "4"
              ],
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
                "jersey": "34",
                "lastName": "Robichaux",
                "firstName": "Kye",
                "displayName": "Kye Robichaux"
              }
            },
            {
              "stats": [
                "1",
                "0",
                "0.0",
                "0",
                "0"
              ],
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
                "jersey": "2O",
                "lastName": "Altmyer",
                "firstName": "Luke",
                "displayName": "Luke Altmyer"
              }
            }
          ]
        },
        {
          "name": "receiving",
          "labels": [
            "REC",
            "YDS",
            "AVG",
            "TD",
            "LONG",
            "TGTS"
          ],
          "athletes": [
            {
              "stats": [
                "2",
                "24",
                "12.0",
                "0",
                "16",
                "3"
              ],
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
                "jersey": "25",
                "lastName": "Saylors",
                "firstName": "Jacob",
                "displayName": "Jacob Saylors"
              }
            },
            {
              "stats": [
                "1",
                "23",
                "23.0",
                "0",
                "23",
                "1"
              ],
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
                "jersey": "86",
                "lastName": "Wilson Jr.",
                "firstName": "Cedrick",
                "displayName": "Cedrick Wilson Jr."
              }
            },
            {
              "stats": [
                "1",
                "17",
                "17.0",
                "0",
                "17",
                "1"
              ],
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
                "jersey": "13",
                "lastName": "Meeks",
                "firstName": "Jackson",
                "displayName": "Jackson Meeks"
              }
            },
            {
              "stats": [
                "1",
                "15",
                "15.0",
                "0",
                "15",
                "1"
              ],
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
                "jersey": "19",
                "lastName": "Lovett",
                "firstName": "Dominic",
                "displayName": "Dominic Lovett"
              }
            },
            {
              "stats": [
                "2",
                "5",
                "2.5",
                "0",
                "5",
                "2"
              ],
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
                "jersey": "83",
                "lastName": "Conklin",
                "firstName": "Tyler",
                "displayName": "Tyler Conklin"
              }
            },
            {
              "stats": [
                "0",
                "0",
                "0.0",
                "0",
                "0",
                "1"
              ],
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
                "jersey": "8",
                "lastName": "Dortch",
                "firstName": "Greg",
                "displayName": "Greg Dortch"
              }
            },
            {
              "stats": [
                "0",
                "0",
                "0.0",
                "0",
                "0",
                "1"
              ],
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
                "jersey": "82",
                "lastName": "Gordon",
                "firstName": "Thomas",
                "displayName": "Thomas Gordon"
              }
            },
            {
              "stats": [
                "0",
                "0",
                "0.0",
                "0",
                "0",
                "3"
              ],
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
                "lastName": "TeSlaa",
                "firstName": "Isaac",
                "displayName": "Isaac TeSlaa"
              }
            }
          ]
        }
      ]
    },
    {
      "team": {
        "abbreviation": "CIN",
        "displayName": "Cincinnati Bengals"
      },
      "teamId": "CIN",
      "statistics": [
        {
          "name": "passing",
          "labels": [
            "C/ATT",
            "YDS",
            "AVG",
            "TD",
            "INT",
            "SACKS",
            "RTG"
          ],
          "athletes": [
            {
              "stats": [
                "5/8",
                "51",
                "6.4",
                "1",
                "0",
                "0-0",
                "120.3"
              ],
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
                "jersey": "16",
                "lastName": "Flacco",
                "firstName": "Joe",
                "displayName": "Joe Flacco"
              }
            },
            {
              "stats": [
                "5/6",
                "39",
                "6.5",
                "0",
                "0",
                "1-9",
                "93.8"
              ],
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
                "lastName": "Burrow",
                "firstName": "Joe",
                "displayName": "Joe Burrow"
              }
            }
          ]
        },
        {
          "name": "rushing",
          "labels": [
            "CAR",
            "YDS",
            "AVG",
            "TD",
            "LONG"
          ],
          "athletes": [
            {
              "stats": [
                "5",
                "16",
                "3.2",
                "0",
                "5"
              ],
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
                "lastName": "Brown",
                "firstName": "Chase",
                "displayName": "Chase Brown"
              }
            },
            {
              "stats": [
                "3",
                "10",
                "3.3",
                "0",
                "5"
              ],
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
                "jersey": "25",
                "lastName": "Brooks",
                "firstName": "Tahj",
                "displayName": "Tahj Brooks"
              }
            },
            {
              "stats": [
                "1",
                "7",
                "7.0",
                "0",
                "7"
              ],
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
                "jersey": "34",
                "lastName": "Perine",
                "firstName": "Samaje",
                "displayName": "Samaje Perine"
              }
            },
            {
              "stats": [
                "1",
                "7",
                "7.0",
                "0",
                "7"
              ],
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
                "jersey": "36",
                "lastName": "Milton",
                "firstName": "Kendall",
                "displayName": "Kendall Milton"
              }
            },
            {
              "stats": [
                "2",
                "0",
                "0.0",
                "0",
                "0"
              ],
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
                "jersey": "16",
                "lastName": "Flacco",
                "firstName": "Joe",
                "displayName": "Joe Flacco"
              }
            }
          ]
        },
        {
          "name": "receiving",
          "labels": [
            "REC",
            "YDS",
            "AVG",
            "TD",
            "LONG",
            "TGTS"
          ],
          "athletes": [
            {
              "stats": [
                "2",
                "28",
                "14.0",
                "0",
                "20",
                "3"
              ],
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
                "jersey": "86",
                "lastName": "Young",
                "firstName": "Colbie",
                "displayName": "Colbie Young"
              }
            },
            {
              "stats": [
                "2",
                "20",
                "10.0",
                "0",
                "11",
                "2"
              ],
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
                "jersey": "80",
                "lastName": "Iosivas",
                "firstName": "Andrei",
                "displayName": "Andrei Iosivas"
              }
            },
            {
              "stats": [
                "1",
                "16",
                "16.0",
                "0",
                "16",
                "1"
              ],
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
                "jersey": "1",
                "lastName": "Chase",
                "firstName": "Ja'Marr",
                "displayName": "Ja'Marr Chase"
              }
            },
            {
              "stats": [
                "2",
                "12",
                "6.0",
                "0",
                "7",
                "2"
              ],
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
                "jersey": "34",
                "lastName": "Perine",
                "firstName": "Samaje",
                "displayName": "Samaje Perine"
              }
            },
            {
              "stats": [
                "1",
                "8",
                "8.0",
                "0",
                "8",
                "2"
              ],
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
                "jersey": "25",
                "lastName": "Brooks",
                "firstName": "Tahj",
                "displayName": "Tahj Brooks"
              }
            },
            {
              "stats": [
                "1",
                "4",
                "4.0",
                "1",
                "4",
                "1"
              ],
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
                "jersey": "84",
                "lastName": "Endries",
                "firstName": "Jack",
                "displayName": "Jack Endries"
              }
            },
            {
              "stats": [
                "1",
                "2",
                "2.0",
                "0",
                "2",
                "1"
              ],
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
                "jersey": "89",
                "lastName": "Sample",
                "firstName": "Drew",
                "displayName": "Drew Sample"
              }
            },
            {
              "stats": [
                "0",
                "0",
                "0.0",
                "0",
                "0",
                "1"
              ],
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
                "jersey": "88",
                "lastName": "Gesicki",
                "firstName": "Mike",
                "displayName": "Mike Gesicki"
              }
            }
          ]
        }
      ]
    }
  ]
};

export const auraFantasyLeadersFixture: AuraFantasyLeadersState = {
  status: 'ready',
  error: null,
  model: toAuraFantasyLeadersModel(boxScore),
};
