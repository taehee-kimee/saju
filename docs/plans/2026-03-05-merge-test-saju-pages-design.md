# Design: Merge /test and /saju into a Single Page

**Date:** 2026-03-05
**Status:** Approved

## Goal

Combine the `/test` (MBTI input) and `/saju` (birth date input) pages into a single `/test` page with a two-step flow. The `/saju` page is removed.

## User Flow

```
/ (Home)
  → /test (Step 1: MBTI)
       → Step 2: Saju (same page, state transition)
            → /result
```

## Architecture

- **URL:** `/test` (unchanged)
- **Approach:** Extend existing `mode` state in `/test/page.tsx` with a `step` dimension
- **Steps:**
  - Step 1 (`step === 'mbti'`): current test page logic (choose / direct / test)
  - Step 2 (`step === 'saju'`): current saju page logic embedded inline
- **Data flow:** `mbti` kept in component state between steps; both `mbti` + `birthInfo` written to sessionStorage only at final submit

## Changes

1. `/app/(pages)/test/page.tsx` — add `step` state, embed saju form as second step
2. `/app/(pages)/saju/page.tsx` — delete
3. `/app/page.tsx` — no change (already links to `/test`)

## Out of Scope

- No changes to `/result`, `/report`, or API routes
- No changes to sessionStorage key names
