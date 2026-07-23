# Ticket Contract — Vibe Assembly Free-Tier Assembly Line

## Purpose

Chat brainstorms → Boss emits S-sized machine-checkable micro-tickets → weak/cheap Code models execute one ticket per session. **Disk is source of truth.** Chat history is never required for correctness. When a model hits rate-limit or context death mid-ticket, the next session resumes from disk `relay_notes` — no replay needed.

## Ticket Schema

| Field | Rules |
|-------|-------|
| `id` | `T-NNN` (e.g. T-001) |
| `title` | Imperative verb phrase; one outcome |
| `status` | `pending` \| `in_progress` \| `blocked` \| `done` \| `failed` |
| `order` | Integer execution order |
| `depends_on` | Ticket id(s) or `none` |
| `effort` | Prefer `S`; if M/L, Boss must split before handoff |
| `files_allowed` | Explicit path list — **hard allowlist**; Code may only edit these |
| `files_forbidden` | Optional; default = everything not in allowlist |
| `context_inline` | Facts + short excerpts; never "as discussed" |
| `steps` | 3–12 steps; each step ends with verification command + expected result |
| `done_when` | Machine-checkable (commands, exit codes, greps) |
| `stop_when` | Escalate to Boss/Debug; no improvisation outside allowlist |
| `relay_notes` | Starts empty; Code appends progress (step done, last command, blockers) |

**Hard rules:**
- One ticket ≈ one weak-model session budget.
- No ticket may require whole-repo recon; only allowlisted files + named commands.
- Everything not in `files_allowed` is off-limits for edits.

## `active_task.md` Canonical Layout

Every Boss blueprint for Code uses this skeleton:

```markdown
# 🎯 Active Task Assignment Blueprint

## Wave
- **Name:** …
- **Objective:** … (one paragraph)
- **User paste:** `Execute active task` / `Continue relay`

## Queue
| order | id | title | status | effort | depends_on |
|------:|----|-------|--------|--------|------------|
| 1 | T-001 | … | pending | S | none |

## Ticket T-001
### Meta
- **status:** pending
- **effort:** S
- **depends_on:** none
- **files_allowed:**
  - path/one
- **files_forbidden:** (default: all other paths)

### context_inline
…

### Steps
1. …
   - **Verify:** `command` → expected …
2. …

### done_when
- …

### stop_when
- …

### relay_notes
- (empty until Code runs)
```

## Relay Protocol

1. **Source of truth:** `.ai/active_task.md` only (plus files listed in the active ticket's allowlist). Optional read of this file if schema unclear — not a substitute for the ticket body.
2. **On Code session start:**
   - Read `.ai/active_task.md`.
   - Find first ticket in **order** whose status is not `done` (and whose `depends_on` are all `done`).
   - Set that ticket to `in_progress` if it was `pending`.
   - Read `relay_notes`; resume at first incomplete step (do **not** restart from step 1 unless notes say clean / no progress).
3. **After each completed step:** append to `relay_notes` (step number, what changed, verify command + result) **before** starting the next step. Prefer updating the Queue status row too.
4. **On STOP / rate-limit / context pressure:** write relay_notes + tell user exact paste: switch to 💻 Code (new session if needed) and say `Execute active task` or `Continue relay`. Append Token Guard notice when state was dumped to disk.
5. **Never** depend on chat history for correctness.

## Sample Ticket (EXAMPLE ONLY — not for execution)

```
## Ticket T-999
### Meta
- **status:** pending
- **effort:** S
- **depends_on:** none
- **files_allowed:**
  - .ai/current_state.md
- **files_forbidden:** (default: all other paths)

### context_inline
current_state.md tracks the active milestone and blocked-on field.
The file uses YAML-like frontmatter with a "Blocked On:" line.

### Steps
1. Read `.ai/current_state.md` and find the "Blocked On:" line.
   - **Verify:** `findstr "Blocked On:" .ai\current_state.md` → non-empty output
2. Append a new line after "Blocked On:" that reads: "Relay: T-999 in progress".
   - **Verify:** `findstr "Relay:" .ai\current_state.md` → "Relay: T-999 in progress"
3. Update the Queue row for T-999 to status "done".
   - **Verify:** `findstr "T-999" .ai\active_task.md` → status "done"

### done_when
- `findstr "Relay:" .ai\current_state.md` exits 0
- Queue row for T-999 shows "done"

### stop_when
- current_state.md is not in files_allowed
- Need to modify any file outside .ai/current_state.md

### relay_notes
- (empty until Code runs)
```

## Differentiation from improve / scout

- `plans/` + `scout` = optional advisor/audit path. Not the default executor contract.
- **Primary executor path** = Boss tickets in `active_task.md` + Relay protocol.
- Not improve: no skill-internal execute / worktree execute as product path.
- Not the upstream improve project: no `shadcn` branding, structure, or execute-skill pipeline.