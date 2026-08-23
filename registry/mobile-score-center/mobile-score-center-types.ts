import type { AuraGameScoreboard } from '@/lib/aura/live-scoreboard-types';
import { toAuraDailyScoreboardModel, type AuraDailyScoreboardModel } from '@/lib/aura/daily-scoreboard-types';

export interface AuraMobileScoreCenterModel { title: string; sports: string[]; activeSport: string; scoreboard: AuraDailyScoreboardModel; }
export interface AuraMobileScoreCenterState { status: 'loading' | 'ready' | 'empty' | 'error'; model: AuraMobileScoreCenterModel | null; error: string | null; }
export function toAuraMobileScoreCenterModel(date: string, sport: string, games: AuraGameScoreboard[], sports = ['NFL', 'NBA', 'NHL', 'MLB']): AuraMobileScoreCenterModel { return { title: 'Scores', sports, activeSport: sport, scoreboard: toAuraDailyScoreboardModel(date, sport, games) }; }
