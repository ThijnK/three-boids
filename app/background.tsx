"use client";

import { Canvas } from "@react-three/fiber";

export default function Background() {
  return (
    <div id="canvas-container" className="fixed inset-0 -z-10">
      <Canvas>
        <ambientLight />
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="skyblue" />
        </mesh>
      </Canvas>
    </div>
  );
}
