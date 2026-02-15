export interface Driver{
    id: string;
    name: string;
    email: string;
    vehicle: "Moto" | "Auto" | "Camioneta";
    phone?: string;
}

export type CreateDriverDto = Omit<Driver, "id">;