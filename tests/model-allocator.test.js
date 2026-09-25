const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const { loadKnowledge, classifyModel, allocate } = require(path.join(root, 'bin', 'allocate-models'));

describe('model knowledge base', () => {
  const kb = JSON.parse(fs.readFileSync(path.join(root, '.ai', 'model_knowledge.json'), 'utf8'));

  it('covers all five modes with primary + fallback classes', () => {
    for (const mode of ['boss', 'chat', 'code', 'debug', 'hermes']) {
      const req = kb.mode_requirements[mode];
      assert.ok(req, `${mode} requirements missing`);
      assert.ok(req.primary_class, `${mode} needs a primary class`);
      assert.ok(Array.isArray(req.fallback_classes) && req.fallback_classes.length >= 2);
    }
  });

  it('knowledge-base classes are all defined and models reference valid classes', () => {
    const classes = new Set(Object.keys(kb.classes));
    assert.ok(classes.size >= 4);
    for (const m of kb.models) {
      assert.ok(classes.has(m.class), `model "${m.name}" has unknown class ${m.class}`);
      assert.ok(m.aliases.length >= 1);
    }
  });
});

describe('classifyModel', () => {
  const kb = JSON.parse(fs.readFileSync(path.join(root, '.ai', 'model_knowledge.json'), 'utf8'));

  it('longest matching alias wins (deepseek-r1 is a reasoner, not workhorse)', () => {
    // Regression: "deepseek" (V-series alias) must not outrank "deepseek-r1".
    assert.equal(classifyModel('deepseek-r1:free', kb).class, 'reasoner');
    assert.equal(classifyModel('qwen3-coder', kb).class, 'coder');
    assert.equal(classifyModel('gemini-2.0-flash', kb).class, 'fast');
  });

  it('unmatched names fall back to name-shape heuristics', () => {
    assert.equal(classifyModel('mystery-reasoner-v9', kb).class, 'reasoner');
    assert.equal(classifyModel('somecoder-x', kb).class, 'coder');
    assert.equal(classifyModel('totally-unknown-model', kb).class, 'workhorse');
  });

  it('stray short fragments never produce confident matches', () => {
    // Regression: reverse containment let "r" match alias "r1".
    const r = classifyModel('r', kb);
    assert.equal(r.matched, false);
    const q = classifyModel('q', kb);
    assert.equal(q.matched, false);
  });
});

describe('allocate', () => {
  const kb = JSON.parse(fs.readFileSync(path.join(root, '.ai', 'model_knowledge.json'), 'utf8'));

  it('assigns primary classes first — scarce reasoner goes to debug, not boss', () => {
    // Regression: single reasoner in the combo must land on Debug (whose
    // PRIMARY need is reasoning), not be consumed by Boss's fallback chain.
    const r = allocate(
      ['gemini-2.0-flash', 'deepseek-r1:free', 'qwen3-coder', 'llama-4-scout', 'gpt-5-mini'],
      kb
    );
    assert.equal(r.assignments.debug.model, 'deepseek-r1:free');
    assert.equal(r.assignments.code.model, 'qwen3-coder');
    assert.equal(r.assignments.chat.model, 'gemini-2.0-flash');
    assert.ok(r.warnings.some((w) => w.startsWith('boss:')), 'boss should warn about missing flagship');
  });

  it('user locks always win', () => {
    const r = allocate(['a', 'b'], kb, { locked: { code: 'a' } });
    assert.equal(r.assignments.code.model, 'a');
    assert.equal(r.assignments.code.locked, true);
  });

  it('degenerate single-model combo shares with warnings instead of crashing', () => {
    const r = allocate(['llama-4'], kb);
    assert.equal(Object.keys(r.assignments).length, 5);
    assert.ok(r.warnings.length >= 4);
  });

  it('empty combo yields empty assignments without throwing', () => {
    const r = allocate([], kb);
    assert.deepEqual(Object.keys(r.assignments), []);
  });
});
