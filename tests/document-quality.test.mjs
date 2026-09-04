import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const projectUrl = new URL("../", import.meta.url);

test("publishes complete search and share metadata", async () => {
  const html = await readFile(new URL("index.html", projectUrl), "utf8");

  assert.match(html, /<html lang="ja">/);
  assert.match(html, /rel="canonical" href="https:\/\/252595tana-alt\.github\.io\/chuka-odo-menu-site\/"/);
  assert.match(html, /property="og:title" content="中華の王道 \| 3D メニュー体験"/);
  assert.match(html, /property="og:image:alt"/);
  assert.match(html, /name="robots" content="index, follow, max-image-preview:large"/);
});

test("keeps the interactive menu accessible without relying on WebGL", async () => {
  const app = await readFile(new URL("src/App.jsx", projectUrl), "utf8");

  assert.match(app, /<h1 className="sr-only">中華の王道 3Dメニュー体験<\/h1>/);
  assert.match(app, /aria-label="料理9品と来店案内の10パネル"/);
  assert.match(app, /prefers-reduced-motion: reduce/);
  assert.match(app, /className="orbit-fallback"/);
  assert.match(app, /data-reduced-motion=\{forceReducedMotion \? "true" : undefined\}/);
});

test("keeps the top navigation free of redundant shortcuts", async () => {
  const app = await readFile(new URL("src/App.jsx", projectUrl), "utf8");
  const header = app.match(/<header className="top-nav">[\s\S]*?<\/header>/)?.[0] ?? "";

  assert.match(header, /className="brand-button"/);
  assert.doesNotMatch(header, /料理を選ぶ/);
  assert.doesNotMatch(header, /お席のご案内/);
  assert.doesNotMatch(header, /main-menu|menu-toggle|order-button/);
});

