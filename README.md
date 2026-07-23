# 🏗️ Vibe Assembly

> **Zero-Dollar, Infinite-Context Vibe Coding Architecture.**
> Build massive software projects using free API tiers without ever hitting context limits or AI hallucinations.

Vibe Assembly is a highly structured, strict multi-agent workspace template designed for [Roo Code](https://roocode.com/). It converts your editor into an automated software factory, utilizing a **4-Mode Assembly Line** to bypass the memory limits of free AI models.

## 🛑 The Problem: Context Bloat
When coding with LLMs, keeping the entire project history in a single chat quickly exhausts the token limits of free APIs (like OpenRouter, Cloudflare Workers AI, or Gemini Free tier). The AI loses track of the architecture, hallucinates, and breaks the codebase.

## 💡 The Solution: Separation of Concerns
Vibe Assembly strictly isolates AI responsibilities. The AI acts as four different employees who never share the same chat history. They communicate entirely through heavily regulated markdown files inside the `.ai/` directory.

---

## ⚡ Quick Start

Bootstrap a fresh Vibe Assembly workspace in one second:

```bash
npx create-vibe-assembly my-new-project
cd my-new-project
```

Open the folder in your IDE, start Roo Code, and switch to **👑 Boss** for first setup.

---

## 🧭 Modes

| Mode | Role |
|------|------|
| 👑 Boss | Architect + PM. Writes `.ai/active_task.md` blueprints. Never production code. |
| 💬 Chat | Product chatbot. Brainstorm in any language; durable handoffs in English. Tough-love partner. |
| 💻 Code | Implements only what Boss authorized in `active_task.md`. |
| 🐞 Debug | Surgical fixes when tests/builds fail. |

---

## 🔭 Scout (advisor skill)

First-party advisor skill at `.agents/skills/scout/`. **Read-only** on application source; writes plans under `plans/` only.

| Command | Behavior |
|---------|----------|
| `scout` | Full audit workflow |
| `scout quick` | High-confidence findings only |
| `scout deep` | Full-repo coverage |
| `scout roadmap` | Direction / next features |
| `scout plan <desc>` | One plan, skip full audit |
| `scout branch` | Diff vs default branch |
| `scout polish <file>` | Tighten an existing plan |
| `scout sync` | Reconcile plan backlog status |
| `scout issues` | Optional GitHub issues (with public-repo safety) |

Implementation path: **plans → Boss → Code** via `.ai/active_task.md`. There is no scout `execute` that edits code.

Default product audit root: `app/`. Use `scout template` to audit agent OS (modes, rules, CLI) instead.

---

## 💬 Chat

- Brainstorm in any language (e.g. Persian).
- Durable artifacts (handoffs, plans, `.ai/`) stay **English**.
- Chat challenges weak or free-tier-hostile ideas once, then supports if you insist.
- When ready to build: copy the English handoff block into **👑 Boss**.

---

## ⚠️ Troubleshooting & Common AI Errors

When using AI agents (especially on free or proxy API tiers), you might encounter specific system errors. Because Vibe Assembly saves state dynamically in the `.ai/` folder, **you will never lose your work.** Here is how to handle them:

### 1. `ResourceExhausted: Worker local total request limit reached`
* **What it means:** You hit the rate limit (too many requests per minute) on your current API provider (e.g., Gemini, OpenAI).
* **How to fix:**
  1. Wait 1-2 minutes for the limit to reset.
  2. OR switch to a different AI model/provider in Roo Code.
  3. Just type: *"Continue execution"* and the agent will read `.ai/active_task.md` and resume exactly where it left off.

### 2. `The model provided text/reasoning but did not call any of the required tools.`
* **What it means:** The AI's "Context Window" (memory) is getting too full, causing it to forget how to use terminal commands or edit files.
* **How to fix:**
  1. Click **"New Session"** (Clear the chat history).
  2. Ensure you are in the correct Mode (e.g., Code Mode).
  3. Type: *"Read .ai/active_task.md and continue your work."* The AI will load the fresh context and work perfectly again.

### 3. Agent is stuck in an infinite loop (running the same failing command)
* **What it means:** The `Code Mode` agent is trying to brute-force a fix without stepping back to think, usually because of a complex runtime bug.
* **How to fix:**
  1. Stop the agent manually.
  2. Switch to **🐞 Debug Mode**.
  3. Tell it: *"The last test failed with [paste error]. Investigate the root cause."* Debug mode is specifically prompted to trace backwards and analyze deeply rather than just guessing.

---

## 📊 Graphify (Optional)

[Graphify](https://github.com/Graphify-Labs/graphify) is an optional visual codebase analysis tool that maps your project architecture as an interactive graph.

### Install during bootstrap

When you run `npx create-vibe-assembly my-project`, the CLI will ask:

```
Would you like to install Graphify for visual codebase analysis? (y/N):
```

Type `y` to clone Graphify into `app/graphify/` and run its setup automatically.

### Install later

If you declined during bootstrap, you can add Graphify at any time:

```bash
cd app/
git clone --depth 1 https://github.com/Graphify-Labs/graphify.git
cd graphify
python -m graphify install --project
```

### How Vibe Assembly uses Graphify

When Graphify is present in `app/graphify/`, Vibe Assembly's agent modes can leverage it for codebase visualization, dependency mapping, and architectural analysis. The Scout skill can reference Graphify graphs for deeper audits.

---

## License

MIT
