# Design QA: Dragon chapter transition

## Comparison target

- Source visual truth paths:
  - `C:\Users\syota\AppData\Local\Temp\codex-clipboard-f57f5718-9247-495e-bdb6-6286f32b37c5.png` — head chapter, 817 × 325 px.
  - `C:\Users\syota\AppData\Local\Temp\codex-clipboard-7ce4182d-402b-4139-a076-eee1efc6f4db.png` — torso chapter, 650 × 352 px.
  - `C:\Users\syota\AppData\Local\Temp\codex-clipboard-1bc59d81-0eb5-49d3-b36f-ad5b6e91e40d.png` — tail chapter, 543 × 307 px.
- Implementation screenshot paths:
  - `qa/dragon-head.png`
  - `qa/dragon-body.png`
  - `qa/dragon-tail.png`
  - `qa/dragon-body-mobile.png`
  - `qa/dragon-body-reduced.png`
  - `qa/webgl-fallback-mobile.png`
- Desktop viewport and implementation pixels: 1280 × 720 CSS px and 1280 × 720 screenshot pixels.
- Mobile viewport and implementation pixels: 390 × 844 CSS px and 390 × 844 screenshot pixels.
- Density normalization: implementation captures are 1 CSS pixel per screenshot pixel. The supplied sources are differently cropped reference regions, so comparison uses matching head/body/tail content regions rather than false full-frame pixel alignment.
- State: noren opened; scroll positions 1820 px (head), 2320 px (body), and 2820 px (tail) in the 1280 × 720 desktop viewport.

## Evidence

### Full-view comparison

- The implementation keeps the established restaurant frame, navigation, menu grid, active-detail panel, background photography, and ten-panel spiral unchanged.
- Across the three captures, the dragon remains the central vertical axis while the visible menu cards rotate from opening dishes through the final CTA.
- The source files are focused crops rather than complete page frames; therefore full-view evidence is used to verify continuity and hierarchy, while dragon anatomy placement is judged in focused comparisons.

### Focused region comparison

- Head: `qa/dragon-head.png` places the horns and face at the upper center with the crown intentionally cropped, matching the source's oversized head framing.
- Body: `qa/dragon-body.png` centers the scaled torso and claws between the two front cards, matching the source's mid-dragon composition.
- Tail: `qa/dragon-tail.png` moves the lower coil and tail into the center-to-lower region while the upper body leaves the frame, matching the source's downward visual progression.
- Mobile: `qa/dragon-body-mobile.png` enlarges only the dragon so the tall viewport still crops the sculpture by chapter without inflating menu cards.
- Reduced Motion: `qa/dragon-body-reduced.png` keeps the same chapter flow with a discrete 0 / 0.5 / 1 framing step and zero spiral rotation.

## Required fidelity surfaces

- Fonts and typography: existing Japanese display/body hierarchy, weights, line height, letter spacing, wrapping, and small HUD labels remain unchanged and readable at both tested viewports.
- Spacing and layout rhythm: source-inspired card overlap, central dragon axis, deep spiral spacing, fixed navigation, and bottom menu rhythm remain intact. No clipping hides persistent controls.
- Colors and visual tokens: bottle green, ink, ivory, jade, coral, and the gold dragon remain unchanged; chapter motion introduces no token drift.
- Image quality and asset fidelity: the existing real GLB dragon and food photography are preserved with no placeholder, CSS-art, or SVG substitution. Cropping is intentional and follows the supplied chapter references.
- Copy and content: all nine dish names and the final `お店に行く` CTA remain intact. No prompt or implementation text leaks into the UI.
- Responsiveness and accessibility: desktop and 390 × 844 mobile layouts are usable; Reduced Motion avoids continuous dragon panning; the WebGL fallback exposes ten semantic buttons including the CTA.

## Comparison history

1. Initial desktop tail pass — P2: the tail stayed below the visual center, so the final chapter still read mainly as torso. Fix: increased the desktop tail framing endpoint from 1.55 to 2.75 world units. Post-fix evidence: `qa/dragon-tail.png`.
2. Initial mobile body pass — P2: the taller mobile viewport revealed too much of the sculpture at once, weakening the three-chapter effect. Fix: increased only the compact dragon group scale from 0.95 to 1.28 and retuned compact head/tail endpoints to -1.8 / 2.4. Post-fix evidence: `qa/dragon-body-mobile.png`.
3. Final comparison — no actionable P0, P1, or P2 differences remain for the requested head-to-tail transition.
4. Noren follow-up — P2: the opening wordmark included an English eyebrow, a slogan badge, and a cursor overlay although the user's correction specifies the restaurant name alone. Fix: reduced each mirrored wordmark to a single `中華の王道` heading and suppressed the custom cursor while the noren is closed. Post-fix evidence: `qa/noren-name-only.png`.
5. Closing-scene follow-up — P2: the closing screen still included the brand badge, bilingual eyebrow, supporting copy, two actions, persistent navigation/HUD/footer, decorative lettering, and custom cursor although the user's correction specifies the closing line alone. Fix: reduced the scene to one heading and suppressed all surrounding interface chrome in the order state. Post-fix evidence: `qa/final-line-only.png`.
6. Final-CTA follow-up — P1: the closing scene did not yet provide the newly requested `お店に行く` conversion action. Fix: added one prominent gold pill CTA beneath the heading, linked to a new-tab Google Maps search for `中華の王道`, while preserving the otherwise minimal scene. Post-fix evidence: `qa/final-line-cta.png`.
7. Initial mobile CTA pass — P2: the first mobile capture wrapped the heading across three lines, weakening the intended two-line composition. Fix: reduced the compact heading scale from `13.5vw` to `12.5vw`. Post-fix evidence: `qa/final-line-cta-mobile.png`.
8. Persistent-navigation follow-up — P2: the header still exposed the redundant `料理を選ぶ` and `お席のご案内` shortcuts identified in the supplied crop; removing only their labels would also have left an empty mobile-menu control. Fix: removed both shortcuts, the empty menu trigger, its state/effect code, and simplified the header grid to one brand control. Post-fix evidence: `qa/top-nav-minimal-focus.png` and `qa/top-nav-minimal-mobile.png`.
9. Dragon-asset follow-up — P1: the centerpiece still referenced the earlier `golden-dragon.glb` instead of the user-selected Hunyuan four-view regeneration. Fix: copied the exact supplied binary to `public/models/dragon-hunyuan-4view-gold.glb`, updated the runtime reference, and preserved the existing front-facing oversized normalization and head/body/tail framing. Post-fix evidence: `qa/dragon-hunyuan-menu.png`, `qa/dragon-hunyuan-body.png`, `qa/dragon-hunyuan-tail.png`, and `qa/dragon-hunyuan-mobile.png`.
10. Five-section alignment follow-up — P1: the dragon still advanced through only three framing stops and its normalized height was a fixed magic number, so it could not stay structurally aligned with all ten panels. Fix: introduced five named sections (`head`, `upper-body`, `mid-body`, `lower-body`, `tail`), mapped two panels to each section, eased the four transitions between them, and derived the dragon's 9.0-world-unit target height plus vertical travel from the ten-panel spiral. Post-fix evidence: `qa/dragon-5part-01-head.png` through `qa/dragon-5part-05-tail.png` and `qa/dragon-5part-mobile.png`.
11. Idle-motion follow-up — P1: the spiral continued advancing through an elapsed-time offset after user input stopped, contradicting the requested stationary idle state. Fix: removed the desktop/mobile auto-period constants, elapsed-time orbit offset, hover-speed branch, and idle timers. Post-fix evidence: `qa/panels-idle-still.png`.
12. Scroll-only follow-up — P1: pointer drag, touch swipe, pointer-position tilt, and arrow-key navigation could still change the spiral outside ordinary page scrolling. Fix: removed every direct canvas gesture and keyboard rotation path, removed drag cursor affordances and inertia state, and made `getSpiralRotation(pageProgress)` the sole live rotation target. Post-fix evidence: `qa/panels-scroll-only.png`.
13. Full-width noren wordmark follow-up — P2: the closed-noren title occupied only about four tenths of the cloth width, while the supplied crop uses an oversized title spanning roughly two thirds of the split curtain. First fix: increased the title to 209.92 px, which overshot the reference by about 12% and sat slightly high. Final fix: tuned the desktop title to 186.88 px / 175.67 px line height at 21.5% from the top, producing an 850.31 px DOM width whose normalized 483.6 × 99.9 px text box matches the supplied crop's approximately 479 × 99 px box. Post-fix evidence: `qa/noren-wordmark-full-width.png`, `qa/noren-wordmark-full-width-mobile.png`, and the normalized side-by-side `qa/noren-wordmark-comparison.png`.
14. One-line closing-heading follow-up — P2: the final heading contained a hard `<br>` and therefore always rendered on two lines, contradicting the user's explicit one-line correction. Fix: removed the forced break, made the heading non-wrapping, and retuned it to 6.7vw on desktop and 7.4vw on mobile. Post-fix evidence: `qa/final-line-one-row.png` and `qa/final-line-one-row-mobile.png`.

