# Graph Report - .  (2026-07-25)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 54 nodes · 51 edges · 7 communities (6 shown, 1 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `08cb5576`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- package.json
- cli.js
- cli-identity.test.js
- keywords
- cli-interactive.test.js
- ticket-contract.test.js
- pre-commit

## God Nodes (most connected - your core abstractions)
1. `keywords` - 7 edges
2. `main()` - 4 edges
3. `repository` - 3 edges
4. `isSafeProjectName()` - 2 edges
5. `askGraphify()` - 2 edges
6. `initMetadata()` - 2 edges
7. `bin` - 2 edges
8. `scripts` - 2 edges
9. `{ execFileSync }` - 1 edges
10. `path` - 1 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Import Cycles
- None detected.

## Communities (7 total, 1 thin omitted)

### Community 0 - "package.json"
Cohesion: 0.15
Nodes (12): author, bin, create-vibe-assembly, description, license, name, repository, type (+4 more)

### Community 1 - "cli.js"
Cohesion: 0.31
Nodes (8): askGraphify(), { execFileSync }, fs, initMetadata(), isSafeProjectName(), main(), path, readline

### Community 2 - "cli-identity.test.js"
Cohesion: 0.22
Nodes (8): assert, cliSrc, { describe, it }, fs, { isSafeProjectName }, path, pkg, root

### Community 3 - "keywords"
Cohesion: 0.29
Nodes (7): keywords, ai, free-api, multi-agent, roo-code, vibe-assembly, vibe-coding

### Community 4 - "cli-interactive.test.js"
Cohesion: 0.29
Nodes (6): assert, cliSrc, { describe, it }, fs, path, root

### Community 5 - "ticket-contract.test.js"
Cohesion: 0.33
Nodes (5): assert, CONTRACT_PATH, { describe, it }, fs, path

## Knowledge Gaps
- **38 isolated node(s):** `{ execFileSync }`, `path`, `fs`, `readline`, `name` (+33 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `keywords` connect `keywords` to `package.json`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._
- **What connects `{ execFileSync }`, `path`, `fs` to the rest of the system?**
  _38 weakly-connected nodes found - possible documentation gaps or missing edges._