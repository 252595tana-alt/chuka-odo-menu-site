import { useEffect, useRef, useState } from "react";

const vertexShaderSource = `
  attribute vec2 aPosition;
  varying vec2 vUv;

  void main() {
    vUv = aPosition * 0.5 + 0.5;
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`;

const fragmentShaderSource = `
  precision highp float;

  varying vec2 vUv;
  uniform vec2 uResolution;
  uniform vec2 uPointer;
  uniform float uPointerEnergy;
  uniform float uTime;
  uniform float uMotion;

  float hash(vec2 point) {
    point = fract(point * vec2(123.34, 456.21));
    point += dot(point, point + 45.32);
    return fract(point.x * point.y);
  }

  float noise(vec2 point) {
    vec2 cell = floor(point);
    vec2 local = fract(point);
    local = local * local * (3.0 - 2.0 * local);

    float a = hash(cell);
    float b = hash(cell + vec2(1.0, 0.0));
    float c = hash(cell + vec2(0.0, 1.0));
    float d = hash(cell + vec2(1.0, 1.0));
    return mix(mix(a, b, local.x), mix(c, d, local.x), local.y);
  }

  float fbm(vec2 point) {
    float value = 0.0;
    float amplitude = 0.52;
    mat2 rotation = mat2(0.80, -0.60, 0.60, 0.80);
    for (int octave = 0; octave < 5; octave++) {
      value += amplitude * noise(point);
      point = rotation * point * 2.03 + vec2(17.1, 9.2);
      amplitude *= 0.5;
    }
    return value;
  }

  float bloom(vec2 point, vec2 origin, vec2 warp, float spread, float phase) {
    vec2 delta = point - origin + warp * 0.24;
    delta *= vec2(0.82, 1.18);
    float body = exp(-dot(delta, delta) * spread);
    float folds = fbm(delta * 4.2 + warp * 1.8 + phase);
    float petals = 0.58 + 0.42 * sin(atan(delta.y, delta.x) * 5.0 + folds * 8.0 - phase);
    return body * mix(0.56, 1.0, petals);
  }

  void main() {
    float aspect = uResolution.x / max(uResolution.y, 1.0);
    vec2 point = (vUv - 0.5) * vec2(aspect, 1.0);
    float time = uTime * uMotion;

    vec2 flow = vec2(
      fbm(point * 1.55 + vec2(time * 0.040, -time * 0.026)),
      fbm(point * 1.72 + vec2(-time * 0.031, time * 0.037) + 8.4)
    ) - 0.5;
    vec2 curl = vec2(
      fbm(point * 2.65 + flow * 1.8 + vec2(time * 0.072, 2.0)),
      fbm(point * 2.38 - flow * 1.6 + vec2(4.0, -time * 0.061))
    ) - 0.5;
    vec2 warp = flow * 0.58 + curl * 0.34;

    vec2 pointerPoint = (uPointer - 0.5) * vec2(aspect, 1.0);
    vec2 pointerDelta = point - pointerPoint;
    float lowerField = 1.0 - smoothstep(-0.30, 0.14, point.y);
    float pointerWake = exp(-dot(pointerDelta, pointerDelta) * 7.0) * uPointerEnergy * lowerField;
    float pointerLength = max(length(pointerDelta), 0.04);
    warp += vec2(-pointerDelta.y, pointerDelta.x) / pointerLength * pointerWake * 0.34;

    float ink = bloom(point, vec2(-aspect * 0.58, -0.52), warp, 9.4, time * 0.23);
    ink = max(ink, bloom(point, vec2(-aspect * 0.22, -0.62), -warp, 12.2, time * 0.19 + 1.7));
    ink = max(ink, bloom(point, vec2(aspect * 0.22, -0.58), warp.yx, 10.8, time * 0.21 + 3.1));
    ink = max(ink, bloom(point, vec2(aspect * 0.58, -0.50), -warp.yx, 9.8, time * 0.17 + 5.0));
    ink = max(ink, pointerWake * (0.34 + fbm(point * 7.0 + time * 0.08) * 0.42));

    float filaments = smoothstep(0.56, 0.88, fbm(point * 3.2 + warp * 2.5 + time * 0.025));
    filaments *= smoothstep(0.05, 0.64, ink);
    float rim = smoothstep(0.28, 0.72, ink) - smoothstep(0.74, 1.16, ink);
    float texture = fbm(point * 6.5 - warp * 2.0 + 3.7);

    vec3 inkJade = vec3(0.004, 0.12, 0.075);
    vec3 imperialJade = vec3(0.018, 0.50, 0.285);
    vec3 celadon = vec3(0.34, 0.78, 0.62);
    vec3 amberGold = vec3(0.92, 0.58, 0.18);
    vec3 color = mix(inkJade, imperialJade, smoothstep(0.05, 0.82, ink));
    color = mix(color, celadon, rim * (0.45 + texture * 0.35));
    float gilding = rim * smoothstep(0.62, 0.86, texture);
    color = mix(color, amberGold, clamp(gilding * 0.62 + filaments * 0.26, 0.0, 0.68));

    float centerQuiet = 1.0 - 0.34 * exp(-dot(point * vec2(0.72, 2.8), point * vec2(0.72, 2.8)) * 1.8);
    float inkBody = smoothstep(0.12, 0.68, ink);
    float alpha = clamp((inkBody * 0.54 + rim * 0.25 + filaments * 0.15) * centerQuiet * lowerField, 0.0, 0.82);
    gl_FragColor = vec4(color * alpha, alpha);
  }
`;

function compileShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
  gl.deleteShader(shader);
  return null;
}

export function RedInkFluid({ active, forceFallback = false, forceReducedMotion = false }) {
  const canvasRef = useRef(null);
  const [systemReducedMotion, setSystemReducedMotion] = useState(() => (
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ));
  const [mode, setMode] = useState(forceFallback ? "fallback" : "off");
  const reducedMotion = forceReducedMotion || systemReducedMotion;

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPreference = () => setSystemReducedMotion(media.matches);
    media.addEventListener("change", syncPreference);
    return () => media.removeEventListener("change", syncPreference);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!active || !canvas) {
      setMode(forceFallback ? "fallback" : "off");
      return undefined;
    }
    if (forceFallback) {
      setMode("fallback");
      return undefined;
    }

    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      depth: false,
      powerPreference: "low-power",
      premultipliedAlpha: true,
      preserveDrawingBuffer: false,
      stencil: false,
    });
    if (!gl) {
      setMode("fallback");
      return undefined;
    }

    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    if (!vertexShader || !fragmentShader) {
      vertexShader && gl.deleteShader(vertexShader);
      fragmentShader && gl.deleteShader(fragmentShader);
      setMode("fallback");
      return undefined;
    }

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      setMode("fallback");
      return undefined;
    }

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1, 1, -1, -1, 1,
      -1, 1, 1, -1, 1, 1,
    ]), gl.STATIC_DRAW);
    const positionLocation = gl.getAttribLocation(program, "aPosition");
    const resolutionLocation = gl.getUniformLocation(program, "uResolution");
    const pointerLocation = gl.getUniformLocation(program, "uPointer");
    const pointerEnergyLocation = gl.getUniformLocation(program, "uPointerEnergy");
    const timeLocation = gl.getUniformLocation(program, "uTime");
    const motionLocation = gl.getUniformLocation(program, "uMotion");
    const pointer = { x: 0.74, y: 0.34, targetX: 0.74, targetY: 0.34, energy: 0.36, targetEnergy: 0.36 };
    let frameId = 0;
    let disposed = false;
    let startTime = performance.now();

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, window.innerWidth < 760 ? 1.1 : 1.35);
      const width = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const height = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      gl.viewport(0, 0, width, height);
    };

    const onPointerMove = (event) => {
      const nextX = event.clientX / Math.max(window.innerWidth, 1);
      const nextY = 1 - event.clientY / Math.max(window.innerHeight, 1);
      const distance = Math.hypot(nextX - pointer.targetX, nextY - pointer.targetY);
      pointer.targetX = nextX;
      pointer.targetY = nextY;
      pointer.targetEnergy = Math.min(1, 0.32 + distance * 7.5);
    };

    const render = (now) => {
      if (disposed) return;
      resize();
      pointer.x += (pointer.targetX - pointer.x) * 0.085;
      pointer.y += (pointer.targetY - pointer.y) * 0.085;
      pointer.energy += (pointer.targetEnergy - pointer.energy) * 0.08;
      pointer.targetEnergy += (0.28 - pointer.targetEnergy) * 0.025;

      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      gl.uniform2f(pointerLocation, pointer.x, pointer.y);
      gl.uniform1f(pointerEnergyLocation, reducedMotion ? 0.22 : pointer.energy);
      gl.uniform1f(timeLocation, reducedMotion ? 18.0 : (now - startTime) / 1000);
      gl.uniform1f(motionLocation, reducedMotion ? 0.0 : 1.0);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      if (!reducedMotion && !document.hidden) frameId = window.requestAnimationFrame(render);
    };

    const onVisibilityChange = () => {
      if (document.hidden || reducedMotion) return;
      startTime = performance.now() - 1000;
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(render);
    };
    const onContextLost = (event) => {
      event.preventDefault();
      window.cancelAnimationFrame(frameId);
      setMode("fallback");
    };

    setMode(reducedMotion ? "static" : "interactive");
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);
    canvas.addEventListener("webglcontextlost", onContextLost);
    resize();
    render(performance.now());

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      gl.deleteBuffer(positionBuffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
    };
  }, [active, forceFallback, reducedMotion]);

  return (
    <div className="closing-fluid" data-fluid-mode={mode} aria-hidden="true">
      <canvas ref={canvasRef} className="closing-fluid__canvas" />
      <div className="closing-fluid__fallback">
        <i /><i /><i /><i />
      </div>
    </div>
  );
}
