"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { LANGS, resolvedTitleBreaks, sizeKey } from "@futu/domain";
import { generate, planBoards, preflight } from "@futu/orchestrator";
import { createWebPorts } from "@futu/adapters-web";
import { T_BASE, useStagger } from "@/lib/motion";
import { useStudio } from "@/lib/studio-store";
import { BoardPreview } from "@/components/board/board-preview";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/note";
import { Band, Panel, SectionTitle } from "@/components/ui/panel";
import { Segmented } from "@/components/ui/segmented";
import { buildSolveContent } from "@futu/solver";

const ports = createWebPorts();

export function StepGenerate() {
  const { project, lang } = useStudio();
  const [page, setPage] = useState<"new" | "current">("new");
  const [arrange, setArrange] = useState<"group" | "lang" | "flat">("group");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<Awaited<ReturnType<typeof generate>> | null>(null);

  const plans = useMemo(() => planBoards(project), [project]);
  const issues = useMemo(() => preflight(plans), [plans]);
  const boards = plans.length;
  const copy = project.content.copy[lang];
  const stagger = useStagger(0.02);

  const run = async () => {
    setBusy(true);
    setDone(null);
    try {
      const result = await generate(project, ports.figma, {
        page,
        pageName: project.name,
        arrange,
      });
      setDone(result);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="h-full min-h-0 grid gap-3 lg:gap-4 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_320px] lg:overflow-hidden">
      <Band className="min-h-0 flex flex-col lg:overflow-hidden">
        <SectionTitle>{boards} 块</SectionTitle>
        <motion.div
          variants={stagger.container}
          initial="hidden"
          animate="show"
          className="flex-1 min-h-0 overflow-y-auto grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 content-start"
        >
          {project.targets.map((t) => {
            const plan = plans.find((p) => p.key === t.key && p.lang === lang);
            const s = plan?.solution;
            if (!s || !plan) return null;
            const w = t.w >= t.h ? 180 : 108;
            return (
              <motion.div key={t.key} variants={stagger.item} className="min-w-0">
                <div className="grid place-items-center rounded-[16px] bg-[var(--app-bg)] py-3">
                  <BoardPreview
                    solution={s}
                    content={buildSolveContent(copy, lang, resolvedTitleBreaks(project.content, lang, t.key))}
                    width={w}
                    logo={plan.logo}
                    ctaStyle={plan.ctaStyle}
                    badgeStyle={plan.badgeStyle}
                  />
                </div>
                <div className="mt-1.5 text-[11px] font-medium tabular-nums">{sizeKey(t.w, t.h)}</div>
                <div className="text-[10px] text-[var(--app-text-4)] truncate">{t.use}</div>
              </motion.div>
            );
          })}
        </motion.div>
      </Band>

      <Band className="space-y-5 lg:min-h-0 lg:overflow-y-auto">
        <Panel>
          <SectionTitle>写到 Figma</SectionTitle>
          <div className="space-y-3">
            <div>
              <div className="text-[11px] text-[var(--app-text-3)] mb-1.5">目标页</div>
              <Segmented
                value={page}
                onChange={setPage}
                options={[
                  { id: "new", label: "新建一页" },
                  { id: "current", label: "当前页" },
                ]}
              />
            </div>
            <div>
              <div className="text-[11px] text-[var(--app-text-3)] mb-1.5">排列</div>
              <Segmented
                value={arrange}
                onChange={setArrange}
                options={[
                  { id: "group", label: "按尺寸" },
                  { id: "lang", label: "按语种" },
                  { id: "flat", label: "平铺" },
                ]}
              />
            </div>
            <p className="text-[11px] text-[var(--app-text-4)]">写入未接通，先走编排。</p>
            <Button variant="primary" block disabled={busy || boards === 0} onClick={run}>
              {busy ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> 正在编排 {boards} 块…
                </>
              ) : (
                `在 Figma 里生成 ${boards} 块画板`
              )}
            </Button>
          </div>
        </Panel>

        {issues.length > 0 ? (
          <Panel>
            <SectionTitle>{issues.length} 条需要看见</SectionTitle>
            <ul className="space-y-1.5">
              {issues.slice(0, 8).map((n, i) => (
                <li key={`${n.key}-${n.lang}-${i}`} className="flex items-start gap-2 text-[12px]">
                  <AlertTriangle size={12} className="mt-0.5 text-[var(--color-warn)] shrink-0" />
                  <span className="text-[var(--app-text-2)]">
                    <Chip className="mr-1.5">
                      {n.key} · {LANGS.find((l) => l.id === n.lang)?.name}
                    </Chip>
                    {n.text}
                  </span>
                </li>
              ))}
            </ul>
          </Panel>
        ) : null}

        <AnimatePresence>
          {done ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={T_BASE}
            >
              <Panel>
                <div className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-[var(--color-down)] mt-0.5" />
                  <div>
                    <div className="text-[13px] font-semibold">编排跑完了，但画板没有写进 Figma</div>
                    <p className="text-[12px] text-[var(--app-text-3)] mt-1 leading-relaxed">
                      {done.result.failures.length} 块按预期失败：写入链路还没接通。
                      求解结果已经齐了，M3 接通之后这里会变成真正的节点 ID。
                    </p>
                  </div>
                </div>
              </Panel>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </Band>
    </div>
  );
}
