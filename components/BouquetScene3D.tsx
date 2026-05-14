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

// Single rose — scale up from the old per-rose 0.354 by ~1.47×, stem deeper into wrapper
const ROSE_SCALE = 0.52;
const ROSE_Y     = -0.72;   // stem base well inside wrapper (opening ≈ y -0.29)
const ROSE_TILT  = -10 * (Math.PI / 180);

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
  const cloned = useMemo(() => cloneScene(scene as unknown as THREE.Group), [scene]);
  return (
    <group position={[0, ROSE_Y, 0]} scale={ROSE_SCALE} rotation={[ROSE_TILT, 0, 0]}>
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
      gl={{ antialias: true, alpha: false }}
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
