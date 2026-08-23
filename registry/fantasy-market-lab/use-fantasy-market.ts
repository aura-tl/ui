'use client';
import * as React from 'react';
import { toFantasyDraftModel, type FantasyDraftModel } from '@/components/aura/fantasyMarketTypes';
import { fantasyMarketData } from '@/lib/aura/fantasy-market-data';

export interface AuraFantasyMarketClient {
  getNflDraft(options: { season: number; scoring: string; view: 'market'; limit: number; fields: string }): Promise<Record<string, any>>;
}

export type AuraFantasyMarketState =
  | { status: 'loading'; model: null; error: null }
  | { status: 'ready'; model: FantasyDraftModel; error: null }
  | { status: 'unavailable' | 'error'; model: null; error: string };

export function useAuraFantasyMarket(client: AuraFantasyMarketClient): AuraFantasyMarketState {
  const [state, setState] = React.useState<AuraFantasyMarketState>({ status: 'loading', model: null, error: null });
  React.useEffect(() => {
    let active = true;
    const params = fantasyMarketData.params;
    void client.getNflDraft({
      season: fantasyMarketData.variables.season.default,
      scoring: fantasyMarketData.variables.scoring.default,
      view: params.view,
      limit: fantasyMarketData.variables.limit.default,
      fields: params.fields,
    }).then((payload) => {
      if (!active) return;
      const model = toFantasyDraftModel({
        ...payload,
        generatedAt: Math.max(0, ...(payload.items || []).map((item: Record<string, any>) => Number(item.updatedAt) || 0)),
      });
      setState(model.players.length ? { status: 'ready', model, error: null } : { status: 'unavailable', model: null, error: 'No retained ADP is available.' });
    }).catch((error) => { if (active) setState({ status: 'error', model: null, error: error instanceof Error ? error.message : String(error) }); });
    return () => { active = false; };
  }, [client]);
  return state;
}
