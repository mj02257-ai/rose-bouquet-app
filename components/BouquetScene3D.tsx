'use client';

import { Suspense, useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { BouquetData, WrapperState } from '@/types/bouquet';

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

const ROSE_COLOR_OVERRIDE: Record<string, string | null> = {
  red: null, pink: null, white: null, peach: null,
  yellow:   '#D4AC0D',
  orange:   '#CA6F1E',
  lavender: '#7D3C98',
  blue:     '#1A5276',
  black:    '#111111',
};

// ── Black wrapper material ────────────────────────────────────────────────────
const makeBlackMat = () =>
  new THREE.MeshStandardMaterial({ color: new THREE.Color('#0D0D0D'), roughness: 0.88, metalness: 0.06 });

// ── Clone scene + optional color override ────────────────────────────────────
function cloneScene(scene: THREE.Group, colorOverride: string | null): THREE.Group {
  const clone = scene.clone(true);
  if (colorOverride) {
    const col = new THREE.Color(colorOverride);
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const mat  = (mesh.material as THREE.MeshStandardMaterial).clone();
        mat.color  = col;
        mesh.material = mat;
      }
    });
  }
  return clone;
}

// ── Single rose GLB (no transforms — parent group owns them) ─────────────────
function RoseInstance({ roseTypeId }: { roseTypeId: string }) {
  const glbPath      = ROSE_GLB_PATH[roseTypeId] ?? '/assets/3d/roses/rose-red.glb';
  const colorOverride = ROSE_COLOR_OVERRIDE[roseTypeId] ?? null;
  const { scene }    = useGLTF(glbPath);

  const cloned = useMemo(
    () => cloneScene(scene as unknown as THREE.Group, colorOverride),
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
  color: string;
  wrapperState: WrapperState;
  onTyingComplete?: () => void;
}

function RibbonBand({ color, wrapperState, onTyingComplete }: RibbonBandProps) {
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
      <meshStandardMaterial color={color} roughness={0.22} metalness={0.18} />
    </mesh>
  );
}

// ── Main scene group ──────────────────────────────────────────────────────────
interface BouquetGroupProps {
  bouquetData: BouquetData;
  wrapperState: WrapperState;
  dominantColor: string;
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
  editMode?: boolean;
  onTyingComplete?: () => void;
}

function BouquetGroup({
  bouquetData, wrapperState, dominantColor,
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
        const worldX      = (rose.x / 100 - 0.5) * 2.2;
        const depthNorm   = (rose.zIndex - zMin) / zRange;
        const worldY      = (1 - (rose.y * 0.66) / 100) * 2.4 + 0.4;
        const worldZ      = (depthNorm - 0.5) * 0.7;
        const isSelected  = editMode && selectedId === rose.id;

        return (
          <group
            key={rose.id}
            position={[worldX, worldY, worldZ]}
            scale={rose.scale * 0.26}
            rotation={[0, (rose.rotation * Math.PI) / 180, 0]}
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

      <RibbonBand color={dominantColor} wrapperState={wrapperState} onTyingComplete={onTyingComplete} />
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
  dominantColor: string;
  autoRotate: boolean;
  /** editMode: orbiting always on, roses clickable, no auto-rotate */
  editMode?: boolean;
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
  onTyingComplete?: () => void;
}

export default function BouquetScene3D({
  bouquetData, wrapperState, dominantColor, autoRotate,
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

  // Controls are always on in editMode (except during tying animation)
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
          dominantColor={dominantColor}
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
