#!/usr/bin/env node

import { copyFile, mkdir, readFile, readdir, realpath, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const registryRoot = path.join(packageRoot, 'registry');

export async function runAuraUi(argv, io = console, runtime = {}) {
  const parsed = parseArgs(argv);
  if (parsed.help || !parsed.command) {
    io.log(help());
    return { code: parsed.help ? 0 : 1 };
  }
  if (!parsed.component) {
    throw new Error(
      parsed.command === 'create'
        ? 'Choose an app to create. Example: aura-ui create scores-app'
        : `Choose a component to ${parsed.command}. Example: aura-ui ${parsed.command} live-scoreboard`
    );
  }
  if (parsed.command === 'inspect') {
    return runDataManifestInspect(parsed, io);
  }
  if (parsed.command === 'doctor') {
    return runActivationDoctor(parsed, io, runtime);
  }
  if (parsed.command === 'create') {
    return runTemplateCreate(parsed, io);
  }
  if (parsed.command !== 'add') {
    throw new Error(
      `Unknown command "${parsed.command}". Aura UI currently supports: create, add, inspect, doctor.`
    );
  }

  const cwd = path.resolve(parsed.cwd || process.cwd());
  const manifests = await loadRegistryTree(parsed.component);
  const manifest = manifests[manifests.length - 1];
  for (const entry of manifests) await validateConsumer(cwd, entry);

  const planned = [];
  const destinations = new Set();
  for (const registry of manifests) {
    for (const entry of registry.files) {
      const source = path.join(registryRoot, registry.id, entry.source);
      const destination = path.join(cwd, entry.destination);
      if (destinations.has(destination)) {
        throw new Error(
          `${registry.displayName} conflicts with another registry file at ${entry.destination}.`
        );
      }
      destinations.add(destination);
      if (!parsed.force && await exists(destination)) {
        if (
          registry.id !== parsed.component &&
          (await sameFile(source, destination))
        ) {
          continue;
        }
        throw new Error(
          `${path.relative(cwd, destination)} already exists. Aura UI will not overwrite owned source without --force.`
        );
      }
      planned.push({ source, destination, relative: entry.destination });
    }
  }

  if (!parsed.dryRun) {
    for (const file of planned) {
      await mkdir(path.dirname(file.destination), { recursive: true });
      await copyFile(file.source, file.destination);
    }
  }

  io.log(`${parsed.dryRun ? 'Would add' : 'Added'} ${manifest.displayName} to ${cwd}`);
  for (const file of planned) io.log(`  ${parsed.dryRun ? '○' : '✓'} ${file.relative}`);
  if (!parsed.dryRun) {
    io.log('');
    io.log('Next:');
    for (const step of manifest.nextSteps) io.log(`  ${step}`);
  }

  return {
    code: 0,
    component: parsed.component,
    cwd,
    files: planned.map((file) => file.relative),
    dryRun: parsed.dryRun,
  };
}

async function runTemplateCreate(parsed, io) {
  if (parsed.component !== 'scores-app') {
    throw new Error('Unknown Aura app template. Choose scores-app.');
  }
  if (parsed.force || parsed.gameId || parsed.envFile !== '.env.local') {
    throw new Error('create accepts only --cwd and --dry-run.');
  }
  const cwd = path.resolve(parsed.cwd || path.join(process.cwd(), 'aura-scores'));
  const sourceRoot = path.join(packageRoot, 'templates', parsed.component);
  const sources = await templateFiles(sourceRoot);
  const files = sources.map((source) => ({
    source,
    destination: source === 'gitignore' ? '.gitignore' : source,
  }));
  for (const file of files) {
    if (await exists(path.join(cwd, file.destination))) {
      throw new Error(`${file.destination} already exists. Aura UI will not overwrite an app.`);
    }
  }
  if (!parsed.dryRun) {
    for (const file of files) {
      const destination = path.join(cwd, file.destination);
      await mkdir(path.dirname(destination), { recursive: true });
      await copyFile(path.join(sourceRoot, file.source), destination);
    }
  }
  io.log(`${parsed.dryRun ? 'Would create' : 'Created'} Aura Scores at ${cwd}`);
  for (const file of files) io.log(`  ${parsed.dryRun ? '○' : '✓'} ${file.destination}`);
  if (!parsed.dryRun) {
    io.log('');
    io.log('Next:');
    io.log(`  cd ${path.relative(process.cwd(), cwd) || '.'}`);
    io.log('  cp .env.example .env.local');
    io.log('  npm install');
    io.log('  npm run dev');
  }
  return {
    code: 0,
    template: parsed.component,
    cwd,
    files: files.map((file) => file.destination),
    dryRun: parsed.dryRun,
  };
}

async function templateFiles(root, directory = '') {
  const entries = await readdir(path.join(root, directory), { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const relative = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await templateFiles(root, relative));
    else if (entry.isFile()) files.push(relative);
  }
  return files.sort();
}

async function loadRegistryTree(component, stack = [], loaded = new Map()) {
  if (stack.includes(component)) {
    throw new Error(`Aura UI registry dependency cycle: ${[...stack, component].join(' -> ')}`);
  }
  if (loaded.has(component)) return [];
  const manifestPath = path.join(registryRoot, component, 'registry.json');
  let manifest;
  try {
    manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  } catch {
    throw new Error(`Unknown Aura UI component "${component}".`);
  }
  await validateRegistryDataManifest(component, manifest);
  const resolved = [];
  for (const dependency of manifest.registryDependencies || []) {
    resolved.push(
      ...(await loadRegistryTree(
        dependency,
        [...stack, component],
        loaded
      ))
    );
  }
  loaded.set(component, manifest);
  resolved.push(manifest);
  return resolved;
}

async function runDataManifestInspect(parsed, io) {
  if (
    parsed.cwd ||
    parsed.dryRun ||
    parsed.force ||
    parsed.gameId ||
    parsed.envFile !== '.env.local'
  ) {
    throw new Error('inspect does not accept install or activation options.');
  }
  const manifests = await loadRegistryTree(parsed.component);
  const manifest = manifests[manifests.length - 1];
  io.log(JSON.stringify(manifest.dataManifest, null, 2));
  return {
    code: 0,
    component: parsed.component,
    dataManifest: manifest.dataManifest,
  };
}

async function validateRegistryDataManifest(component, manifest) {
  const dataManifest = manifest?.dataManifest;
  if (
    !dataManifest ||
    dataManifest.version !== 1 ||
    dataManifest.component !== component
  ) {
    throw new Error(
      `${component} must declare an Aura component data manifest at version 1.`
    );
  }
  const primary = dataManifest.delivery?.primary;
  if (!['stream', 'poll', 'fetch', 'replay'].includes(primary)) {
    throw new Error(`${component} has an invalid primary delivery mode.`);
  }
  if (
    !Array.isArray(dataManifest.requests) ||
    dataManifest.requests.length === 0
  ) {
    throw new Error(`${component} must declare at least one Aura data request.`);
  }
  const requestIds = new Set();
  for (const request of dataManifest.requests) {
    if (
      !request?.id ||
      requestIds.has(request.id) ||
      !['GET'].includes(request.method) ||
      !String(request.path || '').startsWith('/api/') ||
      !request.view ||
      !Array.isArray(request.fields) ||
      request.fields.length === 0 ||
      request.fields.some((field) => typeof field !== 'string' || !field)
    ) {
      throw new Error(`${component} has an invalid Aura data request manifest.`);
    }
    requestIds.add(request.id);
  }
  for (const request of dataManifest.requests) {
    if (
      request.payloadRequest &&
      !requestIds.has(request.payloadRequest)
    ) {
      throw new Error(
        `${component} references an unknown payload request manifest.`
      );
    }
  }
  for (const requestId of dataManifest.delivery.snapshot || []) {
    if (!requestIds.has(requestId)) {
      throw new Error(`${component} references an unknown snapshot request.`);
    }
  }
  if (
    dataManifest.delivery.continuation &&
    !requestIds.has(dataManifest.delivery.continuation)
  ) {
    throw new Error(`${component} references an unknown continuation request.`);
  }
  if (
    !Array.isArray(dataManifest.relationships) ||
    dataManifest.relationships.length === 0 ||
    dataManifest.relationships.some(
      (relationship) => typeof relationship !== 'string' || !relationship
    )
  ) {
    throw new Error(`${component} must declare its Aura object relationships.`);
  }
  if (
    !Array.isArray(dataManifest.unavailable) ||
    dataManifest.unavailable.length === 0 ||
    dataManifest.unavailable.some(
      (state) => typeof state !== 'string' || !state
    )
  ) {
    throw new Error(`${component} must declare unavailable-data behavior.`);
  }

  const recipePath = path.join(registryRoot, component, 'recipe.json');
  let recipe;
  try {
    recipe = JSON.parse(await readFile(recipePath, 'utf8'));
  } catch {
    throw new Error(`${component} must ship an agent-readable recipe.`);
  }
  if (
    JSON.stringify(recipe.dataManifest) !== JSON.stringify(dataManifest)
  ) {
    throw new Error(
      `${component} registry and copied recipe data manifests must match exactly.`
    );
  }
}

function parseArgs(argv) {
  const values = [...argv];
  const parsed = {
    command: values.shift(),
    component: null,
    cwd: null,
    envFile: '.env.local',
    gameId: null,
    dryRun: false,
    force: false,
    help: false,
  };
  if (parsed.command === '--help' || parsed.command === '-h') {
    parsed.command = null;
    parsed.help = true;
    return parsed;
  }
  parsed.component = values.shift() || null;
  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];
    if (value === '--cwd') {
      parsed.cwd = values[++index];
      if (!parsed.cwd) throw new Error('--cwd requires a directory.');
    } else if (value === '--env-file') {
      parsed.envFile = values[++index];
      if (!parsed.envFile) throw new Error('--env-file requires a file.');
    } else if (value === '--game-id') {
      parsed.gameId = values[++index];
      if (!parsed.gameId) throw new Error('--game-id requires an Aura game id.');
    } else if (value === '--dry-run') {
      parsed.dryRun = true;
    } else if (value === '--force') {
      parsed.force = true;
    } else if (value === '--help' || value === '-h') {
      parsed.help = true;
    } else {
      throw new Error(`Unknown option "${value}".`);
    }
  }
  return parsed;
}

