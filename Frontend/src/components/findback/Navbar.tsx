import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { Button } from "./ui";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useAuth } from "@/hooks/useAuth";

const links = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Explore", href: "#explore" },
  { label: "Report Item", href: "#report" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "/contact" },
];

function scrollToSection(href: string) {
  if (href.startsWith("/")) {
    navigate({ to: href });
    return;
  }
  const id = href.replace("#", "");
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  } else {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className={`mx-auto max-w-7xl px-4 transition-all duration-500 sm:px-6 ${scrolled ? "pt-2" : "pt-4"}`}
      >
        <nav
          className={`glass-panel grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-xl px-4 py-2.5 transition-all duration-500 lg:flex lg:justify-between ${
            scrolled ? "shadow-[var(--shadow-panel)]" : "border-transparent bg-transparent"
          }`}
        >
          <button
            onClick={() => { navigate({ to: "/" }); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            className="flex min-w-0 items-center bg-transparent border-0 cursor-pointer"
          >
            <Logo />
          </button>

          <ul className="hidden items-center gap-7 lg:flex">
            {links.map((l) => (
              <li key={l.label}>
                <button
                  onClick={() => scrollToSection(l.href)}
                  className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-primary bg-transparent border-0 cursor-pointer"
                >
                  {l.label}
                </button>
              </li>
            ))}
          </ul>

          <div className="hidden shrink-0 items-center gap-2 lg:flex">
            <LanguageSwitcher />
            {isAuthenticated ? (
              <>
                <span className="text-xs text-muted-foreground">
                  {user?.fullName || user?.email}
                </span>
                <Button id="nav-dashboard" size="sm" onClick={() => navigate({ to: "/dashboard" })}>
                  Dashboard
                </Button>
                <Button id="nav-signout" variant="ghost" size="sm" onClick={logout}>
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button id="nav-signin" variant="ghost" size="sm" onClick={() => navigate({ to: "/login" })}>
                  Sign In
                </Button>
                <Button id="nav-getstarted" size="sm" onClick={() => navigate({ to: "/register" })}>
                  Get Started
                </Button>
              </>
            )}
          </div>

          <button
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
            className="shrink-0 rounded-md border border-border p-2 lg:hidden"
          >
            <span className="block h-px w-4 bg-foreground" />
            <span className="mt-1.5 block h-px w-4 bg-foreground" />
          </button>
        </nav>

        {open && (
          <div className="glass-panel animate-rise mt-2 rounded-xl p-4 lg:hidden">
            <ul className="flex flex-col gap-3">
              {links.map((l) => (
                <li key={l.label}>
                  <button
                    onClick={() => { scrollToSection(l.href); setOpen(false); }}
                    className="text-sm text-muted-foreground hover:text-primary bg-transparent border-0 cursor-pointer"
                  >
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-col gap-2">
              <LanguageSwitcher />
              {isAuthenticated ? (
                <>
                  <span className="text-xs text-muted-foreground">
                    {user?.fullName || user?.email}
                  </span>
                  <Button className="w-full" size="sm" onClick={() => { navigate({ to: "/dashboard" }); setOpen(false); }}>
                    Dashboard
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      logout();
                      setOpen(false);
                    }}
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" size="sm" className="w-full" onClick={() => { navigate({ to: "/login" }); setOpen(false); }}>
                    Sign In
                  </Button>
                  <Button size="sm" className="w-full" onClick={() => { navigate({ to: "/register" }); setOpen(false); }}>
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
