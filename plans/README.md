# Phase 2 Planning Index

## Status
- Scope confirmed: Vibe Assembly Studio core polish and stability only.
- Phase 1 delivered four native modes and branding, but the Mode Selector/onboarding ticket remains blocked.
- High-confidence gaps: Code is not runtime-bound to ticket allowlists; Boss restrictions can be overridden by user permission precedence; mode selection still uses generic agent UI; onboarding creates no `.ai/` files; focused regression coverage is absent.

## Plan
| priority | plan | status | depends_on |
|---:|---|---|---|
| 1 | [Phase 2 S-ticket queue](001-phase-2-core-polish.md) | ready | none |

## Boundaries
- No advanced features, new dependencies, broad refactors, or production changes outside explicit ticket allowlists.
- Execute tickets in order; each ticket is S-sized and must pass its verification gate before the next begins.
