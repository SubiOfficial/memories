import { Suspense, useCallback, useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { TextSphere } from "./TextSphere";
import { SPHERE_RADIUS } from "../../lib/spherePoints";
import type { SphereRotationDirection, WordItem } from "../../types";

interface SphereCanvasProps {
  words: WordItem[];
  searchQuery: string;
  wordColor: string;
  accent: string;
  spread: number;
  rotationSpeed: number;
  rotationDirection: SphereRotationDirection;
}

const IDLE_RESUME_MS = 1600;
const MIN_DISTANCE = 6;
const MAX_DISTANCE = 30;
// Keeps the camera just short of the exact poles — sitting right on one is a
// gimbal-lock singularity for OrbitControls' spherical math, which freezes
// autoRotate dead once you swipe far enough to land on it.
const POLE_GUARD = 0.06;
const AZIMUTH_RAD_PER_SEC = 0.5;
const POLAR_RAD_PER_SEC = 0.35;

/** Drives the idle auto-rotation ourselves (instead of OrbitControls' built-in
 * autoRotate) so it can spin horizontally, tilt pole-to-pole, or do both at
 * once, in either direction, while still respecting the pole guard. */
function AutoRotateDriver({
  controlsRef,
  activeRef,
  direction,
  speed,
}: {
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
  activeRef: React.RefObject<boolean>;
  direction: SphereRotationDirection;
  speed: number;
}) {
  const { camera } = useThree();
  const polarSign = useRef(direction === "bottomToTop" ? -1 : 1);

  useEffect(() => {
    polarSign.current = direction === "bottomToTop" ? -1 : 1;
  }, [direction]);

  useFrame((_, delta) => {
    const controls = controlsRef.current;
    if (!controls || !activeRef.current) return;

    const offset = camera.position.clone().sub(controls.target);
    const spherical = new THREE.Spherical().setFromVector3(offset);

    const rotatesAzimuth =
      direction === "rightToLeft" || direction === "leftToRight" || direction === "cross";
    const rotatesPolar =
      direction === "topToBottom" || direction === "bottomToTop" || direction === "cross";

    if (rotatesAzimuth) {
      const azimuthSign = direction === "leftToRight" ? -1 : 1;
      spherical.theta += azimuthSign * speed * AZIMUTH_RAD_PER_SEC * delta;
    }

    if (rotatesPolar) {
      let nextPhi = spherical.phi + polarSign.current * speed * POLAR_RAD_PER_SEC * delta;
      if (nextPhi > Math.PI - POLE_GUARD) {
        nextPhi = Math.PI - POLE_GUARD;
        polarSign.current = -1;
      } else if (nextPhi < POLE_GUARD) {
        nextPhi = POLE_GUARD;
        polarSign.current = 1;
      }
      spherical.phi = nextPhi;
    }

    spherical.makeSafe();
    offset.setFromSpherical(spherical);
    camera.position.copy(controls.target).add(offset);
    controls.update();
  });

  return null;
}

/** Keeps the sphere framed within view on any aspect ratio (tall phones, wide desktops). */
function ResponsiveFraming({
  spread,
  controlsRef,
}: {
  spread: number;
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
}) {
  const { camera, size } = useThree();

  useEffect(() => {
    const perspective = camera as THREE.PerspectiveCamera;
    const vFov = (perspective.fov * Math.PI) / 180;
    const aspect = size.width / size.height;
    const effectiveAspect = Math.min(aspect, 1);
    const halfExtent = SPHERE_RADIUS * spread + 2.4;
    const distance = halfExtent / (Math.tan(vFov / 2) * effectiveAspect);
    const clamped = Math.min(Math.max(distance, MIN_DISTANCE), MAX_DISTANCE);

    const dir = camera.position.lengthSq() > 0 ? camera.position.clone().normalize() : new THREE.Vector3(0, 0, 1);
    camera.position.copy(dir.multiplyScalar(clamped));
    camera.updateProjectionMatrix();
    controlsRef.current?.update();
  }, [size.width, size.height, spread, camera, controlsRef]);

  return null;
}

export function SphereCanvas({ rotationSpeed, rotationDirection, ...props }: SphereCanvasProps) {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const idleTimeout = useRef<number | undefined>(undefined);
  const autoRotateActive = useRef(true);

  const handleStart = useCallback(() => {
    autoRotateActive.current = false;
    window.clearTimeout(idleTimeout.current);
  }, []);

  const handleEnd = useCallback(() => {
    window.clearTimeout(idleTimeout.current);
    idleTimeout.current = window.setTimeout(() => {
      autoRotateActive.current = true;
    }, IDLE_RESUME_MS);
  }, []);

  return (
    <Canvas
      camera={{ position: [0, 0, 11], fov: 50 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.6} />
      <pointLight position={[8, 8, 8]} intensity={60} color="#7dd8ff" />
      <pointLight position={[-8, -6, -8]} intensity={40} color="#b98cff" />
      <Suspense fallback={null}>
        <Stars radius={40} depth={30} count={2200} factor={2.2} fade speed={0.3} />
        <TextSphere {...props} />
      </Suspense>
      <ResponsiveFraming spread={props.spread} controlsRef={controlsRef} />
      <AutoRotateDriver
        controlsRef={controlsRef}
        activeRef={autoRotateActive}
        direction={rotationDirection}
        speed={rotationSpeed}
      />
      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        enableZoom
        minDistance={MIN_DISTANCE}
        maxDistance={MAX_DISTANCE}
        minPolarAngle={POLE_GUARD}
        maxPolarAngle={Math.PI - POLE_GUARD}
        dampingFactor={0.08}
        enableDamping
        onStart={handleStart}
        onEnd={handleEnd}
      />
      <EffectComposer>
        <Bloom intensity={0.6} luminanceThreshold={0.2} luminanceSmoothing={0.9} mipmapBlur />
        <Vignette eskil={false} offset={0.15} darkness={0.6} />
      </EffectComposer>
    </Canvas>
  );
}
