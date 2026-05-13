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

const WRAPPER_SCALE     = 0.78;
const WRAPPER_OPENING_Y = 0.12; // target Y for wrapper's top edge in world space

// ── Matte-black override for wrapper_wrapped_base.glb ─────────────────────────
function makeMatteMat(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color('#1E1E1E'),
    roughness: 0.86,
    metalness: 0.04,
  });
}

// ── Clone GLTF scene, optionally overriding every mesh material ───────────────
function cloneScene(scene: THREE.Group, overrideMat?: THREE.Material): THREE.Group {
  const clone = scene.clone(true);
  clone.traverse((node) => {
    const mesh = node as THREE.Mesh;
    if (!mesh.isMesh) return;
    if (overrideMat) {
      mesh.material = overrideMat;
    } else if (Array.isArray(mesh.material)) {
      mesh.material = mesh.material.map((m) => (m as THREE.Material).clone());
    } else {
      mesh.material = (mesh.material as THREE.Material).clone();
    }
  });
  return clone;
}

// ── Bouquet slot table ─────────────────────────────────────────────────────────
// Each entry: [x, y, z, tiltX°, tiltZ°]
// Y values position the rose origin so petals sit above the wrapper opening.
const SLOTS: ReadonlyArray<[number, number, number, number, number]> = [
  [  0.00,  0.05,  0.00,   -8,    0 ], // 0 center
  [ -0.20,  0.00,  0.10,  -13,  +13 ], // 1 left-front
  [  0.20,  0.00,  0.10,  -13,  -13 ], // 2 right-front
  [  0.00,  0.17, -0.10,   -5,    0 ], // 3 back-center (tallest)
  [ -0.18,  0.13, -0.07,   -7,   +9 ], // 4 left-back
  [  0.18,  0.13, -0.07,   -7,   -9 ], // 5 right-back
  [ -0.34,  0.05,  0.02,  -10,  +20 ], // 6 far-left
  [  0.34,  0.05,  0.02,  -10,  -20 ], // 7 far-right
  [  0.00, -0.08,  0.18,  -16,    0 ], // 8 front-bottom
];

function getSlotOrder(total: number): number[] {
  switch (total) {
    case 1: return [0];
    case 2: return [1, 2];
    case 3: return [3, 1, 2];
    case 4: return [3, 1, 2, 0];
    case 5: return [3, 1, 2, 4, 5];
    case 6: return [3, 1, 2, 4, 5, 0];
    case 7: return [3, 1, 2, 4, 5, 6, 7];
    case 8: return [3, 1, 2, 4, 5, 6, 7, 0];
    default: return [3, 1, 2, 4, 5, 6, 7, 0, 8];
  }
}

// ── Single rose — Meshy texture, no material override ─────────────────────────
function RoseInstance({ roseTypeId }: { roseTypeId: string }) {
  const glbPath = ROSE_GLB[roseTypeId] ?? ROSE_GLB.red;
  const { scene } = useGLTF(glbPath);
  const cloned = useMemo(() => cloneScene(scene as unknown as THREE.Group), [scene]);
  return <primitive object={cloned} />;
}

// ── Animated rose — drops in from above on mount, lerps on slot change ─────────
interface AnimatedRoseProps {
  roseTypeId: string;
  targetX: number;
  targetY: number;
  targetZ: number;
  scale: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  isSelected: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onClick?: (e: any) => void;
}

