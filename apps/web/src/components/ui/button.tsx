"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const VARIANT: Record<Variant, string> = {
  primary:
    "bg-[var(--color-brand)] text-[var(--app-on-brand)] hover:bg-[var(--color-brand-hover)] active:bg-[var(--color-brand-press)]",
  secondary:
    "border border-[var(--app-line-strong)] bg-[var(--app-surface-2)] text-[var(--app-text)] hover:bg-[var(--app-surface-3)]",
  ghost: "text-[var(--app-text-2)] hover:bg-[var(--app-surface-2)] hover:text-[var(--app-text)]",
  danger: "bg-[var(--color-up)] text-white hover:opacity-90",
};

const SIZE: Record<Size, string> = {
  sm: "h-7 px-2.5 text-[11px] gap-1.5 rounded-[4px]",
  md: "h-8 px-3 text-[12px] gap-2 rounded-[5px]",
  lg: "h-9 px-4 text-[13px] gap-2 rounded-[6px]",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  /** 撑满父容器宽度 */
  block?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "secondary", size = "md", icon, block, className, children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center font-medium whitespace-nowrap select-none",
        "transition-[background-color,border-color,color,opacity,transform] duration-[var(--dur-fast)]",
        "active:scale-[0.985] disabled:pointer-events-none disabled:opacity-40",
        VARIANT[variant],
        SIZE[size],
        block && "w-full",
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
});
