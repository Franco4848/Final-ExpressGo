import { IsIn, IsInt, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator"

export class CreatePackageDto {
    @IsString()
    @IsNotEmpty()
    trackingId:string;

    @IsString()
    @IsNotEmpty()
    address: string;
    
    @IsString()
    @IsNotEmpty()
    recipientName: string;

    @IsString()
    @IsIn(['Chico', 'Mediano', 'Grande'])
    size: string;
    
    @IsString()
    @IsOptional()
    @IsIn(['PENDIENTE', 'EN_CAMINO', 'ENTREGADO'])
    status?: string;

    @IsNumber()
    lat: number;

    @IsNumber()
    lng: number;

    @IsInt()
    @Min(1)
    @IsOptional()
    deliveryOrder?: number

    @IsMongoId() // Valida que sea un ID de Mongo real
    @IsOptional() // Al crearlo, puede que aún no tenga chofer asignado
    driverId?: string;

}