## Noren-only follow-up comparison

- Source visual truth: `C:\Users\syota\AppData\Local\Temp\codex-clipboard-6ca090a5-4a4b-439a-b625-5da84d4d89bd.png`, 932 × 436 px, with the user's explicit correction that only `中華の王道` should remain.
- Implementation evidence: `qa/noren-name-only.png`, 1280 × 720 screenshot at a 1280 × 720 desktop viewport and 1 CSS px per screenshot pixel.
- State: page top, closed noren, pointer centered over the title area.
- Full-view evidence: the corrected screen preserves the supplied cloth texture, seam, rail, landscape embroidery, centered Mincho wordmark, and warm-ivory color while removing every secondary label.
- Focused comparison: the wordmark contains one child and the visible copy is exactly `中華の王道`; the custom pointer opacity is zero while the noren is closed.
- Required fidelity surfaces: title typography and scale are preserved; spacing is simplified without shifting the hero hierarchy; colors and noren imagery are unchanged; no assets were substituted; copy now matches the user's correction exactly.
- Console errors checked: none.

## Closing-line and CTA follow-up comparison

- Source visual truth: `C:\Users\syota\AppData\Local\Temp\codex-clipboard-01b37ad8-9b7c-4c79-8fb7-bf8c16fffcfc.png`, 1164 × 671 px, with the user's current correction that the closing scene should contain `今日の一皿を、心ゆくまで。` and one final `お店に行く` CTA.
- Implementation evidence: `qa/final-line-cta.png`, 1280 × 720 screenshot at a 1280 × 720 desktop viewport, plus `qa/final-line-cta-mobile.png`, 375 × 844 screenshot at a 390 × 844 CSS viewport. Captures use device density 1.
- State: maximum scroll position, order scene active, pointer centered over the page.
- Full-view evidence: the implementation preserves the darkened moving restaurant-film background and the reference's large two-line Mincho composition, then adds only the requested primary CTA while continuing to suppress brand, explanatory, navigation, HUD, progress, footer, decorative, and cursor layers.
- Focused comparison: the order section contains exactly two children: the heading and CTA. The CTA label is exactly `お店に行く`, uses the established gold token, and includes the existing icon-library arrow rather than a fabricated asset. The decorative pseudo-element has no content.
- Required fidelity surfaces: Japanese display typography, ivory color, two-line wrap, left alignment, and generous negative space remain aligned with the reference; the gold CTA has sufficient contrast and a visible focus treatment; no image or video asset was substituted; copy matches the user's request exactly.
- Interaction evidence: the CTA is a semantic link to `https://www.google.com/maps/search/?api=1&query=中華の王道`, opens in a new tab, and is keyboard focusable.
- Runtime evidence: the background video remains playing; the CTA is visible at 210 × 58 CSS px on desktop; all suppressed interface elements remain hidden.
- Responsive evidence: at 390 × 844 CSS px the heading retains its intended two-line wrap, the 280 × 54 CSS px CTA fits without horizontal overflow, the background video remains playing, and persistent navigation remains hidden.
- Console errors checked: none.

## Minimal top-navigation follow-up comparison

- Source visual truth: `C:\Users\syota\AppData\Local\Temp\codex-clipboard-e3b0ed55-03c6-4f57-b8f0-e0ab69bd1835.png`, 273 × 59 px, with the user's explicit correction that both visible shortcuts are unnecessary.
- Implementation evidence: `qa/top-nav-minimal-focus.png`, a 1265 × 100 px focused header capture from a 1280 × 720 CSS viewport at density 1; responsive evidence: `qa/top-nav-minimal-mobile.png`, a 375 × 844 px capture from a 390 × 844 CSS viewport at density 1.
- State: menu scene at approximately 1890 px scroll, persistent header visible.
- Full-view evidence: `qa/top-nav-minimal.png` preserves the film, dragon, spiral cards, selector, active detail, and footer while changing only the persistent header controls.
- Focused comparison: the header now contains exactly one child, the existing `中華の王道 / CHUKA NO ODO` home button. `料理を選ぶ`, `お席のご案内`, the menu toggle, and the empty menu container are absent from the DOM.
- Required fidelity surfaces: brand typography, warm-ivory and jade colors, top padding, rule, transparent film treatment, and source assets remain unchanged; removing the shortcuts adds intentional negative space without changing the header height or page composition; copy matches the correction exactly.
- Responsive evidence: the 390 × 844 layout retains the single home control, has no empty menu trigger, and reports no horizontal overflow.
- Console errors checked: none; only Vite development and React DevTools informational messages were present.

## Selected Hunyuan dragon follow-up

- Source asset truth: `C:\Users\syota\Documents\Codex\2026-09-03\dragon-3d-regeneration\outputs\dragon-hunyuan-4view-gold.glb`, 6,798,664 bytes, SHA-256 `B68F47254451D23ECD4451C1CC77D0D91FDA9A066A95DD62EAD6EC7962EF557D`.
- Project asset: `public/models/dragon-hunyuan-4view-gold.glb`, with an identical byte length and SHA-256 hash.
- Browser-rendered evidence: `qa/dragon-hunyuan-menu.png` (head), `qa/dragon-hunyuan-body.png` (body), `qa/dragon-hunyuan-tail.png` (tail), and `qa/dragon-hunyuan-mobile.png`; desktop captures use a 1280 × 720 CSS viewport and the mobile capture uses 390 × 844 CSS px, all at density 1.
- Runtime evidence: the WebGL canvas reports `dragonAsset: dragon-hunyuan-4view-gold.glb` and `dragonStatus: ready`; chapter checkpoints report head at track `0.000`, body at `0.500`, and tail at `1.000`.
- Required fidelity surfaces: the user-selected mesh and baked materials render without substitution; the existing gold/ink palette, center-axis placement, vertical crop, panel depth, copy, typography, and film background remain intact; the mobile layout has no horizontal overflow.
- Console errors checked: none.

## Five-section dragon alignment follow-up

