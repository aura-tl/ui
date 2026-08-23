#!/usr/bin/env node

import { realpath } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import { runConnectCli } from './aura-connect.mjs';
import { runAuraUi } from './aura-ui.mjs';

const UI_COMMANDS = new Set(['create', 'add', 'inspect', 'doctor']);

export async function runAura(argv = process.argv.slice(2), io = console) {
  const [command, ...rest] = argv;
  if (!command || command === '--help' || command === '-h' || command === 'help') {
    io.log(help());
    return { code: 0 };
  }
  if (command === 'connect') return runConnectCli(rest);
  if (command === 'mcp') {
    if (rest.length > 0) throw new Error('Usage: aura mcp');
    await import('./aura-mcp.mjs');
    return { code: 0 };
  }
  if (UI_COMMANDS.has(command)) return runAuraUi(argv, io);
  throw new Error(`Unknown Aura command "${command}". Run aura --help.`);
}

function help() {
  return `Aura

Create sports apps, connect approved keys, and run Aura MCP.

Usage:
  aura create <app> [--cwd <new-app>]
  aura add <component> [--cwd <app>]
  aura inspect <component>
  aura doctor <component> [--cwd <app>]
  aura connect [--server] [--name <agent>] [--env .env.local] [--public-domain <domain>]
  aura mcp`;
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
  runAura().catch((error) => {
    console.error(`Aura: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  });
}
