import { IsEmail, IsIn, IsOptional, IsString } from 'class-validator'
export class CreateDriverDto {
    @IsString()
    name: string;

    @IsEmail()
    email: string;

    @IsString()
    @IsIn(['Moto', 'Auto', 'camioneta'])
    vehicle: string;

    @IsString()
    @IsOptional()
    phone?: string;
}
