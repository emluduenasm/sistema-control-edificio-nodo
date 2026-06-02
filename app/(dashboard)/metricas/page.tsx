import { ConnectivityTable } from "@/components/metricas/connectivity-table";
import { EnvironmentOverlayChart } from "@/components/metricas/environment-overlay-chart";
import { MetricsFilters } from "@/components/metricas/metrics-filters";
import { UsageChart } from "@/components/metricas/usage-chart";

export default function MetricasPage() {
  return (
    <section className="mx-auto grid h-full w-full max-w-7xl grid-rows-[auto_1fr] gap-5 p-6">
      <MetricsFilters />
      <div className="grid min-h-0 gap-5 lg:grid-cols-[1fr_1fr]">
        <UsageChart />
        <EnvironmentOverlayChart />
        <div className="lg:col-span-2">
          <ConnectivityTable />
        </div>
      </div>
    </section>
  );
}
