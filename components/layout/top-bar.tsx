"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { LayerSelector } from "@/components/capas/layer-selector";
import { dashboardNavItems } from "@/lib/constants/navigation";

export function TopBar() {
  const pathname = usePathname();

  return (
    <header className="flex items-center justify-between border-b border-nodo-line bg-white px-6">
      <div className="flex items-center gap-8">
        <Link href="/" className="leading-tight">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-nodo-accent">
            NODO
          </p>
          <p className="text-lg font-semibold text-nodo-ink">Control Edificio</p>
        </Link>

        <nav className="flex items-center gap-2">
          {dashboardNavItems.map((item) => {
            const isActive =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-slate-100 text-nodo-ink"
                    : "text-slate-600 hover:bg-slate-50 hover:text-nodo-ink"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <LayerSelector />
    </header>
  );
}
