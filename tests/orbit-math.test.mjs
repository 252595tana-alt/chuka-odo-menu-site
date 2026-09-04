import assert from "node:assert/strict";
import test from "node:test";

import {
  DRAGON_ARRIVAL_END,
  DRAGON_ARRIVAL_START,
  DRAGON_CHAPTERS,
  MENU_REVEAL_START,
  EXIT_SCROLL_END,
  EXIT_SCROLL_START,
  ORDER_SCROLL_START,
  VISIT_SCROLL_START,
  DRAGON_SCROLL_ROTATIONS,
  ORBIT_SCROLL_ROTATIONS,
  ORBIT_SCROLL_SPAN,
  ORBIT_SCROLL_START,
  SPIRAL_TURNS,
  getDragonChapter,
  getDragonArrivalProgress,
  getDragonSectionIndex,
  getDragonScrollRotation,
  getDragonTrackProgress,
  getDragonUndulationProgress,
  getExitProgress,
  getOrderProgress,
  getVisitProgress,
  getSpiralDelta,
  getProductScrollProgress,
  getSpiralRotation,
  getScrollRotation,
} from "../src/orbitMath.js";

test("the scroll experience produces exactly two full rotations", () => {
  assert.equal(ORBIT_SCROLL_ROTATIONS, 2);
  assert.equal(DRAGON_SCROLL_ROTATIONS, ORBIT_SCROLL_ROTATIONS);
  assert.equal(ORBIT_SCROLL_START, 0.59);
  assert.ok(Math.abs(ORBIT_SCROLL_START + ORBIT_SCROLL_SPAN - 0.9) < 1e-10);
  assert.ok(Math.abs(getScrollRotation(ORBIT_SCROLL_START)) < 1e-10);
  assert.ok(Math.abs(getScrollRotation(ORBIT_SCROLL_START + ORBIT_SCROLL_SPAN) + Math.PI * 4) < 1e-10);
  assert.ok(Math.abs(getDragonScrollRotation(ORBIT_SCROLL_START)) < 1e-10);
  assert.ok(Math.abs(getDragonScrollRotation(ORBIT_SCROLL_START + ORBIT_SCROLL_SPAN) + Math.PI * 4) < 1e-10);
});

test("each of ten panels maps to the center of the two-turn spiral", () => {
  assert.equal(SPIRAL_TURNS, 2);
  for (let index = 0; index < 10; index += 1) {
    const progress = getProductScrollProgress(index, 10);
    const delta = getSpiralDelta(index, getSpiralRotation(progress), 10);
    assert.ok(Math.abs(delta) < 1e-10, `panel ${index + 1} should be centered`);
  }
});

test("the dragon rises fully before the spiral panels begin", () => {
  assert.ok(DRAGON_ARRIVAL_START < DRAGON_ARRIVAL_END);
  assert.equal(DRAGON_ARRIVAL_END, ORBIT_SCROLL_START);
  assert.ok(DRAGON_ARRIVAL_END < MENU_REVEAL_START);
  assert.equal(getDragonArrivalProgress(DRAGON_ARRIVAL_START), 0);
  assert.equal(getDragonArrivalProgress((DRAGON_ARRIVAL_START + DRAGON_ARRIVAL_END) / 2), 0.5);
  assert.equal(getDragonArrivalProgress(DRAGON_ARRIVAL_END), 1);
});

test("the dragon undulation follows the scroll-led ascent", () => {
  assert.equal(getDragonUndulationProgress(DRAGON_ARRIVAL_START), 0);
  assert.equal(getDragonUndulationProgress(DRAGON_ARRIVAL_END), 0.22);
  assert.ok(
    Math.abs(getDragonUndulationProgress(ORBIT_SCROLL_START + ORBIT_SCROLL_SPAN) - 1) < 1e-10,
  );

  const samples = [
    DRAGON_ARRIVAL_START,
    (DRAGON_ARRIVAL_START + DRAGON_ARRIVAL_END) / 2,
    DRAGON_ARRIVAL_END,
    ORBIT_SCROLL_START + ORBIT_SCROLL_SPAN / 2,
    ORBIT_SCROLL_START + ORBIT_SCROLL_SPAN,
  ].map(getDragonUndulationProgress);
  for (let index = 1; index < samples.length; index += 1) {
    assert.ok(samples[index] >= samples[index - 1]);
  }
});

test("the dragon framing travels through five sections aligned to panel pairs", () => {
  const expectedSections = ["head", "upper-body", "mid-body", "lower-body", "tail"];

  assert.deepEqual(DRAGON_CHAPTERS, expectedSections);
  for (let index = 0; index < 10; index += 1) {
    const progress = getProductScrollProgress(index, 10);
    const expectedSectionIndex = Math.floor(index / 2);
    assert.equal(getDragonSectionIndex(progress), expectedSectionIndex);
    assert.equal(getDragonChapter(progress), expectedSections[expectedSectionIndex]);
    assert.ok(
      Math.abs(getDragonTrackProgress(progress) - expectedSectionIndex / 4) < 1e-10,
      `panel ${index + 1} should use dragon section ${expectedSectionIndex + 1}`,
    );
  }

  const transitionProgress = ORBIT_SCROLL_START + 0.21 * ORBIT_SCROLL_SPAN;
  assert.ok(Math.abs(getDragonTrackProgress(transitionProgress) - 0.125) < 1e-10);
});

test("the helix clears before the closing CTA appears", () => {
  assert.ok(EXIT_SCROLL_START < EXIT_SCROLL_END);
  assert.equal(EXIT_SCROLL_END, ORDER_SCROLL_START);
  assert.equal(getExitProgress(EXIT_SCROLL_START), 0);
  assert.equal(getExitProgress(EXIT_SCROLL_END), 1);
  assert.equal(getOrderProgress(ORDER_SCROLL_START), 0);
  assert.equal(getOrderProgress(0.972), 1);
  assert.equal(getOrderProgress(VISIT_SCROLL_START), 0);
  assert.equal(getOrderProgress(1), 0);
  assert.equal(getOrderProgress(EXIT_SCROLL_START), 0);
  assert.equal(getVisitProgress(VISIT_SCROLL_START), 0);
  assert.equal(getVisitProgress(1), 1);
});
