"use client";

import { joinTokens, tokenizeTitle, type Lang, type TitleStack } from "@futu/domain";
import { cn } from "@/lib/utils";

export function BreakPicker({
  title,
  sub,
  lang,
  breaks,
  stack,
  onChange,
  onStackChange,
  showPreview = true,
  showStackControls = true,
}: {
  title: string;
  sub: string;
  lang: Lang;
  breaks: number[];
  stack: TitleStack;
  onChange: (next: number[]) => void;
  onStackChange: (next: TitleStack) => void;
  showPreview?: boolean;
  showStackControls?: boolean;
}) {
  const tokens = tokenizeTitle(title, lang);
  const set = new Set(breaks.filter((b) => b > 0 && b < tokens.length));

  const toggle = (i: number) => {
    const next = new Set(set);
    if (next.has(i)) next.delete(i);
    else next.add(i);
    onChange([...next].sort((a, b) => a - b));
  };

  const lines: string[] = [];
  let start = 0;
  const marks = [...set].sort((a, b) => a - b);
  for (const m of marks) {
    lines.push(joinTokens(tokens.slice(start, m), lang));
    start = m;
  }
  lines.push(joinTokens(tokens.slice(start), lang));

  const titleBlock = (
    <div className="text-[15px] font-semibold leading-[1.35]">
      {lines.map((line, i) => (
        <div key={i}>{line || " "}</div>
      ))}
    </div>
  );
  const subBlock = sub ? (
    <div className="text-[12px] leading-[1.4] text-white/70">{sub}</div>
  ) : null;

  return (
    <div className="space-y-4">
      {showStackControls ? <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={() => onStackChange("title-first")}
          className={cn("h-8 px-3 rounded-full text-[12px]", stack === "title-first" ? "choice-on" : "choice-idle")}
        >
          主标题在上
        </button>
        <button
          type="button"
          onClick={() => onStackChange("sub-first")}
          className={cn("h-8 px-3 rounded-full text-[12px]", stack === "sub-first" ? "choice-on" : "choice-idle")}
        >
          副标题在上
        </button>
      </div> : null}
      <div className={cn("grid gap-4 items-start", showPreview && "sm:grid-cols-[minmax(0,1fr)_220px]")}>
        <div className="flex flex-wrap gap-1.5">
          {tokens.map((t, i) => {
            const on = set.has(i);
            return (
              <button
                key={`${t}-${i}`}
                type="button"
                disabled={i === 0}
                onClick={() => toggle(i)}
                title={i === 0 ? "第一个词不能当断点" : on ? "取消断行" : "在此另起一行"}
                className={cn(
                  "h-8 px-2.5 rounded-full text-[13px]",
                  i === 0 && "opacity-50 cursor-not-allowed",
                  on ? "choice-on" : "choice-idle",
                )}
              >
                {t}
              </button>
            );
          })}
        </div>
        {showPreview ? <div className="rounded-[var(--radius-lg)] bg-[var(--art-bg)] text-[var(--art-fg)] px-4 py-5 min-h-[112px]">
          <div className="space-y-2">
            {stack === "sub-first" ? (
              <>
                {subBlock}
                {titleBlock}
              </>
            ) : (
              <>
                {titleBlock}
                {subBlock}
              </>
            )}
          </div>
        </div> : null}
      </div>
    </div>
  );
}
