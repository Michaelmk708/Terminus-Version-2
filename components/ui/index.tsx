import clsx from "clsx";
import { ReactNode, InputHTMLAttributes, SelectHTMLAttributes } from "react";

/* ── Button ─────────────────────────────────────────────────── */
type BtnVariant = "gold" | "ghost" | "danger" | "muted" | "gold-outline";

const btnBase =
  "inline-flex items-center justify-center gap-2 rounded-lg font-mono text-[11px] tracking-[0.09em] uppercase transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed";

const btnVariants: Record<BtnVariant, string> = {
  gold:
    "bg-gold text-ink font-medium hover:bg-gold-light hover:-translate-y-px hover:shadow-[0_8px_28px_rgba(201,169,110,.28)] active:translate-y-0",
  ghost:
    "bg-transparent text-cream border border-line2 hover:border-gold/40 hover:text-gold-light hover:bg-gold-dim",
  danger:
    "bg-transparent text-[#c45c5c] border border-danger/50 hover:bg-[#c45c5c] hover:text-white hover:shadow-[0_0_24px_rgba(196,92,92,.35)]",
  muted:
    "bg-glass2 text-muted border border-line hover:text-cream hover:border-line2",
  "gold-outline":
    "bg-gold-dim text-gold-light border border-gold/30 hover:bg-gold/25 hover:-translate-y-px",
};

export function Button({
  children,
  variant = "gold",
  full,
  sm,
  lg,
  pill,
  className,
  onClick,
  disabled,
  type = "button",
}: {
  children: ReactNode;
  variant?: BtnVariant;
  full?: boolean;
  sm?: boolean;
  lg?: boolean;
  pill?: boolean;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        btnBase,
        btnVariants[variant],
        full && "w-full",
        sm   ? "px-3.5 py-2 text-[10px]" : lg ? "px-9 py-3.5 text-[12px]" : "px-6 py-3",
        pill ? "rounded-full" : "rounded-lg",
        className
      )}
    >
      {children}
    </button>
  );
}

/* ── Card ────────────────────────────────────────────────────── */
export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "bg-ink-2 border border-line rounded-xl overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,.35)]",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex items-center justify-between px-6 py-5 border-b border-line">
      <h3 className="font-display text-lg font-medium text-cream">{title}</h3>
      {action && (
        <button
          onClick={onAction}
          className="font-mono text-[11px] uppercase tracking-[0.07em] text-gold hover:text-gold-light hover:bg-gold-dim px-2 py-1 rounded transition-all"
        >
          {action}
        </button>
      )}
    </div>
  );
}

/* ── Badge ───────────────────────────────────────────────────── */
type BadgeVariant = "success" | "warning" | "danger" | "gold" | "muted";

const badgeStyles: Record<BadgeVariant, string> = {
  success: "bg-success text-[#5c9c7a] border border-success",
  warning: "bg-warn    text-[#c9843a] border border-warn",
  danger:  "bg-danger  text-[#c45c5c] border border-danger",
  gold:    "bg-gold-dim text-gold-light border border-gold/25",
  muted:   "bg-glass2  text-muted      border border-line",
};

export function Badge({
  variant = "success",
  children,
  dot,
}: {
  variant?: BadgeVariant;
  children: ReactNode;
  dot?: boolean;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-[10px] tracking-[0.09em] uppercase",
        badgeStyles[variant]
      )}
    >
      {dot && (
        <span className="w-[5px] h-[5px] rounded-full bg-current animate-pulse-dot" />
      )}
      {children}
    </span>
  );
}

/* ── SectionLabel ────────────────────────────────────────────── */
export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-gold mb-4">
      {children}
    </p>
  );
}

/* ── FormInput ───────────────────────────────────────────────── */
interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
  success?: string;
}

