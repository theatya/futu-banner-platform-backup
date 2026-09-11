"use client";

import { Check, Plus, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  LANGS,
  emptyLangCopy,
  nextUnusedLang,
  titleBreakDefaultNameOf,
  titleStackOf,
  type Lang,
  type LangCopy,
  type TitleBreakVariant,
} from "@futu/domain";
import { useStudio, type EntryMode } from "@/lib/studio-store";
import { Band, SectionTitle } from "@/components/ui/panel";
import { TextArea, TextField } from "@/components/ui/field";
import { FigmaLinkRow, LogoBind } from "./asset-bind";
import { BreakPicker } from "./break-picker";
import { KvPreview } from "./recognize-preview";
import { SourceBoards } from "./source-boards";
import { cn } from "@/lib/utils";

const ENTRIES: { id: EntryMode; name: string; note: string }[] = [
  { id: "pick", name: "从当前画板开始", note: "识别画板文案和元素" },
  { id: "blank", name: "从新的画板开始", note: "重新填写内容" },
];

export function StepContent() {
  const { project, lang, setLang, updateCopy, updateContent, toggleLang, entry, setEntry, addSourceLang, removeSourceLang } =
    useStudio();
  const copy = project.content.copy[lang] ?? emptyLangCopy();
  const activeLangs = project.content.langs;

  const pickBlankLang = (id: Lang) => {
    const on = activeLangs.includes(id);
    if (!on) {
      toggleLang(id);
      setLang(id);
      return;
    }
    if (lang === id) {
      toggleLang(id);
      return;
    }
    setLang(id);
  };

  return (
    <div className="h-full min-h-0 min-w-0 overflow-y-auto pr-1 space-y-4">
      <Band>
        <ModeSwitch value={entry} onChange={setEntry} />
      </Band>

      <Band>
        <SectionTitle>识别主视觉</SectionTitle>
        <FigmaLinkRow
          action="识别"
          placeholder="https://www.figma.com/design/... ?node-id="
          bound={project.content.kv}
          onBind={(kv) => updateContent({ kv })}
          preview={project.content.kv ? <KvPreview kv={project.content.kv} inline /> : null}
        />
      </Band>

      <Band>
        <div className="mb-5">
          <CopyLangTabs
            entry={entry}
            activeLangs={activeLangs}
            value={lang}
            onPick={entry === "blank" ? pickBlankLang : setLang}
            onAdd={entry === "pick" ? addSourceLang : undefined}
            onRemove={entry === "pick" && activeLangs.length > 1 ? removeSourceLang : undefined}
          />
        </div>

        <div className="space-y-5">
          {entry === "pick" ? <SourceBoards /> : null}

          <section className={entry === "pick" ? "pt-4 border-t border-[var(--app-line-soft)]" : undefined}>
            <div className="text-[12px] font-semibold text-[var(--app-text-2)] mb-2">Logo</div>
            <LogoBind content={project.content} lang={lang} onChange={updateContent} onLangChange={setLang} single />
          </section>

          <section className="pt-4 border-t border-[var(--app-line-soft)]">
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField
                label="主标题"
                value={copy.title}
                onChange={(event) => updateCopy(lang, { title: event.target.value })}
              />
              <TextField
                label="副标题"
                value={copy.sub}
                onChange={(event) => updateCopy(lang, { sub: event.target.value })}
              />
            </div>
            <div className="mt-3">
              <TitleBreakPlanEditor key={lang} copy={copy} lang={lang} onChange={(patch) => updateCopy(lang, patch)} />
            </div>
            <div className="grid gap-3 sm:grid-cols-3 mt-3">
              <TextField
                label="按钮 · 长版"
                value={copy.ctaLong}
                onChange={(event) => updateCopy(lang, { ctaLong: event.target.value })}
              />
              <TextField
                label="按钮 · 短版"
                value={copy.ctaShort}
                onChange={(event) => updateCopy(lang, { ctaShort: event.target.value })}
              />
              <TextField
                label="角标"
                value={copy.badge}
                onChange={(event) => updateCopy(lang, { badge: event.target.value })}
              />
            </div>
            <div className="mt-4">
              <TextArea
                label="免责声明"
                rows={2}
                value={copy.disclaimer.map((part) => (typeof part === "string" ? part : part.nb)).join("")}
                onChange={(event) => updateCopy(lang, { disclaimer: [event.target.value] })}
              />
            </div>
          </section>
        </div>
      </Band>
    </div>
  );
}

function ModeSwitch({ value, onChange }: { value: EntryMode; onChange: (id: EntryMode) => void }) {
  return (
    <div role="tablist" aria-label="内容来源" className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {ENTRIES.map((item) => {
        const selected = value === item.id;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(item.id)}
            className={cn(
              "relative min-h-[84px] text-left rounded-[var(--radius-lg)] px-5 py-4",
              selected ? "choice-on" : "bg-[var(--app-surface)]",
            )}
          >
            {selected ? (
              <span className="absolute top-3 right-3 size-5 rounded-full bg-[var(--color-brand)] text-white grid place-items-center">
                <Check size={11} strokeWidth={3} />
              </span>
            ) : null}
            <div className="text-[16px] font-semibold leading-snug pr-7">{item.name}</div>
            <div className="text-[12px] text-[var(--app-text-3)] mt-1.5">{item.note}</div>
          </button>
        );
      })}
    </div>
  );
}

