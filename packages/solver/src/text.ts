/**
 * 文字相关的决策：主标题断行、免责折行、按钮长短版取舍。
 *
 * 和交互稿的区别：所有内容都从参数传进来，不再读模块级常量。
 * 交互稿里 `wrapTitle` 直接读全局 `TITLE_TOKENS`，`pickCta` 读 `CTA_LONG` ——
 * 那意味着求解器只会排一条固定的广告。这里全部参数化。
 */

import { joinTokens, type Lang, type TitleStack } from "@futu/domain";
import type { SolveNote } from "@futu/domain";
import type { TextMeasurer } from "./measure";

export interface SolveContent {
  lang: Lang;
  /** 主标题拆成的 token */
  titleTokens: string[];
  /** 允许断行的位置（token 下标），空数组 = 永不断行 */
  titleBreaks: number[];
  /** true 时严格按 titleBreaks 断行；false 时由画幅宽度决定是否使用断点 */
  titleBreakFixed?: boolean;
  sub: string;
  titleStack?: TitleStack;
  /** 设计师在第二步保存的标题组内部间距，未传则使用版式默认值。 */
  titleGapPx?: number;
  ctaLong: string;
  ctaShort: string;
  badge: string;
  /** 免责纯文本，用于测量总宽 */
  disclaimer: string;
}

/**
 * 在**允许的断点**上贪心折行：每行尽量塞满，只在开了口子的地方断。
 * 一个口子都没开就永远一行，宽度不够只能靠缩字号。
 *
 * @param availPx 可用宽度（真实 px）
 * @param cap 最多几行，来自站内规范；不传则不限
 */
export function wrapTitle(
  availPx: number,
  fontPx: number,
  content: SolveContent,
  measurer: TextMeasurer,
  notes: SolveNote[],
  cap?: number,
): string[] {
  const { titleTokens: tokens, titleBreaks, titleBreakFixed = false, lang } = content;
  if (tokens.length === 0) return [];

  const gaps = Array.from(new Set(titleBreaks))
    .filter((g) => g > 0 && g < tokens.length)
    .sort((a, b) => a - b);

  const seg = (a: number, b?: number) => joinTokens(tokens.slice(a, b), lang);
  const widthOf = (s: string) => measurer.measure(s, fontPx, "bold");

  if (titleBreakFixed) {
    const ends = [...gaps, tokens.length];
    const lines = ends.map((end, index) => {
      const startAt = index === 0 ? 0 : Number(ends[index - 1]);
      return seg(startAt, end);
    });
    const hasOverflow = lines.some((line) => widthOf(line) > availPx);
    notes.push({
      level: hasOverflow ? "warn" : "info",
      text: hasOverflow
        ? "主标题：已按设计师方案固定断行；有一行超宽，需缩字号或换方案"
        : `主标题：已按设计师方案固定为 ${lines.length} 行`,
    });
    return lines;
  }

  const lines: string[] = [];
  let start = 0;
  for (;;) {
    const rest = seg(start);
    const cands = gaps.filter((g) => g > start);
    const atCap = cap != null && lines.length >= cap - 1;

    if (widthOf(rest) <= availPx || cands.length === 0 || atCap) {
      lines.push(rest);
      break;
    }

    // 挑还塞得下的最远那个口子；一个都塞不下就用最近的
    let pick = cands[0]!;
    for (const g of cands) {
      if (widthOf(seg(start, g)) <= availPx) pick = g;
    }
    lines.push(seg(start, pick));
    start = pick;
  }

  const last = lines[lines.length - 1] ?? "";
  if (cap != null && lines.length >= cap && widthOf(last) > availPx) {
    notes.push({ level: "warn", text: `主标题：规范限死 ${cap} 行，断不开了 → 只能缩字号` });
  } else if (lines.length === 1) {
    notes.push({
      level: "info",
      text: gaps.length ? "主标题：一行装得下，不用断" : "主标题：没标断点，只能整行缩放",
    });
  } else {
    notes.push({ level: "info", text: `主标题：一行装不下 → 在标的断点上断成 ${lines.length} 行` });
  }

  return lines;
}

/** 免责在给定框宽下会折成几行 */
export function disclaimerLineCount(
  boxW: number,
  fontPx: number,
  text: string,
  measurer: TextMeasurer,
): number {
  const total = measurer.measure(text, fontPx, "normal");
  return Math.max(1, Math.ceil(total / Math.max(1, boxW)));
}

/**
 * 按钮永远单行。装不下不换行，而是换一条更短的文案 —— 这是文案规则不是排版规则。
 * `full` = 通栏按钮，宽度等于内容区，长版必定装得下。
 */
export function pickCta(
  availPx: number,
  fontPx: number,
  full: boolean,
  content: SolveContent,
  measurer: TextMeasurer,
  notes: SolveNote[],
): string {
  if (full) {
    notes.push({ level: "info", text: "按钮：通栏（宽 = 板宽 − 边距），长版必定装得下" });
    return content.ctaLong;
  }
  if (measurer.measure(content.ctaLong, fontPx, "bold") + fontPx * 2.4 <= availPx) {
    notes.push({ level: "info", text: "按钮：文字撑宽，长版装得下" });
    return content.ctaLong;
  }
  notes.push({ level: "info", text: "按钮：长版装不下 → 自动换短版" });
  return content.ctaShort;
}

/** 按钮实际宽度：文字墨迹宽 + 左右内边距 */
export function ctaWidth(label: string, fontPx: number, measurer: TextMeasurer): number {
  return measurer.measure(label, fontPx, "bold") + fontPx * 2.6;
}
