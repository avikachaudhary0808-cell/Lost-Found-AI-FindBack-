import { Button, Eyebrow } from "./ui";
import { DepthBackground, usePointerParallax } from "./depth";
import { LogoMark } from "./Logo";

export function CTA() {
  const { ref, pos } = usePointerParallax<HTMLDivElement>();
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <DepthBackground />
      <div ref={ref} className="scene-3d mx-auto max-w-4xl px-4 sm:px-6">
        <div
          className="glass-depth depth-layer relative overflow-hidden rounded-2xl px-6 py-14 sm:px-14"
          style={{
            transform: `rotateX(${pos.y * -3}deg) rotateY(${pos.x * 5}deg)`,
            transition: "transform 400ms cubic-bezier(0.2,0.8,0.2,1)",
          }}
        >
          <div className="grid-mesh pointer-events-none absolute inset-0 opacity-30" />
          <div
            className="animate-float glass-depth absolute right-6 top-6 hidden rounded-xl p-3 sm:block"
            style={{ transform: "translateZ(70px) rotateY(-14deg)" }}
          >
            <LogoMark className="h-8 w-8" />
          </div>
          <div className="relative flex flex-col items-center gap-7 text-center">
            <Eyebrow>Still searching</Eyebrow>
            <h2 className="text-3xl font-extrabold leading-[1.06] tracking-tight sm:text-5xl">
              Maybe your lost item is{" "}
              <span className="text-gradient-aurora">already waiting to be found.</span>
            </h2>
            <div className="flex flex-wrap justify-center gap-3">
              <Button size="lg" href="#explore">
                Find My Item
              </Button>
              <Button size="lg" variant="outline" href="#report">
                Report a Found Item
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
