// Model-combo allocator — assigns user-available models to the five modes
// using the curated knowledge base (.ai/model_knowledge.json).
// Pure CommonJS, zero dependencies: shared by `va` and Mission Control.
'use strict';

const fs = require('fs');
const path = require('path');

function loadKnowledge(root) {
  const file = path.join(root, '.ai', 'model_knowledge.json');
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function normalizeName(name) {
  return String(name).toLowerCase().replace(/[^a-z0-9.+-]/g, '');
}

/** Match a user model string to a knowledge-base entry via aliases/substring. */
function classifyModel(modelName, knowledge) {
  const norm = normalizeName(modelName);
  let best = null;
  for (const model of knowledge.models) {
    const keys = [model.name.toLowerCase(), ...model.aliases.map(normalizeName)];
    // Score by the longest MATCHING key only — never by unrelated keys of a
    // partially-matching entry ("deepseek" matching must not credit the
    // unused 22-char full name "deepseek v-series chat").
    // Reverse containment (key contains input) requires >=4 chars so stray
    // fragments like "r" or "q" can never produce confident classifications.
    const matchLen = Math.max(
      0,
      ...keys
        .filter((k) => {
          if (norm.includes(k)) return true;
          return norm.length >= 4 && k.includes(norm);
        })
        .map((k) => k.length)
    );
    if (matchLen > 0 && (!best || matchLen > best.matchLen)) {
      best = { model, matchLen };
    }
  }
  // Heuristic sweep for unknown-but-guessable names.
  if (!best) {
    const heuristics = [
      [/r\d|reason|think/, 'reasoner'],
      [/cod(e|er)|dev/, 'coder'],
      [/flash|nano|mini|lite|turbo|haiku/, 'fast'],
      [/pro|ultra|opus|max|flagship/, 'flagship'],
    ];
    for (const [re, cls] of heuristics) {
      if (re.test(norm)) {
        return { name: modelName, class: cls, matched: false };
      }
    }
    return { name: modelName, class: 'workhorse', matched: false }; // safe default
  }
  return { name: best.model.name, class: best.model.class, context_tokens: best.model.context_tokens, matched: true, notes: best.model.notes };
}

/**
 * Allocate models to modes.
 * @param {string[]} combo   user's available model ids (router names)
 * @param {object}  knowledge parsed .ai/model_knowledge.json
 * @param {object}  opts      { locked: {mode: modelName}, preferCheap: bool }
 * @returns {{assignments:{mode:{model,class,matched}}, unassigned:[], warnings:string[]}}
 */
function allocate(combo, knowledge, opts = {}) {
  const warnings = [];
  const classified = (combo || []).map((m) => ({ raw: m, ...classifyModel(m, knowledge) }));

  const byClass = {};
  for (const c of classified) {
    (byClass[c.class] ||= []).push(c);
  }
  // Rank within class: matched entries first (known traits), then longer names
  // (usually more specific variants), stable otherwise.
  for (const cls of Object.keys(byClass)) {
    byClass[cls].sort((a, b) => Number(b.matched ?? false) - Number(a.matched ?? false));
  }

  const assignments = {};
  const used = new Set();

  // Explicit user locks always win, first.
  for (const [mode, req] of Object.entries(knowledge.mode_requirements)) {
    if (!opts.locked?.[mode]) continue;
    const found = classified.find((c) => c.raw === opts.locked[mode]);
    if (found) {
      assignments[mode] = { model: found.raw, class: found.class, matched: !!found.matched, locked: true };
      used.add(found.raw);
    } else {
      warnings.push(`lock for ${mode} references "${opts.locked[mode]}", which is not in the combo — allocating automatically instead.`);
    }
  }

  // PASS 1 — every mode claims its PRIMARY class when available. This resolves
  // scarcity correctly: Debug needs a reasoner more than Boss does (Boss has
  // flagship fallbacks), so primary-needs-first beats first-come-first-served.
  for (const [mode, req] of Object.entries(knowledge.mode_requirements)) {
    if (assignments[mode]) continue;
    const pool = byClass[req.primary_class] || [];
    const picked = pool.find((c) => !used.has(c.raw));
    if (picked) {
      used.add(picked.raw);
      assignments[mode] = { model: picked.raw, class: picked.class, matched: !!picked.matched };
    }
  }

  // PASS 2 — remaining modes walk their fallback chain.
  for (const [mode, req] of Object.entries(knowledge.mode_requirements)) {
    if (assignments[mode]) continue;
    let picked = null;
    for (const cls of req.fallback_classes) {
      const pool = byClass[cls] || [];
      picked = pool.find((c) => !used.has(c.raw));
      if (picked) break;
    }
    if (!picked) {
      // Global fallback: any unused model, else share.
      picked = classified.find((c) => !used.has(c.raw));
      if (picked) warnings.push(`${mode}: no ${req.primary_class}-class model in your combo — using ${picked.raw} as a fallback.`);
      else if (classified.length) {
        picked = classified[Object.keys(assignments).length % classified.length];
        warnings.push(`${mode}: combo has only ${classified.length} model(s); sharing "${picked.raw}".`);
      } else continue;
    }
    used.add(picked.raw);
    assignments[mode] = { model: picked.raw, class: picked.class, matched: !!picked.matched };
  }

  const assignedModels = new Set(Object.values(assignments).map((a) => a.model));
  const unassigned = classified.filter((c) => !assignedModels.has(c.raw)).map((c) => c.raw);

  return { assignments, unassigned, warnings };
}

module.exports = { loadKnowledge, classifyModel, allocate, normalizeName };
