"use client";

import { useMemo } from "react";
import {
  BOARD_CONFIG_DEFAULT,
  SHOW_ALL,
  emptyLangCopy,
  logoOf,
  type AssetRef,
  type Lang,
  type Project,
  type ShowConfig,
} from "@futu/domain";
import { buildSolveContent, solve } from "@futu/solver";
import { specOf } from "@futu/specs";
import { BoardPreview } from "@/components/board/board-preview";
import { cn } from "@/lib/utils";

const SOURCE_BOARD = { w: 1920, h: 1080 };
const BOARD_PREVIEW_W = 148;

export function PreviewWindow({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-xl)] overflow-hidden bg-[var(--app-surface-2)]",
        className,
      )}
    >
      <div className="flex items-baseline justify-between gap-2 px-2.5 py-1.5 border-b border-[var(--app-line-soft)] bg-[var(--app-surface)]">
        <span className="text-[11px] font-medium text-[var(--app-text-2)] truncate">{label}</span>
        {hint ? <span className="text-[10px] text-[var(--app-text-4)] shrink-0">{hint}</span> : null}
      </div>
      <div className="p-2">{children}</div>
    </div>
  );
}

export function SourceBoardPreview({
  project,
  lang,
  skippedIds,
  frameName,
  inline = false,
}: {
  project: Project;
  lang: Lang;
  skippedIds: readonly string[];
  frameName?: string;
  inline?: boolean;
}) {
  const copy = project.content.copy[lang] ?? emptyLangCopy();
  const show = useMemo<ShowConfig>(() => {
    const skipped = new Set(skippedIds);
    return {
      ...SHOW_ALL,
      extra: false,
      title: !skipped.has("title"),
      sub: !skipped.has("sub"),
      cta: !skipped.has("cta"),
      disc: !skipped.has("disc"),
      kv: !skipped.has("kv"),
      logo: !skipped.has("logo"),
      badge: !skipped.has("badge"),
    };
  }, [skippedIds]);

  const solution = useMemo(
    () =>
      solve({
        board: SOURCE_BOARD,
        content: buildSolveContent(copy, lang),
        show,
        margin: project.shared.margin ?? BOARD_CONFIG_DEFAULT.margin,
        extra: BOARD_CONFIG_DEFAULT.extra,
        spec: specOf(SOURCE_BOARD.w, SOURCE_BOARD.h)?.spec ?? null,
      }),
    [copy, lang, show, project.shared.margin],
  );

  const thumbnail = (
    <div
      className="rounded-[var(--radius-md)] bg-[var(--art-bg)] overflow-hidden"
      title={`${frameName ?? "画板"}预览`}
    >
      <BoardPreview
        solution={solution}
        content={buildSolveContent(copy, lang)}
        width={BOARD_PREVIEW_W}
        logoName={logoOf(project.content, lang)?.name}
      />
    </div>
  );

  if (inline) return thumbnail;

  return (
    <PreviewWindow label={frameName ?? "画板"} hint="1920×1080" className="w-[248px] shrink-0">
      <div className="w-[232px] rounded-[var(--radius-sm)] bg-[var(--art-bg)] overflow-hidden">
        <BoardPreview
          solution={solution}
          content={buildSolveContent(copy, lang)}
          width={232}
          logoName={logoOf(project.content, lang)?.name}
        />
      </div>
    </PreviewWindow>
  );
}

export function KvPreview({
  kv,
  compact = false,
  inline = false,
}: {
  kv: AssetRef;
  compact?: boolean;
  inline?: boolean;
}) {
  const graphic = (
    <div
      className="relative overflow-hidden rounded-[var(--radius-md)] grid place-items-center"
      style={{
        aspectRatio: "16 / 10",
        background:
          "linear-gradient(135deg, color-mix(in srgb, var(--art-kv) 70%, #8a8a8a) 0%, color-mix(in srgb, var(--art-kv) 88%, #c8c8c8) 100%)",
      }}
      role="img"
      aria-label={`主视觉预览 ${kv.name}`}
    >
      {kv.previewUrl ? (
        <img src={kv.previewUrl} alt="" className="absolute inset-0 size-full object-cover" />
      ) : (
        <span className="tracking-[0.35em] text-[12px] font-semibold text-white/75 select-none">KV</span>
      )}
    </div>
  );

  if (inline) return <div className="w-[148px] shrink-0" title={`主视觉预览：${kv.name}`}>{graphic}</div>;

  return (
    <PreviewWindow
      label="主视觉"
      hint={compact ? undefined : "共用"}
      className={compact ? "w-[120px] shrink-0" : "w-[160px] shrink-0"}
    >
      {graphic}
      <div className="mt-1.5 text-[10px] text-[var(--app-text-3)] truncate" title={kv.name}>
        {kv.name}
      </div>
    </PreviewWindow>
  );
}
