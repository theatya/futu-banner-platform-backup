"use client";

import { Info, Lock, TriangleAlert } from "lucide-react";
import type { SolveNote } from "@futu/domain";
import { cn } from "@/lib/utils";

/**
 * 求解器的决策记录。
 *
 * 三个层级刻意做出强弱差：
 *   info  求解器自己的选择，可以不看
 *   lock  规范卡住了你的设置 —— 必须看见，否则人会以为工具没听话
 *   warn  这块板有问题 —— 必须看见
 *
 * 交互稿里这些是拼接好的字符串，没法分级。现在是结构化的，界面才能分轻重。
 */

const STYLE = {
  info: {
    icon: Info,
    cls: "text-[var(--app-text-3)]",
    iconCls: "text-[var(--app-text-4)]",
  },
  lock: {
    icon: Lock,
    cls: "text-[var(--app-text-2)]",
    iconCls: "text-[var(--color-brand)]",
  },
  warn: {
    icon: TriangleAlert,
    cls: "text-[var(--app-text)]",
    iconCls: "text-[var(--color-warn)]",
  },
} as const;

export function NoteLine({ note }: { note: SolveNote }) {
  const s = STYLE[note.level];
  const Icon = s.icon;
  return (
    <li className="flex gap-2 items-start">
      <Icon size={12} className={cn("mt-[3px] shrink-0", s.iconCls)} aria-hidden />
      <span className={cn("text-[11px] leading-[1.6]", s.cls)}>{note.text}</span>
    </li>
  );
}

export function NoteList({ notes, className }: { notes: SolveNote[]; className?: string }) {
  if (notes.length === 0) return null;
  return (
    <ul className={cn("space-y-1", className)}>
      {notes.map((n, i) => (
        <NoteLine key={`${n.level}-${i}`} note={n} />
      ))}
    </ul>
  );
}

export function Chip({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "brand" | "warn" | "lock";
  className?: string;
}) {
  const tones = {
    neutral: "bg-[var(--app-surface-2)] text-[var(--app-text-3)] border-[var(--app-line-soft)]",
    brand: "bg-[var(--color-brand-soft)] text-[var(--color-brand)] border-[var(--color-brand-line)]",
    warn: "bg-[var(--warn-soft)] text-[var(--warn-text)] border-[var(--warn-soft)]",
    lock: "bg-[var(--app-surface-3)] text-[var(--app-text-2)] border-[var(--app-line)]",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-[var(--radius-xs)] border px-1.5 py-[1px]",
        "text-[10px] font-medium leading-[1.5] whitespace-nowrap tabular-nums",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
