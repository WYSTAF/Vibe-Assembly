// Mission Control renderer. Renders exclusively from state pushed by main —
// it never reads the filesystem itself (sandboxed, contextIsolation on).
'use strict';

const $ = (id) => document.getElementById(id);

const STATUS_CLASS = {
  done: 'st-done',
  in_progress: 'st-in_progress',
  pending: 'st-pending',
  blocked: 'st-bad',
  failed: 'st-bad',
  blocked_escalated: 'st-bad',
};

function esc(s) {
  const div = document.createElement('div');
  div.textContent = s == null ? '' : String(s);
  return div.innerHTML;
}

// One-shot staggered entrance: sections rise in sequence on first paint.
let firstRender = true;
function revealOnce(id, delayMs) {
  const el = $(id);
  if (!el || !firstRender || el.classList.contains('reveal')) return;
  el.classList.add('reveal');
  el.style.setProperty('--d', `${delayMs}ms`);
}
const ENTRANCE_ORDER = [
  ['next-action', 0],
  ['queue-panel', 90],
  ['ticket-panel', 180],
  ['side-panel', 270],
];

// Diff helpers: highlight only what changed since the previous live update.
let prevQueueStatus = new Map(); // id -> status
let prevStateFields = {};        // key -> value

function flashIfChanged(el, changed) {
  if (!changed) return;
  el.classList.remove('flash');
  void el.offsetWidth; // restart the CSS animation
  el.classList.add('flash');
}

function statusChip(status) {
  const cls = STATUS_CLASS[status] || 'st-pending';
  return `<span class="status-chip ${cls}">${esc(status || '—')}</span>`;
}

function renderQueue(queue, activeId) {
  const body = $('queue-body');
  body.innerHTML = '';
  const nextStatus = new Map();
  for (const row of queue) {
    nextStatus.set(row.id, row.status);
    const tr = document.createElement('tr');
    if (row.id === activeId) tr.className = 'active-row';
    tr.innerHTML =
      `<td>${esc(row.order)}</td>` +
      `<td class="id-cell">${esc(row.id)}</td>` +
      `<td>${esc(row.title)}</td>` +
      `<td>${statusChip(row.status)}</td>` +
      `<td class="muted">${esc(row.effort)}</td>` +
      `<td class="muted mono">${esc(row.depends_on)}</td>`;
    // Status changed since the last live update → flash the chip's cell.
    if (!firstRender && prevQueueStatus.get(row.id) !== undefined && prevQueueStatus.get(row.id) !== row.status) {
      const statusTd = tr.children[3];
      statusTd.classList.add('flash');
    }
    body.appendChild(tr);
  }
  prevQueueStatus = nextStatus;
  $('queue-empty').classList.toggle('hidden', queue.length > 0);
}

function renderTicket(active) {
  $('active-id').textContent = active ? active.id : '';
  if (!active) {
    $('ticket-title').textContent = 'No active ticket.';
    $('ticket-meta').innerHTML = '';
    $('files-list').innerHTML = '';
    $('steps-list').innerHTML = '';
    $('relay-notes').textContent = '';
    $('relay-count').textContent = '0';
    return;
  }
  $('ticket-title').textContent = active.title || active.id;
  $('ticket-meta').innerHTML =
    `<span class="chip">status: ${esc(active.status)}</span>` +
    (active.effort ? `<span class="chip">effort: ${esc(active.effort)}</span>` : '');

  const files = $('files-list');
  files.innerHTML = '';
  for (const f of active.files_allowed || []) {
    const li = document.createElement('li');
    li.textContent = f;
    files.appendChild(li);
  }

  // Relay timeline. Verified steps come precomputed from main (shared
  // parser semantics — no substring collisions, no cross-note leakage).
  const verifiedSet = new Set(active.verified_steps || []);
  const steps = active.steps || [];
  const stepsEl = $('steps-list');
  stepsEl.innerHTML = '';
  for (let i = 0; i < steps.length; i++) {
    const verified = verifiedSet.has(i + 1);
    const li = document.createElement('li');
    li.className = verified ? 'step-verified' : 'step-unverified';
    li.innerHTML =
      `${esc(steps[i].text)}` +
      (steps[i].verify
        ? `<span class="step-verify">$ ${esc(steps[i].verify.command)}</span><span class="step-verify expected">${esc(steps[i].verify.expected)}</span>`
        : '') +
      (verified
        ? '<span class="step-badge ok">✓ VERIFIED</span>'
        : '<span class="step-badge next">▶ RESUME HERE</span>');
    stepsEl.appendChild(li);
  }
  // Only the FIRST unverified step is the resume point; later ones stay neutral.
  let seenResume = false;
  for (const li of stepsEl.children) {
    const badge = li.querySelector('.step-badge.next');
    if (!badge) continue;
    if (seenResume) badge.textContent = '○ PENDING';
    else { badge.classList.replace('next', 'resume'); seenResume = true; }
  }

  $('relay-count').textContent = String((active.relay_notes || []).length);
  $('relay-notes').textContent = (active.relay_notes || []).join('\n\n') || '(empty until Code runs)';
}

