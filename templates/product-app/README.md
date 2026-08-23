# Aura product starter

This is owned Next.js source, not an embedded widget. It calls Aura's public REST API directly from the browser with a domain-bound public key.

1. Run `npx --yes --package=github:aura-tl/ui#v0.5.0 aura-connect --name
   "Aura app agent" --env .env.local --public-domain localhost:3000`.
2. Open the printed Aura URL, sign in, and approve the displayed keys.
3. Run `npm install && npm run dev`.

Remove `AuraWatermark` from `app/layout.tsx` if your product does not want the Aura attribution.
