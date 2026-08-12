import { SectionHeading } from "./ui";

const features = [
  {
    title: "AI Visual Matching",
    body: "Embedding-level image comparison across colour, wear, shape and fine detail.",
    icon: (
      <>
        <rect
          x="5"
          y="5"
          width="14"
          height="14"
          rx="3"
          stroke="var(--teal)"
          strokeWidth="1.5"
        />
        <path
          d="M7 16l3.5-3.5L13 15l2-2 2 2"
          stroke="var(--lime)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </>
    ),
  },
  {
    title: "Location Intelligence",
    body: "Movement corridors and time windows narrow the search to plausible ground.",
    icon: (
      <>
        <path
          d="M12 3c-3.3 0-6 2.5-6 5.7C6 13 12 21 12 21s6-8 6-12.3C18 5.5 15.3 3 12 3Z"
          stroke="var(--teal)"
          strokeWidth="1.5"
        />
        <circle cx="12" cy="8.6" r="2.2" stroke="var(--lime)" strokeWidth="1.5" />
      </>
    ),
  },
  {
    title: "Ownership Verification",
    body: "Private challenge questions only the rightful owner can answer correctly.",
    icon: (
      <>
        <rect
          x="5"
          y="10"
          width="14"
          height="10"
          rx="2.5"
          stroke="var(--teal)"
          strokeWidth="1.5"
        />
        <path d="M8.5 10V7.5a3.5 3.5 0 1 1 7 0V10" stroke="var(--teal)" strokeWidth="1.5" />
        <circle cx="12" cy="15" r="1.5" fill="var(--lime)" />
      </>
    ),
  },
  {
    title: "Fraud Protection",
    body: "Behavioural signals flag repeat claimers and suspicious recovery patterns.",
    icon: (
      <>
        <path
          d="M12 3 5 6v6c0 4.2 3 7.8 7 9 4-1.2 7-4.8 7-9V6l-7-3Z"
          stroke="var(--teal)"
          strokeWidth="1.5"
        />
        <path
          d="m9.5 12 1.8 1.8L15 10"
          stroke="var(--lime)"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </>
    ),
  },
];

export function SafetyFeatures() {
  return (
    <section id="about" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Trust & safety"
          align="center"
          title={
            <>
              Built like an{" "}
              <span className="text-gradient-aurora">investigation system</span>
            </>
          }
          subtitle="Four layers working quietly in the background of every single recovery."
        />
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <article
              key={f.title}
              className="lift-card group rounded-xl border border-border bg-surface p-6"
            >
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-surface-raised transition-colors group-hover:border-primary/40">
                <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
                  {f.icon}
                </svg>
              </span>
              <h3 className="mt-5 text-sm font-bold tracking-tight">{f.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{f.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
