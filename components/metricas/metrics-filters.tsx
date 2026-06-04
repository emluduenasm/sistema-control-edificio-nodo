import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function MetricsFilters() {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#5f89b4]">
            Metricas
          </p>
          <h1 className="text-2xl font-semibold text-[#173863]">Indicadores operativos</h1>
        </div>
        <div className="flex gap-2">
          {["Hoy", "7 dias", "30 dias"].map((label, index) => (
            <Button key={label} variant={index === 0 ? "default" : "secondary"} size="sm">
              {label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
