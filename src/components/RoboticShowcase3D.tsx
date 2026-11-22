import { useEffect, useRef, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Cpu,
  Eye,
  RotateCw,
} from 'lucide-react';
import { motion } from 'motion/react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

interface RoboticShowcase3DProps {
  onInteract?: () => void;
}

type CameraPresetId = 'hero' | 'wrist' | 'top' | 'side';
type FinishId = 'obsidian' | 'titanium' | 'sapphire';

const CAMERA_PRESETS: Record<
  CameraPresetId,
  { label: string; position: [number, number, number]; target: [number, number, number] }
> = {
  hero: { label: '3/4 Hero', position: [3.2, 2.55, 3.65], target: [0, 1.35, 0] },
  wrist: { label: 'Hand & Wrist', position: [1.65, 2.35, 1.85], target: [0.35, 2.05, 0] },
  top: { label: 'Overhead', position: [0.2, 4.4, 1.2], target: [0, 1.25, 0] },
  side: { label: 'Profile', position: [4.1, 1.65, 0.25], target: [0, 1.4, 0] },
};

const FINISH_SPECS: Record<
  FinishId,
  { label: string; armor: number; accent: number; metalness: number; roughness: number; swatch: string }
> = {
  obsidian: {
    label: 'Obsidian',
    armor: 0x161d2e,
    accent: 0x22d3ee,
    metalness: 0.72,
    roughness: 0.34,
    swatch: '#161D2E',
  },
  titanium: {
    label: 'Titanium',
    armor: 0x7b889e,
    accent: 0x3b82f6,
    metalness: 0.92,
    roughness: 0.24,
    swatch: '#7B889E',
  },
  sapphire: {
    label: 'Sapphire',
    armor: 0x1e2d52,
    accent: 0x8b5cf6,
    metalness: 0.85,
    roughness: 0.22,
    swatch: '#2E4378',
  },
};

// Reusable module-scoped vectors for zero-GC render ticks
const _desiredCamPos = new THREE.Vector3();
const _desiredTarget = new THREE.Vector3();

let _cachedSoftwareGl: boolean | null = null;

function detectSoftwareWebGL(): boolean {
  if (_cachedSoftwareGl !== null) return _cachedSoftwareGl;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2');
    if (!gl) {
      _cachedSoftwareGl = true;
      return true;
    }
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    _cachedSoftwareGl = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    return _cachedSoftwareGl;
  } catch {
    _cachedSoftwareGl = true;
    return true;
  }
}

