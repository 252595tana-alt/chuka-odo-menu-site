import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import * as THREE from "three";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RedInkFluid } from "./RedInkFluid.jsx";
import {
  clamp,
  DRAGON_ARRIVAL_END,
  DRAGON_CHAPTERS,
  ORBIT_SCROLL_START,
  ORDER_SCROLL_START,
  VISIT_SCROLL_START,
  getDragonChapter,
  getDragonArrivalProgress,
  getDragonSectionIndex,
  getDragonScrollRotation,
  getDragonTrackProgress,
  getDragonUndulationProgress,
  getExitProgress,
  getOrbitProgress,
  getOrderProgress,
  getVisitProgress,
  getProductScrollProgress,
  getSpiralDelta,
  getSpiralItemStep,
  getSpiralRotation,
} from "./orbitMath.js";

const assetUrl = (filename) => `${import.meta.env.BASE_URL}assets/odo/${filename}`;
const modelUrl = (filename) => `${import.meta.env.BASE_URL}models/${filename}`;
const dracoDecoderUrl = `${import.meta.env.BASE_URL}draco/`;
const closingMessage = "今日の一皿を、心ゆくまで。";
const ORDER_TITLE_HOLD_PROGRESS = 0.972;
const ORDER_TITLE_ANIMATION_MS = 1100 + (closingMessage.length - 1) * 45;
const ORDER_TITLE_HOLD_FALLBACK_MS = ORDER_TITLE_ANIMATION_MS + 10000;

const products = [
  {
    id: "gyoza",
    name: "香煎焼き餃子",
    latin: "PAN-SEARED DUMPLINGS",
    category: "点心",
    copy: "薄皮を香ばしく焼き上げ、野菜の甘みを閉じ込めました。",
    image: assetUrl("gyoza.jpg"),
  },
  {
    id: "shoyu-men",
    name: "香味醤油麺",
    latin: "AROMATIC SOY NOODLES",
    category: "湯麺",
    copy: "澄んだ醤油スープに、香味油の余韻を重ねた一杯。",
    image: assetUrl("shoyu-men.jpg"),
  },
  {
    id: "sesame-chicken",
    name: "胡麻だれ蒸し鶏",
    latin: "SESAME POACHED CHICKEN",
    category: "冷菜",
    copy: "しっとり蒸し鶏と胡瓜を、香ばしい胡麻だれで。",
    image: assetUrl("sesame-chicken.jpg"),
  },
  {
    id: "black-vinegar-pork",
    name: "黒酢香る酢豚",
    latin: "BLACK VINEGAR PORK",
    category: "熱菜",
    copy: "芳醇な黒酢の酸味と、果実の甘みを艶やかに。",
    image: assetUrl("black-vinegar-pork.jpg"),
  },
  {
    id: "shrimp-greens",
    name: "海老と青菜の塩炒め",
    latin: "PRAWNS & JADE GREENS",
    category: "炒菜",
    copy: "海老と旬の青菜を、生姜の香りで軽やかに炒めます。",
    image: assetUrl("shrimp-greens.jpg"),
  },
  {
    id: "char-siu-bok-choy",
    name: "蜂蜜叉焼と青梗菜",
    latin: "HONEY CHAR SIU & BOK CHOY",
    category: "燒味",
    copy: "蜂蜜で艶を重ねた叉焼を、瑞々しい青梗菜とともに。",
    image: assetUrl("char-siu-bok-choy.webp"),
  },
  {
    id: "mapo-tofu",
    name: "花椒香る麻婆豆腐",
    latin: "NUMBING MAPO TOFU",
    category: "煮込",
    copy: "豆板醤の深い旨みに、花椒の鮮烈な香りを重ねます。",
    image: assetUrl("mapo-tofu.webp"),
  },
  {
    id: "scallop-spring-roll",
    name: "帆立と黄韭の春巻",
    latin: "SCALLOP & CHIVE SPRING ROLLS",
    category: "点心",
    copy: "帆立の甘みと黄韭の香りを、軽やかな皮に包みました。",
    image: assetUrl("scallop-spring-roll.webp"),
  },
  {
    id: "almond-tofu",
    name: "桂花香る杏仁豆腐",
    latin: "OSMANTHUS ALMOND TOFU",
    category: "甘味",
    copy: "なめらかな杏仁に、桂花と季節の果実を添えて。",
    image: assetUrl("almond-tofu.webp"),
  },
  {
    id: "visit",
    kind: "cta",
    name: "お店に行く",
    latin: "VISIT THE DINING ROOM",
    category: "ご案内",
    copy: "九皿の余韻を、その先の食卓へ。お席のご案内をご覧ください。",
  },
];

function easeInOutSine(value) {
  const t = clamp(value);
  return 0.5 - Math.cos(Math.PI * t) / 2;
}

function delayedClothEase(value, delay) {
  return easeInOutSine(clamp((value - delay) / (1 - delay)));
}

function createRoundedPlane(width, height, radius) {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -height / 2;
  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + height - radius);
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  shape.lineTo(x + radius, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);
  const geometry = new THREE.ShapeGeometry(shape, 10);
  geometry.computeBoundingBox();
  const bounds = geometry.boundingBox;
  const position = geometry.getAttribute("position");
  const uv = geometry.getAttribute("uv");
  for (let index = 0; index < position.count; index += 1) {
    uv.setXY(
      index,
      (position.getX(index) - bounds.min.x) / (bounds.max.x - bounds.min.x),
      (position.getY(index) - bounds.min.y) / (bounds.max.y - bounds.min.y),
    );
  }
  uv.needsUpdate = true;
  return geometry;
}

