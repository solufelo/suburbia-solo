"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bodies,
  Engine,
  Mouse,
  MouseConstraint,
  Render,
  Runner,
  World,
} from "matter-js";

type FooterPhysicsProps = {
  boardTextureURLs: string[];
  className?: string;
};

export function FooterPhysics({
  boardTextureURLs = [],
  className,
}: FooterPhysicsProps) {
  // The div we'll inject our canvas into
  const scene = useRef<HTMLDivElement>(null);
  // Engine handles the physics simulations
  const engine = useRef(Engine.create());
  // Intersection Observer state
  const [inView, setInView] = useState(false);
  // We show fewer boards on mobile
  const [isMobile, setIsMobile] = useState(false);

  // Debug logging (remove these once everything is working)
  // console.log("FooterPhysics - boardTextureURLs:", boardTextureURLs);
  // console.log("FooterPhysics - inView:", inView);

  // Handle mobile detection
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== "undefined") {
        setIsMobile(window.matchMedia("(max-width: 768px)").matches);
      }
    };

    handleResize(); // Run on mount
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Fewer boards on mobile
  const limitedBoardTextures = isMobile
    ? boardTextureURLs.slice(0, 3)
    : boardTextureURLs;

  // Intersection Observer to start/stop the physics simulation
  useEffect(() => {
    const currentScene = scene.current;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      { threshold: 0.5 } // Trigger at 50% so users see the boards drop
    );

    if (currentScene) observer.observe(currentScene);

    return () => {
      if (currentScene) observer.unobserve(currentScene);
    };
  }, []);

  useEffect(() => {
    if (!scene.current || !inView) return;

    // If the user prefers reduced motion, don't run the physics simulation
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const cw = scene.current.clientWidth;
    const ch = scene.current.clientHeight;

    engine.current.gravity.y = 0.1; // Very low gravity for easy control

    // Create Matter.js renderer
    const render = Render.create({
      element: scene.current, // attach to our scene div
      engine: engine.current,
      options: {
        width: cw,
        height: ch,
        pixelRatio: window.devicePixelRatio,
        wireframes: false,
        background: "transparent",
      },
    });

    // Add boundaries to the scene
    let boundaries = createBoundaries(cw, ch);
    World.add(engine.current.world, boundaries);

    // Add mouse interaction for dragging boards
    const mouse = Mouse.create(render.canvas);
    // @ts-expect-error - matter.js has incorrect types
    mouse.element.removeEventListener("wheel", mouse.mousewheel);

    const mouseConstraint = MouseConstraint.create(engine.current, {
      mouse,
      constraint: {
        stiffness: 0.8, // High but not maximum to prevent sticking
        damping: 0.1, // Some damping to prevent oscillation
        render: { visible: false },
        length: 0, // Zero length for immediate attachment
      },
    });
    
    // Mouse constraint and canvas are ready
    
    World.add(engine.current.world, mouseConstraint);
    
    // Add event listeners to the mouse constraint for proper cleanup
    mouseConstraint.mouse.element.addEventListener('mouseup', () => {
      // Force release the constraint to prevent sticking
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const constraint = mouseConstraint.constraint as any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mouseConstraintObj = mouseConstraint as any;
      constraint.bodyB = null;
      constraint.pointB = null;
      mouseConstraintObj.body = null;
    });
    
    // Ensure the canvas can receive mouse events and is properly positioned
    render.canvas.style.cursor = 'grab';
    render.canvas.style.touchAction = 'none';
    render.canvas.style.position = 'absolute';
    render.canvas.style.top = '0';
    render.canvas.style.left = '0';
    render.canvas.style.zIndex = '10';
    render.canvas.style.pointerEvents = 'auto';
    
    // Canvas is ready for interaction
    
    // Canvas is properly configured

    window.addEventListener("resize", onResize);
    
    // Add global mouse up listener to handle releases outside canvas
    const globalMouseUp = () => {
      if (mouseConstraint.constraint.bodyB) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const constraint = mouseConstraint.constraint as any;
        constraint.bodyB = null;
        constraint.pointB = null;
        constraint.body = null;
      }
    };
    
    window.addEventListener('mouseup', globalMouseUp);

    function onResize() {
      if (!scene.current) return;

      const cw = scene.current.clientWidth;
      const ch = scene.current.clientHeight;

      // Update canvas and renderer dimensions
      render.canvas.width = cw;
      render.canvas.height = ch;
      render.options.width = cw;
      render.options.height = ch;
      Render.setPixelRatio(render, window.devicePixelRatio);

      World.remove(engine.current.world, boundaries);
      boundaries = createBoundaries(cw, ch);
      World.add(engine.current.world, boundaries);
    }

    // Create walls/boundaries around the scene to keep boards in
    function createBoundaries(width: number, height: number) {
      return [
        Bodies.rectangle(width / 2, -10, width, 20, { isStatic: true }), // Top
        Bodies.rectangle(-10, height / 2, 20, height, { isStatic: true }), // Left
        Bodies.rectangle(width / 2, height + 10, width, 20, { isStatic: true }), // Bottom
        Bodies.rectangle(width + 10, height / 2, 20, height, {
          isStatic: true,
        }), // Right
      ];
    }

    // Runner manages the animation loop and updates engine 60 times per second
    const runner = Runner.create();
    Runner.run(runner, engine.current);
    Render.run(render);

    const currentEngine = engine.current;

    // Clean up
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener('mouseup', globalMouseUp);

      Render.stop(render);
      Runner.stop(runner);
      if (currentEngine) {
        World.clear(currentEngine.world, false);
        Engine.clear(currentEngine);
      }
      render.canvas.remove();
      render.textures = {};
    };
  }, [inView]);

  // Add boards to the scene
  useEffect(() => {
    if (!scene.current || !inView) return;

    const world = engine.current.world;
    const cw = scene.current.clientWidth;
    const ch = scene.current.clientHeight;

    const boards = limitedBoardTextures.map((texture, index) => {
      // Use consistent positioning instead of Math.random() to avoid hydration issues
      const positions = [
        { x: cw * 0.2, y: ch * 0.3 },
        { x: cw * 0.4, y: ch * 0.4 },
        { x: cw * 0.6, y: ch * 0.3 },
        { x: cw * 0.8, y: ch * 0.4 },
        { x: cw * 0.3, y: ch * 0.5 },
        { x: cw * 0.7, y: ch * 0.5 },
        { x: cw * 0.5, y: ch * 0.2 },
        { x: cw * 0.9, y: ch * 0.3 },
      ];
      
      const position = positions[index % positions.length];
      const rotation = (index * 30 - 60) * Math.PI / 180; // Consistent rotation based on index

      // Creating skateboard at calculated position

      // Use skateboard images if available, otherwise fallback to colored rectangles
      if (texture && texture.startsWith('http')) {
        return Bodies.rectangle(position.x, position.y, 140, 285, {
          chamfer: { radius: 15 },
          angle: rotation,
          restitution: 0.3, // Less bouncy for better control
          friction: 0.3, // More friction for better grip
          frictionAir: 0.02, // More air resistance
          density: 0.0005, // Light for easy movement
          render: {
            sprite: {
              texture,
              xScale: 0.6,
              yScale: 0.5,
            },
          },
        });
      } else {
        // Fallback to colored rectangles
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'];
        const color = colors[index % colors.length];

        return Bodies.rectangle(position.x, position.y, 140, 285, {
          chamfer: { radius: 15 },
          angle: rotation,
          restitution: 0.3, // Less bouncy for better control
          friction: 0.3, // More friction for better grip
          frictionAir: 0.02, // More air resistance
          density: 0.0005, // Light for easy movement
          render: {
            fillStyle: color,
            strokeStyle: '#ffffff',
            lineWidth: 3,
          },
        });
      }
    });

    if (boards.length > 0) {
      World.add(engine.current.world, boards); // Add boards to the world
    }

    return () => {
      World.remove(world, boards);
    };
  }, [limitedBoardTextures, inView]);

  return <div ref={scene} className={className} />;
}
