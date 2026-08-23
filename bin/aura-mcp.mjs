#!/usr/bin/env node
/**
 * Aura MCP server.
 *
 * A thin Model Context Protocol server over the public Aura REST API, so any
 * MCP client (Claude Code, Claude Desktop, agent frameworks) can pull live
 * scores, game state, odds, box scores, plays, and entities with tool calls.
 *
 * Design constraints:
 * - Zero dependencies: newline-delimited JSON-RPC 2.0 over stdio, per the MCP
 *   stdio transport spec. Node 18+ (global fetch).
 * - Same contract as every other consumer: plain REST + x-api-key. This is a
 *   metered doorway to the API, not an unmetered escape hatch.
 *
 * Run:  aura-mcp
 * Env:  AURA_API_URL  (default https://aura.tl)
 *       AURA_API_KEY  (read from the environment or .env.local)
 */

import { readFileSync } from 'node:fs';
import { createInterface } from 'node:readline';

// Tolerate MCP clients that pass through unexpanded ${VAR} placeholders.
function envValue(raw, fallback) {
  const value = (raw || '').trim();
  return !value || value.startsWith('${') ? fallback : value;
}

const projectEnv = loadProjectEnv(process.env.AURA_ENV_FILE || '.env.local');
const API_URL = envValue(
  process.env.AURA_API_URL || projectEnv.AURA_API_URL,
  'https://aura.tl'
).replace(/\/$/, '');
const API_KEY = envValue(process.env.AURA_API_KEY || projectEnv.AURA_API_KEY, '');
const PROTOCOL_VERSIONS = new Set(['2024-11-05', '2025-03-26', '2025-06-18']);
const MAX_RESULT_CHARS = 60_000;

const SPORTS = ['MLB', 'WNBA', 'NFL', 'NBA', 'NHL', 'COLLEGE_FOOTBALL', 'COLLEGE_BASKETBALL'];

function loadProjectEnv(file) {
  let source;
  try {
    source = readFileSync(file, 'utf8');
  } catch (error) {
    if (error?.code === 'ENOENT') return {};
    throw error;
  }
  const values = {};
  for (const line of source.split(/\r?\n/)) {
    const match = line.match(/^(AURA_API_URL|AURA_API_KEY)=(.*)$/);
    if (match) values[match[1]] = match[2];
  }
  return values;
}

/* ------------------------------------------------------------------ tools */

