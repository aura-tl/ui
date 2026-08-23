import { toSportsbookModel } from '@/lib/aura/sportsbook-types';

export const retainedSportsbookPayload = {
  generatedAt: 1786759285130,
  coverage: { games: 4, markets: 9, sports: 2, liveGames: 2, scheduledGames: 2, truncated: true },
  sports: ['NFL', 'COLLEGE_FOOTBALL'],
  boards: [
    {
      game: { id: 'nfl:game:401873277', sport: 'NFL', league: 'NFL', phase: 'in_progress', statusDetail: '2:00 - 4th Quarter', startsAtMs: 1786748400000, teams: { away: { id: 'nfl:team:MIA', abbreviation: 'MIA', displayName: 'Miami Dolphins', score: 7, color: '008e97' }, home: { id: 'nfl:team:WSH', abbreviation: 'WSH', displayName: 'Washington Commanders', score: 20, color: '5a1414' } } },
      markets: [
        { marketType: 'moneyline', asOf: 1786759188225, outcomes: [{ side: 'home', line: null, price: 142 }, { side: 'away', line: null, price: -170 }] },
        { marketType: 'spread', asOf: 1786759262063, outcomes: [{ side: 'home', line: -15.5, price: -230 }, { side: 'away', line: 15.5, price: 175 }] },
        { marketType: 'total', asOf: 1786759262063, outcomes: [{ side: 'over', line: 29.5, price: -395 }, { side: 'under', line: 29.5, price: 280 }] },
      ],
    },
    {
      game: { id: 'nfl:game:401873278', sport: 'NFL', league: 'NFL', phase: 'in_progress', statusDetail: '2:00 - 4th Quarter', startsAtMs: 1786748400000, teams: { away: { id: 'nfl:team:DEN', abbreviation: 'DEN', displayName: 'Denver Broncos', score: 27, color: '0a2343' }, home: { id: 'nfl:team:ATL', abbreviation: 'ATL', displayName: 'Atlanta Falcons', score: 7, color: 'a71930' } } },
      markets: [
        { marketType: 'moneyline', asOf: 1786759240856, outcomes: [{ side: 'home', line: null, price: 6000 }, { side: 'away', line: null, price: -166 }] },
        { marketType: 'spread', asOf: 1786759240856, outcomes: [{ side: 'home', line: 19.5, price: 154 }, { side: 'away', line: -19.5, price: -200 }] },
        { marketType: 'total', asOf: 1786759240856, outcomes: [{ side: 'over', line: 34.5, price: 105 }, { side: 'under', line: 34.5, price: -135 }] },
      ],
    },
    {
      game: { id: 'nfl:game:401873281', sport: 'NFL', league: 'NFL', phase: 'scheduled', statusDetail: 'Sat, August 15th at 4:00 PM EDT', startsAtMs: 1786824000000, teams: { away: { id: 'nfl:team:JAX', abbreviation: 'JAX', displayName: 'Jacksonville Jaguars', score: 0, color: '007487' }, home: { id: 'nfl:team:NO', abbreviation: 'NO', displayName: 'New Orleans Saints', score: 0, color: 'd3bc8d' } } },
      markets: [
        { marketType: 'spread', asOf: 1786700407348, outcomes: [{ side: 'home', line: -2.5, price: -108 }, { side: 'away', line: 2.5, price: -112 }] },
        { marketType: 'total', asOf: 1786700407348, outcomes: [{ side: 'over', line: 35.5, price: -108 }, { side: 'under', line: 35.5, price: -112 }] },
      ],
    },
    {
      game: { id: 'college-football:game:401869960', sport: 'COLLEGE_FOOTBALL', league: 'COLLEGE_FOOTBALL', phase: 'scheduled', statusDetail: 'Sat, September 5th at 12:00 PM EDT', startsAtMs: 1788624000000, teams: { away: { id: 'college_football:team:LIB', abbreviation: 'LIB', displayName: 'Liberty Flames', score: 0, color: '0a254e' }, home: { id: 'college_football:team:JMU', abbreviation: 'JMU', displayName: 'James Madison Dukes', score: 0, color: '450084' } } },
      markets: [{ marketType: 'total', asOf: 1786722204818, outcomes: [{ side: 'over', line: 52.5, price: -105 }, { side: 'under', line: 52.5, price: -115 }] }],
    },
  ],
};

export const retainedSportsbookModel = toSportsbookModel(retainedSportsbookPayload);