export function FormInput({
  label, hint, error, success, className, ...props
}: FormInputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-mono text-[11px] tracking-[0.1em] uppercase text-muted">
        {label}
      </label>
      <input
        {...props}
        className={clsx(
          "w-full px-4 py-3 bg-ink-3 border rounded-lg text-cream font-sans text-sm placeholder:text-muted-2 outline-none transition-all",
          "hover:border-gold/50 hover:bg-ink-2",
          "focus:border-gold/50 focus:ring-2 focus:ring-gold/[0.07] focus:bg-ink-2",
          error   ? "border-[#c45c5c]/50" : "border-line2",
          className
        )}
      />
      {hint    && <p className="font-mono text-[11px] text-muted-2">{hint}</p>}
      {error   && <p className="font-mono text-[11px] text-[#c45c5c]">{error}</p>}
      {success && <p className="font-mono text-[11px] text-[#5c9c7a]">{success}</p>}
    </div>
  );
}

/* ── FormSelect ──────────────────────────────────────────────── */
interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  hint?: string;
}

export function FormSelect({
  label, hint, children, className, ...props
}: FormSelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-mono text-[11px] tracking-[0.1em] uppercase text-muted">
        {label}
      </label>
      <select
        {...props}
        className={clsx(
          "w-full px-4 py-3 bg-ink-3 border border-line2 rounded-lg text-cream font-sans text-sm outline-none transition-all appearance-none",
          "hover:border-gold/50 hover:bg-ink-2",
          "focus:border-gold/50 focus:ring-2 focus:ring-gold/[0.07] focus:bg-ink-2",
          className
        )}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%237a7c8e' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 14px center",
          paddingRight: "38px",
        }}
      >
        {children}
      </select>
      {hint && <p className="font-mono text-[11px] text-muted-2">{hint}</p>}
    </div>
  );
}

/* ── PasswordInput ───────────────────────────────────────────── */
import { useState } from "react";

export function PasswordInput({
  label, hint, error, success, ...props
}: FormInputProps) {
  const [show, setShow] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-mono text-[11px] tracking-[0.1em] uppercase text-muted">
        {label}
      </label>
      <div className="relative">
        <input
          {...props}
          type={show ? "text" : "password"}
          className={clsx(
            "w-full px-4 py-3 pr-11 bg-ink-3 border rounded-lg text-cream font-sans text-sm placeholder:text-muted-2 outline-none transition-all",
            "hover:border-gold/50 hover:bg-ink-2",
            "focus:border-gold/50 focus:ring-2 focus:ring-gold/[0.07] focus:bg-ink-2",
            error ? "border-[#c45c5c]/50" : "border-line2"
          )}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-gold transition-colors text-base"
        >
          {show ? "🙈" : "👁"}
        </button>
      </div>
      {hint    && <p className="font-mono text-[11px] text-muted-2">{hint}</p>}
      {error   && <p className="font-mono text-[11px] text-[#c45c5c]">{error}</p>}
      {success && <p className="font-mono text-[11px] text-[#5c9c7a]">{success}</p>}
    </div>
  );
}

/* ── ProgressBar ─────────────────────────────────────────────── */
export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-1 bg-glass2 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full bg-gradient-to-r from-gold to-gold-light transition-all duration-[1200ms]"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

/* ── Spinner ─────────────────────────────────────────────────── */
export function Spinner({ dark }: { dark?: boolean }) {
  return (
    <span
      className={clsx(
        "inline-block w-3.5 h-3.5 border-2 rounded-full animate-spin mr-1.5 align-middle",
        dark
          ? "border-black/10 border-t-ink"
          : "border-white/15 border-t-current"
      )}
    />
  );
}

/* ── InfoBox ─────────────────────────────────────────────────── */
export function InfoBox({ children }: { children: ReactNode }) {
  return (
    <div className="p-3.5 bg-glass border border-line rounded-lg font-mono text-[11px] text-muted-2 leading-relaxed">
      {children}
    </div>
  );
}

/* ── EmptyState ──────────────────────────────────────────────── */
export function EmptyState({
  icon,
  title,
  desc,
  action,
  onAction,
}: {
  icon: string;
  title: string;
  desc?: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-9 px-5 text-center">
      <div className="text-4xl mb-3 opacity-50">{icon}</div>
      <p className="font-display text-[19px] text-cream mb-1.5">{title}</p>
      {desc && (
        <p className="text-[13px] text-muted leading-relaxed max-w-[240px] mb-5">
          {desc}
        </p>
      )}
      {action && onAction && (
        <Button variant="gold-outline" sm onClick={onAction}>
          {action}
        </Button>
      )}
    </div>
  );
}