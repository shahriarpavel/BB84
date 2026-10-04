import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Html } from '@react-three/drei';
import * as THREE from 'three';

const SphereVisualization = ({ activeAngle, isEve }: { activeAngle: number | null, isEve: boolean }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
      meshRef.current.rotation.x += 0.002;
    }
  });

  // Map polarization angle → 3D vector on unit sphere
  // Sphere radius is 1.2 (slightly smaller → more breathing room in panel)
  const R = 1.0;
  let x = 0, y = R;
  const z = 0;
  if (activeAngle !== null) {
    const rad = activeAngle * (Math.PI / 180);
    x = Math.cos(rad) * R;
    y = Math.sin(rad) * R;
  }

  const color = isEve ? '#ff0055' : '#00f0ff';
  const axisLen = 1.3; // axis lines slightly longer than sphere radius

  return (
    <group>
      {/* Bloch Sphere wireframe */}
      <Sphere ref={meshRef} args={[R, 32, 32]}>
        <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.15} />
      </Sphere>

      {/* Origin */}
      <mesh>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Axis lines */}
      <Line points={[[-axisLen, 0, 0], [axisLen, 0, 0]]} color="#ffffff" opacity={0.2} transparent lineWidth={1} />
      <Line points={[[0, -axisLen, 0], [0, axisLen, 0]]} color="#ffffff" opacity={0.2} transparent lineWidth={1} />
      <Line points={[[0, 0, -axisLen], [0, 0, axisLen]]} color="#ffffff" opacity={0.2} transparent lineWidth={1} />

      {/* Polarization vector */}
      {activeAngle !== null && (
        <group>
          <Line points={[[0, 0, 0], [x, y, z]]} color={color} lineWidth={4} />
          <mesh position={[x, y, z]}>
            <sphereGeometry args={[0.07, 16, 16]} />
            <meshBasicMaterial color={color} />
          </mesh>
          <Html position={[x * 1.25, y * 1.25, z]}>
            <div className={`px-2 py-1 bg-black/80 rounded-md text-xs font-mono border whitespace-nowrap
              ${isEve ? 'text-[#ff0055] border-[#ff0055]' : 'text-[#00f0ff] border-[#00f0ff]'}`}>
              {activeAngle}° {isEve && '(COLLAPSED)'}
            </div>
          </Html>
        </group>
      )}
    </group>
  );
};

interface BlochSphereProps {
  activeAngle: number | null;
  isEve: boolean;
}

const BlochSphere: React.FC<BlochSphereProps> = ({ activeAngle, isEve }) => {
  return (
    /*
     * Layout: flex-col with explicit rows so the canvas gets
     * only the remaining space and the sphere is never clipped.
     *
     *  ┌────────────────────┐
     *  │ header (shrink-0)  │  ~56px
     *  ├────────────────────┤
     *  │ canvas (flex-1)    │  remaining height
     *  ├────────────────────┤
     *  │ footer (shrink-0)  │  ~28px
     *  └────────────────────┘
     */
    <div className="w-full h-full glass-panel rounded-xl flex flex-col overflow-hidden">

      {/* Header — part of flex flow, NOT absolute */}
      <div className="shrink-0 px-4 pt-4 pb-2">
        <h3 className="text-xl font-bold tracking-widest text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">
          QUANTUM STATE
        </h3>
        <p className="text-sm font-mono opacity-60">Bloch Sphere Representation</p>
      </div>

      {/* Canvas — takes all remaining space, min-h-0 prevents flex overflow */}
      <div className="flex-1 min-h-0 w-full">
        {/* Camera pulled back to z=5 with FOV 42 → sphere comfortably fits
            at any aspect ratio without touching panel edges               */}
        <Canvas camera={{ position: [0, 0, 5], fov: 42 }}>
          <ambientLight intensity={0.5} />
          <SphereVisualization activeAngle={activeAngle} isEve={isEve} />
          <OrbitControls enableZoom={false} enablePan={false} autoRotate={false} />
        </Canvas>
      </div>

      {/* Footer — part of flex flow, NOT absolute */}
      <div className="shrink-0 px-4 pb-3 flex justify-between text-xs font-mono opacity-50">
        <span>|0⟩ = 90° (Rectilinear)</span>
        <span>|+⟩ = 45° (Diagonal)</span>
      </div>
    </div>
  );
};

export default BlochSphere;
