'use client';

import { Suspense, useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { BouquetData, WrapperState } from '@/types/bouquet';

// ── GLB paths ─────────────────────────────────────────────────────────────────
const ROSE_GLB_PATH: Record<string, string> = {
  red:   '/assets/3d/roses/rose-red.glb',
  pink:  '/assets/3d/roses/rose-pink.glb',
  white: '/assets/3d/roses/rose-white.glb',
  peach: '/assets/3d/roses/rose-peach.glb',
};

// Fixed ANDZ satin silver ribbon
const RIBBON_COLOR = '#C8C8CC';

// ── Deep-clone a GLTF scene preserving each mesh's own material instance ─────
// Required so multiple roses of the same type render independently.
// material.clone() copies all texture references (shared GPU resources = fine).
function cloneRoseScene(scene: THREE.Group): THREE.Group {
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

// ── Matte black wrapper material — slightly lighter so silhouette shows ───────
const makeWrapperMat = () =>
  new THREE.MeshStandardMaterial({
    color: new THREE.Color('#1C1C1C'),
    roughness: 0.72,
    metalness: 0.06,
  });

// ── Single rose GLB — renders with its original Meshy texture, no override ───
function RoseInstance({ roseTypeId }: { roseTypeId: string }) {
  const glbPath = ROSE_GLB_PATH[roseTypeId] ?? '/assets/3d/roses/rose-red.glb';
  const { scene } = useGLTF(glbPath);

  // Deep-clone so each instance has independent material (preserves textures)
  const cloned = useMemo(
    () => cloneRoseScene(scene as unknown as THREE.Group),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [scene]
  );

  return <primitive object={cloned} />;
}

// ── Wrapper GLB ───────────────────────────────────────────────────────────────
// wrapper_wrapped_base.glb:     same geometry as a rose (~0.82×1.90×0.78 units)
// wrapper_ribbon_tied_base.glb: wider (~1.47×1.90×1.33), no embedded textures
// Both are displayed with a custom dark material so they read as wrapping paper.
// Non-uniform scale [0.58, 0.40, 0.58] compresses the wrapper vertically and
// widens it so it looks like a sleeve cupping the rose stems, not another rose.
function WrapperModel({ wrapperState, roseCount }: { wrapperState: WrapperState; roseCount: number }) {
  const wrappedGlb    = useGLTF('/assets/3d/wrappers/wrapper_wrapped_base.glb');
  const ribbonTiedGlb = useGLTF('/assets/3d/wrappers/wrapper_ribbon_tied_base.glb');

  const activeScene = wrapperState === 'ribbonTied'
    ? (ribbonTiedGlb.scene as unknown as THREE.Group)
    : (wrappedGlb.scene   as unknown as THREE.Group);

  const cloned = useMemo(() => {
    const clone = activeScene.clone(true);
    const mat   = makeWrapperMat();
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) (child as THREE.Mesh).material = mat;
    });
    return clone;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeScene]);

  // Only show wrapper when at least one rose is in the bouquet
  if (roseCount === 0) return null;

  // Non-uniform scale: squash Y so it reads as a flat sleeve (not another rose)
  // Raise Z-scale slightly so it's broader than it is tall
  const sx = wrapperState === 'ribbonTied' ? 0.55 : 0.58;
  const sy = wrapperState === 'ribbonTied' ? 0.45 : 0.40;
  const sz = wrapperState === 'ribbonTied' ? 0.55 : 0.58;

  return (
    <primitive
      object={cloned}
      position={[0, -0.15, 0]}
      scale={[sx, sy, sz]}
    />
  );
}

// ── Satin ribbon torus — grows 0→1 during 'tying' ────────────────────────────
interface RibbonBandProps {
  wrapperState: WrapperState;
  onTyingComplete?: () => void;
}

function RibbonBand({ wrapperState, onTyingComplete }: RibbonBandProps) {
  const meshRef     = useRef<THREE.Mesh>(null!);
  const progressRef = useRef(0);
  const calledRef   = useRef(false);

  useEffect(() => {
    if (wrapperState === 'tying') { progressRef.current = 0; calledRef.current = false; }
  }, [wrapperState]);

  useFrame((_, delta) => {
    if (wrapperState !== 'tying') return;
    if (progressRef.current >= 1) {
      if (!calledRef.current) { calledRef.current = true; onTyingComplete?.(); }
      return;
    }
    progressRef.current = Math.min(1, progressRef.current + delta * 1.1);
    const t = progressRef.current;
    // Cubic ease-in-out
    const s = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    if (meshRef.current) meshRef.current.scale.set(s, 1, s);
  });

  if (wrapperState !== 'tying' && wrapperState !== 'ribbonTied') return null;

  // Position ribbon at the wrapper-top / stem junction
  return (
    <mesh
      ref={meshRef}
      position={[0, 0.18, 0]}
      scale={wrapperState === 'ribbonTied' ? [1, 1, 1] : [0.001, 1, 0.001]}
    >
      <torusGeometry args={[0.30, 0.028, 10, 64]} />
      <meshStandardMaterial color={RIBBON_COLOR} roughness={0.22} metalness={0.12} />
    </mesh>
  );
}

