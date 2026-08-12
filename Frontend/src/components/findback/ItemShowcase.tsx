import { SectionHeading } from "./ui";
import { usePointerParallax } from "./depth";

type Item = { name: string; tag: string; icon: "phone" | "backpack" | "wallet" | "earbuds" };

const items: Item[] = [
  { name: "Smartphone", tag: "Electronics", icon: "phone" },
  { name: "Backpack", tag: "Bags", icon: "backpack" },
  { name: "Wallet", tag: "Personal", icon: "wallet" },
  { name: "Earbuds", tag: "Audio", icon: "earbuds" },
];

function Glyph({ icon }: { icon: Item["icon"] }) {
  const stroke = "var(--teal)";
  const accent = "var(--lime)";
  return (
    <svg viewBox="0 0 64 64" fill="none" className="h-16 w-16" aria-hidden="true">
      {icon === "phone" && (
        <>
          <rect x="21" y="8" width="22" height="48" rx="4" stroke={stroke} strokeWidth="1.6" />
          <rect x="25" y="14" width="14" height="32" rx="2" stroke={accent} strokeWidth="1" opacity="0.6" />
          <circle cx="32" cy="51" r="1.8" fill={accent} />
        </>
      )}
      {icon === "backpack" && (
        <>
          <path d="M16 26c0-8 7-14 16-14s16 6 16 14v26H16V26Z" stroke={stroke} strokeWidth="1.6" />
          <path d="M24 12c0-4 3.6-6 8-6s8 2 8 6" stroke={accent} strokeWidth="1.2" opacity="0.7" />
          <rect x="24" y="34" width="16" height="12" rx="2" stroke={accent} strokeWidth="1.2" />
        </>
      )}
      {icon === "wallet" && (
        <>
          <rect x="10" y="18" width="44" height="28" rx="5" stroke={stroke} strokeWidth="1.6" />
          <path d="M10 28h44" stroke={accent} strokeWidth="1" opacity="0.6" />
          <circle cx="44" cy="37" r="3" stroke={accent} strokeWidth="1.4" />
        </>
      )}
      {icon === "earbuds" && (
        <>
          <circle cx="22" cy="26" r="8" stroke={stroke} strokeWidth="1.6" />
          <circle cx="42" cy="26" r="8" stroke={stroke} strokeWidth="1.6" />
          <path d="M22 34v12M42 34v12" stroke={accent} strokeWidth="1.4" strokeLinecap="round" />
          <circle cx="22" cy="26" r="2" fill={accent} />
          <circle cx="42" cy="26" r="2" fill={accent} />
        </>
      )}
    </svg>
  );
}

function FloatingItem({ item, index }: { item: Item; index: number }) {
  const { ref, pos } = usePointerParallax<HTMLDivElement>();
  return (
    <div ref={ref} className="scene-3d">
      <article
        className="glass-depth depth-layer animate-float relative overflow-hidden rounded-xl p-5"
        style={{
          transform: `rotateX(${pos.y * -8}deg) rotateY(${pos.x * 12}deg)`,
          animationDelay: `${index * 0.7}s`,
          transition: "transform 400ms cubic-bezier(0.2,0.8,0.2,1)",
        }}
      >
        <div className="grid-mesh pointer-events-none absolute inset-0 opacity-30" />
        <div
          className="pointer-events-none absolute -bottom-16 left-1/2 h-24 w-32 -translate-x-1/2 rounded-full opacity-70 blur-2xl"
          style={{ background: "color-mix(in oklab, var(--teal) 26%, transparent)" }}
        />
        <div className="relative flex flex-col items-center gap-4">
          <div style={{ transform: "translateZ(50px)" }}>
            <Glyph icon={item.icon} />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold tracking-tight">{item.name}</p>
            <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
              {item.tag}
            </p>
          </div>
        </div>
      </article>
    </div>
  );
}

export function ItemShowcase() {
  return (
    <section className="relative py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Most recovered"
          title={
            <>
              The items people lose <span className="text-gradient-aurora">most often</span>
            </>
          }
          subtitle="Every category is modelled by the match engine with its own visual fingerprint."
        />
        <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {items.map((item, i) => (
            <FloatingItem key={item.name} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
