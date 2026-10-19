# BiteClub

A responsive group dining decision assistant for DESN31927 Project 1.

## Features
- One-device group: individual cuisine votes and budgets, editable members, aggregate results.
- Restaurant search via OpenWeb Ninja Local Business Data GET endpoint.
- Manual area or browser geolocation, cuisine search, local rating/price filters.
- Geoapify geocoding, interactive high-resolution tile map with photo markers, card selection, walking/cycling/driving durations and directions. On touch screens, use two fingers together to move the map and pinch to zoom; one finger scrolls the page.
- Device-local shortlist using localStorage.
- Quick Pick chooses uniformly from the shortlist using crypto random values.
- Restaurant Battle: exactly 4 or 8 manually selected shortlist entrants, single elimination by clicking a card.

## Run locally
Requires Node.js 22.13+ and pnpm. Run `pnpm install` then `pnpm dev`.
The project uses React and Next.js. Server API proxies live in `lib/dining-api.ts` and are exposed through `app/api/[...path]/route.ts`.
Put secret values in your runtime environment. Never put keys in browser code.
For Vercel, add these in Project Settings > Environment Variables, then redeploy:

- `OPENWEBNINJA_API_KEY`: direct OpenWeb Ninja key (not a RapidAPI key).
- `GEOAPIFY_API_KEY`: Geoapify key.

An `.env.example` is included. For local development, copy it to `.env.local` and enter the values there. Production values are managed in Vercel project settings.

## Test quota guard
No restaurant requests happen on load, filter changes, map view, card detail, save, Quick Pick, or Battle. A search first opens a Confirm / Cancel dialog; Cancel sends no request. The API proxy rejects calls without `confirmed=yes`, sends `limit=5`, never auto-retries, and slices the returned list to five. Identical queries may reuse a ten-minute memory cache; concurrent identical searches share one upstream request. Cache is per Worker instance and is not a durable quota guarantee. Opening maps and automatically calculating routes consume Geoapify credits separately. These do not send restaurant requests.

## Data limitations
Price levels are broad estimates and do not guarantee a dollar budget. Lowest member budget maps to a suggested editable price filter (<=20: $, <=40: $$, <=65: $$$, above: $$$$). Unknown prices can be included or excluded. Rating and price filtering happen over at most five returned businesses. Missing price, route or photo data is never fabricated. Travel times automatically load for the selected mode on search results. Opening a detail calculates all three travel modes using the same origin coordinates; repeated routes reuse cached results. Detail views reuse search data; no additional business detail request is made. Map tiles are proxied through the server to keep the Geoapify key private. Reverse geocoding labels the device coordinates with the nearest available street/address and postal code. Device accuracy is shown; address labels never replace the actual GPS coordinates.

Group records and saved restaurants persist in this browser only, without cross-device sync. Real restaurant records can change; verify price and hours with the business.

## Build
Run `pnpm build`. The application builds as a standard Next.js project and can be imported from GitHub into Vercel with the default Next.js settings.

## Sources and AI
Design/feature direction: Yuxuan Xie. Code generated with ChatGPT/Codex, October 2026.
- https://www.openwebninja.com/api/local-business-data
- https://www.openwebninja.com/api/local-business-data/docs
- https://apidocs.geoapify.com/docs/geocoding/forward-geocoding/
- https://apidocs.geoapify.com/docs/routing/
- https://apidocs.geoapify.com/docs/maps/static/
- Lucide icons: https://lucide.dev
- Original prototype base: ChatGPT Sites Vinext starter; deployment version adapted to standard Next.js for Vercel.

Live integration was not exercised during this revision; validation used mocks and no restaurant credit was consumed.

## Revision history
See `process/iteration-history.md` for user feedback, design changes, source commits and saved Site versions. Multi-cuisine choices are sent in one natural-language query (e.g. Italian or Thai restaurants); exact matching is determined by the restaurant search provider, and the test cap remains five total results. Filters are edited as drafts in a modal. Named-place lookup uses Geoapify and falls back to a street address; it never hardcodes the user’s presumed building.
