"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";

import type {
  NetworkSignalQuality,
  RemoteNetworkStatusItem,
} from "@/lib/network/network-status";
import {
  mapNetworkItemToSvgAreaId,
  mapNetworkItemToSvgPcId,
} from "@/lib/network/network-status";
import { isAla } from "@/lib/svg/planta-map";
import { formatSvgElementLabel } from "@/lib/svg/svg-interaction";
import type { Ala } from "@/types/building";

type InternetSummaryProps = {
  selectedId?: string | null;
};

type NetworkStatusApiResponse = {
  error?: string;
  items?: RemoteNetworkStatusItem[];
  ok?: boolean;
  signals?: Record<string, NetworkSignalQuality>;
  source?: string;
  updatedAt?: string | null;
};

export function InternetSummary({ selectedId }: InternetSummaryProps) {
  const params = useParams<{ ala?: string; planta?: string }>();
  const searchParams = useSearchParams();
  const [payload, setPayload] = useState<NetworkStatusApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const routeAla: Ala | null = isAla(params?.ala ?? "") ? params.ala : null;
  const overviewAlaParam = searchParams.get("ala");
  const overviewAla: Ala | null = isAla(overviewAlaParam) ? overviewAlaParam : null;

  useEffect(() => {
    let isMounted = true;

    const syncNetworkStatus = async () => {
      try {
        const response = await fetch("/api/network-status/current", {
          cache: "no-store",
        });
        const nextPayload = (await response.json()) as NetworkStatusApiResponse;

        if (isMounted) {
          setPayload(nextPayload);
          setIsLoading(false);
        }
      } catch {
        if (isMounted) {
          setPayload({ error: "network_status_unavailable", ok: false });
          setIsLoading(false);
        }
      }
    };

    void syncNetworkStatus();
    const intervalId = window.setInterval(syncNetworkStatus, 30000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const filteredItems = useMemo(() => {
    const items = payload?.items ?? [];

    return items.filter((item) => {
      if (routeAla && mapAlaCode(item.ala_codigo) !== routeAla) {
        return false;
      }

      if (!routeAla && overviewAla && mapAlaCode(item.ala_codigo) !== overviewAla) {
        return false;
      }

      return true;
    });
  }, [overviewAla, payload?.items, routeAla]);

  const selectedItems = useMemo(() => {
    if (!selectedId) {
      return [];
    }

    return filteredItems.filter((item) => {
      const pcId = mapNetworkItemToSvgPcId(item);
      const areaId = mapNetworkItemToSvgAreaId(item);

      return pcId === selectedId || areaId === selectedId;
    });
  }, [filteredItems, selectedId]);

  const summary = useMemo(() => getSummary(filteredItems), [filteredItems]);
  const selectedSummary = useMemo(() => getSummary(selectedItems), [selectedItems]);
  const staleItems = useMemo(() => filteredItems.filter(isItemStale), [filteredItems]);
  const topSsids = useMemo(() => getTopSsids(filteredItems), [filteredItems]);
  const incidentSummary = useMemo(() => getIncidentSummary(filteredItems), [filteredItems]);

  if (isLoading) {
    return <PlaceholderPanel message="Cargando diagnostico de red..." />;
  }

  if (!payload?.ok) {
    return <PlaceholderPanel message="No pudimos consultar el estado de red actual." tone="danger" />;
  }

  if (selectedId && selectedItems.length > 0) {
    return (
      <div className="grid h-full min-h-0 grid-cols-[1.35fr_1fr_1fr] gap-4">
        <div className="rounded-[20px] border border-border/80 bg-[#fbfeff] p-4 shadow-panel">
          <p className="text-sm font-medium text-[#6a88a5]">Seleccion actual</p>
          <p className="mt-2 text-2xl font-semibold text-[#173863]">
            {formatSvgElementLabel(selectedId)}
          </p>
          <p className="mt-1 break-all text-sm text-[#6f88a0]">{selectedId}</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <StatusPill
              label="Estado dominante"
              value={formatSignalLabel(selectedSummary.worstSignal)}
              tone={selectedSummary.worstSignal}
            />
            <StatusPill
              label="Actualizacion"
              value={formatTimestamp(selectedSummary.latestUpdate)}
              tone={selectedSummary.hasFreshData ? "good" : "warning"}
            />
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {selectedItems.slice(0, 4).map((item) => (
              <div
                key={`${item.equipo_id ?? item.hostname ?? "equipo"}-${item.updated_at ?? item.last_sample_time ?? ""}`}
                className="rounded-2xl border border-[#d8e6f2] bg-white p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-sm font-semibold text-[#173863]">
                    {item.equipo_descripcion ?? item.hostname ?? "Equipo"}
                  </p>
                  <SignalBadge quality={resolveItemQuality(item)} />
                </div>
                <p className="mt-1 text-xs text-[#6f88a0]">
                  {item.tipo_conexion?.toUpperCase() ?? "SIN DATO"} | {item.ssid ?? "Sin SSID"}
                </p>
                <p className="mt-2 text-base font-medium text-[#4f6f8f]">
                  Ping: {formatMs(item.latencia_internet_ms)} | RSSI: {formatRssi(item.rssi)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <MetricCard
          title="Dispositivos"
          value={`${selectedItems.length}`}
          detail={`${selectedSummary.connectedCount} con enlace activo`}
        />
        <MetricCard
          title="Calidad"
          value={formatSignalLabel(selectedSummary.worstSignal)}
          detail={`${selectedSummary.regularCount} regular | ${selectedSummary.badCount} mala`}
        />
      </div>
    );
  }

  return (
    <div className="grid h-full min-h-0 grid-cols-[1.4fr_1fr_1fr] gap-4">
      <div className="rounded-[20px] border border-border/80 bg-[#fbfeff] p-4 shadow-panel">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-[#6a88a5]">Resumen operativo</p>
          <p className="text-sm font-semibold text-[#173863]">
            {routeAla
              ? `Ala ${routeAla}`
              : overviewAla
                ? `Ala ${overviewAla}`
                : "Todo el edificio"}
          </p>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-5">
          <StatusPill
            label="Actualizacion mas reciente"
            value={formatTimestamp(summary.latestUpdate)}
            tone={summary.hasFreshData ? "good" : "warning"}
          />
          <StatusPill
            label="Con mala senal"
            value={`${incidentSummary.badCount}`}
            tone={incidentSummary.badCount > 0 ? "mala" : "good"}
          />
          <StatusPill
            label="Desconectados"
            value={`${incidentSummary.disconnectedCount}`}
            tone={incidentSummary.disconnectedCount > 0 ? "desconectada" : "good"}
          />
          <StatusPill
            label="Ubicaciones afectadas"
            value={`${incidentSummary.affectedLocations}`}
            tone={incidentSummary.affectedLocations > 0 ? "warning" : "good"}
          />
          <StatusPill
            label="SSID comprometidos"
            value={`${incidentSummary.affectedSsids}`}
            tone={incidentSummary.affectedSsids > 0 ? "warning" : "good"}
          />
        </div>
      </div>
      <div className="grid gap-4">
        <CompactMetricCard
          title="Equipos visibles"
          value={`${summary.total}`}
          detail={`${summary.connectedCount} conectados | ${summary.disconnectedCount} desconectados`}
        />
        <QualityMetricCard
          title="Calidad"
          averageScore={summary.averageScore}
          badCount={summary.badCount}
          goodCount={summary.goodCount}
          regularCount={summary.regularCount}
        />
      </div>
      <MetricCard
        title="SSID principal"
        value={topSsids[0]?.name ?? "Sin SSID"}
        detail={topSsids[0] ? `${topSsids[0].count} equipos en esta red` : "Sin datos"}
      />
    </div>
  );
}

function getSummary(items: RemoteNetworkStatusItem[]) {
  const qualities = items.map(resolveItemQuality);
  const latestUpdate = items
    .map((item) => item.updated_at ?? item.last_sample_time ?? null)
    .filter((value): value is string => Boolean(value))
    .sort()
    .at(-1) ?? null;
  const scoredItems = items.filter(
    (item) => item.conectada === true && typeof item.score_salud === "number",
  );
  const averageScore =
    scoredItems.length > 0
      ? scoredItems.reduce((total, item) => total + (item.score_salud ?? 0), 0) / scoredItems.length
      : null;

  return {
    averageScore,
    total: items.length,
    connectedCount: items.filter((item) => item.conectada === true).length,
    disconnectedCount: items.filter((item) => item.conectada === false).length,
    goodCount: qualities.filter((quality) => quality === "buena").length,
    regularCount: qualities.filter((quality) => quality === "regular").length,
    badCount: qualities.filter((quality) => quality === "mala").length,
    worstSignal: getWorstSignal(qualities),
    latestUpdate,
    hasFreshData: latestUpdate ? !isOlderThanHours(latestUpdate, 24) : false,
  };
}

function getTopSsids(items: RemoteNetworkStatusItem[]) {
  const counts = new Map<string, number>();

  items.forEach((item) => {
    if (item.conectada !== true || !item.ssid) {
      return;
    }

    counts.set(item.ssid, (counts.get(item.ssid) ?? 0) + 1);
  });

  return Array.from(counts.entries())
    .map(([name, count]) => ({ count, name }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);
}

function getIncidentSummary(items: RemoteNetworkStatusItem[]) {
  const problematic = items.filter((item) => {
    const quality = resolveItemQuality(item);

    return quality === "mala" || quality === "desconectada";
  });

  const locations = new Set(
    problematic.map((item) => item.ubicacion_nombre).filter((value): value is string => Boolean(value)),
  );
  const ssids = new Set(
    problematic.map((item) => item.ssid).filter((value): value is string => Boolean(value)),
  );

  return {
    affectedLocations: locations.size,
    affectedSsids: ssids.size,
    badCount: problematic.filter((item) => resolveItemQuality(item) === "mala").length,
    disconnectedCount: problematic.filter((item) => resolveItemQuality(item) === "desconectada").length,
  };
}

function getWorstSignal(qualities: NetworkSignalQuality[]) {
  if (qualities.includes("desconectada")) {
    return "desconectada";
  }

  if (qualities.includes("mala")) {
    return "mala";
  }

  if (qualities.includes("regular")) {
    return "regular";
  }

  return "buena";
}

function resolveItemQuality(item: RemoteNetworkStatusItem): NetworkSignalQuality {
  if (item.conectada === false) {
    return "desconectada";
  }

  if (
    item.estado_general === "buena" ||
    item.estado_general === "regular" ||
    item.estado_general === "mala"
  ) {
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

function isItemStale(item: RemoteNetworkStatusItem) {
  const timestamp = item.updated_at ?? item.last_sample_time;

  return timestamp ? isOlderThanHours(timestamp, 24) : true;
}

function isOlderThanHours(timestamp: string, hours: number) {
  const parsed = new Date(timestamp).getTime();

  if (Number.isNaN(parsed)) {
    return true;
  }

  return Date.now() - parsed > hours * 60 * 60 * 1000;
}

function mapAlaCode(alaCodigo?: string | null): Ala | null {
  if (alaCodigo === "AE") {
    return "este";
  }

  if (alaCodigo === "AO") {
    return "oeste";
  }

  return null;
}

function formatSignalLabel(quality: NetworkSignalQuality) {
  if (quality === "desconectada") {
    return "Desconectada";
  }

  if (quality === "mala") {
    return "Mala";
  }

  if (quality === "regular") {
    return "Regular";
  }

  return "Buena";
}

function formatTimestamp(value: string | null) {
  if (!value) {
    return "Sin dato";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
  }).format(date);
}

function formatMs(value?: number | null) {
  return typeof value === "number" ? `${value} ms` : "Sin dato";
}

function formatRssi(value?: number | null) {
  return typeof value === "number" ? `${value} dBm` : "Sin dato";
}

function formatScore(value: number | null) {
  return typeof value === "number" ? `${Math.round(value)}` : "Sin dato";
}

function PlaceholderPanel({
  message,
  tone = "neutral",
}: {
  message: string;
  tone?: "danger" | "neutral";
}) {
  return (
    <div className="flex h-full items-center justify-center">
      <div
        className={`w-full rounded-[24px] border bg-white p-6 text-center shadow-panel ${
          tone === "danger" ? "border-rose-200" : "border-dashed border-border"
        }`}
      >
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#5f89b4]">Internet</p>
        <p className="mt-3 text-lg font-semibold text-[#173863]">{message}</p>
      </div>
    </div>
  );
}

function MetricCard({ title, value, detail }: { detail: string; title: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-border/80 bg-[#fbfeff] p-4 shadow-panel">
      <p className="text-sm font-medium text-[#6a88a5]">{title}</p>
      <p className="mt-2 text-[2rem] font-semibold text-[#173863]">{value}</p>
      <p className="mt-1 text-sm text-[#6f88a0]">{detail}</p>
    </div>
  );
}

function CompactMetricCard({
  title,
  value,
  detail,
}: {
  detail: string;
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-[20px] border border-border/80 bg-[#fbfeff] p-3 shadow-panel">
      <p className="text-sm font-medium text-[#6a88a5]">{title}</p>
      <p className="mt-1 text-base leading-6 text-[#6f88a0]">
        <span className="font-semibold text-[#173863]">Total {value}</span> | {detail}
      </p>
    </div>
  );
}

function QualityMetricCard({
  title,
  averageScore,
  goodCount,
  regularCount,
  badCount,
}: {
  title: string;
  averageScore: number | null;
  goodCount: number;
  regularCount: number;
  badCount: number;
}) {
  return (
    <div className="rounded-[20px] border border-border/80 bg-[#fbfeff] p-3 shadow-panel">
      <p className="text-sm font-medium text-[#6a88a5]">{title}</p>
      <p className="mt-1 text-base leading-6 text-[#6f88a0]">
        <span className="font-semibold text-[#173863]">Score prom. {formatScore(averageScore)}</span> |{" "}
        <span className="font-semibold text-emerald-700">{goodCount} buena</span>
        {" | "}
        <span className="font-semibold text-amber-700">{regularCount} regular</span>
        {" | "}
        <span className="font-semibold text-rose-700">{badCount} mala</span>
      </p>
    </div>
  );
}

function SignalBadge({ quality }: { quality: NetworkSignalQuality }) {
  const palette =
    quality === "buena"
      ? "bg-emerald-100 text-emerald-700"
      : quality === "regular"
        ? "bg-amber-100 text-amber-700"
        : quality === "mala"
          ? "bg-rose-100 text-rose-700"
          : "bg-slate-200 text-slate-700";

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${palette}`}>
      {formatSignalLabel(quality)}
    </span>
  );
}

function StatusPill({
  label,
  value,
  tone,
}: {
  label: string;
  tone: "buena" | "desconectada" | "good" | "mala" | "regular" | "warning";
  value: string;
}) {
  const palette =
    tone === "good" || tone === "buena"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : tone === "regular" || tone === "warning"
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : "border-rose-200 bg-rose-50 text-rose-700";

  return (
    <div className={`rounded-2xl border px-3 py-2 ${palette}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em]">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}
