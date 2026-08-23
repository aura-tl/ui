# Aura UI

Aura UI gives coding agents editable sports components and complete apps backed
by the Aura API.

Create a deployable Next.js score center:

```bash
npx --yes --package=github:aura-tl/ui#v0.2.0 -- aura-ui create scores-app --cwd aura-scores
```

Then follow `aura-scores/README.md`. The app uses a read-only, exact-origin
browser key from `https://aura.tl/account`; anonymous requests and response
bytes remain attributed to that Aura account. Live games appear first. Each
game opens into recent plays, its box score, current odds, and available props.

Inspect or add an editable component to an existing Next app:

```bash
npx --yes --package=github:aura-tl/ui#v0.2.0 -- aura-ui inspect mobile-score-center
npx --yes --package=github:aura-tl/ui#v0.2.0 -- aura-ui add mobile-score-center
```
