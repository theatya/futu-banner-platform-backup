"use client";

import { Check, Link2, Upload } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import { logoOf, logoPresetOf, withLangLogo, type AssetRef, type Content, type Lang, type LogoPreset } from "@futu/domain";
import { parseFigmaUrl } from "@/lib/figma-link";
import { Button } from "@/components/ui/button";
import { LOGO_PRESET_OPTIONS, LogoPresetPreview } from "@/components/logo-preset-preview";
import { cn } from "@/lib/utils";

const LOGO_PRESETS: { id: LogoPreset; label: string }[] = [
  ...LOGO_PRESET_OPTIONS,
  { id: "custom", label: "自定义" },
];

export function FigmaLinkRow({
  action,
  placeholder,
  bound,
  onBind,
  compact = false,
  preview,
}: {
  label?: string;
  hint?: string;
  action: string;
  placeholder: string;
  bound?: AssetRef;
  onBind: (asset: AssetRef) => void;
  compact?: boolean;
  preview?: ReactNode;
}) {
  const [draft, setDraft] = useState(bound?.figmaUrl ?? "");
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(!bound?.figmaUrl);
  const submit = () => {
    const parsed = parseFigmaUrl(draft);
    if (!parsed.ok) return setError(parsed.reason);
    setError(null);
    onBind({
      id: parsed.nodeId ? `figma-${parsed.nodeId}` : `figma-${Date.now()}`,
      name: parsed.name,
      source: "figma",
      kind: "component",
      figmaUrl: parsed.url,
    });
    setEditing(false);
  };

  return (
    <div>
      <div className={cn("flex gap-3 items-center", compact && "items-start")}>
        {preview}
        <div className="flex-1 min-w-0 flex gap-2">
          {bound?.figmaUrl && !editing ? (
            <button
              type="button"
              title="更换链接"
              onClick={() => setEditing(true)}
              className="flex-1 min-w-0 h-10 px-3 flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--app-surface)] text-left"
            >
              <Link2 size={14} className="shrink-0 text-[var(--app-text-4)]" />
              <span className="text-[13px] font-medium text-[var(--app-text)] truncate">{bound.name}</span>
            </button>
          ) : (
            <label className="flex-1 min-w-0 relative">
              <Link2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--app-text-4)]" />
              <input
                value={draft}
                onChange={(event) => {
                  setDraft(event.target.value);
                  setError(null);
                }}
                onKeyDown={(event) => event.key === "Enter" && submit()}
                placeholder={placeholder}
                className="w-full h-10 pl-9 pr-3 text-[13px] rounded-[var(--radius-md)] bg-[var(--app-surface)] text-[var(--app-text)] placeholder:text-[var(--app-text-4)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-line)]"
              />
            </label>
          )}
          <Button variant="secondary" size="md" onClick={submit}>
            {bound?.figmaUrl && !editing ? `重新${action}` : action}
          </Button>
        </div>
      </div>
      {error ? <p className="mt-1.5 text-[11px] text-[var(--color-up)]">{error}</p> : null}
    </div>
  );
}

export function LogoBind({
  content,
  lang,
  onChange,
  onLangChange,
  single = false,
}: {
  content: Content;
  lang: Lang;
  onChange: (patch: Partial<Content>) => void;
  onLangChange?: (lang: Lang) => void;
  single?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-start gap-2">
      {(single ? [lang] : content.langs).map((id) => (
        <LangLogoRow
          key={id}
          content={content}
          id={id}
          hideLang={single}
          onFocus={() => onLangChange?.(id)}
          onChange={onChange}
        />
      ))}
    </div>
  );
}

function LangLogoRow({
  content,
  id,
  hideLang,
  onFocus,
  onChange,
}: {
  content: Content;
  id: Lang;
  hideLang: boolean;
  onFocus: () => void;
  onChange: (patch: Partial<Content>) => void;
}) {
  const logo = logoOf(content, id);
  const preset = logoPresetOf(content, id);
  const fileRef = useRef<HTMLInputElement>(null);
  const [via, setVia] = useState<"figma" | "upload">(logo?.source === "upload" ? "upload" : "figma");
  const pick = (next: LogoPreset) => {
    onFocus();
    onChange(
      withLangLogo(
        content,
        id,
        next === "custom"
          ? { preset: next, logo: logo?.source === "library" ? undefined : logo }
          : { preset: next },
      ),
    );
  };
  const onUpload = (file?: File) => {
    if (file) {
      onChange(
        withLangLogo(content, id, {
          preset: "custom",
          logo: {
            id: `upload-${file.name}`,
            name: file.name,
            source: "upload",
            kind: "image",
            previewUrl: URL.createObjectURL(file),
          },
        }),
      );
    }
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 gap-2">
        {LOGO_PRESETS.map((option) => {
          const selected = preset === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => pick(option.id)}
              className={cn(
                "relative min-h-[66px] rounded-[5px] border p-2 text-left",
                selected
                  ? "border-[var(--color-brand)] bg-[var(--app-surface-3)]"
                  : "border-[var(--app-line)] bg-[var(--app-surface-2)] text-[var(--app-text-2)]",
              )}
            >
              {selected ? (
                <span className="absolute -top-1 -right-1 size-4 rounded-full bg-[var(--color-brand)] text-white grid place-items-center">
                  <Check size={9} strokeWidth={3} />
                </span>
              ) : null}
              {option.id === "custom" ? (
                <span className="flex h-8 items-center justify-center text-[10px]">{option.label}</span>
              ) : (
                <LogoPresetPreview preset={option.id} className="h-8 rounded-[3px] bg-[#444] px-2" />
              )}
              <span className="mt-1 block truncate text-center text-[8px] text-[var(--app-text-4)]">{option.label}</span>
            </button>
          );
        })}
        {!hideLang && logo?.name ? (
          <span className="truncate text-[11px] text-[var(--app-text-4)]">{logo.name}</span>
        ) : null}
      </div>
      {preset === "custom" ? (
        <div className="mt-3 space-y-2">
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setVia("figma")}
              className={cn("h-8 px-3 rounded-full text-[12px]", via === "figma" ? "choice-on" : "choice-idle")}
            >
              Figma
            </button>
            <button
              type="button"
              onClick={() => setVia("upload")}
              className={cn("h-8 px-3 rounded-full text-[12px]", via === "upload" ? "choice-on" : "choice-idle")}
            >
              传图
            </button>
          </div>
          {via === "figma" ? (
            <FigmaLinkRow
              action="识别"
              placeholder="https://www.figma.com/design/... ?node-id="
              bound={logo?.source === "figma" ? logo : undefined}
              onBind={(next) => onChange(withLangLogo(content, id, { preset: "custom", logo: next }))}
            />
          ) : (
            <>
              <input
                ref={fileRef}
                type="file"
                accept="image/*,.svg"
                className="sr-only"
                onChange={(event) => onUpload(event.target.files?.[0])}
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full h-20 rounded-[var(--radius-lg)] bg-[var(--app-surface)] text-[var(--app-text-3)] text-[12px] flex items-center justify-center gap-2"
              >
                {logo?.previewUrl ? <img src={logo.previewUrl} alt="" className="h-10 object-contain" /> : <Upload size={16} />}
                {logo?.source === "upload" ? logo.name : "上传 Logo"}
              </button>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
