import useMousePosition from "@/hooks/use-mouse-position";
import { ThreeElement, ThreeElements, useFrame } from "@react-three/fiber";
import React, { useRef } from "react";
import { Mesh } from "three";

export default function Boids() {
  const { x, y } = useMousePosition();
  const ref = useRef<any>(null);

  useFrame(({ viewport }) => {
    if (ref.current) {
      ref.current.position.x = x / viewport.width;
      ref.current.position.y = -y / viewport.height;
    }
  });

  return (
    <>
      <mesh position={[x, y, 0]} ref={ref}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="skyblue" />
      </mesh>
    </>
  );
}
