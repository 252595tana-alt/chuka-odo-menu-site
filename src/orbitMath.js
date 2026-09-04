export const DRAGON_ARRIVAL_START = 0.535;
export const DRAGON_ARRIVAL_END = 0.59;
export const MENU_REVEAL_START = 0.61;
export const ORBIT_SCROLL_START = 0.59;
export const ORBIT_SCROLL_SPAN = 0.31;
export const ORBIT_SCROLL_ROTATIONS = 2;
export const DRAGON_SCROLL_ROTATIONS = ORBIT_SCROLL_ROTATIONS;
export const SPIRAL_TURNS = 2;
export const SPIRAL_SEQUENCE_START = 0.06;
export const EXIT_SCROLL_START = 0.902;
export const EXIT_SCROLL_END = 0.96;
export const ORDER_SCROLL_START = 0.96;
export const VISIT_SCROLL_START = 0.985;

export const DRAGON_CHAPTERS = Object.freeze([
  "head",
  "upper-body",
  "mid-body",
  "lower-body",
  "tail",
]);

const DRAGON_SECTION_SPAN = 1 / DRAGON_CHAPTERS.length;
const DRAGON_FIRST_BOUNDARY = SPIRAL_SEQUENCE_START + 0.15;
const DRAGON_TRANSITION_HALF_SPAN = 0.05;

const smoothstep = (progress) => progress * progress * (3 - 2 * progress);

export const clamp = (value, min = 0, max = 1) => Math.min(Math.max(value, min), max);

export const getOrbitProgress = (pageProgress) => (
  clamp((pageProgress - ORBIT_SCROLL_START) / ORBIT_SCROLL_SPAN)
);

export const getDragonArrivalProgress = (pageProgress) => {
  const progress = clamp(
    (pageProgress - DRAGON_ARRIVAL_START) / (DRAGON_ARRIVAL_END - DRAGON_ARRIVAL_START),
  );
  return smoothstep(progress);
};

export const getExitProgress = (pageProgress) => {
  const progress = clamp(
    (pageProgress - EXIT_SCROLL_START) / (EXIT_SCROLL_END - EXIT_SCROLL_START),
  );
  return smoothstep(progress);
};

export const getOrderProgress = (pageProgress) => {
  const enter = smoothstep(clamp((pageProgress - ORDER_SCROLL_START) / 0.012));
  const leave = smoothstep(clamp(
    (pageProgress - 0.978) / (VISIT_SCROLL_START - 0.978),
  ));
  return enter * (1 - leave);
};

export const getVisitProgress = (pageProgress) => (
  smoothstep(clamp((pageProgress - VISIT_SCROLL_START) / (1 - VISIT_SCROLL_START)))
);

export const getDragonTrackProgress = (pageProgress) => {
  const orbitProgress = getOrbitProgress(pageProgress);
  const transitions = DRAGON_CHAPTERS.length - 1;

  for (let index = 0; index < transitions; index += 1) {
    const boundary = DRAGON_FIRST_BOUNDARY + index * DRAGON_SECTION_SPAN;
    const start = boundary - DRAGON_TRANSITION_HALF_SPAN;
    const end = boundary + DRAGON_TRANSITION_HALF_SPAN;
    if (orbitProgress < start) return index / transitions;
    if (orbitProgress < end) {
      const localProgress = (orbitProgress - start) / (end - start);
      return (index + smoothstep(localProgress)) / transitions;
    }
  }

  return 1;
};

export const getDragonSectionIndex = (pageProgress) => {
  const orbitProgress = getOrbitProgress(pageProgress);
  let sectionIndex = 0;
  while (
    sectionIndex < DRAGON_CHAPTERS.length - 1
    && orbitProgress >= DRAGON_FIRST_BOUNDARY + sectionIndex * DRAGON_SECTION_SPAN
  ) {
    sectionIndex += 1;
  }
  return sectionIndex;
};

export const getDragonChapter = (pageProgress) => {
  return DRAGON_CHAPTERS[getDragonSectionIndex(pageProgress)];
};

export const getScrollRotation = (pageProgress) => (
  getOrbitProgress(pageProgress) * -Math.PI * 2 * ORBIT_SCROLL_ROTATIONS
);

export const getDragonScrollRotation = (pageProgress) => (
  getScrollRotation(pageProgress) * (DRAGON_SCROLL_ROTATIONS / ORBIT_SCROLL_ROTATIONS)
);

export const getProductScrollProgress = (index, productCount = 5) => {
  const orbitProgress = SPIRAL_SEQUENCE_START + index / productCount;
  return ORBIT_SCROLL_START + orbitProgress * ORBIT_SCROLL_SPAN;
};

export const getSpiralItemStep = (productCount) => (
  (Math.PI * 2 * SPIRAL_TURNS) / Math.max(productCount, 1)
);

export const getSpiralRotation = (pageProgress) => (
  getScrollRotation(pageProgress)
  + Math.PI * 2 * ORBIT_SCROLL_ROTATIONS * SPIRAL_SEQUENCE_START
);

export const getSpiralDelta = (index, rotation, productCount) => {
  const count = Math.max(productCount, 1);
  const cursor = -rotation / getSpiralItemStep(count);
  const half = count / 2;
  return ((index - cursor + half) % count + count) % count - half;
};

export const getFrontProductIndex = (rotation, productCount = 5) => {
  let frontIndex = 0;
  let frontDepth = -Infinity;
  for (let index = 0; index < productCount; index += 1) {
    const angle = rotation + index * ((Math.PI * 2) / productCount);
    const depth = Math.cos(angle);
    if (depth > frontDepth) {
      frontDepth = depth;
      frontIndex = index;
    }
  }
  return frontIndex;
};
