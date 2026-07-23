# 🎯 Active Task Assignment Blueprint

## Wave
- **Name:** Wave 4.3 — Template Sanitation, Session State Reset & Release v1.0.4
- **Objective:** Reset active task, current state, and session context files back to clean, boilerplate template defaults. Bump version to `1.0.4` in `package.json`, verify tests pass, ensuring the repository and npm package represent a pristine starter template.
- **User paste:** `Execute active task`

## Queue
| order | id | title | status | effort | depends_on |
|------:|----|-------|--------|--------|------------|
| 1 | T-039 | Bump package.json version to 1.0.4 | done | S | none |
| 2 | T-040 | Reset session tracking files to template defaults | done | S | T-039 |
| 3 | T-041 | Run npm test suite to verify test suite passes | done | S | T-040 |

## Ticket T-039
### Meta
- **status:** done
- **effort:** S
- **depends_on:** none
- **files_allowed:**
  - package.json
- **files_forbidden:** (default: all other paths)

### context_inline
package.json contains `"version": "1.0.3"`. This must be updated to `"version": "1.0.4"`.

### Steps
1. Update `"version"` field in `package.json` to `"1.0.4"`.
   - **Verify:** Read `package.json` and confirm `"version": "1.0.4"`.

### done_when
- `package.json` has `"version": "1.0.4"`.

### stop_when
- File syntax is corrupted or JSON cannot be parsed.

### relay_notes
- Step 1: Bumped package.json version to 1.0.4. Verified by reading file.

---

## Ticket T-040
### Meta
- **status:** done
- **effort:** S
- **depends_on:** T-039
- **files_allowed:**
  - .ai/current_state.md
  - .ai/session_context.md
- **files_forbidden:** (default: all other paths)

### context_inline
Before uploading to GitHub/npm, session tracking files (`.ai/current_state.md` and `.ai/session_context.md`) must be reset to clean boilerplate template states so new users start fresh.

### Steps
1. Reset `.ai/current_state.md` to initial project template state (Phase 1, no active session artifacts).
   - **Verify:** Read `.ai/current_state.md` and check structure.
2. Reset `.ai/session_context.md` to empty template header.
   - **Verify:** Read `.ai/session_context.md`.

### done_when
- `.ai/current_state.md` and `.ai/session_context.md` contain clean starter template contents.

### stop_when
- File permissions prevent writing.

### relay_notes
- Step 1: Reset .ai/current_state.md to Phase 1 template. Step 2: Reset .ai/session_context.md to empty template header. Verified by re-reading.

---

## Ticket T-041
### Meta
- **status:** done
- **effort:** S
- **depends_on:** T-040
- **files_allowed:**
  - tests/cli-identity.test.js
  - tests/cli-interactive.test.js
  - tests/ticket-contract.test.js
- **files_forbidden:** (default: all other paths)

### context_inline
Run the existing test suite (`npm test`) to confirm CLI identity and ticket contracts remain 100% valid.

### Steps
1. Run `npm test` CLI verification test suite.
   - **Verify:** Command exit code is `0` and all tests pass.

### done_when
- `npm test` outputs 18/18 passing tests with code 0.

### stop_when
- Any test fails or errors.

### relay_notes
- Step 1: Ran `npm test` — 18/18 passing, exit code 0.
