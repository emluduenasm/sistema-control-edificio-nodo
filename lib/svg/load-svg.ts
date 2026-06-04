import { readFile } from "node:fs/promises";
import path from "node:path";

import { sanitizeSvgMarkup } from "@/lib/svg/svg-interaction";

export async function loadSvgMarkup(publicPath: string) {
  const normalized = publicPath.startsWith("/") ? publicPath.slice(1) : publicPath;
  const absolutePath = path.join(process.cwd(), "public", normalized);
  const svgMarkup = await readFile(absolutePath, "utf8");

  return sanitizeSvgMarkup(svgMarkup);
}
