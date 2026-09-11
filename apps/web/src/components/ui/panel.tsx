"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * 第一层框只留给左侧步骤条。
 * 主区不再叠白卡片，只在需要分区时铺浅灰块。
 */
export function Panel({
  children,
  className,
  glass: _glass = false,
  padded = false,
}: {
  children: ReactNode;
  className?: string;
  glass?: boolean;
  padded?: boolean;
}) {
  return <section className={cn(padded && "py-1", className)}>{children}</section>;
}

/** 操作区：纸白画布中的浅色工作台，不再叠加浮卡阴影。 */
export function Band({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-[7px] border border-[var(--app-line)] bg-[var(--app-band)] p-4", className)}>
      {children}
    </div>
  );
}

export function SectionTitle({
  children,
  hint,
  right,
}: {
  children: ReactNode;
  hint?: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 mb-3">
      <div className="flex items-center gap-2 min-w-0">
        <h3 className="text-[13px] font-semibold tracking-[-0.015em] text-[var(--app-text)]">
          {children}
        </h3>
        {hint ? (
          <span className="text-[11px] text-[var(--app-text-3)] truncate">{hint}</span>
        ) : null}
      </div>
      {right}
    </div>
  );
}

export function Divider({ className }: { className?: string }) {
  return <div className={cn("h-px bg-[var(--app-line-soft)]", className)} />;
}
