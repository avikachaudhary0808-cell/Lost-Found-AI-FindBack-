import { Logo } from "./Logo";

const groups = [
  { title: "Product", links: ["Explore Items", "Report Lost", "Report Found", "Map View"] },
  { title: "Company", links: ["How It Works", "Safety", "Privacy", "Contact"] },
];

export function Footer() {
  return (
    <footer className="border-t border-border/70 bg-surface/50">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Turning lost moments into found stories.
          </p>
          <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Recovery network · v1.0
          </p>
        </div>
        {groups.map((g) => (
          <div key={g.title}>
            <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
              {g.title}
            </h3>
            <ul className="mt-4 space-y-2.5">
              {g.links.map((l) => (
                <li key={l}>
                  <a
                    href="#top"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border/70">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-[11px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© 2026 FindBack. All rights reserved.</p>
          <p className="font-mono uppercase tracking-[0.16em]">
            Privacy-first by design
          </p>
        </div>
      </div>
    </footer>
  );
}
