/**
 * Lightweight DOM-based particle system. Particles are plain divs appended to a
 * caller-owned container and driven by the Web Animations API, which removes
 * itself on finish — no React state/re-renders involved, so bursts of dozens
 * of particles stay cheap.
 */

export interface ParticleOptions {
  x: number;
  y: number;
  size: number;
  color: string;
  dx: number;
  dy: number;
  duration: number;
  delay?: number;
  blur?: number;
  scaleTo?: number;
  rotateTo?: number;
  opacityFrom?: number;
  boxShadow?: string;
  borderRadius?: string;
}

export function spawnParticle(container: HTMLElement, opts: ParticleOptions) {
  const el = document.createElement("div");
  el.style.position = "absolute";
  el.style.left = "0";
  el.style.top = "0";
  el.style.width = `${opts.size}px`;
  el.style.height = `${opts.size}px`;
  el.style.marginLeft = `${-opts.size / 2}px`;
  el.style.marginTop = `${-opts.size / 2}px`;
  el.style.borderRadius = opts.borderRadius ?? "50%";
  el.style.background = opts.color;
  el.style.pointerEvents = "none";
  if (opts.blur) el.style.filter = `blur(${opts.blur}px)`;
  if (opts.boxShadow) el.style.boxShadow = opts.boxShadow;
  container.appendChild(el);

  const opacityFrom = opts.opacityFrom ?? 1;
  const animation = el.animate(
    [
      { transform: `translate3d(${opts.x}px, ${opts.y}px, 0) rotate(0deg) scale(1)`, opacity: opacityFrom },
      {
        transform: `translate3d(${opts.x + opts.dx}px, ${opts.y + opts.dy}px, 0) rotate(${opts.rotateTo ?? 0}deg) scale(${opts.scaleTo ?? 0.2})`,
        opacity: 0,
      },
    ],
    {
      duration: opts.duration,
      delay: opts.delay ?? 0,
      easing: "cubic-bezier(0.2,0.7,0.3,1)",
      fill: "forwards",
    },
  );
  animation.onfinish = () => el.remove();
  animation.oncancel = () => el.remove();
}

/** Expanding, fading ring — the shockwave at meteor impact. */
export function spawnShockwave(
  container: HTMLElement,
  x: number,
  y: number,
  color: string,
  maxSize = 500,
  duration = 600,
) {
  const el = document.createElement("div");
  el.style.position = "absolute";
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  el.style.width = "10px";
  el.style.height = "10px";
  el.style.marginLeft = "-5px";
  el.style.marginTop = "-5px";
  el.style.borderRadius = "50%";
  el.style.border = `3px solid ${color}`;
  el.style.pointerEvents = "none";
  container.appendChild(el);

  const animation = el.animate(
    [
      { width: "10px", height: "10px", marginLeft: "-5px", marginTop: "-5px", opacity: 0.9, borderWidth: "6px" },
      {
        width: `${maxSize}px`,
        height: `${maxSize}px`,
        marginLeft: `${-maxSize / 2}px`,
        marginTop: `${-maxSize / 2}px`,
        opacity: 0,
        borderWidth: "1px",
      },
    ],
    { duration, easing: "cubic-bezier(0.1,0.6,0.3,1)", fill: "forwards" },
  );
  animation.onfinish = () => el.remove();
  animation.oncancel = () => el.remove();
}

/** Quick bright flash — the instant of meteor impact. */
export function spawnFlash(container: HTMLElement, x: number, y: number, size = 300, duration = 260) {
  const el = document.createElement("div");
  el.style.position = "absolute";
  el.style.left = `${x - size / 2}px`;
  el.style.top = `${y - size / 2}px`;
  el.style.width = `${size}px`;
  el.style.height = `${size}px`;
  el.style.borderRadius = "50%";
  el.style.background =
    "radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,200,120,0.7) 35%, rgba(255,120,40,0) 70%)";
  el.style.pointerEvents = "none";
  container.appendChild(el);

  const animation = el.animate(
    [
      { opacity: 1, transform: "scale(0.3)" },
      { opacity: 0, transform: "scale(1.6)" },
    ],
    { duration, easing: "ease-out", fill: "forwards" },
  );
  animation.onfinish = () => el.remove();
  animation.oncancel = () => el.remove();
}

