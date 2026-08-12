import { useEffect, useRef, useState } from "react";
import { Badge } from "./ui";
import { Particles, usePointerParallax } from "./depth";

function useCountUp(target: number, active: boolean) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    let frame = 0;
    const total = 60;
    const id = setInterval(() => {
      frame += 1;
      const p = 1 - Math.pow(1 - frame / total, 3);
      setValue(Math.round(target * p));
      if (frame >= total) clearInterval(id);
    }, 18);
    return () => clearInterval(id);
  }, [target, active]);
  return value;
}

function ScanRings({ tone }: { tone: string }) {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div
        className="animate-spin-slow h-24 w-24 rounded-full border border-dashed"
        style={{ borderColor: `color-mix(in oklab, ${tone} 45%, transparent)`, transform: "rotateX(66deg)" }}
      />
      <div
        className="animate-spin-slower absolute h-16 w-16 rounded-full border"
        style={{ borderColor: `color-mix(in oklab, ${tone} 60%, transparent)`, transform: "rotateX(58deg)" }}
      />
    </div>
  );
}

function ItemCard({
  label,
  name,
  meta,
  align = "left",
}: {
  label: string;
  name: string;
  meta: string;
  align?: "left" | "right";
}) {
  const tone = align === "left" ? "var(--teal)" : "var(--lime)";
  return (
    <div
      className="glass-depth depth-layer w-full rounded-lg p-3"
      style={{
        transform: `perspective(900px) rotateY(${align === "left" ? 9 : -9}deg) translateZ(20px)`,
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </span>
        <span
          className={`h-1.5 w-1.5 rounded-full animate-node ${align === "left" ? "bg-accent" : "bg-primary"}`}
        />
      </div>
      <div className="mt-3 relative overflow-hidden rounded-md border border-border/70 bg-surface-raised">
        <div
          className="h-24 w-full"
          style={{
            background:
              "radial-gradient(70% 80% at 50% 25%, color-mix(in oklab, var(--teal) 22%, transparent), transparent 70%), linear-gradient(160deg, oklch(0.24 0.02 190), oklch(0.17 0.014 190))",
          }}
        />
        <ScanRings tone={tone} />
        <svg
          viewBox="0 0 40 60"
          className="animate-float absolute inset-0 m-auto h-14 w-14 opacity-80"
          fill="none"
        >
          <rect x="6" y="3" width="28" height="54" rx="5" stroke="var(--teal)" strokeWidth="1.6" />
          <rect
            x="10"
            y="9"
            width="20"
            height="38"
            rx="2"
            stroke="var(--lime)"
            strokeWidth="1"
            opacity="0.5"
          />
          <circle cx="20" cy="52" r="2" fill="var(--lime)" opacity="0.8" />
        </svg>
        <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-primary/25 to-transparent animate-scan" />
      </div>
      <p className="mt-3 text-sm font-bold tracking-tight">{name}</p>
      <p className="font-mono text-[10px] text-muted-foreground">{meta}</p>
    </div>
  );
}

export function MatchVisualization() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const pct = useCountUp(92, active);
  const { ref: sceneRef, pos } = usePointerParallax<HTMLDivElement>();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => entries.some((e) => e.isIntersecting) && setActive(true),
      { threshold: 0.35 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const indicators = [
    { label: "Visual similarity", value: 94 },
    { label: "Location proximity", value: 88 },
    { label: "Description match", value: 90 },
  ];

  return (
    <div ref={ref} className="relative">
      <div
        className="pointer-events-none absolute -inset-10 -z-10 opacity-70 blur-3xl"
        style={{
          background:
            "radial-gradient(50% 50% at 50% 45%, color-mix(in oklab, var(--teal) 30%, transparent), transparent 70%)",
        }}
      />
      <div ref={sceneRef} className="scene-3d">
        <div
          className="glass-depth depth-layer relative overflow-hidden rounded-xl p-4 sm:p-6"
          style={{
            transform: `rotateX(${pos.y * -4}deg) rotateY(${pos.x * 6}deg)`,
            transition: "transform 400ms cubic-bezier(0.2,0.8,0.2,1)",
          }}
        >
          <div className="grid-mesh pointer-events-none absolute inset-0 opacity-40" />
          <Particles />
          <div className="relative flex items-center justify-between gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
              Match engine · live
            </span>
            <Badge tone="lime">Confidence high</Badge>
          </div>

          <div className="relative mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4">
            <ItemCard
              label="Lost item"
              name="Black Smartphone"
              meta="RPT-1043 · 14:22"
              align="left"
            />
            <div className="relative flex flex-col items-center">
              <svg
                viewBox="0 0 60 120"
                preserveAspectRatio="none"
                className="h-24 w-10 sm:w-16"
                fill="none"
              >
                <path
                  d="M2 60 C 20 60, 40 60, 58 60"
                  stroke="color-mix(in oklab, var(--lime) 60%, transparent)"
                  strokeWidth="1.5"
                  strokeDasharray="6 6"
                  className="animate-dash"
                />
                <path
                  d="M2 60 C 20 44, 40 76, 58 60"
                  stroke="color-mix(in oklab, var(--teal) 40%, transparent)"
                  strokeWidth="1"
                  strokeDasharray="3 5"
                  className="animate-dash"
                />
                <circle cx="4" cy="60" r="3" fill="var(--teal)" className="animate-node" />
                <circle cx="30" cy="60" r="2" fill="var(--lime)" className="animate-node" />
                <circle cx="56" cy="60" r="3" fill="var(--lime)" className="animate-node" />
              </svg>
              <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-muted-foreground">
                scanning
              </span>
            </div>
            <ItemCard
              label="Found item"
              name="Black Smartphone"
              meta="RPT-1088 · 16:07"
              align="right"
            />
          </div>

          <div className="relative mt-6 flex items-end justify-between gap-4 border-t border-border/70 pt-5">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Overall
              </p>
              <p className="text-4xl font-extrabold tracking-tight text-gradient-aurora sm:text-5xl">
                {pct}%
              </p>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
                Match
              </p>
            </div>
            <div className="flex-1 space-y-2.5">
              {indicators.map((i) => (
                <div key={i.label}>
                  <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
                    <span>{i.label}</span>
                    <span className="text-foreground">{active ? i.value : 0}%</span>
                  </div>
                  <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full transition-[width] duration-[1400ms] ease-out"
                      style={{
                        width: active ? `${i.value}%` : "0%",
                        background: "var(--gradient-emerald)",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
