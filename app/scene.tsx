"use client";

import BoidsSimulation from "@/app/boids-simulation";
import { PerspectiveCamera } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";

export default function Background() {
  return (
    <div id="canvas-container" className="fixed inset-0">
      <Canvas>
        <ambientLight intensity={0.5} />
        <BoidsSimulation />
        <EffectComposer>
          {/* Add a glowing effect for the boids */}
          <Bloom
            intensity={1.3}
            luminanceThreshold={0.5}
            luminanceSmoothing={0.9}
            radius={1}
          />
        </EffectComposer>
        <PerspectiveCamera makeDefault position={[0, 0, 20]} fov={40} />
      </Canvas>
    </div>
  );
}
