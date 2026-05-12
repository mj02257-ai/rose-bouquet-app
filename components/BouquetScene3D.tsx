'use client';

import { Suspense, useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { BouquetData, WrapperState } from '@/types/bouquet';
import { ROSES } from '@/lib/roseData';

// ── GLB routing ───────────────────────────────────────────────────────────────
const ROSE_GLB_PATH: Record<string, string> = {
  red:      '/assets/3d/roses/rose-red.glb',
  pink:     '/assets/3d/roses/rose-pink.glb',
  white:    '/assets/3d/roses/rose-white.glb',
  peach:    '/assets/3d/roses/rose-peach.glb',
  yellow:   '/assets/3d/roses/rose-peach.glb',
  orange:   '/assets/3d/roses/rose-red.glb',
  lavender: '/assets/3d/roses/rose-pink.glb',
  blue:     '/assets/3d/roses/rose-white.glb',
  black:    '/assets/3d/roses/rose-red.glb',
};

// Color overrides for rose types that reuse another type's GLB
const ROSE_COLOR_OVERRIDE: Record<string, string | null> = {
  red: null, pink: null, white: null, peach: null,
  yellow:   '#D4AC0D',
  orange:   '#CA6F1E',
  lavender: '#7D3C98',
  blue:     '#1A5276',
  black:    '#111111',
};

// Preload is called client-side only (in BouquetScene3D's useEffect below)

// ── Black wrapper material (shared) ──────────────────────────────────────────
const makeBlackWrapperMat = () =>
  new THREE.MeshStandardMaterial({
    color: new THREE.Color('#0D0D0D'),
    roughness: 0.88,
    metalness: 0.06,
  });

// ── Helper: clone scene and optionally override mesh colors ───────────────────
function cloneScene(scene: THREE.Group, colorOverride: string | null): THREE.Group {
  const clone = scene.clone(true);
  if (colorOverride) {
    const col = new THREE.Color(colorOverride);
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const mat = (mesh.material as THREE.MeshStandardMaterial).clone();
        mat.color = col;
        mesh.material = mat;
      }
    });
  }
  return clone;
}

// ── Individual rose instance ──────────────────────────────────────────────────
interface RoseInstanceProps {
  roseTypeId: string;
  position: [number, number, number];
  scale: number;
  rotationY: number;
}

function RoseInstance({ roseTypeId, position, scale, rotationY }: RoseInstanceProps) {
  const glbPath = ROSE_GLB_PATH[roseTypeId] ?? '/assets/3d/roses/rose-red.glb';
  const colorOverride = ROSE_COLOR_OVERRIDE[roseTypeId] ?? null;
  const { scene } = useGLTF(glbPath);

  const cloned = useMemo(
    () => cloneScene(scene as unknown as THREE.Group, colorOverride),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [scene, colorOverride]
  );

  return (
    <primitive
      object={cloned}
      position={position}
      scale={scale}
      rotation={[0, (rotationY * Math.PI) / 180, 0]}
    />
  );
}

// ── Wrapper model — swaps GLB based on state, always black material ───────────
function WrapperModel({ wrapperState }: { wrapperState: WrapperState }) {
  const wrappedGlb    = useGLTF('/assets/3d/wrappers/wrapper_wrapped_base.glb');
  const ribbonTiedGlb = useGLTF('/assets/3d/wrappers/wrapper_ribbon_tied_base.glb');

  const activeScene = wrapperState === 'ribbonTied'
    ? (ribbonTiedGlb.scene as unknown as THREE.Group)
    : (wrappedGlb.scene as unknown as THREE.Group);

  const cloned = useMemo(() => {
    const clone = activeScene.clone(true);
    const mat = makeBlackWrapperMat();
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).material = mat;
      }
    });
    return clone;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeScene]);

  return <primitive object={cloned} position={[0, 0, 0]} />;
}

// ── Ribbon band — grows from center outward during 'tying' state ─────────────
interface RibbonBandProps {
  color: string;
  wrapperState: WrapperState;
  onTyingComplete?: () => void;
}

function RibbonBand({ color, wrapperState, onTyingComplete }: RibbonBandProps) {
  const meshRef    = useRef<THREE.Mesh>(null!);
  const progressRef = useRef(0);
  const calledRef   = useRef(false);

  useEffect(() => {
    if (wrapperState === 'tying') {
      progressRef.current = 0;
      calledRef.current   = false;
    }
  }, [wrapperState]);

  useFrame((_, delta) => {
    if (wrapperState !== 'tying') return;
    if (progressRef.current >= 1) {
      if (!calledRef.current) {
        calledRef.current = true;
        onTyingComplete?.();
      }
      return;
    }
    progressRef.current = Math.min(1, progressRef.current + delta * 1.1);
    // Ease in-out cubic
    const t = progressRef.current;
    const s = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    if (meshRef.current) {
      meshRef.current.scale.set(s, 1, s);
    }
  });

  const visible = wrapperState === 'tying' || wrapperState === 'ribbonTied';
  if (!visible) return null;

  return (
    <mesh
      ref={meshRef}
      position={[0, 0.35, 0]}
      scale={wrapperState === 'ribbonTied' ? [1, 1, 1] : [0.001, 1, 0.001]}
    >
      <torusGeometry args={[0.48, 0.038, 10, 72]} />
      <meshStandardMaterial
        color={color}
        roughness={0.22}
        metalness={0.18}
      />
    </mesh>
  );
}