/** One puff of fire + occasional smoke/spark trailing a moving point (the meteor). */
export function spawnTrailParticles(container: HTMLElement, x: number, y: number, angle: number) {
  const backX = -Math.cos(angle);
  const backY = -Math.sin(angle);

  spawnParticle(container, {
    x: x + (Math.random() - 0.5) * 10,
    y: y + (Math.random() - 0.5) * 10,
    size: 14 + Math.random() * 10,
    color: "radial-gradient(circle, rgba(255,244,190,0.95) 0%, rgba(255,150,40,0.85) 40%, rgba(255,60,20,0) 75%)",
    blur: 1,
    duration: 380 + Math.random() * 220,
    dx: backX * 30 + (Math.random() - 0.5) * 20,
    dy: backY * 30 + (Math.random() - 0.5) * 20,
    scaleTo: 0.15,
  });

  if (Math.random() < 0.5) {
    spawnParticle(container, {
      x: x + (Math.random() - 0.5) * 14,
      y: y + (Math.random() - 0.5) * 14,
      size: 20 + Math.random() * 16,
      color: "radial-gradient(circle, rgba(120,120,130,0.55) 0%, rgba(60,60,70,0.35) 50%, rgba(40,40,50,0) 80%)",
      blur: 4,
      duration: 700 + Math.random() * 400,
      dx: backX * 40 + (Math.random() - 0.5) * 30,
      dy: backY * 40 - 20,
      scaleTo: 1.8,
      opacityFrom: 0.5,
    });
  }

  if (Math.random() < 0.6) {
    spawnParticle(container, {
      x,
      y,
      size: 3 + Math.random() * 3,
      color: "#fff6d8",
      duration: 260 + Math.random() * 160,
      dx: backX * 60 + (Math.random() - 0.5) * 70,
      dy: backY * 60 + (Math.random() - 0.5) * 70,
      scaleTo: 0.2,
      boxShadow: "0 0 6px 2px rgba(255,220,120,0.9)",
    });
  }
}

/** The big radial burst of embers + rising smoke plumes at impact. */
export function spawnExplosionBurst(container: HTMLElement, x: number, y: number) {
  spawnFlash(container, x, y, 340, 260);
  spawnShockwave(container, x, y, "rgba(255,150,60,0.8)", 560, 650);

  for (let i = 0; i < 42; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 120 + Math.random() * 340;
    spawnParticle(container, {
      x,
      y,
      size: 5 + Math.random() * 10,
      color:
        i % 3 === 0
          ? "radial-gradient(circle, #fff 0%, #ffcf6b 40%, transparent 75%)"
          : "radial-gradient(circle, #ff9a3c 0%, #ff3d1f 55%, transparent 80%)",
      duration: 500 + Math.random() * 500,
      delay: Math.random() * 80,
      dx: Math.cos(angle) * speed,
      dy: Math.sin(angle) * speed - 40,
      scaleTo: 0.1,
    });
  }

  for (let i = 0; i < 10; i++) {
    spawnParticle(container, {
      x: x + (Math.random() - 0.5) * 60,
      y: y + (Math.random() - 0.5) * 30,
      size: 40 + Math.random() * 50,
      color: "radial-gradient(circle, rgba(90,90,100,0.5), rgba(40,40,45,0.15) 60%, transparent 80%)",
      blur: 6,
      duration: 1400 + Math.random() * 800,
      delay: 80 + Math.random() * 200,
      dx: (Math.random() - 0.5) * 80,
      dy: -160 - Math.random() * 120,
      scaleTo: 2.4,
      opacityFrom: 0.55,
    });
  }
}

/** Creates one meteor's DOM (glowing core + trailing flame) inside the given overlay container. */
export function createMeteorEl(container: HTMLElement, angleDeg: number) {
  const wrapper = document.createElement("div");
  wrapper.className = "absolute left-0 top-0";
  wrapper.style.opacity = "0";

  const trail = document.createElement("div");
  trail.className = "meteor-trail";
  trail.style.transform = `rotate(${angleDeg}deg)`;

  const core = document.createElement("div");
  core.className = "meteor-core";

  wrapper.appendChild(trail);
  wrapper.appendChild(core);
  container.appendChild(wrapper);
  return wrapper;
}

/** Randomized transform-based screen shake, applied to any fixed-position container's ancestor. */
export function shakeScreen(target: HTMLElement, duration = 650, magnitude = 20) {
  const start = performance.now();
  target.style.willChange = "transform";

  function frame(now: number) {
    const elapsed = now - start;
    if (elapsed >= duration) {
      target.style.transform = "";
      target.style.willChange = "";
      return;
    }
    const decay = 1 - elapsed / duration;
    const dx = (Math.random() * 2 - 1) * magnitude * decay;
    const dy = (Math.random() * 2 - 1) * magnitude * decay;
    const rot = (Math.random() * 2 - 1) * 1.2 * decay;
    target.style.transform = `translate(${dx}px, ${dy}px) rotate(${rot}deg)`;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