- Implementation evidence: `qa/dragon-5part-01-head.png`, `qa/dragon-5part-02-upper-body.png`, `qa/dragon-5part-03-mid-body.png`, `qa/dragon-5part-04-lower-body.png`, and `qa/dragon-5part-05-tail.png`, captured at 1280 × 720 CSS px and density 1; responsive evidence: `qa/dragon-5part-mobile.png` at 390 × 844 CSS px and density 1.
- State mapping: panels 1–2 use section 1 / track `0.000`; panels 3–4 use section 2 / `0.250`; panels 5–6 use section 3 / `0.500`; panels 7–8 use section 4 / `0.750`; panels 9–10 use section 5 / `1.000`.
- Runtime evidence: every capture reports `dragonSectionCount: 5`, `panelsPerDragonSection: 2.0`, `dragonTargetHeight: 9.0`, and `dragonStatus: ready`; each tested active panel matches its expected section.
- Required fidelity surfaces: the selected Hunyuan mesh, gold/ink material treatment, center-axis placement, oversized crop, panel typography, food photography, film background, and existing palette remain intact. The dragon length now equals ten panel pitches, and the five evenly spaced vertical framing stops create a consistent rhythm across the spiral.
- Responsive and motion evidence: the 390 × 844 mid-body state fits without horizontal overflow; Reduced Motion resolves directly to the five discrete 0 / 0.25 / 0.5 / 0.75 / 1 positions instead of animating between them.
- Console errors checked: none.

## Stationary-idle panel follow-up

- Implementation evidence: `qa/panels-idle-still.png`, captured at a 1280 × 720 CSS viewport and density 1 in the mid-body menu state.
- Idle evidence: after settling, the panel target and rendered rotation both remained exactly `-6.2830` across a 4.2-second wait; active panel index remained `5`, and the canvas reports `idleRotation: disabled`.
- Interaction evidence: one controlled scroll changed target/rendered rotation from `-6.2830` to `-8.7955` and active panel index from `5` to `7`; scrolling back restored the prior state. Scroll-driven movement remains functional while unattended rotation is absent.
- Required fidelity surfaces: removing idle motion changes no fonts, spacing, color tokens, image assets, copy, panel depth, dragon framing, or background-film playback. The still state preserves the same composition without visual drift.
- Console errors checked: none.

## Scroll-only panel follow-up

- Implementation evidence: `qa/panels-scroll-only.png`, captured at a 1280 × 720 CSS viewport and density 1 in the menu state.
- Input contract: the WebGL canvas reports `rotationInput: scroll-only` and `idleRotation: disabled`; the runtime has no pointer-down, pointer-move, pointer-up, pointer-cancel, swipe-inertia, or arrow-key panel controls.
- Interaction evidence: an attempted horizontal drag and an `ArrowRight` keypress leave scroll position, spiral target, rendered rotation, and active panel unchanged. A controlled vertical page scroll changes the spiral target and active panel as expected.
- Required fidelity surfaces: the input simplification changes no fonts, spacing, color tokens, assets, copy, panel depth, dragon framing, background-video playback, Reduced Motion behavior, or semantic menu navigation.
- Console errors checked: none.

## Full-width noren wordmark follow-up

- Source visual truth: `C:\Users\syota\AppData\Local\Temp\codex-clipboard-7d507736-ce0d-41fc-bc25-25101d308798.png`, 729 × 233 px, showing the single `中華の王道` title centered across the curtain split and occupying roughly two thirds of the crop width.
- Implementation evidence: `qa/noren-wordmark-full-width.png`, 1265 × 712 screenshot pixels from a 1280 × 720 CSS viewport at density 1; responsive evidence: `qa/noren-wordmark-full-width-mobile.png`, 375 × 812 screenshot pixels from a 390 × 844 CSS viewport at density 1.
- Normalized comparison: `qa/noren-wordmark-comparison.png`, 1456 × 233 px, places the 728 × 233 normalized source beside the implementation's 1280 × 410 upper-curtain crop downsampled to 728 × 233. Both title boxes resolve to approximately 480 × 100 px and share the same visual center over their curtain seam.
- State: page top with the noren closed after the loader completes. The title is duplicated only for mirrored clipping inside the two animated cloth halves; its visible text remains exactly one centered `中華の王道`.
- Full-view evidence: the title now reads as the dominant opening gesture while the rail, cloth texture, split seam, cloud and landscape embroidery, and opening animation remain intact.
- Focused-region evidence: the source text bounds are approximately 479 × 99 px; the normalized implementation DOM bounds are approximately 483.6 × 99.9 px. The final pass corrects the first pass's oversized width and high vertical position.
- Required fidelity surfaces: the existing Mincho family, warm-ivory color, reduced optical weight, tight tracking, cloth photography, and exact copy are preserved; only wordmark scale, line height, width allowance, and vertical position changed.
- Responsive evidence: at 390 × 844 CSS px the title renders at 68.64 px, spans 312.31 px without wrapping, remains centered across the split, and introduces no horizontal overflow.
- Console errors checked after a clean reload and viewport switch: none.

## One-line closing-heading follow-up

- Source visual context: `C:\Users\syota\AppData\Local\Temp\codex-clipboard-a1fc3118-afae-4f90-a6ec-a431bd65ff82.png`, 918 × 359 px, showing the previous unwanted two-line heading; the user's explicit visual correction is to keep the complete phrase on one line.
- Implementation evidence: `qa/final-line-one-row.png`, 1265 × 712 screenshot pixels from a 1280 × 720 CSS viewport at density 1; responsive evidence: `qa/final-line-one-row-mobile.png`, 375 × 812 screenshot pixels from a 390 × 844 CSS viewport at density 1.
- State: maximum scroll position with the order scene active, background film playing, surrounding chrome suppressed, and the visit CTA visible.
- Full-view evidence: the complete `今日の一皿を、心ゆくまで。` phrase now forms one uninterrupted horizontal line above the CTA while preserving the scene's left alignment and cinematic negative space.
- Focused-region evidence: the heading contains zero child elements and computes to `white-space: nowrap`; it measures 1020.13 × 80.61 CSS px at 85.76 px type on desktop and 343.30 × 28.28 CSS px at 28.86 px type on mobile.
- Required fidelity surfaces: the Mincho family, warm-ivory color, optical weight, tight tracking, background video, exact copy, and CTA treatment remain unchanged. Only the forced line break, responsive type scale, and maximum-width constraint changed.
- Responsive evidence: both tested viewports keep the phrase on one line without document-level horizontal overflow; the mobile CTA remains fully visible below the heading.
- Console errors checked: none.

## Findings

- No actionable P0, P1, or P2 findings remain.

## Open questions

- None.

## Implementation checklist

- [x] Five-section head-to-tail framing mapped to two panels per section.
- [x] Gradual eased transitions between chapter holds.
- [x] Dragon stays front-facing for its solo entrance, then shares the panels' scroll-only rotation phase.
- [x] Desktop and mobile visual verification.
- [x] Reduced Motion discrete chapter behavior.
- [x] WebGL fallback with nine dishes and final CTA.
- [x] Persistent navigation reduced to the brand home control only.
- [x] User-selected Hunyuan four-view gold dragon loaded across desktop and mobile chapter states.
- [x] Dragon height and vertical travel derived from the ten-panel spiral.
- [x] Spiral panels remain stationary while idle and rotate only from page scrolling.
- [x] Closed-noren wordmark fills the supplied reference proportion on desktop and mobile.
- [x] Final order heading remains on one uninterrupted line on desktop and mobile.
- [x] Console warning/error check.

## Follow-up polish

- No P3 follow-up is required for this request.

## Deep-helix and exit-transition follow-up

