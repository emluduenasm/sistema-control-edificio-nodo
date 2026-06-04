"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { PlantaRouteSelector } from "@/components/planta/planta-route-selector";
import { Button } from "@/components/ui/button";
import { dashboardNavItems } from "@/lib/constants/navigation";
import { cn } from "@/lib/utils";

export function TopBar() {
  const pathname = usePathname();

  return (
    <header className="flex items-center justify-between border-b border-border/80 bg-white/95 px-6 backdrop-blur">
      <div className="flex items-center gap-8">
        <Link href="/" className="rounded-2xl px-1 py-1 leading-tight">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5f89b4]">
            NODO
          </p>
          <p className="text-lg font-semibold text-nodo-ink">Mapa de plantas - Edificio NODO</p>
        </Link>

        <nav className="flex items-center gap-2">
          {dashboardNavItems.map((item) => {
            const isActive =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

            return (
              <Button
                key={item.href}
                asChild
                variant={isActive ? "secondary" : "ghost"}
                size="sm"
                className={cn(
                  "h-10 px-4 text-sm font-medium",
                  isActive
                    ? "border border-border/90 bg-secondary text-[#2088d9]"
                    : "text-[#6384a8] hover:text-nodo-ink",
                )}
              >
                <Link href={item.href}>{item.label}</Link>
              </Button>
            );
          })}
        </nav>
      </div>

      <Suspense fallback={<div className="h-11 w-[520px] rounded-full border border-border/80 bg-muted/70" />}>
        <PlantaRouteSelector />
      </Suspense>
    </header>
  );
}