// ── Main scene group ──────────────────────────────────────────────────────────
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
  const roses    = bouquetData.roses;
  const zIndices = roses.map((r) => r.zIndex);
  const zMin     = zIndices.length ? Math.min(...zIndices) : 0;
  const zMax     = zIndices.length ? Math.max(...zIndices) : 1;
  const zRange   = Math.max(1, zMax - zMin);

  return (
    <group>
      {/* Wrapper — shown only when roses exist, positioned below rose stems */}
      <WrapperModel wrapperState={wrapperState} roseCount={roses.length} />

      {roses.map((rose) => {
        const cx        = rose.x / 100 - 0.5;          // -0.5 … +0.5
        const worldX    = cx * 1.5;                     // horizontal spread ±0.75
        // Fan arc: center roses slightly higher than edge roses
        const worldY    = 0.55 + Math.max(0, 0.4 - Math.abs(cx) * 0.6) * 0.3;
        const depthNorm = (rose.zIndex - zMin) / zRange;
        const worldZ    = (depthNorm - 0.5) * 0.35;    // depth variation

        // Fan tilt: outer roses lean outward (Z axis); all lean slightly back (X axis)
        const fanTiltZ  = -cx * 25;                     // ±12.5° at edge

        const isSelected = editMode && selectedId === rose.id;

        return (
          <group
            key={rose.id}
            position={[worldX, worldY, worldZ]}
            scale={rose.scale * 0.35}          // 0.35 × 1.9 ≈ 0.665 units tall
            rotation={[
              (-8 * Math.PI) / 180,            // -8° backward lean (all roses)
              (rose.rotation * Math.PI) / 180, // user rotation (Y axis)
              (fanTiltZ * Math.PI) / 180,      // fan spread (Z axis)
            ]}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onClick={editMode ? (e: any) => { e.stopPropagation(); onSelect?.(rose.id); } : undefined}
          >
            {/* Rose GLB — original Meshy texture, NO material override */}
            <RoseInstance roseTypeId={rose.roseTypeId} />

            {/* Selection ring */}
            {isSelected && (
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[1.5, 1.85, 48]} />
                <meshBasicMaterial color="#FFFFFF" opacity={0.40} transparent side={THREE.DoubleSide} />
              </mesh>
            )}
          </group>
        );
      })}

      {/* Ribbon — silver, appears during / after tying */}
      <RibbonBand wrapperState={wrapperState} onTyingComplete={onTyingComplete} />
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
      <meshStandardMaterial color="#555" roughness={0.5} />
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
    useGLTF.preload('/assets/3d/roses/rose-red.glb');
    useGLTF.preload('/assets/3d/roses/rose-pink.glb');
    useGLTF.preload('/assets/3d/roses/rose-white.glb');
    useGLTF.preload('/assets/3d/roses/rose-peach.glb');
    useGLTF.preload('/assets/3d/wrappers/wrapper_wrapped_base.glb');
    useGLTF.preload('/assets/3d/wrappers/wrapper_ribbon_tied_base.glb');
  }, []);

  const controlsEnabled = editMode
    ? wrapperState !== 'tying'
    : wrapperState === 'ribbonTied';

  // Camera: close enough to see rose detail, back enough to see wrapper too
  const cameraPos: [number, number, number] = editMode ? [0, 1.0, 4.5] : [0, 1.2, 5.0];

  // OrbitControls target: midpoint between rose heads and wrapper
  const orbitTarget: [number, number, number] = [0, 0.25, 0];

  return (
    <Canvas
      camera={{ position: cameraPos, fov: 38 }}
      gl={{ antialias: true, alpha: true }}
      style={{ width: '100%', height: '100%' }}
      onPointerMissed={() => editMode && onSelect?.(null)}
    >
      {/* Hemisphere light: helps reveal black wrapper silhouette */}
      <hemisphereLight args={['#6888A8', '#2A2028', 0.55]} />
      <ambientLight intensity={0.35} color="#C8D4E0" />
      <directionalLight intensity={1.6} position={[3, 5, 2]} color="#FFFFFF" castShadow={false} />
      <pointLight intensity={0.60} position={[-3, 2, 1]} color="#B0C8E4" />
      <pointLight intensity={0.30} position={[0, -1, -3]} color="#E8D0C0" />
      {/* Rim light from behind to outline wrapper shape */}
      <pointLight intensity={0.45} position={[0, 1.5, -4]} color="#8898B8" />

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
