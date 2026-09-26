//! Entry point for the Mission Control desktop app.
//!
//! Reads the `.ai/` workspace state from disk and renders it with GPUI, the
//! same UI framework Zed is built on. Zero web view, zero npm runtime.

use std::path::PathBuf;

use vibe_assembly_control::state::Workspace;
use vibe_assembly_control::ui;

fn main() {
    // Discovery order: an explicit argument, then the current directory.
    let start: PathBuf = std::env::args()
        .nth(1)
        .map(PathBuf::from)
        .unwrap_or_else(|| std::env::current_dir().unwrap_or_else(|_| PathBuf::from(".")));

    match Workspace::discover(&start) {
        Some(root) => ui::run(Workspace::load(&root), None),
        None => {
            let shown = start.display().to_string();
            ui::run(
                Workspace::load(&start),
                Some(format!("Searched upward from: {shown}")),
            );
        }
    }
}
