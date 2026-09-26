# Mission Control (native)

A native desktop dashboard for the `.ai/` workspace state, built with
[GPUI](https://www.gpui.rs/) — the same UI framework Zed is built on.

This replaces the Electron implementation in `app/desktop/`. There is no web
view, no npm runtime, and no Chromium process: the app is a single Rust binary.

## Why GPUI rather than forking Zed

Zed's extension API cannot build a dashboard. Extensions are Rust→Wasm with
exactly six capabilities — languages, debuggers, themes, icon themes, snippets,
MCP servers — and the `Extension` trait has no custom-UI hook; it cannot even
register a plain command. For a dashboard you must fork, which means
inheriting ~250 crates of editor, LSP, collab, and telemetry to render a
read-only status view.

`gpui` is published standalone on crates.io (v0.2.2, Apache-2.0) and ships
its own Windows backend, so this app gets Zed's rendering, windowing, and text
stack without the editor.

## Build

GPUI pulls ~700 transitive crates; the first build takes a while.

```bash
cargo build --release
cargo test
```

On Windows, `rustc` can exhaust the thread stack compiling a few heavy crates.
If the build dies with `STATUS_STACK_BUFFER_OVERRUN`, set a larger stack:

```bash
RUST_MIN_STACK=33554432 cargo build --release
```

## Run

Launch from anywhere inside a workspace — the app walks up looking for `.ai/`:

```bash
cargo run --release
cargo run --release -- "Q:/Vibe Coding/_Vibe_Assembly"
```

## Design rules

The previous Electron UI failed because four raw-markdown panels competed for
equal visual weight with the only thing that mattered. The rules here, in
priority order:

1. **Answer "what do I do next?" within five seconds.** The NEXT ACTION band is
   the only large element on screen, and it is always at the top.
2. **A contract violation must be impossible to miss.** It takes over that band.
3. **Everything else earns its space.** Panels that were prose dumps
   (operational state) or actively wrong (known bugs) are either trimmed to
   actionable fields or fixed.

Concretely, the resume point — the first step without durable verification
evidence — is now the app's central number. The old UI never surfaced it.

## Layout

| Path | Role |
|---|---|
| `src/parser.rs` | Port of `app/desktop/lib/parser.js`. Contract semantics. |
| `src/state.rs` | Reads `.ai/` from disk, derives what the UI needs. |
| `src/theme.rs` | Zed-like dark palette. Color is reserved for status. |
| `src/ui.rs` | GPUI render tree. |
| `tests/parser.rs` | Contract tests, mirrored by `tests/parser-parity.test.js`. |

The parser is ported literally rather than "improved" so the native app and
the `va` CLI can never disagree about what state a workspace is in. CI runs
`tests/parser-parity.test.js` to enforce that from the JS side.

## Known constraints

- GPUI is pre-1.0 and ships breaking changes between versions; this pins 0.2.2.
- Rendering needs a GPU. A machine without Vulkan will fail to open a window.
- The workspace state is read once at launch. Re-run to pick up edits.
