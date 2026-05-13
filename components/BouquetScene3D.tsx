'use client';

import { Suspense, useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { BouquetData, WrapperState } from '@/types/bouquet';

// ── GLB paths ─────────────────────────────────────────────────────────────────
const ROSE_GLB: Record<string, string> = {
  red:   '/assets/3d/roses/rose-red.glb',
  pink:  '/assets/3d/roses/rose-pink.glb',
  white: '/assets/3d/roses/rose-white.glb',
  peach: '/assets/3d/roses/rose-peach.glb',
};
const WRAPPER_GLB        = '/assets/3d/wrappers/wrapper_wrapped_base.glb';
const WRAPPER_RIBBON_GLB = '/assets/3d/wrappers/wrapper_ribbon_tied_base.glb';

// ── Clone GLTF scene preserving original materials (no colour override) ────────
function cloneScene(scene: THREE.Group): THREE.Group {
  const clone = scene.clone(true);
  clone.traverse((node) => {
    const mesh = node as THREE.Mesh;
    if (!mesh.isMesh) return;
    if (Array.isArray(mesh.material)) {
      mesh.material = mesh.material.map((m) => (m as THREE.Material).clone() as THREE.Material);
    } else {
      mesh.material = (mesh.material as THREE.Material).clone();
    }
  });
  return clone;
}

// ── Bouquet slot table ─────────────────────────────────────────────────────────
// Each entry: [x, y, z, tiltX°, tiltZ°]
// Y values are kept low so rose stems enter the wrapper opening.
// Adjust wrapper.position Y and scale in WrapperModel if the new GLB has
// different proportions — these positions assume the wrapper opening is near Y=0.
const SLOTS: ReadonlyArray<[number, number, number, number, number]> = [
  [  0.00,  0.02,  0.00,   -8,    0 ], // 0 center
  [ -0.20, -0.05,  0.10,  -13,  +13 ], // 1 left-front (lower+forward)
  [  0.20, -0.05,  0.10,  -13,  -13 ], // 2 right-front
  [  0.00,  0.14, -0.10,   -5,    0 ], // 3 back-center (higher+back)
  [ -0.18,  0.10, -0.07,   -7,   +9 ], // 4 left-back
  [  0.18,  0.10, -0.07,   -7,   -9 ], // 5 right-back
  [ -0.34,  0.02,  0.02,  -10,  +20 ], // 6 far-left
  [  0.34,  0.02,  0.02,  -10,  -20 ], // 7 far-right
  [  0.00, -0.14,  0.18,  -16,    0 ], // 8 front-bottom
];

// Slot visitation order per rose count (creates the bouquet shape)
function getSlotOrder(total: number): number[] {
  switch (total) {
    case 1: return [0];
    case 2: return [1, 2];
    case 3: return [3, 1, 2];           // triangle: back-high + left/right-front
    case 4: return [3, 1, 2, 0];       // diamond
    case 5: return [3, 1, 2, 4, 5];
    case 6: return [3, 1, 2, 4, 5, 0];
    case 7: return [3, 1, 2, 4, 5, 6, 7];
    case 8: return [3, 1, 2, 4, 5, 6, 7, 0];
    default: return [3, 1, 2, 4, 5, 6, 7, 0, 8]; // 9
  }
}

// ── Single rose — original Meshy texture, no material override ────────────────
function RoseInstance({ roseTypeId }: { roseTypeId: string }) {
  const glbPath = ROSE_GLB[roseTypeId] ?? ROSE_GLB.red;
  const { scene } = useGLTF(glbPath);
  const cloned = useMemo(() => cloneScene(scene as unknown as THREE.Group), [scene]);
  return <primitive object={cloned} />;
}

// ── Wrapper GLB — original material, always visible ───────────────────────────
interface WrapperModelProps {
  wrapperState: WrapperState;
  onTyingComplete?: () => void;
}

function WrapperModel({ wrapperState, onTyingComplete }: WrapperModelProps) {
  const wrappedGlb    = useGLTF(WRAPPER_GLB);
  const ribbonTiedGlb = useGLTF(WRAPPER_RIBBON_GLB);

  // Trigger showcase transition after a short visual pause
  useEffect(() => {
    if (wrapperState !== 'tying') return;
    const t = setTimeout(() => onTyingComplete?.(), 1200);
    return () => clearTimeout(t);
  }, [wrapperState, onTyingComplete]);

  // Show ribbon GLB (which contains the ribbon) during and after tying
  const useRibbon  = wrapperState === 'tying' || wrapperState === 'ribbonTied';
  const activeScene = (useRibbon ? ribbonTiedGlb.scene : wrappedGlb.scene) as unknown as THREE.Group;

  // Clone preserving original GLB materials — NO colour/material override
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const cloned = useMemo(() => cloneScene(activeScene), [activeScene]);

  // Wrapper is always visible — even with 0 roses it anchors the composition.
  // Adjust position Y and scale to match the actual new GLB proportions.
  return (
    <primitive
      object={cloned}
      position={[0, -0.68, 0]}
      scale={[0.78, 0.78, 0.78]}
    />
  );
}

// ── Main bouquet group ────────────────────────────────────────────────────────
interface BouquetGroupProps {
  bouquetData: BouquetData;
  wrapperState: WrapperState;
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
  editMode?: boolean;
  onTyingComplete?: () => void;
}

function BouquetGroup({
  bouquetData, wrapperState, selectedId, onSelect, editMode, onTyingComplete,
}: BouquetGroupProps) {
  const roses = bouquetData.roses;
  const total = roses.length;

  // Scale multiplier decreases for large bouquets to prevent crowding
  const baseScaleMult = total <= 3 ? 0.29 : total <= 6 ? 0.26 : 0.23;

  const slotOrder = getSlotOrder(Math.min(total, 9));

  return (
    <group>
      {/* Wrapper is the base object — always rendered */}
      <WrapperModel wrapperState={wrapperState} onTyingComplete={onTyingComplete} />

      {roses.map((rose, idx) => {
        const slotIdx = slotOrder[idx] ?? slotOrder[slotOrder.length - 1];
        const [sx, sy, sz, tiltX, tiltZ] = SLOTS[slotIdx];
        const isSelected = editMode && selectedId === rose.id;
        const DEG = Math.PI / 180;

        return (
          <group
            key={rose.id}
            position={[sx, sy, sz]}
            scale={rose.scale * baseScaleMult}
            rotation={[
              tiltX * DEG,
              (rose.rotation * DEG),
              tiltZ * DEG,
            ]}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onClick={editMode ? (e: any) => { e.stopPropagation(); onSelect?.(rose.id); } : undefined}
          >
            <RoseInstance roseTypeId={rose.roseTypeId} />

            {/* Selection indicator — dark ring, visible on light background */}
            {isSelected && (
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[1.5, 1.82, 48]} />
                <meshBasicMaterial color="#222222" opacity={0.30} transparent side={THREE.DoubleSide} />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}

// ── Loading spinner ───────────────────────────────────────────────────────────
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

// ── Public component ──────────────────────────────────────────────────────────
export interface BouquetScene3DProps {
  bouquetData: BouquetData;
  wrapperState: WrapperState;
  autoRotate: boolean;
  editMode?: boolean;
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
  onTyingComplete?: () => void;
}

export default function BouquetScene3D({
  bouquetData, wrapperState, autoRotate,
  editMode, selectedId, onSelect, onTyingComplete,
}: BouquetScene3DProps) {
  useEffect(() => {
    Object.values(ROSE_GLB).forEach((p) => useGLTF.preload(p));
    useGLTF.preload(WRAPPER_GLB);
    useGLTF.preload(WRAPPER_RIBBON_GLB);
  }, []);

  const controlsEnabled = editMode
    ? wrapperState !== 'tying'
    : wrapperState === 'ribbonTied';

  const cameraPos: [number, number, number] = editMode ? [0, 0.8, 3.8] : [0, 1.0, 4.2];
  const orbitTarget: [number, number, number] = [0, 0.10, 0];

  return (
    <Canvas
      camera={{ position: cameraPos, fov: 42 }}
      gl={{ antialias: true, alpha: false }}
      onCreated={({ gl }) => {
        // Light warm-white canvas background (matches white UI theme)
        gl.setClearColor(new THREE.Color('#F4F2EE'), 1);
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.65;
      }}
      style={{ width: '100%', height: '100%' }}
      onPointerMissed={() => editMode && onSelect?.(null)}
    >
      {/* Strong ambient — lifts all surfaces uniformly */}
      <ambientLight intensity={1.4} color="#FFFFFF" />
      {/* Primary key light — above-front, bright white */}
      <directionalLight intensity={2.4} position={[1, 6, 4]} color="#FFFFFF" />
      {/* Secondary fill — left side, warm */}
      <directionalLight intensity={1.0} position={[-4, 3, 2]} color="#FFF8F0" />
      {/* Front point — removes shadows from petal faces */}
      <pointLight intensity={1.2} position={[0, 1.5, 4]} color="#FFFFFF" />
      {/* Rim light — very subtle, outlines wrapper against bg */}
      <pointLight intensity={0.25} position={[0, 3, -4]} color="#C8D8F0" />

      <Suspense fallback={<LoadingMesh />}>
        <BouquetGroup
          bouquetData={bouquetData}
          wrapperState={wrapperState}
          selectedId={selectedId}
          onSelect={onSelect}
          editMode={editMode}
          onTyingComplete={onTyingComplete}
        />
      </Suspense>

      <OrbitControls
        target={orbitTarget}
        enablePan={false}
        enableZoom={false}
        autoRotate={!editMode && autoRotate && wrapperState === 'ribbonTied'}
        autoRotateSpeed={1.4}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI * 0.70}
        enabled={controlsEnabled}
      />
    </Canvas>
  );
}
