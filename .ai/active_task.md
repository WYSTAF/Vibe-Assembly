# 🎯 Active Task Assignment Blueprint

## Wave
- **Name:** Change CLI Text Banner to Orange ANSI Color & Bump Version to v1.0.3 (Wave 4.2)
- **Objective:**
  1. Change ANSI text color in [`bin/cli.js`](bin/cli.js) to Orange (`\x1b[38;5;208m`).
  2. Bump `package.json` version from `1.0.2` to `1.0.3`.
  3. Verify test suite passing with `npm test`.
- **User paste:** `Execute active task`

## Queue
| order | id | title | status | effort | depends_on |
|------:|----|-------|--------|--------|------------|
| 1 | T-036 | Bump version in package.json to 1.0.3 | pending | S | none |
| 2 | T-037 | Change CLI banner text color to Orange ANSI code in bin/cli.js | pending | S | T-036 |
| 3 | T-038 | Run npm test suite to verify CLI identity | pending | S | T-037 |

---

## Ticket T-036
### Meta
- **status:** pending
- **effort:** S
- **depends_on:** none
- **files_allowed:**
  - package.json
- **files_forbidden:** (default: all other paths)

### context_inline
Bump package version in [`package.json`](package.json) to `1.0.3`.

### Steps
1. Edit [`package.json`](package.json):
   - Change `"version": "1.0.2"` to `"version": "1.0.3"`.
2. **Verify:** `node -e "const p=require('./package.json'); if(p.version!=='1.0.3')process.exit(1);"` → exit 0

### done_when
- `package.json` version is `"1.0.3"`.

### stop_when
- Any unexpected file modification is required outside `package.json`.

### relay_notes

---

## Ticket T-037
### Meta
- **status:** pending
- **effort:** S
- **depends_on:** T-036
- **files_allowed:**
  - bin/cli.js
- **files_forbidden:** (default: all other paths)

### context_inline
Change ANSI color code in [`bin/cli.js`](bin/cli.js) from Yellow (`\x1b[33m`) to Orange (`\x1b[38;5;208m`).

Code format:
```javascript
const ORANGE = '\x1b[38;5;208m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

const banner = `
${ORANGE}${BOLD} █░█ ░█░ █▄▄ █▀▀   ▄▀█ █▀▀ █▀▀ █▀▀ █▀▄▀█ █▄▄ █░░ █▄█ ${RESET}
${ORANGE}${BOLD} ▀▄▀ ░█░ █▄█ ██▄   █▀█ ▄█░ ▄█░ ██▄ █░▀░█ █▄█ █▄▄ ░█░ ${RESET}
`;
```

### Steps
1. Edit [`bin/cli.js`](bin/cli.js):
   - Replace `const YELLOW = '\x1b[33m';` with `const ORANGE = '\x1b[38;5;208m';`.
   - Replace `${YELLOW}` variables in `banner` template literal with `${ORANGE}`.
2. **Verify:** `node bin/cli.js` executes and displays banner using orange ANSI escape code.

### done_when
- Banner in `bin/cli.js` uses orange ANSI escape sequence (`\x1b[38;5;208m`).

### stop_when
- Non-zero exit on test suite or broken argument handling.

### relay_notes

---

## Ticket T-038
### Meta
- **status:** pending
- **effort:** S
- **depends_on:** T-037
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
