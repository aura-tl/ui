# Aura product starter

This is owned Next.js source, not an embedded widget. It calls Aura's public REST API directly from the browser with a domain-bound public key.

1. Copy `.env.example` to `.env.local`.
2. Create a browser key at `https://aura.tl/account` for localhost and your hosted origin.
3. Run `npm install && npm run dev`.

Remove `AuraWatermark` from `app/layout.tsx` if your product does not want the Aura attribution.
