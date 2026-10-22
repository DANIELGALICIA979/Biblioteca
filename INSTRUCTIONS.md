---
description: "Use when creating or adjusting frontend screens, page backgrounds, headers, footers, cards, or viewport centering. Keep full-screen backgrounds, top-aligned headers, and centered content consistent and responsive."
applyTo: "**/frontend/src/**/*.{jsx,tsx,css}"
---

# Frontend screen layout

- Let the page background span the full viewport width. Do not constrain the page root to a fixed width; constrain and center the content panel separately.
- Keep headers near the top and footers at the bottom without letting either one push the main panel away from the requested position.
- When a panel must be centered in the screen, center it relative to the viewport, not just the leftover space between a header and footer.
- Avoid stacking `min-height: 100vh` or `100svh` on nested page and main containers; this can make the document taller than the viewport. Give one layout container responsibility for viewport sizing.
- Preserve the panel's existing dimensions and visual design unless the request asks to change them.
- On short or narrow screens, keep all content reachable: allow page or main-area scrolling rather than clipping controls or forcing the panel off-screen.
- Reuse the project's existing styling conventions and keep page-specific layout rules scoped to that page.
- When browser preview tools are available, verify the rendered layout at desktop and small viewport sizes. Check that the page does not gain unintended vertical overflow and that the panel's center matches the requested reference.
