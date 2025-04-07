"use client";

import BoidsSimulation from "@/app/boids-simulation";
import { PerspectiveCamera } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";

export default function Scene() {
  return (
    <div id="canvas-container" className="fixed inset-0">
      <Canvas>
        <ambientLight intensity={0.5} />
        <BoidsSimulation />
        <EffectComposer>
          <Bloom
            intensity={0.8}
            luminanceThreshold={0.6}
            luminanceSmoothing={1.2}
            radius={1}
          />
        </EffectComposer>
        <PerspectiveCamera makeDefault position={[0, 0, 20]} fov={40} />
      </Canvas>
    </div>
  );
}
