import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface HotspotProps {
  isVisible: boolean;
  position: [number, number, number];
  color: string;
  onClick?: () => void;
}

export function Hotspot({ isVisible, position, color, onClick }: HotspotProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    // Smooth pulsing animation
    const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
    meshRef.current.scale.setScalar(scale);
    
    // Gentle rotation animation
    meshRef.current.rotation.z = state.clock.elapsedTime * 0.5;
  });

  if (!isVisible) return null;

  return (
    <mesh 
      ref={meshRef} 
      position={position} 
      rotation={[-Math.PI / 2, 0, 0]}
      onClick={onClick}
    >
      <ringGeometry args={[0.08, 0.12, 16]} />
      <meshBasicMaterial 
        color={color} 
        transparent 
        opacity={0.7}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
