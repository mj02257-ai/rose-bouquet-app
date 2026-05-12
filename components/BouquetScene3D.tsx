'use client';

import { Suspense, useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { BouquetData, WrapperState } from '@/types/bouquet';

// ── GLB routing ───────────────────────────────────────────────────────────────
const ROSE_GLB_PATH: Record<string, string> = {
  red:   '/assets/3d/roses/rose-red.glb',
  pink:  '/assets/3d/roses/rose-pink.glb',
  white: '/assets/3d/roses/rose-white.glb',
  peach: '/assets/3d/roses/rose-peach.glb',
};

// Fixed ANDZ satin silver ribbon color
const RIBBON_COLOR = '#C8C8CC';

// ── Black wrapper material ────────────────────────────────────────────────────
const makeBlackMat = () =>
  new THREE.MeshStandardMaterial({ color: new THREE.Color('#080808'), roughness: 0.85, metalness: 0 });

// ── Clone scene (no color override needed — all 4 roses use native colors) ───
function cloneScene(scene: THREE.Group): THREE.Group {
  return scene.clone(true);
}

// ── Single rose GLB ───────────────────────────────────────────────────────────
function RoseInstance({ roseTypeId }: { roseTypeId: string }) {
  const glbPath = ROSE_GLB_PATH[roseTypeId] ?? '/assets/3d/roses/rose-red.glb';
  const { scene } = useGLTF(glbPath);

  const cloned = useMemo(
    () => cloneScene(scene as unknown as THREE.Group),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [scene]
  );

  return <primitive object={cloned} />;
}

// ── Wrapper GLB — always black, swaps mesh on ribbonTied ─────────────────────
function WrapperModel({ wrapperState }: { wrapperState: WrapperState }) {
  const wrappedGlb    = useGLTF('/assets/3d/wrappers/wrapper_wrapped_base.glb');
  const ribbonTiedGlb = useGLTF('/assets/3d/wrappers/wrapper_ribbon_tied_base.glb');

  const activeScene = wrapperState === 'ribbonTied'
    ? (ribbonTiedGlb.scene as unknown as THREE.Group)
    : (wrappedGlb.scene   as unknown as THREE.Group);

  const cloned = useMemo(() => {
    const clone = activeScene.clone(true);
    const mat   = makeBlackMat();
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) (child as THREE.Mesh).material = mat;
    });
    return clone;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeScene]);

  return <primitive object={cloned} position={[0, 0, 0]} />;
}

// ── Satin ribbon band — grows 0→1 during 'tying', stays visible after ────────
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
    const s = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    if (meshRef.current) meshRef.current.scale.set(s, 1, s);
  });

  if (wrapperState !== 'tying' && wrapperState !== 'ribbonTied') return null;

  return (
    <mesh
      ref={meshRef}
      position={[0, 0.35, 0]}
      scale={wrapperState === 'ribbonTied' ? [1, 1, 1] : [0.001, 1, 0.001]}
    >
      <torusGeometry args={[0.48, 0.038, 10, 72]} />
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
  bouquetData, wrapperState,
  selectedId, onSelect, editMode, onTyingComplete,
}: BouquetGroupProps) {
  const zIndices = bouquetData.roses.map((r) => r.zIndex);
  const zMin  = zIndices.length ? Math.min(...zIndices) : 0;
  const zMax  = zIndices.length ? Math.max(...zIndices) : 1;
  const zRange = Math.max(1, zMax - zMin);

  return (
    <group>
      <WrapperModel wrapperState={wrapperState} />

      {bouquetData.roses.map((rose) => {
        const cx        = rose.x / 100 - 0.5;  // -0.5 … +0.5
        const worldX    = cx * 1.3;             // spread ±0.65
        const depthNorm = (rose.zIndex - zMin) / zRange;
        // Y: center roses cluster around wrapper opening, fan-arced upward
        const worldY    = 1.2 + Math.max(0, 0.5 - Math.abs(cx) * 0.8) * 0.4;
        const worldZ    = (depthNorm - 0.5) * 0.4;
        // Tilt: fan outward on Z axis, slight backward lean on X axis
        const fanTiltZ  = -cx * 20;   // degrees
        const isSelected = editMode && selectedId === rose.id;

        return (
          <group
            key={rose.id}
            position={[worldX, worldY, worldZ]}
            scale={rose.scale * 0.10}
            rotation={[
              (-8 * Math.PI) / 180,
              (rose.rotation * Math.PI) / 180,
              (fanTiltZ * Math.PI) / 180,
            ]}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onClick={editMode ? (e: any) => { e.stopPropagation(); onSelect?.(rose.id); } : undefined}
          >
            <RoseInstance roseTypeId={rose.roseTypeId} />

            {/* Selection ring in edit mode */}
            {isSelected && (
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[1.8, 2.25, 48]} />
                <meshBasicMaterial color="#FFFFFF" opacity={0.35} transparent side={THREE.DoubleSide} />
              </mesh>
            )}
          </group>
        );
      })}

      <RibbonBand wrapperState={wrapperState} onTyingComplete={onTyingComplete} />
    </group>
  );
}

// ── Canvas loading spinner ────────────────────────────────────────────────────
function LoadingMesh() {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.y += dt * 1.2; });
  return (
    <mesh ref={ref} position={[0, 0.5, 0]}>
      <octahedronGeometry args={[0.18, 0]} />
      <meshStandardMaterial color="#444" roughness={0.5} />
    </mesh>
  );
}

// ── Public API ────────────────────────────────────────────────────────────────
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

  const cameraPos: [number, number, number] = editMode ? [0, 1.4, 3.8] : [0, 1.6, 4.2];

  return (
    <Canvas
      camera={{ position: cameraPos, fov: 34 }}
      gl={{ antialias: true, alpha: true }}
      style={{ width: '100%', height: '100%' }}
      onPointerMissed={() => editMode && onSelect?.(null)}
    >
      <ambientLight intensity={0.42} color="#C8D4E0" />
      <directionalLight intensity={1.8} position={[3, 5, 2]} color="#FFFFFF" />
      <pointLight intensity={0.55} position={[-3, 2, 1]} color="#B0C8E4" />
      <pointLight intensity={0.28} position={[0, -1, -3]} color="#E8D0C0" />

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
