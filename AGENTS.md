# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build the experience in `src/` and keep the menu data in the top-level `products` definition until the prototype grows enough to justify a dedicated data module. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` working so the prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.

## Durable Visual Decisions

- Preserve the supplied recording's full-screen 3D orbit, scroll pacing, central rising energy, and layered project-to-project transitions.
- Keep this an independent fictional restaurant identity named `中華の王道`. Never use or ship third-party restaurant names, logos, official URLs, branded tableware, or official menu assets.
- Use the original bottle-green, ink, warm-ivory, pale-jade, and coral visual system. Avoid a dominant vermilion-and-gold palette or any close imitation of an existing restaurant brand.
- Preserve the five original food photographs and menu entries, then extend the top-level `products` data to nine original dishes plus a final `お店に行く` CTA panel. Do not invent or hard-code prices.
- Keep the opening copy, menu names, CTAs, navigation, and final guidance in semantic HTML outside the WebGL canvas.
- Keep the closed-noren wordmark minimal: show only `中華の王道`, without an English eyebrow, slogan badge, supporting copy, or custom cursor overlay.
- During the noren opening, reveal the moving background film through the center seam and keep every underlying paint fallback ink-dark so no white or pale fog-shaped polygon can flash before the video frame is ready.
- Use an intentional soft white mist across the full frame while the noren is parting, then fade that mist completely once the cloth has fully opened; the post-opening menu and film must remain clear.
- After the mist has cleared, begin an uncluttered interstitial over the background film with the centered `中華の王道` title, then reveal the founding and taste-confidence copy before the dragon and spiral menu appear on continued scrolling.
- Expand the post-mist interstitial into a scroll-led typography story: scattered glyphs assemble into `中華の王道`, followed by concise founding and taste-confidence copy, before the dragon and menu appear. Use the fictional founding year 1972 and keep all text within the independent restaurant identity.
- After the final taste-confidence line clears, give the golden dragon its own scroll-controlled entrance: it rises from below the viewport head-first until the full vertical sculpture is established, and only then may the spiral product panels begin to appear.
- Scale the closed-noren `中華の王道` wordmark to span most of the cloth width on desktop and mobile, matching the supplied oversized reference while keeping it centered across the split.
- Keep the final order sequence minimal and horizontally centered: first show only `今日の一皿を、心ゆくまで。` on one unbroken line, then move the centered `お店に行く` CTA to its own following scroll screen over the background film. Keep navigation, labels, explanatory copy, secondary actions, footer, decorative text, and the custom cursor hidden in both closing screens.
- Let the closing line finish and clear before the separate `お店に行く` CTA rises from below the viewport into its final centered position.
- Style the final `お店に行く` CTA as a restrained Chinese lacquer plaque: deep jade field, fine double gold frame, Mincho label, and a circular gold arrow detail. Preserve its centered placement, clear focus state, and large mobile tap target; do not introduce a dominant vermilion palette.
- Keep the final visit CTA's border box geometrically centered on both the horizontal and vertical viewport axes at rest, including mobile; responsive padding must not offset it from the center.
- Whenever the custom cursor is intentionally hidden, restore the native cursor. The final visit CTA must show a native pointer cursor on hover so the closing screens never leave mouse users without a visible pointer.
- On the closing line and final visit CTA screens, layer an original pointer-reactive ink-in-water graphic in imperial jade, celadon, and restrained amber-gold. Never use red or blood-like liquid color in this effect. Concentrate every bloom and pointer response in the lower portion of the viewport, leaving the upper half clean. Keep a quiet dark area behind the white copy and jade CTA, provide a matching non-WebGL fallback, and freeze the graphic when reduced motion is requested.
- Keep the persistent top navigation minimal: retain only the `中華の王道 / CHUKA NO ODO` home control and omit the redundant `料理を選ぶ`, menu toggle, and `お席のご案内` shortcuts.
- Default to the pan-seared dumplings. Drive panel rotation only from the page scroll position, support reduced motion, and never rotate the panels automatically while the experience is idle.
- Treat Active Theory as a benchmark for intensity and interaction quality, not as a visual template: retain the restaurant's independent identity, content, and palette.
- Use a short cinematic loader, subtle mouse-reactive lighting, restrained particle connections, oversized outline typography, and a minimal chapter HUD to make the experience feel alive before users interact.
- Keep the golden dragon and rotating dishes as the visual hierarchy's focal point; supporting overlays must remain low-contrast and non-blocking.
- Use `public/models/dragon-hunyuan-4view-gold.glb` as the golden dragon asset; it is the project copy of the user-selected four-view Hunyuan regeneration.
- Keep the golden dragon tall around the center axis. Let its ascent follow a restrained scroll-derived serpentine path with lateral and depth sway plus gentle roll and pitch; hold it front-facing through its solo entrance, then rotate it in the same direction, timing, and two-turn scroll phase as the ten-panel vertical spiral. Pointer movement, dragging, swiping, keyboard input, and idle time must not move either system directly, and reduced motion must keep the ascent straight.
- Present the menu as a deep helix around the dragon: one oversized, nearly centered photographic panel in front, several smaller panels receding to both sides and behind the dragon, with side panels turning nearly edge-on. Product photography—not menu-card chrome—must dominate every dish panel.
- End the spiral with a staged lift-and-dissolve: the final panel rises first, the dragon and clustered particles follow upward, the 3D stage clears, and only then may the closing `今日の一皿を、心ゆくまで。` CTA scene appear.
- Once that final panel and 3D stage have fully cleared, bring the one-line `今日の一皿を、心ゆくまで。` message upward from below the viewport before the separate visit CTA screen.
- Reveal `今日の一皿を、心ゆくまで。` with a per-character BLUR entrance: each glyph resolves from 20px blur, zero opacity, and wide tracking into the established tight Mincho setting, staggered left-to-right by 45ms. Replay the entrance when the order screen is re-entered, and show the complete unblurred line immediately for Reduced Motion.
- Frame the dragon as an intentionally oversized vertical sculpture whose head and tail extend beyond the viewport; show only a few large panels at once and let the remaining panels fall away into deep spiral space.
- After the noren opens, divide the menu journey into five dragon sections—head, upper body, center, lower body, and tail—mapped to two panels each while the dragon turns with the panels. Derive the dragon's target height and vertical travel from the ten-panel spiral so their lengths remain visually coordinated.
- On mobile and reduced-motion settings, lower particle density, remove the custom cursor, and stop nonessential ambient animation while preserving the full menu flow.
