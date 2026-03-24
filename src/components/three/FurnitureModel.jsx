"use client";

import { useRef } from "react";
import { RoundedBox } from "@react-three/drei";
import { useSpring, a } from "@react-spring/three";

export default function FurnitureModel({ design, isExploded }) {
  const groupRef = useRef();

  if (!design || !design.parts) return null;

  return (
    <group ref={groupRef}>
      {design.parts.map((part, index) => (
        <Part key={index} data={part} isExploded={isExploded} />
      ))}
      
      {/* Subtle Floor Grid to add technical feel */}
      <gridHelper args={[8, 40, "rgba(100,100,100,0.15)", "rgba(100,100,100,0.05)"]} position={[0, -0.002, 0]} />
    </group>
  );
}

function Part({ data, isExploded }) {
  const { geo, args, position, rotation, material, radius, segments } = data;

  const matProps = {
    color: material?.color || "#8B6914",
    roughness: material?.roughness ?? 0.6,
    metalness: material?.metalness ?? 0.1,
    transparent: material?.transparent || false,
    opacity: material?.opacity ?? 1,
    envMapIntensity: 1.2, // Boost reflections slightly for premium feel
  };

  // ─── Exploded View Animation Logic ───
  // Expand position radially
  const explodeFactor = 1.6;
  const targetPos = isExploded && position
    ? [position[0] * explodeFactor, (position[1] + 0.2) * explodeFactor, position[2] * explodeFactor]
    : (position || [0,0,0]);
    
  // Spring physics matching Apple's fluid motion
  const { springPos } = useSpring({
    springPos: targetPos,
    config: { mass: 1, tension: 120, friction: 18 }
  });

  if (geo === "roundedBox") {
    return (
      <a.group position={springPos} rotation={rotation || [0, 0, 0]}>
        <RoundedBox
          args={args}
          radius={radius || 0.008}
          smoothness={segments || 6}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial {...matProps} />
        </RoundedBox>
      </a.group>
    );
  }

  return (
    <a.mesh
      position={springPos}
      rotation={rotation || [0, 0, 0]}
      castShadow
      receiveShadow
    >
      {geo === "cylinder" && <cylinderGeometry args={args} />}
      {geo === "sphere" && <sphereGeometry args={args} />}
      {(geo === "box" || !geo) && <boxGeometry args={args} />}
      <meshStandardMaterial {...matProps} />
    </a.mesh>
  );
}
