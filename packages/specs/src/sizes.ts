/**
 * 尺寸清单。
 * 这是**数据**不是逻辑：加尺寸、改用途都只动这里，求解器一行不用改。
 */

import type { SizeGroup, SizeItem } from "@futu/domain";

export const SIZE_GROUPS: SizeGroup[] = [
  {
    id: "inapp",
    name: "站内素材",
    note: "APP 配置位 · 按钮位置由规范钉死",
    items: [
      { id: "s1", w: 1080, h: 225, use: "我的 tab banner" },
      { id: "s2", w: 750, h: 1000, use: "活动弹窗" },
      { id: "s3", w: 1125, h: 2436, use: "开屏" },
      { id: "s4", w: 686, h: 386, use: "信息流卡片" },
      { id: "s5", w: 1080, h: 1350, use: "行情页推荐位" },
    ],
  },
  {
    id: "external",
    name: "站外素材",
    note: "Paid Ads、KOL 与 Partnership · 排版灵活",
    items: [
      { id: "p1", w: 1200, h: 628, use: "Meta 横版" },
      { id: "p2", w: 1080, h: 1080, use: "方版通投 / KOL 方图" },
      { id: "p3", w: 1080, h: 1920, use: "Story 竖版" },
      { id: "p4", w: 1920, h: 1080, use: "DSP 大横板" },
      { id: "p5", w: 728, h: 90, use: "横幅" },
      { id: "p6", w: 160, h: 600, use: "竖幅" },
      { id: "k1", w: 1200, h: 1500, use: "KOL 主图" },
      { id: "k3", w: 900, h: 1600, use: "KOL 竖图" },
      { id: "t1", w: 300, h: 250, use: "小方图" },
      { id: "t2", w: 336, h: 280, use: "小方图" },
      { id: "t3", w: 970, h: 250, use: "超宽横幅（现在要手排）" },
      { id: "t4", w: 300, h: 50, use: "移动横幅" },
    ],
  },
  {
    id: "custom",
    name: "自定义",
    note: "输入任意画幅尺寸",
    items: [],
  },
];

export const ALL_SIZES: SizeItem[] = SIZE_GROUPS.flatMap((g) => g.items);

export const INAPP_IDS: ReadonlySet<string> = new Set(
  SIZE_GROUPS.find((g) => g.id === "inapp")!.items.map((s) => s.id),
);

/** 常用画幅比预设，用于「画幅」那一步快速切换 */
export const RATIO_PRESETS: ReadonlyArray<{ ratio: string; w: number; h: number; use: string }> = [
  { ratio: "1:1", w: 1080, h: 1080, use: "方版通投" },
  { ratio: "6:5", w: 300, h: 250, use: "小方图" },
  { ratio: "4:5", w: 1080, h: 1350, use: "行情页推荐位" },
  { ratio: "3:4", w: 750, h: 1000, use: "活动弹窗" },
  { ratio: "1.91:1", w: 1200, h: 628, use: "Meta 横版" },
  { ratio: "16:9", w: 1920, h: 1080, use: "DSP 大横板" },
  { ratio: "9:16", w: 1080, h: 1920, use: "Story 竖版" },
  { ratio: "9:19.5", w: 1125, h: 2436, use: "开屏" },
  { ratio: "4:1", w: 970, h: 250, use: "超宽横幅" },
  { ratio: "24:5", w: 1080, h: 225, use: "我的 tab banner" },
];
