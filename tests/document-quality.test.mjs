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
  assert.match(app, /aria-controls="main-menu"/);
  assert.match(app, /event\.key !== "Escape"/);
  assert.match(app, /prefers-reduced-motion: reduce/);
  assert.match(app, /className="orbit-fallback"/);
});

test("keeps the cinematic background video directly playable", async () => {
  const app = await readFile(new URL("src/App.jsx", projectUrl), "utf8");

  assert.match(app, /const assetUrl = \(filename\) => `\$\{import\.meta\.env\.BASE_URL\}assets\/odo\/\$\{filename\}`/);
  assert.match(app, /src=\{assetUrl\("background\.mp4"\)\}/);
  assert.match(app, /autoPlay/);
  assert.match(app, /muted/);
  assert.match(app, /playsInline/);
  assert.match(app, /preload="auto"/);
});

test("uses the dragon centerpiece and excludes retired and prohibited assets", async () => {
  const app = await readFile(new URL("src/App.jsx", projectUrl), "utf8");
  const html = await readFile(new URL("index.html", projectUrl), "utf8");
  const dragon = await readFile(new URL("public/assets/odo/dragon-column.png", projectUrl));

  await access(new URL("public/assets/odo/dragon-column.png", projectUrl));
  assert.equal(dragon[25], 6, "dragon PNG must retain a full RGBA color channel");
  assert.ok(dragon.byteLength < 900_000, "dragon asset should stay below 900 KB");
  assert.doesNotMatch(app, /steam-column\.png/);
  assert.doesNotMatch(app + html, /餃子の王将|Gyoza no Ohsho|OHSHO/i);
});