async function runActivationDoctor(parsed, io, runtime) {
  if (parsed.dryRun || parsed.force) {
    throw new Error('doctor does not accept --dry-run or --force.');
  }
  const cwd = path.resolve(parsed.cwd || process.cwd());
  await validateConsumer(cwd, await loadInstalledRecipe(cwd, parsed.component));
  const fileEnvironment = await readLocalEnvironment(cwd, parsed.envFile);
  const environment = {
    ...fileEnvironment,
    ...(runtime.environment || process.env),
  };
  const activation = resolveActivation(environment);

  io.log('Aura UI activation check');
  io.log(`  Component: ${parsed.component}`);
  io.log('  Fixture: ready (no key required)');
  if (activation.mode === 'fixture') {
    io.log('  Paid data: not configured');
    io.log(
      '  Next: add AURA_API_URL plus AURA_API_KEY, or RAPIDAPI_KEY plus RAPIDAPI_HOST, to the server-only environment.'
    );
    return {
      code: 0,
      component: parsed.component,
      mode: activation.mode,
      fixtureReady: true,
      connected: false,
    };
  }

  const fetchImpl = runtime.fetch || fetch;
  const coverageRead = await fetchAuraJson(
    fetchImpl,
    activation,
    '/api/coverage'
  );
  const coverage = coverageRead.data;
  const sports = Array.isArray(coverage.sports)
    ? coverage.sports.map((sport) => sport?.sport).filter(Boolean)
    : [];
  let frame = null;
  if (parsed.gameId) {
    frame = (await fetchAuraJson(
      fetchImpl,
      activation,
      `/api/games/${encodeURIComponent(parsed.gameId)}/frame`
    )).data;
    if (frame?.gameId !== parsed.gameId) {
      throw new Error('Aura returned a frame for a different game id.');
    }
  }

  io.log(
    `  Paid data: ${activation.mode === 'rapidapi' ? 'Aura on RapidAPI' : 'direct Aura'} connected`
  );
  if (coverageRead.rapidApiEdge) {
    io.log('  RapidAPI edge: verified');
  }
  io.log(`  Coverage: ${sports.length ? sports.join(', ') : 'available'}`);
  if (frame) {
    io.log(`  GameFrame: ${frame.gameId} · revision ${frame.revision}`);
  }
  io.log('  Credential boundary: server only');
  return {
    code: 0,
    component: parsed.component,
    mode: activation.mode,
    fixtureReady: true,
    connected: true,
    sports,
    ...(coverageRead.rapidApiEdge
      ? { rapidApiEdge: coverageRead.rapidApiEdge }
      : {}),
    ...(frame
      ? {
          frame: {
            gameId: frame.gameId,
            revision: frame.revision,
            cursor: frame.cursor,
          },
        }
      : {}),
  };
}

