import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import * as THREE from "three";
import {
  AUTO_ROTATION_SECONDS,
  clamp,
  getDragonScrollRotation,
  getOrbitProgress,
  getProductScrollProgress,
  getScrollRotation,
} from "./orbitMath.js";

const products = [
  {
    id: "gyoza",
    name: "香煎焼き餃子",
    latin: "PAN-SEARED DUMPLINGS",
    category: "点心",
    copy: "薄皮を香ばしく焼き上げ、野菜の甘みを閉じ込めました。",
    image: "/assets/odo/gyoza.jpg",
  },
  {
    id: "shoyu-men",
    name: "香味醤油麺",
    latin: "AROMATIC SOY NOODLES",
    category: "湯麺",
    copy: "澄んだ醤油スープに、香味油の余韻を重ねた一杯。",
    image: "/assets/odo/shoyu-men.jpg",
  },
  {
    id: "sesame-chicken",
    name: "胡麻だれ蒸し鶏",
    latin: "SESAME POACHED CHICKEN",
    category: "冷菜",
    copy: "しっとり蒸し鶏と胡瓜を、香ばしい胡麻だれで。",
    image: "/assets/odo/sesame-chicken.jpg",
  },
  {
    id: "black-vinegar-pork",
    name: "黒酢香る酢豚",
    latin: "BLACK VINEGAR PORK",
    category: "熱菜",
    copy: "芳醇な黒酢の酸味と、果実の甘みを艶やかに。",
    image: "/assets/odo/black-vinegar-pork.jpg",
  },
  {
    id: "shrimp-greens",
    name: "海老と青菜の塩炒め",
    latin: "PRAWNS & JADE GREENS",
    category: "炒菜",
    copy: "海老と旬の青菜を、生姜の香りで軽やかに炒めます。",
    image: "/assets/odo/shrimp-greens.jpg",
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
    context.fillStyle = "#eceee9";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#081310";
    context.fillRect(0, 0, canvas.width, 70);
    context.fillRect(0, canvas.height - 168, canvas.width, 168);
    context.fillStyle = "#0d1714";
    context.fillRect(846, 70, canvas.width - 846, canvas.height - 238);
    context.strokeStyle = "#b99a68";
    context.lineWidth = 10;
    context.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);
    context.strokeStyle = "#78938a";
    context.lineWidth = 2;
    context.strokeRect(18, 18, canvas.width - 36, canvas.height - 36);

    if (image) {
      const imageArea = { x: 38, y: 84, width: 786, height: 478 };
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

    context.fillStyle = "#f1eee5";
    context.font = '700 25px "Yu Gothic", "Hiragino Kaku Gothic ProN", sans-serif';
    context.fillText(product.category, 48, 46);
    context.textAlign = "right";
    context.fillText(product.latin, 1148, 46);
    context.textAlign = "left";

    context.fillStyle = "#f4f0e6";
    context.font = '600 52px "Yu Mincho", "Hiragino Mincho ProN", serif';
    const titleLines = product.name.length > 7 ? [product.name.slice(0, 7), product.name.slice(7)] : [product.name];
    titleLines.forEach((line, lineIndex) => context.fillText(line, 872, 236 + lineIndex * 68));
    context.fillStyle = "#c98770";
    context.font = '600 20px "Arial", sans-serif';
    context.fillText(product.latin, 876, titleLines.length > 1 ? 402 : 324);
    context.fillStyle = "#b9c9c3";
    context.font = '600 20px "Yu Gothic", "Hiragino Kaku Gothic ProN", sans-serif';
    context.fillText("香・火・余韻", 872, 474);

    context.strokeStyle = "#b99a68";
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(872, 504);
    context.lineTo(1142, 504);
    context.stroke();

    context.fillStyle = "#f4f0e6";
    context.font = '600 52px "Yu Mincho", "Hiragino Mincho ProN", serif';
    context.fillText(product.name, 58, 686);
    context.textAlign = "right";
    context.font = '500 28px "Arial", sans-serif';
    context.fillText(String(index + 1).padStart(2, "0"), 1140, 686);
    context.textAlign = "left";
    texture.needsUpdate = true;
  };

  draw(null);
  const image = new Image();
  image.decoding = "async";
  image.onload = () => draw(image);
  image.src = product.image;
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
    renderer.setClearColor(0x000000, 0);

    const orbitRoot = new THREE.Group();
    const centerpieceRoot = new THREE.Group();
    scene.add(centerpieceRoot, orbitRoot);

    const cardGeometry = createRoundedPlane(3.55, 2.35, 0.12);
    const borderGeometry = createRoundedPlane(3.67, 2.47, 0.14);
    const groups = [];
    const cardMaterials = [];
    const textures = [];

    products.forEach((product, index) => {
      const group = new THREE.Group();
      const borderMaterial = new THREE.MeshBasicMaterial({
        color: index === 0 ? 0xb99a68 : 0x284b45,
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

    const trailPoints = Array.from({ length: 128 }, (_, index) => {
      const angle = (index / 128) * Math.PI * 2;
      return new THREE.Vector3(Math.sin(angle), Math.sin(angle + 0.2), Math.cos(angle));
    });
    const trailCurve = new THREE.CatmullRomCurve3(trailPoints, true, "catmullrom", 0.5);
    const trailGeometry = new THREE.TubeGeometry(trailCurve, 128, 0.008, 4, true);
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
    const orbitArrows = Array.from({ length: 3 }, () => {
      const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);
      arrow.renderOrder = 45;
      orbitRoot.add(arrow);
      return arrow;
    });
    const arrowAxis = new THREE.Vector3(0, 1, 0);
    const arrowTangents = orbitArrows.map(() => new THREE.Vector3());

    const textureLoader = new THREE.TextureLoader();
    const dragonTexture = textureLoader.load("/assets/odo/dragon-column.png");
    dragonTexture.colorSpace = THREE.SRGBColorSpace;
    const dragonMaterial = new THREE.ShaderMaterial({
      uniforms: {
        map: { value: dragonTexture },
        opacity: { value: 0 },
        turn: { value: 0 },
        relief: { value: 0.26 },
        texelSize: { value: new THREE.Vector2(1 / 768, 1 / 1366) },
      },
      vertexShader: `
        uniform sampler2D map;
        uniform float turn;
        uniform float relief;
        varying vec2 vUv;

        void main() {
          vUv = uv;
          vec3 transformed = position;
          vec4 surface = texture2D(map, uv);
          float luminance = dot(surface.rgb, vec3(0.2126, 0.7152, 0.0722));
          float reliefHeight = surface.a * (0.24 + luminance * 0.76);
          float verticalPhase = (uv.y - 0.5) * 0.78;
          float twist = turn + verticalPhase;
          float width = 0.78 + abs(cos(twist)) * 0.22;
          transformed.x *= width;
          transformed.x += sin(twist + uv.y * 1.7) * 0.055;
          transformed.z += sin(twist) * position.x * 0.2;
          transformed.z += reliefHeight * relief;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D map;
        uniform float opacity;
        uniform float turn;
        uniform vec2 texelSize;
        varying vec2 vUv;

        float surfaceHeight(vec2 sampleUv) {
          vec4 sampleColor = texture2D(map, sampleUv);
          float sampleLuminance = dot(sampleColor.rgb, vec3(0.2126, 0.7152, 0.0722));
          return sampleColor.a * (0.24 + sampleLuminance * 0.76);
        }

        void main() {
          vec4 source = texture2D(map, vUv);
          if (source.a < 0.01) discard;

          float leftHeight = surfaceHeight(vUv - vec2(texelSize.x * 2.0, 0.0));
          float rightHeight = surfaceHeight(vUv + vec2(texelSize.x * 2.0, 0.0));
          float lowerHeight = surfaceHeight(vUv - vec2(0.0, texelSize.y * 2.0));
          float upperHeight = surfaceHeight(vUv + vec2(0.0, texelSize.y * 2.0));
          vec3 surfaceNormal = normalize(vec3(
            (leftHeight - rightHeight) * 4.4,
            (lowerHeight - upperHeight) * 4.4,
            0.72
          ));
          vec3 lightDirection = normalize(vec3(sin(turn), 0.38, 0.82));
          float diffuse = max(dot(surfaceNormal, lightDirection), 0.0);
          float edgeLight = pow(1.0 - max(surfaceNormal.z, 0.0), 2.0);
          float sweep = 0.92 + diffuse * 0.18 + edgeLight * 0.08;
          vec3 reliefColor = source.rgb * sweep;
          reliefColor += vec3(0.16, 0.085, 0.02) * edgeLight;
          gl_FragColor = vec4(reliefColor, source.a * opacity);
        }
      `,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const dragonGeometry = new THREE.PlaneGeometry(2.92, 5.2, 56, 88);
    const dragon = new THREE.Mesh(dragonGeometry, dragonMaterial);
    dragon.position.set(0, 0.14, 0.02);
    dragon.renderOrder = 24;
    centerpieceRoot.add(dragon);

    const emberCount = 110;
    const emberPositions = new Float32Array(emberCount * 3);
    const emberColors = new Float32Array(emberCount * 3);
    const emberGold = new THREE.Color(0xc9ad79);
    const emberRed = new THREE.Color(0x83aa9d);
    for (let index = 0; index < emberCount; index += 1) {
      const progress = index / (emberCount - 1);
      const angle = progress * Math.PI * 10 + (index % 7) * 0.43;
      const radius = 0.16 + (((index * 37) % 100) / 100) * 0.58;
      emberPositions[index * 3] = Math.cos(angle) * radius;
      emberPositions[index * 3 + 1] = -3.05 + progress * 6.25;
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
      size: 0.034,
      vertexColors: true,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    const emberField = new THREE.Points(emberGeometry, emberMaterial);
    emberField.renderOrder = 23;
    centerpieceRoot.add(emberField);

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const forceReducedMotion = new URLSearchParams(window.location.search).get("reduced") === "1";
    const isReducedMotion = () => reduceMotion.matches || forceReducedMotion;
    const drag = { active: false, x: 0, velocity: 0 };
    let manualOffset = 0;
    let autoOffset = 0;
    let rotation = 0;
    let dragonRotation = 0;
    let frameId = 0;
    let lastActive = -1;
    let compact = false;
    let lastTime = performance.now();
    let elapsed = 0;
    let pauseAutoUntil = 0;
    let hovered = false;

    const selectProduct = () => {
      autoOffset = 0;
      manualOffset = 0;
      drag.velocity = 0;
      pauseAutoUntil = performance.now() + 2200;
    };

    const pointerEnter = () => {
      hovered = true;
    };

    const pointerLeave = () => {
      hovered = false;
      if (drag.active) {
        drag.active = false;
        canvas.classList.remove("is-dragging");
        pauseAutoUntil = performance.now() + 2200;
      }
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
      camera.fov = compact ? 41 : 35;
      camera.position.set(0, 0, compact ? 10.8 : 9.2);
      camera.updateProjectionMatrix();
      orbitRoot.position.set(0, compact ? -0.64 : -0.08, 0);
      centerpieceRoot.position.copy(orbitRoot.position);
      centerpieceRoot.scale.setScalar(compact ? 0.82 : 1);
      dragonMaterial.uniforms.relief.value = compact ? 0.18 : 0.26;
    };

    const pointerDown = (event) => {
      drag.active = true;
      drag.x = event.clientX;
      drag.velocity = 0;
      canvas.setPointerCapture?.(event.pointerId);
      canvas.classList.add("is-dragging");
    };

    const pointerMove = (event) => {
      const rect = canvas.getBoundingClientRect();
      if (!isReducedMotion()) {
        orbitRoot.rotation.x = ((event.clientY - rect.top) / rect.height - 0.5) * -0.045;
        orbitRoot.rotation.y = ((event.clientX - rect.left) / rect.width - 0.5) * 0.07;
      }
      if (!drag.active) return;
      const delta = event.clientX - drag.x;
      drag.x = event.clientX;
      drag.velocity = delta * (compact ? 0.008 : 0.006);
      manualOffset += drag.velocity;
    };

    const pointerUp = (event) => {
      drag.active = false;
      canvas.releasePointerCapture?.(event.pointerId);
      canvas.classList.remove("is-dragging");
      pauseAutoUntil = performance.now() + 2200;
    };

    canvas.addEventListener("pointerenter", pointerEnter);
    canvas.addEventListener("pointerleave", pointerLeave);
    canvas.addEventListener("pointerdown", pointerDown);
    canvas.addEventListener("pointermove", pointerMove);
    canvas.addEventListener("pointerup", pointerUp);
    canvas.addEventListener("pointercancel", pointerUp);
    canvas.addEventListener("webglcontextlost", contextLost);
    window.addEventListener("odo:select", selectProduct);
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
      const entry = clamp((orbitProgress - 0.015) / 0.16);
      const exit = clamp((orbitProgress - 0.91) / 0.09);
      const stageOpacity = entry * (1 - exit);

      if (!isReducedMotion() && !drag.active && entry > 0.05 && now > pauseAutoUntil) {
        const hoverSpeed = hovered ? 0.35 : 1;
        const autoPeriod = compact ? AUTO_ROTATION_SECONDS.mobile : AUTO_ROTATION_SECONDS.desktop;
        autoOffset += delta * ((Math.PI * 2) / autoPeriod) * hoverSpeed;
      }
      if (!drag.active) {
        manualOffset += drag.velocity;
        drag.velocity *= compact ? 0.9 : 0.92;
      }
      const targetRotation = isReducedMotion() ? 0 : getScrollRotation(pageProgress) + autoOffset + manualOffset;
      rotation += (targetRotation - rotation) * 0.085;
      const targetDragonRotation = isReducedMotion() ? 0 : getDragonScrollRotation(pageProgress);
      dragonRotation += (targetDragonRotation - dragonRotation) * 0.075;

      const radiusX = compact ? 1.56 : 2.72;
      const radiusY = compact ? 0.42 : 0.54;
      const depthZ = compact ? 0.92 : 1.34;
      const trailRadiusY = compact ? 0.94 : 1.16;
      orbitTrail.scale.set(radiusX, trailRadiusY, depthZ);
      let frontIndex = 0;
      let frontZ = -Infinity;

      groups.forEach((group, index) => {
        const angle = rotation + index * ((Math.PI * 2) / products.length);
        const x = Math.sin(angle) * radiusX;
        const z = Math.cos(angle) * depthZ;
        const frontness = (z + depthZ) / (depthZ * 2);
        const y = Math.sin(angle + 0.2) * radiusY - (1 - frontness) * (compact ? 0.48 : 0.72);
        const scale = (compact ? 0.42 : 0.48) + frontness * (compact ? 0.24 : 0.34);
        const centeredX = compact ? x * (1 - Math.pow(frontness, 4) * 0.9) : x;
        group.position.set(centeredX, y, z);
        group.scale.setScalar(scale);
        group.rotation.y = Math.sin(angle) * -0.48;
        group.rotation.z = Math.sin(angle) * -0.025;
        group.renderOrder = 10 + Math.round(frontness * 40);
        group.children.forEach((mesh) => { mesh.renderOrder = group.renderOrder; });
        cardMaterials[index].forEach((material, materialIndex) => {
          material.opacity = stageOpacity * (0.38 + frontness * 0.62) * (materialIndex === 0 ? 0.92 : 1);
        });
        if (z > frontZ) {
          frontZ = z;
          frontIndex = index;
        }
      });

      groups.forEach((group, index) => {
        const isActive = index === frontIndex;
        if (isActive) {
          group.scale.multiplyScalar(compact ? 1.05 : 1.08);
          group.position.y += 0.05;
          group.position.z += 0.15;
        }
        cardMaterials[index][0].color.setHex(isActive ? 0xb99a68 : 0x284b45);
      });

      orbitArrows.forEach((arrow, index) => {
        const motionTime = isReducedMotion() ? 0 : elapsed;
        const angle = motionTime * ((Math.PI * 2) / 6) + index * ((Math.PI * 2) / orbitArrows.length);
        arrow.position.set(
          Math.sin(angle) * radiusX,
          Math.sin(angle + 0.2) * trailRadiusY,
          Math.cos(angle) * depthZ,
        );
        const tangent = arrowTangents[index].set(
          Math.cos(angle) * radiusX,
          Math.cos(angle + 0.2) * trailRadiusY,
          -Math.sin(angle) * depthZ,
        ).normalize();
        arrow.quaternion.setFromUnitVectors(arrowAxis, tangent);
      });

      if (frontIndex !== lastActive) {
        lastActive = frontIndex;
        activeCallbackRef.current?.(frontIndex);
      }

      const centerpieceTime = isReducedMotion() ? 0 : elapsed;
      centerpieceRoot.rotation.x = Math.sin(dragonRotation * 0.5) * 0.025;
      centerpieceRoot.rotation.y = Math.sin(dragonRotation) * (compact ? 0.1 : 0.16);
      centerpieceRoot.rotation.z = Math.sin(centerpieceTime * 0.42) * 0.012;
      centerpieceRoot.position.y = (compact ? -0.64 : -0.08) + Math.sin(centerpieceTime * 0.38) * 0.055;
      dragon.scale.setScalar(1 + Math.sin(centerpieceTime * 0.5) * 0.008);
      emberField.rotation.y = centerpieceTime * 0.2 - rotation * 0.18;
      emberField.position.y = 0.2 + Math.sin(centerpieceTime * 0.32) * 0.08;
      dragonMaterial.uniforms.opacity.value = stageOpacity;
      dragonMaterial.uniforms.turn.value = dragonRotation;
      emberMaterial.opacity = stageOpacity * 0.88;
      trailMaterial.opacity = stageOpacity * 0.28;
      arrowMaterial.opacity = stageOpacity * 0.95;
      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(render);
    };

    render();
    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointerenter", pointerEnter);
      canvas.removeEventListener("pointerleave", pointerLeave);
      canvas.removeEventListener("pointerdown", pointerDown);
      canvas.removeEventListener("pointermove", pointerMove);
      canvas.removeEventListener("pointerup", pointerUp);
      canvas.removeEventListener("pointercancel", pointerUp);
      canvas.removeEventListener("webglcontextlost", contextLost);
      window.removeEventListener("odo:select", selectProduct);
      textures.forEach((texture) => texture.dispose());
      dragonTexture.dispose();
      dragonGeometry.dispose();
      dragonMaterial.dispose();
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
      <small>CONTEMPORARY CHINESE DINING</small>
      <strong>中華の王道</strong>
      <span>一皿一心</span>
    </div>
  );

  return (
    <div className="noren-gate" aria-hidden="true">
      <div className="noren-panel noren-panel--left">
        <img
          className="noren-cloth"
          src="/assets/odo/noren.jpg"
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
          src="/assets/odo/noren.jpg"
          alt=""
          fetchPriority="high"
          decoding="sync"
          draggable="false"
        />
        {wordmark}
      </div>
      <div className="noren-rail">
        <img src="/assets/odo/noren.jpg" alt="" draggable="false" />
      </div>
    </div>
  );
}

export function App() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [phase, setPhase] = useState("hero");
  const [menuOpen, setMenuOpen] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [webglUnavailable, setWebglUnavailable] = useState(() => new URLSearchParams(window.location.search).get("fallback") === "1");
  const experienceRef = useRef(null);
  const menuRef = useRef(null);
  const menuToggleRef = useRef(null);
  const activeProduct = products[activeIndex];

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
    if (!menuOpen) return undefined;
    const frameId = window.requestAnimationFrame(() => {
      menuRef.current?.querySelector("button")?.focus();
    });
    const closeOnEscape = (event) => {
      if (event.key !== "Escape") return;
      setMenuOpen(false);
      menuToggleRef.current?.focus();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen]);

  useEffect(() => {
    const experience = experienceRef.current;
    let frameId = 0;

    const update = () => {
      const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      const progress = clamp(window.scrollY / maxScroll);
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
      const heroExit = clamp((progress - 0.33) / 0.06);
      const heroControlsIn = clamp((progress - 0.34) / 0.05);
      const heroFade = 1 - clamp((progress - 0.6) / 0.1);
      const orderIn = clamp((progress - 0.6) / 0.1);
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
      experience.style.setProperty("--hero-exit", heroExit.toFixed(3));
      experience.style.setProperty("--hero-controls-in", heroControlsIn.toFixed(3));
      experience.style.setProperty("--hero-opacity", heroFade.toFixed(3));
      experience.style.setProperty("--menu-opacity", "0");
      experience.style.setProperty("--story-opacity", "0");
      experience.style.setProperty("--order-opacity", orderIn.toFixed(3));
      const nextPhase = progress < 0.65 ? "hero" : "order";
      setPhase((current) => (current === nextPhase ? current : nextPhase));
    };

    const requestUpdate = () => {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(update);
    };

    const keydown = (event) => {
      if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      const direction = event.key === 'ArrowRight' ? 1 : -1;
      const nextIndex = (activeIndex + direction + products.length) % products.length;
      goToProduct(nextIndex);
    };

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    window.addEventListener("keydown", keydown);
    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      window.removeEventListener("keydown", keydown);
    };
  }, [activeIndex]);

  const scrollToProgress = (progress) => {
    const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: maxScroll * progress, behavior: reduceMotion ? "auto" : "smooth" });
  };

  const goToProduct = (index) => {
    setActiveIndex(index);
    window.dispatchEvent(new CustomEvent("odo:select", { detail: { index } }));
    scrollToProgress(getProductScrollProgress(index, products.length));
  };

  return (
    <main ref={experienceRef} className="experience" data-phase={phase}>
      <NorenGate />
      <video
        className="video-backdrop"
        src={sceneReady ? "/assets/odo/background.mp4" : undefined}
        poster="/assets/odo/paper-texture.jpg"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        disablePictureInPicture
        tabIndex={-1}
        aria-hidden="true"
      />
      <div className="paper-noise" aria-hidden="true" />
      <div className="lattice-backdrop" aria-hidden="true" />
      <div className="sun-mark" aria-hidden="true" />

      <header className="top-nav">
        <button className="brand-button" type="button" onClick={() => scrollToProgress(0)} aria-label="ページ先頭へ">
          <strong>中華の王道</strong>
          <small>CHUKA NO ODO</small>
        </button>
        <nav ref={menuRef} id="main-menu" className={menuOpen ? "is-open" : ""} aria-label="メインメニュー">
          <button type="button" onClick={() => { scrollToProgress(0.3); setMenuOpen(false); }}>料理を選ぶ</button>
        </nav>
        <button
          ref={menuToggleRef}
          className="menu-toggle"
          type="button"
          aria-label={menuOpen ? "メニューを閉じる" : "メニューを開く"}
          aria-expanded={menuOpen}
          aria-controls="main-menu"
          onClick={() => setMenuOpen((current) => !current)}
        >
          {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
        <button className="order-button" type="button" onClick={() => scrollToProgress(0.6)}>お席のご案内</button>
      </header>

      <section id="menu" className="hero-stage" aria-label="3Dメニュー体験">
        <h1 className="sr-only">中華の王道 3Dメニュー体験</h1>

        {webglUnavailable ? (
          <div className="orbit-fallback" aria-label="おすすめメニュー5品">
            {products.map((product, index) => (
              <button key={product.id} type="button" onClick={() => goToProduct(index)} aria-current={index === activeIndex ? "true" : undefined}>
                <img
                  src={product.image}
                  alt={product.name}
                  width="1536"
                  height="1024"
                  loading={index === 0 ? "eager" : "lazy"}
                  decoding="async"
                />
                <strong>{product.name}</strong>
              </button>
            ))}
          </div>
        ) : sceneReady ? (
          <FoodOrbitCanvas onActiveChange={setActiveIndex} onUnavailable={() => setWebglUnavailable(true)} />
        ) : null}

        <aside className="menu-selector" aria-label="おすすめメニュー選択">
          <p>今日、何を食べる？</p>
          {products.map((product, index) => (
            <button
              key={product.id}
              type="button"
              className={index === activeIndex ? "is-active" : ""}
              aria-current={index === activeIndex ? "true" : undefined}
              onClick={() => goToProduct(index)}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              {product.name}
            </button>
          ))}
        </aside>

        <div className="active-detail" aria-live="polite">
          <span>{activeProduct.category}</span>
          <strong>{activeProduct.name}</strong>
          <p>{activeProduct.copy}</p>
        </div>

        <div className="flavor-ticker" aria-hidden="true">
          <span>香</span><i>火</i><span>旬</span><i>技</i><span>彩</span><i>余</i><span>一皿ごとに、記憶に残る中華</span>
        </div>
        <button className="scroll-cue" type="button" onClick={() => scrollToProgress(0.3)}>SCROLL TO CHOOSE</button>
      </section>

      <section id="contact" className="order-stage" aria-labelledby="order-title">
        <div className="order-brand" aria-hidden="true"><small>中華の</small><strong>王道</strong></div>
        <span>一皿一心 / CHUKA NO ODO</span>
        <h2 id="order-title">今日の一皿を、<br />心ゆくまで。</h2>
        <p>香り、火入れ、余韻。季節の食材で仕立てる現代の中華です。</p>
        <div className="order-actions">
          <button type="button" onClick={() => scrollToProgress(0.3)}>料理を選ぶ</button>
          <button type="button" onClick={() => scrollToProgress(0)}>暖簾へ戻る</button>
        </div>
      </section>

      <footer className="footer-strip">
        <span>中華の王道 MENU EXPERIENCE</span>
        <button type="button" onClick={() => scrollToProgress(0)}>ページ先頭へ</button>
      </footer>

      <div className="scroll-progress" aria-hidden="true"><span /></div>
    </main>
  );
}
