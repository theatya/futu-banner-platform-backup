# 资源位延展平台：设计实施规范

本规范约束平台后续所有界面设计、交互调整、组件实现、视觉评审和体验修复。项目级规则 `.cursor/rules/ui-verification.mdc` 会在每次会话自动加载本规范，不需要用户重复提醒。

## 固定能力来源

- [Anthropic frontend-design](https://github.com/anthropics/claude-code/tree/main/plugins/frontend-design/skills/frontend-design)
  - 本地能力：`.cursor/skills/frontend-design/SKILL.md`
  - 用于明确视觉方向、信息层级、字体、布局、界面文案和自我审美批判。
  - 重点避免无依据的渐变、同质化卡片、装饰性标签和模板化 AI 界面。
- [ui-ux-pro-max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)
  - 本地能力：`.cursor/skills/ui-ux-pro-max/SKILL.md`
  - 用于检索可验证的 UX、无障碍、交互、响应式、图标以及 React／Next.js／Tailwind 实施建议。
  - 查询必须围绕一个明确问题；优先查可观察的体验结果，再查实际技术栈。
- [awesome-design-md](https://github.com/voltagent/awesome-design-md)
  - 本地能力：`.cursor/skills/awesome-design-md/SKILL.md`
  - 本地参考库：`.cursor/design-references/awesome-design-md/design-md/`
  - 用于从真实产品提取层级、密度、排版、表面和交互原则。每次只选一至两个相关产品，不复制其品牌外观。

## 自动调用规则

### 新页面、整页改版或设计系统调整

三个 Skill 都要调用：

1. 用 `frontend-design` 写出产品任务、目标用户、视觉重点和需要避免的模板化表达。
2. 用 `awesome-design-md` 选择一至两个相关参考。工作流工具优先看 Linear、Notion、Superhuman、Airtable；设计工具优先看 Figma、Framer、Miro、Webflow；金融体验可看 Wise、Stripe、Revolut、Coinbase。
3. 用 `ui-ux-pro-max --design-system` 或相关领域查询验证交互、无障碍、响应式与技术栈实现。
4. 把结论转换为富途现有 token 和组件规则后再实现，不直接套用外部配色或组件造型。

### 局部组件、布局或交互修复

按问题调用适合的能力：

- 视觉层级、排版、密度或文案问题：`frontend-design`。
- 可用性、无障碍、状态、响应式或技术实现问题：`ui-ux-pro-max`，只查询一个明确结果和实际栈。
- 需要比较产品范式或重新选择布局方向：`awesome-design-md`，只读最相关的一至两个参考。
- 纯后端、数据或构建问题不强制调用设计 Skill。

## 项目优先级

发生冲突时按以下顺序决策：

1. 用户本轮明确要求。
2. 已确认的业务流程和不可改动范围。
3. 富途品牌规范、现有设计 token 与组件行为。
4. 本规范综合后的 Skill 建议。
5. 外部产品参考。

外部 Skill 和案例只能提供证据，不能覆盖已确认的 1–4 步流程，也不能擅自扩大改动范围。

## 母版到延展的职责边界

- 第一步识别并冻结母版事实：语言、语义角色、真实节点、原始断行、字体样式与标题组关系。
- 中文主标题可能由多个 Figma 文字层拼成，英文也可能在单个文字层内换行；节点边界不是文案句界。平台保存的是逻辑文案、断点和来源节点关系。
- 第二步不重建整张 Figma 画板。只展示母版原图缩略图与标题组结构预演，用于一起编辑主副标题、创建断行方案、调整标题组内部顺序和间距，并设置 CTA／Logo 的全局默认值。
- 第二步不得移动 CTA，也不得把浏览器结构预演描述成像素级成品预览。
- 第三步按目标画幅选择第二步保存的排版方案，再调整标题组位置、CTA 位置／间距和画幅级覆盖项；实际冲突检查也在此完成。
- 第四步统一检查并生成。生成时读取第三步每个画幅的方案分配，未分配时明确跟随母版。

## 实施前检查

- 明确本次是新设计、重塑、局部修复还是只读评审。
- 明确用户、任务、页面状态和成功标准。
- 读取适用 Skill；需要参考产品时记录所选产品及采用的具体原则。
- 检查现有 token、组件和页面，优先复用，不平行创建另一套视觉语言。
- 大改先确定颜色、字体、密度、布局、交互原则和反例；小改保持周边界面不变。

## 实施后检查

- 用真实内容检查层级、断行、溢出、间距和多语言。
- 检查键盘焦点、对比度、触达面积、加载／错误／空状态及适用的 reduced motion。
- 启动可运行页面并检查截图或浏览器实况。
- 运行相关 TypeScript 检查和构建。
- 由独立子 Agent 审查界面与用户文案。
- 有失败就如实报告，不能以“构建通过”代替视觉和交互验证。

## 交付回执

每次相关任务的最终说明必须附简短记录：

```text
本次 Skill：
- frontend-design：用于……
- ui-ux-pro-max：用于……
- awesome-design-md：参考……，采用……
```

未调用的 Skill 要写明“不适用”，不能虚构调用记录。
