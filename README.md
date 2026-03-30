# How to build a new product from this boilerplate

This repo is the Poker AI Review boilerplate. Fork it, drop in a `PRODUCT_SPEC.md`,
and follow these steps to ship a new AI-powered micro-SaaS.

## The rule

Only modify files inside `src/product/`. Everything else reads from your config automatically.

One exception: if `free_credits` in the spec differs from 3, update the DB schema default (see Step 11).

---

## Step 1: Read the spec

Open `PRODUCT_SPEC.md`. This defines everything you need to build.

## Step 2: Fill in config

Edit `src/product/config.ts` — map every field from the spec into this file.
This is your source of truth. All infra reads from here.

```ts
export const productConfig = {
  name: "Your Product Name",
  tagline: "Your tagline",
  targetUser: "your target audience",
  logoEmoji: "🔥",
  primaryColor: "#your-hex-color",
  nav: { actionLabel: "Your CTA Label" },
  input: {
    type: "file_image",        // see supported input types below
    accept: "image/jpeg,image/png",
    label: "Upload your file",
    exampleInputDescription: "a typical example of what users upload",
  },
  credits: {
    freeCredits: 3,
    creditsPerAnalysis: 1,
    packSize: 10,
    packPrice: "$9",
    // POLAR_PRODUCT_ID goes in .env.local, not here
  },
  analysis: {
    tone: "professional",      // friendly_coach | professional | clinical
    whatItAnalyzes: "describe what the AI analyzes",
  },
}
```

## Step 3: Write the prompt

Edit `src/product/prompt.ts` — write the AI system prompt based on:
- `what_it_analyzes`, `output_fields`, `tone`, `target_user` from the spec

```ts
export const prompt = `You are a [expert role]. Your task is to analyze [what]...`
```

## Step 4: Write the output schema

Edit `src/product/schema.ts` — create a Zod schema matching `output_fields` from the spec.
Use the type annotations in `output_fields` to guide nesting, arrays, and constraints.

```ts
import { z } from "zod"
export const outputSchema = z.object({ ... })
export type AnalysisResult = z.infer<typeof outputSchema>
```

## Step 5: Implement pre-processing

Edit `src/product/preprocess.ts` — implement the `preprocess()` function for your input type.
The poker product's `file_image` implementation is a pass-through. For other types:
- `file_pdf` — extract text (use pdfjs-dist or similar)
- `url` — scrape the page (use cheerio or playwright)
- `text` / `form` — return as-is
- `file_audio` — transcribe (use Whisper API)
- `file_csv` — parse to JSON rows

## Step 6: Implement message builder

Edit `src/product/buildMessages.ts` — construct the AI message array from processed input.
- For image inputs: use `type: "image"` content blocks
- For text inputs: use a single string content block
- For multi-modal: combine both

## Step 7: Build the input component

Edit `src/product/components/input.tsx` — UI for collecting input from the user.
Use the input type from `productConfig` (file upload, text area, form, URL field, etc.)

```tsx
"use client"
export function ProductInput({ credits, onUploadComplete }) {
  // your input UI here
}
```

## Step 8: Build the results component

Edit `src/product/components/results.tsx` — display the schema fields.
Design is yours — match the product tone and target user.

```tsx
"use client"
import type { AnalysisResult } from "@/product/schema"
export function AnalysisResults({ data }) {
  const result = JSON.parse(data.result) as AnalysisResult
  // your results UI here
}
```

## Step 9: Build the landing page

Edit `src/product/components/landing/` — hero section, pricing copy, feature highlights.
The main `page.tsx` imports these components. Match copy to `target_user` from the spec.

Files to edit:
- `hero-section.tsx` — headline, subheadline, CTA
- `pricing-section.tsx` — credit pack pricing and features
- `landing-cta-section.tsx` — bottom CTA
- `analysis-mockup.tsx` — demo/preview content

## Step 10: Update env vars

Copy `.env.example` → `.env.local`. Set:
- `POLAR_PRODUCT_ID` = the `polar_product_id` value from the spec
- `POSTGRES_URL` = your Neon database URL
- `BETTER_AUTH_SECRET` = 32-char random string
- `OPENROUTER_API_KEY` = your OpenRouter key
- `NEXT_PUBLIC_APP_URL` = your app URL
- All other required vars from `.env.example`

## Step 11: Update DB schema default (if free_credits ≠ 3)

If the spec's `free_credits` differs from 3, edit `src/lib/schema.ts`:
```ts
credits: integer("credits").default(<free_credits value>).notNull(),
```
Then run:
```bash
pnpm run db:generate && pnpm run db:migrate
```

---

## Supported input types

| Type | Use case | Pre-processing needed |
|------|----------|----------------------|
| `file_image` | Screenshot analyzer | None — direct to vision model |
| `file_pdf` | Bill/contract analyzer | Text extraction |
| `file_csv` | Data analyzer | Parse to JSON rows |
| `file_audio` | Call/meeting analyzer | Transcription |
| `text` | SOW generator, email analyzer | None |
| `form` | Structured data analyzer | JSON stringify |
| `url` | Landing page/SEO auditor | Web scraping |
| `multi_file` | Document comparison | Combine + summarize |

---

## What the infra handles (don't touch these)

- Auth: BetterAuth + Google OAuth (`src/lib/auth.ts`)
- DB: Drizzle + Neon PostgreSQL (`src/lib/schema.ts`, `src/lib/db.ts`)
- Credits: deduction on upload, refund on failure (in `src/app/api/upload/route.ts` and `src/inngest/functions.ts`)
- Payments: Polar checkout + webhook (`src/app/api/polar/`)
- Background jobs: Inngest pipeline (`src/inngest/functions.ts`)
- Storage: local dev / Vercel Blob prod (`src/lib/storage.ts`)
- All pages/routes outside `src/product/` and `src/app/api/polar/`