- Source visual truth: the nine user-supplied Active Theory sequence captures, from `C:\Users\syota\AppData\Local\Temp\codex-clipboard-01f4d296-1447-4a0b-85cd-330f6fc32d1a.png` through `C:\Users\syota\AppData\Local\Temp\codex-clipboard-fc209b41-51d0-4d2f-93de-05577ee1ada2.png`, plus the explicit direction to center the supplied dragon and show product photography on the panels.
- Implementation evidence: `qa/deep-helix-mid-final.png`, `qa/deep-helix-cta-final.png`, `qa/deep-helix-exit-start-final.png`, `qa/deep-helix-exit-late-final.png`, and `qa/deep-helix-order-final.png`, captured from a 1280 × 720 CSS viewport at density 1; responsive evidence: `qa/dragon-selected-mobile.png`, captured from a 390 × 844 CSS viewport. Desktop screenshot pixels are 1265 × 712 and mobile screenshot pixels are 375 × 812 because the in-app browser excludes its scrollbar/chrome gutters.
- Combined comparisons: `qa/deep-helix-comparison-mid.png`, `qa/deep-helix-comparison-cta.png`, and `qa/deep-helix-comparison-exit.png` place the reference and implementation together on a 1920 × 580 px comparison board, each contained inside an equal 940 × 540 px slot without cropping.
- State sequence: an oversized, near-centered foreground panel anchors seven visible desktop panels; smaller panels recede to both sides and turn nearly edge-on; the selected dragon remains on the center axis; the final panel rises first; the dragon, particles, and remaining panels clear upward; the closing CTA appears only after the 3D stage is gone.
- Full-view evidence: the reference and implementation share the same foreground/side/back hierarchy, deep Z-spacing, vertical centerpiece, photographic panel surfaces, dark cinematic field, and upward-clearing exit. The implementation intentionally retains the restaurant's jade, gold, coral, Japanese Mincho typography, real food imagery, and existing semantic controls instead of copying the benchmark's branding.
- Focused-region evidence: `qa/dragon-selected-final.png` verifies the final center axis and panel scale; `qa/dragon-selected-mobile.png` verifies the dragon remains visibly centered above and below the active product panel with five panels in the compact helix; `qa/deep-helix-order-final.png` verifies the final screen contains only the one-line closing heading and `お店に行く` CTA over the playing film.
- Required fidelity surfaces: display and control typography stay consistent with the established restaurant identity; active/side/back spacing now follows the benchmark's depth rhythm; jade/gold/coral tokens retain contrast over the film; nine supplied food images are full-bleed and correctly cropped; the final CTA copy and closing line are unchanged and exact.
- Selected asset verification: source `C:\Users\syota\Documents\Codex\2026-09-03\dragon-3d-regeneration\outputs\dragon-hunyuan-4view-gold.glb` and project `public/models/dragon-hunyuan-4view-gold.glb` are both 6,798,664 bytes with SHA-256 `B68F47254451D23ECD4451C1CC77D0D91FDA9A066A95DD62EAD6EC7962EF557D`. Runtime reports `dragonAsset: dragon-hunyuan-4view-gold.glb` and `dragonStatus: ready` on desktop, mobile, and Reduced Motion.
- Interaction and fallback evidence: scroll checkpoints advance panels 5 → 9 → 10, exit progress 0 → 0.122 → 0.782 → 1, then switch to the order scene. A 2.4-second idle check leaves target, rendered rotation, and active index unchanged. Reduced Motion holds target and rotation at `0.0000`. `?fallback=1` renders ten semantic panels with nine product images and no WebGL canvas.
- Comparison history: the first follow-up was blocked because browser capture was temporarily rejected. After browser access returned, the first rendered pass showed the selected dragon was too easily obscured by the foreground panel. The model was moved into the visual center render layer, its gold response was lifted, panel translucency was increased, and active-panel scale was reduced. Post-fix evidence is `qa/dragon-selected-final.png` and `qa/dragon-selected-mobile.png`; no actionable P0, P1, or P2 mismatch remains.
- Console and runtime: no browser warning or error is present; only Vite connection and React development informational logs appear. Background video remains playing through every checkpoint. Sixteen automated tests pass and the production build succeeds.

## Centered closing-heading follow-up

- Source visual truth: `C:\Users\syota\AppData\Local\Temp\codex-clipboard-6d4a241b-acca-4116-89b1-f5fc224b0db9.png`, with the explicit instruction to center the closing line.
- Implementation evidence: `qa/final-centered.png`, captured from a 1280 × 720 CSS viewport at density 1; responsive evidence: `qa/final-centered-mobile.png`, captured from a 390 × 844 CSS viewport at density 1.
- Combined comparison: `qa/final-centered-comparison.png` places the source crop and normalized implementation heading crop together without changing their aspect ratios.
- Full-view evidence: the one-line heading and CTA now form one horizontally centered stack over the background film with balanced negative space on both sides.
- Focused-region evidence: at desktop, the stage, heading, and CTA all resolve to x-center `632.5` CSS px. At mobile, their centers resolve to `187.5`, `187.5078`, and `187.5` CSS px respectively. The small offsets from nominal viewport centers are only the in-app browser's excluded scrollbar gutter.
- Required fidelity surfaces: the existing Mincho family, weight, warm-ivory color, one-line copy, responsive type scaling, gold CTA, and background film are unchanged. Only horizontal alignment and text alignment changed.
- Responsive and runtime evidence: both viewports retain `white-space: nowrap`, introduce no horizontal overflow, and keep the CTA fully visible below the heading.
- Findings: no actionable P0, P1, or P2 mismatch remains.

## Separate visit-CTA screen follow-up

- Source visual truth: `C:\Users\syota\AppData\Local\Temp\codex-clipboard-c9035393-d3ff-4aef-8073-0bcbadb6a53d.png`, 293 × 107 px, with the explicit instruction to place this CTA on the next page.
- Implementation evidence: `qa/closing-heading-page-final.png` and `qa/visit-cta-page.png`, captured from a 1280 × 720 CSS viewport at density 1; responsive evidence: `qa/visit-cta-page-mobile.png`, captured from a 390 × 844 CSS viewport.
- Combined focused comparison: `qa/visit-cta-page-comparison.png` places the source CTA crop and the implementation CTA crop together at equal scale without changing their aspect ratios.
- Full-view evidence: the first closing screen now contains only the centered `今日の一皿を、心ゆくまで。` heading. Continuing to the final scroll screen removes the heading and presents only the centered `お店に行く` CTA over the same playing film.
- Focused-region evidence: the CTA retains the source's warm-gold pill, left-aligned Japanese label, right arrow, horizontal padding, and centered page placement. Desktop and mobile both resolve to phase `visit`, visit opacity `1`, and order opacity `0` at the final scroll position.
- Required fidelity surfaces: heading and CTA typography, spacing, color tokens, background-film image quality, and exact copy are unchanged. The change is limited to separating the two elements into consecutive full-screen states.
- Responsive and runtime evidence: the heading-only and CTA-only states have no horizontal overflow at 1280 × 720 or 390 × 844; the background video remains playing; the CTA remains keyboard focusable and links to the existing map search.
- Comparison history: the first browser pass exposed a P2 timing mismatch—the HTML stage had reached full opacity while the impact layer still held the heading at partial opacity. The impact entrance timing was synchronized to the new heading stage, then recaptured in `qa/closing-heading-page-final.png`. No actionable P0, P1, or P2 mismatch remains.

## Noren opening backdrop follow-up

