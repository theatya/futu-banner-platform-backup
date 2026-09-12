/**
 * 几何与配置补全。
 *
 * 配置是要持久化的，加了新字段之后旧存档里会缺 key。
 * 所有读取点都先过一遍这里的补全函数，缺什么补什么 —— 别让求解器面对 undefined。
 */

import {
  ANCHOR_GRID,
  EXTRA_DEFAULT,
  EXTRA_KIND_META,
  ELEMENT_ORDER,
  MARGIN_DEFAULT,
  SHOW_ALL,
  type ExtraAnchor,
  type ExtraConfig,
  type MarginConfig,
  type Rect,
  type ShowConfig,
} from "@futu/domain";

/** 微调量是百分比不是像素 —— 同一条规则在任何画幅上都成立 */
export function shift(v: number, span: number, d: number): number {
  return Math.max(0, Math.min(1 - span, v + d / 100));
}

/**
 * 按锚点算出浮层元素的归一化矩形。
 * ew/eh/pad 都是真实 px，board 也是真实 px。
 */
export function anchorRect(
  a: Exclude<ExtraAnchor, "auto">,
  ew: number,
  eh: number,
  boardW: number,
  boardH: number,
  pad: number,
  ex: ExtraConfig,
): Rect {
  const row = a[0] as "t" | "m" | "b";
  const col = a[1] as "l" | "c" | "r";
  const xs = { l: pad, c: (boardW - ew) / 2, r: boardW - pad - ew };
  const ys = { t: pad, m: (boardH - eh) / 2, b: boardH - pad - eh };
  const w = ew / boardW;
  const h = eh / boardH;
  return {
    x: shift(xs[col] / boardW, w, ex.dx),
    y: shift(ys[row] / boardH, h, ex.dy),
    w,
    h,
  };
}

export function overlaps(a: Rect, b: Rect | null): boolean {
  if (!b) return false;
  return !(a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y);
}

/* ------------------------------------------------------------------ */
/* 配置补全                                                            */
/* ------------------------------------------------------------------ */

export function normShow(s?: Partial<ShowConfig> | null): ShowConfig {
  const out = { ...SHOW_ALL };
  for (const k of ELEMENT_ORDER) {
    if (typeof s?.[k] === "boolean") out[k] = s[k];
  }
  return out;
}

function clampNudge(v?: number | null): number {
  return typeof v === "number" && v >= -30 && v <= 30 ? v : 0;
}

export function normExtra(e?: Partial<ExtraConfig> | null): ExtraConfig {
  return {
    place: e?.place === "pin" ? "pin" : "flow",
    after: e?.after && ELEMENT_ORDER.includes(e.after) ? e.after : EXTRA_DEFAULT.after,
    kind: e?.kind && e.kind in EXTRA_KIND_META ? e.kind : EXTRA_DEFAULT.kind,
    anchor:
      e?.anchor && (e.anchor === "auto" || ANCHOR_GRID.includes(e.anchor))
        ? e.anchor
        : EXTRA_DEFAULT.anchor,
    size: typeof e?.size === "number" && e.size >= 4 && e.size <= 45 ? e.size : EXTRA_DEFAULT.size,
    align:
      e?.align === "start" || e?.align === "end" || e?.align === "center"
        ? e.align
        : EXTRA_DEFAULT.align,
    dx: clampNudge(e?.dx),
    dy: clampNudge(e?.dy),
  };
}

export function normMargin(m?: number | Partial<MarginConfig> | null): MarginConfig {
  // 早期存档里这里是一个小数（0.07），后来改成对象，两种都得认
  if (typeof m === "number") {
    const pct = m <= 1 ? m * 100 : m;
    return { x: pct, y: pct, bias: 0 };
  }
  const n = (v: unknown, d: number, lo: number, hi: number) =>
    typeof v === "number" && v >= lo && v <= hi ? v : d;
  return {
    x: n(m?.x, MARGIN_DEFAULT.x, 0, 24),
    y: n(m?.y, MARGIN_DEFAULT.y, 0, 24),
    bias: n(m?.bias, 0, -100, 100),
  };
}

export function nudgeNote(ex: ExtraConfig): string {
  const bits: string[] = [];
  if (ex.dx) bits.push(`${ex.dx > 0 ? "右" : "左"}移 ${Math.abs(ex.dx)}% 板宽`);
  if (ex.dy && ex.place === "pin") {
    bits.push(`${ex.dy > 0 ? "下" : "上"}移 ${Math.abs(ex.dy)}% 板高`);
  }
  return bits.length ? `，再${bits.join("、")}` : "";
}

export function biasNote(b: number): string {
  if (!b) return "";
  return `，竖向${b < 0 ? "偏上" : "偏下"} ${Math.abs(b)}`;
}
