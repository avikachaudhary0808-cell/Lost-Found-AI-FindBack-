import type { ReactNode, MouseEventHandler } from "react";

type ButtonProps = {
  children: ReactNode;
  variant?: "primary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
  href?: string;
  type?: "button" | "submit" | "reset";
  onClick?: MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
  disabled?: boolean;
  "aria-label"?: string;
  id?: string;
};

const sizes = {
  sm: "px-3.5 py-2 text-xs",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-sm",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  href,
  type = "button",
  onClick,
  disabled = false,
  "aria-label": ariaLabel,
  id,
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-md font-semibold tracking-tight transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary:
      "bg-primary text-primary-foreground hover:shadow-[0_0_38px_-6px_color-mix(in_oklab,var(--lime)_70%,transparent)] hover:brightness-110",
    outline:
      "border border-border text-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/5",
    ghost: "text-muted-foreground hover:text-foreground",
  };

  if (href && !disabled) {
    return (
      <a
        href={href}
        id={id}
        aria-label={ariaLabel}
        onClick={onClick as MouseEventHandler<HTMLAnchorElement>}
        className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      type={type}
      id={id}
      disabled={disabled}
      aria-label={ariaLabel}
      onClick={onClick as MouseEventHandler<HTMLButtonElement>}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border/80 bg-surface/60 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
      <span className="h-1.5 w-1.5 rounded-full bg-primary animate-node" />
      {children}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "left",
}: {
  eyebrow: string;
  title: ReactNode;
  subtitle?: string;
  align?: "left" | "center";
}) {
  return (
    <div
      className={`flex max-w-2xl flex-col gap-4 ${align === "center" ? "mx-auto items-center text-center" : ""}`}
    >
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="text-3xl font-extrabold leading-[1.08] tracking-tight sm:text-4xl md:text-5xl">
        {title}
      </h2>
      {subtitle && (
        <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
          {subtitle}
        </p>
      )}
    </div>
  );
}

export function Badge({
  children,
  tone = "lime",
}: {
  children: ReactNode;
  tone?: "lime" | "teal" | "amber";
}) {
  const tones = {
    lime: "border-primary/35 text-primary bg-primary/10",
    teal: "border-accent/35 text-accent bg-accent/10",
    amber: "border-amber/35 text-amber bg-amber/10",
  };
  return (
    <span
      className={`inline-flex items-center rounded-sm border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.16em] ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
