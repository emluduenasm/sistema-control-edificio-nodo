import Link from "next/link";

import {
  Card,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { alas, plantas } from "@/lib/svg/planta-map";
import { formatLabel } from "@/lib/utils/format";

export default function InteriorPage() {
  return (
    <section className="mx-auto flex h-full w-full max-w-6xl flex-col justify-center gap-6 p-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#5f89b4]">
          Interior
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-[#173863]">Seleccion de planta</h1>
        <p className="mt-2 text-[#6b87a1]">Elegí un ala y después la planta a visualizar.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {alas.map((ala) => (
          <div key={ala} className="space-y-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#7190ab]">
                Ala {ala}
              </p>
            </div>
            <div className="grid gap-4">
              {plantas.map((planta) => (
                <Link key={`${ala}-${planta}`} href={`/interior/${ala}/${planta}`}>
                  <Card className="bg-[#fbfeff] transition hover:border-[#8bd6ff] hover:shadow-pill">
                    <CardHeader>
                      <CardTitle className="text-xl text-[#173863]">
                        {formatLabel(planta)}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
