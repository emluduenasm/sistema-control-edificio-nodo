import type { CapaActiva } from "@/types/building";

const nonInteractiveIds = new Set(["Layer_x0020_1", "CorelCorpID_0Corel-Layer"]);
const nonInteractivePrefixes = ["base_", "pasillos_", "escalera_", "puente_"];

const internetTokens = [
  "pc",
  "servidores",
  "laboratorio",
  "coworking",
  "oficina",
  "administracion",
  "prensa",
  "auditorio",
  "recepcion",
  "aula",
  "sala",
  "bedelia",
  "cocina",
  "deposito",
  "desposito",
  "modernizacion",
  "policia",
  "secretaria",
  "intendente",
  "sarmiento",
];

const aireTokens = [
  "ascensor",
  "sala_de_maquinas",
  "sanitarios",
  "cocina",
  "auditorio",
  "recepcion",
  "coworking",
  "laboratorio",
  "aula",
  "oficina",
  "administracion",
  "prensa",
  "sala",
];

const lucesExcludedTokens = ["pc", "ascensor", "sala_de_maquinas"];

export function sanitizeSvgMarkup(svgMarkup: string) {
  return svgMarkup
    .replace(/<\?xml[\s\S]*?\?>/gi, "")
    .replace(/<!DOCTYPE[\s\S]*?>/gi, "")
    .trim();
}

export function extractSvgIds(svgMarkup: string) {
  return Array.from(svgMarkup.matchAll(/id="([^"]+)"/g), (match) => match[1]);
}

export function extractActiveAreaSvgIds(svgMarkup: string) {
  return Array.from(
    svgMarkup.matchAll(/id="([^"]+)"[^>]*data-active-area="true"/g),
    (match) => match[1],
  );
}

export function isInteractiveSvgId(id: string) {
  if (nonInteractiveIds.has(id)) {
    return false;
  }

  return !nonInteractivePrefixes.some((prefix) => id.startsWith(prefix));
}

export function getInteractiveSvgIds(ids: string[]) {
  return ids.filter(isInteractiveSvgId);
}

export function getIdsForLayer(ids: string[], capaActiva: CapaActiva) {
  if (capaActiva === "internet") {
    return ids.filter((id) =>
      internetTokens.some((token) => id.startsWith(token) || id.includes(token)),
    );
  }

  if (capaActiva === "aire") {
    return ids.filter((id) => aireTokens.some((token) => id.startsWith(token) || id.includes(token)));
  }

  return ids.filter(
    (id) => !lucesExcludedTokens.some((token) => id.startsWith(token) || id.includes(token)),
  );
}

export function formatSvgElementLabel(id: string) {
  const withoutSuffix = stripSvgPlantSuffix(id);

  const compactPc = withoutSuffix.match(/^pc(\d+)_aula(\d+)$/i);
  if (compactPc) {
    return `PC ${compactPc[1]} Aula ${compactPc[2]}`;
  }

  if (/^pc_profe_/i.test(withoutSuffix)) {
    return "PC docente";
  }

  const normalized = withoutSuffix
    .replace(/^pc(\d+)/i, "pc $1")
    .replace(/_/g, " ")
    .replace(/\bep\b/gi, "entre piso")
    .replace(/\bpb\b/gi, "planta baja")
    .replace(/\bpa\b/gi, "planta alta")
    .replace(/\bss\b/gi, "sub suelo");

  return titleCaseSvgLabel(normalized);
}

export function stripSvgPlantSuffix(id: string) {
  return id.replace(/_(pb|ep|pa|ss)_(este|oeste)$/i, "");
}

export function splitSvgElementLabelLines(id: string) {
  return formatSvgElementLabel(id)
    .split(/\s+/)
    .map((word) => word.trim())
    .filter(Boolean);
}

export function getSvgElementKind(id: string) {
  if (id.startsWith("pc")) {
    return "equipo";
  }

  if (id.startsWith("ascensor") || id.includes("sala_de_maquinas")) {
    return "servicio";
  }

  return "ambiente";
}

export function isPcSvgElement(id: string) {
  return id.toLowerCase().startsWith("pc");
}

function titleCaseSvgLabel(label: string) {
  return label
    .toLocaleLowerCase("es-AR")
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toLocaleUpperCase("es-AR") + word.slice(1))
    .join(" ");
}

export function applyLayerVisibilityToSvgMarkup(svgMarkup: string, capaActiva: CapaActiva) {
  if (capaActiva === "internet") {
    return svgMarkup.replace(/\sdata-pc-hidden="true"/gi, "").replace(
      /style="display:\s*none;?"/gi,
      "",
    );
  }

  return svgMarkup.replace(
    /<([a-zA-Z][^>]*\sid="(pc[^"]+)"[^>]*)>/gi,
    (fullMatch, tagBody: string) => {
      if (/data-pc-hidden="true"/i.test(tagBody)) {
        return `<${tagBody}>`;
      }

      if (/style="/i.test(tagBody)) {
        return `<${tagBody.replace(/style="([^"]*)"/i, 'style="$1;display:none"')} data-pc-hidden="true">`;
      }

      return `<${tagBody} style="display:none" data-pc-hidden="true">`;
    },
  );
}
