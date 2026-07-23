# 🎯 Active Task Assignment Blueprint

## Wave
- **Name:** CLI Yellow VA Logo Banner & Version Bump to v1.0.1 (Wave 4.0)
- **Objective:**
  1. Bump `package.json` version from `1.0.0` to `1.0.1`.
  2. Add yellow ANSI ASCII graphic logo matching the exact "VA" double-wing emblem provided by user, followed by "VIBE ASSEMBLY" in `bin/cli.js`.
  3. Verify test suite passing with `npm test`.
- **User paste:** `Execute active task`

## Queue
| order | id | title | status | effort | depends_on |
|------:|----|-------|--------|--------|------------|
| 1 | T-030 | Bump version in package.json to 1.0.1 | pending | S | none |
| 2 | T-031 | Add exact yellow ANSI ASCII "VA" logo art and banner to bin/cli.js | pending | S | T-030 |
| 3 | T-032 | Run npm test suite to verify CLI identity and interactive bootstrap assertions | pending | S | T-031 |

---

## Ticket T-030
### Meta
- **status:** pending
- **effort:** S
- **depends_on:** none
- **files_allowed:**
  - package.json
- **files_forbidden:** (default: all other paths)

### context_inline
Bump package version in [`package.json`](package.json) to `1.0.1`.

### Steps
1. Edit [`package.json`](package.json):
   - Change `"version": "1.0.0"` to `"version": "1.0.1"`.
2. **Verify:** `node -e "const p=require('./package.json'); if(p.version!=='1.0.1')process.exit(1);"` → exit 0

### done_when
- `package.json` version is `"1.0.1"`.

### stop_when
- Any unexpected file modification is required outside `package.json`.

### relay_notes

---

## Ticket T-031
### Meta
- **status:** pending
- **effort:** S
- **depends_on:** T-030
- **files_allowed:**
  - bin/cli.js
- **files_forbidden:** (default: all other paths)

### context_inline
Add yellow ANSI ASCII banner matching the official "VA" graphic icon and text at the beginning of `main()` in [`bin/cli.js`](bin/cli.js).

ASCII Art & Color Format:
```javascript
const YELLOW = '\x1b[33m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

const banner = `
${YELLOW}${BOLD}   ███████        ██████████   ${RESET}
${YELLOW}${BOLD}   ████████     █████████████  ${RESET}
${YELLOW}${BOLD}    ████████   ████   ███████  ${RESET}
${YELLOW}${BOLD}     ████████ ████     █████   ${RESET}
${YELLOW}${BOLD}      ███████████      █████   ${RESET}
${YELLOW}${BOLD}       █████████      ██████   ${RESET}
${YELLOW}${BOLD}        ███████      ██████    ${RESET}
${YELLOW}${BOLD}         █████     ████  ████  ${RESET}
${YELLOW}${BOLD}          ███     ████    ████ ${RESET}

${YELLOW}${BOLD} █░█ ░█░ █▄▄ █▀▀   ▄▀█ █▀▀ █▀▀ █▀▀ █▀▄▀█ █▄▄ █░░ █▄█ ${RESET}
${YELLOW}${BOLD} ▀▄▀ ░█░ █▄█ ██▄   █▀█ ▄█░ ▄█░ ██▄ █░▀░█ █▄█ █▄▄ ░█░ ${RESET}
`;
```

### Steps
1. Edit [`bin/cli.js`](bin/cli.js):
   - Add `banner` constant definition and print `console.log(banner);` inside `main()` immediately after validating `projectName`.
2. **Verify:** `node bin/cli.js` without args prints usage/error output including yellow VA banner.

### done_when
- Running `node bin/cli.js` or `npx create-vibe-assembly` displays the exact yellow "VA" emblem and VIBE ASSEMBLY text.

### stop_when
- Non-zero exit on test suite or broken argument handling.

### relay_notes

---

## Ticket T-032
### Meta
- **status:** pending
- **effort:** S
- **depends_on:** T-031
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
