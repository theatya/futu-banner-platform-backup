"use client";

import { presetLogo, type AssetRef, type LibraryLogoPreset, type LogoPreset } from "@futu/domain";
import { cn } from "@/lib/utils";

export const LOGO_PRESET_OPTIONS: ReadonlyArray<{ id: LibraryLogoPreset; label: string }> = [
  { id: "futu", label: "富途 · 深色背景" },
  { id: "moomoo", label: "moomoo · 深色背景" },
  { id: "futuLight", label: "富途 · 浅色背景" },
  { id: "moomooLight", label: "moomoo · 浅色背景" },
  { id: "futuWhite", label: "富途 · 纯白" },
  { id: "moomooWhite", label: "moomoo · 纯白" },
  { id: "futuNasdaq", label: "富途 × Nasdaq · 深色背景" },
  { id: "moomooNasdaq", label: "moomoo × Nasdaq · 深色背景" },
  { id: "futuNasdaqLight", label: "富途 × Nasdaq · 浅色背景" },
  { id: "moomooNasdaqLight", label: "moomoo × Nasdaq · 浅色背景" },
];

const ASSET_ROOT = "/brand/presets";

function FutuNasdaq({ light }: { light: boolean }) {
  const suffix = light ? "light" : "dark";
  return (
    <span className="relative block aspect-[490/49.547] w-full" aria-hidden="true">
      <img src={`${ASSET_ROOT}/combo-futu-${suffix}-brand.svg`} alt="" className="absolute inset-y-0 left-0 h-full w-[55.56%]" />
      <img src={`${ASSET_ROOT}/combo-futu-${suffix}-x.svg`} alt="" className="absolute left-[50.83%] top-[28.72%] h-[40.87%] w-[4.14%]" />
      <img src={`${ASSET_ROOT}/combo-futu-${suffix}-nasdaq.svg`} alt="" className="absolute left-[57.64%] top-[3.01%] h-[93.83%] w-[33.38%]" />
    </span>
  );
}

function MoomooNasdaq({ light }: { light: boolean }) {
  const suffix = light ? "light" : "dark";
  return (
    <span className="flex aspect-[477.472/49.55] w-full items-center gap-[2.93%]" aria-hidden="true">
      <img src={`${ASSET_ROOT}/combo-moomoo-${suffix}-brand.svg`} alt="" className="h-full w-[62.82%]" />
      <img src={`${ASSET_ROOT}/combo-moomoo-${suffix}-nasdaq.svg`} alt="" className="h-[93.82%] w-[34.25%]" />
    </span>
  );
}

export function LogoPresetPreview({
  preset,
  asset,
  className,
}: {
  preset?: LogoPreset;
  asset?: AssetRef;
  className?: string;
}) {
  const resolvedPreset = preset ?? LOGO_PRESET_OPTIONS.find((option) => presetLogo(option.id).id === asset?.id)?.id;
  const libraryAsset = resolvedPreset && resolvedPreset !== "custom" ? presetLogo(resolvedPreset) : undefined;
  const preview = asset?.previewUrl ?? libraryAsset?.previewUrl;
  const label = asset?.name ?? libraryAsset?.name ?? "Logo";

  return (
    <span
      role="img"
      aria-label={label}
      className={cn("flex min-h-8 w-full items-center justify-center overflow-hidden", className)}
    >
      {resolvedPreset === "futuNasdaq" ? <FutuNasdaq light={false} /> : null}
      {resolvedPreset === "futuNasdaqLight" ? <FutuNasdaq light /> : null}
      {resolvedPreset === "moomooNasdaq" ? <MoomooNasdaq light={false} /> : null}
      {resolvedPreset === "moomooNasdaqLight" ? <MoomooNasdaq light /> : null}
      {!resolvedPreset?.includes("Nasdaq") && preview ? (
        <img src={preview} alt="" className="block max-h-full max-w-full object-contain" />
      ) : null}
      {(!resolvedPreset || resolvedPreset === "custom") && !preview ? (
        <span className="truncate text-[9px] text-[var(--app-text-3)]">{label}</span>
      ) : null}
    </span>
  );
}
