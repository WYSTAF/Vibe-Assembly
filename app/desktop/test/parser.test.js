const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { parseActiveTask, parseStateFile, validateContract, verifiedSteps } = require('../lib/parser');

const SAMPLE = `# 🎯 Active Task Assignment Blueprint

## Wave
- **Name:** Vibe Assembly Desktop Launch
- **Objective:** Launch the desktop app.
- **Status:** planning_complete
- **User paste:** \`Execute active task\`

## Status Snapshot
- **current_ticket:** T-401
- **completed_tickets:** none
- **remaining_tickets:** T-401
- **resume_rule:** Open the explicit Active Ticket.

## Active Ticket
- **id:** T-401

## Queue
| order | id | title | status | effort | depends_on |
|------:|----|-------|--------|--------|------------|
| 1 | T-401 | Launch Vibe Assembly Desktop in Dev Mode | in_progress | S | none |
| 2 | T-402 | Wire Onboarding Copy | pending | S | T-401 |

---

## Ticket T-401
### Meta
- **status:** in_progress
- **effort:** S
- **depends_on:** none
- **files_allowed:**
   - app/desktop/main.js
   - .ai/active_task.md
- **files_forbidden:** (default: all other paths)

### context_inline
The desktop app needs an env sanitizer.

### Steps
1. Verify dependencies.
   - **Verify:** \`bun install\` -> exit 0
2. Launch dev mode.
   - **Verify:** \`bun run dev\` -> window opens

### done_when
- The window opens.

### stop_when
- Fatal dependency error.

### relay_notes
- Step 1: PASS. exit 0.
- Step 2: BLOCKED. SyntaxError detail here.
`;

describe('parseActiveTask', () => {
  const parsed = parseActiveTask(SAMPLE);

  it('extracts wave name', () => {
    assert.equal(parsed.wave_name, 'Vibe Assembly Desktop Launch');
  });

  it('parses queue rows in order', () => {
    assert.equal(parsed.queue.length, 2);
    assert.equal(parsed.queue[0].id, 'T-401');
    assert.equal(parsed.queue[0].status, 'in_progress');
    assert.equal(parsed.queue[1].id, 'T-402');
    assert.equal(parsed.queue[1].depends_on, 'T-401');
  });

  it('reads the explicit active ticket pointer', () => {
    assert.equal(parsed.active_id, 'T-401');
    assert.equal(parsed.active.id, 'T-401');
    assert.equal(parsed.active.status, 'in_progress');
  });

  it('collects allowlisted files without the default-forbidden note', () => {
    assert.deepEqual(parsed.active.files_allowed, ['app/desktop/main.js', '.ai/active_task.md']);
  });

  it('parses steps with verify commands and expected results', () => {
    assert.equal(parsed.active.steps.length, 2);
    assert.equal(parsed.active.steps[1].verify.command, 'bun run dev');
    assert.match(parsed.active.steps[1].verify.expected, /window opens/);
  });

  it('parses done_when, stop_when, and relay notes', () => {
    assert.deepEqual(parsed.active.done_when, ['The window opens.']);
    assert.equal(parsed.active.stop_when.length, 1);
    assert.equal(parsed.active.relay_notes.length, 2);
    assert.match(parsed.active.relay_notes[1], /BLOCKED/);
  });

  it('handles empty pointer (all done)', () => {
    const done = parseActiveTask(SAMPLE.replace(/- \*\*id:\*\* T-401/m, '- **id:** none'));
    assert.equal(done.active_id, 'none');
    assert.equal(done.active, null);
  });

  it('returns null active when pointer section is missing', () => {
    const noPointer = parseActiveTask('# x\n\n## Queue\n| order | id | title | status | effort | depends_on |\n|---:|---|---|---|---|---|\n');
    assert.equal(noPointer.active_id, null);
    assert.equal(noPointer.active, null);
  });
});

