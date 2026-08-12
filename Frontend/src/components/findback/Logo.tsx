export function LogoMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="fb-mark" x1="4" y1="4" x2="36" y2="36">
          <stop offset="0%" stopColor="var(--teal)" />
          <stop offset="100%" stopColor="var(--lime)" />
        </linearGradient>
      </defs>
      <path
        d="M20 4c-6.2 0-11 4.7-11 10.6C9 22.4 20 36 20 36s11-13.6 11-21.4C31 8.7 26.2 4 20 4Z"
        stroke="url(#fb-mark)"
        strokeWidth="1.8"
        opacity="0.75"
      />
      <circle cx="18" cy="14" r="5.4" stroke="url(#fb-mark)" strokeWidth="2" />
      <path
        d="m22.2 18.2 4.4 4.4"
        stroke="url(#fb-mark)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="18" cy="14" r="1.8" fill="var(--lime)" />
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark />
      <span className="text-lg font-extrabold tracking-tight">
        Find<span className="text-primary">Back</span>
      </span>
    </span>
  );
}
