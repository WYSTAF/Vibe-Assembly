# 🖥️ Mission Control

The Vibe Assembly desktop app: a live operations-room dashboard over your workspace's
`.ai/` state. It answers "where am I, what do I paste next?" at a glance.

![concept](https://img.shields.io/badge/deps-zero-orange) No runtime dependencies — Electron is a dev dependency only.

## What it shows

- **Next Action** — the exact copy-paste phrase (`Execute active task` / `Continue relay`)
  derived from disk state, with one-click COPY.
- **Ticket Queue** — full ordered queue with status chips; the active row is highlighted.
- **Active Ticket** — allowlisted files, verification-gated steps, and durable `relay_notes`.
- **Contract Violation** — fail-closed consistency checks (mirrors `.ai/ticket_contract.md`
  hard rules): duplicate/missing pointer rows, status mismatches, invalid states.
- **Operational State / Known Bugs / Recent Progress** — from `current_state.md`,
  `known_bugs.md`, and `progress.md`.
- Live updates via filesystem watch on `.ai/` — switch modes, run tickets, and watch the board update.

## Run

```bash
cd app/desktop
npm install        # or bun install (downloads Electron once)
npm start          # sanitized launcher — strips editor-injected ELECTRON_RUN_AS_NODE
```

Workspace resolution: `--root <path>` arg → `VA_ROOT` env → cwd → walk-up until an `.ai/` directory is found.

```bash
node start.js --root "Q:/my-project"     # open another workspace
```

## Architecture

| File | Role |
|------|------|
| `start.js` | Launcher: strips `ELECTRON_RUN_AS_NODE` (see KB-001), spawns Electron with explicit env |
| `main.js` | Window, IPC, `.ai/` parsing + consistency checks, fs.watch fan-out, single-instance lock |
| `preload.js` | `contextBridge` API only — no Node in renderer |
| `lib/parser.js` | Pure CJS markdown parser (shared by main process and tests) |
| `renderer/` | CSP-hardened static dashboard (no frameworks, inline JS blocked) |

Security posture: `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`,
strict CSP (`default-src 'none'`), all renderer text escaped at insertion.

## Tests

```bash
npm test   # parser unit tests (node:test)
```
