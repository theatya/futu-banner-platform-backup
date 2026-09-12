"use client";

import { useState } from "react";
import { ChevronDown, X } from "lucide-react";
import {
  LANGS,
  emptyLangCopy,
  logoOf,
  sourceFrameOf,
  type Lang,
  type LangCopy,
} from "@futu/domain";
import {
  LAYER_ROLES,
  defaultRoles,
  layersForLang,
  sameLayerText,
  type LayerRole,
  type RecognizedLayer,
} from "@/lib/recognize";
import { useStudio } from "@/lib/studio-store";
import { SectionTitle } from "@/components/ui/panel";
import { FigmaLinkRow } from "./asset-bind";
import { SourceBoardPreview } from "./recognize-preview";
import { cn } from "@/lib/utils";

function copyFromLayers(
  layers: readonly RecognizedLayer[],
  roles: Record<string, LayerRole>,
): Partial<LangCopy> {
  const patch: Partial<LangCopy> = {};
  for (const layer of layers) {
    const role = roles[layer.id] ?? layer.role;
    if (role === "title") patch.title = layer.text;
    if (role === "sub") patch.sub = layer.text;
    if (role === "supplement") patch.supplement = layer.text;
    if (role === "cta") patch.ctaLong = layer.text;
    if (role === "badge") patch.badge = layer.text;
    if (role === "disc") patch.disclaimer = [layer.text];
  }
  return patch;
}