async function loadInstalledRecipe(cwd, component) {
  const recipePath = path.join(cwd, 'aura/recipes', `${component}.json`);
  let recipe;
  try {
    recipe = JSON.parse(await readFile(recipePath, 'utf8'));
  } catch {
    throw new Error(
      `${component} is not installed in ${cwd}. Run aura-ui add ${component} first.`
    );
  }
  return {
    displayName: component,
    requires: [],
    recipe,
  };
}

async function readLocalEnvironment(cwd, requested) {
  const target = path.resolve(cwd, requested);
  if (
    target !== cwd &&
    !target.startsWith(`${cwd}${path.sep}`)
  ) {
    throw new Error('--env-file must stay inside the consumer app.');
  }
  const text = await readFile(target, 'utf8').catch((error) => {
    if (error?.code === 'ENOENT') return '';
    throw error;
  });
  return parseEnvironment(text);
}

function parseEnvironment(text) {
  const environment = {};
  for (const rawLine of String(text).replace(/\r\n/g, '\n').split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const separator = line.indexOf('=');
    if (separator < 1) continue;
    const name = line.slice(0, separator).trim();
    if (!/^[A-Z][A-Z0-9_]*$/.test(name)) continue;
    let value = line.slice(separator + 1).trim();
    if (
      value.length >= 2 &&
      ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'")))
    ) {
      value = value.slice(1, -1);
    }
    environment[name] = value;
  }
  return environment;
}