function renderStateFields(state) {
  const f = state.current_state?.fields || {};
  const rows = [
    ['Milestone', f['Active Milestone']],
    ['Assignment', f['Current Assignment']],
    ['Planning', f['Planning Status']],
    ['Implementation', f['Implementation Status']],
    ['Verification', f['Verification Status']],
    ['Blockers', f['Blockers'], (f['Blockers'] || '').toLowerCase() === 'none' ? 'good' : 'bad'],
  ];
  const dl = $('state-fields');
  dl.innerHTML = '';
  for (const [k, v, tone] of rows) {
    const changed = !firstRender && prevStateFields[k] !== undefined && prevStateFields[k] !== v;
    dl.insertAdjacentHTML(
      'beforeend',
      `<dt>${k}</dt><dd${tone ? ` class="${tone}${changed ? ' flash' : ''}"` : changed ? ' class="flash"' : ''}>${esc(v ?? '—')}</dd>`
    );
  }
  prevStateFields = Object.fromEntries(rows.map(([k, v]) => [k, v]));
}

function renderBugs(bugs) {
  const f = bugs?.fields || {};
  const entries = Object.entries(f);
  $('no-bugs').classList.toggle('hidden', entries.length > 0);
  const dl = $('bug-fields');
  dl.innerHTML = '';
  for (const [k, v] of entries.slice(0, 6)) {
    dl.insertAdjacentHTML('beforeend', `<dt>${esc(k)}</dt><dd class="bad">${esc(v)}</dd>`);
  }
}

const MODE_ICONS = { boss: '👑', chat: '💬', code: '💻', debug: '🐞', hermes: '📣' };

function renderModels(allocation) {
  const panel = document.getElementById('models-panel');
  if (!panel) return;
  if (!allocation || !allocation.assignments) {
    panel.classList.add('hidden');
    return;
  }
  panel.classList.remove('hidden');
  const dl = document.getElementById('model-fields');
  dl.innerHTML = '';
  for (const [mode, a] of Object.entries(allocation.assignments)) {
    dl.insertAdjacentHTML(
      'beforeend',
      `<dt>${MODE_ICONS[mode] || '•'} ${esc(mode)}</dt><dd${a.locked ? ' class="good"' : ''}>${esc(a.model)} <span class="muted">[${esc(a.class)}]${a.locked ? ' 🔒' : ''}</span></dd>`
    );
  }
  for (const w of allocation.warnings || []) {
    dl.insertAdjacentHTML('beforeend', `<dt></dt><dd class="bad">${esc(w)}</dd>`);
  }
}

function renderNextAction(state) {
  const phrase = state.suggested_phrase;
  const box = $('phrase-box');
  box.classList.toggle('idle', !phrase);
  box.classList.toggle('active', !!phrase);
  $('phrase-text').textContent = phrase || '— nothing to execute —';
  $('phrase-help').textContent = phrase
    ? `Paste into 💻 Code Mode (${state.active_id}, status: ${state.active?.status}).`
    : 'All tickets done or none scoped. Switch to 👑 Boss to plan the next wave.';
  $('copy-phrase').disabled = !phrase;
}

async function render(state) {
  if (firstRender) {
    for (const [id, delay] of ENTRANCE_ORDER) revealOnce(id, delay);
  }
  $('wave-name').textContent = state.wave_name ? `— ${state.wave_name}` : '';
  $('fresh-badge').classList.toggle('hidden', !state.fresh_template);
  $('updated-at').textContent = new Date(state.updated_at).toLocaleTimeString();
  $('workspace-root').textContent = state.workspace_root;

  const violation = state.contract_violation;
  $('alert-panel').classList.toggle('hidden', !violation);
  if (violation) $('violation-text').textContent = violation;

  renderNextAction(state);
  renderQueue(state.queue || [], state.active_id);
  renderTicket(state.contract_violation ? null : state.active);
  renderStateFields(state);
  renderBugs(state.known_bugs);
  renderModels(state.model_allocation);
  $('progress-log').textContent = state.recent_progress || '(no progress recorded)';

  firstRender = false;
}

$('copy-phrase').addEventListener('click', async () => {
  const text = $('phrase-text').textContent;
  try {
    await navigator.clipboard.writeText(text);
    const btn = $('copy-phrase');
    btn.textContent = 'COPIED ✓';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = 'COPY';
      btn.classList.remove('copied');
    }, 1400);
  } catch { /* clipboard denied; user can select manually */ }
});

window.missionControl.getState().then(render);
window.missionControl.onUpdate(render);
