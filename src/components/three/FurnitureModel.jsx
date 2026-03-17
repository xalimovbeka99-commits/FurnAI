"use client";

import { useRef } from "react";
import { RoundedBox } from "@react-three/drei";

export default function FurnitureModel({ design }) {
  const groupRef = useRef();

  if (!design || !design.parts) return null;

  return (
    <group ref={groupRef}>
      {design.parts.map((part, index) => (
        <Part key={index} data={part} />
      ))}

      {/* Floor grid */}
      <gridHelper args={[5, 30, "#2a2a2a", "#1f1f1f"]} position={[0, -0.002, 0]} />
    </group>
  );
}

function Part({ data }) {
  const { geo, args, position, rotation, material, radius, segments } = data;

  const matProps = {
    color: material?.color || "#8B6914",
    roughness: material?.roughness ?? 0.7,
    metalness: material?.metalness ?? 0.1,
    transparent: material?.transparent || false,
    opacity: material?.opacity ?? 1,
  };

  if (geo === "roundedBox") {
    return (
      <RoundedBox
        args={args}
        radius={radius || 0.01}
        smoothness={segments || 4}
        position={position}
        rotation={rotation || [0, 0, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial {...matProps} />
      </RoundedBox>
    );
  }

  return (
    <mesh
      position={position}
      rotation={rotation || [0, 0, 0]}
      castShadow
      receiveShadow
    >
      {geo === "cylinder" && <cylinderGeometry args={args} />}
      {geo === "sphere" && <sphereGeometry args={args} />}
      {(geo === "box" || !geo) && <boxGeometry args={args} />}
      <meshStandardMaterial {...matProps} />
    </mesh>
  );
}