function resolveActivation(environment) {
  const apiUrl = environment.AURA_API_URL?.trim();
  const auraKey = environment.AURA_API_KEY?.trim();
  const rapidKey = environment.RAPIDAPI_KEY?.trim();
  const rapidHost = environment.RAPIDAPI_HOST?.trim();
  const configured = [apiUrl, auraKey, rapidKey, rapidHost].filter(Boolean);
  if (configured.length === 0) return { mode: 'fixture' };
  if (!apiUrl) {
    throw new Error('Paid data requires server-only AURA_API_URL.');
  }
  const baseUrl = safeApiUrl(apiUrl);
  if (auraKey && (rapidKey || rapidHost)) {
    throw new Error(
      'Choose one paid-data mode: AURA_API_KEY or RAPIDAPI_KEY plus RAPIDAPI_HOST.'
    );
  }
  if (auraKey) {
    return {
      mode: 'direct',
      baseUrl,
      headers: { 'x-api-key': auraKey },
    };
  }
  if (!rapidKey || !rapidHost) {
    throw new Error('RapidAPI mode requires both RAPIDAPI_KEY and RAPIDAPI_HOST.');
  }
  if (baseUrl.host !== rapidHost) {
    throw new Error('RAPIDAPI_HOST must match the AURA_API_URL host.');
  }
  return {
    mode: 'rapidapi',
    baseUrl,
    headers: {
      'x-rapidapi-key': rapidKey,
      'x-rapidapi-host': rapidHost,
    },
  };
}

