figma.showUI(__html__, { width: 390, height: 440, title: "Futu Banner Bridge" });

function at(rect, board) {
  return {
    x: Math.round(rect.x * board.w),
    y: Math.round(rect.y * board.h),
    w: Math.max(1, Math.round(rect.w * board.w)),
    h: Math.max(1, Math.round(rect.h * board.h)),
  };
}

async function addText(frame, text, rect, size, weight) {
  if (!rect || !text) return;
  const fontStyle = weight === "bold" ? "Bold" : "Regular";
  await figma.loadFontAsync({ family: "Inter", style: fontStyle });
  const node = figma.createText();
  node.fontName = { family: "Inter", style: fontStyle };
  node.fontSize = Math.max(8, Math.round(size));
  node.characters = text;
  const box = at(rect, { w: frame.width, h: frame.height });
  node.x = box.x;
  node.y = box.y;
  node.resize(box.w, Math.max(box.h, node.height));
  frame.appendChild(node);
}

async function sourceComponent(componentId) {
  const node = await figma.getNodeByIdAsync(componentId);
  if (!node) throw new Error("当前文件中找不到主视觉组件。请在包含该组件的 Figma 文件中运行插件。");
  if (node.type === "COMPONENT") return node;
  if (node.type === "INSTANCE" && node.mainComponent) return node.mainComponent;
  throw new Error("主视觉链接不再指向 Component 或 Instance，请回平台重新识别。");
}

async function write(job) {
  const component = await sourceComponent(job.options.visualComponent.id);
  const page = job.options.page === "new" ? figma.createPage() : figma.currentPage;
  if (job.options.page === "new") page.name = job.options.pageName;
  const nodes = [];
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
      frame.fills = [{ type: "SOLID", color: { r: 0.06, g: 0.07, b: 0.09 } }];
      page.appendChild(frame);

      if (plan.solution.kv) {
        const instance = component.createInstance();
        const box = at(plan.solution.kv, plan.solution.board);
        instance.resize(box.w, box.h);
        instance.x = box.x;
        instance.y = box.y;
        frame.appendChild(instance);
      }
      await addText(frame, plan.solution.titleLines.join("\n"), plan.solution.title, plan.solution.titlePx, "bold");
      await addText(frame, plan.solution.sub ? `${plan.lang.toUpperCase()}` : "", plan.solution.sub, plan.solution.subPx, "regular");
      if (plan.solution.cta) {
        const box = at(plan.solution.cta, plan.solution.board);
        const button = figma.createRectangle();
        button.name = "CTA";
        button.x = box.x;
        button.y = box.y;
        button.resize(box.w, box.h);
        button.cornerRadius = Math.min(box.h / 2, 20);
        button.fills = [{ type: "SOLID", color: { r: 1, g: 0.41, b: 0 } }];
        frame.appendChild(button);
        await addText(frame, plan.solution.ctaLabel, plan.solution.cta, plan.solution.ctaPx, "bold");
      }
      nodes.push({ key: plan.key, lang: plan.lang, nodeId: frame.id });
    } catch (error) {
      failures.push({ key: plan.key, lang: plan.lang, error: error instanceof Error ? error.message : String(error) });
    }
  }
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