// ── Main group: all scene objects in one rotatable group ─────────────────────
interface BouquetGroupProps {
  bouquetData: BouquetData;
  wrapperState: WrapperState;
  dominantColor: string;
  onTyingComplete?: () => void;
}

function BouquetGroup({
  bouquetData,
  wrapperState,
  dominantColor,
  onTyingComplete,
}: BouquetGroupProps) {
  const zIndices = bouquetData.roses.map((r) => r.zIndex);
  const zMin  = zIndices.length ? Math.min(...zIndices) : 0;
  const zMax  = zIndices.length ? Math.max(...zIndices) : 1;
  const zRange = Math.max(1, zMax - zMin);

  return (
    <group>
      <WrapperModel wrapperState={wrapperState} />

      {bouquetData.roses.map((rose) => {
        // Map 2D canvas percentages to 3D world space
        const worldX = (rose.x / 100 - 0.5) * 2.2;
        const depthNorm = (rose.zIndex - zMin) / zRange;
        // Canvas y grows downward; roses at lower y% are higher in bouquet
        const worldY = (1 - (rose.y * 0.66) / 100) * 2.4 + 0.4;
        const worldZ = (depthNorm - 0.5) * 0.7;

        return (
          <RoseInstance
            key={rose.id}
            roseTypeId={rose.roseTypeId}
            position={[worldX, worldY, worldZ]}
            scale={rose.scale * 0.26}
            rotationY={rose.rotation}
          />
        );
      })}

      <RibbonBand
        color={dominantColor}
        wrapperState={wrapperState}
        onTyingComplete={onTyingComplete}
      />
    </group>
  );
}

// ── Loading fallback (inside canvas) ─────────────────────────────────────────
function LoadingMesh() {
  const meshRef = useRef<THREE.Mesh>(null!);
  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 1.2;
  });
  return (
    <mesh ref={meshRef} position={[0, 0.5, 0]}>
      <octahedronGeometry args={[0.18, 0]} />
      <meshStandardMaterial color="#444" roughness={0.5} />
    </mesh>
  );
}

// ── Public component ──────────────────────────────────────────────────────────
export interface BouquetScene3DProps {
  bouquetData: BouquetData;
  wrapperState: WrapperState;
  dominantColor: string;
  autoRotate: boolean;
  onTyingComplete?: () => void;
}

export default function BouquetScene3D({
  bouquetData,
  wrapperState,
  dominantColor,
  autoRotate,
  onTyingComplete,
}: BouquetScene3DProps) {
  useEffect(() => {
    useGLTF.preload('/assets/3d/roses/rose-red.glb');
    useGLTF.preload('/assets/3d/roses/rose-pink.glb');
    useGLTF.preload('/assets/3d/roses/rose-white.glb');
    useGLTF.preload('/assets/3d/roses/rose-peach.glb');
    useGLTF.preload('/assets/3d/wrappers/wrapper_wrapped_base.glb');
    useGLTF.preload('/assets/3d/wrappers/wrapper_ribbon_tied_base.glb');
  }, []);

  return (
    <Canvas
      camera={{ position: [0, 1.6, 4.2], fov: 34 }}
      gl={{ antialias: true, alpha: true }}
      style={{ width: '100%', height: '100%' }}
    >
      {/* Cool ambient fill */}
      <ambientLight intensity={0.42} color="#C8D4E0" />
      {/* Key light: upper right, warm-white */}
      <directionalLight intensity={1.8} position={[3, 5, 2]} color="#FFFFFF" />
      {/* Fill light: left side, cool */}
      <pointLight intensity={0.55} position={[-3, 2, 1]} color="#B0C8E4" />
      {/* Rim light: back low */}
      <pointLight intensity={0.28} position={[0, -1, -3]} color="#E8D0C0" />

      <Suspense fallback={<LoadingMesh />}>
        <BouquetGroup
          bouquetData={bouquetData}
          wrapperState={wrapperState}
          dominantColor={dominantColor}
          onTyingComplete={onTyingComplete}
        />
      </Suspense>

      <OrbitControls
        enablePan={false}
        enableZoom={false}
        autoRotate={autoRotate && wrapperState === 'ribbonTied'}
        autoRotateSpeed={1.4}
        minPolarAngle={Math.PI / 5}
        maxPolarAngle={Math.PI * 0.68}
        enabled={wrapperState === 'ribbonTied'}
      />
    </Canvas>
  );
}