export function SourceBoards() {
  const { project, lang, updateCopy, updateContent, bindSourceFrame } = useStudio();
  const focusFrame = sourceFrameOf(project.content, lang);
  const langName = LANGS.find((l) => l.id === lang)?.name ?? lang;
  const [resultOpen, setResultOpen] = useState(true);
  const [layersByLang, setLayersByLang] = useState<Partial<Record<Lang, RecognizedLayer[]>>>({});
  const [rolesByLang, setRolesByLang] = useState<Partial<Record<Lang, Record<string, LayerRole>>>>({});
  const [skippedByLang, setSkippedByLang] = useState<Partial<Record<Lang, string[]>>>({});

  const focusLayers = layersByLang[lang];
  const skippedIds = skippedByLang[lang] ?? [];
  const visibleLayers = focusLayers?.filter((layer) => !skippedIds.includes(layer.id));
  const skippedLayers = focusLayers?.filter((layer) => skippedIds.includes(layer.id)) ?? [];

  const recognize = (id: Lang, frame: Parameters<typeof bindSourceFrame>[1]) => {
    const copy = project.content.copy[id] ?? emptyLangCopy();
    const layers = layersForLang({
      copy,
      kvName: project.content.kv?.name,
      logoName: logoOf(project.content, id)?.name,
      sourceName: frame.name,
    });
    const roles = defaultRoles(layers);
    setLayersByLang((prev) => ({ ...prev, [id]: layers }));
    setRolesByLang((prev) => ({ ...prev, [id]: roles }));
    setSkippedByLang((prev) => ({ ...prev, [id]: [] }));
    bindSourceFrame(id, frame);
    const patch = copyFromLayers(layers, roles);
    const nextTitle = patch.title ?? copy.title;
    const nextSub = patch.sub ?? copy.sub;
    if (sameLayerText(nextTitle, nextSub)) patch.sub = "";
    updateCopy(id, patch);
  };

  const applyRole = (layerId: string, role: LayerRole) => {
    const layers = layersByLang[lang];
    if (!layers) return;
    const nextRoles = { ...(rolesByLang[lang] ?? defaultRoles(layers)), [layerId]: role };
    setRolesByLang((prev) => ({ ...prev, [lang]: nextRoles }));
    const layer = layers.find((l) => l.id === layerId);
    if (!layer) return;
    if (role === "title") updateCopy(lang, { title: layer.text });
    if (role === "sub") updateCopy(lang, { sub: layer.text });
    if (role === "cta") updateCopy(lang, { ctaLong: layer.text });
    if (role === "badge") updateCopy(lang, { badge: layer.text });
    if (role === "disc") updateCopy(lang, { disclaimer: [layer.text] });
    if (role === "kv") {
      const frame = sourceFrameOf(project.content, lang);
      if (sameLayerText(layer.text, frame?.name)) {
        skipLayer(layerId);
        return;
      }
      updateContent({
        kv: { id: layer.id, name: layer.text, source: "figma", kind: "component" },
      });
    }
    if (role === "skip") skipLayer(layerId);
  };

  const skipLayer = (layerId: string) => {
    const layers = layersByLang[lang];
    if (!layers) return;
    setSkippedByLang((prev) => ({
      ...prev,
      [lang]: [...new Set([...(prev[lang] ?? []), layerId])],
    }));
    setRolesByLang((prev) => ({
      ...prev,
      [lang]: { ...(prev[lang] ?? defaultRoles(layers)), [layerId]: "skip" },
    }));
  };

  const restoreLayer = (layerId: string) => {
    const layers = layersByLang[lang];
    if (!layers) return;
    const layer = layers.find((l) => l.id === layerId);
    setSkippedByLang((prev) => ({
      ...prev,
      [lang]: (prev[lang] ?? []).filter((id) => id !== layerId),
    }));
    if (layer) applyRole(layerId, layer.role);
  };

  const bound = focusFrame;
  const ready = Boolean(focusLayers);

  return (
    <div>
      <SectionTitle>识别画板文案</SectionTitle>
      <FigmaLinkRow
        key={lang}
        compact
        action="识别"
        placeholder="https://www.figma.com/design/... ?node-id="
        bound={bound}
        onBind={(frame) => recognize(lang, frame)}
        preview={
          ready ? (
            <SourceBoardPreview
              project={project}
              lang={lang}
              skippedIds={skippedIds}
              frameName={langName}
              inline
            />
          ) : null
        }
      />

      {focusLayers && focusFrame?.figmaUrl ? (
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[12px] font-medium text-[var(--app-text-2)]">{langName}识别结果</span>
            <button
              type="button"
              aria-expanded={resultOpen}
              aria-label={resultOpen ? "收起识别结果" : "展开识别结果"}
              onClick={() => setResultOpen((open) => !open)}
              className="size-6 grid place-items-center rounded-full bg-[var(--app-text)] text-[var(--app-surface)]"
            >
              <ChevronDown size={13} className={cn(!resultOpen && "-rotate-90")} />
            </button>
          </div>
          {resultOpen ? (
            <div>
              <div className="overflow-x-auto rounded-[var(--radius-lg)] bg-[var(--app-surface)]">
                <table className="w-full text-[12px]">
                  <thead className="text-[var(--app-text-3)]">
                    <tr>
                      <th className="text-left font-medium px-3 py-2">图层</th>
                      <th className="text-left font-medium px-3 py-2 w-[148px]">识别为</th>
                      <th className="w-10" />
                    </tr>
                  </thead>
                  <tbody>
                    {visibleLayers?.map((layer) => {
                      const role = (rolesByLang[lang] ?? defaultRoles(focusLayers))[layer.id] ?? layer.role;
                      return (
                        <tr key={layer.id} className="border-t border-[var(--app-line-soft)]">
                          <td className="px-3 py-1.5 font-medium truncate max-w-[220px]">{layer.name}</td>
                          <td className="px-3 py-1.5">
                            <select
                              aria-label="recognized role"
                              value={role}
                              onChange={(event) => applyRole(layer.id, event.target.value as LayerRole)}
                              className="h-8 w-full rounded-full bg-[var(--app-surface-2)] px-2.5 text-[12px] text-[var(--app-text)]"
                            >
                              {LAYER_ROLES.filter((roleOption) => roleOption.id !== "skip").map((roleOption) => (
                                <option key={roleOption.id} value={roleOption.id}>
                                  {roleOption.label}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-1 py-1.5">
                            <button
                              type="button"
                              aria-label="remove layer"
                              onClick={() => skipLayer(layer.id)}
                              className="size-7 grid place-items-center rounded-full text-[var(--app-text-4)]"
                            >
                              <X size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {skippedLayers.length ? (
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  {skippedLayers.map((layer) => (
                    <button
                      key={layer.id}
                      type="button"
                      onClick={() => restoreLayer(layer.id)}
                      className="h-7 px-2.5 rounded-full text-[11px] bg-[var(--app-surface)] text-[var(--app-text-3)]"
                    >
                      {layer.name}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