- Source defect evidence: `C:\Users\syota\AppData\Local\Temp\codex-clipboard-ced6a41c-9550-4d61-ad48-ea304110e77f.png`, showing the light gray-green page base exposed as a fog-shaped polygon through the opening seam before the film frame paints.
- Implementation evidence: `qa/noren-opening-dark-reveal.png`, captured at the partially opened desktop state from a 1280 × 720 CSS viewport; responsive evidence: `qa/noren-opening-dark-reveal-mobile.png`, captured from a 390 × 844 CSS viewport at the same normalized scroll progress.
- Full-view evidence: the opening retains the same split geometry, oversized one-line `中華の王道` wordmark, cloth texture, and moving film reveal, while the center seam no longer exposes the pale page-base polygon independently of the intended full-frame atmosphere.
- Runtime evidence: root, body, and experience now all compute to `rgb(6, 17, 14)`; the background film reports ready state 4 and remains playing in both viewports; mobile introduces no positive horizontal overflow.
- Fallback rationale: the ink-dark paint color is applied beneath the film at root, body, and experience levels, so delayed first-frame decode, tab restoration, or compositor repaint cannot reveal the former `rgb(223, 232, 226)` base through the clipped noren opening.
- Findings: no actionable P0, P1, or P2 mismatch remains.

## Noren mist-clear transition follow-up

- Source visual truth: `C:\Users\syota\AppData\Local\Temp\codex-clipboard-44fb7fc4-b101-4ca8-8867-d0744a8c8273.png`, with the explicit direction that the visible white mist remains while the noren is parting and clears only when it is fully open.
- Implementation evidence: `qa/noren-mist-parting.png` and `qa/noren-mist-cleared.png`, captured from a 1280 × 720 CSS viewport; responsive evidence: `qa/noren-mist-parting-mobile.png` and `qa/noren-mist-cleared-mobile.png`, captured from a 390 × 844 CSS viewport.
- State sequence: the closed cloth starts clear, the first scroll quickly raises a full-frame soft white mist, the mist holds at `0.76` through the main cloth-parting motion, then fades continuously to `0` across the final opening interval and stays absent from the menu.
- Full-view evidence: the mist softens the cloth, wordmark, and opening seam together rather than recreating the former isolated polygon; after the gate opens, the background film returns to its original contrast without a hard scene cut.
- Runtime evidence: at normalized progress `0.125` the mist computes to opacity `0.76`; at the fully open desktop state the mist and gate both compute to opacity `0`; the background film remains playing with ready state 4 before and after the transition.
- Responsive and motion evidence: both viewports avoid positive horizontal overflow. The effect is driven by scroll progress, not a timer; Reduced Motion retains the same user-controlled reveal and disables extra ambient cloth animation.
- Findings: no actionable P0, P1, or P2 mismatch remains.

## Post-mist typography story follow-up

- Source visual truth: the sequential typography references `C:\Users\syota\AppData\Local\Temp\codex-clipboard-7a39ff3d-c7f4-41ed-9aa1-3a3cfb1a421c.png`, `C:\Users\syota\AppData\Local\Temp\codex-clipboard-d424d1e1-9dd6-4db9-9243-402e92e7861b.png`, `C:\Users\syota\AppData\Local\Temp\codex-clipboard-71516c7b-e1e1-4f1c-a174-0bc8dbb0ce6e.png`, `C:\Users\syota\AppData\Local\Temp\codex-clipboard-1a24011e-d37a-4c8f-981e-7f118497f63f.png`, and `C:\Users\syota\AppData\Local\Temp\codex-clipboard-41563ebc-4290-4a84-a410-aa90a18b089e.png`, together with the explicit direction to tell a concise founding-year and taste-confidence story.
- Implementation evidence: `qa/arrival-story-title-desktop.png`, `qa/arrival-story-origin-desktop.png`, `qa/arrival-story-confidence-desktop.png`, and `qa/arrival-story-menu-desktop.png`, captured from a 1280 × 720 CSS viewport; the matching `*-mobile.png` files verify the 390 × 844 layout.
- State sequence: the mist is gone by progress `0.28`; five scattered glyphs gather into `中華の王道` from `0.285`; the complete title and `創業一九七二年` hold at `0.34`; the origin copy holds at `0.39`; the taste-confidence copy holds at `0.475`; the text clears before the dedicated dragon entrance begins at `0.535`, and the menu waits until `0.61`.
- Story copy: `一九七二年、街角の小さな厨房から。火の音と香りを頼りに、王道のひと皿を磨いてきました。` followed by `受け継いだ技と、選び抜いた素材。まっすぐに旨い。その味に、私たちは自信があります。`
- Motion evidence: the title glyphs arrive from separate offset, rotation, scale, and blur states through a staggered 860 ms assembly. Reduced Motion, including the `?reduced=1` QA hook, removes that animation and presents the completed glyphs while retaining scroll-controlled story progression.
- Full-view evidence: every story beat appears over the continuously playing film. The dragon, panels, HUD, particles, navigation, footer, and custom cursor remain hidden throughout the story; the dragon then receives its own entrance interval before the remaining menu interface appears. Copy wraps cleanly on mobile and neither viewport develops positive horizontal overflow.
- Menu pacing evidence: the dragon entrance completes at `0.59`; the two-turn menu uses the following `0.31` span and clears by approximately `0.90`, preserving all ten panels, five dragon chapters, and the existing exit and closing states. The experience length is `1000svh` so each typography beat and menu chapter has usable physical scroll distance.
- Fallback and runtime evidence: `?fallback=1` renders ten semantic panels and no WebGL canvas. Desktop and mobile checkpoints keep the background video playing. No actionable P0, P1, or P2 mismatch remains.

## Oikaze-inspired dragon entrance follow-up

- Reference evidence: live desktop and mobile captures from `https://www.oikaze.jp/` are stored as `qa/reference-oikaze-*.png`; the selected art-direction target is `qa/selected-oikaze-dragon-entry-target.png` at 1536 × 1024 px.
- Implementation evidence: desktop sequence captures are `qa/final-dragon-entry-desktop-525.png` through `qa/final-dragon-entry-desktop-620.png`; mobile sequence captures are `qa/final-dragon-entry-mobile-550.jpg` through `qa/final-dragon-entry-mobile-620.jpg`.
- Combined visual comparison: `qa/oikaze-dragon-entry-partial-comparison.jpg` places the 1536 × 1024 selected target beside the 1536 × 1024 implementation entrance frame. The implementation keeps the target's dark editorial field, warm-gold glyph fragments, central gold subject, and cinematic negative space while following the user's later direction that the complete restaurant story must clear before the dragon appears.
- State sequence: at progress `0.525` the story is still the only primary content; at `0.55` the story has cleared and gold glyphs begin to lift; at `0.57` the dragon is 70% through its head-first rise from below; at `0.59` the complete oversized dragon holds alone on the center axis; at `0.62` the ten-panel spiral becomes visible around it.
- Runtime evidence: the WebGL canvas reports `dragonArrival: 0.000` before the entrance and `1.000` at its hold, with the compact vertical position moving from `-10.600` to `-1.800` and the desktop position moving from `-9.200` to `-1.550`. The selected Hunyuan GLB reports `dragonStatus: ready`; the background video remains playing with ready state 4.
- Idle and input evidence: a 2.2-second normal-motion hold and a 0.9-second Reduced Motion hold leave dragon Y and spiral rotation unchanged. The menu remains scroll-only and does not rotate while idle.
- Responsive evidence: the same text → glyphs → partial dragon → full dragon → menu order is present at 390 × 844 CSS px, with no positive horizontal overflow.
- Reduced Motion evidence: `?reduced=1` removes the glyph animation, holds rotation at `0.0000`, switches the dragon discretely from hidden to fully entered, and reveals the menu only at the later threshold. Evidence is stored as `qa/final-dragon-entry-reduced-ready-550.jpg` through `qa/final-dragon-entry-reduced-ready-620.jpg`.
- WebGL fallback evidence: `?fallback=1` exposes no WebGL canvas, hides all ten semantic product/CTA buttons during the dragon-only interval, then reveals the ten-button fallback menu at progress `0.62`; the background film continues playing. Evidence is stored as `qa/final-dragon-entry-fallback-ready-590.jpg` and `qa/final-dragon-entry-fallback-ready-620.jpg`.
- Required fidelity surfaces: existing Japanese Mincho typography, jade/gold/ink tokens, product photography, center-axis dragon, video contrast, final visit CTA, semantic fallback controls, and the two-turn spiral remain intact. The only compositional addition is the Oikaze-inspired loose glyph stream during the transition.
- Console and build evidence: browser logs contain no warnings or errors; all 17 automated tests pass; the production Vite build and Sites packaging step succeed.
- Findings: no actionable P0, P1, or P2 mismatch remains.

