# 第一步「识别画板」移植说明

本文用于把当前版本的第一步能力同步到同仓库的另一套开发版本。若对方版本已有独立 UI 改动，应按本文合并逻辑，不建议直接覆盖整个 `platform.tsx`。

## 用户流程

1. 用户按语言分别提供「主视觉组件链接」和「母版画板链接」。
2. 两项识别可以连续点击；后台队列按主视觉、母版顺序串行执行。
3. 识别期间显示识别中、排队中、耗时和取消入口；重新粘贴链接可取消旧任务。
4. 主视觉必须是 Figma Component 或 Instance。母版中的实例通过 `componentId` 自动关联。
5. 用户重新识别主视觉后，系统自动重新识别母版，刷新实例与画板预览。
6. 用户逐层确认映射角色，也可以排除图层或添加自定义识别。
7. 系统读取母版背景色；用户可用 Figma 风格色板、HEX 输入或浏览器吸管修改。
8. 用户点击「确认映射」后进入第二步。

## UI 结构

- 步骤名称统一为「识别画板」。
- 顶部：语言切换；主视觉和母版链接在同一个紧凑区域内。
- 主体三栏：主视觉预览、母版预览、图层映射。
- 只有点击母版中的对应图层时才显示高亮。
- 点击主视觉实例时显示「已关联主视觉组件实例」。
- 映射状态放在每个角色选项后，仅显示已映射项。
- 图层列表有常驻滚动条；自定义识别和背景色位于列表底部。
- 上一步、确认映射位于面板外右下角；第一步的上一步禁用。
- 避免重复标题、外层套框和非必要分割线。

## 数据与行为约束

- `MasterRecognitionSource` 保存主视觉识别结果、母版识别结果、背景色及确认状态。
- 旧任务可能没有背景色字段，读取时必须使用：
  `source.backgroundColor ?? colorToHex(source.result?.frame.backgroundColor)`。
- Figma API 请求使用 `cache: "no-store"`，保证重新识别拿到最新内容。
- 主视觉与母版识别共用串行队列，但拥有独立取消控制器和请求序号。
- 普通图层映射必须排除已关联的主视觉实例。
- 母版背景色写入 `AssetRef.backgroundColor`，供后续画幅扩展填充使用。
- 浏览器吸管使用 `EyeDropper API`；浏览器安全模型不支持像 Figma Desktop 一样展示跟随鼠标的实时 HEX 浮层。

## 关键文件

- `apps/web/src/components/platform.tsx`：第一步 UI、队列、关联、映射、背景色交互。
- `apps/web/src/app/api/figma/recognize/route.ts`：Figma 节点读取、角色推断、预览和背景色识别。
- `apps/web/src/lib/figma-recognition.ts`：识别结果类型。
- `apps/web/src/lib/figma-link.ts`：Figma 链接解析。
- `apps/web/src/lib/recognize.ts`：图层角色定义与识别规则。
- `apps/web/src/lib/studio-store.tsx`：识别状态、持久化及旧数据兼容。
- `apps/web/src/app/globals.css`：映射列表滚动条与全局视觉规范。
- `packages/domain/src/content.ts`：`AssetRef.backgroundColor`。

## 接入检查

- 主视觉、母版可以同时发起，且不会并行冲突。
- 修改 Figma 主视觉并重新识别后，母版预览自动更新。
- 点击不同图层时只高亮当前图层。
- 主视觉实例不会出现在普通映射列表中。
- 自定义角色可以输入名称并保存。
- 图层较多时右栏可以滚动，底部操作仍可用。
- 背景色机器识别、色板、HEX 输入和吸管均可更新值。
- 旧任务打开不报错。
- `pnpm --filter @futu/web typecheck` 与 `pnpm --filter @futu/web build` 通过。
