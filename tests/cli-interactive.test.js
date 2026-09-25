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

  it('defaults to No in non-TTY sessions instead of hanging', () => {
    assert.match(cliSrc, /isTTY/, 'askGraphify must check process.stdin.isTTY');
  });

  it('rejects an existing target directory before cloning', () => {
    assert.match(cliSrc, /already exists in this directory/);
  });

  it('supports --version', () => {
    assert.ok(cliSrc.includes("'--version'"), 'must handle --version flag');
  });

  it('cleans up a partially created project on failure', () => {
    assert.ok(cliSrc.includes('resetTemplateState'), 'must reset volatile .ai state');
    assert.match(cliSrc, /Removing partially created project directory/);
  });

  it('neutralizes the template manifest in bootstrapped projects', () => {
    assert.ok(cliSrc.includes('delete pkg.bin'), 'must remove bin to prevent accidental publish');
    assert.ok(cliSrc.includes('pkg.private = true'), 'must mark user projects private');
  });

  it('supports --help', () => {
    assert.ok(cliSrc.includes("'--help'"), 'must handle --help flag');
  });

  it('spawns npm with .cmd shim on Windows', () => {
    assert.match(cliSrc, /npm\.cmd/, 'npm.cmd required for execFileSync on Windows');
  });
});