## Closing message rise follow-up

- Source visual truth: `C:\Users\syota\AppData\Local\Temp\codex-clipboard-872cbf41-c767-4e3d-80d2-1581c1a4b3b8.png`, 1100 × 184 px, with the explicit instruction that `今日の一皿を、心ゆくまで。` should rise from below after the final panel finishes.
- Implementation evidence: desktop sequence frames `qa/closing-rise-final-desktop-950.jpg`, `qa/closing-rise-final-desktop-960.jpg`, `qa/closing-rise-final-desktop-964.jpg`, `qa/closing-rise-final-desktop-968.jpg`, and `qa/closing-rise-final-desktop-972.jpg`, captured from a 1280 × 720 CSS viewport at density 1; responsive evidence uses the matching `qa/closing-rise-final-mobile-*.jpg` frames at 390 × 844 CSS px.
- Normalized focused comparison: `qa/closing-rise-focused-comparison.jpg` places the 1100 × 184 source crop beside a 1100 × 184 normalized implementation crop. The implementation crop comes from the 1265 × 712 browser screenshot's 1265 × 212 text band, downsampled uniformly to the source width and height.
- State sequence: at progress `0.95` the final CTA panel is still completing its lift-and-dissolve; at `0.96` the 3D stage is fully cleared and the closing line remains below the viewport; at `0.964` its upper strokes first enter from the bottom edge; at `0.968` the line is visibly rising through the lower half; at `0.972` it rests centered at full opacity.
- Full-view evidence: the background film continues without a cut, the previous menu/CTA interface is removed before the first readable closing glyph appears, and the following `お店に行く` CTA remains on its separate final scroll screen.
- Focused-region evidence: the normalized implementation uses a near-full-width one-line Mincho composition matching the reference proportions. Its desktop type increases to 7.6vw with a 112px cap, stays non-wrapping, and travels from 74svh below its resting position.
- Required fidelity surfaces: the established Mincho family, warm-ivory text, tight tracking, centered alignment, exact Japanese copy, darkened moving-film treatment, and separate gold visit CTA are preserved. No image asset was substituted or recreated.
- Responsive evidence: at 390 × 844 CSS px the phrase remains one line at 343px wide, rises from below to the center, keeps the video playing, and introduces no positive horizontal overflow.
- Reduced Motion evidence: `?reduced=1` removes the 74svh translation and retains only the scroll-controlled opacity change at the centered resting position. WebGL fallback retains the same closing sequence with no canvas and hides its semantic fallback menu once the order scene begins.
- Comparison history: the first pass exposed a P2 overlap—menu controls and the final detail panel remained faintly visible behind the rising line. Fix: the entire hero stage is now hidden at the order-scene boundary, after the final 3D exit reaches `1.000` and before the closing copy becomes readable. Post-fix evidence is `qa/closing-rise-final-desktop-964.jpg` through `qa/closing-rise-final-desktop-972.jpg`; no actionable P0, P1, or P2 mismatch remains.
- Console and build evidence: no browser warning or error is present; all 17 automated tests pass; the production Vite build and Sites packaging step succeed.
- Findings: no actionable P0, P1, or P2 mismatch remains.

## Final visit CTA rise follow-up

- Source visual truth: `C:\Users\syota\AppData\Local\Temp\codex-clipboard-c2b4edba-e808-424b-bd02-cb5d944d650c.png`, 484 × 160 px, with the explicit instruction that the `お店に行く` CTA should rise from below only after the closing line has been shown.
- Implementation evidence: desktop sequence frames `qa/visit-cta-rise-final-desktop-978.jpg`, `qa/visit-cta-rise-final-desktop-985.jpg`, `qa/visit-cta-rise-final-desktop-990.jpg`, `qa/visit-cta-rise-final-desktop-995.jpg`, and `qa/visit-cta-rise-final-desktop-1000.jpg`, captured from a 1280 × 720 CSS viewport at density 1; responsive evidence uses the matching `qa/visit-cta-rise-final-mobile-*.jpg` frames at 390 × 844 CSS px.
- Normalized focused comparison: `qa/visit-cta-rise-focused-comparison.jpg` places the source's 250 × 128 CTA region beside a 250 × 128 implementation crop. Both show a 210 × 58 warm-gold pill with the Japanese label aligned left and an up-right arrow aligned right.
- State sequence: at progress `0.978` the one-line closing message holds at full opacity while the CTA is 60svh below its final position; from `0.978` to `0.985` the message clears; at `0.985` both stages are absent for a short breath; at `0.99` the CTA first crosses the bottom edge; at `0.995` it is visibly rising; at `1.0` it rests centered at full opacity.
- Full-view evidence: the background film continues uninterrupted from the closing line into the CTA-only screen, and no navigation, menu, detail card, footer, particle HUD, or decorative copy reappears during the final conversion step.
- Focused-region evidence: the implementation preserves the selected CTA's exact desktop dimensions, capsule radius, warm-gold fill, dark label, and simple up-right icon. The existing semantic Google Maps link remains the interaction target and opens in a new tab.
- Required fidelity surfaces: Japanese sans-serif button typography, horizontal padding, label/icon spacing, gold/ink tokens, rounded silhouette, exact `お店に行く` copy, moving-film image quality, and centered final placement are retained. No visual asset is fabricated or substituted.
- Responsive evidence: at 390 × 844 CSS px the CTA uses the existing 280 × 54 responsive size, rises from below without horizontal overflow, and finishes centered. The background video remains playing in every sampled frame.
- Reduced Motion evidence: `?reduced=1` removes the 60svh translation and retains a scroll-controlled opacity reveal in the final centered position. WebGL fallback preserves the same sequence with no canvas. Both modes keep the closing message at opacity zero before the CTA begins.
- Timing fix: the prior order fade overlapped the first CTA frames. The order leave interval now ends exactly at `VISIT_SCROLL_START`, so the message reaches opacity zero before CTA opacity can rise above zero. No actionable P0, P1, or P2 mismatch remains.
- Console and build evidence: browser logs contain no warnings or errors; all 17 automated tests pass; the production Vite build and Sites packaging step succeed.
- Findings: no actionable P0, P1, or P2 mismatch remains.

## Chinese lacquer visit CTA follow-up

