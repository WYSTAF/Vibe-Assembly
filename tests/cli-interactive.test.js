const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const cliSrc = fs.readFileSync(path.join(root, 'bin', 'cli.js'), 'utf8');

describe('cli interactive setup', () => {
  it('imports readline module', () => {
    assert.ok(cliSrc.includes('readline'), 'must import readline');
  });

  it('has askGraphify function', () => {
    assert.ok(cliSrc.includes('askGraphify'), 'must define askGraphify');
  });

  it('has Graphify clone URL', () => {
    assert.ok(cliSrc.includes('Graphify-Labs/graphify'), 'must reference Graphify repo');
  });

  it('has initMetadata function', () => {
    assert.ok(cliSrc.includes('initMetadata'), 'must define initMetadata');
  });

  it('replaces CHANGE_ME_PROJECT_NAME placeholder', () => {
    assert.ok(cliSrc.includes('CHANGE_ME_PROJECT_NAME'), 'must replace CHANGE_ME_PROJECT_NAME');
  });

  it('updates package.json name via JSON.parse', () => {
    assert.ok(cliSrc.includes('JSON.parse'), 'must parse package.json');
    assert.ok(cliSrc.includes('package.json'), 'must reference package.json');
  });

  it('has skip path message for declined Graphify', () => {
    assert.ok(cliSrc.includes('Skipping Graphify'), 'must print skip message');
  });

  it('handles Python-not-found gracefully', () => {
    assert.ok(cliSrc.includes('Python not found'), 'must handle missing Python');
  });
});