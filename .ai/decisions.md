# 📑 Architectural Decision Log (ADR)
Date | Decision Record | Structural Rationale | Impacted Zones
2026-07-22 | Wave 3.8: Remove Supporters section from homepage | User explicitly requested removal of Supporters section | app/website/App.tsx
2026-07-22 | Wave 3.8: Replace Tutorial Step 8 with Cursor + Roo Code + 9router stack recommendation | User requested removing API configuration step and adding explicit recommendation for Roo Code in Cursor + 9router for free APIs | app/website/components/Tutorial.tsx, data/siteData.ts, i18n.tsx
2026-07-22 | Wave 3.8: Standardize API cards with hover/click expandability and unified categorization | User requested consistent provider details layout showing verification status, limits, free/payg models, signup method, card requirement, and mode/context mapping | app/website/components/ApiGrid.tsx, i18n.tsx
2026-07-21 | Wave 3.5: Redesign Sidebar to match Figma/Sketch layout (wider, text links, larger logo) | User wants wider sidebar with actual text navigation matching the sketch | app/website/components/Sidebar.tsx
2026-07-21 | Wave 3.5: Clean up Hero Section (remove section.hero-01.png, optimize responsiveness) | User clarified that section.hero-01.png was for familiarity, not live display | app/website/components/Hero.tsx
2026-07-21 | Wave 3.5: Reorder SuggestionForm directly below ApiGrid and add Persian/English callout text | User wants suggestion form below API section with specific self-fix tip | app/website/App.tsx, components/SuggestionForm.tsx
2026-07-21 | Wave 3: Sticky top header bar with Support Creator heart button opening crypto donation modal | User wants a prominent donation trigger at the top of the page | app/website/App.tsx
2026-07-21 | Wave 3: Two-column Hero layout with section.hero-01.png illustration and bg-hero.webp background | User wants high-fidelity Figma/sketch asset integration and background | app/website/components/Hero.tsx
2026-07-20 | Wave 2: ApiCard type expanded with signupMethod, cardRequired, creatorSuggested, manualVerified, freeModels, paygModels, contextWindow, bestModes; models field replaced by freeModels+paygModels | User wants granular API provider metadata for filtering and mode-mapping; data-driven via siteData.ts | app/website/data/siteData.ts, components/ApiGrid.tsx
2026-07-20 | Wave 2: Support Creator toggle (default ON, localStorage persisted) controls referral vs direct URL | User wants referral links opt-out capable; default supports creator | app/website/components/ApiGrid.tsx
2026-07-20 | Wave 2: tutorialData expanded to 8 steps covering 4-mode architecture (Boss/Chat/Code/Debug) | User wants comprehensive tutorial explaining each mode's role | app/website/data/siteData.ts, components/Tutorial.tsx
2026-07-20 | Website lives under app/website/; React+TS+Vite+Tailwind; data-driven via siteData.ts | Marketing site for Vibe Assembly product | app/website/
2026-07-20 | Boss auto-switches to Code Mode after blueprint | Reduce UX friction | .roomodes, .roorules
2026-07-20 | CLI interactive + optional Graphify; zero-dependency native readline | Stay free-tier-light | bin/cli.js
2026-07-20 | Relay + Ticket Contract; tickets in active_task.md only | Free-tier weak models need S-sized tickets | .ai/ticket_contract.md
2026-07-19 | First-party skill `scout` replaces `improve` | Remove shadcn/improve identity | .agents/skills/
2026-07-19 | Canonical package/bin `create-vibe-assembly` | Single install surface | package.json, bin/cli.js
2026-07-07 | V1 Factory Lock | File ownership splits, approval-gated deletion | Global Workspace
