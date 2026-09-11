/**
 * 从现成板识别 —— Figma 读层接通之前，按这条语言已有的文案出表。
 * 点「识别这块板」会把角色灌进该语言，不再永远套英文 demo。
 */

import { disclaimerText, type LangCopy } from "@futu/domain";

export type LayerRole =
  | "sub"
  | "title"
  | "supplement"
  | "titleGroup"
  | "cta"
  | "disc"
  | "kv"
  | "logo"
  | "qrcode"
  | "badge"
  | "custom"
  | "skip";

export const LAYER_ROLES: ReadonlyArray<{ id: LayerRole; label: string }> = [
  { id: "sub", label: "副标题" },
  { id: "title", label: "主标题" },
  { id: "supplement", label: "补充标题" },
  { id: "titleGroup", label: "标题组" },
  { id: "cta", label: "按钮" },
  { id: "disc", label: "免责" },
  { id: "kv", label: "主视觉" },
  { id: "logo", label: "Logo" },
  { id: "qrcode", label: "二维码" },
  { id: "badge", label: "角标" },
  { id: "custom", label: "自定义" },
];

export type RecognizedLayer = {
  id: string;
  name: string;
  /** 灌进文案表用的完整文本，图层名可能被截断 */
  text: string;
  reason: string;
  role: LayerRole;
  uncertain?: boolean;
};

export const DEMO_SOURCE_BOARD = {
  name: "Dsp ads-1920×1080",
  kind: "FRAME",
  layers: 7,
  note: "无组件关系",
};

function clip(s: string, n = 32): string {
  const t = s.trim();
  if (!t) return "";
  return t.length > n ? `${t.slice(0, n - 1)}…` : t;
}

export function sameLayerText(a?: string, b?: string): boolean {
  const left = (a ?? "").replace(/\s+/g, " ").trim();
  const right = (b ?? "").replace(/\s+/g, " ").trim();
  return Boolean(left) && left === right;
}

export function layersForLang(input: {
  copy: LangCopy;
  kvName?: string;
  logoName?: string;
  /** 当前识别的源画板名。整板 / 文件名不能当成主视觉 */
  sourceName?: string;
}): RecognizedLayer[] {
  const title = input.copy.title.trim();
  const sub = input.copy.sub.trim();
  const disc = disclaimerText(input.copy.disclaimer).trim();
  const layers: RecognizedLayer[] = [];

  if (title) {
    layers.push({
      id: "title",
      name: clip(title),
      text: title,
      reason: "全板最大字号",
      role: "title",
    });
  }

  if (sub && !sameLayerText(sub, title)) {
    layers.push({
      id: "sub",
      name: clip(sub),
      text: sub,
      reason: "紧贴主标题上方，字号小一档",
      role: "sub",
    });
  }

  if (input.copy.supplement?.trim()) {
    layers.push({
      id: "supplement",
      name: clip(input.copy.supplement),
      text: input.copy.supplement,
      reason: "主副标题外的补充标题",
      role: "supplement",
    });
  }

  if (input.copy.ctaLong.trim()) {
    layers.push({
      id: "cta",
      name: clip(input.copy.ctaLong),
      text: input.copy.ctaLong,
      reason: "有填充 + 圆角 + 内含短文本",
      role: "cta",
    });
  }

  if (disc) {
    layers.push({
      id: "disc",
      name: clip(disc),
      text: disc,
      reason: "最小字号 + 贴底 + 以 * 开头",
      role: "disc",
    });
  }

  const kvName = input.kvName?.trim();
  if (kvName && !sameLayerText(kvName, input.sourceName)) {
    layers.push({
      id: "kv",
      name: kvName,
      text: kvName,
      reason: "已单独绑定的主视觉，不是整块画板",
      role: "kv",
    });
  }

  if (input.logoName?.trim()) {
    layers.push({
      id: "logo",
      name: input.logoName,
      text: input.logoName,
      reason: "命中 Logo 图形库",
      role: "logo",
    });
  }

  if (input.copy.badge.trim()) {
    layers.push({
      id: "badge",
      name: clip(input.copy.badge),
      text: input.copy.badge,
      reason: "贴角 + 层级最高",
      role: "badge",
    });
  }

  return layers;
}

export function defaultRoles(layers: readonly RecognizedLayer[] = []): Record<string, LayerRole> {
  return Object.fromEntries(layers.map((l) => [l.id, l.role]));
}

/** @deprecated 用 layersForLang；留下给旧引用 */
export const DEMO_LAYERS: RecognizedLayer[] = layersForLang({
  copy: {
    sub: "Transfer to Earn",
    title: "3% Match Cash Coupon +8.1% APY",
    titleBreaks: [2, 4],
    ctaLong: "Download  →",
    ctaShort: "Download",
    badge: "Welcome bonus",
    disclaimer: ["*New user promo subject to terms & conditions."],
  },
  kvName: "KV / Transfer-to-Earn",
  logoName: "moomoo",
  sourceName: "tya的草稿",
});
