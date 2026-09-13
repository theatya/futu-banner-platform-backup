/**
 * 尺寸清单。
 * 这是**数据**不是逻辑：加尺寸、改用途都只动这里，求解器一行不用改。
 */

import type { SizeGroup, SizeItem } from "@futu/domain";

export const SIZE_GROUPS: SizeGroup[] = [
  {
    id: "inapp",
    name: "站内素材",
    note: "APP 与官网配置位 · 已按 Figma 尺寸表跨语言去重",
    items: [
      { id: "s1", w: 1080, h: 225, use: "我的 tab banner" },
      { id: "s2", w: 810, h: 1110, use: "活动弹窗 / 官网侧边栏 banner" },
      { id: "s3", w: 1080, h: 432, use: "活动中心 banner" },
      { id: "s4", w: 1080, h: 540, use: "moo 广场关注 banner" },
      { id: "s5", w: 1080, h: 270, use: "资讯要闻 banner" },
      { id: "s6", w: 1200, h: 500, use: "EDM" },
      { id: "s7", w: 1080, h: 675, use: "任务中心宝箱配图" },
      { id: "s8", w: 80, h: 80, use: "Push 配图" },
      { id: "s9", w: 200, h: 200, use: "分享链接图（小）" },
      { id: "s10", w: 252, h: 252, use: "任务中心奖励 icon" },
      { id: "s11", w: 492, h: 560, use: "官网 iframe 插图（不要 CTA）" },
      { id: "s12", w: 1000, h: 160, use: "官网顶部 banner" },
      { id: "s13", w: 375, h: 78, use: "官网移动端顶部 banner" },
    ],
  },
  {
    id: "external",
    name: "站外素材",
    note: "Paid Ads、KOL 与 Partnership · 已按 Figma 尺寸表去重",
    items: [
      { id: "p1", w: 1200, h: 628, use: "Meta 横版" },
      { id: "p2", w: 1080, h: 1080, use: "方版通投 / KOL 方图" },
      { id: "p3", w: 1080, h: 1920, use: "Story 竖版" },
      { id: "p4", w: 1920, h: 1080, use: "DSP 大横板" },
      { id: "p5", w: 728, h: 90, use: "横幅" },
      { id: "p6", w: 160, h: 600, use: "竖幅" },
      { id: "k1", w: 1200, h: 1500, use: "KOL 主图" },
      { id: "p7", w: 1242, h: 2688, use: "Paid Ads CPP" },
      { id: "p8", w: 1024, h: 500, use: "Paid Ads 横版" },
      { id: "k2", w: 1920, h: 1005, use: "KOL 总奖励横版" },
      { id: "k3", w: 1600, h: 900, use: "KOL 16:9 横版" },
      { id: "k4", w: 800, h: 450, use: "KOL 16:9 横版（小）" },
      { id: "t1", w: 600, h: 400, use: "Partnership EDM hero image" },
      { id: "t2", w: 250, h: 250, use: "DSP ads" },
      { id: "t3", w: 300, h: 50, use: "DSP ads 移动横幅" },
      { id: "t4", w: 300, h: 250, use: "DSP ads" },
      { id: "t5", w: 300, h: 300, use: "DSP ads 方图" },
      { id: "t6", w: 300, h: 600, use: "DSP ads 竖幅" },
      { id: "t7", w: 320, h: 50, use: "DSP ads 移动横幅" },
      { id: "t8", w: 320, h: 480, use: "DSP ads 竖版" },
      { id: "t9", w: 336, h: 280, use: "DSP ads" },
      { id: "t10", w: 480, h: 320, use: "DSP ads 横版" },
      { id: "t11", w: 640, h: 480, use: "DSP ads 横版" },
      { id: "t12", w: 768, h: 1024, use: "DSP ads 竖版" },
      { id: "t13", w: 970, h: 250, use: "DSP ads 超宽横幅" },
      { id: "t14", w: 1200, h: 627, use: "DSP ads 横版" },
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
