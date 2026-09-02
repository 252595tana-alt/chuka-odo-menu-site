**Findings**
- No actionable P0/P1/P2 visual, interaction, or accessibility issue remains.
- The former `火力、鍋、技。` story scene and its navigation entry were removed; menu now crossfades directly into the order scene with a shorter scroll range.
- The former catalogue scene and its navigation entry were also removed. The experience now consists only of the opening/3D orbit scene and the final order scene.

**Source Truth**
- Legacy recording and requirements were used only to study motion timing and are not shipped with the site.
- Reference frame: `video-reference-frames/crops/ref-03-8.60s-screen.png`
- Final implementation capture: `qa-chinese-orbit-1280.png`
- Final combined comparison: `design-qa-chinese-final.jpg`
- Volumetric centerpiece comparison: `design-qa-steam-3d-final.jpg`
- Original paper texture: `public/assets/odo/paper-texture.jpg`
- Volumetric centerpiece: `public/assets/odo/steam-column.png`
- Continuous background film: `public/assets/odo/background.mp4`
- Original noren artwork: `public/assets/odo/noren.jpg`
- Original menu photography: five files under `public/assets/odo/`

**Visual Comparison**
- Composition: the final view keeps the recording's tall center object, five cards distributed in depth, and one dominant center-front card.
- Brand translation: the independent identity uses bottle green, ink black, warm ivory, coral, Mincho display type, an original text mark, and five generated food photographs with unbranded tableware.
- Chinese art direction: an original paper-and-lacquer water texture unifies the hero and order scenes without obscuring product photography or text.
- Background continuity: `paper-texture.jpg` remains a subtle fixed layer across every scroll phase, with translucent readability layers over the continuous film.
- Background film: the MP4 is fixed behind both scroll phases and plays muted, inline, automatically, and on a seamless loop; the paper artwork remains as its loading/error fallback.
- Opening composition: the foreground headline, description, CTA group, seal labels, and decorative kanji were removed so the supplied film carries the first view; the fixed header and scroll cue preserve navigation into the 3D menu.
- Noren introduction: the supplied curtain artwork covers the first viewport in two independently animated cloth panels. Subtle asynchronous perspective motion keeps it fluttering at rest; on scroll, the top edge stays fixed while the left hem lifts deeply and the right hem yields slightly, creating an asymmetric diagonal passage before the two-turn card orbit begins.
- Noren handoff timing: delayed cloth segments open through page progress `0.18`, hold fully open through `0.22`, exit from `0.22–0.26`, and only then start the card orbit. The next scene never advances while the curtain is partially open.
- Noren motion evidence: two closed-state frames taken 1.1 seconds apart differ by a full-frame RGB mean of `10.406 / 11.209 / 5.141`; the hem polygon, cloth perspective, and moving sheen all animate while scroll is stopped.
- Motion cues: a thin pale-jade orbit and three moving coral direction markers make the circular path legible; the center steam texture rises continuously while scroll is stopped.
- Centerpiece depth: the replacement fluid-simulation texture uses black-removing additive compositing across three intersecting planes, with a rotating 3D ember field and a tapered tube core. It changes silhouette and parallax as the scene rotates instead of reading as one flat image.
- Image quality: product aspect ratios are preserved, the food remains inspectable, and the active card receives a coral border and modest scale/lift emphasis.
- Responsive layout: desktop and 390x844 render five selectors with zero horizontal document overflow. On mobile, depth-aware center pull keeps the front card fully inside the viewport while side cards remain on the orbit.

**Interaction Evidence**
- Scroll maps to exactly two full rotations.
- All five menu buttons land their corresponding product at center-front.
- Desktop drag changed the active item from dumplings to aromatic soy noodles.
- Mobile swipe changed the active item from dumplings to prawns and jade greens.
- ArrowLeft/ArrowRight cycles the selected product.
- Hero order and menu CTAs are visible, enabled, and above the Canvas hit layer.
- Mobile navigation exposes the menu shortcut while the guidance CTA remains visible.
- Idle rotation uses 22 seconds on desktop and 28 seconds on mobile; hover slows it to 35%, drag stops it, and user input pauses it for 2.2 seconds.

**Fallback And Motion**
- WebGL fallback mode renders 5 real product images, 5 buttons, 0 canvases, and both hero CTAs.
- Reduced Motion mode keeps gyoza active and produced pixel-identical screenshots 1.1 seconds apart (`full_mean 0.0`).
- Normal motion with card auto-rotation paused produced clear 1-second steam differences (`top-steam mean 11.185`, `bottom-steam mean 8.049`).
- Browser console: no current errors or warnings.

**Automated Verification**
- Orbit math tests: 3 passed (two rotations, five front-angle mappings, 22s/28s periods).
- Sites packaging tests: 4 passed.
- Production build and Sites build preparation: passed.

final result: passed