- Direction: the user's verbal instruction is the visual source of truth—make the existing `お店に行く` CTA feel Chinese while preserving its separate final screen, exact label, Maps destination, centered position, and rise-from-below sequence.
- Implementation evidence: `qa/visit-cta-chinese-desktop.jpg` at a 1280 × 720 CSS viewport and `qa/visit-cta-chinese-mobile.jpg` at 390 × 844 CSS px.
- Visual system: the generic gold capsule is replaced by a restrained lacquer-plaque treatment using the established deep-jade field, fine double gold keyline, warm-ivory Mincho label, and a circular gold arrow detail. The four-pixel radius keeps the control crisp and architectural without introducing a dominant vermilion-and-gold identity.
- Affordance and states: the semantic external link remains a recognizable 210 × 58 desktop button and a 280 × 54 mobile tap target. Hover and keyboard focus invert the plaque to gold/ink, retain a visible ivory focus outline, and keep the icon as the existing library-provided arrow.
- Runtime evidence: both viewports report zero positive horizontal overflow and the background video remains playing with ready state 4. The desktop plaque rests at 210 × 58 and the mobile plaque at 280 × 54.
- Reduced Motion evidence: `?reduced=1` reports `transform: none`, zero-second transitions for the plaque and icon, and no icon rotation. WebGL fallback reports one semantic fallback menu, no food-orbit canvas, the same 210 × 58 final CTA, zero overflow, and a playing video.
- Console and build evidence: browser logs contain no warnings or errors; all 17 automated tests pass; the production Vite build and Sites packaging step succeed.
- Findings: no actionable P0, P1, or P2 mismatch remains.

## Final CTA center-axis follow-up

- Direction: the user's instruction is to place the separate final `お店に行く` CTA precisely at the screen center while preserving its Chinese lacquer styling and rise-from-below sequence.
- Implementation evidence: `qa/visit-cta-centered-desktop.jpg` at a 1280 × 720 configured viewport and `qa/visit-cta-centered-mobile.jpg` at 390 × 844.
- Layout fix: the visit stage now uses a full-viewport grid with `place-items: center`; the CTA is explicitly assigned to the central grid area with both self-alignment axes centered. Mobile vertical padding is symmetric so it cannot bias the resting position downward.
- Runtime geometry: measured against the visible content viewport, the CTA center differs from the viewport center by `0px` horizontally and `0px` vertically on desktop and mobile. Desktop retains 210 × 58; mobile retains the intended 280 × 54 tap target.
- Regression evidence: both viewports report zero positive horizontal overflow, and the background video remains playing throughout the centered final screen.
- Findings: no actionable P0, P1, or P2 mismatch remains.

## Dragon and panel rotation synchronization follow-up

- Direction: the latest user instruction supersedes the earlier fixed-front menu behavior. The dragon remains front-facing during its solo entrance, then rotates with the panels only while the user scrolls through the menu.
- Implementation evidence: `qa/dragon-panel-sync-070.jpg` and `qa/dragon-panel-sync-082.jpg` at a 1280 × 720 configured viewport; responsive evidence: `qa/dragon-panel-sync-mobile-082.jpg` at 390 × 844.
- Synchronization model: the panels and dragon use the same smoothed scroll rotation value. The panel system retains its `0.754` radian presentation offset, while the dragon subtracts that static rest offset; therefore their angular change is identical at every frame without rotating the dragon before the menu begins.
- Runtime checkpoints: dragon rotation is `0.0000` at progress `0.59`, `-4.4590` at `0.70`, `-9.3259` at `0.82`, and `-12.5664` at `0.90`. The corresponding panel-minus-dragon offset remains constant at `0.7540`, proving matched direction, timing, and speed across the complete two-turn interval.
- Idle evidence: at progress `0.70`, both the panel angle (`-3.7051`) and dragon angle (`-4.4590`) remain byte-for-byte unchanged after a 1.6-second hold. Pointer, drag, keyboard, and elapsed time remain excluded from rotation input.
- Responsive and accessibility evidence: desktop and mobile both load the selected dragon successfully, retain the same synchronization constant, keep the film playing, and report zero positive horizontal overflow. `?reduced=1` reports panel and dragon rotation plus both targets as exactly `0`.
- Fallback evidence: `?fallback=1` exposes no WebGL canvas and retains all ten semantic fallback buttons, a playing background film, and zero overflow.
- Console and build evidence: the first browser pass exposed a missing `ORBIT_SCROLL_START` import that static production bundling did not catch. The import and regression assertion were added; a clean normal reload now reports no browser warnings or errors. All 17 automated tests pass, and the production Vite build plus Sites packaging step succeeds.
- Findings: no actionable P0, P1, or P2 mismatch remains.

## Dragon undulating ascent follow-up

- Direction: make the selected golden dragon rise with a restrained serpentine motion while preserving its existing head-first entrance, five-section vertical travel, and synchronized menu rotation.
- Motion model: a monotonic scroll-derived phase now drives three waves across the complete dragon journey. Lateral sway, shallower depth sway, and gentle path-following roll and pitch combine into a spatial ascent without deforming the GLB mesh.
- Runtime checkpoints: at progress `0.59`, `0.65`, `0.75`, and `0.82`, the dragon X values alternate `-0.236`, `0.182`, `-0.207`, and `0.169`; the matching Y values advance from `-1.550` to `1.675`. This verifies visible side-to-side undulation while the sculpture continues upward.
- Idle evidence: at progress `0.65`, X, Z, roll, Y, and synchronized rotation remain byte-for-byte unchanged after a 1.8-second hold. Elapsed time does not drive the new motion.
- Responsive evidence: at 390 × 844 CSS px the compact amplitude is limited to `0.18` world units, the sampled X value is `0.117`, there is no positive horizontal overflow, six depth-sorted panels remain visible, and the background video stays playing at ready state 4.
- Reduced Motion evidence: `?reduced=1` reports X, Z, roll, and dragon rotation as exactly `0`, preserving a straight scroll-led ascent without the serpentine offsets.
- WebGL fallback evidence: `?fallback=1` exposes no WebGL canvas, retains all ten semantic fallback buttons, introduces no horizontal overflow, and keeps the background film playing at ready state 4.
- Build evidence: all 18 automated tests pass; the production Vite build and Sites packaging step succeed.
- Findings: no actionable P0, P1, or P2 mismatch remains.

## Red ink fluid closing screens follow-up

- Direction: use the referenced `Ink in Water` demo as a motion and material benchmark for both closing screens, reinterpreted in the site's own oxblood, crimson, vermilion, jade, and ivory palette.
- Implementation: a dedicated full-viewport fragment shader now renders four slowly folding ink blooms and a cursor-driven local vortex behind the closing line and final visit CTA only. A dark elliptical quiet zone preserves the copy and CTA hierarchy.
- Desktop evidence: at 1440 × 900 the final plaque rests exactly at the 712.5 × 450 content-center coordinate, retains its 210 × 58 size and native pointer cursor, and the document reports zero positive horizontal overflow.
- Responsive evidence: at 390 × 844 the closing line occupies 343.3px of the 375px content width without wrapping or overflow; the final plaque remains 280 × 54 and centered at 187.5 × 422.
- Reduced Motion evidence: `?reduced=1` reports `data-fluid-mode="static"`; the shader draws one deterministic red-ink frame and schedules no ambient animation loop.
- WebGL fallback evidence: `?fallback=1` reports `data-fluid-mode="fallback"`, hides the fluid canvas, shows the CSS red-ink fallback, keeps the existing ten-item semantic menu fallback, and introduces no horizontal overflow.
- Interaction and accessibility evidence: the visual layer is `aria-hidden` and pointer-transparent; the final Maps link remains keyboard focusable and keeps its native pointer cursor. Browser logs contain no warnings or errors.
- Build evidence: all 18 automated tests pass; the production Vite build and Sites packaging step succeed.
- Findings: no actionable P0, P1, or P2 mismatch remains.

## Jade and celadon fluid palette follow-up

