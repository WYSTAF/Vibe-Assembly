# Closing the Loop — sync, issues

The scout's job doesn't end at the plan. This file covers the two follow-through flows: keeping the plan backlog alive (`scout sync`) and publishing plans where work gets picked up (`scout issues`).

The founding rule survives unchanged: **scout never edits source code.** Plans inform the user → Boss → Code via `active_task.md`. There is no skill-internal `execute` that dispatches code-editing subagents.

---

## `scout sync` — keep `plans/` alive

Process what happened since the last session. Read `plans/README.md` and every plan file, then per status:

- **DONE** — spot-check that the done criteria still hold on the current HEAD (cheap ones only). Mark verified in the index. Don't delete plan files — they're the record.
- **BLOCKED** — read the reason. Investigate the underlying obstacle in the codebase. Either rewrite the plan around it (in-place refresh) or mark REJECTED with one line of rationale.
- **IN PROGRESS** (stale) — flag it to the user; an executor probably died mid-run.
- **TODO** — run the drift check. If drifted: re-verify the finding still exists (it may have been fixed in passing), then refresh the "Current state" excerpts and `Planned at` SHA. If the finding is gone, mark REJECTED ("fixed independently").

Finish with a short report: what's verified done, what was refreshed, what's rejected, and what's executable right now.

---

## `scout issues` — publish plans as GitHub issues

Modifier on any planning invocation (`scout --issues`, `scout security --issues`). The flag is the user's authorization to create issues — never create them without it.

1. Preflight: `gh auth status` succeeds and the repo has a GitHub remote. If either fails, write the plan files as normal and say why issues were skipped.
2. Visibility check: `gh repo view --json visibility`. If the repo is **public**, warn the user that issues are publicly visible and get explicit confirmation before publishing any plan that describes a security vulnerability, credential location, or other sensitive finding.
3. Show the list of titles about to become issues; confirm once if interactive.
4. Per plan: `gh issue create --title "<plan title>" --body-file <plan file>`. Labels: `scout` plus the category — apply only if the labels exist.
5. Record each issue URL in the plan's Status block and the index.

The plan file remains the source of truth; the issue is distribution.

---

## Vibe Assembly execution path

The primary loop for Vibe Assembly is:

```
scout plans → user reviews → Boss scopes .ai/active_task.md → Code executes
```

`scout` produces plans. `scout sync` keeps them current. `scout issues` distributes them. Implementation is always routed through the 4-mode assembly line — not through skill-internal code execution.

On Roo Code free-tier stacks, skill-internal `execute` (dispatched subagent in isolated worktree) is **not supported**. Plans are designed for manual or Code-mode execution.
