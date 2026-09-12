/**
 * 端口的浏览器实现。
 *
 * 这一层是**唯一**允许直接碰 window / localStorage / fetch 的地方。
 * 迁桌面端时整包换掉即可，核心逻辑不受影响。
 */

import type { Project } from "@futu/domain";
import {
  UnsupportedError,
  type BoardPlan,
  type ConfigPort,
  type FigmaWriteOptions,
  type FigmaWriteResult,
  type FigmaWriterPort,
  type FileSystemPort,
  type HttpPort,
  type LoggerPort,
  type LogLevel,
  type Ports,
  type ProjectRepository,
  type StoragePort,
} from "@futu/ports";

/* ------------------------------------------------------------------ */

export class LocalStorageAdapter implements StoragePort {
  constructor(private prefix = "futu:") {}

  private k(key: string) {
    return this.prefix + key;
  }

  async get<T>(key: string): Promise<T | null> {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem(this.k(key));
      return raw === null ? null : (JSON.parse(raw) as T);
    } catch {
      return null;
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(this.k(key), JSON.stringify(value));
    } catch {
      // 配额满或隐私模式：不让存储失败拖垮整个应用
    }
  }

  async remove(key: string): Promise<void> {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(this.k(key));
  }

  async keys(prefix = ""): Promise<string[]> {
    if (typeof window === "undefined") return [];
    const full = this.k(prefix);
    const out: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k?.startsWith(full)) out.push(k.slice(this.prefix.length));
    }
    return out;
  }
}

/* ------------------------------------------------------------------ */

export class FetchHttpAdapter implements HttpPort {
  async request<T>(input: {
    url: string;
    method?: "GET" | "POST" | "PATCH" | "DELETE";
    headers?: Record<string, string>;
    body?: unknown;
    signal?: AbortSignal;
  }): Promise<T> {
    const res = await fetch(input.url, {
      method: input.method ?? "GET",
      headers: { "content-type": "application/json", ...input.headers },
      body: input.body === undefined ? undefined : JSON.stringify(input.body),
      signal: input.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText} — ${input.url}`);
    return (await res.json()) as T;
  }
}

/* ------------------------------------------------------------------ */

export class BrowserFileAdapter implements FileSystemPort {
  async deliver(input: { name: string; mime: string; data: Blob | ArrayBuffer }): Promise<void> {
    const blob = input.data instanceof Blob ? input.data : new Blob([input.data], { type: input.mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = input.name;
    a.click();
    // 立刻 revoke 会让部分浏览器下载不到，延后释放
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  }

  async readText(): Promise<string> {
    throw new UnsupportedError("在浏览器里读取本地文件");
  }

  async writeText(): Promise<void> {
    throw new UnsupportedError("在浏览器里写入本地文件");
  }
}

/* ------------------------------------------------------------------ */

export class ConsoleLogger implements LoggerPort {
  log(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
    const fn = level === "error" ? console.error : level === "warn" ? console.warn : console.log;
    if (meta) fn(`[${level}] ${message}`, meta);
    else fn(`[${level}] ${message}`);
  }
}

export class EnvConfig implements ConfigPort {
  constructor(private values: Record<string, string | undefined> = {}) {}

  get(key: string): string | undefined {
    return this.values[key];
  }

  require(key: string): string {
    const v = this.get(key);
    if (v === undefined) throw new Error(`缺少配置项 ${key}`);
    return v;
  }
}

/* ------------------------------------------------------------------ */

export class StorageProjectRepository implements ProjectRepository {
  constructor(private storage: StoragePort) {}

  async list(): Promise<Project[]> {
    const keys = await this.storage.keys("project:");
    const out: Project[] = [];
    for (const k of keys) {
      const p = await this.storage.get<Project>(k);
      if (p) out.push(p);
    }
    return out.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async load(id: string): Promise<Project | null> {
    return this.storage.get<Project>(`project:${id}`);
  }

  async save(project: Project): Promise<void> {
    await this.storage.set(`project:${project.id}`, {
      ...project,
      updatedAt: new Date().toISOString(),
    });
  }

  async remove(id: string): Promise<void> {
    await this.storage.remove(`project:${id}`);
  }
}

/* ------------------------------------------------------------------ */

/**
 * Figma 写入的**占位实现**。
 *
 * 真实链路（平台 → Cursor SDK 云端 agent → Figma MCP）还没验证通，
 * 那是里程碑 M3 的事。在验证通之前，这里如实地什么都不写，
 * 只把「要写什么」原样报回来 —— **不假装成功**。
 *
 * 界面上会明确标注当前是未接通状态，不会让人误以为已经写进 Figma 了。
 */
export class MockFigmaWriter implements FigmaWriterPort {
  async identity() {
    return { kind: "mock" as const, label: "未接通（M3 验证中）" };
  }

  async write(boards: BoardPlan[], options: FigmaWriteOptions): Promise<FigmaWriteResult> {
    // 模拟一次往返，让界面的加载态是真的在等东西
    await new Promise((r) => setTimeout(r, 260));
    return {
      ok: false,
      nodes: [],
      failures: boards.map((b) => ({
        key: b.key,
        lang: b.lang,
        error: `Figma 写入链路尚未接通（目标页「${options.pageName}」）`,
      })),
    };
  }
}

/* ------------------------------------------------------------------ */

/** 组装浏览器环境下的全套端口 */
export function createWebPorts(env: Record<string, string | undefined> = {}): Ports {
  const storage = new LocalStorageAdapter();
  return {
    storage,
    http: new FetchHttpAdapter(),
    files: new BrowserFileAdapter(),
    logger: new ConsoleLogger(),
    config: new EnvConfig(env),
    projects: new StorageProjectRepository(storage),
    figma: new MockFigmaWriter(),
  };
}
