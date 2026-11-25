/** Critically-under-damped spring integrator — gives a natural, slightly bouncy easing. */
export class Spring {
  value: number;
  velocity = 0;
  stiffness: number;
  damping: number;

  constructor(initial: number, stiffness = 170, damping = 16) {
    this.value = initial;
    this.stiffness = stiffness;
    this.damping = damping;
  }

  update(target: number, dt: number): number {
    const clampedDt = Math.min(dt, 1 / 30);
    const force = (target - this.value) * this.stiffness;
    const dampingForce = -this.velocity * this.damping;
    const acceleration = force + dampingForce;
    this.velocity += acceleration * clampedDt;
    this.value += this.velocity * clampedDt;
    return this.value;
  }

  snap(target: number) {
    this.value = target;
    this.velocity = 0;
  }
}
