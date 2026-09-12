"use client";

import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { NumberField } from "./field";

/**
 * 带可编辑数值的滑块。
 *
 * 底层是原生 `<input type="range">` —— 键盘操作、屏幕阅读器、触屏都是浏览器给的，
 * 自己用 div 造一个只会更难用。视觉全部重绘，原生外观已抹掉。
 */
export function Slider({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix,
  hint,
  className,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  hint?: string;
  className?: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="w-[68px] shrink-0">
        <div className="text-[11px] font-medium text-[var(--app-text-2)] leading-tight">{label}</div>
        {hint ? (
          <div className="text-[10px] text-[var(--app-text-4)] leading-tight">{hint}</div>
        ) : null}
      </div>

      <input
        type="range"
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ "--pct": `${pct}%` } as CSSProperties}
        className={cn(
          "flex-1 h-1.5 appearance-none bg-transparent cursor-pointer",
          // 轨道：已走过的部分用品牌色，剩下的用中性线
          "[&::-webkit-slider-runnable-track]:h-1.5 [&::-webkit-slider-runnable-track]:rounded-full",
          "[&::-webkit-slider-runnable-track]:bg-[linear-gradient(to_right,var(--control-active)_var(--pct),var(--app-surface-3)_var(--pct))]",
          "[&::-moz-range-track]:h-1.5 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-[var(--app-surface-3)]",
          "[&::-moz-range-progress]:h-1.5 [&::-moz-range-progress]:rounded-full [&::-moz-range-progress]:bg-[var(--control-active)]",
          // 滑块头
          "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:size-3.5",
          "[&::-webkit-slider-thumb]:-mt-1 [&::-webkit-slider-thumb]:rounded-full",
          "[&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border",
          "[&::-webkit-slider-thumb]:border-[rgb(0_0_0/0.18)]",
          "[&::-webkit-slider-thumb]:shadow-[0_1px_3px_rgb(0_0_0/0.28)]",
          "[&::-webkit-slider-thumb]:transition-transform hover:[&::-webkit-slider-thumb]:scale-110",
          "[&::-moz-range-thumb]:size-3.5 [&::-moz-range-thumb]:rounded-full",
          "[&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0",
        )}
      />

      <NumberField
        ariaLabel={`${label} 数值`}
        value={value}
        onCommit={onChange}
        min={min}
        max={max}
        step={step}
        suffix={suffix}
        className="w-[74px] shrink-0"
      />
    </div>
  );
}
