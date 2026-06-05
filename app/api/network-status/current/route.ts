import { NextResponse } from "next/server";

import { normalizeNetworkStatusPayload } from "@/lib/network/network-status";

const NETWORK_STATUS_URL = "https://api.agentesredes.nodo.cc.gob.ar/api/v1/network-status/current";

export async function GET() {
  try {
    const response = await fetch(NETWORK_STATUS_URL, {
      cache: "no-store",
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "network_status_fetch_failed", ok: false },
        { status: response.status },
      );
    }

    const payload = await response.json();
    const normalized = normalizeNetworkStatusPayload(payload);

    return NextResponse.json({
      ok: true,
      source: NETWORK_STATUS_URL,
      ...normalized,
    });
  } catch {
    return NextResponse.json({ error: "network_status_unavailable", ok: false }, { status: 502 });
  }
}
