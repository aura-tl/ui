# Aura UI

Aura UI gives coding agents editable sports components and complete apps backed
by the Aura API.

Create a deployable Next.js score center:

```bash
npx @aura-tl/cli create scores-app --cwd aura-scores
```

Other independent starters: `sportsbook-app`, `props-app`, `arbitrage-app`,
`model-app`, `fantasy-draft-app`, and `dfs-lineup-app`.

Then follow `aura-scores/README.md`. `aura connect --public-domain <domain>`
requests only a browser key. Add `--server` only when the app or MCP needs a
private server key. The signed-in user sees the exact request before approval.

Run the metered Aura MCP server from the same project:

```bash
npx @aura-tl/cli mcp
```

Inspect or add an editable component to an existing Next app:

```bash
npx @aura-tl/cli inspect mobile-score-center
npx @aura-tl/cli add mobile-score-center
```
