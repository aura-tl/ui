# Aura

Live sports data for agents and apps: schedules, live scores, play-by-play, box
scores, rosters, injuries, odds and player props from sportsbooks and the Kalshi
and Polymarket prediction markets, with line movement and settled results. NFL,
college football, NBA, NHL, college basketball, MLB and WNBA.

No key needed to start. Every connection gets 1,000 trial requests; a verified
email makes it 50,000 a month free.

## MCP

`https://aura.tl/mcp` (streamable HTTP)

```bash
claude mcp add --transport http aura https://aura.tl/mcp
```

claude.ai and ChatGPT: add a custom connector with that URL. stdio clients:
`npx -y @aura-tl/cli mcp`.

## Skill

```bash
npx skills add aura-tl/ui
```

[`skills/build-with-aura/SKILL.md`](skills/build-with-aura/SKILL.md), also at
https://aura.tl/skill.md.

## Claude Code plugin

Skill and MCP server together:

```
/plugin marketplace add aura-tl/ui
/plugin install aura@aura-tl
```

## REST

API reference: https://aura.tl/api-reference · Contract: https://aura.tl/api/openapi.json
