param(
  [string]$Target = "E:\A-富途工作\延展工具平台"
)

$ErrorActionPreference = "Stop"
$kitRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$payload = Join-Path $kitRoot "payload"

if (-not (Test-Path (Join-Path $Target "package.json"))) {
  Write-Host "未找到完整平台项目：$Target" -ForegroundColor Red
  Write-Host "请先从同一仓库下载完整版本，或运行："
  Write-Host "  .\install.ps1 -Target `"你的项目目录`""
  exit 1
}

Write-Host "正在安装 Figma 写回链路..."
Copy-Item (Join-Path $payload "*") $Target -Recurse -Force

Push-Location $Target
try {
  corepack pnpm install
} finally {
  Pop-Location
}

$manifest = Join-Path $Target "figma-plugin\manifest.json"
Write-Host ""
Write-Host "安装完成" -ForegroundColor Green
Write-Host "首次使用：在 Figma Desktop 中选择"
Write-Host "Plugins -> Development -> Import plugin from manifest..."
Write-Host "并选择：$manifest" -ForegroundColor Cyan
Write-Host ""
Write-Host "以后双击项目根目录的 start-platform.cmd 启动平台。"
