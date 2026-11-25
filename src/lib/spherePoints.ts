export const SPHERE_RADIUS = 5.4;

const REFERENCE_COUNT = 30;
const MIN_SCALE = 0.25;
const MAX_SCALE = 1.1;

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Font scale shrinks as word count grows so the sphere radius never changes. */
export function getAdaptiveFontScale(count: number): number {
  if (count <= 0) return MAX_SCALE;
  const raw = Math.sqrt(REFERENCE_COUNT / count);
  return clamp(raw, MIN_SCALE, MAX_SCALE);
}

export type Point3 = [number, number, number];

/** Evenly distributes `count` points on a sphere of `radius` using the golden-angle spiral. */
export function fibonacciSphere(count: number, radius: number): Point3[] {
  if (count <= 0) return [];
  const points: Point3[] = [];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const denom = Math.max(count - 1, 1);
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / denom) * 2;
    const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = goldenAngle * i;
    const x = Math.cos(theta) * radiusAtY;
    const z = Math.sin(theta) * radiusAtY;
    points.push([x * radius, y * radius, z * radius]);
  }
  return points;
}
