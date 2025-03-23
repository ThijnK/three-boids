"use client";

import Boids from "@/app/boids";
import { OrthographicCamera, PerspectiveCamera } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

export default function Background() {
  return (
    <div id="canvas-container" className="fixed inset-0 -z-10">
      <Canvas>
        <ambientLight intensity={0.5} />
        <Boids />
        <PerspectiveCamera makeDefault position={[0, 0, 15]} />
      </Canvas>
    </div>
  );
}
