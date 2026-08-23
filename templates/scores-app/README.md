# Aura Scores

A deployable Next.js live scores and game-detail app using Aura as its only sports data system.
Anonymous visitors call Aura directly with your read-only public key, so every
request and response byte remains attributed to your account.

## Run it

1. Sign in at `https://aura.tl/account`.
2. Create a browser key for the exact domains that will load the app, for
   example `localhost:3000, my-aura-scores.vercel.app`.
3. Copy `.env.example` to `.env.local` and paste the key once.
4. Run `npm install`, then `npm run dev`.
5. Open `http://localhost:3000`.

The scoreboard puts live games first and polls one bounded
`GET /api/games?view=scoreboard` request every 15 seconds while games are live,
every 60 seconds while games are scheduled, and pauses whenever the tab is
hidden. Changed scores and states flash briefly. Opening a game reads its recent
plays, box score, moneyline consensus, and player props directly from Aura;
unavailable products say so instead of inventing data.

## Deploy to Vercel

Import this directory in Vercel and add both variables from `.env.local`.
Choose the final Vercel domain before creating the Aura browser key; Aura uses
exact domains, not wildcards. Every anonymous visitor then spends the same
account-wide monthly allowance and appears under this key in Aura Ops.

## Give this to an agent

> Create an Aura scores app with `npx --yes --package=github:aura-tl/ui#v0.3.0 -- aura-ui create scores-app --cwd aura-scores`.
> Keep direct browser REST polling and the existing MLB, WNBA, and NFL tabs.
> Ask me to sign in at aura.tl/account and create a browser key for localhost
> plus my exact hosted domain. Put it in `.env.local`, never invent data, run the
> production build, and deploy the app to my Vercel account. Preserve its
> live-first order, game detail, honest unavailable states, and visible updates.
