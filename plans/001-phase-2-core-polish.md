# Phase 2 Core Polish — Execution Plan

## Vetted findings
| priority | finding | evidence | impact | effort | fix risk | confidence |
|---:|---|---|---|---|---|---|
| 1 | Code mode only describes ticket enforcement; it has no runtime allowlist rules. | `app/opencode-dev/packages/opencode/src/agent/agent.ts:182-195`; no other source hit for `files_allowed` | Code can edit any project file permitted by defaults. | S | medium | high |
| 2 | User permissions are merged after native restrictions. | `app/opencode-dev/packages/opencode/src/agent/agent.ts:145-160`; last matching rule wins in `app/opencode-dev/packages/opencode/src/permission/index.ts:28-37` | Config can override Boss/Chat hard boundaries. | S | medium | high |
| 3 | Existing generic selector remains the actual mode control. | `app/opencode-dev/packages/app/src/components/prompt-input.tsx:1648-1674`; `app/opencode-dev/packages/app/src/context/local.tsx:183-217` | Four-mode switching lacks dedicated labels, state, and focused behavior tests. | S | low | high |
| 4 | First-launch onboarding creates only the project directory. | `app/opencode-dev/packages/desktop/src/main/onboarding.ts:33-45` | New workspaces lack initialized `.ai/` state and ticket templates. | S | low | high |
| 5 | Phase 1 tracking is stale and verification is not recorded. | `.ai/current_state.md:1-6`; `.ai/progress.md:3-10`; `.ai/verification.md:1-11` | Execution state cannot be trusted. | S | low | high |

## Ordered implementation shape
1. Add focused permission regressions before hardening native rules.
2. Implement strict native mode precedence and runtime Code allowlist parsing in the agent service.
3. Polish the existing prompt selector rather than creating a second selector architecture.
4. Initialize `.ai/` through the existing first-launch main-process function and add its unit test.
5. Run focused typechecks/tests, then reconcile project memory.

## Global boundaries
- Keep changes inside files explicitly allowlisted by the active ticket.
- No new dependency, feature panel, integration, extension mechanism, or broad refactor.
- Stop if shell commands can bypass the same file boundary; Boss must split a dedicated enforcement ticket rather than weakening the requirement.

## Verification commands
- `bun --cwd app/opencode-dev/packages/opencode run typecheck`
- `bun --cwd app/opencode-dev/packages/opencode test test/agent/vibe-modes.test.ts`
- `bun --cwd app/opencode-dev/packages/app run typecheck`
- `bun --cwd app/opencode-dev/packages/app run test:unit -- src/context/local-agent.test.ts`
- `bun --cwd app/opencode-dev/packages/desktop run typecheck`
- `bun test app/opencode-dev/packages/desktop/src/main/onboarding.test.ts`
