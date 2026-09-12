"use client";

import type { AssetRef, BadgeStyle, Rect, Solution } from "@futu/domain";
import { EXTRA_KIND_META, type ExtraKind } from "@futu/domain";
import type { SolveContent } from "@futu/solver";
import { LogoPresetPreview } from "@/components/logo-preset-preview";
import { cn } from "@/lib/utils";

/**
 * 画板预览。
 *
 * 求解器输出的是**归一化矩形 + 真实像素字号**，这里只做一件事：乘以缩放比。
 * 所以预览框放大缩小，版式一模一样 —— 交互稿里做不到这点，那版字号是拿预览宽度算的。
 *
 * 这块区域**不加任何玻璃 / 滤镜 / 主题色**。它代表最终交付的广告成品，
 * 必须是像素诚实的：设计师在这儿看到什么，Figma 里就该长什么样。
 */

function box(r: Rect | null): React.CSSProperties | null {
  if (!r) return null;
  return {
    position: "absolute",
    left: `${r.x * 100}%`,
    top: `${r.y * 100}%`,
    width: `${r.w * 100}%`,
    height: `${r.h * 100}%`,
  };
}

export function BoardPreview({
  solution: s,
  content,
  width,
  extraKind = "empty",
  logo,
  ctaStyle,
  badgeStyle,
  className,
}: {
  solution: Solution;
  content: SolveContent;
  /** 预览显示宽度，px */
  width: number;
  extraKind?: ExtraKind;
  /** 这种语言及当前画幅实际使用的 Logo */
  logo?: AssetRef;
  ctaStyle?: { backgroundColor: string; backgroundImage?: string; textColor: string };
  badgeStyle?: BadgeStyle;
  className?: string;
}) {
  const scale = width / s.board.w;
  const height = s.board.h * scale;
  const px = (real: number) => real * scale;
  const left = s.align === "left";
  const badgeAlignment = badgeStyle?.alignment ?? (s.badgeSide === "right" ? "right" : "left");

  return (
    <div
      className={cn("relative overflow-hidden rounded-[var(--radius-sm)]", className)}
      style={{
        width,
        height,
        background: "var(--art-bg)",
        color: "var(--art-fg)",
        // 预览是内容不是界面，字体锁死为通用无衬线，不跟随界面字体设置
        fontFamily: "var(--font-sans)",
      }}
      role="img"
      aria-label={`${s.board.w}×${s.board.h} 画板预览，版式 ${s.layout}`}
    >
      {/* 主视觉 */}
      {s.kv ? (
        <div
          style={{
            ...box(s.kv)!,
            background: "var(--art-kv)",
            borderRadius: Math.max(2, px(s.board.w * 0.012)),
          }}
          className="flex items-center justify-center"
        >
          <span
            style={{ fontSize: Math.max(7, px(s.board.w * 0.026)) }}
            className="tracking-[0.2em] opacity-45 select-none"
          >
            KV
          </span>
        </div>
      ) : null}

      {/* 角标：钉角，不吃边距 */}
      {s.badge ? (
        <div
          style={{
            ...box({
              ...s.badge,
              x: badgeAlignment === "center"
                ? (1 - s.badge.w) / 2
                : badgeAlignment === "right"
                  ? 1 - s.badge.w
                  : 0,
            })!,
            background: badgeStyle?.backgroundColor ?? "var(--art-badge)",
            color: badgeStyle?.textColor,
            borderBottomLeftRadius: badgeAlignment === "center" || badgeAlignment === "right"
              ? Math.max(3, px(s.board.w * 0.018))
              : 0,
            borderBottomRightRadius: badgeAlignment === "center" || badgeAlignment === "left"
              ? Math.max(3, px(s.board.w * 0.018))
              : 0,
          }}
          className="flex items-center justify-center"
        >
          <span
            style={{ fontSize: Math.max(6, px(s.board.h * 0.032)) }}
            className="font-medium opacity-85 whitespace-nowrap px-1"
          >
            {content.badge}
          </span>
        </div>
      ) : null}

      {/* Logo */}
      {s.logo ? (
        <div style={box(s.logo)!} className={cn("flex items-center", left ? "justify-start" : "justify-center")}>
          <LogoPresetPreview asset={logo} className="h-full max-w-full justify-start" />
        </div>
      ) : null}

      {/* 副标题 */}
      {s.sub ? (
        <div
          style={{ ...box(s.sub)!, fontSize: px(s.subPx) }}
          className={cn("flex items-center whitespace-nowrap", left ? "justify-start" : "justify-center")}
        >
          <span style={{ color: "var(--art-muted)" }} className="tracking-[0.04em]">
            {content.sub}
          </span>
        </div>
      ) : null}

      {/* 主标题：逐行渲染，行由求解器决定，不交给 CSS 自动换行 */}
      {s.title ? (
        <div
          style={{ ...box(s.title)!, fontSize: px(s.titlePx), lineHeight: 1.18 }}
          className={cn("flex flex-col justify-start font-bold", left ? "items-start" : "items-center")}
        >
          {s.titleLines.map((line, i) => (
            <span key={i} className="whitespace-nowrap">
              {line}
            </span>
          ))}
        </div>
      ) : null}

      {/* 按钮 */}
      {s.cta ? (
        <div
          style={{
            ...box(s.cta)!,
            backgroundColor: ctaStyle?.backgroundColor ?? "var(--color-brand)",
            backgroundImage: ctaStyle?.backgroundImage,
            borderRadius: Math.max(2, px(s.ctaPx * 0.42)),
          }}
          className="flex items-center justify-center"
        >
          <span
            style={{ fontSize: px(s.ctaPx), color: ctaStyle?.textColor ?? "#14100c" }}
            className="font-semibold whitespace-nowrap"
          >
            {s.ctaLabel}
          </span>
        </div>
      ) : null}

      {/* 免责 */}
      {s.disc ? (
        <div
          style={{ ...box(s.disc)!, fontSize: px(s.discPx), lineHeight: 1.4, color: "var(--art-muted)" }}
          className={cn("overflow-hidden", left ? "text-left" : "text-center")}
        >
          {content.disclaimer}
        </div>
      ) : null}

      {/* 新增元素：虚线占位，明示这是留给你自己放东西的格子 */}
      {s.extra ? (
        <div
          style={{
            ...box(s.extra)!,
            border: `${Math.max(1, px(s.board.w * 0.003))}px dashed var(--art-muted)`,
            borderRadius: Math.max(2, px(s.board.w * 0.01)),
          }}
          className="flex items-center justify-center"
        >
          <span
            style={{ fontSize: Math.max(6, px(s.board.w * 0.022)), color: "var(--art-muted)" }}
            className="select-none"
          >
            {EXTRA_KIND_META[extraKind].label}
          </span>
        </div>
      ) : null}
    </div>
  );
}
