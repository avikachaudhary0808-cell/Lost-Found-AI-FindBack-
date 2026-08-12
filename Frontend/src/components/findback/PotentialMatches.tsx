import { useState, useEffect } from "react";
import { Badge, SectionHeading, Button } from "./ui";
import { api } from "@/lib/api";

interface ApiMatch {
  id: number;
  title: string;
  category: string;
  color: string;
  approximateLocation: string;
  reportedAt: string;
  status: string;
  imagePath: string | null;
}

function Thumb({ hue, imagePath }: { hue: string; imagePath?: string | null }) {
  const imageUrl = imagePath
    ? imagePath.startsWith("http")
      ? imagePath
      : (() => {
          const parts = imagePath.split("/");
          const folder = parts[parts.length - 2];
          const filename = parts[parts.length - 1];
          return `/api/images/${folder}/${filename}`;
        })()
    : null;

  return (
    <div className="relative h-36 w-full overflow-hidden rounded-lg border border-border/70 bg-surface">
      {imageUrl ? (
        <img src={imageUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(60% 70% at 40% 20%, oklch(0.42 0.09 ${hue} / 0.55), transparent 70%), linear-gradient(150deg, oklch(0.25 0.02 190), oklch(0.17 0.014 190))`,
          }}
        />
      )}
      <div className="grid-mesh absolute inset-0 opacity-40" />
      {!imageUrl && (
        <svg
          viewBox="0 0 64 64"
          className="absolute inset-0 m-auto h-12 w-12 opacity-60"
          fill="none"
        >
          <rect
            x="12"
            y="12"
            width="40"
            height="40"
            rx="6"
            stroke="var(--teal)"
            strokeWidth="1.4"
          />
          <path
            d="M16 44l12-12 9 9 6-6 5 5"
            stroke="var(--lime)"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <circle cx="26" cy="24" r="3" stroke="var(--lime)" strokeWidth="1.4" />
        </svg>
      )}
      <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-primary/20 to-transparent animate-scan" />
    </div>
  );
}

function Card({ item }: { item: ApiMatch & { hue: string } }) {
  const reportedAgo = item.reportedAt ? new Date(item.reportedAt).toLocaleString() : "Unknown";

  return (
    <article className="tilt-3d group relative overflow-hidden rounded-xl border border-border bg-surface p-4">
      <Thumb hue={item.hue} imagePath={item.imagePath} />
      <div className="mt-4 flex flex-wrap gap-1.5">
        <Badge tone="teal">{item.category}</Badge>
        <Badge tone="amber">{item.status}</Badge>
      </div>
      <h3 className="mt-3 truncate text-base font-bold tracking-tight">{item.title}</h3>
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        {item.category} · #{item.id}
      </p>
      <div className="mt-4 space-y-1.5 border-t border-border/70 pt-3 text-xs text-muted-foreground">
        <p className="flex items-center gap-2">
          <span className="h-1 w-1 shrink-0 rounded-full bg-accent" />
          <span className="truncate">{item.approximateLocation}</span>
        </p>
        <p className="flex items-center gap-2">
          <span className="h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
          Reported {reportedAgo}
        </p>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="h-1 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full"
              style={{ width: "85%", background: "var(--gradient-emerald)" }}
            />
          </div>
          <p className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
            Potential match
          </p>
        </div>
        <span className="shrink-0 text-lg font-extrabold tracking-tight text-primary">--%</span>
      </div>
    </article>
  );
}

const HUE_MAP: Record<string, string> = {
  Electronics: "185",
  Bags: "230",
  Documents: "150",
  Personal: "40",
  Keys: "210",
};

export function PotentialMatches() {
  const [items, setItems] = useState<(ApiMatch & { hue: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .get<ApiMatch[]>("/api/found-items")
      .then((data) => {
        if (cancelled) return;
        const mapped = data.slice(0, 6).map((item) => ({
          ...item,
          hue: HUE_MAP[item.category] || "185",
        }));
        setItems(mapped);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section id="explore" className="relative py-20 sm:py-28">
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-60"
        style={{
          background:
            "radial-gradient(50% 40% at 80% 0%, color-mix(in oklab, var(--teal) 14%, transparent), transparent 70%)",
        }}
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <SectionHeading
            eyebrow="Live discovery"
            title={
              <>
                Potential matches <span className="text-gradient-aurora">around you</span>
              </>
            }
            subtitle="Updated continuously as new reports enter the network within a 5 km radius."
          />
          <Button variant="outline">Open full map</Button>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Card key={item.id} item={item} />
          ))}
          {loading && (
            <div className="col-span-full text-center text-sm text-muted-foreground">
              Loading potential matches...
            </div>
          )}
          {!loading && items.length === 0 && (
            <div className="col-span-full text-center text-sm text-muted-foreground">
              No items found yet. Be the first to report an item.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

