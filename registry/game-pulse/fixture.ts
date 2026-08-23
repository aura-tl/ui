// Real retained production data, captured verbatim on 2026-08-14 (UTC).
// Source: prod ezbase `game_metric_deltas` + `game_frame_heads` + `games`, replayed through the component's own loadAuraGamePulseSnapshot over GET /api/games/{gameId}/metric-series.
// Games: 50988fa3ff66120dceb25bac (PHI 7 @ MIN 1, Final) and d28a234140589eb6c3c9b5ab (MIL @ LAD, in progress), both 2026-08-13.
// Never fabricate fixture data — recapture from a real board instead.
import type { AuraGamePulseControllerState, AuraGamePulseModel } from '@/lib/aura/game-pulse-types';

/** PHI @ MIN, Final — the complete retained win-probability/score/inning replay. */
const finalModel: AuraGamePulseModel = {
  "cursor": null,
  "id": "game-pulse:50988fa3ff66120dceb25bac",
  "gameId": "50988fa3ff66120dceb25bac",
  "mode": "replay",
  "scoreboard": {
    "id": "50988fa3ff66120dceb25bac",
    "sport": "MLB",
    "league": "MLB",
    "phase": "final",
    "status": "Final",
    "startsAt": 1786663800000,
    "updatedAt": 1786674499680,
    "away": {
      "id": "mlb:team:PHI",
      "abbreviation": "PHI",
      "name": "Philadelphia Phillies",
      "score": 7,
      "color": "#ec424f",
      "record": null
    },
    "home": {
      "id": "mlb:team:MIN",
      "abbreviation": "MIN",
      "name": "Minnesota Twins",
      "score": 1,
      "color": "#748395",
      "record": null
    }
  },
  "startAt": 1786660208534,
  "endAt": 1786674396714,
  "probability": {
    "home": [
      {
        "observedAt": 1786664083444,
        "value": 0.476
      },
      {
        "observedAt": 1786664184003,
        "value": 0.496
      },
      {
        "observedAt": 1786664284387,
        "value": 0.471
      },
      {
        "observedAt": 1786664362011,
        "value": 0.417
      },
      {
        "observedAt": 1786664412718,
        "value": 0.35
      },
      {
        "observedAt": 1786664511625,
        "value": 0.386
      },
      {
        "observedAt": 1786664650430,
        "value": 0.364
      },
      {
        "observedAt": 1786665087007,
        "value": 0.463
      },
      {
        "observedAt": 1786665154177,
        "value": 0.423
      },
      {
        "observedAt": 1786665227140,
        "value": 0.457
      },
      {
        "observedAt": 1786665408933,
        "value": 0.402
      },
      {
        "observedAt": 1786665478938,
        "value": 0.355
      },
      {
        "observedAt": 1786665655214,
        "value": 0.369
      },
      {
        "observedAt": 1786665722378,
        "value": 0.382
      },
      {
        "observedAt": 1786665804618,
        "value": 0.367
      },
      {
        "observedAt": 1786665959502,
        "value": 0.39
      },
      {
        "observedAt": 1786666181181,
        "value": 0.362
      },
      {
        "observedAt": 1786666261190,
        "value": 0.473
      },
      {
        "observedAt": 1786666427108,
        "value": 0.454
      },
      {
        "observedAt": 1786666752143,
        "value": 0.469
      },
      {
        "observedAt": 1786666885060,
        "value": 0.484
      },
      {
        "observedAt": 1786667271810,
        "value": 0.499
      },
      {
        "observedAt": 1786667440394,
        "value": 0.454
      },
      {
        "observedAt": 1786667575647,
        "value": 0.421
      },
      {
        "observedAt": 1786667817969,
        "value": 0.383
      },
      {
        "observedAt": 1786667951527,
        "value": 0.415
      },
      {
        "observedAt": 1786668159963,
        "value": 0.42
      },
      {
        "observedAt": 1786668272047,
        "value": 0.226
      },
      {
        "observedAt": 1786668288153,
        "value": 0.208
      },
      {
        "observedAt": 1786668356113,
        "value": 0.143
      },
      {
        "observedAt": 1786668423091,
        "value": 0.135
      },
      {
        "observedAt": 1786668618933,
        "value": 0.131
      },
      {
        "observedAt": 1786668819992,
        "value": 0.13
      },
      {
        "observedAt": 1786668944182,
        "value": 0.115
      },
      {
        "observedAt": 1786669043146,
        "value": 0.125
      },
      {
        "observedAt": 1786669304233,
        "value": 0.115
      },
      {
        "observedAt": 1786669389899,
        "value": 0.106
      },
      {
        "observedAt": 1786669523347,
        "value": 0.116
      },
      {
        "observedAt": 1786669620257,
        "value": 0.107
      },
      {
        "observedAt": 1786669939316,
        "value": 0.103
      },
      {
        "observedAt": 1786670055940,
        "value": 0.088
      },
      {
        "observedAt": 1786670106981,
        "value": 0.108
      },
      {
        "observedAt": 1786670274030,
        "value": 0.12
      },
      {
        "observedAt": 1786670459190,
        "value": 0.146
      },
      {
        "observedAt": 1786670559884,
        "value": 0.078
      },
      {
        "observedAt": 1786670745541,
        "value": 0.084
      },
      {
        "observedAt": 1786670812548,
        "value": 0.089
      },
      {
        "observedAt": 1786671157470,
        "value": 0.072
      },
      {
        "observedAt": 1786671224022,
        "value": 0.099
      },
      {
        "observedAt": 1786671292226,
        "value": 0.073
      },
      {
        "observedAt": 1786671680192,
        "value": 0.062
      },
      {
        "observedAt": 1786671834791,
        "value": 0.052
      },
      {
        "observedAt": 1786671977907,
        "value": 0.015
      },
      {
        "observedAt": 1786672013704,
        "value": 0.016
      },
      {
        "observedAt": 1786672182507,
        "value": 0.017
      },
      {
        "observedAt": 1786672377284,
        "value": 0.011
      },
      {
        "observedAt": 1786672542144,
        "value": 0.007
      },
      {
        "observedAt": 1786672573773,
        "value": 0.009
      },
      {
        "observedAt": 1786672640920,
        "value": 0.006
      },
      {
        "observedAt": 1786672939828,
        "value": 0.007
      },
      {
        "observedAt": 1786673274066,
        "value": 0.004
      },
      {
        "observedAt": 1786673369239,
        "value": 0.002
      },
      {
        "observedAt": 1786673488151,
        "value": 0.001
      },
      {
        "observedAt": 1786673876876,
        "value": 0.002
      },
      {
        "observedAt": 1786674291876,
        "value": 0.001
      },
      {
        "observedAt": 1786674340865,
        "value": 0.002
      },
      {
        "observedAt": 1786674396714,
        "value": 0
      }
    ],
    "away": [
      {
        "observedAt": 1786664083444,
        "value": 0.524
      },
      {
        "observedAt": 1786664184003,
        "value": 0.504
      },
      {
        "observedAt": 1786664284387,
        "value": 0.529
      },
      {
        "observedAt": 1786664362011,
        "value": 0.583
      },
      {
        "observedAt": 1786664412718,
        "value": 0.65
      },
      {
        "observedAt": 1786664511625,
        "value": 0.614
      },
      {
        "observedAt": 1786664650430,
        "value": 0.636
      },
      {
        "observedAt": 1786665087007,
        "value": 0.5369999999999999
      },
      {
        "observedAt": 1786665154177,
        "value": 0.577
      },
      {
        "observedAt": 1786665227140,
        "value": 0.5429999999999999
      },
      {
        "observedAt": 1786665408933,
        "value": 0.598
      },
      {
        "observedAt": 1786665478938,
        "value": 0.645
      },
      {
        "observedAt": 1786665655214,
        "value": 0.631
      },
      {
        "observedAt": 1786665722378,
        "value": 0.618
      },
      {
        "observedAt": 1786665804618,
        "value": 0.633
      },
      {
        "observedAt": 1786665959502,
        "value": 0.61
      },
      {
        "observedAt": 1786666181181,
        "value": 0.638
      },
      {
        "observedAt": 1786666261190,
        "value": 0.527
      },
      {
        "observedAt": 1786666427108,
        "value": 0.546
      },
      {
        "observedAt": 1786666752143,
        "value": 0.531
      },
      {
        "observedAt": 1786666885060,
        "value": 0.516
      },
      {
        "observedAt": 1786667271810,
        "value": 0.501
      },
      {
        "observedAt": 1786667440394,
        "value": 0.546
      },
      {
        "observedAt": 1786667575647,
        "value": 0.579
      },
      {
        "observedAt": 1786667817969,
        "value": 0.617
      },
      {
        "observedAt": 1786667951527,
        "value": 0.585
      },
      {
        "observedAt": 1786668159963,
        "value": 0.5800000000000001
      },
      {
        "observedAt": 1786668272047,
        "value": 0.774
      },
      {
        "observedAt": 1786668288153,
        "value": 0.792
      },
      {
        "observedAt": 1786668356113,
        "value": 0.857
      },
      {
        "observedAt": 1786668423091,
        "value": 0.865
      },
      {
        "observedAt": 1786668618933,
        "value": 0.869
      },
      {
        "observedAt": 1786668819992,
        "value": 0.87
      },
      {
        "observedAt": 1786668944182,
        "value": 0.885
      },
      {
        "observedAt": 1786669043146,
        "value": 0.875
      },
      {
        "observedAt": 1786669304233,
        "value": 0.885
      },
      {
        "observedAt": 1786669389899,
        "value": 0.894
      },
      {
        "observedAt": 1786669523347,
        "value": 0.884
      },
      {
        "observedAt": 1786669620257,
        "value": 0.893
      },
      {
        "observedAt": 1786669939316,
        "value": 0.897
      },
      {
        "observedAt": 1786670055940,
        "value": 0.912
      },
      {
        "observedAt": 1786670106981,
        "value": 0.892
      },
      {
        "observedAt": 1786670274030,
        "value": 0.88
      },
      {
        "observedAt": 1786670459190,
        "value": 0.854
      },
      {
        "observedAt": 1786670559884,
        "value": 0.922
      },
      {
        "observedAt": 1786670745541,
        "value": 0.916
      },
      {
        "observedAt": 1786670812548,
        "value": 0.911
      },
      {
        "observedAt": 1786671157470,
        "value": 0.928
      },
      {
        "observedAt": 1786671224022,
        "value": 0.901
      },
      {
        "observedAt": 1786671292226,
        "value": 0.927
      },
      {
        "observedAt": 1786671680192,
        "value": 0.938
      },
      {
        "observedAt": 1786671834791,
        "value": 0.948
      },
      {
        "observedAt": 1786671977907,
        "value": 0.985
      },
      {
        "observedAt": 1786672013704,
        "value": 0.984
      },
      {
        "observedAt": 1786672182507,
        "value": 0.983
      },
      {
        "observedAt": 1786672377284,
        "value": 0.989
      },
      {
        "observedAt": 1786672542144,
        "value": 0.993
      },
      {
        "observedAt": 1786672573773,
        "value": 0.991
      },
      {
        "observedAt": 1786672640920,
        "value": 0.994
      },
      {
        "observedAt": 1786672939828,
        "value": 0.993
      },
      {
        "observedAt": 1786673274066,
        "value": 0.996
      },
      {
        "observedAt": 1786673369239,
        "value": 0.998
      },
      {
        "observedAt": 1786673488151,
        "value": 0.999
      },
      {
        "observedAt": 1786673876876,
        "value": 0.998
      },
      {
        "observedAt": 1786674291876,
        "value": 0.999
      },
      {
        "observedAt": 1786674340865,
        "value": 0.998
      },
      {
        "observedAt": 1786674396714,
        "value": 1
      }
    ],
    "unavailable": null
  },
  "score": {
    "home": [
      {
        "observedAt": 1786660208534,
        "value": 0
      },
      {
        "observedAt": 1786666240707,
        "value": 1
      }
    ],
    "away": [
      {
        "observedAt": 1786660208534,
        "value": 0
      },
      {
        "observedAt": 1786664083444,
        "value": 1
      },
      {
        "observedAt": 1786664412718,
        "value": 2
      },
      {
        "observedAt": 1786668244144,
        "value": 4
      },
      {
        "observedAt": 1786668320240,
        "value": 5
      },
      {
        "observedAt": 1786671977907,
        "value": 7
      }
    ]
  },
  "margin": {
    "points": [
      {
        "observedAt": 1786660208534,
        "value": 0
      },
      {
        "observedAt": 1786664083444,
        "value": 0
      },
      {
        "observedAt": 1786664412718,
        "value": -1
      },
      {
        "observedAt": 1786666240707,
        "value": -1
      },
      {
        "observedAt": 1786668244144,
        "value": -1
      },
      {
        "observedAt": 1786668320240,
        "value": -3
      },
      {
        "observedAt": 1786671977907,
        "value": -6
      }
    ],
    "unit": "runs",
    "unavailable": null
  },
  "periods": [
    {
      "id": "period:T1:1786663929904",
      "label": "T1",
      "startAt": 1786663929904,
      "endAt": 1786665004024
    },
    {
      "id": "period:B1:1786665004024",
      "label": "B1",
      "startAt": 1786665004024,
      "endAt": 1786665622818
    },
    {
      "id": "period:T2:1786665622818",
      "label": "T2",
      "startAt": 1786665622818,
      "endAt": 1786666098384
    },
    {
      "id": "period:B2:1786666098384",
      "label": "B2",
      "startAt": 1786666098384,
      "endAt": 1786666715926
    },
    {
      "id": "period:T3:1786666715926",
      "label": "T3",
      "startAt": 1786666715926,
      "endAt": 1786667066449
    },
    {
      "id": "period:B3:1786667066449",
      "label": "B3",
      "startAt": 1786667066449,
      "endAt": 1786667715203
    },
    {
      "id": "period:T4:1786667715203",
      "label": "T4",
      "startAt": 1786667715203,
      "endAt": 1786668765887
    },
    {
      "id": "period:B4:1786668765887",
      "label": "B4",
      "startAt": 1786668765887,
      "endAt": 1786669167289
    },
    {
      "id": "period:T5:1786669167289",
      "label": "T5",
      "startAt": 1786669167289,
      "endAt": 1786669788849
    },
    {
      "id": "period:B5:1786669788849",
      "label": "B5",
      "startAt": 1786669788849,
      "endAt": 1786670695762
    },
    {
      "id": "period:T6:1786670695762",
      "label": "T6",
      "startAt": 1786670695762,
      "endAt": 1786670980267
    },
    {
      "id": "period:B6:1786670980267",
      "label": "B6",
      "startAt": 1786670980267,
      "endAt": 1786671574808
    },
    {
      "id": "period:T7:1786671574808",
      "label": "T7",
      "startAt": 1786671574808,
      "endAt": 1786672182507
    },
    {
      "id": "period:B7:1786672182507",
      "label": "B7",
      "startAt": 1786672182507,
      "endAt": 1786672822112
    },
    {
      "id": "period:T8:1786672822112",
      "label": "T8",
      "startAt": 1786672822112,
      "endAt": 1786673100710
    },
    {
      "id": "period:B8:1786673100710",
      "label": "B8",
      "startAt": 1786673100710,
      "endAt": 1786673545710
    },
    {
      "id": "period:T9:1786673545710",
      "label": "T9",
      "startAt": 1786673545710,
      "endAt": 1786674053835
    },
    {
      "id": "period:B9:1786674053835",
      "label": "B9",
      "startAt": 1786674053835,
      "endAt": 1786674396714
    }
  ],
  "periodState": [
    {
      "observedAt": 1786663929904,
      "number": 1
    },
    {
      "observedAt": 1786665622818,
      "number": 2
    },
    {
      "observedAt": 1786666715926,
      "number": 3
    },
    {
      "observedAt": 1786667715203,
      "number": 4
    },
    {
      "observedAt": 1786669167289,
      "number": 5
    },
    {
      "observedAt": 1786670695762,
      "number": 6
    },
    {
      "observedAt": 1786671574808,
      "number": 7
    },
    {
      "observedAt": 1786672822112,
      "number": 8
    },
    {
      "observedAt": 1786673545710,
      "number": 9
    },
    {
      "observedAt": 1786663929904,
      "state": "top"
    },
    {
      "observedAt": 1786664866398,
      "state": "middle"
    },
    {
      "observedAt": 1786665004024,
      "state": "bottom"
    },
    {
      "observedAt": 1786665458780,
      "state": "end"
    },
    {
      "observedAt": 1786665622818,
      "state": "top"
    },
    {
      "observedAt": 1786665943179,
      "state": "middle"
    },
    {
      "observedAt": 1786666098384,
      "state": "bottom"
    },
    {
      "observedAt": 1786666572653,
      "state": "end"
    },
    {
      "observedAt": 1786666715926,
      "state": "top"
    },
    {
      "observedAt": 1786666938898,
      "state": "middle"
    },
    {
      "observedAt": 1786667066449,
      "state": "bottom"
    },
    {
      "observedAt": 1786667575647,
      "state": "end"
    },
    {
      "observedAt": 1786667715203,
      "state": "top"
    },
    {
      "observedAt": 1786668618933,
      "state": "middle"
    },
    {
      "observedAt": 1786668765887,
      "state": "bottom"
    },
    {
      "observedAt": 1786669112969,
      "state": "end"
    },
    {
      "observedAt": 1786669167289,
      "state": "top"
    },
    {
      "observedAt": 1786669668628,
      "state": "middle"
    },
    {
      "observedAt": 1786669788849,
      "state": "bottom"
    },
    {
      "observedAt": 1786670542274,
      "state": "end"
    },
    {
      "observedAt": 1786670695762,
      "state": "top"
    },
    {
      "observedAt": 1786670934688,
      "state": "middle"
    },
    {
      "observedAt": 1786670980267,
      "state": "bottom"
    },
    {
      "observedAt": 1786671452621,
      "state": "end"
    },
    {
      "observedAt": 1786671574808,
      "state": "top"
    },
    {
      "observedAt": 1786672182507,
      "state": "bottom"
    },
    {
      "observedAt": 1786672198802,
      "state": "middle"
    },
    {
      "observedAt": 1786672263342,
      "state": "bottom"
    },
    {
      "observedAt": 1786672640920,
      "state": "end"
    },
    {
      "observedAt": 1786672822112,
      "state": "top"
    },
    {
      "observedAt": 1786672990217,
      "state": "middle"
    },
    {
      "observedAt": 1786673100710,
      "state": "bottom"
    },
    {
      "observedAt": 1786673488151,
      "state": "end"
    },
    {
      "observedAt": 1786673545710,
      "state": "top"
    },
    {
      "observedAt": 1786673993330,
      "state": "middle"
    },
    {
      "observedAt": 1786674053835,
      "state": "bottom"
    },
    {
      "observedAt": 1786674377751,
      "state": "end"
    }
  ],
  "periodUnavailable": null,
  "complete": true,
  "missing": []
};

