---
name: Agent task
about: A scoped task that a single autonomous agent can complete on its own branch
title: "Track X: "
labels: agent-task
---

## Goal

<!-- What this track builds, in a few sentences. Include any numbers that must render exactly. -->

## Contract you code against

<!-- Frozen modules and their signatures: src/lib/fees.ts, src/lib/orders.ts, OrderProvider, FeeBreakdown -->

## Files you own

<!-- Edit only these. -->

## Files you must not touch

<!-- Owned by another agent; editing them causes merge conflicts. -->

## Acceptance criteria

<!-- Observable outcomes, not implementation steps. -->

## How to verify

```bash
npx tsc --noEmit
npx eslint <only the files you own>
npm run dev
```

<!-- Then the manual demo path a human can follow. -->

## Rules

- Read the Working Agreement in `AGENTS.md` first
- Do not create route files
- Do not run `npm run format` or `eslint --fix` repo-wide
- Do not hardcode fee percentages — call `calculateOrderTotals()`
- Open a PR to `main`; do not merge it yourself
