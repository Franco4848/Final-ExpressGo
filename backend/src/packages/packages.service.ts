import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';

@Injectable()
export class PackagesService {
  constructor(private prisma: PrismaService){}
  
  async create(createPackageDto: CreatePackageDto) {
    const newPackage = await this.prisma.package.create({
      data: createPackageDto
    })
    return newPackage;
  }

  findAll() {
    return this.prisma.package.findMany({
      include: {driver: true},
    });
  }

  findOne(id: string) {
    return this.prisma.package.findUnique({
      where: {id},
      include: {driver: true},
    });
  }

  async update(id: string, updatePackageDto: UpdatePackageDto) {
    const pakageUpdated = await this.prisma.package.update({
      where:{id},
      data: updatePackageDto,
    })
    return 'Pedido actualizado correctamente'+ pakageUpdated
  }

  async remove(id: string) {
    const packageDeleted = await this.prisma.package.delete({
      where: {id},
    })
    return `This action removes a #${id} package`;
  }
}