/** MIL @ LAD mid-game — the retained series up to the capture instant. */
const liveModel: AuraGamePulseModel = {
  "cursor": null,
  "id": "game-pulse:d28a234140589eb6c3c9b5ab",
  "gameId": "d28a234140589eb6c3c9b5ab",
  "mode": "live",
  "scoreboard": {
    "id": "d28a234140589eb6c3c9b5ab",
    "sport": "MLB",
    "league": "MLB",
    "phase": "in_progress",
    "status": "in_progress",
    "startsAt": 1786673400000,
    "updatedAt": 1786677024397,
    "away": {
      "id": "mlb:team:MIL",
      "abbreviation": "MIL",
      "name": "Milwaukee Brewers",
      "score": 2,
      "color": "#7d8a9c",
      "record": null
    },
    "home": {
      "id": "mlb:team:LAD",
      "abbreviation": "LAD",
      "name": "Los Angeles Dodgers",
      "score": 0,
      "color": "#5490bd",
      "record": null
    }
  },
  "startAt": 1786669845990,
  "endAt": 1786677496976,
  "probability": {
    "home": [
      {
        "observedAt": 1786673577917,
        "value": 0.587
      },
      {
        "observedAt": 1786673643890,
        "value": 0.604
      },
      {
        "observedAt": 1786673815126,
        "value": 0.593
      },
      {
        "observedAt": 1786674072460,
        "value": 0.674
      },
      {
        "observedAt": 1786674187825,
        "value": 0.634
      },
      {
        "observedAt": 1786674355731,
        "value": 0.595
      },
      {
        "observedAt": 1786674681377,
        "value": 0.524
      },
      {
        "observedAt": 1786674747595,
        "value": 0.559
      },
      {
        "observedAt": 1786674799049,
        "value": 0.589
      },
      {
        "observedAt": 1786674854338,
        "value": 0.611
      },
      {
        "observedAt": 1786674990987,
        "value": 0.641
      },
      {
        "observedAt": 1786675092166,
        "value": 0.567
      },
      {
        "observedAt": 1786675240953,
        "value": 0.554
      },
      {
        "observedAt": 1786675512057,
        "value": 0.575
      },
      {
        "observedAt": 1786675646525,
        "value": 0.537
      },
      {
        "observedAt": 1786675700017,
        "value": 0.576
      },
      {
        "observedAt": 1786675919774,
        "value": 0.577
      },
      {
        "observedAt": 1786675988876,
        "value": 0.56
      },
      {
        "observedAt": 1786676079551,
        "value": 0.547
      },
      {
        "observedAt": 1786676288051,
        "value": 0.503
      },
      {
        "observedAt": 1786676396359,
        "value": 0.551
      },
      {
        "observedAt": 1786676500728,
        "value": 0.511
      },
      {
        "observedAt": 1786676536508,
        "value": 0.448
      },
      {
        "observedAt": 1786676707914,
        "value": 0.534
      },
      {
        "observedAt": 1786676774356,
        "value": 0.415
      },
      {
        "observedAt": 1786676940748,
        "value": 0.287
      },
      {
        "observedAt": 1786677024397,
        "value": 0.351
      },
      {
        "observedAt": 1786677213625,
        "value": 0.318
      },
      {
        "observedAt": 1786677302310,
        "value": 0.352
      },
      {
        "observedAt": 1786677324130,
        "value": 0.303
      },
      {
        "observedAt": 1786677406371,
        "value": 0.271
      }
    ],
    "away": [
      {
        "observedAt": 1786673577917,
        "value": 0.41300000000000003
      },
      {
        "observedAt": 1786673643890,
        "value": 0.396
      },
      {
        "observedAt": 1786673815126,
        "value": 0.40700000000000003
      },
      {
        "observedAt": 1786674072460,
        "value": 0.32599999999999996
      },
      {
        "observedAt": 1786674187825,
        "value": 0.366
      },
      {
        "observedAt": 1786674355731,
        "value": 0.405
      },
      {
        "observedAt": 1786674681377,
        "value": 0.476
      },
      {
        "observedAt": 1786674747595,
        "value": 0.44099999999999995
      },
      {
        "observedAt": 1786674799049,
        "value": 0.41100000000000003
      },
      {
        "observedAt": 1786674854338,
        "value": 0.389
      },
      {
        "observedAt": 1786674990987,
        "value": 0.359
      },
      {
        "observedAt": 1786675092166,
        "value": 0.43300000000000005
      },
      {
        "observedAt": 1786675240953,
        "value": 0.44599999999999995
      },
      {
        "observedAt": 1786675512057,
        "value": 0.42500000000000004
      },
      {
        "observedAt": 1786675646525,
        "value": 0.46299999999999997
      },
      {
        "observedAt": 1786675700017,
        "value": 0.42400000000000004
      },
      {
        "observedAt": 1786675919774,
        "value": 0.42300000000000004
      },
      {
        "observedAt": 1786675988876,
        "value": 0.43999999999999995
      },
      {
        "observedAt": 1786676079551,
        "value": 0.45299999999999996
      },
      {
        "observedAt": 1786676288051,
        "value": 0.497
      },
      {
        "observedAt": 1786676396359,
        "value": 0.44899999999999995
      },
      {
        "observedAt": 1786676500728,
        "value": 0.489
      },
      {
        "observedAt": 1786676536508,
        "value": 0.552
      },
      {
        "observedAt": 1786676707914,
        "value": 0.46599999999999997
      },
      {
        "observedAt": 1786676774356,
        "value": 0.585
      },
      {
        "observedAt": 1786676940748,
        "value": 0.7130000000000001
      },
      {
        "observedAt": 1786677024397,
        "value": 0.649
      },
      {
        "observedAt": 1786677213625,
        "value": 0.6819999999999999
      },
      {
        "observedAt": 1786677302310,
        "value": 0.648
      },
      {
        "observedAt": 1786677324130,
        "value": 0.6970000000000001
      },
      {
        "observedAt": 1786677406371,
        "value": 0.729
      }
    ],
    "unavailable": null
  },
  "score": {
    "home": [
      {
        "observedAt": 1786669845990,
        "value": 0
      }
    ],
    "away": [
      {
        "observedAt": 1786669845990,
        "value": 0
      },
      {
        "observedAt": 1786676774356,
        "value": 1
      },
      {
        "observedAt": 1786676940748,
        "value": 2
      }
    ]
  },
  "margin": {
    "points": [
      {
        "observedAt": 1786669845990,
        "value": 0
      },
      {
        "observedAt": 1786676774356,
        "value": 0
      },
      {
        "observedAt": 1786676940748,
        "value": -2
      }
    ],
    "unit": "runs",
    "unavailable": null
  },
  "periods": [
    {
      "id": "period:T1:1786673476105",
      "label": "T1",
      "startAt": 1786673476105,
      "endAt": 1786673999737
    },
    {
      "id": "period:B1:1786673999737",
      "label": "B1",
      "startAt": 1786673999737,
      "endAt": 1786674563829
    },
    {
      "id": "period:T2:1786674563829",
      "label": "T2",
      "startAt": 1786674563829,
      "endAt": 1786674943294
    },
    {
      "id": "period:B2:1786674943294",
      "label": "B2",
      "startAt": 1786674943294,
      "endAt": 1786675350071
    },
    {
      "id": "period:T3:1786675350071",
      "label": "T3",
      "startAt": 1786675350071,
      "endAt": 1786675904241
    },
    {
      "id": "period:B3:1786675904241",
      "label": "B3",
      "startAt": 1786675904241,
      "endAt": 1786676194537
    },
    {
      "id": "period:T4:1786676194537",
      "label": "T4",
      "startAt": 1786676194537,
      "endAt": 1786677129269
    },
    {
      "id": "period:B4:1786677129269",
      "label": "B4",
      "startAt": 1786677129269,
      "endAt": 1786677496976
    },
    {
      "id": "period:T5:1786677496976",
      "label": "T5",
      "startAt": 1786677496976,
      "endAt": 1786677496976
    }
  ],
  "periodState": [
    {
      "observedAt": 1786673476105,
      "number": 1
    },
    {
      "observedAt": 1786674563829,
      "number": 2
    },
    {
      "observedAt": 1786675350071,
      "number": 3
    },
    {
      "observedAt": 1786676194537,
      "number": 4
    },
    {
      "observedAt": 1786677496976,
      "number": 5
    },
    {
      "observedAt": 1786673476105,
      "state": "top"
    },
    {
      "observedAt": 1786673897913,
      "state": "middle"
    },
    {
      "observedAt": 1786673999737,
      "state": "bottom"
    },
    {
      "observedAt": 1786674426262,
      "state": "end"
    },
    {
      "observedAt": 1786674563829,
      "state": "top"
    },
    {
      "observedAt": 1786674835362,
      "state": "middle"
    },
    {
      "observedAt": 1786674943294,
      "state": "bottom"
    },
    {
      "observedAt": 1786675240953,
      "state": "end"
    },
    {
      "observedAt": 1786675350071,
      "state": "top"
    },
    {
      "observedAt": 1786675783024,
      "state": "middle"
    },
    {
      "observedAt": 1786675904241,
      "state": "bottom"
    },
    {
      "observedAt": 1786676054828,
      "state": "end"
    },
    {
      "observedAt": 1786676194537,
      "state": "top"
    },
    {
      "observedAt": 1786677006379,
      "state": "middle"
    },
    {
      "observedAt": 1786677129269,
      "state": "bottom"
    },
    {
      "observedAt": 1786677406371,
      "state": "end"
    },
    {
      "observedAt": 1786677496976,
      "state": "top"
    }
  ],
  "periodUnavailable": null,
  "complete": true,
  "missing": []
};

