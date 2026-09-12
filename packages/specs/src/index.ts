import type { SpecLookup } from "@futu/domain";
import { ALL_SIZES, INAPP_IDS } from "./sizes";
import { SPECS } from "./specs";

export { SIZE_GROUPS, ALL_SIZES, INAPP_IDS, RATIO_PRESETS } from "./sizes";
export { SPECS } from "./specs";

/** 按真实尺寸查规范。查不到说明是自定义画幅，排版完全自由。 */
export function specOf(w: number, h: number): SpecLookup | null {
  const item = ALL_SIZES.find((s) => s.w === w && s.h === h);
  if (!item) return null;
  return { item, spec: SPECS[item.id] ?? null, isInApp: INAPP_IDS.has(item.id) };
}

export function sizeById(id: string) {
  return ALL_SIZES.find((s) => s.id === id) ?? null;
}
