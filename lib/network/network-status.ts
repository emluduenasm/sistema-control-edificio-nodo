export type NetworkSignalQuality = "buena" | "regular" | "mala" | "desconectada";

type RemoteNetworkStatusItem = {
  ala_codigo?: string | null;
  calidad_senal?: number | null;
  conectada?: boolean | null;
  equipo_id?: string | null;
  equipo_descripcion?: string | null;
  estado_general?: string | null;
  hostname?: string | null;
  planta_codigo?: string | null;
  ubicacion_nombre?: string | null;
};

export type NormalizedNetworkStatusResponse = {
  signals: Record<string, NetworkSignalQuality>;
  updatedAt: string | null;
};

export function normalizeNetworkStatusPayload(payload: unknown): NormalizedNetworkStatusResponse {
  const items = getItems(payload);
  const signals: Record<string, NetworkSignalQuality> = {};
  const aulaStates: Record<string, NetworkSignalQuality[]> = {};
  let updatedAt: string | null = null;

  items.forEach((item) => {
    if (item.ala_codigo !== "AE" || item.planta_codigo !== "PB") {
      return;
    }

    const aulaNumber = getAulaNumber(item.ubicacion_nombre);
    const pcNumber = getPcNumber(item.hostname, item.equipo_descripcion);
    const specialPcId = getSpecialSvgPcId(item.equipo_id);

    if ((!aulaNumber || aulaNumber < 1 || aulaNumber > 4) && !specialPcId) {
      return;
    }

    const quality = resolveSignalQuality(item);
    const pcId =
      specialPcId ??
      (pcNumber && aulaNumber ? `pc${pcNumber}_aula${aulaNumber}` : null);

    if (!pcId) {
      return;
    }

    signals[pcId] = quality;

    if (aulaNumber) {
      const aulaId = `aula${aulaNumber}_pb_este`;
      aulaStates[aulaId] = [...(aulaStates[aulaId] ?? []), quality];
    }
  });

  Object.entries(aulaStates).forEach(([aulaId, states]) => {
    signals[aulaId] = getWorstSignalQuality(states);
  });

  if (typeof payload === "object" && payload !== null && "items" in payload && Array.isArray((payload as { items?: unknown[] }).items)) {
    const rawItems = (payload as { items: Array<{ updated_at?: string | null; last_sample_time?: string | null }> }).items;
    updatedAt =
      rawItems.find((item) => item.updated_at)?.updated_at ??
      rawItems.find((item) => item.last_sample_time)?.last_sample_time ??
      null;
  }

  return {
    signals,
    updatedAt,
  };
}

function getItems(payload: unknown): RemoteNetworkStatusItem[] {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "items" in payload &&
    Array.isArray((payload as { items?: unknown[] }).items)
  ) {
    return (payload as { items: RemoteNetworkStatusItem[] }).items;
  }

  return [];
}

function resolveSignalQuality(item: RemoteNetworkStatusItem): NetworkSignalQuality {
  if (item.conectada === false) {
    return "desconectada";
  }

  if (item.estado_general === "buena" || item.estado_general === "regular" || item.estado_general === "mala") {
    return item.estado_general;
  }

  if (typeof item.calidad_senal === "number") {
    if (item.calidad_senal >= 75) {
      return "buena";
    }

    if (item.calidad_senal >= 45) {
      return "regular";
    }
  }

  return "mala";
}

function getWorstSignalQuality(states: NetworkSignalQuality[]) {
  if (states.length > 0 && states.every((state) => state === "desconectada")) {
    return "desconectada";
  }

  if (states.includes("mala")) {
    return "mala";
  }

  if (states.includes("regular")) {
    return "regular";
  }

  if (states.includes("buena")) {
    return "buena";
  }

  return "desconectada";
}

function getAulaNumber(ubicacionNombre?: string | null) {
  const match = ubicacionNombre?.match(/aula\s*(\d+)/i);

  return match ? Number(match[1]) : null;
}

function getPcNumber(hostname?: string | null, equipoDescripcion?: string | null) {
  const hostnameMatch = hostname?.match(/^(\d+)aula\d+$/i);
  if (hostnameMatch) {
    return Number(hostnameMatch[1]);
  }

  const descripcionMatch = equipoDescripcion?.match(/pc\s*(\d+)/i);
  return descripcionMatch ? Number(descripcionMatch[1]) : null;
}

function getSpecialSvgPcId(equipoId?: string | null) {
  if (equipoId === "p_a1") {
    return "pc_profe_aula1";
  }

  return null;
}
