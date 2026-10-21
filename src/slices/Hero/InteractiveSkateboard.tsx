"use client";

import * as THREE from "three";
import { Skateboard } from "@/components/Skateboard";
import { ContactShadows, Environment, Html } from "@react-three/drei";
import { Canvas, ThreeEvent, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Hotspot } from "./Hotspot";
import { WavyPaths } from "./WavyPaths";
import { CanvasBoundary } from "@/components/CanvasBoundary";

const INITIAL_CAMERA_POSITION = [1.5, 1, 1.4] as const;

// Keep tweens on wall-clock time: on a slow device the entrance and tricks
// finish on schedule instead of stretching out frame by frame.
gsap.ticker.lagSmoothing(0);

type Props = {
  deckTextureURL: string;
  wheelTextureURL: string;
  truckColor: string;
  boltColor: string;
};

export function InteractiveSkateboard({
  deckTextureURL,
  wheelTextureURL,
  truckColor,
  boltColor,
}: Props) {
  return (
    <div className="absolute inset-0 top-[4vh] z-10 flex items-center justify-center">
      {/* No WebGL? The hero copy and button still work; the board just isn't drawn. */}
      <CanvasBoundary fallback={null}>
        <Canvas
          className="min-h-[60rem] w-full"
          camera={{ position: INITIAL_CAMERA_POSITION, fov: 55 }}
        >
          <Suspense>
            <Scene
              deckTextureURL={deckTextureURL}
              wheelTextureURL={wheelTextureURL}
              truckColor={truckColor}
              boltColor={boltColor}
            />
          </Suspense>
        </Canvas>
      </CanvasBoundary>
    </div>
  );
}


