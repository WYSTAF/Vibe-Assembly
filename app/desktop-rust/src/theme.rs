//! Visual language borrowed from Zed's dark theme: a near-black layered
//! surface, hairline borders, one accent hue, and color reserved almost
//! entirely for *status* so it always carries meaning.

use gpui::{rgb, Rgba};

pub fn surface_0() -> Rgba {
    // Window background — deepest layer.
    rgb(0x0d0e10)
}

pub fn surface_1() -> Rgba {
    // Panels sitting on the background.
    rgb(0x141619)
}

pub fn surface_2() -> Rgba {
    // Raised rows, hover states.
    rgb(0x1b1e22)
}

pub fn border() -> Rgba {
    rgb(0x26292e)
}

pub fn border_strong() -> Rgba {
    rgb(0x363a41)
}

pub fn text_primary() -> Rgba {
    rgb(0xe6e8ec)
}

pub fn text_secondary() -> Rgba {
    rgb(0x9aa0a8)
}

pub fn text_muted() -> Rgba {
    rgb(0x6b7178)
}

pub fn accent() -> Rgba {
    // Zed's blue.
    rgb(0x3b8eea)
}

/// Status colors. These are the only saturated hues in the app, so a red
/// block is never decorative.
pub fn status_ok() -> Rgba {
    rgb(0x3fb950)
}

pub fn status_warn() -> Rgba {
    rgb(0xd29922)
}

pub fn status_error() -> Rgba {
    rgb(0xf85149)
}

pub fn status_idle() -> Rgba {
    rgb(0x6b7178)
}

pub fn status_done() -> Rgba {
    rgb(0x8b949e)
}

/// The status color for a ticket row.
pub fn ticket_status_color(status: &str) -> Rgba {
    match status {
        "done" => status_done(),
        "in_progress" => accent(),
        "blocked" | "failed" => status_error(),
        "pending" => status_warn(),
        _ => status_idle(),
    }
}

/// A faint wash of the status color, for row backgrounds.
pub fn status_wash(status: &str) -> Rgba {
    ticket_status_color(status).opacity(0.14)
}

/// A fainter wash, for panel headers and inline chips.
pub fn status_wash_faint(status: &str) -> Rgba {
    ticket_status_color(status).opacity(0.10)
}

pub const MONO: &str = "JetBrains Mono";
pub const SANS: &str = "Inter";
