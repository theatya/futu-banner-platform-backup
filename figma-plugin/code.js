figma.showUI(__html__, { width: 390, height: 440, title: "Futu Banner Bridge" });

function at(rect, board) {
  return {
    x: Math.round(rect.x * board.w),
    y: Math.round(rect.y * board.h),
    w: Math.max(1, Math.round(rect.w * board.w)),
    h: Math.max(1, Math.round(rect.h * board.h)),
  };
}

function solidPaint(value) {
  const hex = typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value) ? value.slice(1) : "0f1112";
  return {
    type: "SOLID",
    color: {
      r: parseInt(hex.slice(0, 2), 16) / 255,
      g: parseInt(hex.slice(2, 4), 16) / 255,
      b: parseInt(hex.slice(4, 6), 16) / 255,
    },
  };
}

async function addText(frame, text, rect, size, weight, color) {
  if (!rect || !text) return;
  const fontStyle = weight === "bold" ? "Bold" : "Regular";
  await figma.loadFontAsync({ family: "Inter", style: fontStyle });
  const node = figma.createText();
  node.fontName = { family: "Inter", style: fontStyle };
  node.fontSize = Math.max(8, Math.round(size));
  node.characters = text;
  if (color) node.fills = [solidPaint(color)];
  const box = at(rect, { w: frame.width, h: frame.height });
  node.x = box.x;
  node.y = box.y;
  node.resize(box.w, Math.max(box.h, node.height));
  frame.appendChild(node);
}

async function appendAsset(frame, asset, rect, fallbackLabel) {
  if (!rect || !asset) return;
  const box = at(rect, { w: frame.width, h: frame.height });
  try {
    const component = await sourceComponent(asset.id);
    const instance = component.createInstance();
    const scale = Math.min(box.w / instance.width, box.h / instance.height);
    instance.rescale(scale);
    instance.x = box.x + (box.w - instance.width) / 2;
    instance.y = box.y + (box.h - instance.height) / 2;
    frame.appendChild(instance);
  } catch {
    await addText(frame, fallbackLabel || asset.name, rect, Math.max(10, box.h * 0.45), "bold", "#ffffff");
  }
}

async function sourceComponent(componentId) {
  const node = await figma.getNodeByIdAsync(componentId);
  if (!node) throw new Error("当前文件中找不到主视觉组件。请在包含该组件的 Figma 文件中运行插件。");
  if (node.type === "COMPONENT") return node;
  if (node.type === "INSTANCE") {
    const mainComponent = await node.getMainComponentAsync();
    if (mainComponent) return mainComponent;
  }
  throw new Error("主视觉链接不再指向 Component 或 Instance，请回平台重新识别。");
}

async function write(job) {
  const component = await sourceComponent(job.options.visualComponent.id);
  const page = job.options.page === "new" ? figma.createPage() : figma.currentPage;
  if (job.options.page === "new") page.name = job.options.pageName;
  const nodes = [];
  const createdFrames = [];
  const failures = [];
  const columns = job.options.arrange === "flat" ? 5 : 3;

  for (let index = 0; index < job.boards.length; index += 1) {
    const plan = job.boards[index];
    try {
      const frame = figma.createFrame();
      frame.name = plan.name;
      frame.resize(plan.solution.board.w, plan.solution.board.h);
      frame.x = (index % columns) * (frame.width + 160);
      frame.y = Math.floor(index / columns) * (frame.height + 160);
      frame.fills = [solidPaint(plan.backgroundColor)];
      page.appendChild(frame);

      if (plan.solution.kv) {
        const instance = component.createInstance();
        const box = at(plan.solution.kv, plan.solution.board);
        const scale = Math.min(box.w / instance.width, box.h / instance.height);
        instance.rescale(scale);
        instance.x = box.x + (box.w - instance.width) / 2;
        instance.y = box.y + (box.h - instance.height) / 2;
        frame.appendChild(instance);
      }
      await appendAsset(frame, plan.logo, plan.solution.logo, plan.logo?.name || "Logo");
      await addText(frame, plan.solution.titleLines.join("\n"), plan.solution.title, plan.solution.titlePx, "bold", "#ffffff");
      await addText(frame, plan.subLabel || "", plan.solution.sub, plan.solution.subPx, "regular", "#ffffff");
      if (plan.solution.cta) {
        const box = at(plan.solution.cta, plan.solution.board);
        const button = figma.createRectangle();
        button.name = "CTA";
        button.x = box.x;
        button.y = box.y;
        button.resize(box.w, box.h);
        button.cornerRadius = Math.min(box.h / 2, 20);
        button.fills = [solidPaint(plan.ctaStyle?.backgroundColor || "#ff6900")];
        frame.appendChild(button);
        await addText(frame, plan.solution.ctaLabel, plan.solution.cta, plan.solution.ctaPx, "bold", plan.ctaStyle?.textColor || "#ffffff");
      }
      if (plan.solution.badge) {
        const box = at(plan.solution.badge, plan.solution.board);
        const badge = figma.createRectangle();
        badge.name = "Badge";
        badge.x = box.x;
        badge.y = box.y;
        badge.resize(box.w, box.h);
        badge.cornerRadius = Math.min(box.h / 2, 18);
        badge.fills = [solidPaint(plan.badgeStyle?.backgroundColor || "#6f6259")];
        frame.appendChild(badge);
        await addText(frame, plan.badgeLabel || "", plan.solution.badge, Math.max(8, box.h * 0.34), "regular", plan.badgeStyle?.textColor || "#ffffff");
      }
      await addText(frame, plan.disclaimerLabel || "", plan.solution.disc, plan.solution.discPx, "regular", "#8f949b");
      nodes.push({ key: plan.key, lang: plan.lang, nodeId: frame.id });
      createdFrames.push(frame);
    } catch (error) {
      failures.push({ key: plan.key, lang: plan.lang, error: error instanceof Error ? error.message : String(error) });
    }
  }
  await figma.setCurrentPageAsync(page);
  page.selection = createdFrames;
  if (createdFrames.length) figma.viewport.scrollAndZoomIntoView(createdFrames);
  return { ok: failures.length === 0, nodes, failures };
}

figma.ui.onmessage = async (message) => {
  if (message.type !== "write") return;
  try {
    const result = await write(message.job);
    figma.ui.postMessage({ type: "completed", jobId: message.job.id, result });
  } catch (error) {
    figma.ui.postMessage({
      type: "failed",
      jobId: message.job.id,
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
