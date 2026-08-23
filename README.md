# Aura UI

Aura UI gives coding agents editable sports components and complete Next.js
apps backed by the Aura API.

Create one independent product:

```bash
npx --yes --package=github:aura-tl/ui#v0.4.0 -- aura-ui create scores-app --cwd aura-scores
npx --yes --package=github:aura-tl/ui#v0.4.0 -- aura-ui create sportsbook-app --cwd aura-sportsbook
npx --yes --package=github:aura-tl/ui#v0.4.0 -- aura-ui create props-app --cwd aura-props
npx --yes --package=github:aura-tl/ui#v0.4.0 -- aura-ui create arbitrage-app --cwd aura-arbitrage
npx --yes --package=github:aura-tl/ui#v0.4.0 -- aura-ui create model-app --cwd aura-model
npx --yes --package=github:aura-tl/ui#v0.4.0 -- aura-ui create fantasy-draft-app --cwd aura-fantasy
npx --yes --package=github:aura-tl/ui#v0.4.0 -- aura-ui create dfs-lineup-app --cwd aura-dfs
```

Copy `.env.example` to `.env.local`, then add a read-only browser key from
`https://aura.tl/account`. Direct REST requests and response bytes remain
attributed to that account. Each app is editable source; unavailable data is
shown honestly, never replaced with a fixture or mock.

Inspect or add an editable component to an existing Next app:

```bash
npx --yes --package=github:aura-tl/ui#v0.4.0 -- aura-ui inspect mobile-score-center
npx --yes --package=github:aura-tl/ui#v0.4.0 -- aura-ui add mobile-score-center
```
