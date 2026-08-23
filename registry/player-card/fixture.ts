// Real retained production data, captured verbatim on 2026-08-14 (UTC).
// Source: GET /api/players/{playerId} (card view) against production.
// Player: mlb:multi_source:player:660271 — Shohei Ohtani, Los Angeles Dodgers.
// Never fabricate fixture data — recapture from a real board instead.
import { toAuraPlayerCardModel, type AuraPlayerCardState } from '@/lib/aura/player-card-types';

export const auraPlayerCardFixture: AuraPlayerCardState = {
  status: 'ready',
  error: null,
  model: toAuraPlayerCardModel({
  "id": "mlb:multi_source:player:660271",
  "name": {
    "display": "Shohei Ohtani"
  },
  "currentTeam": {
    "abbreviation": "LAD"
  },
  "position": {
    "abbreviation": "DH"
  },
  "media": {
    "headshot": "/api/players/mlb%3Amulti_source%3Aplayer%3A660271/headshot"
  }
}),
};
