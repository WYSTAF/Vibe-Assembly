const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

// Integration test: run the real va CLI against synthetic workspaces.
const VA = path.join(__dirname, '..', 'bin', 'va.js');
const ROOT = path.join(__dirname, '..');

function makeWorkspace(activeTaskContent) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'va-cli-'));
  fs.mkdirSync(path.join(dir, '.ai'));
  fs.writeFileSync(path.join(dir, '.ai', 'active_task.md'), activeTaskContent);
  return dir;
}

function runVa(args, cwd) {
  try {
    const out = execFileSync(process.execPath, [VA, ...args], {
      cwd,
      encoding: 'utf8',
    });
    return { code: 0, out };
  } catch (err) {
    return { code: err.status ?? 1, out: `${err.stdout ?? ''}${err.stderr ?? ''}` };
  }
}

describe('va CLI', () => {
  it('errors cleanly outside a workspace', () => {
    const empty = fs.mkdtempSync(path.join(os.tmpdir(), 'va-empty-'));
    const r = runVa(['--root', empty], empty);
    assert.equal(r.code, 1);
    assert.match(r.out, /No \.ai\/ directory found/);
    fs.rmSync(empty, { recursive: true, force: true });
  });

  it('shows the queue and exit-codes 2 on contract violations', () => {
    const ws = makeWorkspace(`# Blueprint
## Active Ticket
- **id:** T-002

## Queue
| order | id | title | status | effort | depends_on |
|------:|----|-------|--------|--------|------------|
| 1 | T-001 | First | pending | S | none |

## Ticket T-002
### Meta
- **status:** pending
`);
    const r = runVa(['--root', ws], ws);
    assert.equal(r.code, 2);
    assert.match(r.out, /CONTRACT VIOLATION/);
    fs.rmSync(ws, { recursive: true, force: true });
  });

  it('suggests Execute active task for a pending ticket', () => {
    const ws = makeWorkspace(`# Blueprint
## Active Ticket
- **id:** T-001

## Queue
| order | id | title | status | effort | depends_on |
|------:|----|-------|--------|--------|------------|
| 1 | T-001 | First | pending | S | none |

## Ticket T-001
### Meta
- **status:** pending
`);
    const r = runVa(['--root', ws], ws);
    assert.equal(r.code, 0);
    assert.match(r.out, /Execute active task/);
    assert.match(r.out, /T-001\s+pending/);
    fs.rmSync(ws, { recursive: true, force: true });
  });

  it('--doctor reports healthy on a complete workspace', () => {
    const ws = makeWorkspace(`# Blueprint
## Active Ticket
- **id:** none

## Queue
`);
    // Minimal supporting files.
    for (const f of ['current_state.md', 'ticket_contract.md']) {
      fs.writeFileSync(path.join(ws, '.ai', f), '# x\n');
    }
    fs.writeFileSync(path.join(ws, '.ai', 'project_config.md'), '# configured\n');
    const r = runVa(['--doctor', '--root', ws], ws);
    assert.equal(r.code, 0);
    assert.match(r.out, /All checks passed/);
    fs.rmSync(ws, { recursive: true, force: true });
  });

  it('--models allocates and handles inline comments', () => {
    // Copy the knowledge base into the synthetic workspace.
    const ws = makeWorkspace('# Blueprint\n');
    fs.copyFileSync(
      path.join(ROOT, '.ai', 'model_knowledge.json'),
      path.join(ws, '.ai', 'model_knowledge.json')
    );
    fs.writeFileSync(
      path.join(ws, '.ai', 'model_combo.txt'),
      'gemini-2.0-flash   # fast chat\ndeepseek-r1:free # reasoning\nqwen3-coder\n'
    );
    const r = runVa(['--models', '--root', ws], ws);
    assert.equal(r.code, 0);
    assert.match(r.out, /MODEL ALLOCATION/);
    assert.match(r.out, /qwen3-coder/, 'inline comments must not corrupt model names');
    assert.doesNotMatch(r.out, /# fast chat/);
    fs.rmSync(ws, { recursive: true, force: true });
  });

  it('--json emits parseable machine-readable status', () => {
    const ws = makeWorkspace(`# Blueprint
## Active Ticket
- **id:** T-001

## Queue
| order | id | title | status | effort | depends_on |
|------:|----|-------|--------|--------|------------|
| 1 | T-001 | First | pending | S | none |

## Ticket T-001
### Meta
- **status:** pending
`);
    const r = runVa(['--json', '--root', ws], ws);
    assert.equal(r.code, 0);
    const parsed = JSON.parse(r.out);
    assert.equal(parsed.active_id, 'T-001');
    assert.equal(parsed.suggested_phrase, 'Execute active task');
    assert.equal(parsed.contract_violation, null);
    assert.ok(Array.isArray(parsed.queue));
    fs.rmSync(ws, { recursive: true, force: true });
  });
});
