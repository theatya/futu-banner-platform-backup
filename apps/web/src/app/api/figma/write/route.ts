import { NextResponse } from "next/server";
import type { BoardPlan, FigmaWriteOptions, FigmaWriteResult } from "@futu/ports";

type WriteJob = {
  id: string;
  sessionId: string;
  boards: BoardPlan[];
  options: FigmaWriteOptions;
  status: "queued" | "claimed" | "completed" | "failed";
  result?: FigmaWriteResult;
  error?: string;
  createdAt: number;
};

const jobs = new Map<string, WriteJob>();
const CORS_HEADERS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, OPTIONS",
  "access-control-allow-headers": "content-type",
};

function json(body: unknown, init?: ResponseInit) {
  return NextResponse.json(body, {
    ...init,
    headers: { ...CORS_HEADERS, ...init?.headers },
  });
}

function removeExpiredJobs() {
  const oldestAllowed = Date.now() - 15 * 60_000;
  for (const [id, job] of jobs) {
    if (job.createdAt < oldestAllowed) jobs.delete(id);
  }
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export function GET(request: Request) {
  removeExpiredJobs();
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get("jobId");
  if (jobId) {
    const job = jobs.get(jobId);
    if (!job) return json({ error: "写入任务不存在或已过期" }, { status: 404 });
    return json({ status: job.status, result: job.result, error: job.error });
  }

  const sessionId = searchParams.get("sessionId");
  if (!sessionId) return json({ error: "缺少配对码" }, { status: 400 });
  const job = [...jobs.values()].find((item) => item.sessionId === sessionId && item.status === "queued");
  if (!job) return json({ status: "idle" });
  job.status = "claimed";
  return json({
    status: "job",
    job: { id: job.id, boards: job.boards, options: job.options },
  });
}

export async function POST(request: Request) {
  removeExpiredJobs();
  const body = (await request.json()) as {
    action?: "create" | "complete" | "fail";
    sessionId?: string;
    jobId?: string;
    boards?: BoardPlan[];
    options?: FigmaWriteOptions;
    result?: FigmaWriteResult;
    error?: string;
  };

  if (body.action === "create") {
    if (!body.sessionId || !body.boards?.length || !body.options?.visualComponent?.id) {
      return json({ error: "写入任务缺少配对码、画板或主视觉组件" }, { status: 400 });
    }
    const id = crypto.randomUUID();
    jobs.set(id, {
      id,
      sessionId: body.sessionId,
      boards: body.boards,
      options: body.options,
      status: "queued",
      createdAt: Date.now(),
    });
    return json({ jobId: id });
  }

  if (!body.jobId) return json({ error: "缺少写入任务 ID" }, { status: 400 });
  const job = jobs.get(body.jobId);
  if (!job) return json({ error: "写入任务不存在或已过期" }, { status: 404 });
  if (body.action === "complete" && body.result) {
    job.status = "completed";
    job.result = body.result;
    return json({ ok: true });
  }
  if (body.action === "fail") {
    job.status = "failed";
    job.error = body.error ?? "Figma 插件写入失败";
    return json({ ok: true });
  }
  return json({ error: "无效的写入任务操作" }, { status: 400 });
}