test("rotates spiral panels and the dragon from scroll position only", async () => {
  const app = await readFile(new URL("src/App.jsx", projectUrl), "utf8");
  const impact = await readFile(new URL("src/ImpactLayer.jsx", projectUrl), "utf8");
  const orbitMath = await readFile(new URL("src/orbitMath.js", projectUrl), "utf8");

  assert.match(app, /dataset\.idleRotation = "disabled"/);
  assert.match(app, /dataset\.rotationInput = "scroll-only"/);
  assert.match(app, /dataset\.spiralPresentation = "deep-helix"/);
  assert.match(app, /dataset\.exitMode = "lift-dissolve"/);
  assert.match(app, /ORBIT_SCROLL_START,/);
  assert.match(app, /const targetRotation = isReducedMotion\(\) \? 0 : getSpiralRotation\(pageProgress\)/);
  assert.match(app, /const targetDragonRotation = isReducedMotion\(\) \? 0 : getDragonScrollRotation\(pageProgress\)/);
  assert.match(app, /const synchronizedDragonRotation = isReducedMotion\(\)[\s\S]*: rotation - spiralRestRotation;/);
  assert.match(app, /const dragonUndulationProgress = getDragonUndulationProgress\(pageProgress\)/);
  assert.match(app, /const undulationStrength = isReducedMotion\(\)[\s\S]*dragonArrivalProgress \* \(1 - exitFade\)/);
  assert.match(app, /centerpieceRoot\.position\.x = dragonSway/);
  assert.match(app, /centerpieceRoot\.position\.z = dragonDepthSway/);
  assert.match(app, /dragonPivot\.rotation\.set\(dragonPitch, synchronizedDragonRotation, dragonRoll\)/);
  assert.match(app, /dataset\.dragonRotation = synchronizedDragonRotation\.toFixed\(4\)/);
  assert.match(app, /dataset\.dragonSwayX = dragonSway\.toFixed\(3\)/);
  assert.doesNotMatch(app, /autoOffset|autoPeriod|pauseAutoUntil|manualOffset|drag\.active/);
  assert.doesNotMatch(app, /pointerDown|pointerMove|pointerUp|is-dragging/);
  assert.doesNotMatch(app, /ArrowLeft|ArrowRight|addEventListener\("keydown"/);
  assert.match(impact, /canvasTarget \? "SCROLL"/);
  assert.doesNotMatch(impact, /"DRAG"/);
  assert.doesNotMatch(orbitMath, /AUTO_ROTATION_SECONDS/);
});

test("keeps the cinematic background video directly playable", async () => {
  const app = await readFile(new URL("src/App.jsx", projectUrl), "utf8");
  const impactCss = await readFile(new URL("src/impact.css", projectUrl), "utf8");

  assert.match(app, /const assetUrl = \(filename\) => `\$\{import\.meta\.env\.BASE_URL\}assets\/odo\/\$\{filename\}`/);
  assert.match(app, /src=\{assetUrl\("background\.mp4"\)\}/);
  assert.match(app, /autoPlay/);
  assert.match(app, /muted/);
  assert.match(app, /playsInline/);
  assert.match(app, /preload="auto"/);
  assert.match(app, /video\.addEventListener\("canplay", ensurePlayback\)/);
  assert.match(app, /dataset\.playbackState = "playing"/);
  assert.match(impactCss, /brightness\(0\.92\)/);
  assert.match(impactCss, /opacity: calc\(0\.24 \+ var\(--impact-orbit\) \* 0\.22\)/);
  assert.match(impactCss, /--impact-backdrop: #06110e/);
  assert.match(impactCss, /:root,\s*html,\s*body,\s*\.experience \{\s*background-color: var\(--impact-backdrop\)/);
  assert.match(impactCss, /\.experience \{\s*isolation: auto;\s*min-height: 1000svh;\s*background: var\(--impact-backdrop\)/);
});

test("keeps the noren opening and post-mist story focused on the restaurant identity", async () => {
  const app = await readFile(new URL("src/App.jsx", projectUrl), "utf8");
  const impact = await readFile(new URL("src/ImpactLayer.jsx", projectUrl), "utf8");
  const impactCss = await readFile(new URL("src/impact.css", projectUrl), "utf8");

  assert.match(app, /<div className="noren-wordmark">\s*<strong>中華の王道<\/strong>\s*<\/div>/);
  assert.match(app, /<div className="noren-mist" \/>/);
  assert.match(app, /<section className="arrival-title" aria-label="中華の王道の物語">/);
  assert.match(app, /<strong aria-label="中華の王道">[\s\S]*<span aria-hidden="true">中<\/span>[\s\S]*<span aria-hidden="true">道<\/span>/);
  assert.match(app, /<small>創業一九七二年<\/small>/);
  assert.match(app, /一九七二年、街角の小さな厨房から。/);
  assert.match(app, /まっすぐに旨い。その味に、私たちは自信があります。/);
  assert.doesNotMatch(app, /<div className="noren-wordmark">\s*<small>/);
  assert.match(impact, /root\.dataset\.impactNoren = progress < 0\.28 \? "closed" : "open"/);
  assert.match(impactCss, /\.noren-wordmark \{\s*top: 21\.5%;\s*width: min\(1120px, 92vw\);/);
  assert.match(impactCss, /font-size: clamp\(116px, 14\.6vw, 190px\)/);
  assert.match(impactCss, /font-size: clamp\(64px, 17\.6vw, 74px\)/);
  assert.match(impactCss, /html\[data-impact-noren="closed"\] \.impact-cursor/);
  assert.match(app, /const norenMistOpacity = norenMistIn \* norenMistOut \* 0\.76/);
  assert.match(app, /setProperty\("--noren-mist-opacity", norenMistOpacity\.toFixed\(3\)\)/);
  assert.match(app, /const arrivalTitleOpacity = arrivalTitleIn \* arrivalTitleOut/);
  assert.match(app, /setProperty\("--arrival-title-opacity", arrivalTitleOpacity\.toFixed\(3\)\)/);
  assert.match(app, /const arrivalOriginOpacity = arrivalOriginIn \* arrivalOriginOut/);
  assert.match(app, /const arrivalConfidenceOpacity = arrivalConfidenceIn \* arrivalConfidenceOut/);
  assert.match(app, /setProperty\("--arrival-origin-opacity", arrivalOriginOpacity\.toFixed\(3\)\)/);
  assert.match(app, /setProperty\("--arrival-confidence-opacity", arrivalConfidenceOpacity\.toFixed\(3\)\)/);
  assert.match(impact, /progress < DRAGON_ARRIVAL_START[\s\S]*\? "arrival"[\s\S]*progress < MENU_REVEAL_START \? "dragon-entry" : "menu"/);
  assert.match(app, /className="dragon-arrival-type"/);
  assert.match(app, /dataset\.dragonArrival = dragonArrivalProgress\.toFixed\(3\)/);
  assert.match(app, /dataset\.dragonPositionY = centerpieceRoot\.position\.y\.toFixed\(3\)/);
  assert.match(app, /const dragonArrivalStartY = compact \? -10\.6 : -9\.2/);
  assert.match(app, /THREE\.MathUtils\.lerp\([\s\S]*dragonArrivalStartY,[\s\S]*dragonTrackedY,[\s\S]*dragonArrivalProgress/);
  const styles = await readFile(new URL("src/styles.css", projectUrl), "utf8");
  assert.match(styles, /\.noren-mist \{[\s\S]*opacity: var\(--noren-mist-opacity\)/);
  assert.match(impactCss, /\.arrival-title__mark \{[\s\S]*opacity: var\(--arrival-title-opacity\)/);
  assert.match(impactCss, /\.arrival-title__copy--origin \{\s*opacity: var\(--arrival-origin-opacity\)/);
  assert.match(impactCss, /\.arrival-title__copy--confidence \{\s*opacity: var\(--arrival-confidence-opacity\)/);
  assert.match(impactCss, /@keyframes arrival-glyph-in/);
  assert.match(impactCss, /\.experience\[data-reduced-motion="true"\] \.arrival-title__mark strong span/);
  assert.match(impactCss, /html\[data-impact-scene="arrival"\] \.hero-stage/);
  assert.match(impactCss, /html\[data-impact-scene="dragon-entry"\] \.hero-stage/);
  assert.match(impactCss, /html\[data-impact-scene="dragon-entry"\] \.menu-selector/);
  assert.match(impactCss, /\.experience\[data-reduced-motion="true"\] \.dragon-arrival-type/);
});

test("keeps the final scene focused on its closing line and visit CTA", async () => {
  const app = await readFile(new URL("src/App.jsx", projectUrl), "utf8");
  const redInkFluid = await readFile(new URL("src/RedInkFluid.jsx", projectUrl), "utf8");
  const impact = await readFile(new URL("src/ImpactLayer.jsx", projectUrl), "utf8");
  const impactCss = await readFile(new URL("src/impact.css", projectUrl), "utf8");

  assert.match(app, /const closingMessage = "今日の一皿を、心ゆくまで。"/);
  assert.match(app, /<section id="contact" className="order-stage" aria-labelledby="order-title">[\s\S]*<h2 id="order-title" aria-label=\{closingMessage\}>[\s\S]*Array\.from\(closingMessage\)[\s\S]*className="order-title__char"[\s\S]*<\/h2>\s*<\/section>/);
  assert.match(app, /<section id="visit" className="visit-stage" aria-label="お店へのご案内">\s*<a[\s\S]*className="order-visit-cta breathing-glow"[\s\S]*<span>お店に行く<\/span>[\s\S]*<\/a>\s*<\/section>/);
  assert.match(app, /className="active-detail__cta"[\s\S]*>\s*お店に行く <span aria-hidden="true">↗<\/span>/);
  assert.doesNotMatch(app, /お席のご案内へ <span aria-hidden="true">↗<\/span>/);
  assert.doesNotMatch(app, /今日の一皿を、<br \/>心ゆくまで。/);
  assert.match(impactCss, /\.order-stage h2 \{\s*max-width: none;[\s\S]*white-space: nowrap;/);
  assert.match(impactCss, /\.order-stage h2 \{[\s\S]*font-size: clamp\(52px, 7\.6vw, 112px\);[\s\S]*transform: translate3d\(0, calc\(\(1 - var\(--impact-order\)\) \* 74svh\), 0\);/);
  assert.match(app, /const ORDER_TITLE_HOLD_PROGRESS = 0\.972;/);
  assert.match(app, /const ORDER_TITLE_ANIMATION_MS = 1100 \+ \(closingMessage\.length - 1\) \* 45;/);
  assert.match(app, /const ORDER_TITLE_HOLD_FALLBACK_MS = ORDER_TITLE_ANIMATION_MS \+ 10000;/);
  assert.match(app, /!orderTitleHoldComplete\s*&& \(orderTitleHoldStarted \|\| rawProgress >= ORDER_TITLE_HOLD_PROGRESS\)/);
  assert.match(app, /experience\.dataset\.orderTitleHold = "locked";\s*experience\.dataset\.orderTitleBlur = "active";/);
  assert.match(app, /const scroller = document\.scrollingElement \?\? document\.documentElement;\s*scroller\.scrollTop = holdScrollY;/);
  assert.match(app, /event\.animationName === "order-title-blur-in"/);
  assert.match(app, /lastOrderTitleChar\?\.addEventListener\("animationend", handleOrderTitleAnimationEnd\)/);
  assert.match(app, /experience\.dataset\.orderTitleHold = "released";/);
  assert.match(app, /experience\.dataset\.orderTitleHold = "skipped";\s*experience\.dataset\.orderTitleBlur = "settled";/);
  assert.match(impactCss, /\.order-title__char \{[\s\S]*width: 0\.915em;[\s\S]*filter: blur\(20px\);[\s\S]*letter-spacing: 0\.5em;/);
  assert.match(impactCss, /animation: order-title-blur-in 1100ms cubic-bezier\(0\.16, 1, 0\.3, 1\) both;\s*animation-delay: calc\(var\(--blur-index\) \* 45ms\);/);
  assert.match(impactCss, /@keyframes order-title-blur-in \{[\s\S]*filter: blur\(20px\);[\s\S]*filter: blur\(0\);[\s\S]*letter-spacing: -0\.085em;/);
  assert.match(impactCss, /\.experience\[data-reduced-motion="true"\] \.order-title__char \{[\s\S]*animation: none !important;[\s\S]*opacity: 1;[\s\S]*filter: none;/);
  assert.match(impactCss, /\.experience\[data-phase="visit"\] \.breathing-glow \{\s*animation: breathing-cta-glow 3s ease-in-out infinite;/);
  assert.match(impactCss, /@keyframes breathing-cta-glow \{[\s\S]*scale: 1;[\s\S]*scale: 1\.045;[\s\S]*0 0 64px rgba\(201, 173, 121, 0\.3\)/);
  assert.match(impactCss, /\.experience\[data-reduced-motion="true"\]\[data-phase="visit"\] \.breathing-glow \{\s*animation: none !important;\s*scale: 1;/);
  assert.match(impactCss, /\.experience\[data-reduced-motion="true"\] \.order-stage h2 \{\s*transform: none;/);
  assert.match(impactCss, /\.order-stage \{\s*padding: 8vh 5vw;\s*align-items: center;\s*justify-content: center;\s*text-align: center;/);
  assert.match(app, /href="https:\/\/www\.google\.com\/maps\/search\/\?api=1&query=/);
  assert.match(impact, /root\.dataset\.impactScene = progress >= ORDER_SCROLL_START\s*\? "order"/);
  assert.match(impactCss, /html\[data-impact-scene="order"\] \.top-nav,\s*html\[data-impact-scene="order"\] \.hero-stage,/);
  assert.match(impactCss, /\.order-stage::after \{\s*content: none;/);
  assert.match(impactCss, /\.order-visit-cta \{/);
  assert.match(impactCss, /\.order-visit-cta \{[\s\S]*color: var\(--impact-ivory\);[\s\S]*linear-gradient\(145deg, rgba\(8, 48, 40, 0\.98\), rgba\(2, 22, 18, 0\.98\)\);[\s\S]*border: 1px solid rgba\(201, 173, 121, 0\.94\);[\s\S]*border-radius: 4px;[\s\S]*font-family: "Yu Mincho", "Hiragino Mincho ProN", "Noto Serif JP", serif;/);
  assert.match(impactCss, /\.order-visit-cta svg \{[\s\S]*color: var\(--impact-gold\);[\s\S]*border-radius: 50%;/);
  assert.match(impactCss, /\.visit-stage \{\s*padding: 0 5vw;\s*display: grid;\s*place-items: center;/);
  assert.match(impactCss, /\.visit-stage \.order-visit-cta \{\s*grid-area: 1 \/ 1;\s*align-self: center;\s*justify-self: center;/);
  assert.match(impactCss, /@media \(max-width: 760px\)[\s\S]*\.visit-stage \{\s*padding: 0 22px;/);
  assert.match(impactCss, /@media \(max-width: 760px\)[\s\S]*\.order-visit-cta \{\s*width: 280px;\s*max-width: 100%;\s*min-height: 54px;/);
  assert.match(impactCss, /\.visit-stage \.order-visit-cta \{[\s\S]*transform: translate3d\(0, calc\(\(1 - var\(--visit-opacity\)\) \* 60svh\), 0\);/);
  assert.match(impactCss, /\.experience\[data-reduced-motion="true"\] \.visit-stage \.order-visit-cta \{\s*transform: none;\s*transition: none;/);
  assert.match(impactCss, /\.experience\[data-reduced-motion="true"\] \.order-visit-cta:hover,[\s\S]*\.experience\[data-reduced-motion="true"\] \.order-visit-cta:focus-visible svg \{\s*transform: none;/);
  assert.match(impactCss, /html\[data-impact-ready="true"\]\[data-impact-scene="order"\],[\s\S]*cursor: default !important;/);
  assert.match(impactCss, /html\[data-impact-ready="true"\]\[data-impact-scene="order"\] button,[\s\S]*cursor: pointer !important;/);
  assert.match(app, /<RedInkFluid[\s\S]*active=\{phase === "order" \|\| phase === "visit"\}[\s\S]*forceFallback=\{webglUnavailable\}[\s\S]*forceReducedMotion=\{forceReducedMotion\}/);
  assert.match(redInkFluid, /canvas\.getContext\("webgl"/);
  assert.match(redInkFluid, /window\.addEventListener\("pointermove", onPointerMove/);
  assert.match(redInkFluid, /data-fluid-mode=\{mode\}/);
  assert.match(redInkFluid, /reducedMotion \? "static" : "interactive"/);
  assert.match(redInkFluid, /forceFallback \? "fallback" : "off"/);
  assert.match(redInkFluid, /vec3 inkJade = vec3\(0\.004, 0\.12, 0\.075\)/);
  assert.match(redInkFluid, /vec3 imperialJade = vec3\(0\.018, 0\.50, 0\.285\)/);
  assert.match(redInkFluid, /vec3 celadon = vec3\(0\.34, 0\.78, 0\.62\)/);
  assert.match(redInkFluid, /vec3 amberGold = vec3\(0\.92, 0\.58, 0\.18\)/);
  assert.doesNotMatch(redInkFluid, /oxblood|crimson|vermilion/);
  assert.match(redInkFluid, /float lowerField = 1\.0 - smoothstep\(-0\.30, 0\.14, point\.y\)/);
  assert.match(redInkFluid, /centerQuiet \* lowerField/);
  assert.match(impactCss, /\.closing-fluid\[data-fluid-mode="fallback"\] \.closing-fluid__fallback \{\s*display: block;/);
  assert.match(impactCss, /mask-image: linear-gradient\(to bottom, transparent 0 48%, #000 76%\)/);
  assert.doesNotMatch(impactCss, /\.closing-fluid__fallback i:nth-child\([1-4]\) \{ top:/);
  assert.match(impactCss, /\.experience\[data-reduced-motion="true"\] \.closing-fluid,/);
});

test("uses the real 3D dragon centerpiece and excludes prohibited identities", async () => {
  const app = await readFile(new URL("src/App.jsx", projectUrl), "utf8");
  const html = await readFile(new URL("index.html", projectUrl), "utf8");
  const dragon = await readFile(new URL("public/models/dragon-hunyuan-4view-gold.glb", projectUrl));

  await access(new URL("public/draco/draco_decoder.wasm", projectUrl));
  assert.equal(dragon.subarray(0, 4).toString("ascii"), "glTF");
  assert.ok(dragon.byteLength < 8_000_000, "dragon GLB should stay below 8 MB");
  assert.match(app, /GLTFLoader/);
  assert.match(app, /DRACOLoader/);
  assert.match(app, /modelUrl\("dragon-hunyuan-4view-gold\.glb"\)/);
  assert.match(app, /dataset\.dragonAsset = "dragon-hunyuan-4view-gold\.glb"/);
  assert.match(app, /dragonPivot\.rotation\.set\(dragonPitch, synchronizedDragonRotation, dragonRoll\)/);
  assert.match(app, /dataset\.dragonFacing = "scroll-synchronized"/);
  assert.match(app, /dataset\.dragonFraming = "oversized-crop"/);
  assert.match(app, /dataset\.dragonChapter = dragonChapter/);
  assert.match(app, /dataset\.dragonSectionCount = String\(DRAGON_CHAPTERS\.length\)/);
  assert.match(app, /dataset\.panelsPerDragonSection = \(products\.length \/ DRAGON_CHAPTERS\.length\)\.toFixed\(1\)/);
  assert.match(app, /const targetDragonHeight = products\.length \* 0\.9/);
  assert.match(app, /getDragonTrackProgress\(pageProgress\)/);
  assert.equal(app.match(/\bid: "/g)?.length, 10, "the spiral should contain ten panels");
  assert.match(app, /kind: "cta"/);
  assert.doesNotMatch(app, /steam-column\.png/);
  assert.doesNotMatch(app + html, /餃子の王将|Gyoza no Ohsho|OHSHO/i);
});
