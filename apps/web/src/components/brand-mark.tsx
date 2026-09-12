"use client";

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5 min-w-0">
      <img src="/brand/futu-icon.svg" alt="" width={32} height={32} className="size-8 shrink-0" />
      {compact ? null : (
        <span className="text-[14px] font-semibold tracking-tight truncate">资源位延展工具台</span>
      )}
    </div>
  );
}
