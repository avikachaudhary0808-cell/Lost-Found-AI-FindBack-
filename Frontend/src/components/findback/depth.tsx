import { useEffect, useRef, useState } from "react";

/** Normalized pointer offset (-1..1) relative to the element centre. */
export function usePointerParallax<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      setPos({
        x: ((e.clientX - r.left) / r.width - 0.5) * 2,
        y: ((e.clientY - r.top) / r.height - 0.5) * 2,
      });
    };
    const onLeave = () => setPos({ x: 0, y: 0 });
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return { ref, pos };
}

/** Scroll progress in px, used for background parallax drift. */
export function useScrollOffset() {
  const [y, setY] = useState(0);
  useEffect(() => {
    const onScroll = () => setY(window.scrollY);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return y;
}

const seeds = Array.from({ length: 26 }, (_, i) => ({
  left: (i * 37) % 100,
  top: (i * 61) % 100,
  delay: (i % 9) * 1.1,
  dur: 7 + (i % 5) * 1.6,
  size: i % 4 === 0 ? 2.5 : 1.5,
  tone: i % 3 === 0 ? "var(--lime)" : "var(--teal)",
}));

export function Particles({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      {seeds.map((s, i) => (
        <span
          key={i}
          className="animate-particle absolute rounded-full"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            background: s.tone,
            boxShadow: `0 0 8px ${s.tone}`,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.dur}s`,
          }}
        />
      ))}
    </div>
  );
}

/** Four-layer cinematic background: charcoal → aurora → particles → blurred lights. */
export function DepthBackground({ particles = true }: { particles?: boolean }) {
  const y = useScrollOffset();
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, oklch(0.15 0.012 190), oklch(0.18 0.016 190) 55%, oklch(0.14 0.01 190))",
        }}
      />
      <div
        className="aurora-field absolute inset-[-15%] opacity-70"
        style={{ transform: `translate3d(0, ${y * 0.06}px, 0)` }}
      />
      <div
        className="fog-teal absolute inset-[-20%]"
        style={{ transform: `translate3d(0, ${y * -0.04}px, 0)` }}
      />
      {particles && <Particles />}
      <div
        className="absolute -left-24 top-10 h-72 w-72 rounded-full opacity-50 blur-[90px]"
        style={{
          background: "color-mix(in oklab, var(--teal) 45%, transparent)",
          transform: `translate3d(0, ${y * 0.12}px, 0)`,
        }}
      />
      <div
        className="absolute -right-16 bottom-0 h-80 w-80 rounded-full opacity-40 blur-[110px]"
        style={{
          background: "color-mix(in oklab, var(--lime) 32%, transparent)",
          transform: `translate3d(0, ${y * -0.1}px, 0)`,
        }}
      />
      <div className="grid-mesh absolute inset-0 opacity-25 [mask-image:radial-gradient(75%_65%_at_50%_25%,black,transparent)]" />
    </div>
  );
}
