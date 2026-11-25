import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard, Sparkles, Text } from "@react-three/drei";
import * as THREE from "three";
import { Spring } from "../../lib/spring";
import { toTitleCase } from "../../lib/textCase";
import { useMeteorStore } from "../../store/meteorStore";
import type { WordItem } from "../../types";
import type { Point3 } from "../../lib/spherePoints";

interface WordNodeProps {
  word: WordItem;
  position: Point3;
  baseScale: number;
  color: string;
  accent: string;
  isDimmed: boolean;
  isMatch: boolean;
  phase: number;
  selected: boolean;
  onToggleSelect: (id: string) => void;
}

const FRONT_THRESHOLD = 0.5;
const BACK_THRESHOLD = -0.35;
const BACK_FLOOR_OPACITY = 0.1;

export function WordNode({
  word,
  position,
  baseScale,
  color,
  accent,
  isDimmed,
  isMatch,
  phase,
  selected,
  onToggleSelect,
}: WordNodeProps) {
  const [hovered, setHovered] = useState(false);
  const active = hovered || selected;
  const glowColor = accent;

  const groupRef = useRef<THREE.Group>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const textRef = useRef<any>(null);
  const scaleSpring = useRef(new Spring(baseScale, 220, 11));
  const glowSpring = useRef(new Spring(0, 90, 13));
  const interactiveRef = useRef(true);

  const struck = useMeteorStore((s) => s.struck);
  const debrisRef = useRef({ x: 0, y: 0, z: 0, rot: 0, vx: 0, vy: 0, vz: 0, vr: 0 });
  const restoreSpringsRef = useRef<{ sx: Spring; sy: Spring; sz: Spring; sr: Spring } | null>(null);
  const wasStruckRef = useRef(false);

  const normal = useMemo(() => {
    const len = Math.hypot(position[0], position[1], position[2]) || 1;
    return [position[0] / len, position[1] / len, position[2] / len] as const;
  }, [position]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const targetScale = baseScale * (active ? 1.45 : 1);
    const s = scaleSpring.current.update(targetScale, delta);
    const glow = glowSpring.current.update(active ? 1 : 0, delta);

    const camPos = state.camera.position;
    const camLen = Math.hypot(camPos.x, camPos.y, camPos.z) || 1;
    const facing =
      (normal[0] * camPos.x + normal[1] * camPos.y + normal[2] * camPos.z) / camLen;
    const depthT = THREE.MathUtils.clamp(
      (facing - BACK_THRESHOLD) / (FRONT_THRESHOLD - BACK_THRESHOLD),
      0,
      1,
    );
    const depthOpacity = BACK_FLOOR_OPACITY + depthT * (1 - BACK_FLOOR_OPACITY);
    interactiveRef.current = facing > BACK_THRESHOLD && !struck;

    // Meteor strike: blast this word outward, then spring it back home once restored.
    const debris = debrisRef.current;
    if (struck && !wasStruckRef.current) {
      restoreSpringsRef.current = null;
      const speed = 3.5 + Math.random() * 4.5;
      debris.vx = normal[0] * speed + (Math.random() - 0.5) * 3.4;
      debris.vy = normal[1] * speed + (Math.random() - 0.5) * 3.4 + 1.6;
      debris.vz = normal[2] * speed + (Math.random() - 0.5) * 3.4;
      debris.vr = (Math.random() - 0.5) * 14;
    }
    wasStruckRef.current = struck;

    if (struck) {
      // Fraction of velocity retained per second — dt-scaled so it's frame-rate independent.
      const drag = Math.pow(0.3, delta);
      debris.vx *= drag;
      debris.vy *= drag;
      debris.vz *= drag;
      debris.vr *= Math.pow(0.35, delta);
      debris.x += debris.vx * delta;
      debris.y += debris.vy * delta;
      debris.z += debris.vz * delta;
      debris.rot += debris.vr * delta;
    } else {
      if (!restoreSpringsRef.current && (debris.x || debris.y || debris.z || debris.rot)) {
        const sx = new Spring(debris.x, 130, 15);
        const sy = new Spring(debris.y, 130, 15);
        const sz = new Spring(debris.z, 130, 15);
        const sr = new Spring(debris.rot, 130, 16);
        sx.velocity = debris.vx;
        sy.velocity = debris.vy;
        sz.velocity = debris.vz;
        sr.velocity = debris.vr;
        restoreSpringsRef.current = { sx, sy, sz, sr };
      }
      if (restoreSpringsRef.current) {
        const sp = restoreSpringsRef.current;
        debris.x = sp.sx.update(0, delta);
        debris.y = sp.sy.update(0, delta);
        debris.z = sp.sz.update(0, delta);
        debris.rot = sp.sr.update(0, delta);
      }
    }

    if (groupRef.current) {
      groupRef.current.scale.setScalar(s);
      const floatAmp = active ? 0.18 : 0.04;
      const floatSpeed = active ? 2.2 : 0.5;
      const float = struck ? 0 : Math.sin(t * floatSpeed + phase) * floatAmp;
      groupRef.current.position.set(
        position[0] + debris.x,
        position[1] + float + debris.y,
        position[2] + debris.z,
      );
      groupRef.current.rotation.set(debris.rot * 0.4, debris.rot * 0.7, debris.rot);
    }
    if (textRef.current) {
      // selected = sharper heartbeat thump; plain hover = gentle breathing glow.
      const pulseRaw = 0.5 + 0.5 * Math.sin(t * (selected ? 5.2 : 3.2) + phase);
      const pulse = selected ? Math.pow(pulseRaw, 2.2) : pulseRaw;

      textRef.current.outlineWidth = 0.009 * glow * (0.6 + 0.4 * pulse);
      textRef.current.outlineOpacity = 0.9 * glow * (0.55 + 0.45 * pulse);
      textRef.current.outlineBlur = 0.34 * (0.16 + 0.14 * pulse) * glow;

      const searchOpacity = isDimmed && !isMatch ? 0.14 : 1;
      textRef.current.fillOpacity = Math.min(depthOpacity, searchOpacity);
    }
  });

  const displayColor = isMatch || active ? accent : color;

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerOver={(e) => {
        if (!interactiveRef.current) return;
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
        document.body.style.cursor = "auto";
      }}
      onClick={(e) => {
        if (!interactiveRef.current) return;
        e.stopPropagation();
        onToggleSelect(word.id);
      }}
    >
      <Billboard>
        <Text
          ref={textRef}
          fontSize={0.34}
          color={displayColor}
          outlineColor={glowColor}
          anchorX="center"
          anchorY="middle"
        >
          {toTitleCase(word.text)}
        </Text>
      </Billboard>
      {active && (
        <Sparkles count={10} scale={0.8} size={1.8} speed={0.5} color={glowColor} noise={1} />
      )}
    </group>
  );
}