- Direction: the prior red fluid read as blood-like, so the user's latest feedback supersedes the red palette while retaining the approved ink-in-water motion and two-screen placement.
- Palette: shader blooms now move from ink jade through imperial jade and celadon, with amber-gold restricted to fine filaments. The CSS fallback uses the same jade/celadon/gold family and contains no red liquid treatment.
- Hierarchy: the central dark quiet zone, warm-ivory closing line, and deep-jade lacquer CTA remain unchanged so the new color treatment does not compete with the final action.
- Desktop evidence: at 1440 × 900 the animated jade blooms remain at the frame edges, the closing line is fully readable, and the final CTA rests exactly at the 712.5 × 450 content center with zero positive horizontal overflow.
- Responsive evidence: at 390 × 844 the final CTA retains its 280 × 54 tap target, finishes exactly at the 187.5 × 422 content center, and introduces no horizontal overflow.
- Reduced Motion and fallback evidence: `?reduced=1` reports `data-fluid-mode="static"` with zero-duration transitions. `?fallback=1` hides the WebGL fluid canvas and shows the matching jade, celadon, and amber CSS artwork.
- Console and build evidence: browser logs contain no warnings or errors; all 18 automated tests pass; the production Vite build and Sites packaging step succeed.
- Findings: no actionable P0, P1, or P2 mismatch remains.

## Lower-edge fluid placement follow-up

- Direction: keep the jade/celadon fluid artwork in the lower portion of both closing screens instead of surrounding the frame.
- Implementation: all four shader blooms now originate below the horizontal center, and a lower-field mask fades both ambient ink and pointer injection before they can enter the upper half. Gold texture speckles use the same lower-only mask.
- Fallback parity: every CSS gradient and drifting fallback bloom is anchored below the viewport center, preserving the same bottom-up silhouette without WebGL.
- Desktop evidence: at 1440 × 900 the upper field remains visually clear on both the closing-copy and final-CTA screens; the active fluid is confined to the lower portion and browser logs contain no warnings or errors.
- Responsive evidence: at 390 × 844 the final CTA remains 280 × 54 and centered at 188 × 422, the lower artwork stays clear of the action, and the page introduces no horizontal overflow.
- Reduced Motion and fallback evidence: `?reduced=1` keeps the bottom composition in deterministic static mode with zero-duration transitions. `?fallback=1` hides the WebGL canvas and renders the matching lower-anchored CSS artwork with no horizontal overflow.
- Build evidence: all 18 automated tests pass; the production Vite build and Sites packaging step succeed.
- Findings: no actionable P0, P1, or P2 mismatch remains.

## Per-character BLUR closing-title follow-up

- Source behavior: the supplied Type Motion `BLUR` preset reveals individual glyphs from zero opacity, `blur(20px)`, and `0.5em` tracking to a sharp final setting over 1100ms, staggered left-to-right by 45ms.
- Implementation: the exact closing message is split into 13 presentation-only glyph spans beneath one accessible `aria-label`. Entering the order screen triggers the sequence; returning below its threshold resets it so re-entering replays the entrance.
- Layout safeguard: each glyph keeps a fixed `0.915em` advance so the reference's animated tracking cannot widen the one-line Japanese composition or move its center while it resolves.
- Desktop evidence: at 1440 × 900 the first glyph measures opacity `0.610207` and `blur(7.79586px)` while the middle and final glyphs remain at zero opacity and `blur(20px)`; after settling, every glyph reports opacity `1` and `blur(0px)`. The heading remains 1302px wide at x=62 throughout with no horizontal overflow.
- Responsive evidence: at 390 × 844 the heading stays 343px wide at x=16 during and after the sequence, retains the complete one-line message, and introduces no horizontal overflow.
- Reduced Motion evidence: `?reduced=1` presents the complete heading immediately with no animation, opacity `1`, and no filter. WebGL fallback retains the BLUR entrance independently of the lower-edge CSS fluid artwork.
- Accessibility and console evidence: the semantic h2 exposes the exact Japanese message while decorative character spans are hidden from assistive technology; browser logs contain no warnings or errors.
- Build evidence: all 18 automated tests pass; the production Vite build and Sites packaging step succeed.
- Findings: the initial expanding line-box issue was corrected with fixed glyph advances; no actionable P0, P1, or P2 mismatch remains.

## Breathing-glow final CTA follow-up

- Direction: reinterpret the supplied breathing-glow button as the existing Chinese lacquer CTA rather than introducing a red control that conflicts with the approved jade/celadon closing palette.
- Implementation: the final Maps link retains its deep-jade surface, double gold frame, Mincho label, circular arrow, and native pointer cursor. While the visit phase is active, an independent three-second ease-in-out animation pulses layered amber-gold light and scales the link from `1` to at most `1.045` without overriding its scroll entrance transform.
- Desktop evidence: at 1280 × 720 the animation reports `breathing-cta-glow`, duration `3s`, and a measured pulse frame of scale `1.03719` with gold light reaching 60.53px. Its visual center remains at the 633 × 360 content center and the document introduces no horizontal overflow.
- Responsive evidence: at 390 × 844 the CTA retains its 280 × 54 base tap target, remains centered at 188 × 422 throughout the pulse, and introduces no horizontal overflow.
- Reduced Motion evidence: `?reduced=1` reports `animation-name: none`, scale `1`, the original 280 × 54 dimensions, and the same centered placement while the static jade fluid frame remains active.
- Interaction and console evidence: the control remains a semantic external link, its exact label and focus outline are unchanged, its computed desktop cursor is `pointer`, and browser logs contain no warnings or errors.
- Build evidence: all 18 automated tests pass; the production Vite build and Sites packaging step succeed.
- Findings: no actionable P0, P1, or P2 mismatch remains.

## Closing-title scroll hold follow-up

- Direction: prevent every forward jump into the separate visit CTA until the last glyph of `今日の一皿を、心ゆくまで。` has fully completed its BLUR entrance.
- Interaction model: crossing progress `0.972` starts the existing 1100ms per-glyph animation with 45ms stagger, clamps the document to the order-stage boundary, and consumes further wheel, touch, keyboard, scrollbar, and programmatic forward movement. The lock releases from the final glyph's actual `animationend`, not from an assumed render start; an 11.64-second watchdog exists only as an abnormal-failure escape hatch.
- Desktop evidence: a jump to the document end is clamped to 6299 / 6480px (`0.97207`), reports `data-order-title-hold="locked"`, keeps the phase at `order`, and holds CTA opacity at `0`. After the thirteenth glyph reaches opacity `1` and `blur(0px)`, the hold reports `released` while the page remains at the order boundary; a subsequent forward input reaches the centered 210 × 58 CTA.
- Responsive evidence: at 390 × 844 CSS px the same boundary resolves to 7383 / 7596px (`0.97196`); the completed visit CTA remains 280 × 54, centered at approximately 188 × 422, with zero positive horizontal overflow.
- Reverse and replay evidence: a deliberate return to the top resets the hold to `ready` and the BLUR state to `idle`; re-entering the boundary starts the lock and glyph sequence again instead of trapping backward navigation.
- Reduced Motion evidence: `?reduced=1` reports `data-order-title-hold="skipped"`, presents every glyph immediately with opacity `1` and no filter, and reaches the visit phase without an artificial delay. The breathing CTA animation also remains disabled.
- WebGL fallback evidence: `?fallback=1` keeps its semantic ten-panel grid and lower-edge CSS fluid art, reports the hold as `locked` at the order boundary, then releases only after the final glyph reaches opacity `1` and `blur(0px)`.
- Console and build evidence: desktop, mobile, Reduced Motion, and WebGL fallback browser logs contain no warnings or errors; all 18 automated tests pass; the production Vite build and Sites packaging step succeed.
- Findings: the initial timer-only version could release early when CSS animation startup was delayed by heavy rendering. The final-glyph completion event and immediate scroll-boundary clamp correct that P1 timing defect; no actionable P0, P1, or P2 mismatch remains.

final result: passed
