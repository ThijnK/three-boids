import useMousePosition from "@/hooks/use-mouse-position";
import useWindowSize from "@/hooks/use-window-size";
import { useAspect, useBounds } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import React, { useEffect, useMemo, useRef } from "react";
import {
  BoxGeometry,
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
const MAX_SPEED = 0.03;
const MAX_SPEED_MOUSE_ATTRACTION = 0.1; // Higher speed when attracted to mouse
const SEPARATION_DISTANCE = 1;
const ALIGNMENT_DISTANCE = 2;
const COHESION_DISTANCE = 1.5;
const SEPARATION_FORCE = 0.07;
const ALIGNMENT_FORCE = 0.05;
const COHESION_FORCE = 0.03;
const BOUNDARY_FORCE = 0.1;
const MOUSE_ATTRACTION_FORCE = 0.08;
const MOUSE_MIN_DISTANCE = 3; // Within this distance, boids behave normally
const MOUSE_MAX_DISTANCE = 15; // Beyond this, maximum attraction

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
  const { x, y } = useMousePosition();
  const { width, height } = useWindowSize();
  const { viewport } = useThree();

  // Intialize boids
  const boids = useMemo(() => {
    return Array.from({ length: BOID_COUNT }, () => ({
      position: new Vector3(
        Math.random() * 2,
        Math.random() * 2,
        Math.random() * 2
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

  // Reusable vectors for calculations
  const sharedVectors = useMemo(
    () => ({
      diff: new Vector3(),
      steer: new Vector3(),
      center: new Vector3(),
      mouse: new Vector3(),
    }),
    []
  );

  // Convert mouse position from screen coordinates to world coordinates
  const updateMousePos = () => {
    if (x === null || y === null || width === null || height === null)
      return null;

    // Calculate normalized device coordinates (NDC) from -1 to 1
    const mouseX = (x / width) * 2 - 1;
    const mouseY = -(y / height) * 2 + 1;

    // Convert to world coordinates using viewport
    return sharedVectors.mouse.set(
      mouseX * (viewport.width / 2),
      mouseY * (viewport.height / 2),
      0
    );
  };

  useFrame((_, delta) => {
    const mousePos = updateMousePos();
    boids.forEach((boid, i) => {
      boid.acceleration.set(0, 0, 0);

      // Calculate distance of each boid to each other boid once
      const distances = boids.map((other) =>
        boid.position.distanceTo(other.position)
      );

      // Apply the three rules of boids
      applySeparation(boid, boids, distances);
      applyAlignment(boid, boids, distances);
      applyCohesion(boid, boids, distances);

      // Apply mouse attraction if mouse position is available
      const distToMouse = mousePos ? boid.position.distanceTo(mousePos) : null;
      if (mousePos && distToMouse)
        applyMouseAttraction(boid, mousePos, distToMouse);

      // Apply boundary forces to keep boids in view
      applyBoundary(boid);

      // Acceleration calculated based on the rules
      boid.velocity.add(boid.acceleration.multiplyScalar(delta));

      // Calculate maximum speed based on distance to mouse
      let currentMaxSpeed = MAX_SPEED;
      if (distToMouse) {
        if (distToMouse > MOUSE_MIN_DISTANCE) {
          const speedFactor = Math.min(
            (distToMouse - MOUSE_MIN_DISTANCE) /
              (MOUSE_MAX_DISTANCE - MOUSE_MIN_DISTANCE),
            1
          );
          currentMaxSpeed =
            MAX_SPEED + (MAX_SPEED_MOUSE_ATTRACTION - MAX_SPEED) * speedFactor;
        }
      }

      // Limit speed
      if (boid.velocity.length() > currentMaxSpeed) {
        boid.velocity.normalize().multiplyScalar(currentMaxSpeed);
      }

      // Update position based on velocity
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
  function applySeparation(boid: Boid, boids: Boid[], distances: number[]) {
    const { diff, steer } = sharedVectors;
    steer.set(0, 0, 0);
    let count = 0;

    boids.forEach((other, i) => {
      const distance = distances[i];
      if (distance > 0 && distance < SEPARATION_DISTANCE) {
        // Calculate vector pointing away from neighbor
        diff.subVectors(boid.position, other.position);
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
  function applyAlignment(boid: Boid, boids: Boid[], distances: number[]) {
    const { steer } = sharedVectors;
    steer.set(0, 0, 0);
    let count = 0;

    boids.forEach((other, i) => {
      const distance = distances[i];
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
  function applyCohesion(boid: Boid, boids: Boid[], distances: number[]) {
    const { center, steer } = sharedVectors;
    center.set(0, 0, 0);
    let count = 0;

    boids.forEach((other, i) => {
      const distance = distances[i];
      if (distance > 0 && distance < COHESION_DISTANCE) {
        center.add(other.position);
        count++;
      }
    });

    if (count > 0) {
      center.divideScalar(count);

      // Create steering force towards center
      steer.subVectors(center, boid.position);
      steer.normalize().multiplyScalar(COHESION_FORCE);

      boid.acceleration.add(steer);
    }
  }

  // Apply attraction force towards the mouse
  function applyMouseAttraction(
    boid: Boid,
    mousePos: Vector3,
    distToMouse: number
  ) {
    const { steer } = sharedVectors;
    steer.set(0, 0, 0);

    if (distToMouse > MOUSE_MIN_DISTANCE) {
      // Calculate attraction strength based on distance
      let attractionStrength = Math.min(
        (distToMouse - MOUSE_MIN_DISTANCE) /
          (MOUSE_MAX_DISTANCE - MOUSE_MIN_DISTANCE),
        1
      );

      // Create steering vector towards mouse
      steer.subVectors(mousePos, boid.position);
      steer.normalize();

      // Attraction force increases with distance
      steer.multiplyScalar(MOUSE_ATTRACTION_FORCE * attractionStrength);

      boid.acceleration.add(steer);
    }
  }

  // Keep boids within boundaries
  function applyBoundary(boid: Boid) {
    const { steer } = sharedVectors;
    steer.set(0, 0, 0);
    const boundX = viewport.width / 2;
    const boundY = viewport.height / 2;
    const boundZ = 5; // Fixed value

    if (boid.position.x < -boundX) steer.x = BOUNDARY_FORCE;
    else if (boid.position.x > boundX) steer.x = -BOUNDARY_FORCE;

    if (boid.position.y < -boundY) steer.y = BOUNDARY_FORCE;
    else if (boid.position.y > boundY) steer.y = -BOUNDARY_FORCE;

    if (boid.position.z < -boundZ) steer.z = BOUNDARY_FORCE;
    else if (boid.position.z > boundZ) steer.z = -BOUNDARY_FORCE;

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
      {/* Draw temporary red lines for where the edges of the window should be */}
      <lineSegments>
        <edgesGeometry
          args={[new BoxGeometry(viewport.width, viewport.height, 10)]}
        ></edgesGeometry>
        <lineBasicMaterial color="red" />
      </lineSegments>
    </>
  );
}
