declare const process: {
  env: Record<string, string | undefined>;
};

export interface AuraServerEnvironment {
  AURA_API_URL?: string;
  AURA_API_KEY?: string;
  RAPIDAPI_KEY?: string;
  RAPIDAPI_HOST?: string;
  AURA_ALLOW_UNAUTHENTICATED_LOCAL?: string;
}

const JSON_PATH =
  /^(?:api\/games|api\/games\/[^/]+(?:\/(?:frame|boxscore|player-stats|metrics|metric-series|odds|odds\/timeline|plays\/page|replay))?|api\/players\/[^/]+(?:\/headshot)?|api\/analytics\/landscape|api\/stats\/nfl\/draft)$/;
const STREAM_PATH = /^api\/events\/stream$/;
const RESPONSE_HEADERS = [
  'cache-control',
  'content-type',
  'retry-after',
  'x-aura-request-id',
];

/**
 * Aura-only credential boundary for the copied component. This deliberately
 * supports Aura direct access and Aura on RapidAPI; it is not a generic
 * sports-data provider adapter.
 */
export async function proxyAuraRequest(
  request: Request,
  pathSegments: string[],
  environment: AuraServerEnvironment = process.env
): Promise<Response> {
  if (request.method !== 'GET') {
    return auraError(405, 'Aura component routes are read-only.');
  }
  const path = pathSegments.map(cleanSegment).join('/');
  if (!JSON_PATH.test(path) && !STREAM_PATH.test(path)) {
    return auraError(404, 'This path is not part of the Aura component data contract.');
  }

  const upstreamBase = environment.AURA_API_URL?.trim();
  if (!upstreamBase) {
    return auraError(
      500,
      'Set the server-only AURA_API_URL before requesting paid Aura data.'
    );
  }
  const upstream = new URL(`/${path}`, trailingSlash(upstreamBase));
  const incoming = new URL(request.url);
  copyAllowedQuery(incoming, upstream, path, STREAM_PATH.test(path));

  const headers = new Headers({
    Accept: STREAM_PATH.test(path)
      ? 'text/event-stream'
      : 'application/json',
  });
  if (environment.AURA_API_KEY) {
    headers.set('x-api-key', environment.AURA_API_KEY);
  } else if (environment.RAPIDAPI_KEY && environment.RAPIDAPI_HOST) {
    headers.set('x-rapidapi-key', environment.RAPIDAPI_KEY);
    headers.set('x-rapidapi-host', environment.RAPIDAPI_HOST);
  } else if (!allowsLocalUnauthenticated(upstream, environment)) {
    return auraError(
      500,
      'Set AURA_API_KEY or RAPIDAPI_KEY plus RAPIDAPI_HOST on the server.'
    );
  }

  const response = await fetch(upstream, {
    method: 'GET',
    headers,
    signal: request.signal,
    cache: 'no-store',
  });
  const responseHeaders = new Headers();
  for (const name of RESPONSE_HEADERS) {
    const value = response.headers.get(name);
    if (value) responseHeaders.set(name, value);
  }
  responseHeaders.set('x-aura-data-plane', 'aura');
  if (STREAM_PATH.test(path)) {
    responseHeaders.set('cache-control', 'no-cache, no-transform');
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
}

function cleanSegment(segment: string): string {
  if (!segment || segment === '.' || segment === '..' || segment.includes('/')) {
    throw new Error('Invalid Aura route segment.');
  }
  return encodeURIComponent(decodeURIComponent(segment));
}

function copyAllowedQuery(
  incoming: URL,
  upstream: URL,
  path: string,
  stream: boolean
) {
  if (stream) {
    for (const name of ['type', 'gameId', 'since']) {
      copyQueryValue(incoming, upstream, name);
    }
    upstream.searchParams.set('type', 'game.frame');
    return;
  }

  const allowed = path.endsWith('/replay')
    ? ['at', 'limit', 'includeBoxscore']
    : path.endsWith('/plays/page')
    ? ['pageSize', 'cursor']
    : path.endsWith('/metric-series')
      ? ['entityId', 'definitionId', 'limit', 'cursor']
      : path.endsWith('/metrics')
        ? ['category', 'entityType', 'definitionId']
        : path.endsWith('/odds/timeline')
          ? ['marketType', 'limit']
          : path === 'api/analytics/landscape'
            ? ['entityType', 'x', 'y', 'size', 'color', 'outcome', 'outcomeOperator', 'outcomeThreshold', 'sport', 'league', 'phase', 'cohort', 'aggregate', 'from', 'to', 'xDimensions', 'yDimensions', 'sizeDimensions', 'colorDimensions', 'outcomeDimensions', 'xDirection', 'yDirection', 'include', 'limit']
          : path === 'api/stats/nfl/draft'
            ? ['season', 'scoring', 'limit', 'view', 'position', 'fields']
          : path === 'api/games'
            ? ['date', 'sport', 'status', 'limit', 'view', 'fields']
          : /^api\/games\/[^/]+$/.test(path)
            ? ['view']
            : /^api\/players\/[^/]+$/.test(path)
              ? ['view']
            : [];
  for (const name of allowed) {
    copyQueryValue(incoming, upstream, name);
  }
}

function copyQueryValue(
  incoming: URL,
  upstream: URL,
  name: string
) {
  const value = incoming.searchParams.get(name);
  if (value !== null) upstream.searchParams.set(name, value);
}

function allowsLocalUnauthenticated(
  upstream: URL,
  environment: AuraServerEnvironment
): boolean {
  return (
    environment.AURA_ALLOW_UNAUTHENTICATED_LOCAL === 'true' &&
    (upstream.hostname === '127.0.0.1' ||
      upstream.hostname === 'localhost')
  );
}

function trailingSlash(value: string): string {
  return value.endsWith('/') ? value : `${value}/`;
}

function auraError(status: number, message: string): Response {
  return Response.json(
    { error: { code: 'aura_component_proxy_error', message } },
    { status, headers: { 'cache-control': 'no-store' } }
  );
}