function safeApiUrl(value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error('AURA_API_URL must be an absolute HTTP or HTTPS URL.');
  }
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('AURA_API_URL must use HTTP or HTTPS.');
  }
  const local = url.hostname === '127.0.0.1' || url.hostname === 'localhost';
  if (url.protocol !== 'https:' && !local) {
    throw new Error('AURA_API_URL must use HTTPS outside local development.');
  }
  return url;
}

async function fetchAuraJson(fetchImpl, activation, pathname) {
  const target = new URL(pathname, activation.baseUrl);
  let response;
  try {
    response = await fetchImpl(target, {
      headers: {
        Accept: 'application/json',
        ...activation.headers,
      },
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    throw new Error(`Aura activation could not reach ${target.origin}.`);
  }
  if (!response.ok) {
    throw new Error(
      `Aura activation returned HTTP ${response.status} for ${pathname}.`
    );
  }
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error(`Aura activation returned invalid JSON for ${pathname}.`);
  }
  if (activation.mode !== 'rapidapi') return { data };
  const version = response.headers.get('x-rapidapi-version')?.trim();
  if (!version) {
    throw new Error(
      'Aura activation did not receive RapidAPI proxy proof from the configured host.'
    );
  }
  return {
    data,
    rapidApiEdge: {
      provider: 'rapidapi',
      version,
      ...(response.headers.get('x-rapidapi-region')?.trim()
        ? { region: response.headers.get('x-rapidapi-region').trim() }
        : {}),
    },
  };
}

async function validateConsumer(cwd, manifest) {
  const packagePath = path.join(cwd, 'package.json');
  let packageJson;
  try {
    packageJson = JSON.parse(await readFile(packagePath, 'utf8'));
  } catch {
    throw new Error(`No readable package.json found in ${cwd}. Run Aura UI from a React app root.`);
  }
  const dependencies = {
    ...(packageJson.dependencies || {}),
    ...(packageJson.devDependencies || {}),
  };
  for (const dependency of manifest.requires || []) {
    if (!dependencies[dependency]) {
      throw new Error(
        `${manifest.displayName} currently requires ${dependency}. Add it to the consumer app before installing.`
      );
    }
  }
}

async function exists(file) {
  try {
    await stat(file);
    return true;
  } catch {
    return false;
  }
}

async function sameFile(left, right) {
  const [leftContents, rightContents] = await Promise.all([
    readFile(left),
    readFile(right),
  ]);
  return leftContents.equals(rightContents);
}

function help() {
  return `Aura UI

Copy editable sports components and complete apps powered by Aura.

Usage:
  aura-ui create scores-app [--cwd <new-app>] [--dry-run]
  aura-ui add live-scoreboard [--cwd <app>] [--dry-run] [--force]
  aura-ui add rest-scoreboard [--cwd <app>] [--dry-run] [--force]
  aura-ui add live-gamecast [--cwd <app>] [--dry-run] [--force]
  aura-ui add game-pulse [--cwd <app>] [--dry-run] [--force]
  aura-ui inspect <component>
  aura-ui doctor <component> [--cwd <app>] [--env-file .env.local] [--game-id <id>]

The installed source is yours to style. Its live data client, server route,
streaming, replay, authentication, and metering remain Aura-specific.
Inspect prints the exact Aura projections, fields, relationships, pagination,
resume policy, and unavailable states consumed by a component.
Doctor verifies fixture readiness and the server-only direct Aura or RapidAPI
activation path without printing the configured credential.`;
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
  runAuraUi(process.argv.slice(2)).catch((error) => {
    console.error(`Aura UI: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  });
}