function Scene({
  deckTextureURL,
  wheelTextureURL,
  truckColor,
  boltColor,
}: Props) {
  const containerRef = useRef<THREE.Group>(null);
  const originRef = useRef<THREE.Group>(null);
  const entranceRef = useRef<THREE.Group>(null);

  const [animating, setAnimating] = useState(false);
  const [showHotspot, setShowHotspot] = useState({
    front: true,
    middle: true,
    back: true,
  });
  const [hasPerformedTrick, setHasPerformedTrick] = useState(false);

  const { camera } = useThree();

  useEffect(() => {
    if (!containerRef.current || !originRef.current) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const container = containerRef.current;
    const origin = originRef.current;
    const entrance = entranceRef.current;
    // A context so the cleanup kills and reverts these tweens: without it a
    // second effect run (React Strict Mode) starts `from` at the mid-air
    // position and the board never lands.
    const ctx = gsap.context(() => {
      // Entrance: the board drops in spinning and lands with a bounce.
      if (entrance) {
        gsap.from(entrance.position, { y: 1.6, duration: 1.15, ease: "bounce.out", delay: 0.25 });
        gsap.from(entrance.rotation, { y: -Math.PI * 1.25, duration: 1.3, ease: "power3.out", delay: 0.25 });
      }
      gsap.to(container.position, { x: 0.2, duration: 3, repeat: -1, yoyo: true, ease: "sine.inOut" });
      gsap.to(origin.rotation, { y: Math.PI / 64, duration: 3, repeat: -1, yoyo: true, ease: "sine.inOut" });
    });
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    camera.lookAt(new THREE.Vector3(-0.2, 0.15, 0));

    setZoom();

    window.addEventListener("resize", setZoom);

    function setZoom() {
      const scale = Math.max(Math.min(1000 / window.innerWidth, 2.2), 1);

      camera.position.x = INITIAL_CAMERA_POSITION[0] * scale;
      camera.position.y = INITIAL_CAMERA_POSITION[1] * scale;
      camera.position.z = INITIAL_CAMERA_POSITION[2] * scale;
    }

    return () => window.removeEventListener("resize", setZoom);
  }, [camera]);

  function onClick(event: ThreeEvent<MouseEvent>) {
    event.stopPropagation();

    const board = containerRef.current;
    const origin = originRef.current;

    if (!board || !origin || animating) return;

    const { name } = event.object;

    setShowHotspot((current) => ({ ...current, [name]: false }));

    // Mark that a trick has been performed
    setHasPerformedTrick(true);

    if (name === "back") {
      ollie(board);
    } else if (name === "middle") {
      kickflip(board);
    } else if (name === "front") {
      frontside360(board, origin);
    }
  }

  function ollie(board: THREE.Group) {
    jumpBoard(board);

    gsap
      .timeline()
      .to(board.rotation, { x: -0.6, duration: 0.26, ease: "none" })
      .to(board.rotation, { x: 0.4, duration: 0.82, ease: "power2.in" })
      .to(board.rotation, { x: 0, duration: 0.12, ease: "none" });
  }

  function kickflip(board: THREE.Group) {
    jumpBoard(board);

    gsap
      .timeline()
      .to(board.rotation, { x: -0.6, duration: 0.26, ease: "none" })
      .to(board.rotation, { x: 0.4, duration: 0.82, ease: "power2.in" })
      .to(
        board.rotation,
        {
          z: `+=${Math.PI * 2}`,
          duration: 0.78,
          ease: "none",
        },
        0.3
      )
      .to(board.rotation, { x: 0, duration: 0.12, ease: "none" });
  }

  function frontside360(board: THREE.Group, origin: THREE.Group) {
    jumpBoard(board);

    gsap
      .timeline()
      .to(board.rotation, { x: -0.6, duration: 0.26, ease: "none" })
      .to(board.rotation, { x: 0.4, duration: 0.82, ease: "power2.in" })
      .to(
        origin.rotation,
        {
          y: `+=${Math.PI * 2}`,
          duration: 0.77,
          ease: "none",
        },
        0.3
      )
      .to(board.rotation, { x: 0, duration: 0.14, ease: "none" });
  }

  function jumpBoard(board: THREE.Group) {
    setAnimating(true);

    gsap
      .timeline({ 
        onComplete: () => {
          setAnimating(false);
          // Only show hotspots if no trick has been performed yet
          if (!hasPerformedTrick) {
            setShowHotspot({ front: true, middle: true, back: true });
          }
        }
      })
      .to(board.position, {
        y: 0.8,
        duration: 0.51,
        ease: "power2.out",
        delay: 0.26,
      })
      .to(board.position, {
        y: 0,
        duration: 0.43,
        ease: "power2.in",
      });
  }

  return (
    <group>
      <Environment files={"/hdr/warehouse-256.hdr"} />
      <group ref={entranceRef}>
      <group ref={originRef}>
        <group ref={containerRef} position={[-0.25, 0, -0.635]}>
          <group position={[0, -0.086, 0.635]}>
            <Skateboard
              wheelTextureURLs={[wheelTextureURL]}
              wheelTextureURL={wheelTextureURL}
              deckTextureURLs={[deckTextureURL]}
              deckTextureURL={deckTextureURL}
              truckColor={truckColor}
              boltColor={boltColor}
              constantWheelSpin
            />

            <Hotspot
              isVisible={!animating && showHotspot.front}
              position={[0, 0.38, 1]}
              color="#B8FC39"
            />

            <mesh position={[0, 0.27, 0.9]} name="front" onClick={onClick}>
              <boxGeometry args={[0.6, 0.2, 0.58]} />
              <meshStandardMaterial visible={false} />
            </mesh>

            <Hotspot
              isVisible={!animating && showHotspot.middle}
              position={[0, 0.33, 0]}
              color="#FF7A51"
            />
            <mesh position={[0, 0.27, 0]} name="middle" onClick={onClick}>
              <boxGeometry args={[0.6, 0.1, 1.2]} />
              <meshStandardMaterial visible={false} />
            </mesh>

            <Hotspot
              isVisible={!animating && showHotspot.back}
              position={[0, 0.35, -0.9]}
              color="#46ACFA"
            />
            <mesh position={[0, 0.27, -0.9]} name="back" onClick={onClick}>
              <boxGeometry args={[0.6, 0.2, 0.58]} />
              <meshStandardMaterial visible={false} />
            </mesh>
          </group>
        </group>
      </group>
      </group>
      <ContactShadows opacity={0.6} position={[0, -0.08, 0]} />
      
      
      <group
        rotation={[-Math.PI / 2, 0, -Math.PI / 2]}
        position={[0, -0.1, 0]}
        scale={[0.3, 0.3, 0.3]}
      >
        <Html
          wrapperClass="pointer-events-none"
          transform
          zIndexRange={[1, 0]}
          occlude="blending"
        >
          <WavyPaths />
        </Html>
      </group>
    </group>
  );
}