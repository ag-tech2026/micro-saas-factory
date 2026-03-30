# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Poker AI Review** — users upload poker hand screenshots and receive GTO-based AI analysis. Users start with 3 free credits; additional credits are purchased via Polar.

## Tech Stack

- **Framework**: Next.js 16 App Router, React 19, TypeScript (strict)
- **AI**: Vercel AI SDK 5 + OpenRouter (`@openrouter/ai-sdk-provider`) — use `openrouter()`, NOT `openai()`
- **Background jobs**: Inngest — poker analysis runs as a durable background function
- **Auth**: BetterAuth (email/password)
- **Database**: PostgreSQL + Drizzle ORM
- **Payments**: Polar (credit purchases)
- **UI**: shadcn/ui + Tailwind CSS 4 + dark mode (next-themes)
- **Package manager**: pnpm

## Commands

```bash
pnpm run lint          # ESLint — run after every change
pnpm run typecheck     # TypeScript check — run after every change
pnpm run build:ci      # Build without DB (for CI)
pnpm run db:generate   # Generate Drizzle migrations
pnpm run db:migrate    # Apply migrations
pnpm run db:studio     # Open Drizzle Studio GUI
```

**ALWAYS run `pnpm run lint && pnpm run typecheck` after making changes. NEVER run `pnpm run dev` yourself.**

There is no test framework configured.

## Architecture

### Analysis Pipeline

The core user flow:

1. User uploads a poker screenshot → `POST /api/upload` saves the image (via `src/lib/storage.ts`) and creates an `analysis` DB record with `status: "pending"`, deducting 1 credit atomically
2. Upload route fires an Inngest event `analysis/upload.completed`
3. `src/inngest/functions.ts` (`processAnalysis`) picks it up as a durable background job:
   - Sets status → `"processing"`
   - Calls OpenRouter with `openai/gpt-4o` (vision model) using `generateObject` against `src/lib/analysis-schema.ts`
   - Saves structured result, sets status → `"complete"`
   - On failure after retries: refunds 1 credit atomically, sets status → `"failed"`
4. Frontend polls `GET /api/analyses/[id]` to check status

### Credit System

- `user.credits` column (default: 3) in `src/lib/schema.ts`
- Credits deducted on upload, refunded on analysis failure
- Polar checkout (`POST /api/polar/checkout`) creates a session for `POLAR_PRODUCT_ID`
- Polar webhook (`POST /api/polar/webhook`) handles `order.paid` to increment credits; idempotency tracked via `webhook_events` table

### Key Files

| File | Purpose |
|------|---------|
| `src/inngest/functions.ts` | Core analysis background job |
| `src/inngest/prompts/analyze-hand.ts` | System prompt for GTO analysis |
| `src/lib/analysis-schema.ts` | Zod schema defining structured AI output |
| `src/lib/schema.ts` | DB schema — BetterAuth tables use `text` IDs (not UUID); app tables should use UUID |
| `src/lib/storage.ts` | File storage abstraction: local (`public/uploads/`) in dev, Vercel Blob in prod |
| `src/app/api/polar/checkout/route.ts` | Polar checkout session creation |
| `src/app/api/polar/webhook/route.ts` | Credit fulfillment on payment |
| `src/app/api/inngest/route.ts` | Inngest function serving endpoint |

### Authentication

- Server components: `import { auth } from "@/lib/auth"` → `await auth.api.getSession({ headers: await headers() })`
- Client components: `import { useSession } from "@/lib/auth-client"`
- Password reset / email verification URLs are logged to terminal only (no email provider configured)

### Storage

```typescript
import { upload, deleteFile } from "@/lib/storage";
const result = await upload(buffer, "filename.png", "folder"); // returns { url }
await deleteFile(result.url);
```

Switches between local filesystem and Vercel Blob based on `BLOB_READ_WRITE_TOKEN`.

## Environment Variables

```env
POSTGRES_URL=
BETTER_AUTH_SECRET=          # 32-char random string
OPENROUTER_API_KEY=          # sk-or-v1-...
OPENROUTER_MODEL=openai/gpt-5-mini   # for chat; analysis hardcodes gpt-4o
NEXT_PUBLIC_APP_URL=http://localhost:3000
POLAR_ACCESS_TOKEN=          # from polar.sh/settings/tokens
POLAR_PRODUCT_ID=            # product ID for credit pack
POLAR_WEBHOOK_SECRET=        # for webhook signature verification
INNGEST_EVENT_KEY=           # for sending events
INNGEST_SIGNING_KEY=         # for verifying Inngest requests
BLOB_READ_WRITE_TOKEN=       # leave empty for local dev
```

## Coding Conventions

- **Imports**: React/Next → external deps → internal `@/*` → type imports
- **Named exports** everywhere except page components (which use default export)
- **`"use client"`** only when needed for interactivity/hooks; pages and layouts are Server Components by default
- **`cn()`** from `@/lib/utils` for conditional Tailwind class merging
- Validation with Zod `safeParse()` at API boundaries; return structured `{ error, details }` on failure
- Boolean state variables prefixed `is*` / `has*`

## Adding shadcn/ui Components

```bash
pnpm dlx shadcn@latest add <component-name>
```