const TOOLS = [
  {
    name: 'aura_coverage',
    description:
      'What Aura can answer right now: available sports, seasons, and data products with measured completeness and freshness. Call this first when unsure whether data exists.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    request: () => ({ path: '/api/coverage' }),
  },
  {
    name: 'aura_list_games',
    description:
      'List games with teams, schedule, phase, status, and score. Filter by sport, status (scheduled|in_progress|final), date (YYYY-MM-DD), or team abbreviation. Returns compact game summaries with Aura game ids.',
    inputSchema: {
      type: 'object',
      properties: {
        sport: { type: 'string', enum: SPORTS },
        status: { type: 'string', enum: ['scheduled', 'in_progress', 'final'] },
        date: { type: 'string', description: 'YYYY-MM-DD (league date)' },
        team: { type: 'string', description: 'Team abbreviation, e.g. NYY' },
        limit: { type: 'number', minimum: 1, maximum: 100 },
      },
      additionalProperties: false,
    },
    request: (args) => ({ path: '/api/games', query: { view: 'summary', limit: 25, ...args } }),
  },
  {
    name: 'aura_live_games',
    description: 'Games that are live right now, across all sports, with current score and phase.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    request: () => ({ path: '/api/games/live' }),
  },
  {
    name: 'aura_get_game',
    description: 'One game by Aura game id: identity, teams, schedule, phase, status, score.',
    inputSchema: {
      type: 'object',
      properties: { gameId: { type: 'string' } },
      required: ['gameId'],
      additionalProperties: false,
    },
    request: ({ gameId }) => ({ path: `/api/games/${encodeURIComponent(gameId)}` }),
  },
  {
    name: 'aura_game_frame',
    description:
      'The current atomic frame for a game: score, sport-native situation (count/outs/bases or period/clock), latest play, freshness, and confidence. The right call for "what is happening in this game right now".',
    inputSchema: {
      type: 'object',
      properties: { gameId: { type: 'string' } },
      required: ['gameId'],
      additionalProperties: false,
    },
    request: ({ gameId }) => ({ path: `/api/games/${encodeURIComponent(gameId)}/frame` }),
  },
  {
    name: 'aura_game_odds',
    description:
      'Current betting odds consensus for one game (moneyline, spread, or total): best and mean prices per side with an explicit stale flag and as-of timestamp.',
    inputSchema: {
      type: 'object',
      properties: {
        gameId: { type: 'string' },
        marketType: { type: 'string', enum: ['moneyline', 'spread', 'total'] },
      },
      required: ['gameId'],
      additionalProperties: false,
    },
    request: ({ gameId, ...rest }) => ({
      path: `/api/games/${encodeURIComponent(gameId)}/odds`,
      query: rest,
    }),
  },
  {
    name: 'aura_player_props',
    description:
      'The player-prop board for one game: prop definitions (hits, total bases, strikeouts, …), lines, over/under or yes/no prices, linked player identities, and settlement once final. Filter by category or player id.',
    inputSchema: {
      type: 'object',
      properties: {
        gameId: { type: 'string' },
        category: { type: 'string', description: 'e.g. batting, pitching' },
        playerId: { type: 'string' },
      },
      required: ['gameId'],
      additionalProperties: false,
    },
    request: ({ gameId, ...rest }) => ({
      path: `/api/games/${encodeURIComponent(gameId)}/props`,
      query: rest,
    }),
  },
  {
    name: 'aura_odds_timeline',
    description:
      'Opening-to-current odds movement for one game as retained observations over time. Use for "how has the line moved".',
    inputSchema: {
      type: 'object',
      properties: {
        gameId: { type: 'string' },
        marketType: { type: 'string', enum: ['moneyline', 'spread', 'total'] },
      },
      required: ['gameId'],
      additionalProperties: false,
    },
    request: ({ gameId, ...rest }) => ({
      path: `/api/games/${encodeURIComponent(gameId)}/odds/timeline`,
      query: rest,
    }),
  },
  {
    name: 'aura_boxscore',
    description: 'Full box score for one game: team lines and per-player stat rows.',
    inputSchema: {
      type: 'object',
      properties: { gameId: { type: 'string' } },
      required: ['gameId'],
      additionalProperties: false,
    },
    request: ({ gameId }) => ({ path: `/api/games/${encodeURIComponent(gameId)}/boxscore` }),
  },
  {
    name: 'aura_game_plays',
    description:
      'Ordered play-by-play history for one game, cursor-paginated. Pass the returned nextCursor to continue; pages are chronological.',
    inputSchema: {
      type: 'object',
      properties: {
        gameId: { type: 'string' },
        pageSize: { type: 'number', minimum: 1, maximum: 250 },
        cursor: { type: 'string' },
      },
      required: ['gameId'],
      additionalProperties: false,
    },
    request: ({ gameId, ...rest }) => ({
      path: `/api/games/${encodeURIComponent(gameId)}/plays/page`,
      query: { pageSize: 100, ...rest },
    }),
  },
  {
    name: 'aura_metric_series',
    description:
      'Change-only time series of in-game metrics (win probability, score margin, player lines) for one game. Omit definitionId to discover which series exist.',
    inputSchema: {
      type: 'object',
      properties: {
        gameId: { type: 'string' },
        definitionId: { type: 'string' },
        entityId: { type: 'string' },
        limit: { type: 'number', minimum: 1, maximum: 500 },
        cursor: { type: 'string' },
      },
      required: ['gameId'],
      additionalProperties: false,
    },
    request: ({ gameId, ...rest }) => ({
      path: `/api/games/${encodeURIComponent(gameId)}/metric-series`,
      query: rest,
    }),
  },
  {
    name: 'aura_list_teams',
    description: 'Teams for a sport with stable Aura ids, names, colors, and media routes.',
    inputSchema: {
      type: 'object',
      properties: {
        sport: { type: 'string', enum: SPORTS },
        limit: { type: 'number', minimum: 1, maximum: 200 },
      },
      additionalProperties: false,
    },
    request: (args) => ({ path: '/api/teams', query: { limit: 50, ...args } }),
  },
  {
    name: 'aura_get_team',
    description: 'One team by Aura team id.',
    inputSchema: {
      type: 'object',
      properties: { teamId: { type: 'string' } },
      required: ['teamId'],
      additionalProperties: false,
    },
    request: ({ teamId }) => ({ path: `/api/teams/${encodeURIComponent(teamId)}` }),
  },
  {
    name: 'aura_list_players',
    description: 'Players, filterable by sport and current team id.',
    inputSchema: {
      type: 'object',
      properties: {
        sport: { type: 'string', enum: SPORTS },
        currentTeamId: { type: 'string' },
        limit: { type: 'number', minimum: 1, maximum: 200 },
      },
      additionalProperties: false,
    },
    request: (args) => ({ path: '/api/players', query: { limit: 50, ...args } }),
  },
  {
    name: 'aura_get_player',
    description: 'One player by Aura player id: identity, position, status, current team, media.',
    inputSchema: {
      type: 'object',
      properties: { playerId: { type: 'string' } },
      required: ['playerId'],
      additionalProperties: false,
    },
    request: ({ playerId }) => ({ path: `/api/players/${encodeURIComponent(playerId)}` }),
  },
];