function CopyLangTabs({
  entry,
  activeLangs,
  value,
  onPick,
  onAdd,
  onRemove,
}: {
  entry: EntryMode;
  activeLangs: Lang[];
  value: Lang;
  onPick: (id: Lang) => void;
  onAdd?: () => void;
  onRemove?: (id: Lang) => void;
}) {
  const languages = entry === "blank" ? LANGS : LANGS.filter((item) => activeLangs.includes(item.id));
  const canAdd = Boolean(onAdd && nextUnusedLang(activeLangs));

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-1" role="tablist" aria-label="切换语言文案">
      {languages.map((item) => {
        const enabled = activeLangs.includes(item.id);
        const selected = value === item.id;
        return (
          <div key={item.id} className="inline-flex items-center gap-1">
            <button
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => onPick(item.id)}
              className={cn(
                "pb-1.5 text-[14px] leading-none",
                selected
                  ? "font-semibold text-[var(--app-text)] shadow-[inset_0_-2px_0_0_currentColor]"
                  : enabled
                    ? "font-medium text-[var(--app-text-3)]"
                    : "font-medium text-[var(--app-text-3)] opacity-70",
              )}
            >
              {item.name}
            </button>
            {selected && onRemove ? (
              <button
                type="button"
                aria-label={`去掉${item.name}`}
                onClick={() => onRemove(item.id)}
                className="grid place-items-center text-[var(--app-text-4)]"
              >
                <X size={13} />
              </button>
            ) : null}
          </div>
        );
      })}
      {canAdd ? (
        <button
          type="button"
          aria-label="增加语言"
          onClick={onAdd}
          className="pb-1.5 grid place-items-center text-[var(--app-text-3)]"
        >
          <Plus size={16} />
        </button>
      ) : null}
    </div>
  );
}

function SchemeChip({
  label,
  selected,
  onSelect,
  onRename,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
  onRename: (name: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(label);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editing) return;
    setDraft(label);
    inputRef.current?.focus();
    inputRef.current?.select();
  }, [editing, label]);

  const commit = () => {
    const next = draft.trim();
    if (next && next !== label) onRename(next);
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        aria-label="断行方案名称"
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") commit();
          if (event.key === "Escape") setEditing(false);
        }}
        className={cn(
          "h-8 w-[7.5rem] px-3 rounded-full text-[12px] outline-none",
          selected ? "choice-on" : "choice-idle",
        )}
      />
    );
  }

  return (
    <button
      type="button"
      title="双击修改名称"
      onClick={onSelect}
      onDoubleClick={(event) => {
        event.preventDefault();
        setEditing(true);
      }}
      className={cn("h-8 px-3 rounded-full text-[12px]", selected ? "choice-on" : "choice-idle")}
    >
      {label}
    </button>
  );
}

function TitleBreakPlanEditor({
  copy,
  lang,
  onChange,
}: {
  copy: LangCopy;
  lang: Lang;
  onChange: (patch: Partial<LangCopy>) => void;
}) {
  const stored = copy.titleBreakVariants ?? [];
  const customs: TitleBreakVariant[] = stored.length
    ? stored
    : [{ id: "custom", name: "自定义", breaks: [...copy.titleBreaks] }];
  const [activeId, setActiveId] = useState<"auto" | string>("auto");
  const active = activeId === "auto" ? null : customs.find((item) => item.id === activeId) ?? null;
  const breaks = active?.breaks ?? copy.titleBreaks;

  const persistCustoms = (next: TitleBreakVariant[]) => onChange({ titleBreakVariants: next });
  const ensureStored = () => {
    if (stored.length) return stored;
    persistCustoms(customs);
    return customs;
  };

  const addVariant = () => {
    const list = ensureStored();
    const id = `break-${Date.now()}`;
    persistCustoms([...list, { id, name: `方案 ${list.length + 1}`, breaks: [...breaks] }]);
    setActiveId(id);
  };

  const selectCustom = (id: string) => {
    ensureStored();
    setActiveId(id);
  };

  return (
    <div className="rounded-[var(--radius-xl)] bg-[var(--app-surface)] p-4">
      <div className="flex flex-wrap items-center gap-1.5 mb-4">
        <SchemeChip
          label={titleBreakDefaultNameOf(copy)}
          selected={!active}
          onSelect={() => setActiveId("auto")}
          onRename={(name) => onChange({ titleBreakDefaultName: name })}
        />
        {customs.map((item) => (
          <SchemeChip
            key={item.id}
            label={item.name}
            selected={active?.id === item.id}
            onSelect={() => selectCustom(item.id)}
            onRename={(name) => {
              const list = ensureStored();
              persistCustoms(list.map((variant) => (variant.id === item.id ? { ...variant, name } : variant)));
            }}
          />
        ))}
        <button
          type="button"
          aria-label="增加断行方案"
          onClick={addVariant}
          className="size-8 grid place-items-center rounded-full text-[var(--app-text-3)]"
        >
          <Plus size={14} />
        </button>
        {active ? (
          <button
            type="button"
            aria-label={`删除 ${active.name}`}
            onClick={() => {
              const next = (stored.length ? stored : customs).filter((item) => item.id !== active.id);
              persistCustoms(next);
              setActiveId("auto");
            }}
            className="size-8 grid place-items-center rounded-full text-[var(--app-text-4)]"
          >
            <Trash2 size={14} />
          </button>
        ) : null}
      </div>
      <BreakPicker
        title={copy.title}
        sub={copy.sub}
        lang={lang}
        breaks={breaks}
        stack={titleStackOf(copy)}
        onStackChange={(titleStack) => onChange({ titleStack })}
        onChange={(nextBreaks) => {
          if (!active) {
            onChange({ titleBreaks: nextBreaks });
            return;
          }
          const list = ensureStored();
          persistCustoms(list.map((item) => (item.id === active.id ? { ...item, breaks: nextBreaks } : item)));
        }}
      />
    </div>
  );
}
