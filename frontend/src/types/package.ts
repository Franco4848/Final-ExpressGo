export type PackageSize = "Chico" | "Mediano" | "Grande";
export type PackageStatus = "PENDIENTE" | "EN_CAMINO" | "ENTREGADO";

export interface Package{
    id: string;
    trackingId:string;
    address: string;
    recipientName: string;
    size: PackageSize;
    status?: PackageStatus;
    lat: number;
    lng: number;
    deliveryOrder?: number;
    driverId?: string;
    driver?: {id: string, name: string}
}

export type CreatePackageDto = Omit<Package, "id" | "driver">;