const TOOL_INDEX = new Map(TOOLS.map((tool) => [tool.name, tool]));

/* -------------------------------------------------------------- api calls */

async function callAura({ path, query }) {
  const url = new URL(API_URL + path);
  for (const [key, value] of Object.entries(query || {})) {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value));
  }
  const headers = { accept: 'application/json' };
  if (API_KEY) headers['x-api-key'] = API_KEY;
  const response = await fetch(url, { headers, signal: AbortSignal.timeout(15_000) });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Aura API ${response.status} for ${url.pathname}: ${text.slice(0, 300)}`);
  }
  return text;
}

function clampResult(text) {
  if (text.length <= MAX_RESULT_CHARS) return text;
  return `${text.slice(0, MAX_RESULT_CHARS)}\n…[truncated ${text.length - MAX_RESULT_CHARS} chars — narrow the query with filters or pagination]`;
}

/* ---------------------------------------------------------------- rpc core */

function reply(id, result) {
  process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id, result }) + '\n');
}

function replyError(id, code, message) {
  process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id, error: { code, message } }) + '\n');
}

async function handle(message) {
  const { id, method, params } = message;
  const isNotification = id === undefined || id === null;

  switch (method) {
    case 'initialize': {
      const requested = params?.protocolVersion;
      reply(id, {
        protocolVersion: PROTOCOL_VERSIONS.has(requested) ? requested : '2025-03-26',
        capabilities: { tools: {} },
        serverInfo: { name: 'aura', version: '0.1.0' },
        instructions:
          'Live and historical sports data from Aura: games, real-time game frames, odds and line movement, box scores, play-by-play, metric time series, teams, and players. Start with aura_coverage or aura_list_games to discover what is retained. All ids are Aura-owned ids returned by list calls.',
      });
      return;
    }
    case 'ping':
      reply(id, {});
      return;
    case 'tools/list':
      reply(id, {
        tools: TOOLS.map(({ name, description, inputSchema }) => ({ name, description, inputSchema })),
      });
      return;
    case 'tools/call': {
      const tool = TOOL_INDEX.get(params?.name);
      if (!tool) {
        replyError(id, -32602, `Unknown tool: ${params?.name}`);
        return;
      }
      try {
        const text = await callAura(tool.request(params?.arguments || {}));
        reply(id, { content: [{ type: 'text', text: clampResult(text) }] });
      } catch (error) {
        reply(id, {
          content: [{ type: 'text', text: String(error?.message || error) }],
          isError: true,
        });
      }
      return;
    }
    default:
      if (!isNotification) replyError(id, -32601, `Method not found: ${method}`);
  }
}

const rl = createInterface({ input: process.stdin, terminal: false });
rl.on('line', (line) => {
  const trimmed = line.trim();
  if (!trimmed) return;
  let message;
  try {
    message = JSON.parse(trimmed);
  } catch {
    return; // not JSON-RPC; ignore
  }
  Promise.resolve(handle(message)).catch((error) => {
    if (message?.id !== undefined && message?.id !== null) {
      replyError(message.id, -32603, String(error?.message || error));
    }
  });
});
rl.on('close', () => process.exit(0));
