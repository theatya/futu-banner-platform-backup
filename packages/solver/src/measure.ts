/**
 * 文字测量
 * ========
 * 交互稿里这一步是假的：`s.length * px * 0.44`，把所有字符当等宽。
 * 中英混排、比例字体下这个假设完全不成立 —— "iii" 和 "WWW" 差三倍宽，
 * 一个中文字约等于两个英文字母。断行和按钮长短全靠它判断，测不准版式就是错的。
 *
 * 所以这里抽成端口，给三种实现：
 *   - CanvasMeasurer  浏览器里用真实字体度量，最准，是 Web 端默认
 *   - ApproxMeasurer  按字符分类估算，不需要字体文件，SSR 和 Node 脚本用
 *   - 未来 OpentypeMeasurer 读品牌字体文件，桌面端 / 批处理用（等拿到字体）
 *
 * 三者可互换，求解器不关心用的是哪个。
 */

export type FontWeight = "normal" | "bold";

export interface TextMeasurer {
  /** 一段文字在给定字号、字重下的墨迹宽度，单位 px */
  measure(text: string, fontPx: number, weight: FontWeight): number;
}

/* ------------------------------------------------------------------ */
/* 估算实现：按字符类别查表                                             */
/* ------------------------------------------------------------------ */

/** 相对字号的字宽系数。数值取自常见无衬线字体（Inter / PingFang）的平均值。 */
const NARROW = new Set("iljI.,;:!|'`()[]{}/\\-");
const WIDE = new Set("WMmw@%");

function charRatio(ch: string): number {
  const code = ch.codePointAt(0) ?? 0;

  // CJK 统一表意文字、假名、全角标点 —— 一律全角
  if (
    (code >= 0x2e80 && code <= 0x9fff) ||
    (code >= 0xac00 && code <= 0xd7af) ||
    (code >= 0xf900 && code <= 0xfaff) ||
    (code >= 0xff00 && code <= 0xff60) ||
    (code >= 0xffe0 && code <= 0xffe6)
  ) {
    return 1.0;
  }

  if (ch === " ") return 0.26;
  if (NARROW.has(ch)) return 0.29;
  if (WIDE.has(ch)) return 0.88;
  if (ch >= "0" && ch <= "9") return 0.55;
  if (ch >= "A" && ch <= "Z") return 0.66;
  if (ch >= "a" && ch <= "z") return 0.5;

  // 其他符号（箭头、货币号等）按中等宽度算
  return 0.55;
}

/**
 * 不依赖任何运行时能力的估算实现。
 * 比交互稿的等宽假设准得多，但仍是估算 —— 生产环境应优先用 CanvasMeasurer。
 */
export class ApproxMeasurer implements TextMeasurer {
  measure(text: string, fontPx: number, weight: FontWeight): number {
    let ratio = 0;
    for (const ch of text) ratio += charRatio(ch);
    // 加粗大约让字宽涨 5%~7%
    return ratio * fontPx * (weight === "bold" ? 1.06 : 1);
  }
}

/* ------------------------------------------------------------------ */
/* 浏览器实现：真实字体度量                                             */
/* ------------------------------------------------------------------ */

/**
 * 用 Canvas 2D 的 measureText 拿真实宽度。
 *
 * 两个要点：
 *  1. 结果按「1px 字号」缓存，再线性放大 —— measureText 对同一字符串重复调用很贵，
 *     而字宽对字号是线性的，量一次就够。
 *  2. 字体没加载完时度量的是 fallback 字体，会偏。调用方应在 `document.fonts.ready`
 *     之后再重新求解一次。
 */
export class CanvasMeasurer implements TextMeasurer {
  private ctx: CanvasRenderingContext2D | null = null;
  private cache = new Map<string, number>();
  private fallback = new ApproxMeasurer();

  constructor(private fontFamily: string) {}

  private getCtx(): CanvasRenderingContext2D | null {
    if (this.ctx) return this.ctx;
    if (typeof document === "undefined") return null;
    const canvas = document.createElement("canvas");
    this.ctx = canvas.getContext("2d");
    return this.ctx;
  }

  measure(text: string, fontPx: number, weight: FontWeight): number {
    const ctx = this.getCtx();
    if (!ctx) return this.fallback.measure(text, fontPx, weight);

    const key = `${weight}\u0000${text}`;
    let unit = this.cache.get(key);
    if (unit === undefined) {
      // 用 100px 量再除以 100，避免小字号下的舍入误差
      ctx.font = `${weight === "bold" ? 600 : 400} 100px ${this.fontFamily}`;
      unit = ctx.measureText(text).width / 100;
      this.cache.set(key, unit);
    }
    return unit * fontPx;
  }

  /** 字体加载完成后调用，丢掉用 fallback 字体量出来的旧值 */
  reset(): void {
    this.cache.clear();
  }
}
