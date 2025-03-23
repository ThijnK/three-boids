import useMousePosition from "@/hooks/use-mouse-position";
import { useFrame } from "@react-three/fiber";
import React, { useMemo, useRef } from "react";
import {
  BufferGeometry,
  ConeGeometry,
  Material,
  Mesh,
  NormalBufferAttributes,
  Object3DEventMap,
  Vector3,
} from "three";

// Boids simulation parameters
const BOID_COUNT = 100;
const MAX_SPEED = 0.05;
const SEPARATION_DISTANCE = 1;
const ALIGNMENT_DISTANCE = 2;
const COHESION_DISTANCE = 2;
const SEPARATION_FORCE = 0.05;
const ALIGNMENT_FORCE = 0.05;
const COHESION_FORCE = 0.05;
const BOUNDARY = 5;
const BOUNDARY_FORCE = 0.1;

type BoidMesh = Mesh<
  BufferGeometry<NormalBufferAttributes>,
  Material | Material[],
  Object3DEventMap
> | null;

type Boid = {
  position: Vector3;
  velocity: Vector3;
  acceleration: Vector3;
};

export default function Boids() {
  const ref = useRef<BoidMesh[]>([]);

  // Intialize boids
  const boids = useMemo(() => {
    return Array.from({ length: BOID_COUNT }, () => ({
      position: new Vector3(
        Math.random() * BOUNDARY * 2 - BOUNDARY,
        Math.random() * BOUNDARY * 2 - BOUNDARY,
        Math.random() * BOUNDARY * 2 - BOUNDARY
      ),
      velocity: new Vector3(
        Math.random() * 0.2 - 0.1,
        Math.random() * 0.2 - 0.1,
        Math.random() * 0.2 - 0.1
      ),
      acceleration: new Vector3(),
    }));
  }, []);

  // Create a cone geometry for the boid
  const geometry = useMemo(() => {
    const geo = new ConeGeometry(0.2, 0.5, 8);
    geo.rotateX(Math.PI / 2);
    return geo;
  }, []);

  useFrame((_, delta) => {
    boids.forEach((boid, i) => {
      boid.acceleration.set(0, 0, 0);

      // Apply the three rules of boids
      applySeparation(boid, boids);
      applyAlignment(boid, boids);
      applyCohesion(boid, boids);

      // Apply boundary forces to keep boids in view
      applyBoundary(boid);

      // Acceleration calculated based on the rules
      boid.velocity.add(boid.acceleration.multiplyScalar(delta));

      // Limit speed
      if (boid.velocity.length() > MAX_SPEED) {
        boid.velocity.normalize().multiplyScalar(MAX_SPEED);
      }

      boid.position.add(boid.velocity);

      // Update the mesh
      if (ref.current[i]) {
        ref.current[i].position.copy(boid.position);

        // Make boid point in the direction it's moving
        if (boid.velocity.length() > 0.001) {
          ref.current[i].lookAt(
            new Vector3().addVectors(boid.position, boid.velocity)
          );
        }
      }
    });
  });

  // Rule 1: Boids try to keep a small distance away from other boids
  function applySeparation(boid: Boid, boids: Boid[]) {
    const steer = new Vector3();
    let count = 0;

    boids.forEach((other) => {
      const distance = boid.position.distanceTo(other.position);

      if (distance > 0 && distance < SEPARATION_DISTANCE) {
        // Calculate vector pointing away from neighbor
        const diff = new Vector3().subVectors(boid.position, other.position);
        diff.normalize().divideScalar(distance); // Weight by distance
        steer.add(diff);
        count++;
      }
    });

    // Average the steering vector
    if (count > 0) {
      steer.divideScalar(count);
      steer.normalize().multiplyScalar(SEPARATION_FORCE);
    }

    boid.acceleration.add(steer);
  }

  // Rule 2: Boids try to match velocity with nearby boids
  function applyAlignment(boid: Boid, boids: Boid[]) {
    const steer = new Vector3();
    let count = 0;

    boids.forEach((other) => {
      const distance = boid.position.distanceTo(other.position);

      if (distance > 0 && distance < ALIGNMENT_DISTANCE) {
        steer.add(other.velocity);
        count++;
      }
    });

    if (count > 0) {
      steer.divideScalar(count);
      steer.normalize().multiplyScalar(ALIGNMENT_FORCE);
    }

    boid.acceleration.add(steer);
  }

  // Rule 3: Boids try to move toward the center of nearby boids
  function applyCohesion(boid: Boid, boids: Boid[]) {
    const center = new Vector3();
    let count = 0;

    boids.forEach((other) => {
      const distance = boid.position.distanceTo(other.position);

      if (distance > 0 && distance < COHESION_DISTANCE) {
        center.add(other.position);
        count++;
      }
    });

    if (count > 0) {
      center.divideScalar(count);

      // Create steering force towards center
      const desired = new Vector3().subVectors(center, boid.position);
      desired.normalize().multiplyScalar(COHESION_FORCE);

      boid.acceleration.add(desired);
    }
  }

  // Keep boids within boundaries
  function applyBoundary(boid: Boid) {
    const steer = new Vector3();

    if (boid.position.x < -BOUNDARY) steer.x = BOUNDARY_FORCE;
    else if (boid.position.x > BOUNDARY) steer.x = -BOUNDARY_FORCE;

    if (boid.position.y < -BOUNDARY) steer.y = BOUNDARY_FORCE;
    else if (boid.position.y > BOUNDARY) steer.y = -BOUNDARY_FORCE;

    if (boid.position.z < -BOUNDARY) steer.z = BOUNDARY_FORCE;
    else if (boid.position.z > BOUNDARY) steer.z = -BOUNDARY_FORCE;

    boid.acceleration.add(steer);
  }

  return (
    <>
      {boids.map((boid, index) => (
        <mesh
          key={index}
          ref={(el) => (ref.current[index] = el)}
          position={boid.position}
        >
          <primitive object={geometry} attach="geometry" />
          <meshBasicMaterial color="skyblue" />
        </mesh>
      ))}
    </>
  );
}