function AnimatedRose({
  roseTypeId, targetX, targetY, targetZ,
  scale, rotX, rotY, rotZ,
  isSelected, onClick,
}: AnimatedRoseProps) {
  const groupRef  = useRef<THREE.Group>(null!);
  // Entrance: start above the target slot
  const animPos   = useRef(new THREE.Vector3(targetX, targetY + 0.50, targetZ));
  const targetVec = useRef(new THREE.Vector3(targetX, targetY, targetZ));

  // Update target when slot changes (rearrangement animation)
  useEffect(() => {
    targetVec.current.set(targetX, targetY, targetZ);
  }, [targetX, targetY, targetZ]);

  useFrame((_, dt) => {
    if (!groupRef.current) return;
    const k = 1 - Math.exp(-dt * 7);
    animPos.current.lerp(targetVec.current, k);
    groupRef.current.position.copy(animPos.current);
  });

  return (
    <group
      ref={groupRef}
      position={[targetX, targetY + 0.50, targetZ]}
      scale={scale}
      rotation={[rotX, rotY, rotZ]}
      onClick={onClick}
    >
      <RoseInstance roseTypeId={roseTypeId} />

      {isSelected && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.5, 1.82, 48]} />
          <meshBasicMaterial color="#222222" opacity={0.30} transparent side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

// ── Wrapper GLB ───────────────────────────────────────────────────────────────
interface WrapperModelProps {
  wrapperState: WrapperState;
  onTyingComplete?: () => void;
}

function WrapperModel({ wrapperState, onTyingComplete }: WrapperModelProps) {
  const wrappedGlb    = useGLTF(WRAPPER_GLB);
  const ribbonTiedGlb = useGLTF(WRAPPER_RIBBON_GLB);

  useEffect(() => {
    if (wrapperState !== 'tying') return;
    const t = setTimeout(() => onTyingComplete?.(), 1200);
    return () => clearTimeout(t);
  }, [wrapperState, onTyingComplete]);

  const useRibbon = wrapperState === 'tying' || wrapperState === 'ribbonTied';

  // Matte black for wrapped base; ribbon tied keeps its original GLB materials
  const matteMat = useMemo(() => makeMatteMat(), []);
  const wrappedClone = useMemo(
    () => cloneScene(wrappedGlb.scene as unknown as THREE.Group, matteMat),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [wrappedGlb.scene],
  );
  const ribbonClone = useMemo(
    () => cloneScene(ribbonTiedGlb.scene as unknown as THREE.Group),
    [ribbonTiedGlb.scene],
  );

  // Position wrapper so its top edge aligns with WRAPPER_OPENING_Y.
  // Falls back to -0.68 when bounding box is unavailable (e.g. LFS pointer env).
  const posY = useMemo(() => {
    const src = useRibbon ? ribbonTiedGlb.scene : wrappedGlb.scene;
    const bbox = new THREE.Box3().setFromObject(src as unknown as THREE.Object3D);
    if (bbox.isEmpty() || !isFinite(bbox.max.y) || bbox.max.y <= 0) return -0.68;
    return WRAPPER_OPENING_Y - bbox.max.y * WRAPPER_SCALE;
  }, [useRibbon, wrappedGlb.scene, ribbonTiedGlb.scene]);

  return (
    <primitive
      object={useRibbon ? ribbonClone : wrappedClone}
      position={[0, posY, 0]}
      scale={[WRAPPER_SCALE, WRAPPER_SCALE, WRAPPER_SCALE]}
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

  // Shrink roses slightly for larger bouquets to prevent crowding
  const baseScaleMult = total <= 3 ? 0.29 : total <= 6 ? 0.26 : 0.23;
  const slotOrder = getSlotOrder(Math.min(total, 9));
  const DEG = Math.PI / 180;

  return (
    <group>
      <WrapperModel wrapperState={wrapperState} onTyingComplete={onTyingComplete} />

      {roses.map((rose, idx) => {
        const slotIdx = slotOrder[idx] ?? slotOrder[slotOrder.length - 1];
        const [sx, sy, sz, tiltX, tiltZ] = SLOTS[slotIdx];

        return (
          <AnimatedRose
            key={rose.id}
            roseTypeId={rose.roseTypeId}
            targetX={sx}
            targetY={sy}
            targetZ={sz}
            scale={rose.scale * baseScaleMult}
            rotX={tiltX * DEG}
            rotY={rose.rotation * DEG}
            rotZ={tiltZ * DEG}
            isSelected={!!(editMode && selectedId === rose.id)}
            onClick={editMode ? (e) => { e.stopPropagation(); onSelect?.(rose.id); } : undefined}
          />
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

  const cameraPos: [number, number, number]   = editMode ? [0, 0.8, 3.8] : [0, 1.0, 4.2];
  const orbitTarget: [number, number, number] = [0, 0.10, 0];

  return (
    <Canvas
      camera={{ position: cameraPos, fov: 42 }}
      gl={{ antialias: true, alpha: false }}
      onCreated={({ gl }) => {
        gl.setClearColor(new THREE.Color('#F4F2EE'), 1);
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.75;
      }}
      style={{ width: '100%', height: '100%' }}
      onPointerMissed={() => editMode && onSelect?.(null)}
    >
      {/* Bright ambient lifts the whole scene uniformly */}
      <ambientLight intensity={1.55} color="#FFFFFF" />
      {/* Primary key — above-front, bright white */}
      <directionalLight intensity={2.6} position={[1, 6, 4]} color="#FFFFFF" />
      {/* Fill — left side, slightly warm */}
      <directionalLight intensity={1.1} position={[-4, 3, 2]} color="#FFF8F0" />
      {/* Front point — removes petal face shadows */}
      <pointLight intensity={1.3} position={[0, 1.5, 4]} color="#FFFFFF" />
      {/* Soft rim — outlines wrapper against warm bg */}
      <pointLight intensity={0.28} position={[0, 3, -4]} color="#C8D8F0" />

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
