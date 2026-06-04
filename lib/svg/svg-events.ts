export const LIGHT_AREAS_EVENT = "planta-light-areas";
export const LIGHT_STATE_EVENT = "planta-light-state";
export const LIGHT_AREAS_REQUEST_EVENT = "planta-light-areas-request";

export type LightAreasDetail = {
  plantKey: string;
  areaIds: string[];
};

export type LightStateDetail = {
  plantKey: string;
  lightStates: Record<string, boolean>;
};

export function getPlantKey(ala: string, planta: string) {
  return `${ala}:${planta}`;
}
