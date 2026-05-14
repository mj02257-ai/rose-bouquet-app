'use client';

import { Suspense, useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { BouquetData, WrapperState } from '@/types/bouquet';
import type { EditingRoseData } from '@/types/bouquet';

// ── GLB paths ─────────────────────────────────────────────────────────────────
const ROSE_GLB: Record<string, string> = {
  red:   '/assets/3d/roses/rose-red.glb',
  pink:  '/assets/3d/roses/rose-pink.glb',
  white: '/assets/3d/roses/rose-white.glb',
  peach: '/assets/3d/roses/rose-peach.glb',
};
const WRAPPER_RIBBON_GLB = '/assets/3d/wrappers/wrapper_ribbon_tied_base.glb';

// ── Clone scene preserving original GLB materials ─────────────────────────────
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

// ── Slot fallback — used only for roses loaded from localStorage without x3d ──
// Y=-0.45: stem base sits 0.16 below the wrapper opening (~y=-0.29) so stems
// are hidden inside the wrapper and only flower heads show above it.
const SLOTS: ReadonlyArray<[number, number, number, number, number]> = [
  [  0.00, -0.45,  0.00,  -10,    0 ],
  [ -0.18, -0.45,  0.08,  -10,   +8 ],
  [  0.18, -0.45,  0.08,  -10,   -8 ],
  [  0.00, -0.45, -0.12,  -10,    0 ],
  [ -0.22, -0.45, -0.06,  -10,  +10 ],
  [  0.22, -0.45, -0.06,  -10,  -10 ],
  [ -0.32, -0.45,  0.02,  -10,  +16 ],
  [  0.32, -0.45,  0.02,  -10,  -16 ],
  [  0.00, -0.45,  0.16,  -10,    0 ],
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

// ── Rose mesh ─────────────────────────────────────────────────────────────────
function RoseInstance({ roseTypeId }: { roseTypeId: string }) {
  const glbPath = ROSE_GLB[roseTypeId] ?? ROSE_GLB.red;
  const { scene } = useGLTF(glbPath);
  const cloned = useMemo(() => cloneScene(scene as unknown as THREE.Group), [scene]);
  return <primitive object={cloned} />;
}

// ── Pending rose — draggable in 3D on a horizontal plane ─────────────────────
interface PendingRose3DProps {
  roseTypeId: string;
  x3d: number;
  y3d: number;
  z3d: number;
  scale: number;
  onPositionChange: (x: number, z: number) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}

function PendingRose3D({
  roseTypeId, x3d, y3d, z3d, scale,
  onPositionChange, onDragStart, onDragEnd,
}: PendingRose3DProps) {
  const { gl, camera } = useThree();
  const dragging = useRef(false);
  // Horizontal plane at rose Y level — pointer drags along this plane
  const plane = useMemo(
    () => new THREE.Plane(new THREE.Vector3(0, 1, 0), -y3d),
    [y3d],
  );

  // Stable callback refs so the effect closure never goes stale
  const posChangeCb = useRef(onPositionChange);
  posChangeCb.current = onPositionChange;
  const dragEndCb = useRef(onDragEnd);
  dragEndCb.current = onDragEnd;

  useEffect(() => {
    const canvas = gl.domElement;

    const onMove = (e: PointerEvent) => {
      if (!dragging.current) return;
      const rect = canvas.getBoundingClientRect();
      const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ndcY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      const rc = new THREE.Raycaster();
      rc.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera);
      const hit = new THREE.Vector3();
      if (rc.ray.intersectPlane(plane, hit)) {
        // Clamp to wrapper footprint so stems stay inside the bouquet
        posChangeCb.current(
          Math.max(-0.40, Math.min(0.40, hit.x)),
          Math.max(-0.30, Math.min(0.30, hit.z)),
        );
      }
    };

    const onUp = (e: PointerEvent) => {
      if (!dragging.current) return;
      dragging.current = false;
      try { canvas.releasePointerCapture(e.pointerId); } catch { /* ignore */ }
      dragEndCb.current();
    };

    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    return () => {
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
    };
  }, [gl, camera, plane]);

  return (
    <group
      position={[x3d, y3d, z3d]}
      scale={scale}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onPointerDown={(e: any) => {
        e.stopPropagation();
        dragging.current = true;
        try { gl.domElement.setPointerCapture(e.nativeEvent.pointerId); } catch { /* ignore */ }
        onDragStart();
      }}
    >
      <RoseInstance roseTypeId={roseTypeId} />
      {/* Dashed selection ring indicating "pending / not yet placed" */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.5, 0]}>
        <ringGeometry args={[1.6, 2.0, 40]} />
        <meshBasicMaterial color="#888888" opacity={0.28} transparent side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// ── Editing rose — snapped into wrapper, rotation adjustable ─────────────────
function EditingRose3D({
  roseTypeId, x3d, y3d, z3d, rotation, scale,
}: {
  roseTypeId: string; x3d: number; y3d: number; z3d: number; rotation: number; scale: number;
}) {
  const DEG = Math.PI / 180;
  return (
    <group
      position={[x3d, y3d, z3d]}
      scale={scale}
      rotation={[-10 * DEG, rotation * DEG, 0]}
    >
      <RoseInstance roseTypeId={roseTypeId} />
      {/* Gold ring — indicates "placed but not yet fixed" */}
      <mesh position={[0, 0.4, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.2, 1.6, 40]} />
        <meshBasicMaterial color="#C8A84B" opacity={0.55} transparent side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// ── Wrapper — single GLB, original materials ──────────────────────────────────
interface WrapperModelProps {
  wrapperState: WrapperState;
  onTyingComplete?: () => void;
}

function WrapperModel({ wrapperState, onTyingComplete }: WrapperModelProps) {
  const { scene } = useGLTF(WRAPPER_RIBBON_GLB);

  useEffect(() => {
    if (wrapperState !== 'tying') return;
    const t = setTimeout(() => onTyingComplete?.(), 1200);
    return () => clearTimeout(t);
  }, [wrapperState, onTyingComplete]);

  const cloned = useMemo(() => cloneScene(scene as unknown as THREE.Group), [scene]);

  return (
    <primitive object={cloned} position={[0, -0.68, 0]} scale={[0.78, 0.78, 0.78]} />
  );
}

// ── Bouquet group — confirmed roses ──────────────────────────────────────────
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
  const baseScaleMult = total <= 3 ? 0.354 : total <= 6 ? 0.317 : 0.281;
  const slotOrder = getSlotOrder(Math.min(total, 9));
  const DEG = Math.PI / 180;
  const FIXED_TILT_X = -10 * DEG;

  return (
    <group>
      <WrapperModel wrapperState={wrapperState} onTyingComplete={onTyingComplete} />

      {roses.map((rose, idx) => {
        let sx: number, sy: number, sz: number, rotX: number, rotZ: number;
        if (rose.x3d !== undefined && rose.y3d !== undefined && rose.z3d !== undefined) {
          // Free-placed rose — use stored 3D position
          sx = rose.x3d; sy = rose.y3d; sz = rose.z3d;
          rotX = FIXED_TILT_X; rotZ = 0;
        } else {
          // Legacy slot-based fallback (roses loaded from old localStorage saves)
          const slotIdx = slotOrder[idx] ?? slotOrder[slotOrder.length - 1];
          const [slotX, slotY, slotZ, tiltXd, tiltZd] = SLOTS[slotIdx];
          sx = slotX; sy = slotY; sz = slotZ;
          rotX = tiltXd * DEG; rotZ = tiltZd * DEG;
        }

        const isSelected = !!(editMode && selectedId === rose.id);

        return (
          <group
            key={rose.id}
            position={[sx, sy, sz]}
            scale={baseScaleMult}
            rotation={[rotX, rose.rotation * DEG, rotZ]}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onClick={editMode ? (e: any) => { e.stopPropagation(); onSelect?.(rose.id); } : undefined}
          >
            <RoseInstance roseTypeId={rose.roseTypeId} />

            {isSelected && (
              <mesh position={[0, 0.4, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[1.2, 1.5, 40]} />
                <meshBasicMaterial color="#FFFFFF" opacity={0.50} transparent side={THREE.DoubleSide} />
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

// ── Props & exports ───────────────────────────────────────────────────────────
export type PendingRoseData = {
  roseTypeId: string;
  x3d: number;
  y3d: number;
  z3d: number;
};

export type { EditingRoseData };

export interface BouquetScene3DProps {
  bouquetData: BouquetData;
  wrapperState: WrapperState;
  autoRotate: boolean;
  editMode?: boolean;
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
  onTyingComplete?: () => void;
  pendingRose?: PendingRoseData | null;
  onPendingPositionChange?: (x: number, z: number) => void;
  editingRose?: EditingRoseData | null;
}

export default function BouquetScene3D({
  bouquetData, wrapperState, autoRotate,
  editMode, selectedId, onSelect, onTyingComplete,
  pendingRose, onPendingPositionChange, editingRose,
}: BouquetScene3DProps) {
  const [isDraggingPending, setIsDraggingPending] = useState(false);

  useEffect(() => {
    Object.values(ROSE_GLB).forEach((p) => useGLTF.preload(p));
    useGLTF.preload(WRAPPER_RIBBON_GLB);
  }, []);

  const total = bouquetData.roses.length;
  const pendingScale = (total + 1) <= 3 ? 0.354 : (total + 1) <= 6 ? 0.317 : 0.281;
  const editingScale = (total + 1) <= 3 ? 0.354 : (total + 1) <= 6 ? 0.317 : 0.281;

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
      <ambientLight intensity={1.55} color="#FFFFFF" />
      <directionalLight intensity={2.6} position={[1, 6, 4]} color="#FFFFFF" />
      <directionalLight intensity={1.1} position={[-4, 3, 2]} color="#FFF8F0" />
      <pointLight intensity={1.3} position={[0, 1.5, 4]} color="#FFFFFF" />
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

        {editingRose && (
          <EditingRose3D
            roseTypeId={editingRose.roseTypeId}
            x3d={editingRose.x3d}
            y3d={editingRose.y3d}
            z3d={editingRose.z3d}
            rotation={editingRose.rotation}
            scale={editingScale}
          />
        )}

        {pendingRose && onPendingPositionChange && (
          <PendingRose3D
            roseTypeId={pendingRose.roseTypeId}
            x3d={pendingRose.x3d}
            y3d={pendingRose.y3d}
            z3d={pendingRose.z3d}
            scale={pendingScale}
            onPositionChange={onPendingPositionChange}
            onDragStart={() => setIsDraggingPending(true)}
            onDragEnd={() => setIsDraggingPending(false)}
          />
        )}
      </Suspense>

      <OrbitControls
        target={orbitTarget}
        enablePan={false}
        enableZoom={false}
        autoRotate={!editMode && autoRotate && wrapperState === 'ribbonTied'}
        autoRotateSpeed={1.4}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI * 0.70}
        enabled={controlsEnabled && !isDraggingPending}
      />
    </Canvas>
  );
}
