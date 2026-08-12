import { SectionHeading } from "./ui";
import { steps } from "./data";

const glyphs = [
  <svg key="a" viewBox="0 0 48 48" fill="none" className="h-10 w-10">
    <rect
      x="10"
      y="6"
      width="28"
      height="36"
      rx="4"
      stroke="var(--teal)"
      strokeWidth="1.6"
    />
    <path
      d="M17 18h14M17 25h14M17 32h8"
      stroke="var(--lime)"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>,
  <svg key="b" viewBox="0 0 48 48" fill="none" className="h-10 w-10">
    <circle cx="15" cy="24" r="7" stroke="var(--teal)" strokeWidth="1.6" />
    <circle cx="33" cy="24" r="7" stroke="var(--lime)" strokeWidth="1.6" />
    <path
      d="M22 24h4"
      stroke="var(--lime)"
      strokeWidth="1.6"
      strokeDasharray="2 3"
      className="animate-dash"
    />
    <circle cx="24" cy="24" r="1.6" fill="var(--lime)" />
  </svg>,
  <svg key="c" viewBox="0 0 48 48" fill="none" className="h-10 w-10">
    <path
      d="M24 6 10 12v12c0 8.4 5.8 15.4 14 18 8.2-2.6 14-9.6 14-18V12L24 6Z"
      stroke="var(--teal)"
      strokeWidth="1.6"
    />
    <path
      d="m18 24 4.6 4.6L31 20"
      stroke="var(--lime)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>,
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Process"
          title={
            <>
              How <span className="text-gradient-aurora">FindBack</span> works
            </>
          }
          subtitle="Three deliberate steps between losing something and holding it again."
        />

        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {steps.map((s, i) => (
            <article
              key={s.no}
              className="lift-card group relative overflow-hidden rounded-xl border border-border bg-surface p-7"
            >
              <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/8 blur-3xl transition-opacity duration-500 group-hover:bg-primary/15" />
              <span className="font-mono text-[11px] tracking-[0.24em] text-muted-foreground">
                {s.no}
              </span>
              <div className="mt-6">{glyphs[i]}</div>
              <h3 className="mt-6 text-xl font-bold uppercase tracking-tight">
                {s.title}
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                {s.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
