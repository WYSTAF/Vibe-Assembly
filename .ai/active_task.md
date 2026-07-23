# 🎯 Active Task Assignment Blueprint

## Wave
- **Name:** NPM Release Configuration — Official Repository URL Alignment (Wave 3.9)
- **Objective:**
  1. Update [`package.json`](package.json) `repository.url` from `https://github.com/vibe-assembly/vibe-assembly.git` to `https://github.com/WYSTAF/Vibe-Assembly.git`.
  2. Verify that CLI interactive bootstrap and unit tests pass against the new official repository URL.
- **User paste:** `Execute active task`

## Queue
| order | id | title | status | effort | depends_on |
|------:|----|-------|--------|--------|------------|
| 1 | T-028 | Update package.json repository.url to official WYSTAF/Vibe-Assembly repository | done | S | none |
| 2 | T-029 | Run npm test suite to verify CLI identity and interactive bootstrap assertions | done | S | T-028 |

---

## Ticket T-028
### Meta
- **status:** pending
- **effort:** S
- **depends_on:** none
- **files_allowed:**
  - package.json
- **files_forbidden:** (default: all other paths)

### context_inline
Align repository URL in [`package.json`](package.json) with official GitHub repository `https://github.com/WYSTAF/Vibe-Assembly.git`.

### Steps
1. Edit [`package.json`](package.json):
   - Update `repository.url` to `"https://github.com/WYSTAF/Vibe-Assembly.git"`.
2. **Verify:** `node -e "const p=require('./package.json'); if(p.repository.url!=='https://github.com/WYSTAF/Vibe-Assembly.git')process.exit(1);"` → exit 0

---

## Ticket T-029
### Meta
- **status:** pending
- **effort:** S
- **depends_on:** T-028
- **files_allowed:** []
- **files_forbidden:** (default: all other paths)

### context_inline
Verify full CLI test suite passes with updated repository URL.

### Steps
1. Run `npm test`.
   - **Verify:** Exit code 0, 18/18 tests pass.
