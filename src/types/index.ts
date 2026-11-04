export type RegionId = 'quebrada' | 'puna' | 'valles' | 'yungas';

export interface RegionalData {
  id: RegionId;
  name: string;
  tagline: string;
  altitude: string;
  climate: string;
  colorHex: string;
  accentHex: string;
  departments: string[];
  keyTowns: string[];
  focoMaterial: {
    statNumber: string;
    statLabel: string;
    diagnostic: string;
    propuesta: string;
    ciberbasesActivas: number;
  };
  geologyDescription: string;
  cameraCoords: {
    x: number;
    y: number;
    z: number;
    targetX: number;
    targetY: number;
    targetZ: number;
  };
}

export interface CiberbaseNode {
  id: string;
  name: string;
  region: RegionId;
  municipio: string;
  coordinates3D: [number, number, number];
  membersCount: number;
  coordinador: string;
  focoPrioritario: string;
}

export interface CarnetUser {
  nombre: string;
  municipio: string;
  region: RegionId;
  areaAccion: string;
  ciberbaseId: string;
  fechaAfiliacion: string;
  qrPayload: string;
}