function createProductTexture(product, index) {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 760;
  const context = canvas.getContext("2d");
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;

  const draw = (image) => {
    context.clearRect(0, 0, canvas.width, canvas.height);

    if (product.kind === "cta") {
      const background = context.createLinearGradient(0, 0, canvas.width, canvas.height);
      background.addColorStop(0, "#06120f");
      background.addColorStop(0.58, "#0c2e27");
      background.addColorStop(1, "#07110f");
      context.fillStyle = background;
      context.fillRect(0, 0, canvas.width, canvas.height);

      context.strokeStyle = "rgba(185, 154, 104, 0.46)";
      context.lineWidth = 2;
      for (let radius = 116; radius <= 510; radius += 98) {
        context.beginPath();
        context.arc(890, 378, radius, -Math.PI * 0.72, Math.PI * 0.72);
        context.stroke();
      }

      context.strokeStyle = "#b99a68";
      context.lineWidth = 10;
      context.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);
      context.strokeStyle = "#78938a";
      context.lineWidth = 2;
      context.strokeRect(18, 18, canvas.width - 36, canvas.height - 36);

      context.fillStyle = "#c98770";
      context.font = '600 22px "Arial", sans-serif';
      context.letterSpacing = "5px";
      context.fillText("THE FINAL PANEL", 62, 72);
      context.fillStyle = "#b9c9c3";
      context.font = '600 24px "Yu Gothic", "Hiragino Kaku Gothic ProN", sans-serif';
      context.fillText("九皿の先にある、次の体験へ", 64, 178);

      context.fillStyle = "#f4f0e6";
      context.font = '600 112px "Yu Mincho", "Hiragino Mincho ProN", serif';
      context.fillText(product.name, 58, 362);
      context.fillStyle = "#c9ad79";
      context.font = '600 28px "Arial", sans-serif';
      context.fillText(product.latin, 66, 424);

      context.strokeStyle = "#c98770";
      context.lineWidth = 3;
      context.beginPath();
      context.arc(1060, 590, 72, 0, Math.PI * 2);
      context.stroke();
      context.fillStyle = "#f4f0e6";
      context.font = '400 62px "Arial", sans-serif';
      context.textAlign = "center";
      context.fillText("↗", 1060, 612);
      context.textAlign = "left";
      context.font = '500 22px "Arial", sans-serif';
      context.fillText("SCROLL / SELECT TO ENTER", 66, 674);
      context.textAlign = "right";
      context.fillText(String(index + 1).padStart(2, "0"), 1136, 704);
      context.textAlign = "left";
      texture.needsUpdate = true;
      return;
    }

    if (image) {
      const imageArea = { x: 0, y: 0, width: canvas.width, height: canvas.height };
      const targetAspect = imageArea.width / imageArea.height;
      const sourceAspect = image.width / image.height;
      let sourceX = 0;
      let sourceY = 0;
      let sourceWidth = image.width;
      let sourceHeight = image.height;
      if (sourceAspect > targetAspect) {
        sourceWidth = image.height * targetAspect;
        sourceX = (image.width - sourceWidth) / 2;
      } else {
        sourceHeight = image.width / targetAspect;
        sourceY = (image.height - sourceHeight) / 2;
      }
      context.drawImage(
        image,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        imageArea.x,
        imageArea.y,
        imageArea.width,
        imageArea.height,
      );
    }

    const shade = context.createLinearGradient(0, 0, 0, canvas.height);
    shade.addColorStop(0, "rgba(2, 10, 8, 0.2)");
    shade.addColorStop(0.52, "rgba(2, 10, 8, 0.04)");
    shade.addColorStop(1, "rgba(2, 10, 8, 0.92)");
    context.fillStyle = shade;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "rgba(5, 18, 14, 0.34)";
    context.fillRect(0, 0, canvas.width, 84);

    context.strokeStyle = "#b99a68";
    context.lineWidth = 10;
    context.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);
    context.strokeStyle = "rgba(213, 231, 223, 0.46)";
    context.lineWidth = 2;
    context.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    context.fillStyle = "#f3efe5";
    context.font = '600 23px "Yu Gothic", "Hiragino Kaku Gothic ProN", sans-serif';
    context.fillText(product.category, 46, 54);
    context.textAlign = "right";
    context.font = '600 20px "Arial", sans-serif';
    context.fillText(product.latin, 1152, 54);
    context.textAlign = "left";

    context.fillStyle = "#f4f0e6";
    context.font = '600 62px "Yu Mincho", "Hiragino Mincho ProN", serif';
    context.fillText(product.name, 52, 672);
    context.fillStyle = "#c9ad79";
    context.font = '600 20px "Arial", sans-serif';
    context.fillText(product.latin, 56, 716);
    context.textAlign = "right";
    context.fillStyle = "#f4f0e6";
    context.font = '500 28px "Arial", sans-serif';
    context.fillText(String(index + 1).padStart(2, "0"), 1142, 708);
    context.textAlign = "left";
    texture.needsUpdate = true;
  };

  draw(null);
  if (product.image) {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => draw(image);
    image.src = product.image;
  }
  return texture;
}

