# Audit Playbook

What to look for, per category. Each audit pass gets the relevant section plus the **Finding format** at the bottom. Adapt depth to repo size — a 2K-line CLI gets a lighter pass than a 500K-line monorepo.

A finding is only a finding with evidence. "Probably has N+1 queries somewhere" is not a finding; `orders/api.ts:142 issues one query per order item inside a loop` is.

**Default code root:** `app/`. When scouting the template itself (keyword `template`), audit agent OS files instead.

---

## 1. Correctness / Bugs

The highest-trust category — real bugs found by reading, not speculation.

- Error handling: swallowed exceptions, empty catch blocks, `catch (e) { console.log(e) }` on critical paths, missing error states in UI code.
- Async hazards: unawaited promises, race conditions on shared state, missing cancellation/cleanup.
- Null/undefined flows: non-null assertions (`!`) on values that can be null, optional chaining hiding a value that must exist, unchecked array indexing.
- Boundary conditions: off-by-one, empty-collection handling, timezone/locale assumptions, integer overflow.
- State machines: impossible-state combinations representable in types, status enums with unhandled branches.
- Concurrency: check-then-act on shared resources, missing transactions around multi-write operations.
- Type escape hatches: `any` / `as` casts / `@ts-ignore` clusters.
- Resource leaks: unclosed handles, connections, subscriptions; missing `finally`.

## 2. Security

Review only what is directly supported by code evidence. Keep findings framed as defensive maintenance.

**Handling rule:** never copy a secret value into a finding or plan. Reference the `file:line` and credential type only.

- Credential hygiene: hardcoded keys/tokens/passwords, credentials in committed `.env` files.
- Data crossing into interpreters: SQL/command injection, XSS, path traversal.
- Access control: missing server-side identity checks, IDOR, CSRF.
- Input contracts: API boundaries without schema validation, mass assignment.
- Dependency posture: run `npm audit` / `pip-audit` / `cargo audit` in read-only mode.
- Production configuration: overly broad CORS, missing security headers.
- Data minimization: PII in logs, stack traces returned to clients.

## 3. Performance

Look for algorithmic and architectural wins, not micro-optimizations.

- N+1 patterns: query/fetch per item inside loops.
- Wrong complexity: nested scans, repeated `find`/`filter` where a Map belongs.
- Caching gaps: identical expensive computations repeated per request.
- Payload size: over-fetching, missing pagination.
- Frontend: bundle composition, missing code-splitting, render waterfalls.
- Backend: synchronous work that belongs in a queue, missing indexes.
- Build/CI: slow CI from missing caching, redundant pipeline steps.

## 4. Test Coverage

The goal is not a percentage — it's *which untested code is dangerous*.

- Map the critical paths and check which have zero or trivial coverage.
- Modules with high churn + no tests = top refactor risk.
- Existing test quality: tests that assert nothing meaningful, heavy mocking.
- Missing test layers: unit-only suites with zero integration coverage.
- Verification infrastructure: is there a one-command way to know the codebase works?

## 5. Tech Debt & Architecture

- Duplication: same logic re-implemented in 3+ places.
- Layering violations: UI importing from data layer internals, circular dependencies.
- Dead code: unused modules, feature flags fully rolled out, commented-out blocks.
- God objects/modules: files an order of magnitude larger than the repo median.
- Inconsistent patterns: three ways of doing the same thing in the same repo.
- Abstraction mismatches: premature abstractions with a single implementation.

## 6. Dependencies & Migrations

- Major-version lag on core framework/runtime.
- Deprecated APIs in use with announced removal timelines.
- Abandoned dependencies on critical paths.
- Duplicate dependencies solving the same problem.
- Lockfile/manifest drift.

## 7. DX & Tooling

- Missing or broken: typecheck script, lint config, formatter, pre-commit hooks.
- Slow feedback loops: dev-server or test startup measured in minutes.
- Onboarding friction: README setup steps wrong/incomplete.
- Error messages/logging: unstructured logs, missing request IDs.

## 8. Docs

Lowest default priority — only flag where absence has a concrete cost:

- Public API surface without reference docs.
- Architectural decisions nobody can reconstruct.
- Stale docs that are actively wrong.

## 9. Direction — features & where to take this next

Forward-looking: not what's broken, but what this codebase wants to become. Every suggestion must cite evidence from the repo itself.

- **Unfinished intent**: TODO/FIXME clusters around one theme, half-built modules.
- **Stated-but-undelivered**: README/docs promises with no corresponding code.
- **Surface asymmetries**: one-directional pairs (export without import).
- **The adjacent possible**: capabilities the existing architecture makes disproportionately cheap.
- **Friction worth productizing**: things users do by hand that the project could absorb.

Direction findings use the standard format with two adaptations: **Impact** is product/user value, and **Confidence** reflects how grounded the evidence is. Plans for selected direction findings are usually a *design/spike plan* rather than a build-everything plan.

---

## Finding format

Every finding comes back in this shape:

```markdown
### [CATEGORY-NN] Short imperative title

- **Evidence**: `path/file.ts:123` — one-sentence description.
- **Impact**: What goes wrong / what's being paid because of this.
- **Effort**: S (hours) / M (a day-ish) / L (multi-day).
- **Risk**: LOW/MED/HIGH plus one line why.
- **Confidence**: HIGH / MED / LOW.
- **Fix sketch**: 1–3 sentences.
```

## Prioritization rubric

Order findings by **leverage = impact ÷ effort, discounted by confidence and fix-risk**. Tiebreakers:

1. Anything that unblocks other findings floats up.
2. Security findings with HIGH confidence float above equivalent-leverage non-security findings.
3. Prefer findings whose fix has a clean verification story.
4. "Not worth doing" is a valid verdict; record it with one line of reasoning.
