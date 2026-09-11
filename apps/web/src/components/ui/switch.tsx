"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** 原生 button + role=switch，屏幕阅读器读得出开关状态 */
export function Switch({
  checked,
  onChange,
  label,
  hint,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: ReactNode;
  hint?: ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "group flex w-full items-center gap-2.5 rounded-[var(--radius-md)] px-2 py-1.5 text-left",
        "transition-colors duration-[var(--dur-fast)]",
        "hover:bg-[var(--app-surface-2)] disabled:opacity-40 disabled:pointer-events-none",
      )}
    >
      <span
        className={cn(
          "relative h-[18px] w-[30px] shrink-0 rounded-full transition-colors duration-[var(--dur-base)]",
          checked ? "bg-[var(--control-active)]" : "bg-[var(--app-surface-3)]",
        )}
      >
        <span
          className={cn(
            "absolute top-[2px] size-[14px] rounded-full bg-white shadow-[0_1px_2px_rgb(0_0_0/0.3)]",
            "transition-[left] duration-[var(--dur-base)] ease-[var(--ease-out-soft)]",
            checked ? "left-[14px]" : "left-[2px]",
          )}
        />
      </span>
      <span className="min-w-0">
        <span
          className={cn(
            "block text-[13px] leading-tight transition-colors duration-[var(--dur-fast)]",
            checked ? "text-[var(--app-text)]" : "text-[var(--app-text-3)]",
          )}
        >
          {label}
        </span>
        {hint ? (
          <span className="block text-[10px] text-[var(--app-text-4)] leading-tight mt-0.5">
            {hint}
          </span>
        ) : null}
      </span>
    </button>
  );
}
