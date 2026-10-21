"use client";

import { Suspense, useCallback, useEffect, useRef } from "react";
import * as THREE from "three";
import {
  CameraControls,
  Environment,
  Preload,
  useTexture,
} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import gsap from "gsap";

import { useSkateboard } from "@/contexts/SkateboardContext";
import { Skateboard } from "@/components/Skateboard";
import { DECKS, WHEELS } from "@/lib/customizer-options";

const ENVIRONMENT_COLOR = "#2B2829";
// Where the camera looks and rests. In the "side" pose the board stands on its
// edge, offset from the origin, so the focus is moved onto the board's visual
// centre (measured from screenshots) to frame it in the middle of the preview.
const FOCUS = new THREE.Vector3(-0.35, 0.25, 0.2);
const REST_OFFSET = new THREE.Vector3(2.2, 1.0, 1.85);

/** Resting camera position: further back on narrow (square) previews. */
function restPosition() {
  const narrow = typeof window !== "undefined" && window.innerWidth < 1024;
  return REST_OFFSET.clone().multiplyScalar(narrow ? 1.3 : 1).add(FOCUS);
}

// Every option's texture is loaded up front (WebP, ~3 MB in total) so switching
// decks or wheels is instant instead of blanking the scene while it loads.
const DECK_TEXTURES = DECKS.map((d) => d.texture);
const WHEEL_TEXTURES = WHEELS.map((w) => w.texture);

export default function Preview() {
  const cameraControls = useRef<CameraControls | null>(null);
  const floorRef = useRef<THREE.Mesh>(null);

  const { customization } = useSkateboard();

  const { wheelTextureURL, deckTextureURL, truckColor, boltColor } = customization;

  // Cinematic zoom-in once the controls exist. They mount inside the Canvas
  // after this component's effects run, so this hangs off the ref callback.
  const introPlayed = useRef(false);
  const attachControls = useCallback((controls: CameraControls | null) => {
    cameraControls.current = controls;
    if (!controls || introPlayed.current) return;
    introPlayed.current = true;
    controls.setLookAt(3, 1.5, 2, FOCUS.x, FOCUS.y, FOCUS.z, false);
    window.setTimeout(() => {
      const rest = restPosition();
      controls.setLookAt(rest.x, rest.y, rest.z, FOCUS.x, FOCUS.y, FOCUS.z, true);
    }, 100);
  }, []);

  // A new deck lands with a little hop, like it was just dropped on the floor.
  const boardRef = useRef<THREE.Group>(null);
  const lastDeck = useRef(deckTextureURL);
  useEffect(() => {
    const board = boardRef.current;
    // Compare with the last deck so a repeated effect run (Strict Mode) does not hop.
    if (!board || lastDeck.current === deckTextureURL) return;
    lastDeck.current = deckTextureURL;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.killTweensOf([board.position, board.rotation]);
    gsap.fromTo(board.position, { y: 0.18 }, { y: 0, duration: 0.7, ease: "bounce.out" });
    gsap.fromTo(board.rotation, { y: -0.35 }, { y: 0, duration: 0.8, ease: "back.out(2)" });
  }, [deckTextureURL]);

  // Swing back to the hero angle whenever a part changes, so the change is seen.
  useEffect(() => {
    setCameraControls(FOCUS, restPosition());
  }, [deckTextureURL, wheelTextureURL, truckColor, boltColor]);

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

        <group ref={boardRef}>
        <Skateboard
          wheelTextureURLs={WHEEL_TEXTURES}
          wheelTextureURL={wheelTextureURL}
          deckTextureURLs={DECK_TEXTURES}
          deckTextureURL={deckTextureURL}
          truckColor={truckColor}
          boltColor={boltColor}
          pose="side"
          constantWheelSpin={false}
        />
        </group>
        <CameraControls
          ref={attachControls}
          minDistance={0.2}
          maxDistance={4}
          onStart={onCameraControlStart}
          smoothTime={0.8}
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