function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(128, 128, 18, 128, 128, 122);
    grad.addColorStop(0, 'rgba(2, 6, 23, 0.72)');
    grad.addColorStop(0.55, 'rgba(6, 182, 212, 0.14)');
    grad.addColorStop(1, 'rgba(2, 6, 23, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function RoboticShowcase3D({ onInteract }: RoboticShowcase3DProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [preset, setPreset] = useState<CameraPresetId>('hero');
  const [finish, setFinish] = useState<FinishId>('obsidian');
  const [articulation, setArticulation] = useState<number>(35);
  const [autoOrbit, setAutoOrbit] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return (
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
      !detectSoftwareWebGL()
    );
  });
  const [hudCollapsed, setHudCollapsed] = useState<boolean>(false);
  const [webglError, setWebglError] = useState<string | null>(null);

  // Refs bridging React controls into the imperative Three.js scene
  const targetStateRef = useRef({
    articulation: 0.35,
    finish: 'obsidian' as FinishId,
    autoOrbit,
    cameraPreset: null as CameraPresetId | null,
  });
  const requestRenderRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    targetStateRef.current.articulation = articulation / 100;
    requestRenderRef.current?.();
  }, [articulation]);

  useEffect(() => {
    targetStateRef.current.finish = finish;
    requestRenderRef.current?.();
  }, [finish]);

  useEffect(() => {
    targetStateRef.current.autoOrbit = autoOrbit;
    requestRenderRef.current?.();
  }, [autoOrbit]);

  const handleSelectPreset = (nextPreset: CameraPresetId) => {
    setPreset(nextPreset);
    targetStateRef.current.cameraPreset = nextPreset;
    requestRenderRef.current?.();
    onInteract?.();
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    const isSoftwareGl = detectSoftwareWebGL();
    if (isSoftwareGl) {
      targetStateRef.current.autoOrbit = false;
    }

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglError('Interactive 3D WebGL viewport is unavailable on this browser.');
      return;
    }

    const rect = container.getBoundingClientRect();
    const initWidth = Math.max(1, rect.width || 640);
    const initHeight = Math.max(1, rect.height || 480);

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    const maxDpr = window.innerWidth < 768 ? 1.5 : 2;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, maxDpr));
    renderer.setSize(initWidth, initHeight);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060914);
    scene.fog = new THREE.FogExp2(0x060914, 0.055);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTexture = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTexture;
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(42, initWidth / initHeight, 0.1, 45);
    camera.position.set(...CAMERA_PRESETS.hero.position);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(...CAMERA_PRESETS.hero.target);
    controls.enablePan = false;
    controls.minDistance = 2.0;
    controls.maxDistance = 6.8;
    controls.minPolarAngle = 0.2;
    controls.maxPolarAngle = Math.PI * 0.48;
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.07;
    controls.autoRotate = !isSoftwareGl && !prefersReducedMotion;
    controls.autoRotateSpeed = 0.85;

    // 3-Point Studio Lighting (Warm Key + Cool Hemisphere + Cyan/Violet Rim)
    const hemiLight = new THREE.HemisphereLight(0x93c5fd, 0x0f172a, 0.9);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff1e0, 2.2);
    keyLight.position.set(4.5, 6.5, 4.0);
    if (!isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.camera.near = 1;
      keyLight.shadow.camera.far = 16;
      const d = 3.2;
      keyLight.shadow.camera.left = -d;
      keyLight.shadow.camera.right = d;
      keyLight.shadow.camera.top = d;
      keyLight.shadow.camera.bottom = -d;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.75);
    rimLight.position.set(-4.0, 3.5, -4.5);
    scene.add(rimLight);

    // --- PROCEDURAL COMPOSITE ROBOTIC MODEL (THREE.Group) ---
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // Shared PBR Materials
    const armorMat = new THREE.MeshPhysicalMaterial({
      color: FINISH_SPECS.obsidian.armor,
      metalness: FINISH_SPECS.obsidian.metalness,
      roughness: FINISH_SPECS.obsidian.roughness,
      clearcoat: 0.65,
      clearcoatRoughness: 0.2,
    });
    const jointMat = new THREE.MeshStandardMaterial({
      color: 0x0d111a,
      metalness: 0.25,
      roughness: 0.78, // >= 0.25 roughness delta vs armor
    });
    const pistonMat = new THREE.MeshStandardMaterial({
      color: 0xcbd5e1,
      metalness: 0.95,
      roughness: 0.14,
    });
    const accentMat = new THREE.MeshStandardMaterial({
      color: FINISH_SPECS.obsidian.accent,
      emissive: FINISH_SPECS.obsidian.accent,
      emissiveIntensity: 1.4,
      metalness: 0.2,
      roughness: 0.2,
    });

    // Grounded Radial Contact Shadow Plane + Pedestal
    const shadowTex = createContactShadowTexture();
    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(4.2, 4.2),
      new THREE.MeshBasicMaterial({
        map: shadowTex,
        transparent: true,
        depthWrite: false,
      })
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = 0.005;
    rootGroup.add(shadowPlane);

    const pedestalMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(1.18, 1.32, 0.16, 40),
      armorMat
    );
    pedestalMesh.position.y = 0.08;
    pedestalMesh.receiveShadow = true;
    rootGroup.add(pedestalMesh);

    const pedestalRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.22, 0.018, 12, 64),
      accentMat
    );
    pedestalRing.rotation.x = Math.PI / 2;
    pedestalRing.position.y = 0.165;
    rootGroup.add(pedestalRing);

    // 1. Turret Base Assembly
    const turretBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.46, 0.56, 0.26, 28),
      jointMat
    );
    turretBase.position.y = 0.29;
    turretBase.castShadow = true;
    turretBase.receiveShadow = true;
    rootGroup.add(turretBase);

    // 2. Shoulder Pivot & Upper Humerus Assembly
    const shoulderPivot = new THREE.Group();
    shoulderPivot.position.set(0, 0.44, 0);
    rootGroup.add(shoulderPivot);

    const shoulderDrum = new THREE.Mesh(
      new THREE.CylinderGeometry(0.26, 0.26, 0.54, 24),
      jointMat
    );
    shoulderDrum.rotation.z = Math.PI / 2;
    shoulderDrum.castShadow = true;
    shoulderPivot.add(shoulderDrum);

    const shoulderCapLeft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.18, 0.06, 24),
      accentMat
    );
    shoulderCapLeft.rotation.z = Math.PI / 2;
    shoulderCapLeft.position.x = 0.28;
    shoulderPivot.add(shoulderCapLeft);

    // Twin Upper Struts + Explodable Outer Plates
    const strutGeo = new THREE.CylinderGeometry(0.055, 0.065, 1.05, 16);
    const strutFront = new THREE.Mesh(strutGeo, pistonMat);
    strutFront.position.set(0, 0.54, 0.12);
    strutFront.castShadow = true;
    shoulderPivot.add(strutFront);

    const strutBack = new THREE.Mesh(strutGeo, pistonMat);
    strutBack.position.set(0, 0.54, -0.12);
    strutBack.castShadow = true;
    shoulderPivot.add(strutBack);

    const upperArmorPlateLeft = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.88, 0.36),
      armorMat
    );
    upperArmorPlateLeft.position.set(-0.2, 0.55, 0);
    upperArmorPlateLeft.castShadow = true;
    shoulderPivot.add(upperArmorPlateLeft);

    const upperArmorPlateRight = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.88, 0.36),
      armorMat
    );
    upperArmorPlateRight.position.set(0.2, 0.55, 0);
    upperArmorPlateRight.castShadow = true;
    shoulderPivot.add(upperArmorPlateRight);

    // 3. Elbow Pivot & Forearm Assembly
    const elbowPivot = new THREE.Group();
    elbowPivot.position.set(0, 1.08, 0);
    shoulderPivot.add(elbowPivot);

    const elbowHub = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.2, 0.44, 24),
      jointMat
    );
    elbowHub.rotation.z = Math.PI / 2;
    elbowHub.castShadow = true;
    elbowPivot.add(elbowHub);

    const elbowOpticRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.21, 0.018, 12, 36),
      accentMat
    );
    elbowOpticRing.rotation.y = Math.PI / 2;
    elbowOpticRing.position.x = 0.22;
    elbowPivot.add(elbowOpticRing);

    const forearmFrame = new THREE.Mesh(
      new THREE.CylinderGeometry(0.13, 0.17, 0.84, 18),
      armorMat
    );
    forearmFrame.position.set(0, 0.45, 0);
    forearmFrame.castShadow = true;
    elbowPivot.add(forearmFrame);

    const forearmShield = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 0.68, 0.1),
      armorMat
    );
    forearmShield.position.set(0, 0.46, 0.17);
    forearmShield.castShadow = true;
    elbowPivot.add(forearmShield);

    const wristRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.15, 0.016, 10, 32),
      accentMat
    );
    wristRing.rotation.x = Math.PI / 2;
    wristRing.position.set(0, 0.86, 0);
    elbowPivot.add(wristRing);

    // 4. Wrist Pivot & Articulated 5-Digit Robotic Hand
    const wristPivot = new THREE.Group();
    wristPivot.position.set(0, 0.92, 0);
    elbowPivot.add(wristPivot);

    const palmMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.34, 0.11),
      armorMat
    );
    palmMesh.position.set(0, 0.18, 0);
    palmMesh.castShadow = true;
    wristPivot.add(palmMesh);

    const palmCoreEmissive = new THREE.Mesh(
      new THREE.CylinderGeometry(0.055, 0.055, 0.125, 16),
      accentMat
    );
    palmCoreEmissive.rotation.x = Math.PI / 2;
    palmCoreEmissive.position.set(0, 0.18, 0);
    wristPivot.add(palmCoreEmissive);

    const fingerPivots: { base: THREE.Group; tip: THREE.Group }[] = [];
    const fingerXs = [-0.115, -0.04, 0.035, 0.11];
    const fingerHeights = [0.16, 0.19, 0.18, 0.14];

    fingerXs.forEach((fx, idx) => {
      const fBase = new THREE.Group();
      fBase.position.set(fx, 0.36, 0);
      wristPivot.add(fBase);

      const seg1 = new THREE.Mesh(
        new THREE.BoxGeometry(0.048, fingerHeights[idx], 0.055),
        pistonMat
      );
      seg1.position.y = fingerHeights[idx] / 2;
      seg1.castShadow = true;
      fBase.add(seg1);

      const fTip = new THREE.Group();
      fTip.position.set(0, fingerHeights[idx] + 0.01, 0);
      fBase.add(fTip);

      const seg2 = new THREE.Mesh(
        new THREE.BoxGeometry(0.042, fingerHeights[idx] * 0.78, 0.048),
        armorMat
      );
      seg2.position.y = (fingerHeights[idx] * 0.78) / 2;
      seg2.castShadow = true;
      fTip.add(seg2);

      fingerPivots.push({ base: fBase, tip: fTip });
    });

    // Opposable Thumb
    const thumbPivot = new THREE.Group();
    thumbPivot.position.set(-0.18, 0.14, 0.04);
    thumbPivot.rotation.z = 0.55;
    wristPivot.add(thumbPivot);

    const thumbSeg = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 0.18, 0.055),
      pistonMat
    );
    thumbSeg.position.y = 0.09;
    thumbSeg.castShadow = true;
    thumbPivot.add(thumbSeg);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // State & Damping Loop (On-demand coalesced rendering)
    let currentArticulation = targetStateRef.current.articulation;
    let isVisible = true;
    let frameId = 0;
    let renderBusy = false;
    let renderDirty = false;
    let lastTime = performance.now();

    const applySceneState = (dt: number) => {
      const tState = targetStateRef.current;

      // Finish colors
      const spec = FINISH_SPECS[tState.finish];
      armorMat.color.setHex(spec.armor);
      armorMat.metalness = spec.metalness;
      armorMat.roughness = spec.roughness;
      accentMat.color.setHex(spec.accent);
      accentMat.emissive.setHex(spec.accent);

      // Exponentially damp articulation & exploded armor offset
      currentArticulation = THREE.MathUtils.damp(
        currentArticulation,
        tState.articulation,
        7.5,
        dt
      );
      const art = currentArticulation;
      const armorSplit = Math.max(0, art - 0.55) * 0.28;

      shoulderPivot.rotation.z = THREE.MathUtils.lerp(-0.18, 0.22, art);
      elbowPivot.rotation.z = THREE.MathUtils.lerp(0.28, -0.68, art);
      wristPivot.rotation.x = THREE.MathUtils.lerp(-0.12, 0.34, art);
      upperArmorPlateLeft.position.x = -0.2 - armorSplit;
      upperArmorPlateRight.position.x = 0.2 + armorSplit;
      forearmShield.position.z = 0.17 + armorSplit * 0.9;

      const fingerCurl = THREE.MathUtils.lerp(0.18, 1.05, art);
      fingerPivots.forEach((fp, i) => {
        fp.base.rotation.x = fingerCurl * (0.7 + i * 0.05);
        fp.tip.rotation.x = fingerCurl * 0.85;
      });
      thumbPivot.rotation.x = fingerCurl * 0.45;

      // Smoothly damp camera toward preset if active
      let cameraMoving = false;
      if (tState.cameraPreset) {
        const p = CAMERA_PRESETS[tState.cameraPreset];
        _desiredCamPos.set(...p.position);
        _desiredTarget.set(...p.target);
        camera.position.x = THREE.MathUtils.damp(camera.position.x, _desiredCamPos.x, 6, dt);
        camera.position.y = THREE.MathUtils.damp(camera.position.y, _desiredCamPos.y, 6, dt);
        camera.position.z = THREE.MathUtils.damp(camera.position.z, _desiredCamPos.z, 6, dt);
        controls.target.x = THREE.MathUtils.damp(controls.target.x, _desiredTarget.x, 6, dt);
        controls.target.y = THREE.MathUtils.damp(controls.target.y, _desiredTarget.y, 6, dt);
        controls.target.z = THREE.MathUtils.damp(controls.target.z, _desiredTarget.z, 6, dt);
        if (
          camera.position.distanceTo(_desiredCamPos) < 0.02 &&
          controls.target.distanceTo(_desiredTarget) < 0.02
        ) {
          tState.cameraPreset = null;
        } else {
          cameraMoving = true;
        }
      }

      controls.autoRotate = !isSoftwareGl && !prefersReducedMotion && tState.autoOrbit;
      const controlsMoved = controls.update();
      const artSettling = Math.abs(currentArticulation - tState.articulation) > 0.002;
      return cameraMoving || controlsMoved || artSettling || controls.autoRotate;
    };

    const afterDraw = (cb: () => void) => {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync?.(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      if (!sync) {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      gl.flush();
      const poll = () => {
        const state = gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    };

    const requestRender = () => {
      if (!isVisible || document.hidden) return;
      if (renderBusy) {
        renderDirty = true;
        return;
      }
      renderBusy = true;
      frameId = window.requestAnimationFrame((now) => {
        renderDirty = false;
        const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
        lastTime = now;

        const keepGoing = applySceneState(dt);
        renderer.render(scene, camera);

        const done = () => {
          renderBusy = false;
          if (renderDirty || (keepGoing && isVisible && !document.hidden)) {
            requestRender();
          }
        };
        if (isSoftwareGl) afterDraw(done);
        else done();
      });
    };

    requestRenderRef.current = requestRender;

    const handleControlsStart = () => {
      targetStateRef.current.cameraPreset = null;
    };
    const handleControlsChange = () => {
      requestRender();
    };
    controls.addEventListener('start', handleControlsStart);
    controls.addEventListener('change', handleControlsChange);

    const handleResize = () => {
      const r = container.getBoundingClientRect();
      const w = Math.max(1, r.width);
      const h = Math.max(1, r.height);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      requestRender();
    };
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        isVisible = Boolean(entries[0]?.isIntersecting);
        if (isVisible) {
          lastTime = performance.now();
          requestRender();
        }
      },
      { threshold: 0.08 }
    );
    intersectionObserver.observe(container);

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      setWebglError('3D WebGL context was paused by the browser.');
    };
    const handleContextRestored = () => {
      setWebglError(null);
      requestRender();
    };
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', handleContextRestored);

    requestRender();

    return () => {
      requestRenderRef.current = null;
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(frameId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      controls.removeEventListener('start', handleControlsStart);
      controls.removeEventListener('change', handleControlsChange);
      controls.dispose();
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', handleContextRestored);

      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const m = obj as THREE.Mesh;
          m.geometry.dispose();
          if (Array.isArray(m.material)) {
            m.material.forEach((mat) => mat.dispose());
          } else {
            m.material.dispose();
          }
        }
      });
      shadowTex.dispose();
      envTexture.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <section
      id="showcase-3d"
      aria-labelledby="showcase-3d-heading"
      className="relative z-10 border-t border-slate-200/80 py-16 sm:py-24 lg:py-28 dark:border-slate-900/90"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 'some' }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col gap-4 border-b border-slate-200 pb-8 lg:flex-row lg:items-end lg:justify-between dark:border-slate-800/80"
        >
          <div className="max-w-2xl">
            <p className="font-mono text-xs font-medium tracking-[0.18em] text-blue-600 uppercase dark:text-cyan-300">
              3D Robotic Showcase
            </p>
            <h2
              id="showcase-3d-heading"
              className="mt-2.5 font-display text-2xl leading-tight font-semibold tracking-tight text-slate-900 sm:mt-3 sm:text-4xl dark:text-white"
              style={{ textWrap: 'balance' }}
            >
              Inspect the articulated exo-arm in real-time 3D.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-400">
              Drag to orbit 360°, pinch or scroll to zoom, switch camera angles, flex the mechanical joints, and inspect armor separation in a mobile-optimized WebGL stage.
            </p>
          </div>
          <p className="font-mono text-xs text-slate-500 dark:text-slate-400">
            Drag to rotate · Scroll / Pinch to zoom
          </p>
        </motion.div>

        {/* Full-Stage Unobstructed 3D Viewport + Collapsible Bottom Dock */}
        <div className="relative mt-8 h-[460px] w-full overflow-hidden rounded-2xl border border-slate-300 bg-[#060914] sm:h-[560px] dark:border-slate-800">
          {/* Isolated WebGL Mount Container */}
          <div
            ref={mountRef}
            className="h-full w-full touch-none"
            aria-label="Interactive 3D robotic arm model viewport"
          />

          {/* Top-Left Minimal Spec Header (No obstruction) */}
          <div className="pointer-events-none absolute top-4 left-4 z-10 rounded-lg border border-slate-800 bg-[#080D1C]/90 px-3.5 py-2 text-xs text-slate-200">
            <div className="flex items-center gap-2 font-mono text-[11px] text-cyan-300 uppercase">
              <Cpu className="h-3.5 w-3.5" aria-hidden="true" />
              <span>CYBERNEX Exo-Manipulator · 3D Rig</span>
            </div>
          </div>

          {webglError && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#060914] p-6 text-center text-slate-300">
              <p className="font-display text-lg font-semibold text-white">
                3D Viewport Paused
              </p>
              <p className="mt-2 max-w-md text-sm text-slate-400">{webglError}</p>
            </div>
          )}

          {/* Collapsible Bottom Control Dock (Solid dark surface, no backdrop-blur over WebGL) */}
          <div className="pointer-events-none absolute right-0 bottom-3 left-0 z-20 flex flex-col items-center px-3 sm:bottom-5">
            <button
              type="button"
              onClick={() => {
                setHudCollapsed((prev) => !prev);
                onInteract?.();
              }}
              className="pointer-events-auto mb-1.5 inline-flex min-h-[34px] items-center gap-1.5 rounded-t-lg border border-b-0 border-slate-700 bg-[#080D1C]/95 px-3.5 py-1 font-mono text-[11px] text-slate-200 transition-colors hover:text-cyan-300 cursor-pointer"
            >
              {hudCollapsed ? (
                <>
                  <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Show 3D Controls</span>
                </>
              ) : (
                <>
                  <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Hide Controls</span>
                </>
              )}
            </button>

            {!hudCollapsed && (
              <div className="pointer-events-auto flex w-full max-w-[920px] flex-nowrap items-center justify-between gap-3 overflow-x-auto rounded-xl border border-slate-700/90 bg-[#080D1C]/95 px-3.5 py-2.5 text-slate-100 shadow-2xl sm:flex-wrap sm:px-4 sm:py-3">
                {/* Camera Presets */}
                <div className="flex shrink-0 items-center gap-1.5">
                  <span className="mr-1 inline-flex items-center gap-1 font-mono text-[10px] text-slate-400 uppercase">
                    <Eye className="h-3 w-3" aria-hidden="true" />
                    View
                  </span>
                  {(Object.keys(CAMERA_PRESETS) as CameraPresetId[]).map((id) => {
                    const active = preset === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => handleSelectPreset(id)}
                        className={`min-h-[36px] rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                          active
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {CAMERA_PRESETS[id].label}
                      </button>
                    );
                  })}
                </div>

                {/* Joint Articulation & Explode Slider */}
                <div className="flex shrink-0 items-center gap-2.5">
                  <label
                    htmlFor="arm-articulation-slider"
                    className="font-mono text-[10px] text-slate-400 uppercase whitespace-nowrap"
                  >
                    Flex / Explode {articulation}%
                  </label>
                  <input
                    id="arm-articulation-slider"
                    type="range"
                    min={0}
                    max={100}
                    value={articulation}
                    onChange={(e) => {
                      setArticulation(Number(e.target.value));
                      onInteract?.();
                    }}
                    className="h-2 w-24 accent-cyan-400 sm:w-32 cursor-pointer"
                  />
                </div>

                {/* Material Swatches + Auto-Orbit */}
                <div className="flex shrink-0 items-center gap-2">
                  {(Object.keys(FINISH_SPECS) as FinishId[]).map((fId) => {
                    const spec = FINISH_SPECS[fId];
                    const active = finish === fId;
                    return (
                      <button
                        key={fId}
                        type="button"
                        onClick={() => {
                          setFinish(fId);
                          onInteract?.();
                        }}
                        aria-pressed={active}
                        title={spec.label}
                        className={`inline-flex min-h-[36px] items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs transition-colors cursor-pointer ${
                          active
                            ? 'border-cyan-400 bg-slate-800 text-cyan-200'
                            : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500'
                        }`}
                      >
                        <span
                          className="h-2.5 w-2.5 rounded-full border border-white/30"
                          style={{ backgroundColor: spec.swatch }}
                          aria-hidden="true"
                        />
                        <span>{spec.label}</span>
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    aria-pressed={autoOrbit}
                    onClick={() => {
                      setAutoOrbit((prev) => !prev);
                      onInteract?.();
                    }}
                    className={`inline-flex min-h-[36px] items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs transition-colors cursor-pointer ${
                      autoOrbit
                        ? 'border-cyan-400/60 bg-cyan-500/15 text-cyan-200'
                        : 'border-slate-700 bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    <RotateCw className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Orbit</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
