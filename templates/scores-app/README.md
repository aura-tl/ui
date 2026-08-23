# Aura Scores

A deployable Next.js live scores and game-detail app using Aura as its only sports data system.
Anonymous visitors call Aura directly with your read-only public key, so every
request and response byte remains attributed to your account.

## Run it

1. Run `npx --yes --package=github:aura-tl/ui#v0.5.0 aura-connect --name
   "Scores agent" --env .env.local --public-domain localhost:3000`.
2. Open the printed Aura URL, sign in, and approve the displayed keys.
3. Run `npm install`, then `npm run dev`.
4. Open `http://localhost:3000`.

The scoreboard puts live games first and polls one bounded
`GET /api/games?view=scoreboard` request every 15 seconds while games are live,
every 60 seconds while games are scheduled, and pauses whenever the tab is
hidden. Changed scores and states flash briefly. Opening a game reads its recent
plays, box score, moneyline consensus, and player props directly from Aura;
unavailable products say so instead of inventing data.

## Deploy to Vercel

Import this directory in Vercel and add `NEXT_PUBLIC_AURA_API_URL` plus
`NEXT_PUBLIC_AURA_PUBLIC_KEY` from `.env.local`. Keep `AURA_API_KEY` private and
out of browser configuration. Choose the final Vercel domain before creating
the Aura browser key; Aura uses exact domains, not wildcards. Every anonymous
visitor then spends the same account-wide monthly allowance and appears under
this key in Aura Ops.

## Give this to an agent

> Create an Aura scores app with `npx --yes --package=github:aura-tl/ui#v0.5.0 -- aura-ui create scores-app --cwd aura-scores`.
> Keep direct browser REST polling and the existing MLB, WNBA, and NFL tabs.
> Run `aura-connect` for localhost plus my exact hosted domain and ask me to
> approve the displayed keys. Never invent data, run the
> production build, and deploy the app to my Vercel account. Preserve its
> live-first order, game detail, honest unavailable states, and visible updates.
The linked Aura watermark lives in `components/aura-watermark.tsx`. Remove `AuraWatermark` from `app/layout.tsx` when you want to ship without attribution.
