# 🎯 Active Task Assignment Blueprint

## Wave
- **Name:** Remove Logo Icon & Bump Version to v1.0.2 (Wave 4.1)
- **Objective:**
  1. Remove top logo icon from [`bin/cli.js`](bin/cli.js), leaving only yellow "VIBE ASSEMBLY" text banner.
  2. Bump `package.json` version from `1.0.1` to `1.0.2`.
  3. Verify test suite passing with `npm test`.
- **User paste:** `Execute active task`

## Queue
| order | id | title | status | effort | depends_on |
|------:|----|-------|--------|--------|------------|
| 1 | T-033 | Bump version in package.json to 1.0.2 | pending | S | none |
| 2 | T-033 | Remove top icon ASCII art from bin/cli.js banner, keep yellow VIBE ASSEMBLY text | pending | S | T-033 |
| 3 | T-035 | Run npm test suite to verify CLI identity | pending | S | T-034 |

---

## Ticket T-033
### Meta
- **status:** pending
- **effort:** S
- **depends_on:** none
- **files_allowed:**
  - package.json
- **files_forbidden:** (default: all other paths)

### context_inline
Bump package version in [`package.json`](package.json) to `1.0.2`.

### Steps
1. Edit [`package.json`](package.json):
   - Change `"version": "1.0.1"` to `"version": "1.0.2"`.
2. **Verify:** `node -e "const p=require('./package.json'); if(p.version!=='1.0.2')process.exit(1);"` → exit 0

### done_when
- `package.json` version is `"1.0.2"`.

### stop_when
- Any unexpected file modification is required outside `package.json`.

### relay_notes

---

## Ticket T-034
### Meta
- **status:** pending
- **effort:** S
- **depends_on:** T-033
- **files_allowed:**
  - bin/cli.js
- **files_forbidden:** (default: all other paths)

### context_inline
Remove top icon ASCII art from `banner` in [`bin/cli.js`](bin/cli.js), leaving only yellow `VIBE ASSEMBLY` text.

Banner layout in `bin/cli.js`:
```javascript
const banner = `
${YELLOW}${BOLD} █░█ ░█░ █▄▄ █▀▀   ▄▀█ █▀▀ █▀▀ █▀▀ █▀▄▀█ █▄▄ █░░ █▄█ ${RESET}
${YELLOW}${BOLD} ▀▄▀ ░█░ █▄█ ██▄   █▀█ ▄█░ ▄█░ ██▄ █░▀░█ █▄█ █▄▄ ░█░ ${RESET}
`;
```

### Steps
1. Edit [`bin/cli.js`](bin/cli.js):
   - Remove diamond emblem ASCII lines above "VIBE ASSEMBLY".
2. **Verify:** `node bin/cli.js` displays only yellow VIBE ASSEMBLY text without icon above.

### done_when
- Banner in `bin/cli.js` contains only the yellow text typography for VIBE ASSEMBLY.

### stop_when
- Non-zero exit on test suite or broken argument handling.

### relay_notes

---

## Ticket T-035
### Meta
- **status:** pending
- **effort:** S
- **depends_on:** T-034
- **files_allowed:** []
- **files_forbidden:** (default: all other paths)

### context_inline
Run full project unit test suite.

### Steps
1. Execute `npm test`.
2. **Verify:** Exit 0, 18/18 tests pass.

### done_when
- Test suite exits with code 0.

### stop_when
- Any test fails or asserts unexpected behavior.

### relay_notes
