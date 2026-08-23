'use client';
import * as React from 'react';
import { toSportsbookModel, type SportsbookModel } from '@/lib/aura/sportsbook-types';

export type AuraSportsbookState =
  | { status: 'loading'; model: null; error: null }
  | { status: 'ready'; model: SportsbookModel; error: null }
  | { status: 'stale'; model: SportsbookModel; error: string }
  | { status: 'unavailable' | 'error'; model: null; error: string };

export function useAuraSportsbook(options: { endpoint?: string; intervalMs?: number; fetchImpl?: typeof fetch } = {}): AuraSportsbookState {
  const { endpoint = '/api/showcase/sportsbook', intervalMs = 15_000, fetchImpl = fetch } = options;
  const [state, setState] = React.useState<AuraSportsbookState>({ status: 'loading', model: null, error: null });
  React.useEffect(() => {
    let active = true;
    let timer: number | undefined;
    const refresh = async () => {
      try {
        const response = await fetchImpl(endpoint, { headers: { accept: 'application/json' } });
        if (!response.ok) throw new Error('Aura sportsbook request failed (' + response.status + ')');
        const model = toSportsbookModel(await response.json());
        if (!active) return;
        setState(model.games.length ? { status: 'ready', model, error: null } : { status: 'unavailable', model: null, error: 'No retained open markets are available.' });
      } catch (error) {
        if (!active) return;
        const message = error instanceof Error ? error.message : String(error);
        setState((previous) => previous.model ? { status: 'stale', model: previous.model, error: message } : { status: 'error', model: null, error: message });
      } finally {
        if (active) timer = window.setTimeout(refresh, intervalMs);
      }
    };
    void refresh();
    return () => { active = false; if (timer !== undefined) window.clearTimeout(timer); };
  }, [endpoint, intervalMs, fetchImpl]);
  return state;
}
