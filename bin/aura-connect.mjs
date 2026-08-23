#!/usr/bin/env node
import { readFile, realpath, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_API_URL = 'https://aura.tl';

export async function connectAura(options = {}) {
  const apiUrl = String(options.apiUrl || DEFAULT_API_URL).replace(/\/$/, '');
  const name = String(options.name || 'Coding agent');
  const envPath = path.resolve(options.envPath || '.env.local');
  const publicDomains = normalizeDomains(options.publicDomains || []);
  const fetchImpl = options.fetchImpl || fetch;
  const sleep = options.sleep || ((milliseconds) =>
    new Promise((resolve) => setTimeout(resolve, milliseconds)));
  const log = options.log || console.log;

  const created = await requestJson(fetchImpl, `${apiUrl}/api/agent/connections`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      name,
      keys: [
        { type: 'server' },
        ...(publicDomains.length > 0
          ? [{ type: 'public', allowedDomains: publicDomains }]
          : []),
      ],
    }),
  }, 201);
  assertCreatedConnection(created);
  log(`Approve Aura: ${created.approvalUrl}`);

  while (Date.now() < created.connection.expiresAt) {
    await sleep(created.pollMs);
    const response = await fetchImpl(
      `${apiUrl}/api/agent/connections/${created.connection.connectionId}/redeem`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ verifier: created.verifier }),
      }
    );
    const payload = await response.json();
    if (response.status === 202 && payload.status === 'pending') continue;
    if (!response.ok) throw responseError(response.status, payload);
    if (
      payload.status !== 'redeemed' ||
      !Array.isArray(payload.keys)
    ) {
      throw new Error('Aura returned an invalid connection result.');
    }
    const server = payload.keys.find((result) =>
      result?.apiKey?.type === 'server' &&
      typeof result.secret === 'string' &&
      result.secret.startsWith('aura_live_')
    );
    const publicKey = payload.keys.find((result) =>
      result?.apiKey?.type === 'public' &&
      typeof result.secret === 'string' &&
      result.secret.startsWith('aura_public_')
    );
    if (!server || (publicDomains.length > 0 && !publicKey)) {
      throw new Error('Aura returned an invalid connection result.');
    }
    await writeAuraEnv(envPath, apiUrl, {
      server: server.secret,
      ...(publicKey ? { public: publicKey.secret } : {}),
    });
    for (const result of payload.keys) {
      log(`Aura ${result.apiKey.type} key (shown once): ${result.secret}`);
    }
    log(`Aura connected ${payload.keys.map((result) => result.apiKey.keyId).join(', ')} in ${envPath}`);
    return {
      envPath,
      keys: payload.keys.map((result) => result.apiKey),
    };
  }
  throw new Error('Aura connection expired before approval. Start it again.');
}

export async function writeAuraEnv(envPath, apiUrl, keys) {
  let existing = '';
  try {
    existing = await readFile(envPath, 'utf8');
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }
  const next = mergeAuraEnv(existing, apiUrl, keys);
  const temporary = `${envPath}.aura-${process.pid}`;
  await writeFile(temporary, next, { mode: 0o600 });
  await rename(temporary, envPath);
}

export function mergeAuraEnv(existing, apiUrl, keys) {
  const replacements = new Map([
    ['AURA_API_URL', apiUrl],
    ['AURA_API_KEY', keys.server],
    ...(keys.public ? [['NEXT_PUBLIC_AURA_PUBLIC_KEY', keys.public]] : []),
  ]);
  const found = new Set();
  const lines = existing.replace(/\r\n/g, '\n').split('\n').filter((line, index, all) =>
    line.length > 0 || index < all.length - 1
  ).map((line) => {
    const match = line.match(/^([A-Z][A-Z0-9_]*)=/);
    if (!match || !replacements.has(match[1])) return line;
    found.add(match[1]);
    return `${match[1]}=${replacements.get(match[1])}`;
  });
  for (const [key, value] of replacements) {
    if (!found.has(key)) lines.push(`${key}=${value}`);
  }
  return `${lines.join('\n')}\n`;
}

async function requestJson(fetchImpl, url, init, expectedStatus) {
  const response = await fetchImpl(url, init);
  const payload = await response.json();
  if (response.status !== expectedStatus) throw responseError(response.status, payload);
  return payload;
}

function assertCreatedConnection(payload) {
  if (
    typeof payload?.connection?.connectionId !== 'string' ||
    typeof payload?.connection?.expiresAt !== 'number' ||
    typeof payload?.verifier !== 'string' ||
    typeof payload?.approvalUrl !== 'string' ||
    !Number.isSafeInteger(payload?.pollMs) ||
    payload.pollMs < 500
  ) {
    throw new Error('Aura returned an invalid connection request.');
  }
}

function responseError(status, payload) {
  const message = typeof payload?.error === 'string' ? payload.error : `Aura returned HTTP ${status}.`;
  const error = new Error(message);
  error.code = payload?.code;
  return error;
}

function parseArguments(argv) {
  const options = { publicDomains: [] };
  for (let index = 0; index < argv.length; index += 1) {
    const name = argv[index];
    const value = argv[index + 1];
    if (!['--api-url', '--name', '--env', '--public-domain'].includes(name) || !value) {
      throw new Error('Usage: aura-connect [--name "My agent"] [--env .env.local] [--public-domain localhost:3000]');
    }
    if (name === '--api-url') options.apiUrl = value;
    if (name === '--name') options.name = value;
    if (name === '--env') options.envPath = value;
    if (name === '--public-domain') options.publicDomains.push(value);
    index += 1;
  }
  return options;
}

function normalizeDomains(values) {
  if (!Array.isArray(values) || values.length > 10) {
    throw new Error('Aura accepts at most 10 public domains.');
  }
  const domains = [];
  for (const value of values) {
    const domain = String(value).trim().toLowerCase();
    if (!domain || domains.includes(domain)) continue;
    domains.push(domain);
  }
  return domains;
}

export async function runConnectCli(argv = process.argv.slice(2)) {
  return connectAura(parseArguments(argv));
}

async function isEntrypoint() {
  if (!process.argv[1]) return false;
  try {
    return await realpath(process.argv[1]) === await realpath(fileURLToPath(import.meta.url));
  } catch {
    return false;
  }
}

if (await isEntrypoint()) {
  runConnectCli().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
