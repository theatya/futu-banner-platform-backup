/**
 * 把领域里的「内容」翻译成求解器要的形状。
 *
 * 单独拿出来是因为这是**唯一**需要知道「LangCopy 长什么样」的地方 ——
 * 求解器本身只认 SolveContent，将来内容模型怎么改都不会波及求解逻辑。
 */

import { disclaimerText, tokenizeTitle, type Lang, type LangCopy } from "@futu/domain";
import type { SolveContent } from "./text";

export function buildSolveContent(
  copy: LangCopy,
  lang: Lang,
  title?: { breaks: number[]; fixed: boolean; titleStack?: LangCopy["titleStack"]; titleGap?: number },
): SolveContent {
  return {
    lang,
    titleTokens: tokenizeTitle(copy.title, lang),
    titleBreaks: title?.breaks ?? copy.titleBreaks,
    titleBreakFixed: title?.fixed ?? false,
    sub: copy.sub,
    titleStack: title?.titleStack ?? copy.titleStack,
    titleGapPx: title?.titleGap,
    ctaLong: copy.ctaLong,
    ctaShort: copy.ctaShort,
    badge: copy.badge,
    disclaimer: disclaimerText(copy.disclaimer),
  };
}
