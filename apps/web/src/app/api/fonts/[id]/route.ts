import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { FONT_FILES } from "@/lib/font-registry.generated";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const font = FONT_FILES[id as keyof typeof FONT_FILES];
  if (!font) return new Response("Font not found", { status: 404 });
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite === "cross-site") return new Response("Forbidden", { status: 403 });

  try {
    const data = await readFile(join(process.cwd(), "assets", "fonts", font.file));
    return new Response(data, {
      headers: {
        "Content-Type": font.format === "opentype" ? "font/otf" : "font/ttf",
        "Cache-Control": "public, max-age=31536000, immutable",
        "Cross-Origin-Resource-Policy": "same-origin",
      },
    });
  } catch {
    return new Response("Font file unavailable", { status: 404 });
  }
}
