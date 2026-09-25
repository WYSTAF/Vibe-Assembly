// Vibe Assembly Mission Control — Electron main process.
// Zero runtime dependencies; reads .ai/ state and serves it to the renderer.
'use strict';

const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');
const { parseActiveTask, parseStateFile, validateContract, verifiedSteps } = require('./lib/parser');

// Model-combo allocation (optional feature). Returns null when the user
// hasn't created model_combo.txt — the UI hides the panel then.
function modelAllocation() {
  try {
    const comboPath = aiPath('model_combo.txt');
    if (!fs.existsSync(comboPath)) return null;
    const allocator = require(path.join(__dirname, '..', '..', 'bin', 'allocate-models'));
    const comboText = fs.readFileSync(comboPath, 'utf8');
    const combo = [];
    const locked = {};
    for (const rawLine of comboText.split('\n')) {
      let line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;
      const hash = line.indexOf('#');
      if (hash !== -1) line = line.slice(0, hash).trim();
      if (!line) continue;
      const lock = line.match(/^(boss|chat|code|debug|hermes)\s*=\s*(.+)$/i);
      if (lock) { locked[lock[1].toLowerCase()] = lock[2].trim(); continue; }
      combo.push(line);
    }
    if (combo.length === 0 && Object.keys(locked).length === 0) return null;
    const knowledge = JSON.parse(fs.readFileSync(aiPath('model_knowledge.json'), 'utf8'));
    const { assignments, warnings } = allocator.allocate(combo, knowledge, { locked });
    return { assignments, warnings };
  } catch {
    return null; // allocation is advisory — never break the dashboard over it
  }
}

let win = null;
let watcher = null;
let workspaceRoot = null;

function aiPath(name) {
  return path.join(workspaceRoot, '.ai', name);
}

function readIfExists(file, fallback) {
  try {
    return fs.readFileSync(file, 'utf8');
  } catch {
    return fallback;
  }
}

function collectState() {
  const activeTaskRaw = readIfExists(aiPath('active_task.md'), '');
  const current = parseStateFile(readIfExists(aiPath('current_state.md'), ''));
  const knownBugs = parseStateFile(readIfExists(aiPath('known_bugs.md'), ''));
  const progress = readIfExists(aiPath('progress.md'), '');
  const decisions = readIfExists(aiPath('decisions.md'), '');
  const projectConfig = readIfExists(aiPath('project_config.md'), '');

  const freshTemplate = /CHANGE_ME_/.test(projectConfig);

  let activeTask = null;
  let contractViolation = null;
  try {
    activeTask = parseActiveTask(activeTaskRaw);
    // Fail-closed consistency checks (mirrors ticket_contract hard rules).
    contractViolation = validateContract(activeTask);
    // Verified-step computation lives in ONE place (shared with va).
    if (activeTask.active) {
      activeTask.active.verified_steps = verifiedSteps(activeTask.active.steps, activeTask.active.relay_notes);
    }
  } catch (e) {
    contractViolation = `Failed to parse active_task.md: ${e.message}`;
  }

  // Suggested next paste phrase, derived only from disk state.
  let suggestedPhrase = null;
  if (activeTask && !contractViolation) {
    const st = activeTask.active_id === 'none' ? null : activeTask.active?.status ?? queueStatus(activeTask, activeTask.active_id);
    if (activeTask.active_id === 'none' || !st) suggestedPhrase = null; // nothing to execute
    else if (st === 'pending') suggestedPhrase = 'Execute active task';
    else if (st === 'in_progress') suggestedPhrase = 'Continue relay';
  }

  return {
    workspace_root: workspaceRoot,
    fresh_template: freshTemplate,
    wave_name: activeTask?.wave_name ?? null,
    snapshot: activeTask?.snapshot ?? {},
    queue: activeTask?.queue ?? [],
    active_id: activeTask?.active_id ?? null,
    active: activeTask?.active ?? null,
    contract_violation: contractViolation,
    suggested_phrase: suggestedPhrase,
    current_state: current,
    known_bugs: knownBugs,
    recent_progress: tailLines(progress, 40),
    decisions_head: headLines(decisions, 30),
    model_allocation: modelAllocation(),
    updated_at: new Date().toISOString(),
  };
}

function queueStatus(at, id) {
  return (at.queue || []).find((r) => r.id === id)?.status ?? null;
}

function tailLines(text, n) {
  const lines = String(text).split('\n').filter(Boolean);
  return lines.slice(-n).join('\n');
}
function headLines(text, n) {
  return String(text).split('\n').slice(0, n).join('\n');
}

function startWatching() {
  if (watcher) watcher.close();
  const aiDir = path.join(workspaceRoot, '.ai');
  try {
    if (!fs.existsSync(aiDir)) return;
    // Windows fires several events per save; debounce so one write = one refresh.
    let timer = null;
    watcher = fs.watch(aiDir, { persistent: false }, () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (win && !win.isDestroyed()) win.webContents.send('state:updated', collectState());
      }, 150);
    });
  } catch {
    /* watching is best-effort */
  }
}

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 940,
    minHeight: 620,
    backgroundColor: '#0b0e14',
    title: 'Vibe Assembly — Mission Control',
    icon: path.join(__dirname, 'assets', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  win.setMenuBarVisibility(false);

  // Defense-in-depth (Electron security guide): this is a local dashboard —
  // no navigation or window creation should ever be possible.
  const ALLOWED_URLS = new Set([win.webContents.getURL()]);
  win.webContents.on('will-navigate', (event, url) => {
    if (!ALLOWED_URLS.has(url)) event.preventDefault();
  });
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));

  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));
}

// Registered once at startup — re-registering per window (e.g. macOS activate)
// would throw "Attempted to register a second handler for 'state:get'".
ipcMain.handle('state:get', () => collectState());

// ELECTRON_RUN_AS_NODE defense-in-depth: if we somehow got spawned as plain
// Node, the app APIs would be missing — abort with a clear message instead.
if (!process.versions.electron) {
  console.error(
    '[mission-control] Not running under Electron (ELECTRON_RUN_AS_NODE leak?). Launch via: npm start',
  );
  process.exit(1);
}

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });

  app.whenReady().then(() => {
    // Workspace root resolution: --root arg > VA_ROOT env > cwd > repo walk-up.
    workspaceRoot =
      process.argv.find((a, i) => process.argv[i - 1] === '--root') ||
      process.env.VA_ROOT ||
      process.cwd();
    workspaceRoot = path.resolve(workspaceRoot);
    if (!fs.existsSync(path.join(workspaceRoot, '.ai'))) {
      // Walk up a few levels so the app works when launched from app/desktop/.
      let probe = path.dirname(workspaceRoot);
      for (let i = 0; i < 4 && probe !== path.parse(probe).root; i++) {
        if (fs.existsSync(path.join(probe, '.ai'))) {
          workspaceRoot = probe;
          break;
        }
        probe = path.dirname(probe);
      }
    }

    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

  app.on('window-all-closed', () => {
    if (watcher) watcher.close();
    app.quit();
  });
}
