"use client";

import { Suspense, useEffect, useRef } from "react";
import * as THREE from "three";
import {
  CameraControls,
  Environment,
  Preload,
  useTexture,
} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

import { useSkateboard } from "@/contexts/SkateboardContext";
import { Skateboard } from "@/components/Skateboard";

const DEFAULT_WHEEL_TEXTURE = "/skateboard/SkateWheel1.png";
const DEFAULT_DECK_TEXTURE = "/skateboard/Deck.webp";
const DEFAULT_TRUCK_COLOR = "#6F6E6A";
const DEFAULT_BOLT_COLOR = "#6F6E6A";
const ENVIRONMENT_COLOR = "#3B3A3A";

export default function Preview() {
  const cameraControls = useRef<CameraControls>(null);
  const floorRef = useRef<THREE.Mesh>(null);

  const { customization } = useSkateboard();

  const wheelTextureURL = customization.wheelTextureURL || DEFAULT_WHEEL_TEXTURE;
  const deckTextureURL = customization.deckTextureURL || DEFAULT_DECK_TEXTURE;
  const truckColor = customization.truckColor || DEFAULT_TRUCK_COLOR;
  const boltColor = customization.boltColor || DEFAULT_BOLT_COLOR;

  // Cinematic zoom-in animation on mount
  useEffect(() => {
    if (!cameraControls.current) return;

    // Start from a wide angle
    const startTarget = new THREE.Vector3(0, 0, 0);
    const startPosition = new THREE.Vector3(3, 1.5, 2);
    
    // End at the perfect board view - properly centered
    const endTarget = new THREE.Vector3(0, 0, 0);
    const endPosition = new THREE.Vector3(1.2, 0.6, 1.0);

    // Set initial position
    cameraControls.current.setTarget(startTarget.x, startTarget.y, startTarget.z, false);
    cameraControls.current.setPosition(startPosition.x, startPosition.y, startPosition.z, false);

    // Animate to final position with smooth easing
    setTimeout(() => {
      if (!cameraControls.current) return;
      
      cameraControls.current.setTarget(endTarget.x, endTarget.y, endTarget.z, true);
      cameraControls.current.setPosition(endPosition.x, endPosition.y, endPosition.z, true);
    }, 100);
  }, []);

  useEffect(() => {
    setCameraControls(
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(1.2, 0.6, 1.0)
    );
  }, [customization.deckTextureURL]);

  useEffect(() => {
    setCameraControls(
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(1.2, 0.6, 1.0)
    );
  }, [customization.truckColor]);

  useEffect(() => {
    setCameraControls(
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(1.2, 0.6, 1.0)
    );
  }, [customization.wheelTextureURL]);

  useEffect(() => {
    setCameraControls(
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(1.2, 0.6, 1.0)
    );
  }, [customization.boltColor]);

  function setCameraControls(target: THREE.Vector3, pos: THREE.Vector3) {
    if (!cameraControls.current) return;

    cameraControls.current.setTarget(target.x, target.y, target.z, true);
    cameraControls.current.setPosition(pos.x, pos.y, pos.z, true);
  }

  function onCameraControlStart() {
    if (
      !cameraControls.current ||
      !floorRef.current ||
      cameraControls.current.colliderMeshes.length > 0
    )
      return;

    cameraControls.current.colliderMeshes = [floorRef.current];
  }

  return (
    <Canvas camera={{ position: [3, 1.5, 2], fov: 50 }} shadows>
      <Suspense fallback={null}>
        <Environment
          files={"/hdr/warehouse-512.hdr"}
          environmentIntensity={0.6}
        />
        <directionalLight
          castShadow
          lookAt={[0, 0, 0]}
          position={[1, 1, 1]}
          intensity={1.6}
        />
        <fog attach="fog" args={[ENVIRONMENT_COLOR, 3, 10]} />
        <color attach="background" args={[ENVIRONMENT_COLOR]} />
        <StageFloor />

        <mesh rotation={[-Math.PI / 2, 0, 0]} ref={floorRef}>
          <planeGeometry args={[6, 6]} />
          <meshBasicMaterial visible={false} />
        </mesh>

        <Skateboard
          wheelTextureURLs={[wheelTextureURL]}
          wheelTextureURL={wheelTextureURL}
          deckTextureURLs={[deckTextureURL]}
          deckTextureURL={deckTextureURL}
          truckColor={truckColor}
          boltColor={boltColor}
          pose="side"
          constantWheelSpin={false}
        />
        <CameraControls
          ref={cameraControls}
          minDistance={0.2}
          maxDistance={4}
          onStart={onCameraControlStart}
          smoothTime={0.8}
          dampingFactor={0.05}
        />
      </Suspense>
      <Preload all />
    </Canvas>
  );
}

function StageFloor() {
  const normalMap = useTexture("/concrete-normal.avif");
  normalMap.wrapS = THREE.RepeatWrapping;
  normalMap.wrapT = THREE.RepeatWrapping;
  normalMap.repeat.set(30, 30);
  normalMap.anisotropy = 8;

  const material = new THREE.MeshStandardMaterial({
    roughness: 0.75,
    color: ENVIRONMENT_COLOR,
    normalMap: normalMap,
  });

  return (
    <mesh
      castShadow
      receiveShadow
      position={[0, -0.005, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      material={material}
    >
      <circleGeometry args={[20, 32]} />
    </mesh>
  );
}
