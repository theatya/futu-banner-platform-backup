# 资源位自动延展平台

内容 + 画幅 → 求解版式 → 写进 Figma。

核心逻辑在 `packages/`，不依赖 Next.js。Web 只是第一层壳，以后迁桌面端换 `apps/` 即可。

## 本地运行

```bash
cd platform
pnpm install
pnpm --filter @futu/web dev
```

浏览器打开 http://localhost:3210

## 写回 Figma（本地开发插件）

Figma REST API 不支持直接修改画布，因此写入通过本仓库内的开发插件完成：

1. 在 Figma Desktop 打开包含主视觉组件的文件，并依次选择 `Plugins → Development → Import plugin from manifest…`，选择 `figma-plugin/manifest.json`。
2. 在平台第一步分别识别母版画板和主视觉 `Component / Instance` 链接。
3. 到第四步复制配对码，打开开发插件，填入本地平台地址（默认 `http://127.0.0.1:3210`）和配对码后连接。
4. 保持插件窗口开启，在平台点击生成。插件会创建画板并放入主视觉组件的实例。

首个版本仅支持在包含该组件的同一 Figma 文件中运行插件；跨文件团队库组件导入尚未接入。

## 包怎么分

| 包 | 干什么 |
| --- | --- |
| `@futu/domain` | 类型和常量，零运行时依赖 |
| `@futu/solver` | 版面求解器，纯函数 |
| `@futu/specs` | 尺寸清单 + 站内规范 |
| `@futu/ports` | 端口接口，没有实现 |
| `@futu/adapters-web` | 浏览器实现（localStorage / fetch） |
| `@futu/orchestrator` | 把 Project 展开成一批画板并交给写入端口 |
| `@futu/web` | Next.js 界面 |

Figma 写入还没接通（里程碑 M3）。生成那一步会走完整编排，但会如实告诉你「没有写进去」。

## 设计与前端实施

所有界面设计、交互调整和视觉验收统一遵循 [DESIGN_IMPLEMENTATION.md](./DESIGN_IMPLEMENTATION.md)。项目级 Cursor Rule 会自动要求按任务调用 `frontend-design`、`ui-ux-pro-max` 和 `awesome-design-md` 中适用的能力，并在交付时记录实际调用情况。
