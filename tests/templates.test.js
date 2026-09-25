const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const TEMPLATES = path.join(root, 'templates');

describe('project templates catalog', () => {
  const catalog = JSON.parse(fs.readFileSync(path.join(TEMPLATES, 'catalog.json'), 'utf8'));

  it('catalog is valid and non-empty', () => {
    assert.ok(Array.isArray(catalog.templates) && catalog.templates.length >= 3);
    for (const t of catalog.templates) {
      assert.match(t.name, /^[a-z-]+$/, `template name "${t.name}" must be lowercase slug`);
      assert.ok(t.description && t.entry);
    }
  });

  for (const t of catalog.templates) {
    it(`template "${t.name}" ships a working starter + seeded .ai context`, () => {
      const dir = path.join(TEMPLATES, t.name);
      // Starter must be openable directly; entry file + at least one asset.
      assert.equal(fs.existsSync(path.join(dir, t.entry)), true, `${t.name}: entry file missing`);
      const appFiles = fs.readdirSync(path.join(dir, 'app'));
      assert.ok(appFiles.length >= 2, `${t.name}: starter should ship entry + assets`);
      // Seeded context: overview must describe the template, config must keep
      // the CHANGE_ME_PROJECT_NAME placeholder (CLI fills it at bootstrap).
      const overview = fs.readFileSync(path.join(dir, '.ai', 'project_overview.md'), 'utf8');
      assert.match(overview, /template/, 'overview must mention its template origin');
      const config = fs.readFileSync(path.join(dir, '.ai', 'project_config.md'), 'utf8');
      assert.ok(config.includes('CHANGE_ME_PROJECT_NAME'), 'config keeps the project-name placeholder');
      // No accidental node_modules or build artifacts inside templates.
      const walk = (d) => {
        for (const f of fs.readdirSync(d, { withFileTypes: true })) {
          assert.notEqual(f.name, 'node_modules', 'templates must not contain node_modules');
          if (f.isDirectory()) walk(path.join(d, f.name));
        }
      };
      walk(dir);
    });
  }

  it('CLI accepts --template/-t and lists names in --help', () => {
    const cliSrc = fs.readFileSync(path.join(root, 'bin', 'cli.js'), 'utf8');
    assert.ok(cliSrc.includes("'--template'"), 'flag parsing must know --template');
    assert.ok(cliSrc.includes("'-t'"), 'flag parsing must know -t');
    assert.ok(cliSrc.includes('--template <name>'), '--help must document the flag');
    // Hook allowlist must include templates/ so the catalog is committable.
    const hook = fs.readFileSync(path.join(root, '.githooks', 'pre-commit'), 'utf8');
    assert.ok(hook.includes("'templates'"), 'pre-commit must allow templates/');
    // npm files whitelist must ship templates/.
    const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
    assert.ok(pkg.files.includes('templates/'), 'npm files must include templates/');
  });

  it('validates template name BEFORE cloning (no partial project on typo)', () => {
    const cliSrc = fs.readFileSync(path.join(root, 'bin', 'cli.js'), 'utf8');
    const validateIdx = cliSrc.indexOf('Unknown template');
    const cloneIdx = cliSrc.indexOf("'clone'");
    assert.ok(validateIdx !== -1, 'catalog validation call site missing');
    assert.ok(cloneIdx !== -1);
    assert.ok(validateIdx < cloneIdx, 'validation must run before git clone side effects');
  });

  it('applies template BEFORE initMetadata (placeholders get filled)', () => {
    // Regression: template seeds re-introduce CHANGE_ME_PROJECT_NAME; if the
    // generic rename ran first, the final workspace kept the placeholder.
    // Match the INDENTED call sites inside main(), not the function definitions.
    const cliSrc = fs.readFileSync(path.join(root, 'bin', 'cli.js'), 'utf8');
    const applyIdx = cliSrc.indexOf('if (templateName) applyProjectTemplate(templateName');
    const metaIdx = cliSrc.indexOf('\n    initMetadata(projectName');
    assert.ok(applyIdx !== -1 && metaIdx !== -1);
    assert.ok(applyIdx < metaIdx, 'applyProjectTemplate must precede initMetadata');
  });

  it('--template without a value is a loud error, not a silent skip', () => {
    const cliSrc = fs.readFileSync(path.join(root, 'bin', 'cli.js'), 'utf8');
    assert.match(cliSrc, /--template requires a value/);
  });
});
