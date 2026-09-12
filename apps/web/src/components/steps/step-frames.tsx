"use client";

import { Lock } from "lucide-react";
import { useMemo } from "react";
import {
  CTA_STYLE_PRESETS,
  ELEMENT_LABEL,
  TOGGLE_ORDER,
  badgeStyleOf,
  ctaStyleOf,
  frameLogoOf,
  presetLogo,
  resolvedTitleBreaks,
  sizeKey,
  sourceFrameOf,
  type FrameStyleOverride,
  type LibraryLogoPreset,
} from "@futu/domain";
import { buildSolveContent, solve } from "@futu/solver";
import { RATIO_PRESETS, SIZE_GROUPS, specOf } from "@futu/specs";
import { useFitBoard } from "@/lib/use-fit-board";
import { useStudio } from "@/lib/studio-store";
import { BoardPreview } from "@/components/board/board-preview";
import { Button, WorkflowSparkle } from "@/components/ui/button";
import { LOGO_PRESET_OPTIONS, LogoPresetPreview } from "@/components/logo-preset-preview";
import { Chip, NoteList } from "@/components/ui/note";
import { Band, Panel, SectionTitle } from "@/components/ui/panel";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export function StepFrames() {
  const {
    project,
    lang,
    setStep,
    updateContent,
    focusKey,
    setFocusKey,
    setTargets,
    patchFocus,
    applySharedToAll,
    applyDraftToFocus,
    discardDraft,
    focusCfg,
    focusOverridden,
    hasDraft,
  } = useStudio();

  const selected = new Set(project.targets.map((t) => t.key));
  const focus = project.targets.find((t) => t.key === focusKey) ?? project.targets[0];
  const copy = project.content.copy[lang];
  const lookup = focus ? specOf(focus.w, focus.h) : null;
  const titleBreaks = focus ? resolvedTitleBreaks(project.content, lang, focus.key) : null;
  const activeSourceFrame = sourceFrameOf(project.content, lang);
  const layoutPresets = (project.content.copyLayoutPresets?.[lang] ?? []).filter((preset) =>
    !preset.sourceFrameId
    || !activeSourceFrame
    || preset.sourceFrameId === activeSourceFrame.id
    || preset.sourceFrameId.endsWith(`:${activeSourceFrame.id}`),
  );
  const storedLayoutAssignment = focus
    ? project.content.copyLayoutAssignments?.[lang]?.[focus.key]
    : undefined;
  const layoutAssignment = storedLayoutAssignment
    && layoutPresets.some((preset) => preset.id === storedLayoutAssignment)
    ? storedLayoutAssignment
    : "master";
  const frameOverride = focus ? project.content.frameStyleOverrides?.[lang]?.[focus.key] : undefined;
  const activeCtaStyle = focus ? ctaStyleOf(project.content, lang, focus.key) : undefined;
  const activeBadgeStyle = focus ? badgeStyleOf(project.content, lang, focus.key) : undefined;
  const activeLogo = focus ? frameLogoOf(project.content, lang, focus.key) : undefined;

  const patchFrameStyle = (patch: Partial<FrameStyleOverride>) => {
    if (!focus) return;
    const byLang = { ...(project.content.frameStyleOverrides?.[lang] ?? {}) };
    const next = { ...(byLang[focus.key] ?? {}), ...patch };
    Object.keys(next).forEach((key) => {
      if (next[key as keyof FrameStyleOverride] === undefined) delete next[key as keyof FrameStyleOverride];
    });
    if (Object.keys(next).length) byLang[focus.key] = next;
    else delete byLang[focus.key];
    updateContent({
      frameStyleOverrides: {
        ...project.content.frameStyleOverrides,
        [lang]: byLang,
      },
    });
  };

  const solution = useMemo(() => {
    if (!focus) return null;
    return solve({
      board: { w: focus.w, h: focus.h },
      content: buildSolveContent(copy, lang, titleBreaks ?? undefined),
      show: focusCfg.show,
      margin: focusCfg.margin,
      extra: focusCfg.extra,
      spec: lookup?.spec ?? null,
    });
  }, [focus, copy, lang, focusCfg, lookup, titleBreaks]);

  const fit = useFitBoard(focus?.w ?? 1, focus?.h ?? 1);

  const sizeList = (
    <Band className="lg:min-h-0 lg:overflow-y-auto">
      <SectionTitle>尺寸</SectionTitle>
      <div className="space-y-4">
        {SIZE_GROUPS.map((g) => (
          <div key={g.id}>
            <div className="text-[12px] font-semibold mb-2">{g.name}</div>
            <div className="grid grid-cols-2 lg:grid-cols-1 2xl:grid-cols-2 gap-1">
              {g.items.map((item) => {
                const key = sizeKey(item.w, item.h);
                const on = selected.has(key);
                const spec = specOf(item.w, item.h);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      if (!on) {
                        setTargets([...selected, key]);
                        setFocusKey(key);
                        return;
                      }
                      if (focusKey === key && selected.size > 1) {
                        const next = [...selected].filter((k) => k !== key);
                        setTargets(next);
                        return;
                      }
                      setFocusKey(key);
                    }}
                    className={cn(
                      "rounded-[var(--radius-md)] px-2.5 py-2 text-left",
                      on || focusKey === key ? "choice-on" : "choice-idle",
                    )}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[12px] font-semibold tabular-nums">
                        {item.w} × {item.h}
                      </span>
                      {spec?.spec ? <Lock size={11} className="text-[var(--color-brand)]" /> : null}
                    </div>
                    <div className="text-[10px] text-[var(--app-text-3)] mt-0.5 truncate">{item.use}</div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 text-[11px] text-[var(--app-text-4)]">{selected.size} 块</div>
    </Band>
  );

  if (!focus || !solution) {
    return <div className="h-full min-h-0">{sizeList}</div>;
  }

  return (
    <div className="h-full min-h-0 flex flex-col gap-3 lg:grid lg:grid-cols-[240px_minmax(0,1fr)_300px] xl:grid-cols-[260px_minmax(0,1fr)_320px] lg:gap-4">
      {sizeList}

      <Panel className="flex-1 min-h-[280px] lg:min-h-0 flex flex-col">
        <SectionTitle>{focus.use}</SectionTitle>
        <div
          ref={fit.ref}
          className="flex-1 min-h-0 grid place-items-center rounded-[20px] bg-[var(--app-bg)]"
        >
          <BoardPreview
            solution={solution}
            content={buildSolveContent(copy, lang, titleBreaks ?? undefined)}
            width={fit.width}
            extraKind={focusCfg.extra.kind}
            logo={activeLogo}
            ctaStyle={activeCtaStyle}
            badgeStyle={activeBadgeStyle}
          />
        </div>
      </Panel>

      <Band className="space-y-5 lg:min-h-0 lg:overflow-y-auto">
        {lookup?.spec ? (
          <Panel>
            <SectionTitle>站内规范</SectionTitle>
            <div className="space-y-1.5 text-[12px] text-[var(--app-text-2)]">
              {lookup.spec.minPadX != null ? (
                <div className="flex justify-between">
                  <span>左右边距</span>
                  <Chip tone="lock">不小于 {lookup.spec.minPadX}px</Chip>
                </div>
              ) : null}
              {lookup.spec.cta ? (
                <div className="flex justify-between">
                  <span>按钮</span>
                  <Chip tone="lock">
                    {lookup.spec.cta.w}×{lookup.spec.cta.h} · 距右 {lookup.spec.cta.gapRight}
                  </Chip>
                </div>
              ) : null}
              {lookup.spec.maxTitleLines != null ? (
                <div className="flex justify-between">
                  <span>主标题</span>
                  <Chip tone="lock">最多 {lookup.spec.maxTitleLines} 行</Chip>
                </div>
              ) : null}
            </div>
            {lookup.spec.todo.length > 0 ? (
              <p className="mt-3 text-[11px] text-[var(--color-warn)] leading-relaxed">
                录入时有 {lookup.spec.todo.length} 处没定死：{lookup.spec.todo[0]}
              </p>
            ) : null}
          </Panel>
        ) : lookup?.isInApp ? (
          <Panel>
            <p className="text-[12px] text-[var(--color-warn)]">
              这个站内位还没录规范，求解器按站外规则排，请人工核对按钮和安全区。
            </p>
          </Panel>
        ) : null}

        <Panel>
          <SectionTitle>排版方案</SectionTitle>
          <select
            aria-label="当前画幅的排版方案"
            value={layoutAssignment}
            onChange={(event) => {
              const byLang = { ...(project.content.copyLayoutAssignments?.[lang] ?? {}) };
              if (event.target.value === "master") delete byLang[focus.key];
              else byLang[focus.key] = event.target.value;
              updateContent({
                copyLayoutAssignments: {
                  ...project.content.copyLayoutAssignments,
                  [lang]: byLang,
                },
              });
            }}
            className="w-full h-8 rounded-[var(--radius-md)] border border-[var(--app-line)] bg-[var(--app-surface-2)] px-2 text-[12px] text-[var(--app-text)]"
          >
            <option value="master">跟随母版</option>
            {layoutPresets.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.name}
              </option>
            ))}
          </select>
          <p className="mt-2 text-[10px] leading-relaxed text-[var(--app-text-4)]">
            选择第二步保存的标题组方案；位置与 CTA 间距在下方按当前画幅调整。
          </p>
        </Panel>

        <Panel>
          <SectionTitle>元素样式</SectionTitle>
          <div className="space-y-3">
            <label className="block">
              <span className="mb-1 block text-[10px] text-[var(--app-text-3)]">CTA</span>
              <select
                aria-label="当前画幅 CTA 样式"
                value={frameOverride?.ctaStyle?.presetId ?? "inherit"}
                onChange={(event) => {
                  if (event.target.value === "inherit") {
                    patchFrameStyle({ ctaStyle: undefined });
                    return;
                  }
                  const preset = CTA_STYLE_PRESETS.find((item) => item.id === event.target.value);
                  if (preset) patchFrameStyle({
                    ctaStyle: {
                      presetId: preset.id,
                      backgroundColor: preset.backgroundColor,
                      backgroundImage: preset.backgroundImage,
                      textColor: preset.defaultTextColor,
                    },
                  });
                }}
                className="h-8 w-full rounded-[var(--radius-md)] border border-[var(--app-line)] bg-[var(--app-surface-2)] px-2 text-[11px]"
              >
                <option value="inherit">跟随第二步默认</option>
                {CTA_STYLE_PRESETS.map((preset) => <option key={preset.id} value={preset.id}>{preset.name}</option>)}
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-[10px] text-[var(--app-text-3)]">Logo</span>
              <select
                aria-label="当前画幅 Logo"
                value={frameOverride?.logoPreset ?? "inherit"}
                onChange={(event) => {
                  if (event.target.value === "inherit") {
                    patchFrameStyle({ logo: undefined, logoPreset: undefined });
                    return;
                  }
                  const preset = event.target.value as LibraryLogoPreset;
                  patchFrameStyle({ logoPreset: preset, logo: presetLogo(preset) });
                }}
                className="h-8 w-full rounded-[var(--radius-md)] border border-[var(--app-line)] bg-[var(--app-surface-2)] px-2 text-[11px]"
              >
                <option value="inherit">跟随第二步默认</option>
                {LOGO_PRESET_OPTIONS.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
              </select>
              <LogoPresetPreview asset={activeLogo} className="mt-2 h-8 justify-start rounded-[4px] bg-[#444] px-2" />
            </label>

            <div>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-[10px] text-[var(--app-text-3)]">角标</span>
                {frameOverride?.badgeStyle ? (
                  <button type="button" onClick={() => patchFrameStyle({ badgeStyle: undefined })} className="text-[9px] text-[var(--app-text-4)] hover:text-[var(--app-text)]">恢复默认</button>
                ) : null}
              </div>
              <div className="grid grid-cols-3 gap-1">
                {(["left", "center", "right"] as const).map((alignment) => (
                  <button
                    key={alignment}
                    type="button"
                    aria-pressed={activeBadgeStyle?.alignment === alignment}
                    onClick={() => patchFrameStyle({ badgeStyle: { ...activeBadgeStyle!, alignment } })}
                    className={cn("h-7 rounded-[4px] text-[9px]", activeBadgeStyle?.alignment === alignment ? "choice-on" : "choice-idle")}
                  >
                    {alignment === "left" ? "左对齐" : alignment === "center" ? "居中" : "右对齐"}
                  </button>
                ))}
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <label className="flex items-center gap-2 text-[9px] text-[var(--app-text-4)]">
                  <input type="color" aria-label="当前画幅角标背景色" value={activeBadgeStyle?.backgroundColor} onChange={(event) => patchFrameStyle({ badgeStyle: { ...activeBadgeStyle!, backgroundColor: event.target.value } })} className="h-6 w-8 bg-transparent p-0" />
                  背景
                </label>
                <label className="flex items-center gap-2 text-[9px] text-[var(--app-text-4)]">
                  <input type="color" aria-label="当前画幅角标文字色" value={activeBadgeStyle?.textColor} onChange={(event) => patchFrameStyle({ badgeStyle: { ...activeBadgeStyle!, textColor: event.target.value } })} className="h-6 w-8 bg-transparent p-0" />
                  文字
                </label>
              </div>
            </div>
          </div>
        </Panel>

        <Panel>
          <SectionTitle>画幅</SectionTitle>
          <div className="flex flex-wrap gap-1 mb-3">
            {RATIO_PRESETS.map((r) => {
              const on = r.w === focus.w && r.h === focus.h;
              return (
                <button
                  key={r.ratio}
                  type="button"
                  onClick={() => {
                    const key = sizeKey(r.w, r.h);
                    if (!selected.has(key)) setTargets([...selected, key]);
                    setFocusKey(key);
                  }}
                  className={cn(
                    "h-7 px-2 rounded-[var(--radius-sm)] text-[11px] tabular-nums",
                    on ? "choice-on" : "choice-idle",
                  )}
                >
                  {r.ratio}
                </button>
              );
            })}
          </div>
          <Slider
            label="左右"
            value={focusCfg.margin.x}
            min={0}
            max={24}
            step={0.5}
            suffix="%"
            onChange={(x) => patchFocus({ margin: { ...focusCfg.margin, x } })}
          />
          <div className="h-2" />
          <Slider
            label="上下"
            value={focusCfg.margin.y}
            min={0}
            max={24}
            step={0.5}
            suffix="%"
            onChange={(y) => patchFocus({ margin: { ...focusCfg.margin, y } })}
          />
          <div className="h-2" />
          <Slider
            label="竖向"
            value={focusCfg.margin.bias}
            min={-100}
            max={100}
            step={5}
            onChange={(bias) => patchFocus({ margin: { ...focusCfg.margin, bias } })}
          />
        </Panel>

        <Panel>
          <SectionTitle>画板元素</SectionTitle>
          <div className="space-y-0.5">
            {TOGGLE_ORDER.map((k) => (
              <Switch
                key={k}
                checked={k === "title" ? focusCfg.show.title : focusCfg.show[k]}
                label={k === "title" ? "标题组" : ELEMENT_LABEL[k]}
                onChange={(v) => {
                  if (k === "title") {
                    patchFocus({ show: { ...focusCfg.show, title: v, sub: v } });
                  } else {
                    patchFocus({ show: { ...focusCfg.show, [k]: v } as typeof focusCfg.show });
                  }
                }}
              />
            ))}
          </div>
        </Panel>

        <Panel>
          <SectionTitle>排版依据</SectionTitle>
          <NoteList notes={solution.notes} />
          {hasDraft ? (
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="ghost" size="sm" onClick={discardDraft}>
                放弃
              </Button>
              <Button size="sm" onClick={applyDraftToFocus}>
                只改 {focusKey} 这一块
              </Button>
              <Button variant="primary" size="sm" onClick={applySharedToAll}>
                一键应用到全部（{project.targets.length} 块）
              </Button>
            </div>
          ) : (
            <p className="mt-3 text-[11px] text-[var(--app-text-4)]">
              {focusOverridden ? `${focusKey} 单独调过` : `${focusKey} 跟随共用`}
            </p>
          )}
        </Panel>

        <div className="sticky bottom-0 -mx-4 -mb-4 mt-2 flex justify-end gap-2 border-t border-[var(--app-line)] bg-[var(--app-band)] p-4">
          <Button size="lg" onClick={() => setStep(1)}>上一步</Button>
          <Button variant="workflow" size="lg" icon={<WorkflowSparkle />} onClick={() => setStep(3)}>检查全部画幅</Button>
        </div>
      </Band>
    </div>
  );
}
