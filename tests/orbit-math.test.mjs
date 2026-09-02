import assert from "node:assert/strict";
import test from "node:test";

import {
  AUTO_ROTATION_SECONDS,
  ORBIT_SCROLL_ROTATIONS,
  ORBIT_SCROLL_SPAN,
  ORBIT_SCROLL_START,
  getFrontProductIndex,
  getProductScrollProgress,
  getScrollRotation,
} from "../src/orbitMath.js";

test("the scroll experience produces exactly two full rotations", () => {
  assert.equal(ORBIT_SCROLL_ROTATIONS, 2);
  assert.ok(Math.abs(getScrollRotation(ORBIT_SCROLL_START)) < 1e-10);
  assert.ok(Math.abs(getScrollRotation(ORBIT_SCROLL_START + ORBIT_SCROLL_SPAN) + Math.PI * 4) < 1e-10);
});

test("each menu selection maps its product to the center-front angle", () => {
  for (let index = 0; index < 5; index += 1) {
    const progress = getProductScrollProgress(index, 5);
    assert.equal(getFrontProductIndex(getScrollRotation(progress), 5), index);
  }
});

test("idle auto-rotation uses the specified desktop and mobile periods", () => {
  assert.deepEqual(AUTO_ROTATION_SECONDS, { desktop: 22, mobile: 28 });
});
