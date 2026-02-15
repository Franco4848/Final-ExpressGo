import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';

@Injectable()
export class DriversService {
  constructor(private prisma: PrismaService){}


  async create(createDriverDto: CreateDriverDto) {
    const newDriver = await this.prisma.driver.create({
      data: createDriverDto,
    });
    return newDriver;
  }

  findAll() {
    return this.prisma.driver.findMany({
      include: {packages: true},
    })
  }

  findOne(id: string) {
    return this.prisma.driver.findUnique({
      where: {id},
      include: {packages: true},
    });
  }

  async update(id: string, updateDriverDto: UpdateDriverDto) {
    const driverUpdated = await this.prisma.driver.update({
      where: {id},
      data: updateDriverDto,
    });
    return driverUpdated;
  }

  async remove(id: string) {
    const driverRemoved = await this.prisma.driver.delete({
      where: {id},
    });  
    return `This action removes a #${id} driver`;
  }
  
  async getDriverStopsOrdered(driverId: string) {
    return this.prisma.package.findMany({
      where: { driverId },
      orderBy: [{ deliveryOrder: "asc" }, { createdAt: "asc" }], // fallback
    });
  }

  async reorderRoute(driverId: string, orderedPackageIds: string[]) {
  // validar que esos packages sean del driver
  const existing = await this.prisma.package.findMany({
    where: { id: { in: orderedPackageIds }, driverId },
    select: { id: true },
  });

  if (existing.length !== orderedPackageIds.length) {
    throw new Error("Hay paquetes que no pertenecen a este driver");
  }

  // Actualizar deliveryOrder según el orden recibido
  const ops = orderedPackageIds.map((id, idx) =>
    this.prisma.package.update({
      where: { id },
      data: { deliveryOrder: idx + 1 },
    })
  );

  await this.prisma.$transaction(ops);

  // devolver stops ya ordenados
  return this.getDriverStopsOrdered(driverId);
}


}


