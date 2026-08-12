import { SectionHeading } from "./ui";
import { verificationFlow } from "./data";

export function VerificationSection() {
  return (
    <section id="report" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="glass-panel relative overflow-hidden rounded-2xl p-6 sm:p-10 lg:p-14">
          <div className="aurora-field pointer-events-none absolute inset-0 opacity-60" />
          <div className="relative grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
            <div>
              <SectionHeading
                eyebrow="Ownership protocol"
                title={
                  <>
                    A match isn't enough.{" "}
                    <span className="text-gradient-aurora">We verify ownership.</span>
                  </>
                }
                subtitle="Every recovery passes a four-stage verification chain before contact is ever established."
              />
              <div className="mt-8 flex items-start gap-3 rounded-lg border border-amber/25 bg-amber/8 p-4">
                <svg viewBox="0 0 24 24" fill="none" className="mt-0.5 h-5 w-5 shrink-0">
                  <path
                    d="M12 3 4 6.5v5.2c0 4.4 3.3 8.2 8 9.3 4.7-1.1 8-4.9 8-9.3V6.5L12 3Z"
                    stroke="var(--amber)"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M12 9v4M12 16h.01"
                    stroke="var(--amber)"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />
                </svg>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Sensitive identifying details — serial numbers, ID digits, engravings and
                  contact information — are{" "}
                  <span className="text-amber">never publicly exposed</span> on a listing.
                  They exist only inside the verification chain.
                </p>
              </div>
            </div>

            <ol className="relative flex flex-col gap-4">
              <span className="absolute left-[19px] top-6 bottom-6 w-px bg-gradient-to-b from-accent/50 via-primary/40 to-transparent" />
              {verificationFlow.map((s, i) => (
                <li
                  key={s.title}
                  className="lift-card relative flex gap-4 rounded-xl border border-border bg-surface/80 p-4 backdrop-blur-sm"
                >
                  <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/35 bg-background font-mono text-[11px] text-primary">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold tracking-tight">{s.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {s.body}
                    </p>
                  </div>
                  {i === 0 && (
                    <span className="absolute right-4 top-4 h-1.5 w-1.5 rounded-full bg-primary animate-node" />
                  )}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
