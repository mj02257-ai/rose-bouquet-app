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

// ── Deep-clone a GLTF scene, giving each mesh its own material instance ───────
// Preserves all original textures/materials from the GLB — no color overrides.
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

// ── Bouquet slot positions by count ───────────────────────────────────────────
// Positions are in world-space units. Roses are scale × 0.32 (≈ 0.61 units tall).
// Wrapper base sits at Y = −0.25. Stems should visually converge into it.
interface SlotTransform {
  pos: [number, number, number];
  tiltZ: number; // degrees, outward lean
  tiltX: number; // degrees, forward/back lean
}

function getBouquetSlot(index: number, total: number): SlotTransform {
  if (total === 1) {
    return { pos: [0, 0.58, 0], tiltZ: 0, tiltX: -10 };
  }
  if (total === 2) {
    const slots: SlotTransform[] = [
      { pos: [-0.28, 0.53, 0.00], tiltZ:  14, tiltX: -8 },
      { pos: [ 0.28, 0.53, 0.00], tiltZ: -14, tiltX: -8 },
    ];
    return slots[index] ?? slots[0];
  }
  if (total === 3) {
    // Triangle: top-center back, bottom-left front, bottom-right front
    const slots: SlotTransform[] = [
      { pos: [ 0.00, 0.72, -0.10], tiltZ:   0, tiltX: -12 },
      { pos: [-0.33, 0.44,  0.10], tiltZ:  18, tiltX:  -6 },
      { pos: [ 0.33, 0.44,  0.10], tiltZ: -18, tiltX:  -6 },
    ];
    return slots[index] ?? slots[0];
  }
  // 4+ roses: expanding radial cluster
  const cluster: SlotTransform[] = [
    { pos: [ 0.00, 0.66, -0.08], tiltZ:   0, tiltX: -12 },
    { pos: [-0.30, 0.50,  0.08], tiltZ:  16, tiltX:  -8 },
    { pos: [ 0.30, 0.50,  0.08], tiltZ: -16, tiltX:  -8 },
    { pos: [ 0.00, 0.38,  0.18], tiltZ:   0, tiltX:  -4 },
    { pos: [-0.20, 0.78, -0.14], tiltZ:  10, tiltX: -14 },
    { pos: [ 0.20, 0.78, -0.14], tiltZ: -10, tiltX: -14 },
    { pos: [-0.47, 0.57,  0.00], tiltZ:  24, tiltX:  -8 },
    { pos: [ 0.47, 0.57,  0.00], tiltZ: -24, tiltX:  -8 },
  ];
  return cluster[index % cluster.length] ?? cluster[0];
}

// ── Single rose — renders with original Meshy texture, no material override ───
function RoseInstance({ roseTypeId }: { roseTypeId: string }) {
  const glbPath = ROSE_GLB[roseTypeId] ?? ROSE_GLB.red;
  const { scene } = useGLTF(glbPath);
  const cloned = useMemo(() => cloneScene(scene as unknown as THREE.Group), [scene]);
  return <primitive object={cloned} />;
}

// ── Wrapper GLB — original material, no override ──────────────────────────────
interface WrapperModelProps {
  wrapperState: WrapperState;
  roseCount: number;
  onTyingComplete?: () => void;
}

function WrapperModel({ wrapperState, roseCount, onTyingComplete }: WrapperModelProps) {
  const wrappedGlb    = useGLTF(WRAPPER_GLB);
  const ribbonTiedGlb = useGLTF(WRAPPER_RIBBON_GLB);

  // Trigger transition to ribbonTied after a visual pause
  useEffect(() => {
    if (wrapperState !== 'tying') return;
    const t = setTimeout(() => onTyingComplete?.(), 1200);
    return () => clearTimeout(t);
  }, [wrapperState, onTyingComplete]);

  if (roseCount === 0) return null;

  // Show ribbon-tied GLB (which contains the ribbon) during and after tying
  const useRibbon  = wrapperState === 'tying' || wrapperState === 'ribbonTied';
  const activeGlb  = useRibbon ? ribbonTiedGlb : wrappedGlb;
  const activeScene = activeGlb.scene as unknown as THREE.Group;

  // Clone preserving original GLB materials (no color override)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const cloned = useMemo(() => cloneScene(activeScene), [activeScene]);

  return (
    <primitive
      object={cloned}
      position={[0, -0.25, 0]}
      scale={[0.62, 0.62, 0.62]}
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

  return (
    <group>
      <WrapperModel
        wrapperState={wrapperState}
        roseCount={total}
        onTyingComplete={onTyingComplete}
      />

      {roses.map((rose, index) => {
        const { pos, tiltZ, tiltX } = getBouquetSlot(index, total);
        const isSelected = editMode && selectedId === rose.id;

        return (
          <group
            key={rose.id}
            position={pos}
            scale={rose.scale * 0.32}
            rotation={[
              (tiltX * Math.PI) / 180,
              (rose.rotation * Math.PI) / 180,
              (tiltZ * Math.PI) / 180,
            ]}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onClick={editMode ? (e: any) => { e.stopPropagation(); onSelect?.(rose.id); } : undefined}
          >
            <RoseInstance roseTypeId={rose.roseTypeId} />

            {isSelected && (
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[1.5, 1.85, 48]} />
                <meshBasicMaterial color="#FFFFFF" opacity={0.40} transparent side={THREE.DoubleSide} />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}

// ── Loading spinner (Suspense fallback) ───────────────────────────────────────
function LoadingMesh() {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.y += dt * 1.2; });
  return (
    <mesh ref={ref} position={[0, 0.4, 0]}>
      <octahedronGeometry args={[0.12, 0]} />
      <meshStandardMaterial color="#666" roughness={0.5} />
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

  // Orbit controls: enabled only when not tying (edit) or after ribbon tied (showcase)
  const controlsEnabled = editMode
    ? wrapperState !== 'tying'
    : wrapperState === 'ribbonTied';

  const cameraPos: [number, number, number] = editMode ? [0, 1.2, 4.0] : [0, 1.4, 4.6];
  const orbitTarget: [number, number, number] = [0, 0.40, 0];

  return (
    <Canvas
      camera={{ position: cameraPos, fov: 40 }}
      gl={{ antialias: true, alpha: true }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.5;
      }}
      style={{ width: '100%', height: '100%' }}
      onPointerMissed={() => editMode && onSelect?.(null)}
    >
      {/* Bright ambient — base illumination for roses and wrapper */}
      <ambientLight intensity={1.1} color="#F0F2F8" />
      {/* Key light — above-front, warm white */}
      <directionalLight intensity={2.2} position={[1, 5, 3]} color="#FFFFFF" />
      {/* Fill light — left side, slightly warm */}
      <directionalLight intensity={0.9} position={[-3, 3, 2]} color="#FFF4E8" />
      {/* Front point light — lifts shadows on petals */}
      <pointLight intensity={1.0} position={[0, 2, 4]} color="#FFFFFF" />
      {/* Rim light — back, outlines wrapper silhouette against dark bg */}
      <pointLight intensity={0.55} position={[0, 2.5, -4]} color="#A8C0E0" />
      {/* Under-fill — subtle warmth from below wrapper */}
      <pointLight intensity={0.30} position={[0, -2, 2]} color="#E8C8A8" />

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
        minPolarAngle={Math.PI / 5}
        maxPolarAngle={Math.PI * 0.72}
        enabled={controlsEnabled}
      />
    </Canvas>
  );
}
