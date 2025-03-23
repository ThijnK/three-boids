import useMousePosition from "@/hooks/use-mouse-position";
import { useFrame } from "@react-three/fiber";
import React, { useRef } from "react";
import { ConeGeometry, Mesh, MeshBasicMaterial, Vector3 } from "three";

const BOID_COUNT = 100;

type Boid = Mesh<ConeGeometry, MeshBasicMaterial>;

export default function Boids() {
  const refs = useRef(
    Array.from({ length: BOID_COUNT }, () => React.createRef<Boid>())
  );

  useFrame(({ viewport }, delta) => {
    refs.current.forEach((ref, i) => {
      if (!ref.current) return;
      const boid = ref.current;
      // Rotate the boid slightly in a random direction
      boid.rotateOnAxis(
        new Vector3(
          Math.random() - 0.5,
          Math.random() - 0.5,
          Math.random() - 0.5
        ).normalize(),
        delta * 5
      );
      // Determine direction the boid is pointing in
      const direction = new Vector3(0, 1, 0).applyQuaternion(boid.quaternion);

      // Move the boid forward
      boid.position.addScaledVector(direction, delta * 0.5);
    });
  });

  return (
    <>
      {refs.current.map((ref, index) => (
        <mesh key={index} ref={ref}>
          <coneGeometry args={[0.1, 0.3, 16]} rotateX={Math.PI / 2} />
          <meshBasicMaterial color="skyblue" />
        </mesh>
      ))}
    </>
  );
}