export const auraGamePulseFixture: AuraGamePulseControllerState = {
  status: 'replay',
  error: null,
  reconnectAttempt: 0,
  model: finalModel,
};

const partialModel: AuraGamePulseModel = {
  ...finalModel,
  complete: false,
  missing: ['game.winProbability.away'],
  probability: {
    ...finalModel.probability,
    away: [],
    unavailable: 'Away win probability is unavailable for this retained game.',
  },
};

export const auraGamePulseStateFixtures: Record<
  AuraGamePulseControllerState['status'],
  AuraGamePulseControllerState
> = {
  connecting: { status: 'connecting', model: null, error: null, reconnectAttempt: 0 },
  live: { status: 'live', model: liveModel, error: null, reconnectAttempt: 0 },
  stale: { status: 'stale', model: liveModel, error: 'Stream reconnecting from the last durable cursor.', reconnectAttempt: 2 },
  final: { status: 'final', model: finalModel, error: null, reconnectAttempt: 0 },
  replay: auraGamePulseFixture,
  unavailable: { status: 'unavailable', model: null, error: 'No granular metrics are retained for this game.', reconnectAttempt: 1 },
  error: { status: 'error', model: null, error: 'Aura API could not be reached.', reconnectAttempt: 1 },
};

export const auraGamePulsePartialFixture: AuraGamePulseControllerState = {
  status: 'replay',
  model: partialModel,
  error: 'Unavailable: game.winProbability.away',
  reconnectAttempt: 0,
};
