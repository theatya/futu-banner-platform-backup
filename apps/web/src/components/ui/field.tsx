"use client";

import { useEffect, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { cn, clamp } from "@/lib/utils";

const BASE =
  "w-full border border-[var(--app-line)] bg-[var(--app-field)] rounded-[var(--radius-sm)] " +
  "px-3 text-[13px] text-[var(--app-text)] placeholder:text-[var(--app-text-4)] " +
  "transition-[border-color,box-shadow] duration-[var(--dur-fast)] focus:outline-none focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand-line)]";

export function Label({ children, hint }: { children: ReactNode; hint?: ReactNode }) {
  return (
    <div className="flex items-baseline gap-1.5 mb-1.5">
      <span className="text-[11px] font-semibold text-[var(--app-text-2)]">{children}</span>
      {hint ? <span className="text-[10px] text-[var(--app-text-4)]">{hint}</span> : null}
    </div>
  );
}

export function TextField({
  label,
  hint,
  className,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { label?: string; hint?: ReactNode }) {
  return (
    <label className="block">
      {label ? <Label hint={hint}>{label}</Label> : null}
      <input className={cn(BASE, "h-10", className)} {...rest} />
    </label>
  );
}

export function TextArea({
  label,
  hint,
  rows = 3,
  className,
  ...rest
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; hint?: ReactNode }) {
  return (
    <label className="block">
      {label ? <Label hint={hint}>{label}</Label> : null}
      <textarea rows={rows} className={cn(BASE, "py-2 leading-relaxed resize-y", className)} {...rest} />
    </label>
  );
}

/**
 * 可直接编辑的数值框。
 *
 * 关键在于**输入期间不回写**：如果每敲一个字符就 clamp 再回填，
 * 用户想把 300 改成 1200 时，刚删到 "3" 就会被夹回下限，根本没法打字。
 * 所以这里维持一份本地草稿，只在失焦或回车时提交。
 */
export function NumberField({
  value,
  onCommit,
  min,
  max,
  step = 1,
  suffix,
  className,
  ariaLabel,
}: {
  value: number;
  onCommit: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  className?: string;
  ariaLabel?: string;
}) {
  const [draft, setDraft] = useState(String(value));
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!editing) setDraft(String(value));
  }, [value, editing]);

  const commit = () => {
    setEditing(false);
    const n = Number(draft);
    if (Number.isFinite(n)) onCommit(clamp(n, min, max));
    else setDraft(String(value));
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[var(--radius-sm)] border border-transparent",
        "hover:border-[var(--app-line)] focus-within:border-[var(--color-brand)]",
        "bg-[var(--app-surface-2)] transition-colors duration-[var(--dur-fast)]",
        className,
      )}
    >
      <input
        aria-label={ariaLabel}
        inputMode="decimal"
        step={step}
        value={draft}
        onFocus={(e) => {
          setEditing(true);
          e.currentTarget.select();
        }}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
          if (e.key === "Escape") {
            setDraft(String(value));
            setEditing(false);
            e.currentTarget.blur();
          }
        }}
        className="w-full bg-transparent text-right tabular-nums text-[12px] text-[var(--app-text)] px-1.5 py-1 focus:outline-none"
      />
      {suffix ? (
        <span className="pr-1.5 text-[11px] text-[var(--app-text-3)] select-none">{suffix}</span>
      ) : null}
    </span>
  );
}
