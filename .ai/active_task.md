# 🎯 Active Task Assignment Blueprint

## Wave
- **Name:** Wave 4.5 — Fix npm `bin` Path & Republish v1.0.6
- **Objective:** Fix the `bin` entry in `package.json` (remove leading `./` prefix that caused npm to strip the CLI entry), bump version to `1.0.6`, verify tests pass, and prepare for republish.
- **User paste:** `Execute active task`

## Queue
| order | id | title | status | effort | depends_on |
|------:|----|-------|--------|--------|------------|
| 1 | T-047 | Fix bin path in package.json (remove leading `./`) | pending | S | none |
| 2 | T-048 | Bump package.json version to 1.0.6 | pending | S | T-047 |
| 3 | T-049 | Run npm test suite to verify CLI identity | pending | S | T-048 |

## Ticket T-047
### Meta
- **status:** pending
- **effort:** S
- **depends_on:** none
- **files_allowed:**
  - package.json
- **files_forbidden:** (default: all other paths)

### context_inline
`package.json` has `"bin": { "create-vibe-assembly": "./bin/cli.js" }`. The leading `./` is invalid per npm spec — npm's auto-corrector strips the entire bin entry instead of just the prefix. Must change to `"bin/cli.js"`.

### Steps
1. Change `"create-vibe-assembly": "./bin/cli.js"` to `"create-vibe-assembly": "bin/cli.js"` in `package.json`.
   - **Verify:** Read `package.json` and confirm `bin` value is `"bin/cli.js"` (no leading `./`).

### done_when
- `package.json` `bin` field has `"bin/cli.js"` (no `./` prefix).

### stop_when
- File syntax is corrupted or JSON cannot be parsed.

### relay_notes
- 

---

## Ticket T-048
### Meta
- **status:** pending
- **effort:** S
- **depends_on:** T-047
- **files_allowed:**
  - package.json
- **files_forbidden:** (default: all other paths)

### context_inline
`package.json` currently has `"version": "1.0.5"`. Bump to `1.0.6` for the bin-path-fix republish.

### Steps
1. Update `"version"` field in `package.json` to `"1.0.6"`.
   - **Verify:** Read `package.json` and confirm `"version": "1.0.6"`.

### done_when
- `package.json` has `"version": "1.0.6"`.

### stop_when
- File syntax is corrupted or JSON cannot be parsed.

### relay_notes
- 

---

## Ticket T-049
### Meta
- **status:** pending
- **effort:** S
- **depends_on:** T-048
- **files_allowed:**
  - tests/cli-identity.test.js
  - tests/cli-interactive.test.js
  - tests/ticket-contract.test.js
- **files_forbidden:** (default: all other paths)

### context_inline
Run `npm test` to confirm CLI identity and ticket contracts remain 100% valid after the bin path fix.

### Steps
1. Run `npm test` to verify all tests still pass.
   - **Verify:** Command exit code is `0` and all tests pass.

### done_when
- `npm test` outputs 18/18 passing tests with code 0.

### stop_when
- Any test fails or errors.

### relay_notes
- 