function FoodOrbitCanvas({ onActiveChange, onUnavailable }) {
  const canvasRef = useRef(null);
  const activeCallbackRef = useRef(onActiveChange);
  const unavailableCallbackRef = useRef(onUnavailable);

  useEffect(() => {
    activeCallbackRef.current = onActiveChange;
  }, [onActiveChange]);

  useEffect(() => {
    unavailableCallbackRef.current = onUnavailable;
  }, [onUnavailable]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    } catch {
      unavailableCallbackRef.current?.();
      return undefined;
    }
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.setClearColor(0x000000, 0);
    canvas.dataset.layout = "spiral";
    canvas.dataset.spiralPresentation = "deep-helix";
    canvas.dataset.exitMode = "lift-dissolve";
    canvas.dataset.panelCount = String(products.length);
    canvas.dataset.dragonFacing = "scroll-synchronized";
    canvas.dataset.dragonFraming = "oversized-crop";
    canvas.dataset.dragonChapter = "head";
    canvas.dataset.dragonSectionIndex = "0";
    canvas.dataset.dragonSectionCount = String(DRAGON_CHAPTERS.length);
    canvas.dataset.panelsPerDragonSection = (products.length / DRAGON_CHAPTERS.length).toFixed(1);
    canvas.dataset.idleRotation = "disabled";
    canvas.dataset.rotationInput = "scroll-only";

    const orbitRoot = new THREE.Group();
    const centerpieceRoot = new THREE.Group();
    scene.add(centerpieceRoot, orbitRoot);

    const hemisphereLight = new THREE.HemisphereLight(0xffe7bd, 0x061411, 0.62);
    const keyLight = new THREE.DirectionalLight(0xffd48a, 4.2);
    keyLight.position.set(3.4, 4.8, 5.6);
    const rimLight = new THREE.PointLight(0xf07a4f, 5.4, 12, 2);
    rimLight.position.set(-2.4, 0.8, 2.8);
    const coolRimLight = new THREE.PointLight(0x73b9a9, 3.2, 10, 2);
    coolRimLight.position.set(2.2, -1.1, -2.4);
    scene.add(hemisphereLight, keyLight, rimLight, coolRimLight);

    const cardGeometry = createRoundedPlane(3.78, 2.42, 0.15);
    const borderGeometry = createRoundedPlane(3.9, 2.54, 0.17);
    const groups = [];
    const cardMaterials = [];
    const textures = [];

    products.forEach((product, index) => {
      const group = new THREE.Group();
      const borderMaterial = new THREE.MeshBasicMaterial({
        color: product.kind === "cta" ? 0xc9745d : index === 0 ? 0xb99a68 : 0x284b45,
        transparent: true,
        opacity: 1,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      const border = new THREE.Mesh(borderGeometry, borderMaterial);
      border.position.z = -0.035;

      const texture = createProductTexture(product, index);
      const cardMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 1,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      const card = new THREE.Mesh(cardGeometry, cardMaterial);
      card.position.z = 0.01;
      group.add(border, card);
      orbitRoot.add(group);
      groups.push(group);
      cardMaterials.push([borderMaterial, cardMaterial]);
      textures.push(texture);
    });

    const spiralStep = getSpiralItemStep(products.length);
    const spiralHalf = products.length / 2;
    const trailPoints = Array.from({ length: 161 }, (_, index) => {
      const delta = -spiralHalf + (index / 160) * products.length;
      const angle = delta * spiralStep;
      return new THREE.Vector3(Math.sin(angle), delta, Math.cos(angle));
    });
    const trailCurve = new THREE.CatmullRomCurve3(trailPoints, false, "catmullrom", 0.5);
    const trailGeometry = new THREE.TubeGeometry(trailCurve, 160, 0.008, 4, false);
    const trailMaterial = new THREE.MeshBasicMaterial({
      color: 0x9dbab0,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const orbitTrail = new THREE.Mesh(trailGeometry, trailMaterial);
    orbitTrail.renderOrder = 4;
    orbitRoot.add(orbitTrail);

    const arrowGeometry = new THREE.ConeGeometry(0.14, 0.46, 8);
    const arrowMaterial = new THREE.MeshBasicMaterial({
      color: 0xb99a68,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    const orbitArrows = Array.from({ length: 4 }, () => {
      const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);
      arrow.renderOrder = 45;
      orbitRoot.add(arrow);
      return arrow;
    });
    const arrowAxis = new THREE.Vector3(0, 1, 0);
    const arrowTangents = orbitArrows.map(() => new THREE.Vector3());
    const arrowPoints = orbitArrows.map(() => new THREE.Vector3());

    const dragonPivot = new THREE.Group();
    dragonPivot.position.set(0, 0.14, 0.02);
    centerpieceRoot.add(dragonPivot);

    const dragonMaterials = [];
    let dragonModel = null;
    let disposed = false;
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath(dracoDecoderUrl);
    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);
    canvas.dataset.dragonAsset = "dragon-hunyuan-4view-gold.glb";
    canvas.dataset.dragonStatus = "loading";
    gltfLoader.load(
      modelUrl("dragon-hunyuan-4view-gold.glb"),
      ({ scene: loadedDragon }) => {
        if (disposed) return;

        dragonModel = loadedDragon;
        dragonModel.rotation.y = 0;
        dragonModel.updateMatrixWorld(true);

        const initialBounds = new THREE.Box3().setFromObject(dragonModel);
        const initialSize = initialBounds.getSize(new THREE.Vector3());
        const targetDragonHeight = products.length * 0.9;
        const normalizedScale = targetDragonHeight / Math.max(initialSize.y, 0.001);
        dragonModel.scale.set(
          normalizedScale * 0.424,
          normalizedScale,
          normalizedScale * 0.424,
        );
        canvas.dataset.dragonTargetHeight = targetDragonHeight.toFixed(1);
        dragonModel.updateMatrixWorld(true);

        const normalizedBounds = new THREE.Box3().setFromObject(dragonModel);
        const normalizedCenter = normalizedBounds.getCenter(new THREE.Vector3());
        dragonModel.position.sub(normalizedCenter);

        dragonModel.traverse((child) => {
          if (!child.isMesh) return;
          const sourceMaterials = Array.isArray(child.material) ? child.material : [child.material];
          const materials = sourceMaterials.map((material) => {
            const polishedMaterial = material.clone();
            polishedMaterial.transparent = true;
            polishedMaterial.opacity = 0;
            polishedMaterial.depthWrite = false;
            polishedMaterial.depthTest = false;
            if ("metalness" in polishedMaterial) polishedMaterial.metalness = Math.max(polishedMaterial.metalness, 0.42);
            if ("roughness" in polishedMaterial) polishedMaterial.roughness = Math.min(polishedMaterial.roughness, 0.5);
            if ("emissive" in polishedMaterial) {
              polishedMaterial.emissive.setHex(0x4f2608);
              polishedMaterial.emissiveIntensity = Math.max(polishedMaterial.emissiveIntensity ?? 0, 0.2);
            }
            dragonMaterials.push(polishedMaterial);
            return polishedMaterial;
          });
          child.material = Array.isArray(child.material) ? materials : materials[0];
          child.renderOrder = 74;
        });

        dragonPivot.add(dragonModel);
        canvas.dataset.dragonStatus = "ready";
      },
      undefined,
      (error) => {
        canvas.dataset.dragonStatus = "error";
        console.error("Unable to load the 3D dragon.", error);
      },
    );

    const emberCount = 320;
    const emberPositions = new Float32Array(emberCount * 3);
    const emberColors = new Float32Array(emberCount * 3);
    const emberGold = new THREE.Color(0xc9ad79);
    const emberRed = new THREE.Color(0x83aa9d);
    for (let index = 0; index < emberCount; index += 1) {
      const progress = index / (emberCount - 1);
      const angle = progress * Math.PI * 14 + (index % 11) * 0.39;
      const cluster = 0.72 + Math.sin(progress * Math.PI * 8) * 0.36;
      const radius = cluster + (((index * 37) % 100) / 100) * 1.18;
      emberPositions[index * 3] = Math.cos(angle) * radius;
      emberPositions[index * 3 + 1] = -5.45 + progress * 10.9;
      emberPositions[index * 3 + 2] = Math.sin(angle) * radius;
      const color = index % 3 === 0 ? emberGold : emberRed;
      emberColors[index * 3] = color.r;
      emberColors[index * 3 + 1] = color.g;
      emberColors[index * 3 + 2] = color.b;
    }
    const emberGeometry = new THREE.BufferGeometry();
    emberGeometry.setAttribute("position", new THREE.BufferAttribute(emberPositions, 3));
    emberGeometry.setAttribute("color", new THREE.BufferAttribute(emberColors, 3));
    const emberMaterial = new THREE.PointsMaterial({
      size: 0.045,
      vertexColors: true,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    const emberField = new THREE.Points(emberGeometry, emberMaterial);
    emberField.renderOrder = 73;
    centerpieceRoot.add(emberField);

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const forceReducedMotion = new URLSearchParams(window.location.search).get("reduced") === "1";
    const isReducedMotion = () => reduceMotion.matches || forceReducedMotion;
    const spiralRestRotation = getSpiralRotation(ORBIT_SCROLL_START);
    let rotation = spiralRestRotation;
    let frameId = 0;
    let lastActive = -1;
    let compact = false;
    let lastTime = performance.now();
    let elapsed = 0;

    const syncToScroll = () => {
      const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      rotation = isReducedMotion()
        ? 0
        : getSpiralRotation(clamp(window.scrollY / maxScroll));
    };

    const contextLost = (event) => {
      event.preventDefault();
      unavailableCallbackRef.current?.();
    };

    const resize = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      compact = width < 760;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, compact ? 1.35 : 1.75));
      renderer.setSize(width, height, false);
      camera.aspect = width / Math.max(height, 1);
      camera.fov = compact ? 40 : 35;
      camera.position.set(0, 0, compact ? 11.8 : 10.2);
      camera.updateProjectionMatrix();
      orbitRoot.position.set(0, compact ? -0.08 : -0.02, 0);
      centerpieceRoot.position.set(0, compact ? -1.25 : -1.55, 0);
      centerpieceRoot.scale.setScalar(compact ? 1.28 : 1);
    };

    canvas.addEventListener("webglcontextlost", contextLost);
    window.addEventListener("scroll", syncToScroll, { passive: true });
    window.addEventListener("resize", resize);
    resize();

    const render = () => {
      const now = performance.now();
      const delta = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      elapsed += delta;
      const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      const pageProgress = clamp(window.scrollY / maxScroll);
      const orbitProgress = getOrbitProgress(pageProgress);
      const dragonChapter = getDragonChapter(pageProgress);
      const dragonSectionIndex = getDragonSectionIndex(pageProgress);
      const dragonTrackProgress = isReducedMotion()
        ? dragonSectionIndex / (DRAGON_CHAPTERS.length - 1)
        : getDragonTrackProgress(pageProgress);
      const panelEntry = clamp((orbitProgress - 0.03) / 0.1);
      const dragonArrivalProgress = isReducedMotion()
        ? (pageProgress >= DRAGON_ARRIVAL_END ? 1 : 0)
        : getDragonArrivalProgress(pageProgress);
      const exit = getExitProgress(pageProgress);
      const exitFade = clamp((exit - 0.12) / 0.88);
      const dragonUndulationProgress = getDragonUndulationProgress(pageProgress);
      const stageOpacity = panelEntry * (1 - exitFade);
      canvas.dataset.exitProgress = exit.toFixed(3);
      canvas.dataset.dragonArrival = dragonArrivalProgress.toFixed(3);

      const targetRotation = isReducedMotion() ? 0 : getSpiralRotation(pageProgress);
      const targetDragonRotation = isReducedMotion() ? 0 : getDragonScrollRotation(pageProgress);
      canvas.dataset.spiralTarget = targetRotation.toFixed(4);
      canvas.dataset.dragonTarget = targetDragonRotation.toFixed(4);
      rotation += (targetRotation - rotation) * 0.085;

      const radiusX = compact ? 2.62 : 4.55;
      const depthZ = compact ? 2.52 : 3.6;
      const spiralPitch = compact ? 0.7 : 0.92;
      const visibleRadius = compact ? 2.72 : 3.58;
      const edgeSoftness = compact ? 0.78 : 0.94;
      orbitTrail.scale.set(radiusX, spiralPitch, depthZ);
      orbitRoot.position.set(0, (compact ? -0.08 : -0.02) + exit * (compact ? 5.1 : 6.4), 0);
      orbitRoot.scale.setScalar(1 - exit * 0.08);
      let frontIndex = 0;
      let closestDistance = Infinity;
      let visiblePanelCount = 0;

      groups.forEach((group, index) => {
        const spiralDelta = getSpiralDelta(index, rotation, products.length);
        const distance = Math.abs(spiralDelta);
        const angle = spiralDelta * spiralStep;
        const x = Math.sin(angle) * radiusX;
        const z = Math.cos(angle) * depthZ;
        const frontness = (z + depthZ) / (depthZ * 2);
        const centerness = clamp(1 - distance / Math.max(spiralHalf, 1));
        const edgeFade = clamp((visibleRadius - distance) / edgeSoftness);
        const y = spiralDelta * spiralPitch;
        const scale = compact
          ? 0.23 + frontness * 0.3 + centerness * 0.34
          : 0.24 + frontness * 0.43 + centerness * 0.3;
        const centeredX = x * (1 - Math.pow(frontness, 3.2) * (compact ? 0.94 : 0.9));
        group.position.set(centeredX, y, z);
        group.scale.setScalar(scale);
        group.rotation.y = Math.sin(angle) * -1.08;
        group.rotation.x = Math.sin(angle * 0.5) * 0.045;
        group.rotation.z = Math.sin(angle * 0.5) * -0.07;
        group.renderOrder = frontness > 0.56
          ? 38 + Math.round((frontness * 0.72 + centerness * 0.28) * 18)
          : 7 + Math.round(frontness * 24);
        group.children.forEach((mesh) => { mesh.renderOrder = group.renderOrder; });
        if (edgeFade > 0.06) visiblePanelCount += 1;
        cardMaterials[index].forEach((material, materialIndex) => {
          material.opacity = stageOpacity
            * edgeFade
            * (0.2 + frontness * 0.5 + centerness * 0.3)
            * (materialIndex === 0 ? 0.94 : 0.84);
        });
        if (distance < closestDistance) {
          closestDistance = distance;
          frontIndex = index;
        }
      });

      if (pageProgress < getProductScrollProgress(0, products.length)) {
        frontIndex = 0;
      }
      canvas.dataset.visiblePanelCount = String(visiblePanelCount);

      groups.forEach((group, index) => {
        const isActive = index === frontIndex;
        if (isActive) {
          group.scale.multiplyScalar(compact ? 1.06 : 1.02);
          group.position.y += 0.05 + exit * (compact ? 1.4 : 2.2);
          group.position.z += compact ? 0.28 : 0.46;
        }
        cardMaterials[index][0].color.setHex(
          isActive ? (products[index].kind === "cta" ? 0xc9745d : 0xb99a68) : 0x284b45,
        );
      });

      orbitArrows.forEach((arrow, index) => {
        const motionTime = isReducedMotion() ? 0 : elapsed;
        const pathProgress = (motionTime * 0.055 + index / orbitArrows.length) % 1;
        const point = trailCurve.getPointAt(pathProgress, arrowPoints[index]);
        arrow.position.set(point.x * radiusX, point.y * spiralPitch, point.z * depthZ);
        const sourceTangent = trailCurve.getTangentAt(pathProgress, arrowTangents[index]);
        const tangent = sourceTangent.set(
          sourceTangent.x * radiusX,
          sourceTangent.y * spiralPitch,
          sourceTangent.z * depthZ,
        ).normalize();
        arrow.quaternion.setFromUnitVectors(arrowAxis, tangent);
      });

      if (frontIndex !== lastActive) {
        lastActive = frontIndex;
        canvas.dataset.activeIndex = String(frontIndex);
        activeCallbackRef.current?.(frontIndex);
      }
      canvas.dataset.spiralRotation = rotation.toFixed(4);

      const centerpieceTime = isReducedMotion() ? 0 : elapsed;
      const dragonHeadY = compact ? -1.8 : -1.55;
      const dragonTailY = dragonHeadY + products.length * (compact ? 0.42 : 0.43);
      const dragonArrivalStartY = compact ? -10.6 : -9.2;
      const dragonTrackedY = THREE.MathUtils.lerp(
        dragonHeadY,
        dragonTailY,
        dragonTrackProgress,
      );
      const synchronizedDragonRotation = isReducedMotion()
        ? 0
        : rotation - spiralRestRotation;
      const undulationStrength = isReducedMotion()
        ? 0
        : dragonArrivalProgress * (1 - exitFade);
      const undulationPhase = dragonUndulationProgress * Math.PI * 6;
      const dragonSway = Math.sin(undulationPhase)
        * (compact ? 0.18 : 0.28)
        * undulationStrength;
      const dragonDepthSway = Math.cos(undulationPhase * 0.75)
        * (compact ? 0.08 : 0.13)
        * undulationStrength;
      const dragonRoll = -Math.cos(undulationPhase)
        * (compact ? 0.035 : 0.055)
        * undulationStrength;
      const dragonPitch = Math.sin(undulationPhase * 0.5)
        * (compact ? 0.012 : 0.018)
        * undulationStrength;
      centerpieceRoot.rotation.set(0, 0, 0);
      centerpieceRoot.position.x = dragonSway;
      centerpieceRoot.position.z = dragonDepthSway;
      dragonPivot.rotation.set(dragonPitch, synchronizedDragonRotation, dragonRoll);
      centerpieceRoot.position.y = THREE.MathUtils.lerp(
        dragonArrivalStartY,
        dragonTrackedY,
        dragonArrivalProgress,
      ) + exit * (compact ? 6.2 : 7.4);
      canvas.dataset.dragonPositionY = centerpieceRoot.position.y.toFixed(3);
      canvas.dataset.dragonRotation = synchronizedDragonRotation.toFixed(4);
      canvas.dataset.dragonUndulation = dragonUndulationProgress.toFixed(3);
      canvas.dataset.dragonSwayX = dragonSway.toFixed(3);
      canvas.dataset.dragonSwayZ = dragonDepthSway.toFixed(3);
      canvas.dataset.dragonRoll = dragonRoll.toFixed(4);
      canvas.dataset.dragonChapter = dragonChapter;
      canvas.dataset.dragonSectionIndex = String(dragonSectionIndex);
      canvas.dataset.dragonTrack = dragonTrackProgress.toFixed(3);
      dragonPivot.scale.set(1, 1, 1);
      emberField.rotation.y = centerpieceTime * 0.2 - rotation * 0.18;
      emberField.position.y = 0.2 + Math.sin(centerpieceTime * 0.32) * 0.08;
      const centerpieceOpacity = dragonArrivalProgress * (1 - clamp((exit - 0.24) / 0.76));
      dragonMaterials.forEach((material) => { material.opacity = centerpieceOpacity; });
      emberMaterial.opacity = centerpieceOpacity * 0.94;
      trailMaterial.opacity = stageOpacity * 0.28;
      arrowMaterial.opacity = stageOpacity * 0.95;
      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(render);
    };

    render();
    return () => {
      disposed = true;
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("webglcontextlost", contextLost);
      window.removeEventListener("scroll", syncToScroll);
      textures.forEach((texture) => texture.dispose());
      dragonModel?.traverse((child) => {
        if (!child.isMesh) return;
        child.geometry?.dispose();
      });
      dragonMaterials.forEach((material) => {
        material.map?.dispose();
        material.dispose();
      });
      dracoLoader.dispose();
      emberGeometry.dispose();
      emberMaterial.dispose();
      cardGeometry.dispose();
      borderGeometry.dispose();
      trailGeometry.dispose();
      trailMaterial.dispose();
      arrowGeometry.dispose();
      arrowMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className="food-orbit-canvas" aria-hidden="true" />;
}

function NorenGate() {
  const wordmark = (
    <div className="noren-wordmark">
      <strong>中華の王道</strong>
    </div>
  );

  return (
    <div className="noren-gate" aria-hidden="true">
      <div className="noren-panel noren-panel--left">
        <img
          className="noren-cloth"
          src={assetUrl("noren.jpg")}
          alt=""
          fetchPriority="high"
          decoding="sync"
          draggable="false"
        />
        {wordmark}
      </div>
      <div className="noren-panel noren-panel--right">
        <img
          className="noren-cloth"
          src={assetUrl("noren.jpg")}
          alt=""
          fetchPriority="high"
          decoding="sync"
          draggable="false"
        />
        {wordmark}
      </div>
      <div className="noren-rail">
        <img src={assetUrl("noren.jpg")} alt="" draggable="false" />
      </div>
      <div className="noren-mist" />
    </div>
  );
}

export function App() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [phase, setPhase] = useState("hero");
  const [sceneReady, setSceneReady] = useState(false);
  const [webglUnavailable, setWebglUnavailable] = useState(() => new URLSearchParams(window.location.search).get("fallback") === "1");
  const forceReducedMotion = new URLSearchParams(window.location.search).get("reduced") === "1";
  const experienceRef = useRef(null);
  const videoRef = useRef(null);
  const activeProduct = products[activeIndex];

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    const ensurePlayback = () => {
      video.muted = true;
      video.defaultMuted = true;
      if (!video.paused) {
        video.dataset.playbackState = "playing";
        return;
      }
      video.play()
        .then(() => { video.dataset.playbackState = "playing"; })
        .catch(() => { video.dataset.playbackState = "waiting"; });
    };

    const resumeWhenVisible = () => {
      if (!document.hidden) ensurePlayback();
    };

    ensurePlayback();
    window.addEventListener("pageshow", ensurePlayback);
    window.addEventListener("focus", ensurePlayback);
    window.addEventListener("pointerdown", ensurePlayback, { passive: true });
    window.addEventListener("touchstart", ensurePlayback, { passive: true });
    video.addEventListener("loadeddata", ensurePlayback);
    video.addEventListener("canplay", ensurePlayback);
    document.addEventListener("visibilitychange", resumeWhenVisible);
    return () => {
      window.removeEventListener("pageshow", ensurePlayback);
      window.removeEventListener("focus", ensurePlayback);
      window.removeEventListener("pointerdown", ensurePlayback);
      window.removeEventListener("touchstart", ensurePlayback);
      video.removeEventListener("loadeddata", ensurePlayback);
      video.removeEventListener("canplay", ensurePlayback);
      document.removeEventListener("visibilitychange", resumeWhenVisible);
    };
  }, []);

  useEffect(() => {
    let timerId = 0;
    const revealScene = () => setSceneReady(true);
    const revealAfterLoad = () => {
      timerId = window.setTimeout(revealScene, 240);
    };

    if (document.readyState === "complete") revealAfterLoad();
    else window.addEventListener("load", revealAfterLoad, { once: true });
    window.addEventListener("scroll", revealScene, { once: true, passive: true });
    window.addEventListener("pointerdown", revealScene, { once: true, passive: true });
    window.addEventListener("touchstart", revealScene, { once: true, passive: true });

    return () => {
      window.clearTimeout(timerId);
      window.removeEventListener("load", revealAfterLoad);
      window.removeEventListener("scroll", revealScene);
      window.removeEventListener("pointerdown", revealScene);
      window.removeEventListener("touchstart", revealScene);
    };
  }, []);

  useEffect(() => {
    const experience = experienceRef.current;
    const lastOrderTitleChar = experience.querySelector(".order-title__char:last-child");
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frameId = 0;
    let orderTitleHoldTimer = 0;
    let orderTitleHoldStarted = false;
    let orderTitleHoldComplete = false;

    const resetOrderTitleHold = () => {
      window.clearTimeout(orderTitleHoldTimer);
      orderTitleHoldTimer = 0;
      orderTitleHoldStarted = false;
      orderTitleHoldComplete = false;
      experience.dataset.orderTitleHold = "ready";
      experience.dataset.orderTitleBlur = "idle";
    };

    const releaseOrderTitleHold = () => {
      if (!orderTitleHoldStarted) return;
      window.clearTimeout(orderTitleHoldTimer);
      orderTitleHoldTimer = 0;
      orderTitleHoldStarted = false;
      orderTitleHoldComplete = true;
      experience.dataset.orderTitleHold = "released";
      experience.dataset.orderTitleBlur = "active";
      requestUpdate();
    };

    const handleOrderTitleAnimationEnd = (event) => {
      if (event.animationName === "order-title-blur-in") {
        releaseOrderTitleHold();
      }
    };

    const update = () => {
      const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      const rawProgress = clamp(window.scrollY / maxScroll);
      const reduceMotion = reducedMotionQuery.matches || forceReducedMotion;
      let progress = rawProgress;

      if (reduceMotion) {
        window.clearTimeout(orderTitleHoldTimer);
        orderTitleHoldTimer = 0;
        orderTitleHoldStarted = false;
        orderTitleHoldComplete = false;
        experience.dataset.orderTitleHold = "skipped";
        experience.dataset.orderTitleBlur = "settled";
      } else {
        if (
          (orderTitleHoldStarted || orderTitleHoldComplete)
          && rawProgress < ORDER_TITLE_HOLD_PROGRESS - 0.004
        ) {
          resetOrderTitleHold();
        }

        if (
          !orderTitleHoldComplete
          && (orderTitleHoldStarted || rawProgress >= ORDER_TITLE_HOLD_PROGRESS)
        ) {
          if (!orderTitleHoldStarted) {
            orderTitleHoldStarted = true;
            experience.dataset.orderTitleHold = "locked";
            experience.dataset.orderTitleBlur = "active";
            orderTitleHoldTimer = window.setTimeout(
              releaseOrderTitleHold,
              ORDER_TITLE_HOLD_FALLBACK_MS,
            );
          }

          progress = ORDER_TITLE_HOLD_PROGRESS;
          const holdScrollY = maxScroll * ORDER_TITLE_HOLD_PROGRESS;
          if (Math.abs(window.scrollY - holdScrollY) > 1) {
            const scroller = document.scrollingElement ?? document.documentElement;
            scroller.scrollTop = holdScrollY;
          }
        } else if (orderTitleHoldComplete) {
          experience.dataset.orderTitleHold = "released";
          experience.dataset.orderTitleBlur = "active";
        } else {
          experience.dataset.orderTitleHold = "ready";
          experience.dataset.orderTitleBlur = "idle";
        }
      }

      const norenProgress = clamp(progress / 0.24);
      const norenLead = delayedClothEase(norenProgress, 0.02);
      const norenShoulder = delayedClothEase(norenProgress, 0.08);
      const norenFold = delayedClothEase(norenProgress, 0.16);
      const norenMid = delayedClothEase(norenProgress, 0.27);
      const norenLower = delayedClothEase(norenProgress, 0.4);
      const norenHem = delayedClothEase(norenProgress, 0.52);
      const norenRightLead = delayedClothEase(norenProgress, 0.09);
      const norenRightShoulder = delayedClothEase(norenProgress, 0.16);
      const norenRightFold = delayedClothEase(norenProgress, 0.25);
      const norenRightMid = delayedClothEase(norenProgress, 0.37);
      const norenRightLower = delayedClothEase(norenProgress, 0.48);
      const norenRightHem = delayedClothEase(norenProgress, 0.58);
      const norenBillow = Math.sin(norenProgress * Math.PI);
      const norenPull = Math.sin(clamp(norenProgress * 1.12) * Math.PI);
      const norenOpacity = 1 - clamp((progress - 0.28) / 0.05);
      const norenMistIn = clamp(progress / 0.035);
      const norenMistOut = 1 - clamp((progress - 0.235) / 0.045);
      const norenMistOpacity = norenMistIn * norenMistOut * 0.76;
      const arrivalTitleIn = clamp((progress - 0.285) / 0.025);
      const arrivalTitleOut = 1 - clamp((progress - 0.35) / 0.025);
      const arrivalTitleOpacity = arrivalTitleIn * arrivalTitleOut;
      const arrivalOriginIn = clamp((progress - 0.36) / 0.025);
      const arrivalOriginOut = 1 - clamp((progress - 0.415) / 0.025);
      const arrivalOriginOpacity = arrivalOriginIn * arrivalOriginOut;
      const arrivalConfidenceIn = clamp((progress - 0.43) / 0.025);
      const arrivalConfidenceOut = 1 - clamp((progress - 0.505) / 0.03);
      const arrivalConfidenceOpacity = arrivalConfidenceIn * arrivalConfidenceOut;
      const dragonArrivalProgress = getDragonArrivalProgress(progress);
      const dragonGlyphIn = clamp((progress - 0.535) / 0.012);
      const dragonGlyphOut = 1 - clamp((progress - 0.575) / 0.015);
      const dragonGlyphOpacity = dragonGlyphIn * dragonGlyphOut;
      const heroExit = clamp((progress - 0.33) / 0.06);
      const heroControlsIn = clamp((progress - 0.34) / 0.05);
      const orderIn = getOrderProgress(progress);
      const visitIn = getVisitProgress(progress);
      const heroFade = 1 - clamp((progress - ORDER_SCROLL_START) / 0.012);
      experience.style.setProperty("--page-progress", progress.toFixed(3));
      experience.style.setProperty("--noren-left-apex-y", `${(100 - norenLead * 69).toFixed(2)}%`);
      experience.style.setProperty("--noren-right-apex-y", `${(100 - norenRightLead * 60).toFixed(2)}%`);
      experience.style.setProperty("--noren-left-shoulder-x", `${(50 - norenShoulder * 8).toFixed(2)}%`);
      experience.style.setProperty("--noren-left-shoulder-y", `${(100 - norenShoulder * 64).toFixed(2)}%`);
      experience.style.setProperty("--noren-right-shoulder-x", `${(50 + norenRightShoulder * 7).toFixed(2)}%`);
      experience.style.setProperty("--noren-right-shoulder-y", `${(100 - norenRightShoulder * 56).toFixed(2)}%`);
      experience.style.setProperty("--noren-left-fold-x", `${(50 - norenFold * 18).toFixed(2)}%`);
      experience.style.setProperty("--noren-right-fold-x", `${(50 + norenRightFold * 17).toFixed(2)}%`);
      experience.style.setProperty("--noren-left-fold-y", `${(100 - norenFold * 56).toFixed(2)}%`);
      experience.style.setProperty("--noren-right-fold-y", `${(100 - norenRightFold * 49).toFixed(2)}%`);
      experience.style.setProperty("--noren-left-mid-x", `${(50 - norenMid * 30).toFixed(2)}%`);
      experience.style.setProperty("--noren-left-mid-y", `${(100 - norenMid * 38).toFixed(2)}%`);
      experience.style.setProperty("--noren-right-mid-x", `${(50 + norenRightMid * 29).toFixed(2)}%`);
      experience.style.setProperty("--noren-right-mid-y", `${(100 - norenRightMid * 34).toFixed(2)}%`);
      experience.style.setProperty("--noren-left-lower-x", `${(50 - norenLower * 40).toFixed(2)}%`);
      experience.style.setProperty("--noren-left-lower-y", `${(100 - norenLower * 18).toFixed(2)}%`);
      experience.style.setProperty("--noren-right-lower-x", `${(50 + norenRightLower * 39).toFixed(2)}%`);
      experience.style.setProperty("--noren-right-lower-y", `${(100 - norenRightLower * 16).toFixed(2)}%`);
      experience.style.setProperty("--noren-left-hem-x", `${(50 - norenHem * 42).toFixed(2)}%`);
      experience.style.setProperty("--noren-right-hem-x", `${(50 + norenRightHem * 41).toFixed(2)}%`);
      experience.style.setProperty("--noren-left-tilt", `${(norenLead * 6.2 + norenPull * 1.2).toFixed(2)}deg`);
      experience.style.setProperty("--noren-right-tilt", `${(norenRightLead * -5.4 - norenPull * 0.9).toFixed(2)}deg`);
      experience.style.setProperty("--noren-left-roll", `${(norenLead * -2 + norenPull * 1.1).toFixed(2)}deg`);
      experience.style.setProperty("--noren-right-roll", `${(norenRightLead * 1.6 - norenPull * 0.75).toFixed(2)}deg`);
      experience.style.setProperty("--noren-left-depth", `${(norenBillow * 34).toFixed(2)}px`);
      experience.style.setProperty("--noren-right-depth", `${(norenBillow * 27).toFixed(2)}px`);
      experience.style.setProperty("--noren-left-bend", `${(norenBillow * 2.8).toFixed(2)}deg`);
      experience.style.setProperty("--noren-right-bend", `${(norenBillow * -2.2).toFixed(2)}deg`);
      experience.style.setProperty("--noren-left-shift", `${(norenBillow * -1.35 - norenLead * 0.25).toFixed(2)}%`);
      experience.style.setProperty("--noren-right-shift", `${(norenBillow * 1.15 + norenRightLead * 0.2).toFixed(2)}%`);
      experience.style.setProperty("--noren-opacity", norenOpacity.toFixed(3));
      experience.style.setProperty("--noren-mist-opacity", norenMistOpacity.toFixed(3));
      experience.style.setProperty("--arrival-title-opacity", arrivalTitleOpacity.toFixed(3));
      experience.style.setProperty("--arrival-origin-opacity", arrivalOriginOpacity.toFixed(3));
      experience.style.setProperty("--arrival-confidence-opacity", arrivalConfidenceOpacity.toFixed(3));
      experience.style.setProperty("--dragon-arrival-progress", dragonArrivalProgress.toFixed(3));
      experience.style.setProperty("--dragon-glyph-opacity", dragonGlyphOpacity.toFixed(3));
      experience.style.setProperty("--dragon-glyph-lift", `${(-dragonArrivalProgress * 18).toFixed(2)}vh`);
      experience.style.setProperty("--hero-exit", heroExit.toFixed(3));
      experience.style.setProperty("--hero-controls-in", heroControlsIn.toFixed(3));
      experience.style.setProperty("--hero-opacity", heroFade.toFixed(3));
      experience.style.setProperty("--menu-opacity", "0");
      experience.style.setProperty("--story-opacity", "0");
      experience.style.setProperty("--order-opacity", orderIn.toFixed(3));
      experience.style.setProperty("--visit-opacity", visitIn.toFixed(3));
      const nextPhase = progress < ORDER_SCROLL_START
        ? "hero"
        : progress < VISIT_SCROLL_START ? "order" : "visit";
      setPhase((current) => (current === nextPhase ? current : nextPhase));
    };

    const requestUpdate = () => {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(update);
    };

    update();
    lastOrderTitleChar?.addEventListener("animationend", handleOrderTitleAnimationEnd);
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(orderTitleHoldTimer);
      lastOrderTitleChar?.removeEventListener("animationend", handleOrderTitleAnimationEnd);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      delete experience.dataset.orderTitleBlur;
      delete experience.dataset.orderTitleHold;
    };
  }, []);

  const scrollToProgress = (progress) => {
    const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches || forceReducedMotion;
    window.scrollTo({ top: maxScroll * progress, behavior: reduceMotion ? "auto" : "smooth" });
  };

  const goToProduct = (index) => {
    setActiveIndex(index);
    scrollToProgress(getProductScrollProgress(index, products.length));
  };

  return (
    <main
      ref={experienceRef}
      className="experience"
      data-phase={phase}
      data-reduced-motion={forceReducedMotion ? "true" : undefined}
    >
      <NorenGate />
      <section className="arrival-title" aria-label="中華の王道の物語">
        <div className="arrival-title__mark">
          <strong aria-label="中華の王道">
            <span aria-hidden="true">中</span>
            <span aria-hidden="true">華</span>
            <span aria-hidden="true">の</span>
            <span aria-hidden="true">王</span>
            <span aria-hidden="true">道</span>
          </strong>
          <small>創業一九七二年</small>
        </div>
        <p className="arrival-title__copy arrival-title__copy--origin">
          <span>一九七二年、街角の小さな厨房から。</span>
          <span>火の音と香りを頼りに、王道のひと皿を磨いてきました。</span>
        </p>
        <p className="arrival-title__copy arrival-title__copy--confidence">
          <span>受け継いだ技と、選び抜いた素材。</span>
          <span>まっすぐに旨い。その味に、私たちは自信があります。</span>
        </p>
      </section>
      <div className="dragon-arrival-type" aria-hidden="true">
        <span>香</span><span>火</span><span>技</span><span>旬</span><span>旨</span>
        <span>心</span><span>一</span><span>皿</span><span>王</span><span>道</span>
      </div>
      <video
        ref={videoRef}
        className="video-backdrop"
        src={assetUrl("background.mp4")}
        poster={assetUrl("paper-texture.jpg")}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        disablePictureInPicture
        tabIndex={-1}
        aria-hidden="true"
        onCanPlay={(event) => event.currentTarget.play().catch(() => {})}
      />
      <div className="paper-noise" aria-hidden="true" />
      <div className="lattice-backdrop" aria-hidden="true" />
      <div className="sun-mark" aria-hidden="true" />
      <RedInkFluid
        active={phase === "order" || phase === "visit"}
        forceFallback={webglUnavailable}
        forceReducedMotion={forceReducedMotion}
      />

      <header className="top-nav">
        <button className="brand-button" type="button" onClick={() => scrollToProgress(0)} aria-label="ページ先頭へ">
          <strong>中華の王道</strong>
          <small>CHUKA NO ODO</small>
        </button>
      </header>

      <section id="menu" className="hero-stage" aria-label="3Dメニュー体験">
        <h1 className="sr-only">中華の王道 3Dメニュー体験</h1>

        {webglUnavailable ? (
          <div className="orbit-fallback" aria-label="料理9品と来店案内の10パネル">
            {products.map((product, index) => (
              <button
                key={product.id}
                className={product.kind === "cta" ? "orbit-fallback__cta" : undefined}
                type="button"
                onClick={() => goToProduct(index)}
                aria-current={index === activeIndex ? "true" : undefined}
              >
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    width="1536"
                    height="1024"
                    loading={index === 0 ? "eager" : "lazy"}
                    decoding="async"
                  />
                ) : (
                  <span className="orbit-fallback__cta-mark" aria-hidden="true"><b>↗</b><small>VISIT</small></span>
                )}
                <strong>{product.name}</strong>
              </button>
            ))}
          </div>
        ) : sceneReady ? (
          <FoodOrbitCanvas onActiveChange={setActiveIndex} onUnavailable={() => setWebglUnavailable(true)} />
        ) : null}

        <aside className="menu-selector" aria-label="料理9品と来店案内を選択">
          <p>螺旋の十景から選ぶ</p>
          {products.map((product, index) => (
            <button
              key={product.id}
              type="button"
              className={`${index === activeIndex ? "is-active" : ""}${product.kind === "cta" ? " is-visit" : ""}`.trim()}
              aria-current={index === activeIndex ? "true" : undefined}
              onClick={() => goToProduct(index)}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              {product.name}
            </button>
          ))}
        </aside>

        <div className={`active-detail${activeProduct.kind === "cta" ? " is-cta" : ""}`} aria-live="polite">
          <span>{activeProduct.category}</span>
          <strong>{activeProduct.name}</strong>
          <p>{activeProduct.copy}</p>
          {activeProduct.kind === "cta" ? (
            <button className="active-detail__cta" type="button" onClick={() => scrollToProgress(0.985)}>
              お席のご案内へ <span aria-hidden="true">↗</span>
            </button>
          ) : null}
        </div>

        <div className="flavor-ticker" aria-hidden="true">
          <span>香</span><i>火</i><span>旬</span><i>技</i><span>彩</span><i>余</i><span>一皿ごとに、記憶に残る中華</span>
        </div>
        <button className="scroll-cue" type="button" onClick={() => goToProduct(0)}>SCROLL TO CHOOSE</button>
      </section>

      <section id="contact" className="order-stage" aria-labelledby="order-title">
        <h2 id="order-title" aria-label={closingMessage}>
          {Array.from(closingMessage).map((character, index) => (
            <span
              className="order-title__char"
              style={{ "--blur-index": index }}
              aria-hidden="true"
              key={`${character}-${index}`}
            >
              {character}
            </span>
          ))}
        </h2>
      </section>

      <section id="visit" className="visit-stage" aria-label="お店へのご案内">
        <a
          className="order-visit-cta breathing-glow"
          href="https://www.google.com/maps/search/?api=1&query=%E4%B8%AD%E8%8F%AF%E3%81%AE%E7%8E%8B%E9%81%93"
          target="_blank"
          rel="noreferrer"
          aria-label="お店に行く（Google マップを開く）"
        >
          <span>お店に行く</span>
          <ArrowUpRight aria-hidden="true" />
        </a>
      </section>

      <footer className="footer-strip">
        <span>中華の王道 MENU EXPERIENCE</span>
        <button type="button" onClick={() => scrollToProgress(0)}>ページ先頭へ</button>
      </footer>

      <div className="scroll-progress" aria-hidden="true"><span /></div>
    </main>
  );
}
