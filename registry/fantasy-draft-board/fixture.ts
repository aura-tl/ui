// Captured from production nfl_draft_projections on 2026-08-14; values are retained verbatim.
import { toFantasyDraftModel } from '@/lib/aura/fantasy-draft-types';

export const auraFantasyDraftFixture = toFantasyDraftModel({
  state: 'connected', generatedAt: 1786461080975, season: 2026,
  coverage: { entities: 5, players: 4, defenses: 1, ranked: 5, truncated: true },
  items: [
    { entityId:'nfl:multi_source:player:4362628', entityType:'player', playerId:'nfl:multi_source:player:4362628', teamId:'nfl:team:CIN', name:"Ja'Marr Chase", position:'WR', draft:{overallRank:1.8,positionRank:1.3,asOf:'2026-08-07'}, projection:{receptions:121.5,fumblesLost:1,rushingYards:17,receivingYards:1512,rushingAttempts:3,rushingTouchdowns:0,receivingTouchdowns:10.6}, fantasy:{pprPoints:336,halfPprPoints:275.25,standardPoints:214.5} },
    { entityId:'nfl:multi_source:player:4430807', entityType:'player', playerId:'nfl:multi_source:player:4430807', teamId:'nfl:team:ATL', name:'Bijan Robinson', position:'RB', draft:{overallRank:3.28,positionRank:1.54,asOf:'2026-08-07'}, projection:{receptions:79.6,fumblesLost:1.8,rushingYards:1428,receivingYards:736.4,rushingAttempts:289.6,rushingTouchdowns:9.5,receivingTouchdowns:3.8}, fantasy:{pprPoints:372.24,halfPprPoints:332.44,standardPoints:292.64} },
    { entityId:'nfl:multi_source:player:4361307', entityType:'player', playerId:'nfl:multi_source:player:4361307', teamId:'nfl:team:ARI', name:'Trey McBride', position:'TE', draft:{overallRank:19.12,positionRank:1.44,asOf:'2026-08-07'}, projection:{receptions:109,fumblesLost:.2,receivingYards:1051,receivingTouchdowns:6.8}, fantasy:{pprPoints:254.5,halfPprPoints:200,standardPoints:145.5} },
    { entityId:'nfl:multi_source:player:3918298', entityType:'player', playerId:'nfl:multi_source:player:3918298', teamId:'nfl:team:BUF', name:'Josh Allen', position:'QB', draft:{overallRank:25.85,positionRank:1.02,asOf:'2026-08-07'}, projection:{fumblesLost:4.1,passingYards:3815.6,rushingYards:585.2,interceptions:11.2,passingAttempts:491.6,rushingAttempts:118.1,passingTouchdowns:27.4,rushingTouchdowns:11.8,passingCompletions:333.4}, fantasy:{pprPoints:360.94,halfPprPoints:360.94,standardPoints:360.94} },
    { entityId:'nfl:team:HOU', entityType:'team_defense', playerId:null, teamId:'nfl:team:HOU', name:'Houston Texans', position:'DST', draft:{overallRank:153.56,positionRank:1.33,asOf:'2026-08-07'}, projection:{sacks:49.6,safeties:1,touchdowns:2.8,yardsAllowed:5048.7,forcedFumbles:18.3,interceptions:14.8,pointsAllowed:321.7,fumbleRecoveries:11.6}, fantasy:{pprPoints:121.2,halfPprPoints:121.2,standardPoints:121.2} },
  ],
});
