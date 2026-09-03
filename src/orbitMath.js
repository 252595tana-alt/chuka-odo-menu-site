export const AUTO_ROTATION_SECONDS = Object.freeze({
  desktop: 22,
  mobile: 28,
});

export const ORBIT_SCROLL_START = 0.33;
export const ORBIT_SCROLL_SPAN = 0.26;
export const ORBIT_SCROLL_ROTATIONS = 2;
export const DRAGON_SCROLL_ROTATIONS = 1;

export const clamp = (value, min = 0, max = 1) => Math.min(Math.max(value, min), max);

export const getOrbitProgress = (pageProgress) => (
  clamp((pageProgress - ORBIT_SCROLL_START) / ORBIT_SCROLL_SPAN)
);

export const getScrollRotation = (pageProgress) => (
  getOrbitProgress(pageProgress) * -Math.PI * 2 * ORBIT_SCROLL_ROTATIONS
);

export const getDragonScrollRotation = (pageProgress) => (
  getScrollRotation(pageProgress) * (DRAGON_SCROLL_ROTATIONS / ORBIT_SCROLL_ROTATIONS)
);

export const getProductScrollProgress = (index, productCount = 5) => {
  const secondOrbitStart = 0.5;
  const orbitProgress = secondOrbitStart + index / (productCount * ORBIT_SCROLL_ROTATIONS);
  return ORBIT_SCROLL_START + orbitProgress * ORBIT_SCROLL_SPAN;
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
