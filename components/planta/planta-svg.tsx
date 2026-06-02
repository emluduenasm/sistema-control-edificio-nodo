import Image from "next/image";

import type { Ala, Planta } from "@/types/building";

type PlantaSvgProps = {
  ala: Ala;
  planta: Planta;
  src: string;
};

export function PlantaSvg({ ala, planta, src }: PlantaSvgProps) {
  return (
    <div className="relative h-full w-full">
      <Image
        src={src}
        alt={`Plano del ala ${ala}, ${planta.replaceAll("-", " ")}`}
        fill
        priority
        className="object-contain"
      />
    </div>
  );
}
