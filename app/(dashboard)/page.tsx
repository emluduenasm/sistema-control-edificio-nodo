import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const accesos = [
  { href: "/interior", label: "Interior", description: "Planos por ala, planta y capa activa." },
  { href: "/exterior", label: "Exterior", description: "Vista de fachada frontal." },
];

export default function DashboardPage() {
  return (
    <section className="mx-auto flex h-full w-full max-w-6xl flex-col justify-center gap-6 p-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#5f89b4]">
          Edificio NODO TECNOLOGICO
        </p>
        <h1 className="mt-3 text-4xl font-semibold text-nodo-ink">
          Control operativo del edificio
        </h1>
        <p className="mt-3 max-w-2xl text-base text-[#6684a1]">
          Base inicial para visualizar plantas, controlar servicios por capa y revisar metricas
          operativas con datos simulados.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {accesos.map((acceso) => (
          <Card
            key={acceso.href}
            className="bg-[#fbfeff] transition hover:-translate-y-0.5 hover:border-[#8bd6ff]"
          >
            <CardHeader>
              <CardTitle className="text-[1.35rem] text-[#173863]">{acceso.label}</CardTitle>
              <CardDescription className="text-sm leading-6 text-[#6986a1]">
                {acceso.description}
              </CardDescription>
            </CardHeader>
            <CardContent />
            <CardFooter>
              <Button asChild className="w-full">
                <Link href={acceso.href}>Abrir modulo</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
}
