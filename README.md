# Aura UI

Aura UI gives coding agents editable sports components and complete apps backed
by the Aura API.

Create a deployable Next.js score center:

```bash
npx --yes --package=github:aura-tl/ui#v0.5.0 -- aura-ui create scores-app --cwd aura-scores
```

Other independent starters: `sportsbook-app`, `props-app`, `arbitrage-app`,
`model-app`, `fantasy-draft-app`, and `dfs-lineup-app`.

Then follow `aura-scores/README.md`. `aura-connect` lets the signed-in user
approve the agent's server and exact-origin public key request once. It prints
the new keys once and writes the project env without an Aura repository clone.

Run the metered Aura MCP server from the same project:

```bash
npx --yes --package=github:aura-tl/ui#v0.5.0 aura-mcp
```

Inspect or add an editable component to an existing Next app:

```bash
npx --yes --package=github:aura-tl/ui#v0.5.0 -- aura-ui inspect mobile-score-center
npx --yes --package=github:aura-tl/ui#v0.5.0 -- aura-ui add mobile-score-center
```
