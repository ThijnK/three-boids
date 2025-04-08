import React, { Ref, useMemo } from "react";
import {
  BufferGeometry,
  ConeGeometry,
  Material,
  Mesh,
  MeshStandardMaterial,
  NormalBufferAttributes,
  Object3DEventMap,
  Vector3,
} from "three";

export type BoidMesh = Mesh<
  BufferGeometry<NormalBufferAttributes>,
  Material | Material[],
  Object3DEventMap
> | null;

export type BoidProps = {
  ref: Ref<BoidMesh>;
  position?: Vector3;
};

const geometry = new ConeGeometry(0.15, 0.4, 8);
geometry.rotateX(Math.PI / 2);

const material = new MeshStandardMaterial({
  color: "#22d3ee",
  emissive: "#22d3ee",
  emissiveIntensity: 2,
  roughness: 0.5,
  metalness: 0.3,
});

export default function Boid({ ref, position }: BoidProps) {
  return (
    <mesh
      ref={ref}
      position={position}
      geometry={geometry}
      material={material}
    />
  );
}
