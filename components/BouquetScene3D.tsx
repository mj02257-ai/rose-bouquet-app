'use client';

import { Suspense, useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { WrapperState } from '@/types/bouquet';

export type RoseColor = 'red' | 'pink' | 'white' | 'peach';

const ROSE_GLB: Record<RoseColor, string> = {
  red:   '/assets/3d/roses/rose-red.glb',
  pink:  '/assets/3d/roses/rose-pink.glb',
  white: '/assets/3d/roses/rose-white.glb',
  peach: '/assets/3d/roses/rose-peach.glb',
};

const WRAPPER_GLB = '/assets/3d/wrappers/wrapper_ribbon_tied_base.glb';

const ROSE_SCALE = 0.76;
const ROSE_Y     = -0.52;
const ROSE_Z     = 0.04;
const ROSE_TILT  = -3 * (Math.PI / 180);

// ── Mesh-visibility approach ──────────────────────────────────────────────────
// Strategy: show ONLY petal meshes. Hide everything else unconditionally.
// This guarantees no green leaf/stem is ever visible, regardless of mesh names.

// Meshes with these name keywords are NEVER hidden (flower parts).
const FLOWER_KEYWORDS = ['rose', 'petal', 'bloom', 'flower', 'head', 'bud'];

// Returns true when a material is a petal color (red / pink / white / cream / peach).
function isPetalMaterial(mat: THREE.Material): boolean {
  const color = (mat as THREE.MeshStandardMaterial).color;
  if (!color) return false;
  const hsl = { h: 0, s: 0, l: 0 };
  color.getHSL(hsl);
  const isWarmRed = (hsl.h < 0.09 || hsl.h > 0.88) && hsl.s > 0.12; // red / pink
  const isLight   = hsl.l > 0.72;                                       // white / cream
  const isPeach   = hsl.h >= 0.03 && hsl.h <= 0.12 && hsl.s > 0.15 && hsl.l > 0.50;
  return isWarmRed || isLight || isPeach;
}

// Hide every mesh that is not identified as a petal/bloom.
// Leaves, stems, thorns, sepals → all hidden.
function hideAllExceptPetals(scene: THREE.Group) {
  scene.traverse((node) => {
    const mesh = node as THREE.Mesh;
    if (!mesh.isMesh) return;

    const mats = Array.isArray(mesh.material)
      ? (mesh.material as THREE.Material[])
      : [mesh.material as THREE.Material];

    const names = [mesh.name, ...mats.map((m) => m.name)].join(' ').toLowerCase();

    // ① Keep by name (rose / petal / bloom …)
    if (FLOWER_KEYWORDS.some((k) => names.includes(k))) return;

    // ② Keep by petal color (warm red / pink / white / peach)
    if (mats.some((m) => isPetalMaterial(m))) return;

    // ③ Everything else → invisible (leaf, stem, thorn, sepal, unknown)
    mesh.visible = false;
  });
}

function cloneScene(scene: THREE.Group): THREE.Group {
  const clone = scene.clone(true);
  clone.traverse((node) => {
    const mesh = node as THREE.Mesh;
    if (!mesh.isMesh) return;
    if (Array.isArray(mesh.material)) {
      mesh.material = mesh.material.map((m) => (m as THREE.Material).clone());
    } else {
      mesh.material = (mesh.material as THREE.Material).clone();
    }
  });
  return clone;
}

function RoseModel({ color }: { color: RoseColor }) {
  const { scene } = useGLTF(ROSE_GLB[color]);
  const cloned = useMemo(() => {
    const c = cloneScene(scene as unknown as THREE.Group);
    hideAllExceptPetals(c);
    return c;
  }, [scene]);
  return (
    <group position={[0, ROSE_Y, ROSE_Z]} scale={ROSE_SCALE} rotation={[ROSE_TILT, 0, 0]}>
      <primitive object={cloned} />
    </group>
  );
}

function WrapperModel({ wrapperState, onTyingComplete }: {
  wrapperState: WrapperState;
  onTyingComplete?: () => void;
}) {
  const { scene } = useGLTF(WRAPPER_GLB);
  const cloned = useMemo(() => cloneScene(scene as unknown as THREE.Group), [scene]);

  useEffect(() => {
    if (wrapperState !== 'tying') return;
    const t = setTimeout(() => onTyingComplete?.(), 1200);
    return () => clearTimeout(t);
  }, [wrapperState, onTyingComplete]);

  return <primitive object={cloned} position={[0, -0.68, 0]} scale={[0.78, 0.78, 0.78]} />;
}

function LoadingMesh() {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.y += dt * 1.2; });
  return (
    <mesh ref={ref} position={[0, 0.2, 0]}>
      <octahedronGeometry args={[0.10, 0]} />
      <meshStandardMaterial color="#AAAAAA" roughness={0.5} />
    </mesh>
  );
}

export interface BouquetScene3DProps {
  selectedRoseColor: RoseColor | null;
  wrapperState: WrapperState;
  autoRotate?: boolean;
  onTyingComplete?: () => void;
}

export default function BouquetScene3D({
  selectedRoseColor, wrapperState, autoRotate = false, onTyingComplete,
}: BouquetScene3DProps) {
  useEffect(() => {
    Object.values(ROSE_GLB).forEach((p) => useGLTF.preload(p));
    useGLTF.preload(WRAPPER_GLB);
  }, []);

  const isShowcase = wrapperState === 'ribbonTied';

  return (
    <Canvas
      camera={{ position: [0, 0.8, 3.8], fov: 42 }}
      gl={{ antialias: true, alpha: false, localClippingEnabled: true }}
      onCreated={({ gl }) => {
        gl.setClearColor(new THREE.Color(isShowcase ? '#0A0A0A' : '#F4F2EE'), 1);
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.75;
      }}
      style={{ width: '100%', height: '100%' }}
    >
      <ambientLight intensity={1.55} color="#FFFFFF" />
      <directionalLight intensity={2.6} position={[1, 6, 4]} color="#FFFFFF" />
      <directionalLight intensity={1.1} position={[-4, 3, 2]} color="#FFF8F0" />
      <pointLight intensity={1.3} position={[0, 1.5, 4]} color="#FFFFFF" />
      <pointLight intensity={0.28} position={[0, 3, -4]} color="#C8D8F0" />

      <Suspense fallback={<LoadingMesh />}>
        <WrapperModel wrapperState={wrapperState} onTyingComplete={onTyingComplete} />
        {selectedRoseColor && <RoseModel color={selectedRoseColor} />}
      </Suspense>

      <OrbitControls
        target={[0, 0.10, 0]}
        enablePan={false}
        enableZoom={false}
        autoRotate={autoRotate}
        autoRotateSpeed={1.4}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI * 0.70}
      />
    </Canvas>
  );
}
