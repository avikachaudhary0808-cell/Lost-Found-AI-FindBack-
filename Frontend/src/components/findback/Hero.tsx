import { useNavigate } from "@tanstack/react-router";
import { Button, Eyebrow } from "./ui";
import { HeroScene } from "./HeroScene";
import { DepthBackground } from "./depth";
import { useAuth } from "@/hooks/useAuth";

const stats = [
  { value: "48,210", label: "Items reported" },
  { value: "31,776", label: "Successful recoveries" },
  { value: "< 6 hrs", label: "Median match time" },
];

export function Hero() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleReportLost = () => {
    if (isAuthenticated) {
      navigate({ to: "/dashboard" });
    } else {
      navigate({ to: "/register" });
    }
  };

  const handleFoundSomething = () => {
    if (isAuthenticated) {
      navigate({ to: "/dashboard" });
    } else {
      navigate({ to: "/register" });
    }
  };

  return (
    <section id="top" className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
      <DepthBackground />

      <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-10">
        <div className="animate-rise flex flex-col items-start gap-6">
          <Eyebrow>AI recovery network</Eyebrow>
          <h1 className="text-4xl font-extrabold leading-[1.02] tracking-tight sm:text-6xl lg:text-[4.25rem]">
            Lost something?
            <br />
            <span className="text-gradient-aurora">Let intelligence find it.</span>
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-muted-foreground">
            FindBack connects lost and found items using AI-powered visual matching,
            location intelligence and secure ownership verification.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button id="hero-report-lost" size="lg" onClick={handleReportLost}>
              Report Lost Item
            </Button>
            <Button id="hero-found-something" size="lg" variant="outline" onClick={handleFoundSomething}>
              I Found Something
            </Button>
          </div>
          <dl className="mt-4 grid w-full max-w-lg grid-cols-3 gap-4 border-t border-border/70 pt-6">
            {stats.map((s) => (
              <div key={s.label} className="min-w-0">
                <dt className="text-xl font-extrabold tracking-tight text-primary sm:text-2xl">
                  {s.value}
                </dt>
                <dd className="font-mono text-[9px] uppercase leading-relaxed tracking-[0.14em] text-muted-foreground">
                  {s.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="animate-rise [animation-delay:150ms]">
          <HeroScene />
        </div>
      </div>
    </section>
  );
}
