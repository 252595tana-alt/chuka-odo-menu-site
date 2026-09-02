# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build the experience in `src/` and keep the menu data in the top-level `products` definition until the prototype grows enough to justify a dedicated data module. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` working so the prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.

## Durable Visual Decisions

- Preserve the supplied recording's full-screen 3D orbit, scroll pacing, central rising energy, and layered project-to-project transitions.
- Keep this an independent fictional restaurant identity named `中華の王道`. Never use or ship third-party restaurant names, logos, official URLs, branded tableware, or official menu assets.
- Use the original bottle-green, ink, warm-ivory, pale-jade, and coral visual system. Avoid a dominant vermilion-and-gold palette or any close imitation of an existing restaurant brand.
- Use the five original generated food photographs under `public/assets/odo/` and keep their menu names and descriptions in the top-level `products` data. Do not invent or hard-code prices.
- Keep the opening copy, menu names, CTAs, navigation, and final guidance in semantic HTML outside the WebGL canvas.
- Default to the pan-seared dumplings. Support scroll rotation, pointer drag, touch swipe, keyboard arrows, idle auto-rotation, and reduced motion.