describe('parseStateFile', () => {
  it('parses title and dash fields', () => {
    const s = parseStateFile('# Current Operational State\n- **Blockers:** None.\n- **Active Milestone:** X\n');
    assert.equal(s.title, 'Current Operational State');
    assert.equal(s.fields['Blockers'], 'None.');
    assert.equal(s.fields['Active Milestone'], 'X');
  });

  it('tolerates empty input', () => {
    const s = parseStateFile('');
    assert.equal(s.title, '');
    assert.deepEqual(s.fields, {});
  });

  it('normalizes CRLF line endings (Windows autocrlf checkouts)', () => {
    const crlf = SAMPLE.replace(/\n/g, '\r\n');
    const parsed = parseActiveTask(crlf);
    assert.equal(parsed.wave_name, 'Vibe Assembly Desktop Launch');
    assert.equal(parsed.active_id, 'T-401');
    assert.equal(parsed.active.status, 'in_progress', 'status must not carry trailing \\r');
    assert.equal(parsed.queue[0].status, 'in_progress');
    const s = parseStateFile('# T\r\n- **Blockers:** None.\r\n');
    assert.equal(s.fields['Blockers'], 'None.', 'state field must not carry trailing \\r');
  });

  it('collects duplicate state-file keys into arrays instead of overwriting', () => {
    const s = parseStateFile(
      '# Bugs\n## KB-001 — first\n- **Date:** 2026-08-25\n- **Symptom:** A\n## KB-002 — second\n- **Date:** 2026-08-26\n- **Symptom:** B\n'
    );
    assert.deepEqual(s.fields['Date'], ['2026-08-25', '2026-08-26']);
    assert.deepEqual(s.fields['Symptom'], ['A', 'B']);
  });
});

describe('validateContract', () => {
  const base = () => ({
    queue: [{ id: 'T-401', status: 'pending', depends_on: 'none' }],
    active_id: 'T-401',
    active: { id: 'T-401', status: 'pending' },
  });

  it('passes coherent pending state', () => {
    assert.equal(validateContract(base()), null);
  });

  it('flags "none" while unfinished rows remain', () => {
    const p = base();
    p.active_id = 'none';
    p.active = null;
    assert.match(validateContract(p), /unfinished Queue rows remain: T-401/);
  });

  it("accepts \"none\" when every row is done", () => {
    const p = base();
    p.queue[0].status = 'done';
    p.active_id = 'none';
    p.active = null;
    assert.equal(validateContract(p), null);
  });

  it('flags a blocked dependency', () => {
    const p = base();
    p.queue.push({ id: 'T-402', status: 'pending', depends_on: 'T-401' });
    p.queue[0].status = 'pending'; // dep not done
    p.active_id = 'T-402';
    p.active = { id: 'T-402', status: 'pending' };
    assert.match(validateContract(p), /depends_on T-401.*must be done/s);
  });

  it('flags a dependency missing from the Queue', () => {
    const p = base();
    p.active_id = 'T-402';
    p.active = { id: 'T-402', status: 'pending' };
    p.queue.push({ id: 'T-402', status: 'pending', depends_on: 'T-999' });
    assert.match(validateContract(p), /T-999.*not in the Queue/);
  });

  it('flags duplicate Queue ids', () => {
    const p = base();
    p.queue.push({ ...p.queue[0] });
    assert.match(validateContract(p), /duplicate id T-401/);
  });
});

describe('verifiedSteps (relay-evidence semantics)', () => {
  const steps12 = Array.from({ length: 12 }, (_, i) => ({ n: i + 1 }));

  it('"Step 12: PASS" must NOT verify steps 1-9 (prefix collision)', () => {
    const v = verifiedSteps(steps12, ['Step 12: PASS. exit 0']);
    assert.deepEqual(v, [12]);
  });

  it('one PASS note cannot leak to other steps (cross-note leakage)', () => {
    const v = verifiedSteps(
      [{ n: 1 }, { n: 2 }, { n: 3 }],
      ['Step 1: read files', 'Step 2: PASS. exit 0', 'Step 3: pending']
    );
    assert.deepEqual(v, [2]);
  });

  it('step + success evidence in the SAME note is required', () => {
    // Mention without evidence → not verified; evidence without mention → not verified.
    assert.deepEqual(verifiedSteps([{ n: 1 }, { n: 2 }], ['Step 1: ran the thing']), []);
    assert.deepEqual(verifiedSteps([{ n: 1 }, { n: 2 }], ['PASS but which step? exit 0']), []);
    // Combined → verified.
    assert.deepEqual(verifiedSteps([{ n: 1 }, { n: 2 }], ['Step 1: PASS. exit code 0']), [1]);
  });

  it('handles real T-401-style relay notes', () => {
    const notes = [
      'Step 1 (bun install): PASS. exited 0.',
      'Step 2 (bun run predev): PASS. CLI binary copied.',
      'Step 3 (bun run dev): BLOCKED — fatal startup crash.',
    ];
    const v = verifiedSteps([{ n: 1 }, { n: 2 }, { n: 3 }], notes);
    assert.deepEqual(v.sort(), [1, 2]);
  });

  it('tolerates empty steps and notes', () => {
    assert.deepEqual(verifiedSteps([], []), []);
    assert.deepEqual(verifiedSteps([{ n: 1 }], []), []);
  });
});
