const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { describe, it } = require('node:test');

const CONTRACT_PATH = path.resolve(__dirname, '..', '.ai', 'ticket_contract.md');

describe('ticket_contract.md', () => {
  it('exists and is non-empty', () => {
    assert.ok(fs.existsSync(CONTRACT_PATH), '.ai/ticket_contract.md must exist');
    const content = fs.readFileSync(CONTRACT_PATH, 'utf-8');
    assert.ok(content.length > 0, 'file must not be empty');
  });

  it('contains required schema fields', () => {
    const content = fs.readFileSync(CONTRACT_PATH, 'utf-8');
    assert.ok(content.includes('files_allowed'), 'must mention files_allowed');
    assert.ok(content.includes('relay_notes'), 'must mention relay_notes');
    assert.ok(content.includes('done_when'), 'must mention done_when');
    assert.ok(content.includes('stop_when'), 'must mention stop_when');
  });

  it('contains relay paste phrases', () => {
    const content = fs.readFileSync(CONTRACT_PATH, 'utf-8');
    assert.ok(content.includes('Execute active task'), 'must mention Execute active task');
    assert.ok(content.includes('Continue relay'), 'must mention Continue relay');
  });

  it('contains a sample ticket with T- pattern', () => {
    const content = fs.readFileSync(CONTRACT_PATH, 'utf-8');
    assert.ok(content.includes('T-'), 'sample ticket must use T- id pattern');
  });

  it('does not contain shadcn/improve branding', () => {
    const content = fs.readFileSync(CONTRACT_PATH, 'utf-8');
    const match = content.match(/shadcn\/improve/i);
    assert.ok(!match, 'must not contain shadcn/improve branding');
  });
});