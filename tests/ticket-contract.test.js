const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { describe, it } = require('node:test');

const CONTRACT_PATH = path.resolve(__dirname, '..', '.ai', 'ticket_contract.md');
const content = fs.readFileSync(CONTRACT_PATH, 'utf-8');

describe('ticket_contract.md', () => {
  it('exists and is non-empty', () => {
    assert.ok(fs.existsSync(CONTRACT_PATH), '.ai/ticket_contract.md must exist');
    assert.ok(content.length > 0, 'file must not be empty');
  });

  it('contains required schema fields', () => {
    assert.ok(content.includes('files_allowed'), 'must mention files_allowed');
    assert.ok(content.includes('relay_notes'), 'must mention relay_notes');
    assert.ok(content.includes('done_when'), 'must mention done_when');
    assert.ok(content.includes('stop_when'), 'must mention stop_when');
  });

  it('contains relay paste phrases', () => {
    assert.ok(content.includes('Execute active task'), 'must mention Execute active task');
    assert.ok(content.includes('Continue relay'), 'must mention Continue relay');
  });

  it('contains a sample ticket with T- pattern', () => {
    assert.ok(content.includes('T-'), 'sample ticket must use T- id pattern');
  });

  it('defines exactly one explicit Active Ticket in the canonical skeleton', () => {
    const skeleton = content.match(/```markdown\r?\n([\s\S]*?)```/)?.[1];
    assert.ok(skeleton, 'must contain a canonical markdown skeleton');
    assert.strictEqual((skeleton.match(/^## Active Ticket$/gm) ?? []).length, 1, 'skeleton must contain one Active Ticket section');
    assert.match(skeleton, /^- \*\*id:\*\* T-\d{3}$/m, 'Active Ticket must contain one T-NNN pointer');
    assert.ok(content.includes('sole execution pointer'), 'must define Active Ticket as the sole execution pointer');
  });

  it('requires synchronized state and fail-closed conflicts', () => {
    assert.ok(content.includes('same status and dependencies'), 'must synchronize Queue and Meta');
    assert.ok(content.includes('fails closed'), 'must fail closed on invalid state');
    assert.ok(content.includes('never infers or falls back'), 'must prohibit fallback ticket selection');
  });

  it('requires complete durable relay evidence', () => {
    for (const field of ['step number', 'changed paths', 'exact verification command', 'exit code', 'next step']) {
      assert.ok(content.includes(field), `relay evidence must include ${field}`);
    }
    assert.ok(content.includes('Only exit code 0 advances the resume point'), 'only successful verification may advance resume');
  });

  it('does not contain shadcn/improve branding', () => {
    const match = content.match(/shadcn\/improve/i);
    assert.ok(!match, 'must not contain shadcn/improve branding');
  });

  it('defines the completion gate (done requires full evidence + consistency)', () => {
    assert.ok(content.includes('Completion Gate'), 'contract must define the completion gate');
    assert.ok(content.includes('exit-code-0 relay entry'), 'gate must require per-step exit-code-0 evidence');
  });
});