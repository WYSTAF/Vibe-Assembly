const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const cliSrc = fs.readFileSync(path.join(root, 'bin', 'cli.js'), 'utf8');
const { isSafeProjectName } = require(path.join(root, 'bin', 'cli.js'));

describe('package identity', () => {
  it('name and bin are create-vibe-assembly', () => {
    assert.equal(pkg.name, 'create-vibe-assembly');
    assert.ok(pkg.bin && pkg.bin['create-vibe-assembly']);
  });

  it('repository.url is not shadcn/improve', () => {
    assert.ok(pkg.repository && pkg.repository.url);
    assert.equal(/shadcn\/improve/i.test(pkg.repository.url), false);
  });
});

describe('cli bootstrap safety', () => {
  it('source has no shadcn/improve', () => {
    assert.equal(/shadcn\/improve/i.test(cliSrc), false);
  });

  it('uses execFileSync with args, not shell git clone interpolation', () => {
    assert.match(cliSrc, /execFileSync/);
    assert.equal(/execSync\s*\(\s*[`'"]git clone/.test(cliSrc), false);
  });

  it('isSafeProjectName rejects path injection', () => {
    assert.equal(isSafeProjectName('my-app'), true);
    assert.equal(isSafeProjectName('my_app.v2'), true);
    assert.equal(isSafeProjectName(undefined), false);
    assert.equal(isSafeProjectName(''), false);
    assert.equal(isSafeProjectName('.'), false);
    assert.equal(isSafeProjectName('..'), false);
    assert.equal(isSafeProjectName('../evil'), false);
    assert.equal(isSafeProjectName('foo/bar'), false);
    assert.equal(isSafeProjectName('foo\\bar'), false);
  });
});
