// Mission Control launcher: sanitizes the environment, then starts Electron.
//
// Editors/agent harnesses running inside Electron (VS Code, Roo Code, Cursor)
// leak ELECTRON_RUN_AS_NODE=1 into spawned shells; that makes electron.exe run
// as plain Node, which breaks every named import from 'electron' (root cause of
// ticket T-401 — see .ai/known_bugs.md KB-001). We strip it and pass an
// EXPLICIT env to the child: mutating process.env does not reliably propagate
// to spawned children under Bun.
'use strict';

const { spawn } = require('node:child_process');
const path = require('path');

const SANITIZED_KEYS = ['ELECTRON_RUN_AS_NODE', 'ELECTRON_NO_ATTACH_CONSOLE'];

const env = { ...process.env };
for (const key of SANITIZED_KEYS) {
  if (env[key] !== undefined) {
    console.warn(`[mission-control] Stripped ${key}="${env[key]}" from environment (editor/agent leftover).`);
    delete env[key];
  }
}

const electronBinary = require('electron'); // string path when required from a plain Node context

const args = [...process.argv.slice(2), path.join(__dirname, 'main.js')];

// No `shell`: electronBinary is a direct .exe path; shell mode would break
// workspaces whose absolute path contains spaces (unescaped concatenation).
const child = spawn(electronBinary, args, {
  stdio: 'inherit',
  env,
  windowsHide: true,
});

child.on('error', (error) => {
  console.error(`[mission-control] Failed to start Electron: ${error.message}`);
  process.exit(1);
});
child.on('close', (code) => process.exit(code ?? 0));
