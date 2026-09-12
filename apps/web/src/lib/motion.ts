"use client";

/**
 * 动效基线。
 *
 * 所有动画都从这里取参数，别在组件里散写时长和曲线 ——
 * 散写的后果是每个组件的节奏都差一点，整体就显得毛躁。
 *
 * `prefers-reduced-motion` 的处理策略不是「全关」，而是**去掉位移、保留淡入**：
 * 全关会让用户失去状态变化的反馈，反而更难用。
 */

import { useReducedMotion, type Transition, type Variants } from "motion/react";

export const EASE_OUT = [0.22, 1, 0.36, 1] as const;
export const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const;

export const T_FAST: Transition = { duration: 0.12, ease: EASE_OUT };
export const T_BASE: Transition = { duration: 0.2, ease: EASE_OUT };
export const T_SLOW: Transition = { duration: 0.32, ease: EASE_OUT };

/** 一组元素依次淡入，用于列表 / 卡片网格 */
export function useStagger(step = 0.035) {
  const reduced = useReducedMotion();
  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: reduced ? 0 : step } },
  };
  const item: Variants = {
    hidden: { opacity: 0, y: reduced ? 0 : 6 },
    show: { opacity: 1, y: 0, transition: T_BASE },
  };
  return { container, item };
}

/** 步骤之间的切换：横向推移；减弱动效时退化为纯淡入 */
export function useStepTransition(dir: 1 | -1) {
  const reduced = useReducedMotion();
  const d = reduced ? 0 : 18 * dir;
  return {
    initial: { opacity: 0, x: d },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -d },
    transition: T_BASE,
  };
}
