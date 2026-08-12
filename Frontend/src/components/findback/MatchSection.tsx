import { SectionHeading } from "./ui";
import { MatchVisualization } from "./MatchVisualization";
import { Particles } from "./depth";

export function MatchSection() {
  return (
    <section id="match" className="relative overflow-hidden py-20 sm:py-28">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(45% 45% at 20% 10%, color-mix(in oklab, var(--teal) 12%, transparent), transparent 70%)",
        }}
      />
      <Particles className="-z-10" />
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[0.85fr_1fr]">
        <SectionHeading
          eyebrow="Match engine"
          title={
            <>
              A scan that reads <span className="text-gradient-aurora">every detail</span>
            </>
          }
          subtitle="Visual embeddings, location proximity and written descriptions are fused into a single confidence score before anyone is contacted."
        />
        <MatchVisualization />
      </div>
    </section>
  );
}
