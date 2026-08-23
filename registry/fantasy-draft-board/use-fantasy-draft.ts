'use client';
import * as React from 'react';
import { toFantasyDraftModel, type FantasyDraftModel } from '@/lib/aura/fantasy-draft-types';

export interface AuraFantasyDraftClient {
  getNflDraft(options: { season: 2026; scoring: 'ppr'; limit: 250 }): Promise<Record<string, any>>;
}

export type AuraFantasyDraftState =
  | { status: 'loading'; model: null; error: null }
  | { status: 'ready'; model: FantasyDraftModel; error: null }
  | { status: 'unavailable' | 'error'; model: null; error: string };

export function useAuraFantasyDraft(client: AuraFantasyDraftClient): AuraFantasyDraftState {
  const [state, setState] = React.useState<AuraFantasyDraftState>({ status: 'loading', model: null, error: null });
  React.useEffect(() => {
    let active = true;
    void client.getNflDraft({ season: 2026, scoring: 'ppr', limit: 250 })
      .then((payload) => {
        if (!active) return;
        const items = (payload.items || []).map((row: Record<string, any>) => ({
          ...row,
          fantasy: {
            pprPoints: score(row.projection, row.entityType, 1),
            halfPprPoints: score(row.projection, row.entityType, .5),
            standardPoints: score(row.projection, row.entityType, 0),
          },
        }));
        const model = toFantasyDraftModel({
          generatedAt: Math.max(0, ...items.map((item: Record<string, any>) => Number(item.updatedAt) || 0)),
          season: 2026,
          page: payload.page,
          items,
        });
        setState(model.players.length ? { status: 'ready', model, error: null } : { status: 'unavailable', model: null, error: 'No retained 2026 draft projections are available.' });
      })
      .catch((error) => { if (active) setState({ status: 'error', model: null, error: error instanceof Error ? error.message : String(error) }); });
    return () => { active = false; };
  }, [client]);
  return state;
}

function score(raw: unknown, entityType: unknown, receptionWeight: number): number {
  const p = raw && typeof raw === 'object' ? raw as Record<string, number> : {};
  const total = entityType === 'team_defense'
    ? (p.sacks || 0) + (p.interceptions || 0) * 2 + (p.fumbleRecoveries || 0) * 2 + (p.touchdowns || 0) * 6 + (p.safeties || 0) * 2
    : (p.passingYards || 0) * .04 + (p.passingTouchdowns || 0) * 4 - (p.interceptions || 0) * 2 + (p.rushingYards || 0) * .1 + (p.rushingTouchdowns || 0) * 6 + (p.receivingYards || 0) * .1 + (p.receivingTouchdowns || 0) * 6 - (p.fumblesLost || 0) * 2 + (p.receptions || 0) * receptionWeight;
  return Math.round(total * 100) / 100;
}
