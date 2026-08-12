import { LogoMark } from "./Logo";
import { Particles, usePointerParallax } from "./depth";

const panels = [
  { label: "Visual Match", value: "94%", pos: "left-0 top-6", z: 90, x1: 24, y1: 22 },
  { label: "Location", value: "0.8 km", pos: "right-0 top-1/3", z: 70, x1: 78, y1: 40 },
  {
    label: "Ownership Confidence",
    value: "91%",
    pos: "left-2 bottom-8",
    z: 110,
    x1: 26,
    y1: 80,
  },
];

function Phone() {
  return (
    <div className="depth-layer relative h-[300px] w-[152px] sm:h-[360px] sm:w-[182px]">
      <div
        className="absolute inset-0 rounded-[26px] border border-border/80"
        style={{
          background:
            "linear-gradient(155deg, oklch(0.3 0.02 190), oklch(0.19 0.014 190) 60%, oklch(0.15 0.01 190))",
          boxShadow:
            "var(--shadow-float), inset 0 1px 0 color-mix(in oklab, var(--teal) 35%, transparent)",
        }}
      >
        <div
          className="absolute inset-[6px] overflow-hidden rounded-[20px] border border-border/60"
          style={{
            background:
              "radial-gradient(70% 60% at 50% 15%, color-mix(in oklab, var(--teal) 26%, transparent), transparent 70%), linear-gradient(170deg, oklch(0.23 0.02 190), oklch(0.16 0.012 190))",
          }}
        >
          <div className="grid-mesh absolute inset-0 opacity-40" />
          <div className="absolute inset-x-0 top-0 h-10 animate-scan bg-gradient-to-b from-primary/35 to-transparent" />
          <div className="absolute inset-x-4 top-8 space-y-2">
            <div className="h-1.5 w-2/3 rounded-full bg-primary/60" />
            <div className="h-1.5 w-1/2 rounded-full bg-accent/40" />
            <div className="h-1.5 w-3/5 rounded-full bg-muted-foreground/30" />
          </div>
          <div className="absolute inset-x-4 bottom-6">
            <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-accent">
              Scanning
            </p>
            <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full w-3/4 rounded-full"
                style={{ background: "var(--gradient-emerald)" }}
              />
            </div>
          </div>
        </div>
        <div className="absolute left-1/2 top-2 h-1 w-10 -translate-x-1/2 rounded-full bg-border" />
      </div>
      {/* ambient contact shadow */}
      <div
        className="pointer-events-none absolute -bottom-10 left-1/2 h-10 w-40 -translate-x-1/2 rounded-full opacity-70 blur-2xl"
        style={{ background: "oklch(0 0 0 / 0.8)" }}
      />
    </div>
  );
}

export function HeroScene() {
  const { ref, pos } = usePointerParallax<HTMLDivElement>();

  return (
    <div ref={ref} className="scene-3d relative mx-auto w-full max-w-xl">
      {/* background glow / mid-ground rings */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 blur-3xl"
        style={{
          background:
            "radial-gradient(45% 45% at 55% 45%, color-mix(in oklab, var(--teal) 32%, transparent), transparent 70%)",
          transform: `translate3d(${pos.x * -14}px, ${pos.y * -10}px, 0)`,
        }}
      />
      <Particles className="-z-10" />

      <div
        className="depth-layer relative flex h-[430px] items-center justify-center sm:h-[500px]"
        style={{
          transform: `rotateX(${pos.y * -7}deg) rotateY(${pos.x * 10}deg)`,
          transition: "transform 400ms cubic-bezier(0.2,0.8,0.2,1)",
        }}
      >
        {/* connection lines */}
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          {panels.map((p) => (
            <g key={p.label}>
              <line
                x1={p.x1}
                y1={p.y1}
                x2="50"
                y2="50"
                stroke="color-mix(in oklab, var(--lime) 45%, transparent)"
                strokeWidth="0.25"
                strokeDasharray="2 2"
                className="animate-dash"
              />
              <circle cx={p.x1} cy={p.y1} r="0.7" fill="var(--teal)" className="animate-node" />
            </g>
          ))}
        </svg>

        {/* rotating scan rings behind the object */}
        <div
          className="pointer-events-none absolute"
          style={{ transform: "translateZ(-60px) rotateX(72deg)" }}
        >
          <div className="animate-spin-slow h-[260px] w-[260px] rounded-full border border-dashed border-accent/30 sm:h-[320px] sm:w-[320px]" />
        </div>
        <div
          className="pointer-events-none absolute"
          style={{ transform: "translateZ(-30px) rotateX(64deg)" }}
        >
          <div className="animate-spin-slower h-[190px] w-[190px] rounded-full border border-primary/25 sm:h-[240px] sm:w-[240px]" />
        </div>

        {/* floating 3D logo object */}
        <div
          className="animate-float glass-depth absolute left-4 top-0 rounded-2xl p-3"
          style={{ transform: "translateZ(140px) rotateY(-16deg) rotateX(6deg)" }}
        >
          <LogoMark className="h-9 w-9" />
        </div>

        {/* the hero object */}
        <div
          className="animate-float"
          style={{ transform: "translateZ(40px) rotateY(-14deg) rotateX(6deg)" }}
        >
          <Phone />
        </div>

        {/* floating info panels */}
        {panels.map((p) => (
          <div
            key={p.label}
            className={`glass-depth absolute ${p.pos} animate-float rounded-lg px-3 py-2.5`}
            style={{
              transform: `translateZ(${p.z}px) rotateY(${p.x1 < 50 ? 12 : -12}deg)`,
              animationDelay: `${p.z / 60}s`,
            }}
          >
            <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-muted-foreground">
              {p.label}
            </p>
            <p className="text-base font-extrabold tracking-tight text-gradient-aurora">
              {p.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
