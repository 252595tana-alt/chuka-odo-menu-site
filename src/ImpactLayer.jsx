import { useEffect, useRef, useState } from "react";
import {
  DRAGON_ARRIVAL_START,
  MENU_REVEAL_START,
  ORDER_SCROLL_START,
  getOrbitProgress,
} from "./orbitMath.js";

const CHAPTERS = [
  { number: "01", name: "ORBIT" },
  { number: "02", name: "TABLE" },
];

const clamp = (value, min = 0, max = 1) => Math.min(Math.max(value, min), max);

function createSeededRandom(seed = 8247) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function ImpactLayer() {
  const canvasRef = useRef(null);
  const cursorRef = useRef(null);
  const cursorLabelRef = useRef(null);
  const loaderProgressRef = useRef(null);
  const [booting, setBooting] = useState(true);
  const [chapterIndex, setChapterIndex] = useState(0);

  useEffect(() => {
    const root = document.documentElement;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = reduceMotion ? 260 : 1180;
    const startedAt = performance.now();
    let frameId = 0;
    let finishTimer = 0;

    root.dataset.impactReady = "loading";

    const tick = (now) => {
      const rawProgress = clamp((now - startedAt) / duration);
      const easedProgress = 1 - Math.pow(1 - rawProgress, 3);
      const displayProgress = Math.round(easedProgress * 100);

      if (loaderProgressRef.current) {
        loaderProgressRef.current.textContent = String(displayProgress).padStart(3, "0");
      }
      root.style.setProperty("--impact-load", easedProgress.toFixed(4));

      if (rawProgress < 1) {
        frameId = window.requestAnimationFrame(tick);
        return;
      }

      finishTimer = window.setTimeout(() => {
        setBooting(false);
        root.dataset.impactReady = "true";
      }, reduceMotion ? 40 : 160);
    };

    frameId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(finishTimer);
      delete root.dataset.impactReady;
      root.style.removeProperty("--impact-load");
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    let frameId = 0;
    let lastChapter = 0;

    const updateProgress = () => {
      frameId = 0;
      const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      const progress = clamp(window.scrollY / maxScroll);
      const orbitProgress = getOrbitProgress(progress);
      const orderProgress = clamp((progress - ORDER_SCROLL_START) / 0.012);
      const openingProgress = 1 - clamp((progress - 0.23) / 0.14);
      const nextChapter = progress < ORDER_SCROLL_START ? 0 : 1;

      root.style.setProperty("--impact-progress", progress.toFixed(4));
      root.style.setProperty("--impact-orbit", orbitProgress.toFixed(4));
      root.style.setProperty("--impact-order", orderProgress.toFixed(4));
      root.style.setProperty("--impact-opening", openingProgress.toFixed(4));
      root.dataset.impactNoren = progress < 0.28 ? "closed" : "open";
      root.dataset.impactScene = progress >= ORDER_SCROLL_START
        ? "order"
        : progress < 0.28
          ? "noren"
          : progress < DRAGON_ARRIVAL_START
            ? "arrival"
            : progress < MENU_REVEAL_START ? "dragon-entry" : "menu";

      if (nextChapter !== lastChapter) {
        lastChapter = nextChapter;
        setChapterIndex(nextChapter);
      }
    };

    const requestUpdate = () => {
      if (frameId) return;
      frameId = window.requestAnimationFrame(updateProgress);
    };

    updateProgress();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      root.style.removeProperty("--impact-progress");
      root.style.removeProperty("--impact-orbit");
      root.style.removeProperty("--impact-order");
      root.style.removeProperty("--impact-opening");
      delete root.dataset.impactNoren;
      delete root.dataset.impactScene;
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const cursor = cursorRef.current;
    const label = cursorLabelRef.current;
    const finePointer = window.matchMedia("(pointer: fine)");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let moveFrame = 0;
    let pointerX = window.innerWidth / 2;
    let pointerY = window.innerHeight / 2;

    const renderPointer = () => {
      moveFrame = 0;
      if (reduceMotion.matches) {
        if (cursor) cursor.dataset.visible = "false";
        return;
      }
      const normalizedX = pointerX / Math.max(window.innerWidth, 1) - 0.5;
      const normalizedY = pointerY / Math.max(window.innerHeight, 1) - 0.5;
      root.style.setProperty("--impact-x", `${pointerX.toFixed(1)}px`);
      root.style.setProperty("--impact-y", `${pointerY.toFixed(1)}px`);
      root.style.setProperty("--impact-px", normalizedX.toFixed(4));
      root.style.setProperty("--impact-py", normalizedY.toFixed(4));
      if (cursor) cursor.style.transform = `translate3d(${pointerX}px, ${pointerY}px, 0)`;
    };

    const onPointerMove = (event) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (cursor) {
        cursor.dataset.visible = event.pointerType === "mouse" && finePointer.matches && !reduceMotion.matches ? "true" : "false";
      }
      if (!reduceMotion.matches && !moveFrame) moveFrame = window.requestAnimationFrame(renderPointer);
    };

    const onPointerOver = (event) => {
      if (!cursor || !label || reduceMotion.matches) return;
      const target = event.target instanceof Element ? event.target : null;
      const interactive = target?.closest("button, a, [role='button'], .food-orbit-canvas");
      const canvasTarget = target?.closest(".food-orbit-canvas");
      const selectorTarget = target?.closest(".menu-selector button");
      const orderTarget = target?.closest(".order-button, .order-actions button, .active-detail__cta, .orbit-fallback__cta");

      cursor.dataset.hover = interactive ? "true" : "false";
      label.textContent = canvasTarget ? "SCROLL" : selectorTarget ? "SELECT" : orderTarget ? "ENTER" : interactive ? "OPEN" : "";
    };

    const onPointerLeave = () => {
      if (cursor) cursor.dataset.visible = "false";
    };

    const onMotionPreferenceChange = () => {
      window.cancelAnimationFrame(moveFrame);
      moveFrame = 0;
      if (reduceMotion.matches) {
        if (cursor) cursor.dataset.visible = "false";
        root.style.removeProperty("--impact-x");
        root.style.removeProperty("--impact-y");
        root.style.removeProperty("--impact-px");
        root.style.removeProperty("--impact-py");
        return;
      }
      renderPointer();
    };

    renderPointer();
    document.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerover", onPointerOver, { passive: true });
    document.documentElement.addEventListener("mouseleave", onPointerLeave);
    reduceMotion.addEventListener("change", onMotionPreferenceChange);

    return () => {
      window.cancelAnimationFrame(moveFrame);
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerover", onPointerOver);
      document.documentElement.removeEventListener("mouseleave", onPointerLeave);
      reduceMotion.removeEventListener("change", onMotionPreferenceChange);
      root.style.removeProperty("--impact-x");
      root.style.removeProperty("--impact-y");
      root.style.removeProperty("--impact-px");
      root.style.removeProperty("--impact-py");
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return undefined;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const compact = window.matchMedia("(max-width: 760px)");
    const random = createSeededRandom();
    const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2, active: false };
    let width = 1;
    let height = 1;
    let pixelRatio = 1;
    let particles = [];
    let frameId = 0;
    let lastTime = performance.now();
    let visible = !document.hidden;

    const createParticles = () => {
      const count = compact.matches ? 22 : 44;
      particles = Array.from({ length: count }, (_, index) => ({
        x: random() * width,
        y: random() * height,
        vx: (random() - 0.5) * (compact.matches ? 0.11 : 0.16),
        vy: (random() - 0.5) * (compact.matches ? 0.08 : 0.12),
        radius: 0.55 + random() * 1.15,
        phase: random() * Math.PI * 2,
        family: index % 4 === 0 ? "gold" : "jade",
      }));
    };

    const resize = () => {
      width = Math.max(window.innerWidth, 1);
      height = Math.max(window.innerHeight, 1);
      pixelRatio = Math.min(window.devicePixelRatio || 1, compact.matches ? 1.15 : 1.45);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      createParticles();
    };

    const onPointerMove = (event) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = event.pointerType === "mouse";
    };

    const onPointerLeave = () => {
      pointer.active = false;
    };

    const onVisibilityChange = () => {
      visible = !document.hidden;
      if (visible && !frameId) {
        lastTime = performance.now();
        frameId = window.requestAnimationFrame(draw);
      }
    };

    const onMotionPreferenceChange = () => {
      window.cancelAnimationFrame(frameId);
      frameId = 0;
      resize();
      lastTime = performance.now();
      if (visible) frameId = window.requestAnimationFrame(draw);
    };

    const draw = (now) => {
      frameId = 0;
      if (!visible) return;

      const delta = Math.min((now - lastTime) / 16.6667, 2);
      lastTime = now;
      context.clearRect(0, 0, width, height);
      context.globalCompositeOperation = "lighter";

      particles.forEach((particle, index) => {
        if (!reduceMotion.matches) {
          particle.x += particle.vx * delta;
          particle.y += particle.vy * delta;

          if (pointer.active) {
            const dx = pointer.x - particle.x;
            const dy = pointer.y - particle.y;
            const distanceSquared = dx * dx + dy * dy;
            if (distanceSquared < 80000 && distanceSquared > 1) {
              const influence = (1 - distanceSquared / 80000) * 0.0024 * delta;
              particle.vx += dx * influence * 0.002;
              particle.vy += dy * influence * 0.002;
            }
          }

          particle.vx *= 0.998;
          particle.vy *= 0.998;
          particle.vx = clamp(particle.vx, -0.42, 0.42);
          particle.vy = clamp(particle.vy, -0.36, 0.36);

          if (particle.x < -12) particle.x = width + 12;
          if (particle.x > width + 12) particle.x = -12;
          if (particle.y < -12) particle.y = height + 12;
          if (particle.y > height + 12) particle.y = -12;
        }

        const pulse = 0.62 + Math.sin(now * 0.0007 + particle.phase) * 0.24;
        context.beginPath();
        context.fillStyle = particle.family === "gold"
          ? `rgba(210, 181, 125, ${0.32 * pulse})`
          : `rgba(145, 188, 174, ${0.24 * pulse})`;
        context.arc(particle.x, particle.y, particle.radius * pulse, 0, Math.PI * 2);
        context.fill();

        for (let otherIndex = index + 1; otherIndex < particles.length; otherIndex += 1) {
          const other = particles[otherIndex];
          const dx = other.x - particle.x;
          const dy = other.y - particle.y;
          const distanceSquared = dx * dx + dy * dy;
          const limit = compact.matches ? 105 : 138;
          if (distanceSquared > limit * limit) continue;

          const opacity = (1 - Math.sqrt(distanceSquared) / limit) * 0.09;
          context.beginPath();
          context.strokeStyle = `rgba(170, 206, 194, ${opacity})`;
          context.lineWidth = 0.45;
          context.moveTo(particle.x, particle.y);
          context.lineTo(other.x, other.y);
          context.stroke();
        }
      });

      if (pointer.active && !reduceMotion.matches) {
        const halo = context.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, 140);
        halo.addColorStop(0, "rgba(201, 173, 121, 0.07)");
        halo.addColorStop(1, "rgba(201, 173, 121, 0)");
        context.fillStyle = halo;
        context.fillRect(pointer.x - 140, pointer.y - 140, 280, 280);
      }

      context.globalCompositeOperation = "source-over";
      if (!reduceMotion.matches) frameId = window.requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    document.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onPointerLeave);
    document.addEventListener("visibilitychange", onVisibilityChange);
    compact.addEventListener("change", resize);
    reduceMotion.addEventListener("change", onMotionPreferenceChange);
    frameId = window.requestAnimationFrame(draw);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      document.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("mouseleave", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      compact.removeEventListener("change", resize);
      reduceMotion.removeEventListener("change", onMotionPreferenceChange);
    };
  }, []);

  const chapter = CHAPTERS[chapterIndex];

  return (
    <>
      <div className={`impact-loader ${booting ? "is-active" : "is-complete"}`} aria-hidden="true">
        <div className="impact-loader__grid" />
        <div className="impact-loader__mark">
          <span>CONTEMPORARY CHINESE DINING</span>
          <strong>中華の王道</strong>
          <small>ENTERING THE EXPERIENCE</small>
        </div>
        <div className="impact-loader__meter">
          <span ref={loaderProgressRef}>000</span>
          <i><b /></i>
        </div>
      </div>

      <canvas ref={canvasRef} className="impact-particle-canvas" aria-hidden="true" />
      <div className="impact-spotlight" aria-hidden="true" />
      <div className="impact-grain" aria-hidden="true" />

      <div className="impact-orbit-lines" aria-hidden="true">
        <i /><i /><i />
      </div>

      <div className="impact-hero-words" aria-hidden="true">
        <span className="impact-hero-words__chuka">CHUKA</span>
        <span className="impact-hero-words__odo">ODO</span>
      </div>

      <div className="impact-hud impact-hud--left" aria-hidden="true">
        <span>IMMERSIVE MENU</span>
        <i />
        <span>REAL-TIME 3D</span>
      </div>

      <div className="impact-hud impact-hud--right" aria-hidden="true">
        <span>AROMA</span>
        <i />
        <span>FIRE</span>
        <i />
        <span>CRAFT</span>
      </div>

      <div className="impact-chapter" aria-hidden="true">
        <span>{chapter.number}</span>
        <strong>{chapter.name}</strong>
        <small>/ 02</small>
      </div>

      <div ref={cursorRef} className="impact-cursor" data-visible="false" data-hover="false" aria-hidden="true">
        <span className="impact-cursor__ring" />
        <span className="impact-cursor__dot" />
        <small ref={cursorLabelRef} />
      </div>
    </>
  );
}
